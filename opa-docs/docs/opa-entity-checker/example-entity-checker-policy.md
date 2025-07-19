# Example Entity Checker Policy

This is an example policy for the OPA Entity Checker plugin. This policy is used to check if an entity has the correct metadata set. This could be used as a starting point for your own policies.

```rego
package entity_checker

import rego.v1

# Helper function to check if the entity has a system set
is_system_present if {
    input.spec.system
}

# Check if the entity has tags set, if not add a warning violation
violation contains {"check_title": entity_check, "message": msg, "level": "warning"} if {
    not input.metadata.tags
    entity_check := "Tags"
    msg := "You do not have any tags set!"
}

# Check the lifecycle of the entity and if it is not valid add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
    valid_lifecycles = {"production", "development", "experimental"}
    not valid_lifecycles[input.spec.lifecycle]
    entity_check := "Lifecycle"
    msg := "Incorrect lifecycle, should be one of production, development, or experimental!"
}

# Check if the entity has a system set, if not add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
    not is_system_present
    entity_check := "System"
    msg := "System is missing!"
}

# Check if the entity type is valid, if not add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
    valid_types = {"website", "library", "service"}
    not valid_types[input.spec.type]
    entity_check := "Type"
    msg := "Incorrect component type!"
}
```
