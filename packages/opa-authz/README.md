# OPA Authz Client

This is a node-library package for Backstage that provides a client and middleware for interacting with an OPA (Open Policy Agent) server for Authorization.

## Why use this library?

The [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) is a great way to integrate OPA with Backstage, but it has some limitations, because it is tightly coupled with the Backstage permissions framework sometimes
you need to add a little more information to your policy input which is not available or possible in the wrapper.

This library is a more generic way to interact with OPA, and can be used in any part of the Backstage application, and is not tied to the permissions framework in any way, meaning:

- You can still protect your API endpoints with OPA, but you can also use OPA for other things, like controlling the visibility of components in the frontend.
- You are not limited in terms of what you can send as input to OPA, want to restrict access to something in Backstage based on the time of day? You can do that with this library.
- You can still use [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) in conjunction with this library,
  not all core and community plugins will natively work with this client, so you can use the wrapper to handle those cases.
- Has a middleware that can be used in the backend to protect your API endpoints, simply add it to your express routes and you are good to go.

## Usage

### Using the OpaAuthzClient

The `OpaAuthzClient` allows you to interact with an Open Policy Agent (OPA) server to evaluate policies against given inputs.

You are pretty much free to use this in any way you like in your Backstage Backend.

```typescript
import express from 'express';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from './path-to-your-client';

export type someRouteOptions = {
  logger: LoggerService;
  config: Config;
  // more options...
};
// Some code here
// ...
// Instantiate the OpaAuthzClient
const opaClient = new OpaAuthzClient(config, logger);

// Define the policy input and entry point
const policyInput = { user: 'alice', action: 'read', resource: 'document' };
const entryPoint = 'example/allow';

// Evaluate the policy
opaClient.evaluatePolicy(policyInput, entryPoint)
  .then(result => {
    console.log('Policy evaluation result:', result);
  })
  .catch(error => {
    console.error('Error evaluating policy:', error);
  });

// Some more code here
// ...
```

### Using the opaAuthzMiddleware

You'll probably want to use the `opaAuthzMiddleware` in your express routes to protect your API endpoints instead of using the `OpaAuthzClient` directly.

```typescript
import express from 'express';
import {
  OpaAuthzClient,
  opaAuthzMiddleware,
} from '@parsifal-m/backstage-opa-authz';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export type someRoutesOptions = {
  logger: LoggerService;
  config: Config;
  // more options...
};

export const someRoutes = (
  options: someRoutesOptions,
): express.Router => {
  const { logger, config } = options;
  const router = express.Router();

  // Instantiate the OpaAuthzClient
  const opaAuthzClient = new OpaAuthzClient(config, logger);

  // Define the entry point
  const entryPoint = 'authz';

  // Define the input
  const setInput = (req: express.Request) => {
    return {
      method: req.method,
      path: req.path,
      permission: { name: 'read' },
      someFoo: 'bar',
      dateTime: new Date().toISOString(),
    };
  }

  // Define the route
  router.get('/some-route', opaAuthzMiddleware(opaAuthzClient, entryPoint, setInput, logger), (req, res) => {
    res.send('Hello, World!');
  });

  return router;
};
```
