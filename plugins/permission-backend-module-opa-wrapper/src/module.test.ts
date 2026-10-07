import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { PermissionPolicy } from '@backstage/plugin-permission-node';
import {
  PolicyExtensionPoint,
  policyExtensionPoint,
} from '@backstage/plugin-permission-node/alpha';
import { permissionModuleOpaWrapper } from './module';
import defaultExport from './index';
import { OpaPermissionPolicy } from './policy';

const opaConfig = {
  permission: {
    opa: {
      baseUrl: 'http://opa.example.com:8181',
      policy: { policyEntryPoint: 'rbac_policy/decision' },
    },
  },
};

describe('permissionModuleOpaWrapper', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('is the default export of the package', () => {
    expect(defaultExport).toBe(permissionModuleOpaWrapper);
  });

  it('registers an OPA-backed policy wired to config and the UserInfo service', async () => {
    const setPolicy = jest.fn<void, [PermissionPolicy]>();
    const extensionPoint: PolicyExtensionPoint = { setPolicy };

    await startTestBackend({
      extensionPoints: [[policyExtensionPoint, extensionPoint]],
      features: [
        permissionModuleOpaWrapper,
        mockServices.rootConfig.factory({ data: opaConfig }),
      ],
    });

    expect(setPolicy).toHaveBeenCalledTimes(1);
    const [policy] = setPolicy.mock.calls[0];
    expect(policy).toBeInstanceOf(OpaPermissionPolicy);

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ result: { result: 'ALLOW' } }), {
        status: 200,
      }),
    );

    const decision = await policy.handle(
      {
        permission: {
          type: 'basic',
          name: 'scaffolder.task.create',
          attributes: {},
        },
      },
      {
        credentials: mockCredentials.user('user:default/parsifal-m'),
        info: {
          userEntityRef: 'user:default/stale',
          ownershipEntityRefs: [],
        },
      },
    );

    expect(decision).toEqual({ result: AuthorizeResult.ALLOW });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      'http://opa.example.com:8181/v1/data/rbac_policy/decision',
    );
    // The identity comes from the injected UserInfo service (the default mock
    // returns the user's own ref as its only ownership ref), not from `info`.
    expect(JSON.parse(String(init?.body))).toEqual({
      input: {
        permission: { name: 'scaffolder.task.create' },
        identity: {
          user: 'user:default/parsifal-m',
          claims: ['user:default/parsifal-m'],
        },
      },
    });
  });

  it('fails backend startup when the OPA config is missing', async () => {
    await expect(
      startTestBackend({
        extensionPoints: [[policyExtensionPoint, { setPolicy: jest.fn() }]],
        features: [
          permissionModuleOpaWrapper,
          mockServices.rootConfig.factory({ data: {} }),
        ],
      }),
    ).rejects.toThrow("Missing required config value at 'permission.opa");
  });
});
