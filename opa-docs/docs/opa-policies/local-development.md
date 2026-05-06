---
sidebar_position: 3
---

# Local Development

`@parsifal-m/plugin-opa-policies` includes a standalone dev app so you can develop and test the component without running a full Backstage app, the OPA backend plugin, or a live OPA server.

## What the dev app actually tests

The dev app mocks two things: the OPA backend API and the entity context. The real request path in production is:

```
OpaPolicyPage
  → OpaClient
    → backstage-opa-backend (/api/opa/get-policy)
      → UrlReader (fetches the Rego file from the repo URL)
```

The mock stubs the entire chain at the `OpaBackendApi` boundary with a hardcoded Rego snippet, and provides a fake entity with the `open-policy-agent/policy` annotation set via `EntityProvider`. What you are testing is **component behaviour given a fetched policy** — does the syntax highlighter render correctly, does the copy button work, does the loading state resolve as expected. You are not testing the backend fetch or URL resolution here.

For end-to-end testing of the full request path, use the complete Backstage dev setup (`yarn dev` from the repo root).

## Starting the dev app

```bash
yarn workspace @parsifal-m/plugin-opa-policies start
```

This starts a dev server at [http://localhost:3000](http://localhost:3000) with an `/opa-policies` page. No other processes required.

## How the mock is wired up

The dev app lives in `dev/index.tsx`. A mock entity and a mock API implementation are provided via `EntityProvider` and `TestApiProvider`:

```ts
const mockOpaApi: OpaBackendApi = {
  async getPolicyFromRepo(_opaPolicy: string): Promise<OpaPolicy> {
    return {
      opaPolicyContent: `package rbac_policy
...`,
    };
  },
};
```

```tsx
<TestApiProvider apis={[[opaApiRef, mockOpaApi]]}>
  <EntityProvider entity={mockEntity}>
    <OpaPolicyPage />
  </EntityProvider>
</TestApiProvider>
```

To test loading states, error handling, or different policy content, edit the mock directly in `dev/index.tsx`. To simulate a slow backend, add a `await new Promise(r => setTimeout(r, 2000))` inside `getPolicyFromRepo` before the return.
