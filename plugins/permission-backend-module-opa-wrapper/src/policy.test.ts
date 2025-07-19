import { mockServices } from '@backstage/backend-test-utils';
import { OpaClient } from './opa-client/opaClient';
import {
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { OpaPermissionPolicy } from './policy';

jest.mock('./opa-client/opaClient');

describe('OpaPermissionPolicy', () => {
  let mockOpaClient: OpaClient;
  let policy: OpaPermissionPolicy;

  beforeAll(() => {
    const mockConfig = mockServices.rootConfig({
      data: {
        permission: {
          opa: {
            baseUrl: 'http://localhost:8181',
            policy: {
              policyEntryPoint: 'some/admin',
            },
          },
        },
      },
    });
    const mockLogger = mockServices.logger.mock();
    mockOpaClient = new OpaClient(mockConfig, mockLogger);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    policy = new OpaPermissionPolicy(
      mockOpaClient,
      mockServices.logger.mock(),
      'some/package/admin',
    );
  });

  it('should return ALLOW decision', async () => {
    const mockRequest: PolicyQuery = {
      permission: {
        name: 'catalog.entity.read',
        attributes: {},
        type: 'resource',
        resourceType: 'someResourceType',
      },
    };
    const mockUser: PolicyQueryUser = {
      identity: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: 'user:default/parsifal-m',
      },
      info: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
      },
    };

    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'ALLOW',
      });

    const result = await policy.handle(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('should return DENY decision', async () => {
    const mockRequest: PolicyQuery = {
      permission: {
        name: 'catalog.entity.read',
        attributes: {},
        type: 'resource',
        resourceType: 'someResourceType',
      },
    };
    const mockUser: PolicyQueryUser = {
      identity: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: 'user:default/parsifal-m',
      },
      info: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
      },
    };

    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'DENY',
      });

    const result = await policy.handle(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  it('should return CONDITIONAL decision with proper conditions', async () => {
    const mockRequest: PolicyQuery = {
      permission: {
        name: 'catalog.entity.read',
        attributes: {},
        type: 'resource',
        resourceType: 'someResourceType',
      },
    };
    const mockUser: PolicyQueryUser = {
      identity: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: 'user:default/parsifal-m',
      },
      info: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
      },
    };

    const mockConditions = {
      anyOf: [
        {
          params: { owner: 'user:default/parsifal-m' },
          resourceType: 'catalog-entity',
          rule: 'IS_ENTITY_OWNER',
        },
      ],
    };

    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'CONDITIONAL',
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        conditions: mockConditions,
      });

    const result = await policy.handle(mockRequest, mockUser);

    expect(result).toEqual({
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: mockConditions,
    });
  });

  it('should throw error when response is missing', async () => {
    const mockRequest: PolicyQuery = {
      permission: {
        name: 'catalog.entity.read',
        attributes: {},
        type: 'resource',
        resourceType: 'someResourceType',
      },
    };
    const mockUser: PolicyQueryUser = {
      identity: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: 'user:default/parsifal-m',
      },
      info: {
        userEntityRef: 'user:default/parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
      },
    };

    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce(null as any);

    await expect(policy.handle(mockRequest, mockUser)).rejects.toThrow(
      'The result is missing in the response from OPA, are you sure the policy is loaded?',
    );
  });
});
