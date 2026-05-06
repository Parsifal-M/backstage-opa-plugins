# Using The Plugin In Local Development

If you are using this plugin and want to know how to use it in local development, you can follow the steps below, note that this is not the only way to do it, but how its done in this repository.

## Standalone Dev App (No Backstage Required)

`@parsifal-m/plugin-opa-entity-checker` includes a standalone dev app so you can develop and test the card component without running a full Backstage instance, the OPA backend plugin, or a live OPA server.

### What the dev app tests

The dev app mocks two things: the OPA backend API and the entity context. The real request path in production is:

```
OpaMetadataAnalysisCard
  → OpaClient
    → backstage-opa-backend (/api/opa/entity-checker)
      → OPA server
```

The mock stubs the entire chain at the `OpaBackendApi` boundary with hardcoded violation results, and provides a fake entity via `EntityProvider`. What you are testing is **component behaviour given a policy result** — do violations render at the correct severity level, do the compact and default variants display correctly, does the pass/fail chip update as expected. You are not testing policy logic or the backend here.

For end-to-end testing of the full request path, use the complete Backstage dev setup (`yarn dev` from the repo root).

### Starting the dev app

```bash
yarn workspace @parsifal-m/plugin-opa-entity-checker start
```

This starts a dev server at [http://localhost:3000](http://localhost:3000). No other processes required. Two pages are available:

| Path                      | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `/entity-checker`         | Default card variant — shows both a violated and a clean state side by side |
| `/entity-checker-compact` | Compact accordion variant — same two states                                 |

### How the mock is wired up

The dev app lives in `dev/index.tsx`. Two mock implementations satisfy the `OpaBackendApi` interface:

```ts
const mockApiWithViolations: OpaBackendApi = {
  async entityCheck(_entity) {
    return {
      good_entity: false,
      result: [
        {
          check_title: 'Tags',
          level: 'warning',
          message: 'You do not have any tags set!',
        },
        {
          check_title: 'Type',
          level: 'error',
          message: 'Incorrect component type!',
        },
        {
          check_title: 'Description',
          level: 'info',
          message: 'Consider adding a description.',
        },
      ],
    };
  },
};

const mockApiClean: OpaBackendApi = {
  async entityCheck(_entity) {
    return { good_entity: true, result: [] };
  },
};
```

`TestApiProvider` scopes each mock to its card, and `EntityProvider` supplies the entity context that `useEntity()` reads inside the component:

```tsx
<TestApiProvider apis={[[opaApiRef, mockApiWithViolations]]}>
  <EntityProvider entity={mockEntity}>
    <OpaMetadataAnalysisCard title="OPA Entity Checker (with violations)" />
  </EntityProvider>
</TestApiProvider>
```

To simulate additional violation types, error states, or latency, edit the mock implementations directly in `dev/index.tsx`.
