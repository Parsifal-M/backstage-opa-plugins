![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper) ![NPM Downloads](https://img.shields.io/npm/dw/%40parsifal-m%2Fplugin-permission-backend-module-opa-wrapper)

<img src="../../img/OpaBackstageLogo.png" align="right"
     alt="OPA Backstage Logo" width="140">

# OPA Permissions Wrapper Module for Backstage

This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the [Backstage Permission Framework](https://backstage.io/docs/permissions/overview).

- Instead of coding policies directly into your Backstage instance with TypeScript, create, edit and manage your policies in OPA.

- Manage your policies in a more flexible way, you can use OPA's [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/) language to write your policies.

- No need to redeploy your Backstage instance to update policies, simply update your OPA server and the policies will be updated!

- Enable teams to manage their own policies, without needing to know TypeScript or the Backstage codebase!

This wrapper is still in **development**, you can use it at your own risk, be aware it can change **without** notice. (although I will try to keep it as stable as possible).

## Pre-requisites

- You have a Backstage instance set up and running.
- This plugin also requires and assumes that you have set up and followed the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

## How It Works

This plugin wraps around the Backstage Permission Framework and uses the OPA client to evaluate policies. It will send a request to OPA with the permission and identity information, OPA will then evaluate the policy and return a decision, which is then passed back to the Permission Framework.

- Permissions are created in the plugin in which they need to be enforced.
- The plugin will send a request to the Permission Framework backend with the permission and identity information.
- The Permission Framework backend will then forward the request to OPA with the permission and identity information.
- OPA will evaluate the the information against the policy and return a decision.

## I am using the legacy backend system

Then, make the following changes to the `packages/backend/src/plugins/permission.ts` file in your Backstage project. You can replace the contents with something like the following, this allows for flexible policy evaluation and the ability to use multiple OPA policies for different resource types.

```typescript
import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express-serve-static-core';
import { PluginEnvironment } from '../types';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { PolicyDecision } from '@backstage/plugin-permission-common';
import {
  OpaClient,
  policyEvaluator,
} from '@parsifal-m/plugin-permission-backend-module-opa-wrapper';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);

  const opaRbacPolicy = policyEvaluator(opaClient, env.logger);

  class OpaPermissionPolicy implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      return await opaRbacPolicy(request, user);
    }
  }

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new OpaPermissionPolicy(),
    identity: env.identity,
  });
}
```

This will replace the default permission evaluation with the OPA client. The OPA client will then evaluate the policy and return a decision.

## I am using the new backend system

Then, make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```diff
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
+ backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
```

The policy that will be used can be found in `plugins/permission-backend-module-opa-wrapper/src/policy.ts`. It will simply forward all permission requests to OPA.

## Configuration

The OPA client requires configuration to connect to the OPA server. You need to provide a `baseUrl` and an `entrypoint` for the OPA server in your Backstage app-config.yaml file:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      package: 'entity_checker'
    permissions: # Permission wrapper plugin
      entrypoint: 'rbac_policy/decision'
```

The `baseUrl` is the URL of the OPA server, and the `entrypoint` is the entrypoint of the policy you want to evaluate.

It is also possible to provide an entrypoint to the `policyEvaluator` function, this will override the entrypoint provided in the config. This allows for more flexibility in policy evaluation (if you need it).

If you do not override the entrypoint, the entrypoint provided in the config will be used.

## An Example Policy and Input

An example policy in OPA might look like this, keep in mind you could also use [bundles](https://www.openpolicyagent.org/docs/latest/management-bundles/) to manage your policies and keep the `conditions` object in a `data.json` file.

We use entrypoints to specify which rule to evaluate, the plugin is checking for a 'result' key in the OPA response, this means you do not **have** to use `decision` as I have below, you can use any key you want.

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
	permission == "catalog.entity.read"
}
```

The input sent from Backstage looks like this:

```typescript
export type PolicyEvaluationInput = {
  permission: {
    type: string;
  };
  identity?: {
    user: string | undefined;
    claims: string[];
  };
};
```

It will then return either just an allow decision or both an allow decision and a conditions object if the rule is conditional.

## Contributing

I am happy to accept contributions and suggestions for this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal) or [Twitter](https://twitter.com/_PeterM_) (I am not as active on Twitter)

## License

This project is released under the Apache 2.0 License.
