import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { entityCheckerRouter } from './entityChecker';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('entityCheckerRouter', () => {
  let app: express.Express;
  let mockFetch: jest.Mock;

  beforeAll(async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        opaClient: {
          baseUrl: 'http://localhost:8181',
          policies: {
            entityChecker: {
              entrypoint: 'entityCheckerEntrypoint',
            },
          },
        },
      },
    });

    const mockLogger = mockServices.logger.mock();
    mockFetch = fetch as unknown as jest.Mock;

    const router = entityCheckerRouter(mockLogger, mockConfig);
    app = express().use(express.json()).use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /entity-checker', () => {
    it('returns the OPA response', async () => {
      const mockOpaResponse = { result: { allow: true } };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockOpaResponse)),
      );

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: { metadata: 'test' } });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockOpaResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/entityCheckerEntrypoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: { metadata: 'test' } }),
        }),
      );
    });

    it('returns 500 if OPA package is not set', async () => {
      const mockConfigNoPackage = mockServices.rootConfig({
        data: {
          opaClient: {
            baseUrl: 'http://localhost:8181',
          },
        },
      });

      const mockLogger = mockServices.logger.mock();
      const router = entityCheckerRouter(mockLogger, mockConfigNoPackage);
      const appNoPackage = express().use(express.json()).use(router);

      const res = await request(appNoPackage)
        .post('/entity-checker')
        .send({ input: {} });

      expect(res.status).toEqual(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'OPA package not set or missing!',
      );
    });

    it('returns 500 if entity metadata is missing', async () => {
      const mockConfigWithPackage = mockServices.rootConfig({
        data: {
          opaClient: {
            baseUrl: 'http://localhost:8181',
            policies: {
              entityChecker: {
                entrypoint: 'entityCheckerEntrypoint',
              },
            },
          },
        },
      });

      const mockLogger = mockServices.logger.mock();
      const router = entityCheckerRouter(mockLogger, mockConfigWithPackage);
      const appWithPackage = express().use(express.json()).use(router);

      const res = await request(appWithPackage)
        .post('/entity-checker')
        .send({});

      expect(res.status).toEqual(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Entity metadata is missing!',
      );
    });

    it('returns 500 if an error occurs during the fetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Fetch error'));

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: { metadata: 'test' } });

      expect(res.status).toEqual(500);
    });
  });
});
