import { OpaClient } from '../opa-client/opaClient';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { Config } from '@backstage/config';
import { policyEvaluator } from './opaEvaluator';

jest.mock('../opa-client/opaClient');
jest.mock('winston');
jest.mock('@backstage/config');

describe('policyEvaluator', () => {
  let mockOpaClient: OpaClient;
  let mockLogger: LoggerService;
  let mockConfig: Config;

  beforeAll(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as LoggerService;
    mockConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'opaClient.baseUrl') {
          return 'http://localhost:8181';
        }
        if (key === 'opaClient.policies.permissions.entrypoint') {
          return 'some/admin';
        }
        return null;
      }),
    } as unknown as Config;
    mockOpaClient = new OpaClient(mockConfig, mockLogger);
  });

  beforeEach(() => {
    jest.clearAllMocks();
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
    const mockUser: BackstageIdentityResponse = {
      identity: {
        userEntityRef: 'parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
    };
    const mockopaEntryPoint = 'some/package/admin';

    jest.spyOn(mockOpaClient, 'evaluatePolicy').mockResolvedValueOnce({
      result: 'ALLOW',
    });

    const evaluator = policyEvaluator(
      mockOpaClient,
      mockLogger,
      mockopaEntryPoint,
    );
    const result = await evaluator(mockRequest, mockUser);

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
    const mockUser: BackstageIdentityResponse = {
      identity: {
        userEntityRef: 'parsifal-m',
        ownershipEntityRefs: ['user:default/parsifal-m', 'group:default/users'],
        type: 'user',
      },
      token: 'mockToken',
    };
    const mockopaEntryPoint = 'some/package/admin';

    jest.spyOn(mockOpaClient, 'evaluatePolicy').mockResolvedValueOnce({
      result: 'DENY',
    });

    const evaluator = policyEvaluator(
      mockOpaClient,
      mockLogger,
      mockopaEntryPoint,
    );
    const result = await evaluator(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  // TODO: Add more tests
});
