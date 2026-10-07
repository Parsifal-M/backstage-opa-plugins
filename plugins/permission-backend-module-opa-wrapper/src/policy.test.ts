import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import {
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { OpaPermissionPolicy } from './policy';
import {
  PermissionsFrameworkPolicyEvaluationResult,
  PermissionsFrameworkPolicyInput,
} from './types';

const catalogEntityRead: PolicyQuery = {
  permission: createPermission({
    name: 'catalog.entity.read',
    attributes: { action: 'read' },
    resourceType: 'catalog-entity',
  }),
};

const scaffolderTaskCreate: PolicyQuery = {
  permission: createPermission({
    name: 'scaffolder.task.create',
    attributes: { action: 'create' },
  }),
};

const userInfoResult = {
  userEntityRef: 'user:default/parsifal-m',
  ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
};

const user: PolicyQueryUser = {
  credentials: mockCredentials.user('user:default/parsifal-m'),
  // Deliberately different from what the UserInfo service returns, to prove
  // the deprecated `info` field is not used.
  info: {
    userEntityRef: 'user:default/stale',
    ownershipEntityRefs: ['group:default/stale'],
  },
};

describe('OpaPermissionPolicy', () => {
  const evaluate = jest.fn<
    Promise<PermissionsFrameworkPolicyEvaluationResult>,
    [PermissionsFrameworkPolicyInput]
  >();
  const logger = mockServices.logger.mock();
  const userInfo = mockServices.userInfo.mock();
  const policy = new OpaPermissionPolicy({
    opaClient: { evaluatePermissionsFrameworkPolicy: evaluate },
    auth: mockServices.auth(),
    userInfo,
    logger,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    userInfo.getUserInfo.mockResolvedValue(userInfoResult);
  });

  describe('policy input', () => {
    it('sends the permission name and the identity resolved from the user credentials', async () => {
      evaluate.mockResolvedValueOnce({ result: 'ALLOW' });

      await policy.handle(catalogEntityRead, user);

      expect(userInfo.getUserInfo).toHaveBeenCalledWith(user.credentials);
      expect(evaluate).toHaveBeenCalledTimes(1);
      expect(evaluate).toHaveBeenCalledWith({
        permission: { name: 'catalog.entity.read' },
        identity: {
          user: 'user:default/parsifal-m',
          claims: ['user:default/parsifal-m', 'group:default/users'],
        },
      });
    });

    it('omits identity when the policy is called without a user', async () => {
      evaluate.mockResolvedValueOnce({ result: 'DENY' });

      await expect(policy.handle(scaffolderTaskCreate)).resolves.toEqual({
        result: AuthorizeResult.DENY,
      });

      expect(evaluate).toHaveBeenCalledWith({
        permission: { name: 'scaffolder.task.create' },
      });
      expect(userInfo.getUserInfo).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        'Evaluating permission "scaffolder.task.create" for user "<none>"',
      );
    });

    it.each([
      ['service', mockCredentials.service('plugin:catalog')],
      ['unauthenticated', mockCredentials.none()],
    ])(
      'omits identity when the credentials belong to a %s principal',
      async (_, credentials) => {
        evaluate.mockResolvedValueOnce({ result: 'DENY' });

        await policy.handle(scaffolderTaskCreate, {
          credentials,
          info: user.info,
        });

        expect(evaluate).toHaveBeenCalledWith({
          permission: { name: 'scaffolder.task.create' },
        });
        // UserInfoService throws for non-user principals, so it must not be called.
        expect(userInfo.getUserInfo).not.toHaveBeenCalled();
      },
    );

    it('does not evaluate the policy when the user info cannot be resolved', async () => {
      userInfo.getUserInfo.mockRejectedValueOnce(
        new Error('Ownership entity refs can not be determined'),
      );

      await expect(policy.handle(catalogEntityRead, user)).rejects.toThrow(
        'Ownership entity refs can not be determined',
      );
      expect(evaluate).not.toHaveBeenCalled();
    });

    it('logs the permission and user being evaluated', async () => {
      evaluate.mockResolvedValueOnce({ result: 'ALLOW' });

      await policy.handle(catalogEntityRead, user);

      expect(logger.debug).toHaveBeenCalledWith(
        'Evaluating permission "catalog.entity.read" for user "user:default/parsifal-m"',
      );
    });
  });

  describe('definitive decisions', () => {
    it('returns ALLOW when OPA allows', async () => {
      evaluate.mockResolvedValueOnce({ result: 'ALLOW' });

      await expect(policy.handle(scaffolderTaskCreate, user)).resolves.toEqual({
        result: AuthorizeResult.ALLOW,
      });
    });

    it('returns DENY when OPA denies', async () => {
      evaluate.mockResolvedValueOnce({ result: 'DENY' });

      await expect(policy.handle(scaffolderTaskCreate, user)).resolves.toEqual({
        result: AuthorizeResult.DENY,
      });
    });

    // Fail closed: only an exact "ALLOW" grants access.
    it.each(['allow', 'Allow', 'ALLOWED', 'MAYBE', ''])(
      'returns DENY for the unrecognised result %p',
      async result => {
        evaluate.mockResolvedValueOnce({ result });

        await expect(
          policy.handle(scaffolderTaskCreate, user),
        ).resolves.toEqual({ result: AuthorizeResult.DENY });
      },
    );
  });

  describe('conditional decisions', () => {
    it('returns the conditions, pluginId and resourceType from OPA', async () => {
      const conditions = {
        anyOf: [
          {
            resourceType: 'catalog-entity',
            rule: 'IS_ENTITY_OWNER',
            params: { claims: ['group:default/users'] },
          },
          {
            resourceType: 'catalog-entity',
            rule: 'IS_ENTITY_KIND',
            params: { kinds: ['API'] },
          },
        ],
      };
      evaluate.mockResolvedValueOnce({
        result: 'CONDITIONAL',
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        conditions,
      });

      await expect(policy.handle(catalogEntityRead, user)).resolves.toEqual({
        result: AuthorizeResult.CONDITIONAL,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        conditions,
      });
    });

    it.each<[string, Partial<PermissionsFrameworkPolicyEvaluationResult>]>([
      [
        'Conditions are missing',
        { pluginId: 'catalog', resourceType: 'catalog-entity' },
      ],
      [
        'pluginId is missing',
        { resourceType: 'catalog-entity', conditions: { anyOf: [] } },
      ],
      [
        'resourceType is missing',
        { pluginId: 'catalog', conditions: { anyOf: [] } },
      ],
    ])('throws and logs when %s', async (problem, partial) => {
      evaluate.mockResolvedValueOnce({ result: 'CONDITIONAL', ...partial });

      await expect(policy.handle(catalogEntityRead, user)).rejects.toThrow(
        `${problem} for CONDITIONAL decision on permission "catalog.entity.read"`,
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(problem),
      );
    });
  });

  describe('errors', () => {
    it('throws when OPA returns no result', async () => {
      evaluate.mockResolvedValueOnce(
        undefined as unknown as PermissionsFrameworkPolicyEvaluationResult,
      );

      await expect(policy.handle(catalogEntityRead, user)).rejects.toThrow(
        'The result is missing in the response from OPA, are you sure the policy is loaded?',
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it('propagates errors from the OPA client', async () => {
      evaluate.mockRejectedValueOnce(new Error('OPA is down'));

      await expect(policy.handle(catalogEntityRead, user)).rejects.toThrow(
        'OPA is down',
      );
    });
  });
});
