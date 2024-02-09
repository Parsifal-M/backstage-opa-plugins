import { OpaClient } from '../opa-client/opaClient';
import { Logger } from 'winston';
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
  let mockLogger: Logger;
  let mockConfig: Config;

  beforeAll(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as Logger;
    mockConfig = {
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'opaClient.baseUrl') {
          return 'http://localhost:8181';
        }
        if (key === 'opaClient.policies.permissions.package') {
          return 'some.package.admin';
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
    const mockOpaPackage = 'some.package.admin';

    jest.spyOn(mockOpaClient, 'evaluatePolicy').mockResolvedValueOnce({
      decision: { result: 'ALLOW' },
    });

    const evaluator = policyEvaluator(
      mockOpaClient,
      mockLogger,
      mockOpaPackage,
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
    const mockOpaPackage = 'some.package.admin';

    jest.spyOn(mockOpaClient, 'evaluatePolicy').mockResolvedValueOnce({
      decision: { result: 'DENY' },
    });

    const evaluator = policyEvaluator(
      mockOpaClient,
      mockLogger,
      mockOpaPackage,
    );
    const result = await evaluator(mockRequest, mockUser);

    expect(result).toEqual({ result: AuthorizeResult.DENY });
  });

  // TODO: Add more tests
});
