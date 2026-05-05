---
sidebar_position: 3
---

# Local Development

`@parsifal-m/backstage-plugin-opa-authz-react` includes a standalone dev app so you can develop and test the components and hooks without running Backstage, the OPA backend plugin, or a live OPA server.

## What the dev app actually tests

The dev app mocks the response that `backstage-opa-backend` would return after evaluating a policy against OPA. The real request path in production is:

```
RequireOpaAuthz / useOpaAuthz
  → OpaAuthzClientReact
    → backstage-opa-backend (/api/opa/opa-authz)
      → OPA server
```

The mock stubs the entire chain at the `OpaAuthzApi` boundary, so what you are testing is **component behaviour given a decision** — does `RequireOpaAuthz` show or hide its children correctly, does `useOpaAuthz` return the right loading/data/error states. You are not testing policy logic or the backend plugin here, and that is intentional.

For end-to-end testing of the full request path, use the complete Backstage dev setup (`yarn dev` from the repo root).

## Starting the dev app

```bash
yarn workspace @parsifal-m/backstage-plugin-opa-authz-react start
```

This starts a dev server at [http://localhost:3000](http://localhost:3000) with an `/opa-authz` page. No other processes required.

## What the dev page shows

| Section                   | Mocked backend response | Expected result             |
| ------------------------- | ----------------------- | --------------------------- |
| `RequireOpaAuthz` — allow | `{ allow: true }`       | Children rendered           |
| `RequireOpaAuthz` — deny  | `{ allow: false }`      | Children hidden (null)      |
| `useOpaAuthz` hook output | `{ allow: true }`       | Raw result object displayed |

Each section uses `TestApiProvider` to inject its own mock scoped to that part of the page, so both states are visible simultaneously.

## How the mock is wired up

The dev app lives in `dev/index.tsx`. Two mock implementations satisfy the `OpaAuthzApi` interface — the same shape that `backstage-opa-backend` returns:

```ts
const mockAllow: OpaAuthzApi = {
  async evalPolicy(): Promise<PolicyResult> {
    return { result: { allow: true } };
  },
};

const mockDeny: OpaAuthzApi = {
  async evalPolicy(): Promise<PolicyResult> {
    return { result: { allow: false } };
  },
};
```

`TestApiProvider` scopes each mock to a section of the page:

```tsx
<TestApiProvider apis={[[opaAuthzBackendApiRef, mockAllow]]}>
  <RequireOpaAuthz input={{ action: 'view' }} entryPoint="my_policy">
    <p>Visible when the backend returns allow: true</p>
  </RequireOpaAuthz>
</TestApiProvider>
```

To simulate latency, error states, or additional fields in the result, edit the mock implementations directly in `dev/index.tsx`.
