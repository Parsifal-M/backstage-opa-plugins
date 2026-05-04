import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// Minimal dev backend for @parsifal-m/plugin-opa-backend
// Requires a running OPA server at http://localhost:8181 for policy evaluation.
//
// Start: yarn start (from this plugin directory)
//
// Health check:
//   curl http://localhost:7007/api/opa/health
//
// Authz:
//   curl -X POST http://localhost:7007/api/opa/opa-authz \
//     -H 'Content-Type: application/json' \
//     -d '{"input": {"action": "read"}, "entryPoint": "my_policy/decision"}'
//
// Authz with full user entity (resolves user:default/mock from catalog mock):
//   curl -X POST http://localhost:7007/api/opa/opa-authz \
//     -H 'Content-Type: application/json' \
//     -d '{"input": {"action": "read"}, "entryPoint": "my_policy/decision", "includeUserEntity": true}'
//
// Entity checker (requires openPolicyAgent.entityChecker.enabled: true in app-config.yaml):
//   curl -X POST http://localhost:7007/api/opa/entity-checker \
//     -H 'Content-Type: application/json' \
//     -d '{"input": {"apiVersion": "backstage.io/v1alpha1", "kind": "Component", "metadata": {"name": "sample"}, "spec": {}}}'

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());
backend.add(mockServices.userInfo.factory());

backend.add(
  catalogServiceMock.factory({
    entities: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: 'mock',
          namespace: 'default',
          annotations: {
            'company.com/role': 'developer',
            'company.com/department': 'engineering',
            'company.com/team': 'platform',
          },
        },
        spec: {
          profile: {
            displayName: 'Mock User',
            email: 'mock@example.com',
          },
          memberOf: ['group:default/team-a'],
        },
      },
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'sample',
          title: 'Sample Component',
          namespace: 'default',
        },
        spec: {
          type: 'service',
          owner: 'user:default/mock',
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
