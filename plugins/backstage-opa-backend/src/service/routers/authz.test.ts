import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { authzRouter } from './authz';
import { OpaAuthzClient } from '@parsifal-m/backstage-opa-authz';
import { BackstageCredentials, BackstageUserInfo } from '@backstage/backend-plugin-api';

jest.mock('@parsifal-m/backstage-opa-authz');

describe('authzRouter', () => {
  let app: express.Express;
  let mockOpaAuthzClient: jest.Mocked<OpaAuthzClient>;

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

    mockUserInfo.getUserInfo.mockResolvedValue(mockUserInfoData as unknown as BackstageUserInfo);

    mockOpaAuthzClient = new OpaAuthzClient(
      mockLogger,
      mockConfig,
    ) as jest.Mocked<OpaAuthzClient>;
    (OpaAuthzClient as jest.Mock).mockImplementation(() => mockOpaAuthzClient);

    const router = authzRouter(mockLogger, mockConfig, mockHttpAuth, mockUserInfo);
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
      mockOpaAuthzClient.evaluatePolicy.mockResolvedValueOnce(mockResult);

      const res = await request(app)
        .post('/opa-authz')
        .send({ input: { user: 'testUser' }, entryPoint: 'testEntryPoint' });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockResult);
      expect(mockOpaAuthzClient.evaluatePolicy).toHaveBeenCalledWith(
        { user: 'testUser', email: 'test@example.com' },
        'testEntryPoint',
      );
    });

    it('returns 500 if an error occurs during policy evaluation', async () => {
      mockOpaAuthzClient.evaluatePolicy.mockRejectedValueOnce(
        new Error('OPA Error'),
      );

      const res = await request(app)
        .post('/opa-authz')
        .send({ input: { user: 'testUser' }, entryPoint: 'testEntryPoint' });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ error: 'Error evaluating policy' });
      expect(mockOpaAuthzClient.evaluatePolicy).toHaveBeenCalledWith(
        { user: 'testUser', email: 'test@example.com' },
        'testEntryPoint',
      );
    });
  });
});