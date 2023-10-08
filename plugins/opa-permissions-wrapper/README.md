# OPA Permissions Wrapper for Backstage

This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the Backstage Permission Framework. The wrapper provides a way to evaluate permissions using OPA, allowing for fine-grained access control and customized policies for your Backstage instance.

### **Please Note! This project is still in development and is not yet ready for production use.**

> This wrapper is still in **development**, you can use it at your own risk. It is not yet ready for production use.

## Pre-requisites

- This plugin requires the [opa-backend](../opa-backend/README.md) plugin to be installed and configured.
- This plugin also requires and assumes that you have set up and followed the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

## Key Components

- `opa-evaluator/createOpaPermissionEvaluator`: A factory function for creating an asynchronous OPA policy evaluation function.
- `opa-client/opaClient.ts`: Provides the OpaClient class for communication with the OPA server.
- `permission-handler/permissionHandler.ts`: Contains the PermissionsHandler class that integrates the OPA client and policy evaluation within Backstage's permission framework.

To integrate this OPA wrapper with your Backstage instance, you need to first follow the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

Then, make the following changes to the `packages/backend/src/plugins/permission.ts` file in your Backstage project. (Replace the existing contents of the file with the following)

```typescript
import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express-serve-static-core';
import { PluginEnvironment } from '../types';
import {
  OpaClient,
  PermissionsHandler,
} from '@parsifal-m/opa-permissions-wrapper';

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
opaClient:
    baseUrl: 'http://localhost:8181'
    policies:
      entityChecker: # Entity checker plugin
        package: 'entitymeta'
      catalogPermission: # Permission wrapper plugin
        package: 'catalog_policy'
      scaffolderTemplatePermission:
        package: 'scaffolder_template_policy'
      scaffolderActionPermission:
        package: 'scaffolder_action_policy'
```

Replace the `baseUrl` with the URL of your OPA server and 'catalog_policy' with the OPA policy package containing your catalog policies.

## An Example Policy and Input

An example policy in OPA might look like this, keep in mind you could also use [bundles](https://www.openpolicyagent.org/docs/latest/management-bundles/) to manage your policies and keep the `conditions` object in a `data.json` file.

```rego
package catalog_policy

# Default decisions
default allow = true
default conditional = false

# Allow and set conditions if the user is a maintainer
allow {
    is_maintainer
}

conditional = true {
    is_maintainer
}

# conditions structure (this is for conditional catalog descisions)
condition = {
    "anyOf": [{
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_KIND",
        "params": {
            "kinds": ["API"]
        },
    }]
} { is_maintainer }

# Helper rule to check if the identity is a maintainer
is_maintainer {
    user_group := input.identity.groups[_]
    user_group == "group:default/justice_league"
}

allow = false {
    user_group := input.identity.groups[_]
    user_group == "group:default/maintainers"
}
```

The input sent from Backstage looks like this:

```typescript
const input: PolicyEvaluationInput = {
  input: {
    permission: {
      type: type,
      name: name,
      action: action,
      resourceType: resourceType,
    },
    identity: {
      username: userName,
      groups: userGroups,
    },
  },
};
```

It will then return either just an allow decision or both an allow decision and a conditions object if the rule is conditional.

## Contributing

I am happy to accept contributions and suggestions for this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal) or [Twitter](https://twitter.com/_PeterM_) (I am not as active on Twitter)

## License

This project is released under the Apache 2.0 License.
