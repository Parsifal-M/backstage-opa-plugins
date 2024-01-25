## How To Load These Example Policies Into The OPA Server

The following instructions assume that you have the OPA server running locally on port 8181. If you are running the OPA server on a different port, you will need to update the `curl` commands below.

### Load the `entity-checker` policy

```bash
curl -X PUT --data-binary @entity_checker.rego localhost:8181/v1/policies/entity_checker
```

### Load the `rbac_policy_admin` policy

```bash
curl -X PUT --data-binary @rbac_policy_admin.rego localhost:8181/v1/policies/rbac_policy_admin
```

### Load the `rbac_policy_user` policy

```bash
curl -X PUT --data-binary @rbac_policy_user.rego localhost:8181/v1/policies/rbac_policy_user
```

### By default the `rbac_policy.rego` is expected to be loaded as per the settings in the `app-config.yaml` file.

```bash
curl -X PUT --data-binary @rbac_policy.rego localhost:8181/v1/policies/rbac_policy
```
