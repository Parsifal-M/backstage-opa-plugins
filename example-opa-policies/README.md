## This Directory Contains Example OPA Policies

You could use these policies as a starting point for your own policies. The policies are written in Rego, the policy language used by OPA.

## Catalog Rules

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

This rule checks if the entity is of a given kind. (e.g. API, Component, Template, Group, etc.)

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

Similarly, permissions can be set for the scaffolder. Here are some examples of how to use the rules in the scaffolder.

### HAS_TAG

Prevent non-admin users from being able to see a template parameter based on a tag.

```rego
# Conditional based on scaffolder template tags unless they are an admin
decision := conditional("scaffolder", "scaffolder-template", {"not": {
    "anyOf": [{
        "resourceType": "scaffolder-template",
        "rule": "HAS_TAG",
        "params": {"tag": "admin"},
    }]
}}) if {
    permission == "scaffolder.template.parameter.read"
    not is_admin
}
```

### HAS_ACTION_ID

Prevent non-admin users from being able to trigger/execute certain actions based on the action ID, in this case debug:log.

```rego
decision := conditional("scaffolder", "scaffolder-action", {"not": {
    "anyOf": [{
        "resourceType": "scaffolder-action",
        "rule": "HAS_ACTION_ID",
        "params": {"actionId": "debug:log"},
    }]
}}) if {
    permission == "scaffolder.action.execute"
    not is_admin
}
```

### HAS_PROPERTY

Has property can also be `HAS_BOOLEAN_PROPERTY`, `HAS_NUMBER_PROPERTY`, `HAS_STRING_PROPERTY`. This rule prevents actions with the specified property. In this case, non-admin users cannot read templates with the `admin` property.

```rego
decision := conditional("scaffolder", "scaffolder-action", {"not": {
    "anyOf": [{
        "resourceType": "scaffolder-action",
        "rule": "HAS_PROPERTY", # OR HAS_BOOLEAN_PROPERTY, HAS_NUMBER_PROPERTY, HAS_STRING_PROPERTY
        "params": {"property": "admin"},
    }]
}}) if {
    permission == "scaffolder.template.parameter.read"
    not is_admin
}
```
