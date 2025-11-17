import { OpaClient } from './opaClient';
import { mockServices } from '@backstage/backend-test-utils';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockLogger = mockServices.logger.mock();
const mockConfig = mockServices.rootConfig({
  data: {
    openPolicyAgent: {
      baseUrl: 'http://localhost:8181',
    },
  },
});

describe('OpaClient', () => {
  let client: OpaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new OpaClient(mockConfig, mockLogger);
  });

  describe('constructor', () => {
    it('should construct the client with baseUrl and entryPoint', () => {
      expect(client).toBeInstanceOf(OpaClient);
    });
    it('should throw error if baseUrl is missing', () => {
      const mockConfigWithoutBaseUrl = mockServices.rootConfig({
        data: {},
      });
      expect(
        () => new OpaClient(mockConfigWithoutBaseUrl, mockLogger),
      ).toThrow();
    });
  });

  describe('evaluatePolicy', () => {
    it('should evaluate policy successfully', async () => {
      const mockResponse = {
        result: { allow: true },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const input = { user: 'test', action: 'read' };
      const result = await client.evaluatePolicy(input, 'test/policy');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/test/policy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        },
      );
      expect(result).toEqual(mockResponse);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Received data from OPA'),
      );
    });

    it('should throw error if entryPoint is empty', async () => {
      const input = { user: 'test' };
      await expect(client.evaluatePolicy(input, '')).rejects.toThrow(
        'You have not defined a policy entrypoint! Please provide one.',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'You have not defined a policy entrypoint! Please provide one.',
      );
    });

    it('should throw error if input is null', async () => {
      await expect(
        client.evaluatePolicy(null as any, 'test/policy'),
      ).rejects.toThrow('The policy input is missing!');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'The policy input is missing!',
      );
    });

    it('should throw error if input is undefined', async () => {
      await expect(
        client.evaluatePolicy(undefined as any, 'test/policy'),
      ).rejects.toThrow('The policy input is missing!');
    });

    it('should throw error if OPA returns non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const input = { user: 'test' };
      await expect(client.evaluatePolicy(input, 'test/policy')).rejects.toThrow(
        'An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('500 - Internal Server Error'),
      );
    });

    it('should throw error if fetch fails', async () => {
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(fetchError);

      const input = { user: 'test' };
      await expect(client.evaluatePolicy(input, 'test/policy')).rejects.toThrow(
        'An error occurred while sending the policy input to the OPA server: Error: Network error',
      );
    });

    it('should work with different entryPoints', async () => {
      const mockResponse = { result: { allow: false } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const input = { user: 'admin', action: 'delete' };
      const result = await client.evaluatePolicy(input, 'admin/policy');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/admin/policy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
