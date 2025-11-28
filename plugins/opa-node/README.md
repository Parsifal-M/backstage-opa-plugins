
# @parsifal-m/backstage-plugin-opa-node

This package provides a Node.js service for integrating Open Policy Agent (OPA) with Backstage plugins and backends.

## Pre-requisites

Simply run the yarn install command to add the package to your plugin:

```bash
yarn add @parsifal-m/backstage-plugin-opa-node
```

Add the dependency in your `plugin.ts` or `module.ts` file:

```ts
import { opaService } from '@parsifal-m/backstage-plugin-opa-node';

export const yourPlugin = createBackendPlugin({
  pluginId: 'your-plugin-id',
  register(env) {
    env.registerInit({
      deps: {
        // other dependencies...
        userInfo: coreServices.userInfo,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        // We add the OPA service as a dependency this will allow the plugin to use it
        opa: opaService,
      },
      async init({
        // other dependencies...
        opa,
      }) {
        httpRouter.use(
          await createRouter({
            // other dependencies...
            opa,
          }),
        );
      },
    });
  },
});
```

## What does it do?

- Allows Backstage plugins and backend services to evaluate authorization and policy decisions using OPA.
- Provides a simple API for sending policy inputs and receiving policy results from OPA.
- Supports custom policy entry points and flexible input structures for fine-grained access control.
- Enables centralized, declarative policy management for your Backstage environment.

## Features

- Easy integration with Backstage backend plugins
- Type-safe policy input and result handling

## Getting Started

I've set up a demo backend plugin that shows how to use this package to protect your backend endpoints using OPA. You can find it here: [opa-backend-demo](../opa-demo-backend/README.md)

If you check our the `router.ts` file in that plugin, you'll see how to use the `OpaService` to evaluate policies before allowing access to certain endpoints.
