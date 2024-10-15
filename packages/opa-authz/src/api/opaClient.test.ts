import fetch from 'node-fetch';
import { mockServices } from '@backstage/backend-test-utils';
import { OpaAuthzClient } from './opaClient';
import { ConfigReader } from '@backstage/config';

jest.mock('node-fetch');

const mockConfig = {
  opaClient: {
    baseUrl: 'http://localhost:8181',
  },
};

describe('OpaAuthzClient', () => {
  const config = new ConfigReader(mockConfig);
  let opaAuthzClient: OpaAuthzClient;
  const mockLogger = mockServices.logger.mock();

  beforeAll(() => {
    opaAuthzClient = new OpaAuthzClient(config, mockLogger);
  });

  it('should evaluate policy correctly', async () => {
    const mockInput = {
      permission: { name: 'read' },
      identity: { user: 'testUser', claims: ['claim1', 'claim2'] },
    };

    const mockOpaEntrypoint = 'some/admin';
    const url = `http://localhost:8181/v1/data/${mockOpaEntrypoint}`;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ result: 'ALLOW' }),
    } as any);

    const result = await opaAuthzClient.evaluatePolicy(
      mockInput,
      mockOpaEntrypoint,
    );

    expect(fetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: mockInput }),
      }),
    );
    expect(result).toEqual({ result: 'ALLOW' });
  });

  it('should throw an error if the OPA URL is not set', () => {
    const mockConfigNoBaseUrl = {
      opaClient: {},
    };

    const createOpaAuthzClient = () => {
      return new OpaAuthzClient(
        new ConfigReader(mockConfigNoBaseUrl),
        mockLogger,
      );
    };

    expect(() => {
      createOpaAuthzClient();
    }).toThrow('The OPA URL is not set in the app-config!');
  });

  it('should throw an error if the request to the OPA server fails', async () => {
    const mockInput = {
      permission: { name: 'read' },
      identity: { user: 'anders', claims: ['claim1', 'claim2'] },
    };
    const mockOpaEntrypoint = 'some/admin';
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as any);

    await expect(
      opaAuthzClient.evaluatePolicy(mockInput, mockOpaEntrypoint),
    ).rejects.toThrow(
      `An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error`,
    );
  });
});
