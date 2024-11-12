import { mockServices, ServiceMock } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { entityCheckerRouter } from './entityChecker';
import fetch from 'node-fetch';
import { EntityCheckerApiImpl } from '../../api/EntityCheckerApi';
import { LoggerService } from '@backstage/backend-plugin-api';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('entityCheckerRouter', () => {
  let app: express.Express;
  let mockFetch: jest.Mock;
  let mockLogger: ServiceMock<LoggerService>;

  beforeAll(async () => {
    mockLogger = mockServices.logger.mock();
    mockFetch = fetch as unknown as jest.Mock;

    const entityCheckerApi = new EntityCheckerApiImpl({
      logger: mockLogger,
      opaBaseUrl: 'http://localhost:8181',
      entityCheckerEntrypoint: 'entityCheckerEntrypoint',
    });

    const router = entityCheckerRouter(mockLogger, entityCheckerApi);
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

    it('returns 500 if entity metadata is missing', async () => {
      const res = await request(app).post('/entity-checker').send({});

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
