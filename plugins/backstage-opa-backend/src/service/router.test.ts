import { getVoidLogger, UrlReader } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';
import fetch from 'node-fetch';
import { mockServices } from '@backstage/backend-test-utils';

jest.mock('node-fetch');

const { Response: FetchResponse } = jest.requireActual('node-fetch');

const mockUrlReader: UrlReader = {
  readUrl: url =>
    Promise.resolve({
      buffer: async () => Buffer.from(url),
      etag: 'buffer',
      stream: jest.fn(),
    }),
  readTree: jest.fn(),
  search: jest.fn(),
};

describe('createRouter', () => {
  let app: express.Express;

  const config = new ConfigReader({
    opaClient: {
      baseUrl: 'http://localhost',
      policies: {
        entityChecker: {
          entrypoint: 'entitymeta_policy/somepoint',
        },
      },
    },
  });

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: config,
      discovery: mockServices.discovery(),
      urlReader: mockUrlReader,
    });

    app = express().use(router);
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('/entity-checker routes', () => {
    const mockedPayload = {
      input: {
        metadata: {
          namespace: 'default',
          annotations: {
            'backstage.io/managed-by-location':
              'file:/brewed-backstage/examples/entities.yaml',
            'backstage.io/managed-by-origin-location':
              'file:/brewed-backstage/examples/entities.yaml',
          },
          name: 'example-website',
          uid: '762d5d68-7418-4b65-baa4-43d5e6cd591d',
          etag: '46e9e22027eb7c502df70e8c34a0285123bc8e01',
        },
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        spec: {
          type: 'website',
          lifecycle: 'experimental',
          owner: 'guests',
          system: 'examples',
          providesApis: ['example-grpc-api'],
        },
        relations: [
          {
            type: 'ownedBy',
            targetRef: 'group:default/guests',
            target: {
              kind: 'group',
              namespace: 'default',
              name: 'guests',
            },
          },
          {
            type: 'partOf',
            targetRef: 'system:default/examples',
            target: {
              kind: 'system',
              namespace: 'default',
              name: 'examples',
            },
          },
          {
            type: 'providesApi',
            targetRef: 'api:default/example-grpc-api',
            target: {
              kind: 'api',
              namespace: 'default',
              name: 'example-grpc-api',
            },
          },
        ],
      },
    };

    const mockedEntityResponse = {
      allow: true,
      is_system_present: true,
      violation: [
        {
          level: 'warning',
          message: 'You do not have any tags set!',
        },
      ],
    };

    it('POSTS and returns a response from OPA as expected', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => {
        return Promise.resolve(
          new FetchResponse(JSON.stringify(mockedEntityResponse), {
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      });

      const res = await request(app)
        .post('/entity-checker')
        .send(mockedPayload)
        .expect('Content-Type', /json/);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(mockedEntityResponse);
    });

    it('returns 500 if OPA URL is not set', async () => {
      const router = await createRouter({
        logger: getVoidLogger(),
        config: new ConfigReader({
          opaClient: {
            baseUrl: undefined,
            policies: {
              entityChecker: {
                entrypoint: 'entitymeta_policy/somepoint',
              },
            },
          },
        }),
        discovery: mockServices.discovery(),
        urlReader: mockUrlReader,
      });

      app = express().use(router);

      const res = await request(app)
        .post('/entity-checker')
        .send(mockedPayload)
        .expect('Content-Type', /json/);

      expect(res.status).toEqual(500);
    });

    it('complains if no entrypoint is set', async () => {
      const router = await createRouter({
        logger: getVoidLogger(),
        config: new ConfigReader({
          opaClient: {
            baseUrl: 'http://localhost',
            policies: {
              entityChecker: {
                entrypoint: undefined,
              },
            },
          },
        }),
        discovery: mockServices.discovery(),
        urlReader: mockUrlReader,
      });

      app = express().use(router);

      const res = await request(app)
        .post('/entity-checker')
        .send(mockedPayload)
        .expect('Content-Type', /json/);

      expect(res.status).toEqual(500);
    });
  });

  describe('/get-policy route', () => {
    it('returns policy content when valid opaPolicy is provided', async () => {
      const opaPolicy = 'https://github.com/some/opa/repo/rbac.rego';
      const policyContent = 'policy content';

      // Mock the readPolicyFile function to return a predefined policy content
      mockUrlReader.readUrl = jest.fn().mockResolvedValue({
        buffer: async () => Buffer.from(policyContent),
        etag: 'buffer',
        stream: jest.fn(),
      });

      const res = await request(app).get(
        `/get-policy?opaPolicy=${encodeURIComponent(opaPolicy)}`,
      );

      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ policyContent });
    });

    it('returns 500 when no opaPolicy is provided', async () => {
      const res = await request(app).get('/get-policy');

      expect(res.status).toEqual(500);
    });

    it('returns 500 when an error occurs while fetching the policy file', async () => {
      const opaPolicy =
        'https://github.com/Parsifal-M/backstage-testing-grounds/blob/main/rbac.rego';

      // Mock the readPolicyFile function to throw an error
      mockUrlReader.readUrl = jest
        .fn()
        .mockRejectedValue(new Error('An error occurred'));

      const res = await request(app).get(
        `/get-policy?opaPolicy=${encodeURIComponent(opaPolicy)}`,
      );

      expect(res.status).toEqual(500);
    });
  });
});
