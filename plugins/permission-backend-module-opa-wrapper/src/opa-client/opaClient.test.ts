import { mockServices } from '@backstage/backend-test-utils';
import { OpaClient } from './opaClient';
import {
  PermissionsFrameworkPolicyEvaluationResult,
  PermissionsFrameworkPolicyInput,
} from '../types';

const BASE_URL = 'http://opa.example.com:8181';
const ENTRY_POINT = 'rbac_policy/decision';
const OPA_URL = `${BASE_URL}/v1/data/${ENTRY_POINT}`;

const input: PermissionsFrameworkPolicyInput = {
  permission: { name: 'catalog.entity.read' },
  identity: {
    user: 'user:default/parsifal-m',
    claims: ['user:default/parsifal-m', 'group:default/maintainers'],
  },
};

const createClient = (fallback?: string) => {
  const logger = mockServices.logger.mock();
  const config = mockServices.rootConfig({
    data: {
      permission: {
        opa: {
          baseUrl: BASE_URL,
          policy: {
            policyEntryPoint: ENTRY_POINT,
            ...(fallback !== undefined && { policyFallbackDecision: fallback }),
          },
        },
      },
    },
  });
  return { client: new OpaClient(config, logger), logger };
};

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

// The shape Node's built-in (undici) fetch rejects with when the server is
// unreachable, e.g. connection refused or DNS failure.
const networkError = () =>
  new TypeError('fetch failed', {
    cause: Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8181'), {
      code: 'ECONNREFUSED',
    }),
  });

