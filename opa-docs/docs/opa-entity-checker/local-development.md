# Local Development

`@parsifal-m/plugin-opa-entity-checker` includes a standalone dev app so you can work on the plugin without running a full Backstage instance, the OPA backend plugin, or a live OPA server.

## Prerequisites

- Node 22 or 24
- Dependencies installed: `yarn install --immutable`

## Starting the plugin

```bash
yarn workspace @parsifal-m/plugin-opa-entity-checker start
```

This starts a dev server at [http://localhost:3000](http://localhost:3000). No other processes required. Two pages are available:

| Path                      | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `/entity-checker`         | Default card variant — violated and clean state |
| `/entity-checker-compact` | Compact accordion variant — same two states     |

The dev app mocks the `OpaBackendApi` and entity context so you can develop and test the card component in isolation.

## How the mock is wired up

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

`TestApiProvider` scopes each mock to its card, and `EntityProvider` supplies the entity context that `useEntity()` reads inside the component.

To simulate different violation types, severity levels, or error states, edit the mock implementations directly in `dev/index.tsx`.
