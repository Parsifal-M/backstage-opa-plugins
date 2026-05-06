# Local Development

`@parsifal-m/plugin-opa-entity-checker` includes a standalone dev app so you can work on the plugin without running a full Backstage instance, the OPA backend plugin, or a live OPA server.

## Prerequisites

- Node 22 or 24
- Dependencies installed: `yarn install --immutable`

## Starting the plugin

```bash
yarn workspace @parsifal-m/plugin-opa-entity-checker start
```

This starts a dev server at [http://localhost:3000](http://localhost:3000). No other processes required.

The dev app mocks the `OpaBackendApi` and entity context so you can develop and test the card component in isolation. For end-to-end testing of the full request path, use the full Backstage dev setup (`yarn dev` from the repo root).
