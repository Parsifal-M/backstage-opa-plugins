import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import axios from 'axios';

import { createRouter } from './router';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'opaClient.policies.entityChecker.package') {
            return 'entityChecker.package';
          }
          throw new Error(`Unmocked config key "${key}"`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'opaClient.baseUrl') {
            return 'http://dummy-opa-base-url.com';
          }
          return null; // Return null for non-existing optional keys
        }),
        ...(jest.fn() as any),
      },
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /entity-checker', () => {
    it('returns data from OPA', async () => {
      const mockResponse = { data: { result: 'mockResult' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/entity-checker')
        .send({ input: 'entityMetadata' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockResponse.data.result);
    });

    it('handles error from OPA', async () => {
      const mockErrorResponse = {
        error: {
          name: 'Error',
          message: 'OPA error message',
        },
      };

      mockedAxios.post.mockRejectedValue(mockErrorResponse);

      const response = await request(app)
        .post('/entity-checker')
        .send({ input: 'entityMetadata' });

      expect(response.status).toEqual(500); // Check the HTTP status code
      expect(response.text).toContain('OPA error message'); // Check the actual error message received
    });
  });
});
