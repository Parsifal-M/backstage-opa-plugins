![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

# OPA Permissions Wrapper Module for Backstage

This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview).

- Instead of coding policies directly into your Backstage instance with TypeScript, create, edit and manage your policies with OPA!

- Manage your policies in a more flexible way, you can use OPA's [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/) language to write your policies.

- No need to redeploy your Backstage instance to update policies, simply update your OPA policies and you are good to go!

- Enable teams to manage their own policies, without needing to know TypeScript or the Backstage codebase!

- Use OPA to manage authorization in your backend plugins!

## Pre-requisites

> This plugin does not require the `backstage-opa-backend` plugin!

- You have a Backstage instance set up and running.
- You have deployed OPA, kindly see how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/).
- This plugin also requires and assumes that you have at least setup the permission framework (without any policies) as outlined here [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

## How It Works

This plugin allows you to do two things, the first and foremost is to use it as a way to "wrap" around the Backstage Permission Framework and use the OPA client to evaluate policies. It will send a request to OPA with the permission and identity information, OPA will then evaluate the policy and return a decision, which is then passed back to the Permission Framework, in this scenario you don't need to do anything fancy, just install it and follow the configuration steps.

- Permissions are created in the plugin in which they need to be enforced.
- The plugin will send a request to the Permission Framework backend with the permission and identity information.
- The Permission Framework backend will then forward the request to OPA with the permission and identity information.
- OPA will evaluate the the information against the policy and return a decision.

You can also use the `evaluatePolicy` function in your backend plugins to evaluate policies. This is useful if you want a bit more flexibility in how you pass the information to OPA and evaluate the policy. You can see an example of this in the [backend demo plugin](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/plugins/opa-demo-backend/src/router.ts).

````typescript

## Installation

```bash
yarn --cwd packages/backend add @parsifal-m/plugin-permission-backend-module-opa-wrapper
````

Make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
```

The plugin will automatically register the OPA permission policy to handle all permission requests through OPA.

## Configuration

The OPA client requires configuration to connect to the OPA server. You need to provide a `baseUrl` and an `entrypoint` for the OPA server in your Backstage app-config.yaml file:

```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policy:
      policyEntryPoint: 'rbac_policy/decision'
```

The `baseUrl` is the URL of the OPA server, and the `policyEntryPoint` is the entrypoint of the policy you want to evaluate.

You can optionally provide an entrypoint when calling the `evaluatePermissionsFrameworkPolicy` method, which will override the entrypoint provided in the config. This allows for more flexibility in policy evaluation if you need it.

If you do not override the entrypoint, the entrypoint provided in the config will be used.

### Fallback policy

Two basic fallback policies are provided in the plugin, `allow` and `deny`. You can set the fallback policy in the `app-config.yaml` file with the `policyFallbackDecision` key:

```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policy:
      policyEntryPoint: 'rbac_policy/decision'
      policyFallbackDecision: 'deny'
```

The previous example would return a `DENY` decision to any request if the OPA server is not reachable.
If the value is set to any value other than `allow` or `deny`, the plugin will throw an error if the OPA server is not reachable. The values are case-insensitive.

## An Example Policy and Input

An example policy in OPA might look like this, keep in mind you could also use [bundles](https://www.openpolicyagent.org/docs/latest/management-bundles/) to manage your policies and keep the `conditions` object in a `data.json` file.

We use entrypoints to specify which rule to evaluate. The plugin expects the OPA response to contain a `result` object with the policy decision. This means you do not have to use `decision` as shown below - you can use any rule name you want as long as it returns the expected structure.

```rego
package backstage_policy

import future.keywords.if

# Helper method for constructing a conditional decision
CONDITIONAL(plugin_id, resource_type, conditions) := conditional_decision if {
 conditional_decision := {
  "result": "CONDITIONAL",
  "pluginId": plugin_id,
  "resourceType": resource_type,
  "conditions": conditions,
 }
}

default decision := {"result": "DENY"}

permission := input.permission.name

claims := input.identity.claims

decision := {"result": "ALLOW"} if {
 permission == "catalog.entity.read"
}

decision := CONDITIONAL("catalog", "catalog-entity", {"anyOf": [{
 "resourceType": "catalog-entity",
 "rule": "IS_ENTITY_OWNER",
 "params": {"claims": claims},
}]}) if {
 permission == "catalog.entity.delete"
}

decision := CONDITIONAL("catalog", "catalog-entity", {"anyOf": [{
 "resourceType": "catalog-entity",
 "rule": "IS_ENTITY_KIND",
 "params": {"kinds": ["Component"]},
}]}) if {
 permission == "catalog.entity.update"
}
```

The input sent from Backstage looks like this:

```typescript
export type PermissionsFrameworkPolicyInput = {
  permission: {
    name: string;
  };
  identity?: {
    user: string | undefined;
    claims: string[];
  };
};
```

It will then return either just an allow decision or both an allow decision and a conditions object if the rule is conditional.

## Using `evaluatePolicy`

A good way to see this in action is to look at the [backend demo plugin](../opa-demo-backend/src/router.ts). This plugin uses the `evaluatePolicy` function to evaluate policies.

Note, we always assume that the user is authenticated at this point, OPA does not handle authentication, it only handles authorization.

```typescript
router.post('/todos', async (_req, res) => {
  // Get the credentials from the request
  const credentials = await httpAuth.credentials(_req, { allow: ['user'] });

  // The entrypoint of the policy
  const entryPoint = 'opa_demo';

  // Create the input object (this is what will be sent to OPA)
  const input = {
    method: _req.method,
    path: _req.path,
    headers: _req.headers,
    credentials: credentials,
    permission: { name: 'post-todo' },
    plugin: 'opa-demo-backend-todo',
    dateTime: new Date().toISOString(),
  };

  try {
    const parsed = todoSchema.safeParse(_req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    // Evaluate the policy
    const policyResult = await opaClient.evaluatePolicy(input, entryPoint);

    // If the policy does not allow the request, return a 403 (or handle it however you want)
    if (!policyResult.result || !policyResult.result.allow) {
      return res.status(403).json({ error: 'Access Denied' });
    }

    // If the policy allows the request, create the todo
    const result = await todoListService.createTodo(parsed.data);
    return res.status(201).json(result);
  } catch (error: unknown) {
    if (logger) {
      logger.error(
        `An error occurred while sending the policy input to the OPA server: ${error}`,
      );
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

## Contributing

I am happy to accept contributions and suggestions for this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal)

## Ecosystem

- [PlaTT Policy Template](https://github.com/ap-communications/platt-policy-template) contains policy templates that will work with the [plugin-permission-backend-module-opa-wrapper](./plugins/permission-backend-module-opa-wrapper/README.md) plugin!

## License

This project is released under the Apache 2.0 License.
