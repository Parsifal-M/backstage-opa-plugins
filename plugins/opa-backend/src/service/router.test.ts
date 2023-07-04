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
          if (key === 'opa-client.opa.policies.entityChecker.package') {
            return 'opa.policies';
          }
          throw new Error(`Unmocked config key "${key}"`);
        }),
        // You can add more mocked methods if your code uses them.
        // Add any other required keys that your config object might use.
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
      mockedAxios.post.mockRejectedValue(new Error());

      const response = await request(app)
        .post('/entity-checker')
        .send({ input: 'entityMetadata' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Failed to evaluate metadata with OPA');
    });
  });
});
