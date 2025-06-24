import { EntityCheckerClientImpl } from './EntityCheckerClient';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';

global.fetch = jest.fn();

const mockLogger: LoggerService = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
} as unknown as LoggerService;

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
  },
  spec: {
    type: 'service',
  },
};

describe('EntityCheckerClientImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully check an entity', async () => {
    const client = new EntityCheckerClientImpl({
      logger: mockLogger,
      opaBaseUrl: 'http://localhost:8181',
      entityCheckerEntrypoint: 'entity_checker/decision',
    });

    const mockResponse = {
      result: [
        {
          id: 'test-1',
          level: 'info' as const,
          message: 'Entity is valid',
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await client.checkEntity({
      entityMetadata: mockEntity,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8181/v1/data/entity_checker/decision',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: mockEntity }),
      },
    );

    expect(result).toEqual(mockResponse);
  });

  it('should throw error when OPA server returns error', async () => {
    const client = new EntityCheckerClientImpl({
      logger: mockLogger,
      opaBaseUrl: 'http://localhost:8181',
      entityCheckerEntrypoint: 'entity_checker/decision',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(
      client.checkEntity({
        entityMetadata: mockEntity,
      }),
    ).rejects.toThrow('OPA server returned error: 500 - Internal Server Error');
  });
});
