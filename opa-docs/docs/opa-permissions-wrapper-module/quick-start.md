# Quick Start

This guide will help you get started with the OPA Permissions Wrapper module for Backstage.

## Pre-requisites

- You have a Backstage instance set up and running and the permission framework set up as outlined [here](https://backstage.io/docs/permissions/getting-started/).
  - **Note** do not set a policy, just enable the framework.
- You have deployed OPA, kindly see how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/), or see below.

## Deploying OPA

There are many ways to deploy OPA, and there is no one size fits all. A good way is to deploy OPA as a sidecar to your Backstage instance. This way, you can ensure that OPA is always available when your Backstage instance is running.

Here is an example of how you could update your Backstage `k8s` deployment to include OPA, this would be an extension of the `k8s` deployment that you are using for your Backstage instance.

```yaml
#... Backstage deployment configuration with OPA
spec:
  containers:
    - name: backstage
      image: your-backstage-image
      ports:
        - name: http
          containerPort: 7007
    - name: opa
      image: openpolicyagent/opa:0.65.0 # Pin a version of your choice
      ports:
        - name: http
          containerPort: 8181
      args:
        - 'run'
        - '--server'
        - '--log-format=json-pretty'
        - '--set=decision_logs.console=true'
        - '--ignore=.*'
        - '--watch' # Watch for policy changes, this allows updating the policy without restarting OPA
        - '/policies'
      volumeMounts:
        - readOnly: true
          name: opa-rbac-policy
          mountPath: /policies
  volumes:
    - name: opa-rbac-policy
      configMap:
        name: opa-rbac-policy
```

For simplicity you can then create a policy in a `ConfigMap` and mount it into the OPA container.

> Note: Update "kind:namespace/name" in the policy to match your user entity claims.

```yaml
# opa-rbac-policy.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: opa-rbac-policy
data:
  rbac_policy.rego: |
    package rbac_policy

    import rego.v1

    # Helper method for constructing a conditional decision
    conditional(plugin_id, resource_type, conditions) := {
        "result": "CONDITIONAL",
        "pluginId": plugin_id,
        "resourceType": resource_type,
        "conditions": conditions,
    }

    permission := input.permission.name

    claims := input.identity.claims

    # An Example Admin Group
    is_admin if "kind:namespace/name" in claims

    # Catalog Permission: Allow users to only delete entities they claim ownership of.
    # Allow admins to delete any entity regardless of ownership.
    decision := conditional("catalog", "catalog-entity", {"anyOf": [{
     "resourceType": "catalog-entity",
     "rule": "IS_ENTITY_OWNER",
     "params": {"claims": claims},
    }]}) if {
     permission == "catalog.entity.delete"
     not is_admin
    }
```

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

The OPA client requires configuration to connect to the OPA server. You need to provide a `baseUrl` and an `entrypoint` for the OPA server in your Backstage app-config.yaml, based on the example above we would have the following configuration:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    permissions: # Permission wrapper plugin
      entrypoint: 'rbac_policy/decision'
```

The `baseUrl` is the URL of the OPA server, and the `entrypoint` is the entrypoint of the policy you want to evaluate.

## Recommendations

I recommend using [Regal: A linter and language server for Rego](https://github.com/StyraInc/regal) to help you write your policies. It provides syntax highlighting, linting, and type checking for Rego files.
