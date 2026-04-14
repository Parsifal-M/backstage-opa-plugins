---
name: opa-authz-react
description: Add or modify frontend OPA authorization in a Backstage React plugin using RequireOpaAuthz or useOpaAuthz. Use this skill whenever the user wants to hide/show UI components based on OPA policy decisions, gate frontend elements behind an authorization check, use the useOpaAuthz hook for custom auth flows, wire up the OpaAuthzClientReact API factory, write a Rego policy for frontend authorization, or test OPA-gated components. Trigger on phrases like "hide component", "show button if allowed", "frontend OPA", "RequireOpaAuthz", "useOpaAuthz", "gate UI with OPA", or any time the user is working with `@parsifal-m/backstage-plugin-opa-authz-react`.
---

# OPA Authz React — Frontend Authorization for Backstage

This skill covers installing, wiring, and using `@parsifal-m/backstage-plugin-opa-authz-react` to control UI visibility with OPA policy decisions. It also covers testing and writing the Rego policy.

> **Note:** This package is still in active development and may have breaking changes. Pin a specific version in production.

> **Legacy frontend system only:** This plugin is built against the old Backstage frontend system (`@backstage/core-plugin-api`, `createPlugin`, `apis.ts` factory registration). It has **not** been migrated to the new frontend system (`@backstage/frontend-plugin-api`, `createFrontendPlugin`, extension-based config). Do not attempt to use it in a new frontend system app — it may not work. If the user's app has already migrated, flag this blockers and advise them to check for a migration or contribute one.

## How it works

The library calls the OPA backend plugin (`@parsifal-m/plugin-opa-backend`) via Backstage's proxy layer (`plugin://opa/opa-authz`). Components send a custom `input` object + an `entryPoint` string to OPA, and OPA returns `{ result: { allow: true|false } }`. The component hides its children when `allow` is `false`, when loading, or when there is an error.

This is distinct from the Permissions Wrapper Module:

|               | `opa-authz-react`          | Permissions Wrapper                 |
| ------------- | -------------------------- | ----------------------------------- |
| Where it runs | Frontend (React)           | Backend (Permission Framework)      |
| Controls      | UI visibility              | API-level authorization             |
| Input shape   | Anything you want          | Fixed: `permission` + `identity`    |
| Use when      | Hiding/showing UI elements | Enforcing backend permission checks |

Both can coexist — use the Permissions Wrapper for backend enforcement and this library for fine-grained UI control.

## Step 1: Prerequisites

The `backstage-opa-backend` plugin must be installed and running — it handles the actual OPA evaluation call. If it's not set up, follow the `opa-service-integration` skill first.

## Step 2: Install packages

```bash
# Frontend plugin
yarn add --cwd packages/app @parsifal-m/backstage-plugin-opa-authz-react

# Backend plugin (if not already installed)
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

## Step 3: Register the API factory

In `packages/app/src/apis.ts`, register `OpaAuthzClientReact`:

```typescript
import {
  OpaAuthzClientReact,
  opaAuthzBackendApiRef,
} from '@parsifal-m/backstage-plugin-opa-authz-react';
import { fetchApiRef, createApiFactory } from '@backstage/core-plugin-api';

