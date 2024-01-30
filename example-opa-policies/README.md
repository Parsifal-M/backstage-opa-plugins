## This directory contains example OPA policies

These policies are example policies that can be used to test the OPA server. Feel free to modify them as needed!

## Catalog "Rules"

Here are some rules that can be used in the catalog to build conditional rules and some examples of how they can be used. Keep in mind you can also construct your own rules using the documentation found [here](https://backstage.io/docs/permissions/custom-rules) and use them in the same way below.

### HAS_ANNOTATION

This rule checks if a given annotation exists on a given entity.

```rego
# Conditional based on annotations

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
    "resourceType": "catalog-entity",
    "rule": "HAS_ANNOTATION",
    "params": {"annotation": "your-annotation", "value": "your-value"},
}]}) if {
    permission == "catalog.entity.read"
}
```

### HAS_LABEL

This rule checks if a given label exists on a given entity.

```rego
# Conditional based on labels

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
    "resourceType": "catalog-entity",
    "rule": "HAS_LABEL",
    "params": {"label": "your-label"},
}]}) if {
    permission == "catalog.entity.read"
}
```

### IS_ENTITY_OWNER

This rule checks if the user is the owner of the entity.

```rego
# Conditional based on claims (groups a user belongs to)

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_OWNER",
	"params": {"claims": claims},
}]}) if {
	permission == "catalog.entity.delete"
}
```

### IS_ENTITY_KIND

This rule checks if the entity is of a given kind. (API, GROUP, USER, etc.)

```rego
# Allow all users to read API and Component entities

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_KIND",
	"params": {"kinds": ["API", "Component"]},
}]}) if {
	permission == "catalog.entity.read"
}
```

## Scaffolder Rules

TODO: Add documentation for scaffolder rules

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
