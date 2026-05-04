import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { authzRouter } from './authz';
import fetch from 'node-fetch';
import { BackstageUserInfo } from '@backstage/backend-plugin-api';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('authzRouter', () => {
  const buildApp = () => {
    const config = mockServices.rootConfig({
      data: {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
        },
      },
    });

    const mockCatalog = catalogServiceMock.mock();
    const mockLogger = mockServices.logger.mock();
    const mockHttpAuth = mockServices.httpAuth.mock();
    const mockUserInfo = mockServices.userInfo.mock();

    const mockUserInfoData = {
      user: 'testUser',
      email: 'test@example.com',
      userEntityRef: 'user:default/testUser',
      ownershipEntityRefs: ['user:default/testUser', 'group:default/team-a'],
    };

    mockUserInfo.getUserInfo.mockResolvedValue(
      mockUserInfoData as unknown as BackstageUserInfo,
    );

    const router = authzRouter(
      mockCatalog,
      mockLogger,
      config,
      mockHttpAuth,
      mockUserInfo,
    );

    const app = express().use(express.json()).use(router);

    return {
      app,
      mockCatalog,
      mockUserInfo,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /opa-authz', () => {
    it('returns 400 for invalid request body', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/opa-authz').send({});

      expect(res.status).toEqual(400);
      expect(res.body).toMatchObject({ error: 'Invalid request body' });
    });

    it('returns the policy evaluation result', async () => {
      const { app } = buildApp();
      const mockResult = {
        decision_id: 'test-decision-id',
        result: { allow: true },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const res = await request(app)
        .post('/opa-authz')
        .send({
          input: { user: 'testUser' },
          entryPoint: 'testEntryPoint',
        });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: {
              user: 'testUser',
              email: 'test@example.com',
              userEntityRef: 'user:default/testUser',
              ownershipEntityRefs: [
                'user:default/testUser',
                'group:default/team-a',
              ],
            },
          }),
        }),
      );
    });

    it('returns 500 if an error occurs during policy evaluation', async () => {
      const { app } = buildApp();
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('OPA Error'),
      );

      const res = await request(app)
        .post('/opa-authz')
        .send({
          input: { user: 'testUser' },
          entryPoint: 'testEntryPoint',
        });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ error: 'Error evaluating policy' });
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: {
              user: 'testUser',
              email: 'test@example.com',
              userEntityRef: 'user:default/testUser',
              ownershipEntityRefs: [
                'user:default/testUser',
                'group:default/team-a',
              ],
            },
          }),
        }),
      );
    });

    it('includes full user entity when requested in body', async () => {
      const { app, mockCatalog } = buildApp();

      const fakeEntity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: { name: 'testUser' },
        spec: {},
      };

      mockCatalog.getEntityByRef.mockResolvedValue(fakeEntity);

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify({ result: { allow: true } }), {
          status: 200,
        }),
      );

      await request(app)
        .post('/opa-authz')
        .send({
          input: { user: 'testUser' },
          entryPoint: 'testEntryPoint',
          includeUserEntity: true,
        });

      expect(mockCatalog.getEntityByRef).toHaveBeenCalledWith(
        'user:default/testUser',
        expect.any(Object),
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: {
              user: 'testUser',
              email: 'test@example.com',
              userEntityRef: 'user:default/testUser',
              ownershipEntityRefs: [
                'user:default/testUser',
                'group:default/team-a',
              ],
              userEntity: fakeEntity,
            },
          }),
        }),
      );
    });

    it('does NOT include full user entity when not requested', async () => {
      const { app, mockCatalog } = buildApp();

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify({ result: { allow: true } }), {
          status: 200,
        }),
      );

      await request(app)
        .post('/opa-authz')
        .send({
          input: { user: 'testUser' },
          entryPoint: 'testEntryPoint',
        });

      expect(mockCatalog.getEntityByRef).not.toHaveBeenCalled();
    });

    it('strips userEntity from caller input — userEntity is backend-owned', async () => {
      const { app } = buildApp();

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        new Response(JSON.stringify({ result: { allow: true } }), {
          status: 200,
        }),
      );

      await request(app)
        .post('/opa-authz')
        .send({
          input: {
            user: 'testUser',
            userEntity: {
              metadata: { annotations: { 'company.com/role': 'admin' } },
            },
          },
          entryPoint: 'testEntryPoint',
        });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/testEntryPoint',
        expect.objectContaining({
          body: JSON.stringify({
            input: {
              user: 'testUser',
              email: 'test@example.com',
              userEntityRef: 'user:default/testUser',
              ownershipEntityRefs: [
                'user:default/testUser',
                'group:default/team-a',
              ],
            },
          }),
        }),
      );
    });
  });
});
