# Quick Start

This guide walks you through installing and configuring the OPA Backend plugin in your Backstage instance.

## Prerequisites

- A running OPA server. See [Deploying OPA](../deploying-opa/deploying-opa.md) for a guide on running OPA as a sidecar to Backstage, or the [OPA deployment docs](https://www.openpolicyagent.org/docs/latest/deployments/) for other options.

## Step 1 — Install the package

```bash
yarn --cwd packages/backend add @parsifal-m/plugin-opa-backend
```

## Step 2 — Register the plugin

Add the plugin to `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins
backend.add(import('@parsifal-m/plugin-opa-backend'));

backend.start();
```

## Step 3 — Configure `app-config.yaml`

Add the `openPolicyAgent` block to your `app-config.yaml`. Only enable the features you actually need.

```yaml
openPolicyAgent:
  # Base URL of your OPA server. Required for all routes that call OPA.
  baseUrl: 'http://localhost:8181'

  entityChecker:
    # Set to true to enable the /api/opa/entity-checker route.
    # Required by the opa-entity-checker frontend plugin.
    enabled: true
    # Entry point in your Rego policy that returns violation messages.
    # Maps to: package entity_checker, rule violation
    policyEntryPoint: 'entity_checker/violation'

  policyViewer:
    # Set to true to enable the /api/opa/get-policy route.
    # Required by the opa-policies frontend plugin.
    enabled: true
```

> **Note:** The `/api/opa/opa-authz` route (used by `opa-authz-react`) is **always mounted** — no `enabled` flag is needed. All other routes are disabled by default.

> **Note:** `policyEntryPoint` is required when `entityChecker.enabled` is `true`. If it is missing, the plugin will return a 500 error when the `/api/opa/entity-checker` endpoint is called.

## Step 4 — Verify

With your Backstage backend running, confirm the plugin is healthy:

```bash
curl http://localhost:7007/api/opa/health
# {"status":"ok"}
```

## Next steps

- [Reference](./reference.md) — full config key and HTTP endpoint documentation
- [OPA Entity Checker](../opa-entity-checker/quick-start.md) — set up entity validation
- [OPA Authz React](../opa-authz-react/introduction.md) — add UI authorization
- [OPA Policies](../opa-policies/introduction.md) — display Rego policies on entity pages
