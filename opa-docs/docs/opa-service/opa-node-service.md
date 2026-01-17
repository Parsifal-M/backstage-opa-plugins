# OPA Node Service for Backstage

## Introduction

The `opa-node` service provides a simple, robust integration of [Open Policy Agent (OPA)](https://www.openpolicyagent.org/) into Backstage backend plugins. It enables developers to secure backend routes and implement fine-grained authorization using OPA policies.

This guide explains how to use the `opa` service, demonstrates realistic usage patterns, and provides best practices for integrating OPA into your Backstage app.

## Key Features

- Allows Backstage plugins and backend services to evaluate authorization and policy decisions using OPA.
- Provides a simple API for sending policy inputs and receiving policy results from OPA.
- Supports custom policy entry points and flexible input structures for fine-grained access control.
- Enables centralized, declarative policy management for your Backstage environment.

## Getting Started

### Pre-requisites

- You have a running OPA server (see [Deploying OPA](https://www.openpolicyagent.org/docs/latest/deployments/)).

### Installation

Install the package in your Backstage backend:

```bash
yarn add @parsifal-m/backstage-plugin-opa-node
```

### Backend integration

This package provides an `opaService` that you add as a dependency to your plugin or module and receive as an injected runtime dependency. Example plugin registration (see the [demo backend plugin](https://github.com/parsifal-m/backstage-opa-plugins/tree/main/plugins/opa-demo-backend/src/plugin.ts) for a full example):

```typescript
import { opaService } from '@parsifal-m/backstage-plugin-opa-node';

export const yourPlugin = createBackendPlugin({
  pluginId: 'your-plugin-id',
  register(env) {
    env.registerInit({
      deps: {
        // ...other dependencies...
        opa: opaService,
      },
      async init({ opa }) {
        httpRouter.use(
          await createRouter({
            // ...other dependencies...
            opa,
          }),
        );
      },
    });
  },
});
```

## Securing backend routes with OPA

Use the injected `opa` service inside routers to evaluate a policy entry point with a JSON input object. The [demo router](https://github.com/parsifal-m/backstage-opa-plugins/tree/main/plugins/opa-demo-backend/src/router.ts) shows practical examples; below is a minimal pattern you can follow:

```typescript
// inside your router factory which receives `opa: OpaService`
router.post('/my-protected-route', async (req, res) => {
  const input = {
    method: req.method,
    path: req.path,
    headers: req.headers,
    permission: { name: 'create-resource' },
    // include user, entity, or other context as needed
  };

  // Evaluate policy using the injected service and a policy entry point
  const policyResult = await opa.evaluatePolicy(input, 'my_policy_entrypoint');
  if (!policyResult.result || !policyResult.result.allow) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  // Proceed with your route logic
  res.status(201).json({ success: true });
});
```

## Testing OPA Integration

In unit tests you should mock the injected `opa` service rather than calling a real OPA server. Example with Jest:

```typescript
// Create a minimal mock of the injected OPA service
const opaMock = {
  evaluatePolicy: jest.fn().mockResolvedValue({ result: { allow: true } }),
};

// Inject `opaMock` into the router or service under test
it('allows when policy permits', async () => {
  // arrange: build router or service with opa: opaMock
  // act: call the handler
  // assert: that the response is allowed and opaMock.evaluatePolicy was called
  expect(opaMock.evaluatePolicy).toHaveBeenCalled();
});
```

If you need to simulate different policy decisions, change the `mockResolvedValue` to return `{ result: { allow: false } }` or other structured policy responses used by your policies.

## Realistic Example: Securing a Todo List Service

Suppose you have a `TodoListService` in your Backstage backend. You want only users with the `editor` role to create todos:

**Policy (`todo_policy.rego`):**

```rego
package todo.authz

# Allow only when the incoming input contains a `userRole` equal to "editor"
allow {
  input.userRole == "editor"
}
```

**Route Protection:**

```typescript
router.post('/squads', async (req, res) => {
  // The example below shows what it could look like to send the user entity (name and annotations) to OPA
  const credentials = await httpAuth.credentials(req, { allow: ['user'] });
  const userEntityRef = credentials.principal.userEntityRef;
  const userEntity = await catalog.getEntityByRef(userEntityRef, { credentials });

  // We're building an example policy input to send to OPA for evaluation
  const input: PolicyInput = {
    method: req.method,
    path: req.path,
    user: userEntity?.metadata.name,
    // extract a role from the user entity annotations (example key: `role`)
    userRole: userEntity?.metadata?.annotations?.role,
    permission: { name: 'post-todo' },
    plugin: 'opa-demo-backend-todo',
    dateTime: new Date().toISOString(),
  };

  logger.info(`Sending input to OPA: ${JSON.stringify(input)}`);

  const policyResult = await opa.evaluatePolicy<PolicyResult>(input, 'opa_demo');
  if (!policyResult.result || !policyResult.result.allow) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const result = await todoListService.createTodo(req.body);
  return res.status(201).json(result);
});
```

For more details, see the [opa-node README](../../plugins/opa-node/README.md) and explore the [demo backend](../../plugins/opa-demo-backend/src/) for practical examples.
