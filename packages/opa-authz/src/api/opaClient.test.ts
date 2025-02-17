import { mockServices } from '@backstage/backend-test-utils';
import { OpaAuthzClient } from './opaClient';
import { ConfigReader } from '@backstage/config';

const mockConfig = {
  opaClient: {
    baseUrl: 'http://localhost:8181',
  },
};

describe('OpaAuthzClient', () => {
  const config = new ConfigReader(mockConfig);
  let opaAuthzClient: OpaAuthzClient;
  const mockLogger = mockServices.logger.mock();

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
    opaAuthzClient = new OpaAuthzClient(mockLogger, config);
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

    const result = await opaAuthzClient.evaluatePolicy(
      mockInput,
      mockOpaEntrypoint,
    );

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
      opaAuthzClient.evaluatePolicy(mockInput, mockOpaEntrypoint),
    ).rejects.toThrow(
      'An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error',
    );
  });
});
