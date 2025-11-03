import { OpaClient } from './opaClient';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OpaClient', () => {
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should construct with baseUrl', () => {
      const client = new OpaClient({ baseUrl: 'http://localhost:8181' });
      expect(client).toBeInstanceOf(OpaClient);
    });

    it('should construct with baseUrl and logger', () => {
      const client = new OpaClient({
        baseUrl: 'http://localhost:8181',
        logger: mockLogger,
      });
      expect(client).toBeInstanceOf(OpaClient);
    });

    it('should throw error if baseUrl is missing', () => {
      expect(() => new OpaClient({} as any)).toThrow(
        'The OPA baseUrl is required to construct OpaClient',
      );
    });

    it('should strip trailing slash from baseUrl', () => {
      const client = new OpaClient({ baseUrl: 'http://localhost:8181/' });
      expect(client).toBeInstanceOf(OpaClient);
    });
  });

  describe('evaluatePolicy', () => {
    let client: OpaClient;

    beforeEach(() => {
      client = new OpaClient({
        baseUrl: 'http://localhost:8181',
        logger: mockLogger,
      });
    });

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
        expect.stringContaining('Sending data to OPA'),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Received data from OPA'),
      );
    });

    it('should throw error if entryPoint is missing', async () => {
      const input = { user: 'test' };
      await expect(client.evaluatePolicy(input, '')).rejects.toThrow(
        'The OPA entrypoint is required',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'The OPA entrypoint is required',
      );
    });

    it('should throw error if input is null', async () => {
      await expect(client.evaluatePolicy(null, 'test/policy')).rejects.toThrow(
        'The policy input is missing',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'The policy input is missing',
      );
    });

    it('should throw error if input is undefined', async () => {
      await expect(
        client.evaluatePolicy(undefined, 'test/policy'),
      ).rejects.toThrow('The policy input is missing');
    });

    it('should throw error if OPA returns non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const input = { user: 'test' };
      await expect(
        client.evaluatePolicy(input, 'test/policy'),
      ).rejects.toThrow(
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
      await expect(
        client.evaluatePolicy(input, 'test/policy'),
      ).rejects.toThrow('Network error');
    });

    it('should work without logger', async () => {
      const clientWithoutLogger = new OpaClient({
        baseUrl: 'http://localhost:8181',
      });

      const mockResponse = { result: { allow: true } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const input = { user: 'test' };
      const result = await clientWithoutLogger.evaluatePolicy(
        input,
        'test/policy',
      );

      expect(result).toEqual(mockResponse);
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });
  });
});