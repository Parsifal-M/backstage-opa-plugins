# How To Deploy OPA!

The official documentation provided by the Open Policy Agent (OPA) community is a great resource to get started with OPA. You can find the documentation [here](https://www.openpolicyagent.org/docs/latest/deployments/).

However, if you're looking for just a quick way to get started with OPA, here's a simple guide to help you deploy OPA as a sidecar to your Backstage instance.

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

> [!ATTENTION|style:flat]
> The below is a policy designed to work with the [OPA Permissions Wrapper Module](../opa-permissions-wrapper-module/introduction.md#simplify-permissions-with-opa-in-backstage). If you are using [opa-authz](../opa-authz/introduction.md#opa-authz-client) or [opa-authz-react](../opa-authz-react/introduction.md#opa-authz-react), you will need to adjust the policy accordingly!

For simplicity you can then create a policy in a `ConfigMap` and mount it into the OPA container.

> [!NOTE|style:flat]
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
