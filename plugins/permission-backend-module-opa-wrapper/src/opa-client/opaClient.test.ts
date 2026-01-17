import { mockServices } from '@backstage/backend-test-utils';
import { OpaClient } from './opaClient';
import { PermissionsFrameworkPolicyInput } from '../types';

const createMockConfig = (fallbackPolicy?: string) =>
  mockServices.rootConfig({
    data: {
      permission: {
        opa: {
          baseUrl: 'http://localhost:8181',
          policy: {
            policyEntryPoint: 'some/admin',
            ...(fallbackPolicy && { policyFallbackDecision: fallbackPolicy }),
          },
        },
      },
    },
  });

let opaClient: OpaClient;

describe('OpaClient Permissions Framework', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
    const config = createMockConfig('allow');
    const logger = mockServices.logger.mock();
    opaClient = new OpaClient(config, logger);
  });

  it('should evaluate policy correctly', async () => {
    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };

    const mockOpaEntrypoint = 'some/admin';
    const url = `http://localhost:8181/v1/data/${mockOpaEntrypoint}`;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ result: 'ALLOW' }),
    } as any);

    const result = await opaClient.evaluatePermissionsFrameworkPolicy(
      mockInput,
    );

    expect(global.fetch as jest.Mock).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: mockInput,
      }),
    });
    expect(result).toEqual('ALLOW');
  });

  it('should handle DENY result', async () => {
    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'write' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    const mockOpaEntrypoint = 'some/admin';
    const url = `http://localhost:8181/v1/data/${mockOpaEntrypoint}`;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ result: 'DENY' }),
    } as any);

    const result = await opaClient.evaluatePermissionsFrameworkPolicy(
      mockInput,
    );

    expect(global.fetch as jest.Mock).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: mockInput,
      }),
    });
    expect(result).toEqual('DENY');
  });

  it.each([
    ['allow', 'ALLOW'],
    ['deny', 'DENY'],
  ])(
    'should return %s if policyFallback is set to that value and fetch fails',
    async (fallback, expected) => {
      // Create a new config with the fallback policy
      const configWithFallback = createMockConfig(fallback);
      const logger = mockServices.logger.mock();
      const clientWithFallback = new OpaClient(configWithFallback, logger);

      const mockError = new Error('FetchError');
      mockError.name = 'FetchError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      const mockInput: PermissionsFrameworkPolicyInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };

      const output =
        await clientWithFallback.evaluatePermissionsFrameworkPolicy(mockInput);
      expect(output.result).toEqual(expected);
    },
  );

  it.each([
    ['allow', 'ALLOW'],
    ['deny', 'DENY'],
  ])(
    'should return %s if policyFallback is set to that value and OPA response is not OK',
    async (fallback, expected) => {
      // Create a new config with the fallback policy
      const configWithFallback = createMockConfig(fallback);
      const logger = mockServices.logger.mock();
      const clientWithFallback = new OpaClient(configWithFallback, logger);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
        statusText: 'Bad Request',
        status: 400,
      } as any);

      const mockInput: PermissionsFrameworkPolicyInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };

      const output =
        await clientWithFallback.evaluatePermissionsFrameworkPolicy(mockInput);
      expect(output.result).toEqual(expected);
    },
  );

  it('should throw an error if policyFallback is an unknown value and OPA response is not OK', async () => {
    // Create a config without a fallback policy
    const configWithoutFallback = createMockConfig(); // No fallback policy
    const logger = mockServices.logger.mock();
    const clientWithoutFallback = new OpaClient(configWithoutFallback, logger);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
      statusText: 'Bad Request',
      status: 400,
    } as any);

    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(
      clientWithoutFallback.evaluatePermissionsFrameworkPolicy(mockInput),
    ).rejects.toThrow();
  });

  it('should throw error when response is not ok', async () => {
    // Create a config without a fallback policy
    const configWithoutFallback = createMockConfig(); // No fallback policy
    const logger = mockServices.logger.mock();
    const clientWithoutFallback = new OpaClient(configWithoutFallback, logger);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
      status: 400,
      statusText: 'Bad Request',
    } as any);

    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };

    await expect(
      clientWithoutFallback.evaluatePermissionsFrameworkPolicy(mockInput),
    ).rejects.toThrow(
      'An error response was returned after sending the policy input to the OPA server:',
    );
  });

  it('should throw error when fetch throws an error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(
      opaClient.evaluatePermissionsFrameworkPolicy(mockInput),
    ).rejects.toThrow();
  });
});
