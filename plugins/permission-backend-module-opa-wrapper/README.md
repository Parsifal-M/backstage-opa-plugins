![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

# OPA Permissions Module for Backstage

This project integrates [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) with the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview) to enable policy-based access control.

- **External Policy Management**: Define and manage authorization policies using OPA's [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/) language instead of hardcoding them in TypeScript

- **Dynamic Policy Updates**: Update your access control policies without redeploying Backstage - simply update your OPA policies and they take effect immediately

- **Developer-Friendly**: Enable teams to manage their own authorization policies without requiring deep knowledge of Backstage internals or TypeScript

- **Permissions Framework Integration**: Seamlessly integrates with Backstage's existing permission system for consistent authorization across all core plugins

## Pre-requisites

> This plugin does not require the `backstage-opa-backend` plugin!

- You have a Backstage instance set up and running.
- You have deployed OPA, kindly see how to do that by checking out [Deploying OPA](https://www.openpolicyagent.org/docs/latest/deployments/).
- This plugin also requires and assumes that you have at least setup the permission framework (without any policies) as outlined here [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

## How It Works

This plugin is designed to enable Backstage adopters to use OPA in conjunction with Backstage's permissions framework. It integrates seamlessly with the Backstage Permission Framework by forwarding permission evaluation requests to your OPA server and returning the policy decisions back to the framework.

- Permissions are created in the plugin in which they need to be enforced.
- The plugin will send a request to the Permission Framework backend with the permission and identity information.
- The Permission Framework backend will then forward the request to OPA with the permission and identity information.
- OPA will evaluate the the information against the policy and return a decision.

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

## Contributing

I am happy to accept contributions and suggestions for this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal)

## Ecosystem

- [PlaTT Policy Template](https://github.com/ap-communications/platt-policy-template) contains policy templates that will work with the [plugin-permission-backend-module-opa-wrapper](./plugins/permission-backend-module-opa-wrapper/README.md) plugin!

## License

This project is released under the Apache 2.0 License.
