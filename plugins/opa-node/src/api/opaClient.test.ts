import { mockServices } from '@backstage/backend-test-utils';
import {
  DefaultOpaClient,
  OpaClient,
} from '@parsifal-m/backstage-plugin-opa-node';

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

describe('DefaultOpaClient', () => {
  let client: OpaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new DefaultOpaClient(mockConfig, mockLogger);
  });

  it('should throw if baseUrl is missing from config', () => {
    expect(
      () =>
        new DefaultOpaClient(mockServices.rootConfig({ data: {} }), mockLogger),
    ).toThrow();
  });

  describe('evaluatePolicy', () => {
    it('should call OPA and return result', async () => {
      const mockResponse = { result: { allow: true } };
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
    });

    it('should throw if entryPoint is empty', async () => {
      await expect(client.evaluatePolicy({ user: 'test' }, '')).rejects.toThrow(
        'You have not defined a policy entrypoint! Please provide one.',
      );
    });

    it.each([null, undefined])(
      'should throw if input is %s',
      async badInput => {
        await expect(
          client.evaluatePolicy(badInput as any, 'test/policy'),
        ).rejects.toThrow('The policy input is missing!');
      },
    );

    it('should throw if OPA returns non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        client.evaluatePolicy({ user: 'test' }, 'test/policy'),
      ).rejects.toThrow(
        'An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error',
      );
    });

    it('should throw if fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        client.evaluatePolicy({ user: 'test' }, 'test/policy'),
      ).rejects.toThrow(
        'An error occurred while sending the policy input to the OPA server: Error: Network error',
      );
    });
  });
});
