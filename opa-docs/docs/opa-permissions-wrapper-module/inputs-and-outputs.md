# Example Inputs and Outputs for Policy Evaluation

This document provides examples of inputs and outputs for the policy evaluation process.

## PolicyEvaluationInput Examples:

### Example 1

```json
{
  "permission": {
    "name": "catalog.entity.read"
  },
  "identity": {
    "user": "user:default/parsifal-m",
    "claims": ["user:default/parsifal-m", "group:default/users"]
  }
}
```

### Example 2

```json
{
  "permission": {
    "name": "catalog.entity.delete"
  },
  "identity": {
    "user": "user:default/john-doe",
    "claims": [
      "user:default/john-doe",
      "group:default/admins",
      "group:default/birdwatchers"
    ]
  }
}
```

## PolicyEvaluationResult Examples:

### Conditional Result:

```json
{
  "claims": ["user:default/parsifal-m", "group:default/users"],
  "decision": {
    "conditions": {
      "anyOf": [
        {
          "resourceType": "catalog-entity",
          "rule": "IS_ENTITY_KIND",
          "params": {
            "kinds": ["API", "Component"]
          }
        }
      ]
    },
    "pluginId": "catalog",
    "resourceType": "catalog-entity",
    "result": "CONDITIONAL"
  },
  "permission": "catalog.entity.read"
}
```

### Allow Result:

```json
{
  "decision": {
    "result": "ALLOW"
  }
}
```

### Deny Result:

```json
{
  "decision": {
    "result": "DENY"
  }
}
```

### Conditional Result with multiple conditions:

```json
{
  "claims": ["user:default/john-doe", "group:default/admins"],
  "decision": {
    "conditions": {
      "allOf": [
        {
          "resourceType": "catalog-entity",
          "rule": "IS_ENTITY_KIND",
          "params": {
            "kinds": ["API"]
          }
        },
        {
          "resourceType": "catalog-entity",
          "rule": "IS_ENTITY_OWNER",
          "params": {
            "claims": ["user:default/john-doe", "group:default/admins"]
          }
        }
      ]
    },
    "pluginId": "catalog",
    "resourceType": "catalog-entity",
    "result": "CONDITIONAL"
  },
  "permission": "catalog.entity.read"
}
```

> Note: I've not actually fully tested the Conidional Result with multiple conditions. Its on my todo list!
