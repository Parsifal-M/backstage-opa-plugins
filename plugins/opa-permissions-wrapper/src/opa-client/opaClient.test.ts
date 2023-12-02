import { OpaClient } from './opaClient';
import fetch from 'node-fetch';
import { ConfigReader } from '@backstage/config';
import { Logger } from 'winston';
import { PolicyEvaluationInput } from '../types';

jest.mock('node-fetch', () => jest.fn());
jest.mock('@backstage/config', () => {
  return {
    ConfigReader: jest.fn().mockImplementation(() => {
      return {
        getString: jest.fn().mockReturnValue('http://localhost:7007'),
      };
    }),
  };
});
jest.mock('winston');

describe('OpaClient', () => {
  let mockLogger: Logger;
  let mockConfig: ConfigReader;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as Logger;
    mockConfig = new ConfigReader({
      backend: {
        baseUrl: 'http://localhost:7007',
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
    const mockResponse = { result: 'DENY' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const result = await client.evaluatePolicy(mockInput);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/opa/opa-permissions',
      expect.anything(),
    );
    expect(mockFetch.mock.calls[0][1]?.body).toContain(
      JSON.stringify({ policyInput: mockInput }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle ALLOW result', async () => {
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'write' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    const mockResponse = { result: 'ALLOW' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    const client = new OpaClient(mockConfig, mockLogger);
    const result = await client.evaluatePolicy(mockInput);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7007/api/opa/opa-permissions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyInput: mockInput }),
      },
    );
    expect(result).toEqual(mockResponse);
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

  it('should throw error when response is not okk', async () => {
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
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const client = new OpaClient(mockConfig, mockLogger);
    const mockInput: PolicyEvaluationInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };
    await expect(client.evaluatePolicy(mockInput)).rejects.toThrow(
      'Network error',
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error during OPA policy evaluation:',
      expect.objectContaining({ message: 'Network error' }),
    );
  });
});
