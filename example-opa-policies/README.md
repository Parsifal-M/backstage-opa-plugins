## This Directory Contains Example OPA Policies

These policies are example policies that are automatically loaded into the OPA container when you run `docker compose up -d`. Feel free to modify them as needed!

This is purely for local development.

## Catalog "Rules"

Here are some helpful rules that can be used in the catalog to build conditional rules and some examples of how they can be used. Keep in mind you can also construct your own rules using the documentation found [here](https://backstage.io/docs/permissions/custom-rules) and use them in the same way below.

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
