# OPA Wrapper for Backstage Permissions
This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the Backstage Permission Framework. The wrapper provides a way to evaluate permissions using OPA, allowing for fine-grained access control and customized policies for your Backstage instance.

### **Please Note! This project is still in development and is not yet ready for production use.**

>This wrapper is still in **development**, you can use it at your own risk. It is not yet ready for production use.

## Key Components
- `catalog-policies/policies.ts`: Contains the implementation of the catalogPermissions function, which evaluates the permissions using the OPA client.
- `opa-client/opaClient.ts`: Provides the OpaClient class that handles communication with the OPA server to evaluate policies.
- `permission-handler/permissionHandler.ts`: Contains the PermissionsHandler class that wraps the OPA client and handles policy evaluation requests.
  Integrating with Backstage

To integrate this OPA wrapper with your Backstage instance, you need to first follow the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up. 

Then, make the following changes to the `packages/backend/src/plugins/permission.ts` file in your Backstage project. (Replace the existing contents of the file with the following)

```typescript
import { createRouter } from "@backstage/plugin-permission-backend";
import { Router } from "express-serve-static-core";
import { PluginEnvironment } from "../types";
import { OpaClient, PermissionsHandler } from "../../../../plugins/opa-wrapper/src";

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  const permissionsHandler = new PermissionsHandler(opaClient, env.logger);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: permissionsHandler,
    identity: env.identity,
  });
}
```

This will create an OPA client and a permissions handler using the OPA wrapper and pass them to the Backstage Permission Framework.

## Configuration
The OPA client requires configuration to connect to the OPA server. You need to provide the baseUrl and package for the OPA server in your Backstage app-config.yaml file:

```yaml
opa-client:
  opa:
    baseUrl: http://your-opa-server-url
    policies:
      catalog:
        package: your-catalog-package
```

Replace http://your-opa-server-url with the URL of your OPA server and your-catalog-package with the OPA policy package containing your catalog policies.

## License
This project is released under the Apache 2.0 License.