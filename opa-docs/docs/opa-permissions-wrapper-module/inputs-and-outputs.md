# Example Inputs and Outputs for Policy Evaluation

This document provides examples of inputs and outputs for the policy evaluation process.

## PolicyEvaluationInput Examples

The plugin sends a `POST` request to OPA at `{baseUrl}/v1/data/{policyEntryPoint}` with the following JSON body:

```json
{
  "input": {
    "permission": { ... },
    "identity": { ... }
  }
}
```

### Example 1

```json
{
  "input": {
    "permission": {
      "name": "catalog.entity.read"
    },
    "identity": {
      "user": "user:default/parsifal-m",
      "claims": ["user:default/parsifal-m", "group:default/users"]
    }
  }
}
```

### Example 2

```json
{
  "input": {
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
}
```

## PolicyEvaluationResult Examples

OPA must return a response with a top-level `result` key containing the policy decision. The plugin reads `result.result` to determine the outcome.

### Allow Result

```json
{
  "result": {
    "result": "ALLOW"
  }
}
```

### Deny Result

```json
{
  "result": {
    "result": "DENY"
  }
}
```

### Conditional Result

A `CONDITIONAL` decision must also include `pluginId`, `resourceType`, and `conditions`. This is used for resource-level filtering — instead of a blanket allow/deny, Backstage will filter the resource list down to only those items that match the conditions.

```json
{
  "result": {
    "result": "CONDITIONAL",
    "pluginId": "catalog",
    "resourceType": "catalog-entity",
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
    }
  }
}
```

### Conditional Result with multiple conditions

```json
{
  "result": {
    "result": "CONDITIONAL",
    "pluginId": "catalog",
    "resourceType": "catalog-entity",
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
    }
  }
}
```

## Debugging

If you need to inspect exactly what is being sent to OPA and what is being returned, enable debug logging in your Backstage instance. With debug logging enabled, the plugin will log:

- The full input sent to OPA before each request
- The full response received from OPA

This makes it straightforward to verify your Rego policy is receiving the correct input and returning the expected structure.
