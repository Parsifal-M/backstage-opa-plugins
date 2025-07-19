# Using The Plugin In Local Development

If you are using this plugin and want to know how to use it in local development, you can follow the steps below, note that this is not the only way to do it, but how its done in this repository.

## Pre-requisites

- You have a Backstage instance set up and running and the permission framework set up as outlined [here](https://backstage.io/docs/permissions/getting-started/).
  - **Note** do not set a policy, just enable the framework.
- This assumes you are using `Postgres` as your database in your `app-config.yaml` file, although this is not mandatory.

## Installing the OPA Permissions Wrapper Module in Backstage

Run the following command to install the OPA Permissions Wrapper Module in your Backstage project.

```bash
yarn add --cwd packages/backend @parsifal-m/plugin-permission-backend-module-opa-wrapper
```

Then make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
```

## Configuration

The OPA client requires configuration to connect to the OPA server. You need to provide a `baseUrl` and an `entrypoint` for the OPA server in your Backstage app-config.yaml file:

```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policies:
      permissions: # Permission wrapper plugin
        entrypoint: 'rbac_policy/decision'
```

### Fallback policy

Two basic fallback policies are provided in the plugin, `allow` and `deny`. You can set the default policy in the `app-config.yaml` file with the `policyFallback` key:

```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policies:
      permissions: # Permission wrapper plugin
        entrypoint: 'rbac_policy/decision'
        policyFallback: 'deny'
```

The previous example would return a `DENY` decision to any permission request if the OPA server is not reachable.
If you do not enable a `policyFallback`, the wrapper will simply throw an error if the OPA server is not reachable and a permission request is made. The values are case-insensitive.

## Docker Compose

You can create a `docker-compose.yaml` file in the root of the repository with the following content:

```yaml
services:
  postgres:
    image: postgres:15.5-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devPostgres
    ports:
      - 5432:5432
  opa:
    image: openpolicyagent/opa:0.60.0-static
    command:
      - 'run'
      - '--server'
      - '--watch'
      - '--log-format=json-pretty'
      - '--set=decision_logs.console=true'
      - '/policies/rbac_policy.rego'
      - '/policies/entity_checker.rego'
    ports:
      - 8181:8181
    volumes:
      - ./policies:/policies
```

Then you'll need to make sure you have a `policies` folder in the root of the repository with the following content:

```rego
package rbac_policy

import rego.v1

# Helper method for constructing a conditional decision
conditional(plugin_id, resource_type, conditions) := {
	"result": "CONDITIONAL",
	"pluginId": plugin_id,
	"resourceType": resource_type,
	"conditions": conditions,
}

default decision := {"result": "ALLOW"}

permission := input.permission.name

claims := input.identity.claims

is_admin if "kind:namespace/name" in claims

# decision := {"result": "DENY"} if {
# 	permission == "catalog.entity.read"
# 	not is_admin
# }

# Conditional based on claims (groups a user belongs to) unless they are an admin
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_OWNER",
	"params": {"claims": claims},
}]}) if {
	permission == "catalog.entity.delete"
	not is_admin
}
```
