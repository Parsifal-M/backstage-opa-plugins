import { mockServices, ServiceMock } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { entityCheckerRouter } from './entityChecker';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

global.fetch = jest.fn();

describe('entityCheckerRouter', () => {
  let app: express.Express;
  let mockFetch: jest.Mock;
  let mockLogger: ServiceMock<LoggerService>;

  beforeEach(() => {
    mockLogger = mockServices.logger.mock();
    mockFetch = global.fetch as jest.Mock;
    jest.clearAllMocks();
  });

  const createApp = (config: any) => {
    const configReader = new ConfigReader(config);
    const router = entityCheckerRouter(mockLogger, configReader);
    return express().use(express.json()).use(router);
  };

  describe('POST /entity-checker', () => {
    it('returns the OPA response when properly configured', async () => {
      const config = {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
          entityChecker: {
            policyEntryPoint: 'entity_checker/decision',
          },
        },
      };

      app = createApp(config);

      const mockOpaResponse = {
        result: [
          {
            id: 'test-check',
            level: 'info',
            message: 'Entity is valid',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockOpaResponse),
      });

      const entityMetadata = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: entityMetadata });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockOpaResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8181/v1/data/entity_checker/decision',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: entityMetadata }),
        }),
      );
    });

    it('returns 400 if entity metadata is missing', async () => {
      const config = {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
          entityChecker: {
            policyEntryPoint: 'entity_checker/decision',
          },
        },
      };

      app = createApp(config);

      const res = await request(app).post('/entity-checker').send({});

      expect(res.status).toEqual(400);
      expect(res.body).toEqual({ error: 'Entity metadata is missing!' });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Entity metadata is missing!',
      );
    });

    it('returns 500 if OPA base URL is not configured', async () => {
      const config = {
        openPolicyAgent: {
          entityChecker: {
            policyEntryPoint: 'entity_checker/decision',
          },
        },
      };

      app = createApp(config);

      const entityMetadata = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: entityMetadata });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({ error: 'OPA base URL not configured' });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'OPA base URL not configured',
      );
    });

    it('returns 500 if OPA entrypoint is not configured', async () => {
      const config = {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
        },
      };

      app = createApp(config);

      const entityMetadata = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: entityMetadata });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        error:
          'OPA entity checker policyEntryPoint is required, please set it in the configuration',
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'OPA entity checker policyEntryPoint is required, please set it in the configuration',
      );
    });

    it('returns OPA server status when OPA returns an error', async () => {
      const config = {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
          entityChecker: {
            policyEntryPoint: 'entity_checker/decision',
          },
        },
      };

      app = createApp(config);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const entityMetadata = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: entityMetadata });

      expect(res.status).toEqual(500);
      expect(res.body).toEqual({
        error: 'OPA server returned error: 500 - Internal Server Error',
      });
    });

    it('handles fetch errors gracefully', async () => {
      const config = {
        openPolicyAgent: {
          baseUrl: 'http://localhost:8181',
          entityChecker: {
            policyEntryPoint: 'entity_checker/decision',
          },
        },
      };

      app = createApp(config);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const entityMetadata = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test-component' },
      };

      const res = await request(app)
        .post('/entity-checker')
        .send({ input: entityMetadata });

      expect(res.status).toEqual(500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'An error occurred trying to send entity metadata to OPA:',
        expect.any(Error),
      );
    });
  });
});
