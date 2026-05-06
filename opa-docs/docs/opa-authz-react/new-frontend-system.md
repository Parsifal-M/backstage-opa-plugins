---
sidebar_position: 2
---

# New Frontend System Support

`@parsifal-m/backstage-plugin-opa-authz-react` supports both the **legacy** and **new** Backstage frontend systems via a dual entry point. The main entry point (`@parsifal-m/backstage-plugin-opa-authz-react`) is for legacy apps. The `./alpha` subpath is for new frontend system apps.

:::info

The `./alpha` entry is stable enough for production use but is versioned separately. Breaking changes to the new-system API will be communicated via changesets.

:::

## What the `./alpha` entry exports

| Export                  | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `opaAuthzApi`           | `ApiBlueprint` — registers `OpaAuthzClientReact` with the new system |
| `RequireOpaAuthz`       | Same component as the main entry                                     |
| `useOpaAuthz`           | Same hook as the main entry                                          |
| `useOpaAuthzManual`     | Same hook as the main entry                                          |
| `opaAuthzBackendApiRef` | Same API ref as the main entry                                       |
| `OpaAuthzClientReact`   | Same client class as the main entry                                  |

## Installation

```bash
yarn add --cwd packages/app @parsifal-m/backstage-plugin-opa-authz-react

# Install backend plugin if not already installed
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

## Registering the API

In the new frontend system, there is no `apis.ts`. Instead, add the `opaAuthzApi` blueprint to the `extensions` array of the plugin (or app module) where you need it.

### Option A: Inside your own plugin

```ts
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { opaAuthzApi } from '@parsifal-m/backstage-plugin-opa-authz-react/alpha';

export default createFrontendPlugin({
  pluginId: 'my-plugin',
  extensions: [
    opaAuthzApi,
    // ...your other extensions
  ],
});
```

### Option B: Via an app module

If you want to register the API once at the app level so any plugin can use it:

```ts
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { opaAuthzApi } from '@parsifal-m/backstage-plugin-opa-authz-react/alpha';

export default createFrontendModule({
  pluginId: 'app',
  extensions: [opaAuthzApi],
});
```

Then add the module to your app's `features` array in `App.tsx`.

## Using the components and hooks

Import from `./alpha` instead of the main entry point:

```tsx
import {
  RequireOpaAuthz,
  useOpaAuthz,
} from '@parsifal-m/backstage-plugin-opa-authz-react/alpha';
```

The components and hooks work identically to the legacy system — no behaviour changes.

```tsx
function MyProtectedComponent() {
  return (
    <RequireOpaAuthz
      input={{ action: 'read-policy', resource: 'catalog' }}
      entryPoint="authz"
    >
      <div>Only visible if OPA allows it</div>
    </RequireOpaAuthz>
  );
}
```

## Differences from the legacy setup

| Legacy (`apis.ts`)                      | New frontend system (`./alpha`)                         |
| --------------------------------------- | ------------------------------------------------------- |
| `createApiFactory(...)` in `apis.ts`    | `opaAuthzApi` added to plugin `extensions`              |
| Import from main entry point            | Import from `./alpha` subpath                           |
| API registered globally for all plugins | API scoped to the plugin or app module that declares it |

## Backend requirement

The OPA Authz React plugin makes requests to the OPA backend plugin at the `/opa-authz` route. You still need the backend plugin installed and running:

```ts
// packages/backend/src/index.ts
backend.add(import('@parsifal-m/plugin-opa-backend'));
```

See the [OPA Backend documentation](../opa-backend/introduction) for full setup details.
