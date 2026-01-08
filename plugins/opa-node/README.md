# Backstage Plugin OPA Node

This package provides a Node.js service for integrating Open Policy Agent (OPA) with Backstage backend modules and plugins.

Its a nice way to secure your backend routes using OPA!

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

## What is it for?

- Allows Backstage plugins and backend services to evaluate authorization and policy decisions using OPA.
- Provides a simple API for sending policy inputs and receiving policy results from OPA.
- Supports custom policy entry points and flexible input structures for fine-grained access control.
- Enables centralized, declarative policy management for your Backstage environment.

## Simple Usage Example

Here's a minimal example of how to use `OpaService` in an Express route:

```ts
import { opaService } from '@parsifal-m/backstage-plugin-opa-node';

app.post('/my-protected-route', async (req, res) => {
  const input = {
    method: req.method,
    path: req.path,
    headers: req.headers,
    permission: { name: 'create-resource' },
    // ...other input fields
  };

  const policyResult = await opa.evaluatePolicy(input, 'my_policy_entrypoint');
  if (!policyResult.result || !policyResult.result.allow) {
    return res.status(403).json({ error: 'Access Denied' });
  }
  // Proceed with your route logic
  res.status(201).json({ success: true });
});
```

## Getting Started

I've set up a demo backend plugin that shows how to use this package to protect your backend endpoints using OPA. You can find it here: [opa-backend-demo](../opa-demo-backend/README.md)

If you check out the `router.ts` file in that plugin, you'll see how to use the `OpaService` to evaluate policies before allowing access to certain endpoints.