export const apis: AnyApiFactory[] = [
  // ... existing factories ...
  createApiFactory({
    api: opaAuthzBackendApiRef,
    deps: { fetchApi: fetchApiRef },
    factory: ({ fetchApi }) => new OpaAuthzClientReact({ fetchApi }),
  }),
];
```

This is required once per app — not per plugin that uses it.

## Step 4: Use in components

### Option A: `RequireOpaAuthz` component (recommended)

Wraps children — renders them only when OPA returns `allow: true`. On loading or error, renders nothing (no flash, no error state shown to user).

```tsx
import { RequireOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

function MyComponent() {
  return (
    <RequireOpaAuthz
      input={{ action: 'delete-entity', resource: 'catalog' }}
      entryPoint="rbac"
    >
      <DeleteButton />
    </RequireOpaAuthz>
  );
}
```

Props:

- `input` — any JSON object, becomes `input` in Rego
- `entryPoint` — Rego package name to evaluate
- `children` — rendered when `allow: true`
- `errorPage` _(optional)_ — rendered on error instead of null

### Option B: `useOpaAuthz` hook (when you need custom logic)

Use when you need to branch on loading/error states, or use the policy result to drive more than just visibility.

```tsx
import { useOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

function EntityActions() {
  const { loading, data, error } = useOpaAuthz(
    { action: 'delete', entityRef: 'component:default/my-service' },
    'catalog_policy',
  );

  if (loading) return <Skeleton />;
  if (error) return <Alert severity="error">Permission check failed</Alert>;
  if (!data?.result.allow) return null;

  return <DeleteButton />;
}
```

Returns `{ loading: boolean, data: PolicyResult | null, error?: Error }`.

### Option C: `useOpaAuthzManual` hook (on-demand evaluation)

Use when you only want to evaluate the policy in response to a user action — not on mount. Returns the same shape as `useOpaAuthz` plus an `evaluatePolicy()` function.

```tsx
import { useOpaAuthzManual } from '@parsifal-m/backstage-plugin-opa-authz-react';

function ConfirmDeleteDialog({ entityRef }: { entityRef: string }) {
  const { loading, data, evaluatePolicy } = useOpaAuthzManual(
    { action: 'delete', entityRef },
    'catalog_policy',
  );

  const handleConfirmClick = async () => {
    await evaluatePolicy();
    if (data?.result.allow) {
      // proceed with delete
    }
  };

  return (
    <Button onClick={handleConfirmClick} disabled={loading}>
      Confirm Delete
    </Button>
  );
}
```

## Step 5: Write the Rego policy

The policy must return `{ "allow": true|false }` at the evaluated entry point. The `input` in Rego is whatever object you passed to the component.

```rego
package rbac

import rego.v1

default allow := false

# Allow admins to delete anything
allow if {
  input.action == "delete-entity"
  "group:default/admins" in input.claims
}

# Allow all users to read
allow if {
  input.action == "read-entity"
}
```

The entry point string you pass to the component maps to the Rego package: `"rbac"` → `package rbac`, `"catalog/authz"` → `package catalog.authz`.

### Structuring the input

Pass whatever context the policy needs. Common patterns:

```tsx
// Action + resource
input={{ action: 'deploy', environment: 'production' }}

// Entity context (from useEntity hook)
const { entity } = useEntity();
input={{ action: 'delete', entityRef: entity.metadata.name, entityKind: entity.kind }}

// Time-based (evaluated client-side, sent to OPA)
input={{ action: 'deploy', hour: new Date().getHours(), isWeekday: [1,2,3,4,5].includes(new Date().getDay()) }}

// User groups (if available in frontend context)
input={{ action: 'admin-action', claims: identityApi.getBackstageIdentity().ownershipEntityRefs }}
```

## Testing

### Testing `RequireOpaAuthz`

Mock `useOpaAuthz` directly — don't call through to the API:

```tsx
import { screen, waitFor } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { RequireOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';
import { opaAuthzBackendApiRef } from '@parsifal-m/backstage-plugin-opa-authz-react';
import { useOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

jest.mock('@parsifal-m/backstage-plugin-opa-authz-react', () => ({
  ...jest.requireActual('@parsifal-m/backstage-plugin-opa-authz-react'),
  useOpaAuthz: jest.fn(),
}));

const mockApi = {
  evalPolicy: jest.fn().mockResolvedValue({ result: { allow: true } }),
};

it('renders children when allow is true', async () => {
  (useOpaAuthz as jest.Mock).mockReturnValue({
    loading: false,
    data: { result: { allow: true } },
  });

  renderInTestApp(
    <TestApiProvider apis={[[opaAuthzBackendApiRef, mockApi]]}>
      <RequireOpaAuthz input={{ action: 'read' }} entryPoint="rbac">
        <div>Protected Content</div>
      </RequireOpaAuthz>
    </TestApiProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

it('renders nothing when allow is false', async () => {
  (useOpaAuthz as jest.Mock).mockReturnValue({
    loading: false,
    data: { result: { allow: false } },
  });

  renderInTestApp(
    <TestApiProvider apis={[[opaAuthzBackendApiRef, mockApi]]}>
      <RequireOpaAuthz input={{ action: 'delete' }} entryPoint="rbac">
        <div>Protected Content</div>
      </RequireOpaAuthz>
    </TestApiProvider>,
  );

  await waitFor(() => {
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
```

### Testing `useOpaAuthz` hook directly

Mock `useApi` to inject a fake `evalPolicy`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@backstage/core-plugin-api';
import { useOpaAuthz } from '@parsifal-m/backstage-plugin-opa-authz-react';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

it('returns allow:true from policy', async () => {
  (useApi as jest.Mock).mockReturnValue({
    evalPolicy: jest.fn().mockResolvedValue({ result: { allow: true } }),
  });

  const { result } = renderHook(() =>
    useOpaAuthz({ action: 'read', resource: 'catalog' }, 'rbac'),
  );

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ result: { allow: true } });
  });
});
```

## Common mistakes

- **API factory not registered**: If `opaAuthzBackendApiRef` is missing from `apis.ts`, all hooks throw at runtime. Register it once in `packages/app/src/apis.ts`.
- **Backend plugin not running**: The client calls `plugin://opa/opa-authz` — if `backstage-opa-backend` isn't registered, all policy evaluations will fail silently (component renders nothing).
- **Wrong entry point**: `"rbac"` → `package rbac`. `"my/policy"` → `package my.policy`. Mismatch → OPA returns empty result → `allow` is undefined → component renders nothing.
- **Nesting `RequireOpaAuthz` without intent**: Each instance makes its own OPA call. Avoid deep nesting on hot render paths — batch checks into a single `useOpaAuthz` call with a richer input if performance matters.
- **Using with new frontend system**: Plugin targets legacy system only. `createApiFactory` + `apis.ts` registration does not exist in new frontend system apps. If the user is on the new frontend system (`createFrontendPlugin`, extension-based config), this library cannot be used as-is — no workaround until it is migrated.
- **Relying on hide-only security**: `RequireOpaAuthz` hides UI — it does not block API calls. Always pair with backend enforcement (Permissions Wrapper or `opaService`) for actual security.
