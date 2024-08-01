import { OpaClient } from './opaClient';
import fetch from 'node-fetch';
import { ConfigReader } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PolicyEvaluationInput } from '../types';

jest.mock('node-fetch', () => jest.fn());
jest.mock('@backstage/config', () => {
  return {
    ConfigReader: jest.fn().mockImplementation(() => {
      return {
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'opaClient.baseUrl') {
            return 'http://localhost:8181';
          }
          if (key === 'opaClient.policies.permission.entrypoint') {
            return 'rbac_policy/decision';
          }
          return null;
        }),
      };
    }),
  };
});
jest.mock('winston');

describe('OpaClient', () => {
  let mockLogger: LoggerService;
  let mockConfig: ConfigReader;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;
    mockConfig = new ConfigReader({
      backend: {
        backendBaseUrl: 'http://localhost:7007',
      },
    });
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

  it('should throw error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({}),
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(client.evaluatePolicy(mockInput)).rejects.toThrow();
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
