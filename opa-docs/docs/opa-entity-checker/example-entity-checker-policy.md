# Example Entity Checker Policy

This is an example policy for the OPA Entity Checker plugin. This policy is used to check if an entity has the correct metadata set. This could be used as a starting point for your own policies!

```rego
package entity_checker

import rego.v1

is_system_present if {
    input.spec.system
}

check contains {
    # The title of the check
    "check_title": "Tags",
    # The message to display
    "message": "You do not have any tags set!",
    # The level of the check, can be info, warning, error, or success
    "level": "info",
    # A url to the documentation about tags, helpful for the user to understand the check
    "url": "https://docs.gitlab.com/user/project/repository/tags/"
} if {
    not input.metadata.tags
}

check contains {
    "check_title": "Lifecycle",
    "message": "Incorrect lifecycle, should be one of production or development, experimental!",
    "level": "error"
} if {
    valid_lifecycles = {"production", "development", "experimental"}
    not valid_lifecycles[input.spec.lifecycle]
}

check contains {
    "check_title": "Namespace",
    "message": "Correct namespace!",
    "level": "error"
} if {
    valid_namespaces = {"dev", "staging", "production"}
    valid_namespaces[input.metadata.namespace]
}

check contains {
    "check_title": "System",
    "message": "System is missing!",
    "level": "error"
} if {
    not is_system_present
}

check contains {
    "check_title": "Type",
    "message": "Correct Component Type!",
    "level": "success"
} if {
    valid_types = {"website", "library", "service"}
    valid_types[input.spec.type]
}
```

## Success / Error Rules

If you are wondering how you could "invert" the rules to make them success or error, you could do something like this, but of course you are free to use your own logic.

```rego
package entity_checker

valid_lifecycles := {"production", "development", "experimental"}


# Error
check contains {
 "check_title": "Lifecycle",
 "message": "Incorrect lifecycle, should be one of production or development, experimental!",
 "level": "error",
} if {
 not valid_lifecycles[input.spec.lifecycle]
}

# Success
check contains {
 "check_title": "Lifecycle",
 "message": "Correct Lifecycle!",
 "level": "success",
} if {
 valid_lifecycles[input.spec.lifecycle]
}
```
