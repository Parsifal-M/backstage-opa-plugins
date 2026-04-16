---
name: opa-service-integration
description: Integrate the OPA Node service into a Backstage backend plugin for route-level authorization. Use this skill whenever the user wants to secure backend plugin routes with OPA, add `opaService` as a dependency to a plugin, call `evaluatePolicy` in a router, write or update a Rego policy for a backend plugin, or mock OPA in tests. Trigger on phrases like "secure a route with OPA", "opaService", "evaluatePolicy", "add OPA to my plugin", "backend authorization with OPA", or any time the user is working with `@parsifal-m/backstage-plugin-opa-node`.
---

# OPA Service Integration for Backstage Backend Plugins

This skill covers adding `opaService` from `@parsifal-m/backstage-plugin-opa-node` to a backend plugin — wiring it in, using it in routers, writing the Rego policy, and testing. Unlike the Permissions Wrapper (which is for Backstage's Permission Framework), this is for plugins that need to make authorization decisions themselves at the route level.

## When to use this vs. the Permissions Wrapper

| Use case                                                                                                | Which approach                         |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Permission checks that go through Backstage's built-in permission framework (catalog, scaffolder, etc.) | `opa-permissions-wrapper-setup` skill  |
| Custom backend routes in your own plugin where you want to call OPA directly                            | This skill (`opa-service-integration`) |
| You need to pass custom context to OPA (e.g. request body, user role from catalog)                      | This skill                             |

## Step 1: Install the package

In the plugin's package directory (not the root):

```bash
yarn add --cwd plugins/your-plugin-backend @parsifal-m/backstage-plugin-opa-node
```

## Step 2: Add `opaService` as a plugin dependency

In your plugin's `plugin.ts` (the `createBackendPlugin` call), import and declare `opaService`:

```typescript
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { opaService } from '@parsifal-m/backstage-plugin-opa-node';
import { createRouter } from './router';

export const yourPlugin = createBackendPlugin({
  pluginId: 'your-plugin-id',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        // Add opaService here — it will be injected at runtime
        opa: opaService,
      },
      async init({ logger, httpRouter, httpAuth, opa }) {
        httpRouter.use(await createRouter({ logger, httpAuth, opa }));
      },
    });
  },
});
```

## Step 3: Use `evaluatePolicy` in your router

In `router.ts`, accept `opa` as a dependency and call `evaluatePolicy` before processing sensitive operations. Build an `input` object with whatever context your policy needs — the shape is entirely up to you and your Rego policy.

```typescript
import { OpaService } from '@parsifal-m/backstage-plugin-opa-node';
import { HttpAuthService } from '@backstage/backend-plugin-api';

interface RouterOptions {
  httpAuth: HttpAuthService;
  opa: OpaService;
  // ... other deps
}

export async function createRouter(options: RouterOptions): Promise<Router> {
  const { httpAuth, opa } = options;
  const router = Router();

  router.post('/resources', async (req, res) => {
    // Get the caller's identity
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });

    // Build the input to send to OPA — add whatever context your policy needs
    const input = {
      method: req.method,
      path: req.path,
      permission: { name: 'your-plugin.resource.create' },
      user: credentials.principal.userEntityRef,
      // e.g. body fields, headers, catalog data — whatever your policy cares about
    };

    const policyResult = await opa.evaluatePolicy(input, 'your_policy');

    if (!policyResult.result?.allow) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // Proceed with your handler logic
    res.status(201).json({ success: true });
  });

  return router;
}
```

### `evaluatePolicy` signature

```typescript
opa.evaluatePolicy<T = PolicyResult>(input: PolicyInput, entryPoint: string): Promise<T>
```

- `input`: `PolicyInput` (`Record<string, unknown>`) — this becomes `input` in Rego
- `entryPoint`: The Rego package/rule path (e.g. `'your_policy'` maps to `package your_policy`)
- Returns `Promise<T>` where `T` is the **full OPA response shape** — not just the inner policy result. `T` defaults to `PolicyResult` from `@parsifal-m/backstage-plugin-opa-common`, which is `{ decision_id?: string; result: { allow: boolean; [key: string]: unknown } }`

Use the default `PolicyResult` type when your policy returns a standard `allow` decision:

```typescript
import { PolicyResult } from '@parsifal-m/backstage-plugin-opa-common';

const policyResult = await opa.evaluatePolicy<PolicyResult>(input, 'your_policy');
if (!policyResult.result.allow) { ... }
```

For custom policy responses, name the inner rule output separately so it's clear that `T` is the full OPA response (your rule output wrapped under `result`):

```typescript
// What your Rego rule returns — the inner policy decision
type Decision = { allow: boolean; reason?: string };

// T must be the full OPA response shape: OPA wraps your rule output under `result`
const policyResult = await opa.evaluatePolicy<{ result: Decision }>(input, 'your_policy');
if (!policyResult.result.allow) { ... }
```

## Step 4: Configure the OPA connection

The `opaService` reads its config from `app-config.yaml` under the `openPolicyAgent` key.

If the user doesn't have OPA running yet, point them to the official OPA documentation — search for "OPA getting started" or "OPA deployments" on the Open Policy Agent website. It covers running OPA as a binary, Docker container, or Kubernetes sidecar.

```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
```

For local dev, run OPA in Docker:

```bash
docker run -p 8181:8181 \
  -v $(pwd)/policies:/policies \
  openpolicyagent/opa:latest run \
  --server --watch /policies
```

## Step 5: Write the Rego policy

Create a `.rego` file in your `policies/` directory. The policy package name must match the `entryPoint` string you pass to `evaluatePolicy`.

```rego
package your_policy

import rego.v1

# Default deny — be explicit about what you allow
default allow := false

# Allow when the user has the required role
allow if {
  input.permission.name == "your-plugin.resource.create"
  input.userRole == "editor"
}

# Allow read access to everyone
allow if {
  input.permission.name == "your-plugin.resource.read"
}
```

### Structuring the input

The input object shape is entirely yours to define. Common patterns:

```typescript
// Minimal
const input = {
  permission: { name: 'my-plugin.action' },
  user: credentials.principal.userEntityRef,
};

// With catalog data (fetch the user entity first)
const userEntity = await catalog.getEntityByRef(userEntityRef, { credentials });
const input = {
  permission: { name: 'my-plugin.action' },
  user: userEntity?.metadata.name,
  userRole: userEntity?.metadata?.annotations?.['my-plugin/role'],
  groups: credentials.principal.ownershipEntityRefs,
};

// With request context
const input = {
  method: req.method,
  path: req.path,
  permission: { name: 'my-plugin.action' },
  user: credentials.principal.userEntityRef,
  resourceId: req.params.id,
};
```

## Step 6: Register the backend in `packages/backend`

`opaService` has a built-in `defaultFactory` in `@parsifal-m/backstage-plugin-opa-node` — it is self-registering. You only need to add your own plugin:

```typescript
// packages/backend/src/index.ts
backend.add(import('./plugins/your-plugin-backend'));
```

## Testing

In unit tests, mock the `opa` service — don't call a real OPA server. Create a minimal mock that matches the `OpaService` interface:

```typescript
import { OpaService } from '@parsifal-m/backstage-plugin-opa-node';

function createMockOpaService(allow: boolean): OpaService {
  return {
    evaluatePolicy: jest.fn().mockResolvedValue({ result: { allow } }),
  } as unknown as OpaService;
}
```

Wire it into your router factory in tests:

```typescript
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';

describe('POST /resources', () => {
  it('returns 201 when OPA allows', async () => {
    const app = express();
    app.use(
      await createRouter({
        httpAuth: mockServices.httpAuth(),
        opa: createMockOpaService(true),
      }),
    );

    const res = await request(app).post('/resources').send({ name: 'test' });
    expect(res.status).toBe(201);
  });

  it('returns 403 when OPA denies', async () => {
    const app = express();
    app.use(
      await createRouter({
        httpAuth: mockServices.httpAuth(),
        opa: createMockOpaService(false),
      }),
    );

    const res = await request(app).post('/resources').send({ name: 'test' });
    expect(res.status).toBe(403);
  });

  it('passes the correct input to OPA', async () => {
    const opaMock = createMockOpaService(true);
    const app = express();
    app.use(
      await createRouter({ httpAuth: mockServices.httpAuth(), opa: opaMock }),
    );

    await request(app).post('/resources').send({ name: 'test' });

    expect(opaMock.evaluatePolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: { name: 'your-plugin.resource.create' },
      }),
      'your_policy',
    );
  });
});
```

### Testing the Rego policy itself

Test policies in isolation with the OPA CLI before connecting to Backstage:

```bash
echo '{"input": {"permission": {"name": "your-plugin.resource.create"}, "userRole": "editor"}}' \
  | opa eval -d policies/your_policy.rego -I 'data.your_policy.allow'
```

Or use the Rego Playground (search "OPA Rego Playground" — browser-based interactive tool from the OPA project) for quick iteration.

## Common mistakes

- **Wrong entry point**: The string passed to `evaluatePolicy` must match the Rego `package` name exactly. `'your_policy'` maps to `package your_policy`; `'my/policy'` maps to `package my.policy`.
- **Forgetting the `openPolicyAgent.baseUrl` config**: Without this, the service won't know where OPA is. Check `app-config.yaml`.
- **Expecting `@parsifal-m/plugin-opa-backend` to be required**: `opaService` has a built-in `defaultFactory` inside `@parsifal-m/backstage-plugin-opa-node` — it is self-registering and does not require `@parsifal-m/plugin-opa-backend` to be registered in the backend.
- **Checking `result.allow` before verifying `result` exists**: Always guard: `if (!policyResult.result?.allow)` — if OPA returns an unexpected shape, `result` may be undefined.
- **Sending sensitive data in the input unnecessarily**: OPA decision logs capture the full input. Avoid putting secrets, tokens, or PII in the input object.
