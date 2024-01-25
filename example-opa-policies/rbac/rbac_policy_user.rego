package rbac_policy.user

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

# Do not allow users to delete anything from the catalog
decision := {"result": "DENY"} if {
	permission == "catalog.entity.delete"
	not "group:default/maintainers" in claims
}

# Allow all users to read API and Component entities
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_KIND",
	"params": {"kinds": ["API", "Component"]},
}]}) if {
	permission == "catalog.entity.read"
	not "group:default/maintainers" in claims
}
