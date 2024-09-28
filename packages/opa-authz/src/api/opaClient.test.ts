import { OpaClient } from './opaClient';
import fetch from 'node-fetch';
import { ConfigReader } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyEvaluationInput } from '../types';

jest.mock('node-fetch', () => jest.fn());
jest.mock('winston');

describe('OpaClient', () => {
  let mockLogger: LoggerService;
  let mockConfig: ConfigReader;
  let mockConfigObject: object;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;
    mockConfigObject = {
      backend: {
        backendBaseUrl: 'http://localhost:7007',
      },
      opaClient: {
        baseUrl: 'http://localhost:8181',
        policies: {
          permissions: {
            entrypoint: 'rbac_policy/decision',
          },
        },
      },
    };
    mockConfig = new ConfigReader(mockConfigObject);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should evaluate policy correctly', async () => {
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };

    const mockOpaEntrypoint = 'some/admin';
    const url = `http://localhost:8181/v1/data/${mockOpaEntrypoint}`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ result: 'ALLOW' }),
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const result = await client.evaluatePolicy(mockInput, mockOpaEntrypoint);

    expect(mockFetch).toHaveBeenCalledWith(
      url, // Use the correct URL here
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: mockInput,
        }),
      },
    );
    expect(result).toEqual('ALLOW');
  });

  it('should handle DENY result', async () => {
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'write' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    const mockOpaEntrypoint = 'some/admin';
    const url = `http://localhost:8181/v1/data/${mockOpaEntrypoint}`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ result: 'DENY' }),
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const result = await client.evaluatePolicy(mockInput, mockOpaEntrypoint);

    expect(mockFetch).toHaveBeenCalledWith(
      url, // Use the correct URL here
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: mockInput,
        }),
      },
    );
    expect(result).toEqual('DENY');
  });

  it.each(['ALLOW', 'DENY'])(
    'should return %s if policyFallback is set to that value and fetch fails',
    async policy => {
      const mockError = new Error('FetchError');
      mockError.name = 'FetchError';
      mockFetch.mockRejectedValueOnce(mockError);

      const mockConfigWithPolicyObject: any = structuredClone(mockConfigObject);
      mockConfigWithPolicyObject.opaClient.policies.permissions.policyFallback =
        policy;
      const mockConfigWithPolicy = new ConfigReader(mockConfigWithPolicyObject);

      const client = new OpaClient(mockConfigWithPolicy, mockLogger);
      const mockOpaEntrypoint = 'some/admin';
      const mockInput: PolicyEvaluationInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };
      const output = await client.evaluatePolicy(mockInput, mockOpaEntrypoint);
      expect(output.result).toEqual(policy);
    },
  );

  it.each(['ALLOW', 'DENY'])(
    'should return %s if policyFallback is set to that value and OPA response is not OK',
    async policy => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
        statusText: 'Bad Request',
        status: 400,
      } as any);

      const mockConfigWithPolicyObject: any = structuredClone(mockConfigObject);
      mockConfigWithPolicyObject.opaClient.policies.permissions.policyFallback =
        policy;
      const mockConfigWithPolicy = new ConfigReader(mockConfigWithPolicyObject);

      const client = new OpaClient(mockConfigWithPolicy, mockLogger);
      const mockOpaEntrypoint = 'some/admin';
      const mockInput: PolicyEvaluationInput = {
        permission: { name: 'read' },
        identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
      };
      const output = await client.evaluatePolicy(mockInput, mockOpaEntrypoint);
      expect(output.result).toEqual(policy);
    },
  );

  it('should throw an error if policyFallback is an unknown value and OPA response is not OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
      statusText: 'Bad Request',
      status: 400,
    } as any);

    const mockConfigWithPolicyObject: any = structuredClone(mockConfigObject);
    mockConfigWithPolicyObject.opaClient.policies.permissions.policyFallback =
      'TEST_VALUE';
    const mockConfigWithPolicy = new ConfigReader(mockConfigWithPolicyObject);

    const client = new OpaClient(mockConfigWithPolicy, mockLogger);
    const mockOpaEntrypoint = 'some/admin';
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(
      client.evaluatePolicy(mockInput, mockOpaEntrypoint),
    ).rejects.toThrow();
  });

  it('should throw error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
      status: 400,
      statusText: 'Bad Request',
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    const mockOpaEntrypoint = 'some/admin';
    await expect(
      client.evaluatePolicy(mockInput, mockOpaEntrypoint),
    ).rejects.toThrow(
      'An error response was returned after sending the policy input to the OPA server:',
    );
  });

  it('should throw error when fetch throws an error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Fetch error'));

    const client = new OpaClient(mockConfig, mockLogger);
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(client.evaluatePolicy(mockInput)).rejects.toThrow();
  });
});
