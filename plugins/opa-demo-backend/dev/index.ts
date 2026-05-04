import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// Minimal dev backend for @internal/backstage-plugin-opa-demo-backend
// Requires a running OPA server at http://localhost:8181 and the opa_demo policy loaded.
// All routes are mounted under /api/opa-demo-backend.
//
// Start: yarn start (from this plugin directory)
//
// The mock user is user:default/mock. Routes that check ownership against
// user:default/parsifal-m will return 403 for the mock user by design —
// this demonstrates the OPA deny path. Adjust policies/opa_demo/opa_demo.rego
// to test different outcomes.
//
// List todos (allowed — opa_demo permits GET + read-all-todos for any user):
//   curl http://localhost:7007/api/opa-demo-backend/todos
//
// Get a specific todo (denied for mock user — ownership check fails):
//   curl http://localhost:7007/api/opa-demo-backend/todos/1
//
// Create a todo (denied for mock user — no matching allow rule in opa_demo):
//   curl -X POST http://localhost:7007/api/opa-demo-backend/todo \
//     -H 'Content-Type: application/json' \
//     -d '{"title": "my todo"}'

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

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
        },
        spec: {
          type: 'service',
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
