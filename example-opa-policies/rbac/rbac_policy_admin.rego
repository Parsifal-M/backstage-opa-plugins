package rbac_policy.admin

import future.keywords.if
import future.keywords.in

# Helper method for constructing a conditional decision (if you need it)
conditional(plugin_id, resource_type, conditions) := {
    "result": "CONDITIONAL",
    "pluginId": plugin_id,
    "resourceType": resource_type,
    "conditions": conditions,
}

default decision := {"result": "ALLOW"}
