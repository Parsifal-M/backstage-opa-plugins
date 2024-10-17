import { mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';
import { policyContentRouter } from './policyContent';
import { readPolicyFile } from '../../lib/read';

jest.mock('node-fetch');
jest.mock('../../lib/read');

describe('policyContentRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const mockUrlReader = mockServices.urlReader.mock();
    const mockLogger = mockServices.logger.mock();

    const router = policyContentRouter(mockLogger, mockUrlReader);
    app = express().use(express.json()).use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /get-policy', () => {
    it('should return the content of the policy file', async () => {
      (readPolicyFile as jest.Mock).mockResolvedValue('test-policy-content');

      const response = await request(app).get(
        '/get-policy?opaPolicy=test-policy-url',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        opaPolicyContent: 'test-policy-content',
      });
    });
  });
});
