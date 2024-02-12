package rbac_policy

import future.keywords.if
import future.keywords.in

# Helper method for constructing a conditional decision
conditional(plugin_id, resource_type, conditions) := {
    "result": "CONDITIONAL",
    "pluginId": plugin_id,
    "resourceType": resource_type,
    "conditions": conditions,
}

default decision := {"result": "ALLOW"}

permission := input.permission.name

claims := input.identity.claims

decision := {"result": "ALLOW"} if {
    permission == "catalog.entity.read"
}

# Conditional based on claims (groups a user belongs to)
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_OWNER",
	"params": {"claims": claims},
}]}) if {
	permission == "catalog.entity.delete"
}
