package catalog_rules

import rego.v1

claims := input.identity.claims
permission := input.permission.name

# Shared helper functions
conditional(plugin_id, resource_type, conditions) := {
	"result": "CONDITIONAL",
	"pluginId": plugin_id,
	"resourceType": resource_type,
	"conditions": conditions,
}

default decision := {"result": "DENY"}

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_OWNER",
	"params": {"claims": claims},
}]}) if {
	permission == "catalog.entity.delete"
}

decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_KIND",
	"params": {"kinds": ["Component"]},
}]}) if {
	permission == "catalog.entity.read"
}
