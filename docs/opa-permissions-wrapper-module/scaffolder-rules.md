# Scaffolder Rules

Here are some helpful rules that can be used in the scaffolder to build conditional rules and some examples of how they can be used. Keep in mind you can also construct your own rules using the documentation found [here](https://backstage.io/docs/permissions/custom-rules) and use them in the same way below.

## HAS_TAG

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

## HAS_ACTION_ID

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

## HAS_PROPERTY

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

## Want To Add More Examples?

Please feel free to contribute to this documentation by submitting a PR with your examples. We would love to see how you are using these rules in your Backstage instance!
