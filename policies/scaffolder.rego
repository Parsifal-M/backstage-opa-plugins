package scaffolder_rules

import rego.v1

# Helper function to create a conditional decision
conditional(plugin_id, resource_type, conditions) := {
    "result": "CONDITIONAL",
    "pluginId": plugin_id,
    "resourceType": resource_type,
    "conditions": conditions,
}

claims := input.identity.claims

scaffolder_entity_read_admin_tag := conditional("scaffolder", "scaffolder-template", {"not": {"anyOf": [{
        "resourceType": "scaffolder-template",
        "rule": "HAS_TAG",
        "params": {"tag": "admin"},
    }]}})

scaffolder_entity_action_debug_log := conditional("scaffolder", "scaffolder-action", {"not": {"anyOf": [{
        "resourceType": "scaffolder-action",
        "rule": "HAS_ACTION_ID",
        "params": {"actionId": "debug:log"},
    }]}})
