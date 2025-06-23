import { OpaClient } from './opaClient';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PermissionsFrameworkPolicyInput } from '../types';
import { ConfigReader } from '@backstage/config';

const mockConfig = {
  permission: {
    opa: {
      baseUrl: 'http://localhost:8181',
      policy: {
        policyEntryPoint: 'some/admin',
        policyFallbackDecision: 'allow',
      },
    },
  },
};

const config = new ConfigReader(mockConfig);

const createMockConfig = (fallbackPolicy: string) =>
  new ConfigReader({
    permission: {
      opa: {
        baseUrl: 'http://localhost:8181',
        policy: {
          policyEntryPoint: 'some/admin',
          policyFallbackDecision: fallbackPolicy,
        },
      },
    },
  });

let mockLogger: LoggerService;
let opaClient: OpaClient;

describe('OpaClient Permissions Framework', () => {
  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
    opaClient = new OpaClient(config, mockLogger);
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
      mockOpaEntrypoint,
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
      mockOpaEntrypoint,
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
      const clientWithFallback = new OpaClient(configWithFallback, mockLogger);

      const mockError = new Error('FetchError');
      mockError.name = 'FetchError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);

      const mockOpaEntrypoint = 'some/admin';
      const mockInput: PermissionsFrameworkPolicyInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };

      const output =
        await clientWithFallback.evaluatePermissionsFrameworkPolicy(
          mockInput,
          mockOpaEntrypoint,
        );
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
      const clientWithFallback = new OpaClient(configWithFallback, mockLogger);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
        statusText: 'Bad Request',
        status: 400,
      } as any);

      const mockOpaEntrypoint = 'some/admin';
      const mockInput: PermissionsFrameworkPolicyInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };

      const output =
        await clientWithFallback.evaluatePermissionsFrameworkPolicy(
          mockInput,
          mockOpaEntrypoint,
        );
      expect(output.result).toEqual(expected);
    },
  );

  it('should throw an error if policyFallback is an unknown value and OPA response is not OK', async () => {
    // Create a config without a fallback policy
    const configWithoutFallback = new ConfigReader({
      permission: {
        opa: {
          baseUrl: 'http://localhost:8181',
          policy: {
            policyEntryPoint: 'some/admin',
            // No policyFallbackDecision set
          },
        },
      },
    });
    const clientWithoutFallback = new OpaClient(
      configWithoutFallback,
      mockLogger,
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
      statusText: 'Bad Request',
      status: 400,
    } as any);

    const mockOpaEntrypoint = 'some/admin';
    const mockInput: PermissionsFrameworkPolicyInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(
      clientWithoutFallback.evaluatePermissionsFrameworkPolicy(
        mockInput,
        mockOpaEntrypoint,
      ),
    ).rejects.toThrow();
  });

  it('should throw error when response is not ok', async () => {
    // Create a config without a fallback policy
    const configWithoutFallback = new ConfigReader({
      permission: {
        opa: {
          baseUrl: 'http://localhost:8181',
          policy: {
            policyEntryPoint: 'some/admin',
            // No policyFallbackDecision set
          },
        },
      },
    });
    const clientWithoutFallback = new OpaClient(
      configWithoutFallback,
      mockLogger,
    );

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
    const mockOpaEntrypoint = 'some/admin';
    await expect(
      clientWithoutFallback.evaluatePermissionsFrameworkPolicy(
        mockInput,
        mockOpaEntrypoint,
      ),
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

describe('OpaClient OG OPA', () => {
  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;
    opaClient = new OpaClient(config, mockLogger);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should evaluate policy correctly', async () => {
    const mockInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };

    const mockOpaEntrypoint = 'some/admin';
    const mockResponse = { result: { allow: true } };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await opaClient.evaluatePolicy(mockInput, mockOpaEntrypoint);

    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:8181/v1/data/${mockOpaEntrypoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: mockInput }),
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if the request to the OPA server fails', async () => {
    const mockInput = {
      permission: { name: 'read' },
      identity: { user: 'anders', claims: ['claim1', 'claim2'] },
    };

    const mockOpaEntrypoint = 'some/admin';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server Error' }),
    });

    await expect(
      opaClient.evaluatePolicy(mockInput, mockOpaEntrypoint),
    ).rejects.toThrow(
      'An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error',
    );
  });
});
