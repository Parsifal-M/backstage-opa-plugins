import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
        },
      },
    });
    const router = await createRouter({
      auth: mockServices.auth.mock(),
      catalogApi: catalogServiceMock.mock(),
      config: mockConfig,
      logger: mockServices.logger.mock(),
      urlReader: mockServices.urlReader.mock(),
      httpAuth: mockServices.httpAuth.mock(),
      userInfo: mockServices.userInfo.mock(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
