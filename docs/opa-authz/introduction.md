# OPA Authz

> [!TIP|style:flat]
> This plugin can be used together with [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) which may be necessary for some **core** and **community plugins**.

This is a node-library package for Backstage that provides a client for interacting with an OPA (Open Policy Agent) server for Authorization.

## Why use this library?

The [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) is a great way to integrate OPA with Backstage, but it has some limitations, because it is tightly coupled with the Backstage permissions framework sometimes
you need to add a little more information to your policy input which is not available or possible in the wrapper.

This library is a more generic way to interact with OPA, and can be used in any part of the Backstage application, and is not tied to the permissions framework in any way, meaning:

- You can still protect your API endpoints with OPA, but you can also use OPA for other things, like controlling the visibility of components in the frontend.
- You are not limited in terms of what you can send as input to OPA, want to restrict access to something in Backstage based on the time of day? You can do that with this library.
- You can still use [plugin-permission-backend-module-opa-wrapper](https://parsifal-m.github.io/backstage-opa-plugins/#/opa-permissions-wrapper-module/introduction) in conjunction with this library,
  not all core and community plugins will natively work with this client, so you can use the wrapper to handle those cases.

## Usage

### Using the OpaAuthzClient

The `OpaAuthzClient` allows you to interact with an Open Policy Agent (OPA) server to evaluate policies against given inputs.

Remember that you can also use the [HttpAuthService](https://backstage.io/docs/backend-system/core-services/http-auth) and [UserInfoService](https://backstage.io/docs/backend-system/core-services/user-info) if you want to pass additional information to OPA during policy evaluation!

```typescript
import express from 'express';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import { LoggerService, HttpAuthService } from '@backstage/backend-plugin-api';
import { OpaAuthzClient } from '@parsifal-m/backstage-opa-authz';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
};

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;
  const router = Router();

  // Initialize the OPA client
  const opaAuthzClient = new OpaAuthzClient(logger, config);
  const entryPoint = 'opa_demo';

  router.get('/todos', async (_req, res) => {
    // Define the policy input
    const input = {
      method: _req.method,
      path: _req.path,
      headers: _req.headers,
    };

    try {
      // Evaluate the policy
      const policyResult = await opaAuthzClient.evaluatePolicy(
        input,
        entryPoint,
      );

      if (!policyResult.result || policyResult.result.allow !== true) {
        return res.status(403).json({ error: 'Access Denied' });
      }

      // If allowed, proceed with the actual API call
      const todos = await todoListService.listTodos();
      return res.json(todos);
    } catch (error: unknown) {
      logger.error(`Policy evaluation error: ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
```

## Example Demo Plugin(s)

To help visualize how this library can be used, we have created a demo plugin that demonstrates how to use the `opaAuthzMiddleware` in the backend, you can find the demo code [here](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/plugins/opa-demo-backend/src/router.ts).

## Join The Community

This project is a part of the broader Backstage and Open Policy Agent ecosystems. Explore more about these communities:

- [Backstage Community](https://backstage.io)
- [Open Policy Agent Community](https://www.openpolicyagent.org)
- [Styra](https://www.styra.com)
- [Join OPA on Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## Get Involved

Your contributions can make this plugin even better. Fork the repository, make your changes, and submit a PR! If you have questions or ideas, reach out on [Mastodon](https://hachyderm.io/@parcifal).

## License

This project is licensed under the Apache 2.0 License.
