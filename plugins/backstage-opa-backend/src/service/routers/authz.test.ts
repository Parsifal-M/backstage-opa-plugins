import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { authzRouter } from './authz';
import fetch from 'node-fetch';
import { BackstageUserInfo } from '@backstage/backend-plugin-api';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('authzRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const mockConfig = mockServices.rootConfig({
      data: {
        opaClient: {
          baseUrl: 'http://localhost:8181',
        },
      },
    });

    const mockLogger = mockServices.logger.mock();
    const mockHttpAuth = mockServices.httpAuth.mock();
    const mockUserInfo = mockServices.userInfo.mock();
    const mockUserInfoData = { user: 'testUser', email: 'test@example.com' };

    mockUserInfo.getUserInfo.mockResolvedValue(
      mockUserInfoData as unknown as BackstageUserInfo,
    );

    const router = authzRouter(
      mockLogger,
      mockConfig,
      mockHttpAuth,
      mockUserInfo,
    );
    app = express().use(express.json()).use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /opa-authz', () => {
    it('returns 400 if input or entryPoint is missing', async () => {
      const res = await request(app).post('/opa-authz').send({});

      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        error: 'Missing input or entryPoint in request body',
      });
    });

    it('returns the policy evaluation result', async () => {
      const mockResult = {
        decision_id: 'test-decision-id',
        result: { allow: true },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const res = await request(app)
        .post('/opa-authz')
        .send({ input: { user: 'testUser' }, entryPoint: 'testEntryPoint' });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { user: 'testUser', email: 'test@example.com' },
          }),
        }),
      );
    });

    it('returns 500 if an error occurs during policy evaluation', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('OPA Error'),
      );

      const res = await request(app)
        .post('/opa-authz')
        .send({ input: { user: 'testUser' }, entryPoint: 'testEntryPoint' });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ error: 'Error evaluating policy' });
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { user: 'testUser', email: 'test@example.com' },
          }),
        }),
      );
    });
  });
});
