# OPA Permissions Wrapper for Backstage

This project is an [Open Policy Agent (OPA)](https://github.com/open-policy-agent/opa) wrapper for the Backstage Permission Framework. The wrapper provides a way to evaluate permissions using OPA, allowing for fine-grained access control and customized policies for your Backstage instance.

### **Please Note! This project is still in development and is not yet ready for production use.**

> This wrapper is still in **development**, you can use it at your own risk, be aware it can change without notice. It is not yet ready for production use.

## Pre-requisites

- This plugin requires the [opa-backend](../opa-backend/README.md) plugin to be installed and configured.
- This plugin also requires and assumes that you have set up and followed the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

## Key Components

- `permission-evaluator/opaEvaluator.ts`: Defines a policy evaluation function that checks if a given request should be allowed or denied based on a set of policy rules. It uses the OpaClient and configuration provided to evaluate these policies, taking into account the user's identity, and returns a decision accordingly.
- `opa-client/opaClient.ts`: Provides the OpaClient class for communication with the OPA server.

To integrate this OPA wrapper with your Backstage instance, you need to first follow the instructions in the [Backstage Permissions Docs](https://backstage.io/docs/permissions/overview) as it of course relies on the permissions framework to be there and set up.

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
} from '@parsifal-m/opa-permissions-wrapper';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  const genericPolicyEvaluator = policyEvaluator(opaClient, env.config);
  class PermissionsHandler implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      return await genericPolicyEvaluator(request, user);
    }
  }

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new PermissionsHandler(),
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
      package: 'entitymeta_policy'
    rbac: # Permission wrapper plugin
      package: 'rbac_policy'
```

Replace the `baseUrl` with the URL of your OPA server and 'catalog_policy' with the OPA policy package containing your catalog policies.

## An Example Policy and Input

An example policy in OPA might look like this, keep in mind you could also use [bundles](https://www.openpolicyagent.org/docs/latest/management-bundles/) to manage your policies and keep the `conditions` object in a `data.json` file.

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