describe('OpaClient', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('constructor', () => {
    it.each([
      ['permission.opa.baseUrl', { policy: { policyEntryPoint: ENTRY_POINT } }],
      ['permission.opa.policy.policyEntryPoint', { baseUrl: BASE_URL }],
    ])('throws when %s is not configured', (key, opa) => {
      const config = mockServices.rootConfig({
        data: { permission: { opa } },
      });

      expect(() => new OpaClient(config, mockServices.logger.mock())).toThrow(
        `Missing required config value at '${key}'`,
      );
    });

    // Native fetch rejects these with the same TypeError it uses for network
    // failures, so they must fail at startup rather than reach the fallback.
    it.each([
      ['has no scheme', 'localhost:8181', 'must be an http:// or https:// URL'],
      [
        'uses a non-HTTP scheme',
        'ftp://opa:8181',
        'must be an http:// or https:// URL',
      ],
      ['cannot be parsed', 'http://opa .example.com', 'Invalid OPA URL'],
      ['is not a URL', 'not a url', 'Invalid OPA URL'],
    ])('throws when baseUrl %s', (_, baseUrl, expectedError) => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            opa: {
              baseUrl,
              policy: {
                policyEntryPoint: ENTRY_POINT,
                policyFallbackDecision: 'allow',
              },
            },
          },
        },
      });

      expect(() => new OpaClient(config, mockServices.logger.mock())).toThrow(
        expectedError,
      );
    });

    it.each(['http://opa:8181', 'https://opa.example.com'])(
      'accepts the %s baseUrl',
      baseUrl => {
        const config = mockServices.rootConfig({
          data: {
            permission: {
              opa: { baseUrl, policy: { policyEntryPoint: ENTRY_POINT } },
            },
          },
        });

        expect(
          () => new OpaClient(config, mockServices.logger.mock()),
        ).not.toThrow();
      },
    );
  });

  describe('evaluatePermissionsFrameworkPolicy', () => {
    it('POSTs the input to the configured entry point', async () => {
      const { client } = createClient();
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({ result: { result: 'ALLOW' } }),
      );

      await client.evaluatePermissionsFrameworkPolicy(input);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(OPA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
    });

    it.each<[string, PermissionsFrameworkPolicyEvaluationResult]>([
      ['ALLOW', { result: 'ALLOW' }],
      ['DENY', { result: 'DENY' }],
      [
        'CONDITIONAL',
        {
          result: 'CONDITIONAL',
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          conditions: {
            anyOf: [
              {
                resourceType: 'catalog-entity',
                rule: 'IS_ENTITY_OWNER',
                params: { claims: ['group:default/maintainers'] },
              },
            ],
          },
        },
      ],
    ])('returns an unwrapped %s decision as-is', async (_, decision) => {
      const { client } = createClient();
      fetchSpy.mockResolvedValueOnce(jsonResponse({ result: decision }));

      await expect(
        client.evaluatePermissionsFrameworkPolicy(input),
      ).resolves.toEqual(decision);
    });

    // A reachable OPA that returns no usable decision is a policy or entry
    // point misconfiguration, so it throws even when a fallback is set.
    it.each([
      // OPA answers 200 with `{}` when the queried document is undefined,
      // e.g. the policy is not loaded.
      ['the entry point is undefined', {}],
      ['the body is null', null],
      ['the result is a boolean rule', { result: true }],
      ['the result is a bare string', { result: 'ALLOW' }],
      ['the result object has no result field', { result: { allow: true } }],
      ['the result field is not a string', { result: { result: 1 } }],
    ])('throws when %s', async (_, body) => {
      const { client, logger } = createClient('allow');
      fetchSpy.mockResolvedValueOnce(jsonResponse(body));

      await expect(
        client.evaluatePermissionsFrameworkPolicy(input),
      ).rejects.toThrow('The result is missing in the response from OPA');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'The result is missing in the response from OPA',
        ),
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('logs the input and the response at debug level', async () => {
      const { client, logger } = createClient();
      fetchSpy.mockResolvedValueOnce(
        jsonResponse({ result: { result: 'DENY' } }),
      );

      await client.evaluatePermissionsFrameworkPolicy(input);

      expect(logger.debug).toHaveBeenCalledWith(
        `Sending policy input to OPA: ${JSON.stringify(input)}`,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        `Received data from OPA: ${JSON.stringify({
          result: { result: 'DENY' },
        })}`,
      );
    });
  });

  describe('when OPA is unavailable', () => {
    const failures: Array<[string, () => void, string]> = [
      [
        'the server is unreachable',
        () => fetchSpy.mockRejectedValueOnce(networkError()),
        'An error occurred while sending the policy input to the OPA server: TypeError: fetch failed',
      ],
      [
        'the server responds with 500',
        () =>
          fetchSpy.mockResolvedValueOnce(
            new Response('boom', {
              status: 500,
              statusText: 'Internal Server Error',
            }),
          ),
        'An error response was returned after sending the policy input to the OPA server: 500 - Internal Server Error',
      ],
      [
        'the server responds with 404',
        () =>
          fetchSpy.mockResolvedValueOnce(
            new Response(null, { status: 404, statusText: 'Not Found' }),
          ),
        'An error response was returned after sending the policy input to the OPA server: 404 - Not Found',
      ],
    ];

    describe.each(failures)('and %s', (_, arrangeFailure, message) => {
      it.each([
        ['allow', 'ALLOW'],
        ['deny', 'DENY'],
        ['ALLOW', 'ALLOW'],
        ['Deny', 'DENY'],
      ])(
        'falls back to %s when configured',
        async (fallback, expectedResult) => {
          const { client, logger } = createClient(fallback);
          arrangeFailure();

          await expect(
            client.evaluatePermissionsFrameworkPolicy(input),
          ).resolves.toEqual({ result: expectedResult });

          expect(logger.warn).toHaveBeenCalledWith(
            `${message}. Falling back to ${expectedResult.toLowerCase()}.`,
          );
          expect(logger.error).not.toHaveBeenCalled();
        },
      );

      it.each([
        ['no fallback is configured', undefined],
        ['the fallback is not allow or deny', 'maybe'],
      ])('throws and logs an error when %s', async (__, fallback) => {
        const { client, logger } = createClient(fallback);
        arrangeFailure();

        await expect(
          client.evaluatePermissionsFrameworkPolicy(input),
        ).rejects.toThrow(message);

        expect(logger.error).toHaveBeenCalledWith(message);
        expect(logger.warn).not.toHaveBeenCalled();
      });
    });
  });

  describe('when OPA returns a body that is not JSON', () => {
    it('throws instead of applying the fallback', async () => {
      // OPA is reachable, so a garbage body is a misconfiguration (e.g. a proxy
      // returning HTML). Failing closed beats silently allowing everything.
      const { client, logger } = createClient('allow');
      fetchSpy.mockResolvedValueOnce(
        new Response('<html>Gateway</html>', { status: 200 }),
      );

      await expect(
        client.evaluatePermissionsFrameworkPolicy(input),
      ).rejects.toThrow('Failed to parse the response from the OPA server');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to parse the response from the OPA server',
        ),
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
