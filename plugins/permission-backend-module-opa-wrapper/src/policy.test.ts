import { mockServices } from '@backstage/backend-test-utils';
import { OpaClient } from './opa-client/opaClient';
import {
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { OpaPermissionPolicy } from './policy';

jest.mock('./opa-client/opaClient');

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
    policy = new OpaPermissionPolicy(mockOpaClient, mockServices.logger.mock());
  });

  it('should return ALLOW decision', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({ result: 'ALLOW' });

    const result = await policy.handle(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.ALLOW });
  });

  it('should return DENY decision', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({ result: 'DENY' });

    const result = await policy.handle(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  it('should return CONDITIONAL decision with proper conditions', async () => {
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

  it('should throw when conditions are missing for a CONDITIONAL decision', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'CONDITIONAL',
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
      });

    await expect(policy.handle(mockRequest, mockUser)).rejects.toThrow(
      `Conditions are missing for CONDITIONAL decision on permission "${mockRequest.permission.name}". Check your OPA policy returns conditions.`,
    );
  });

  it('should throw when pluginId is missing for a CONDITIONAL decision', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'CONDITIONAL',
        resourceType: 'catalog-entity',
        conditions: { anyOf: [] },
      });

    await expect(policy.handle(mockRequest, mockUser)).rejects.toThrow(
      `pluginId is missing for CONDITIONAL decision on permission "${mockRequest.permission.name}". Check your OPA policy returns pluginId.`,
    );
  });

  it('should throw when resourceType is missing for a CONDITIONAL decision', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce({
        result: 'CONDITIONAL',
        pluginId: 'catalog',
        conditions: { anyOf: [] },
      });

    await expect(policy.handle(mockRequest, mockUser)).rejects.toThrow(
      `resourceType is missing for CONDITIONAL decision on permission "${mockRequest.permission.name}". Check your OPA policy returns resourceType.`,
    );
  });

  it('should throw error when response is missing', async () => {
    jest
      .spyOn(mockOpaClient, 'evaluatePermissionsFrameworkPolicy')
      .mockResolvedValueOnce(null as any);

    await expect(policy.handle(mockRequest, mockUser)).rejects.toThrow(
      'The result is missing in the response from OPA, are you sure the policy is loaded?',
    );
  });
});
