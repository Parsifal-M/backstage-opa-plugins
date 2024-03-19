package rbac_policy

import rego.v1

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

is_admin if "group:twocodersbrewing/maintainers" in claims

# decision := {"result": "DENY"} if {
# 	permission == "catalog.entity.read"
# 	not is_admin
# }

# Conditional based on claims (groups a user belongs to) unless they are an admin
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_OWNER",
	"params": {"claims": claims},
}]}) if {
	permission == "catalog.entity.delete"
	not is_admin
}

# Allow users to only see components unless they are an admin
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
	"resourceType": "catalog-entity",
	"rule": "IS_ENTITY_KIND",
	"params": {"kinds": ["API"]},
}]}) if {
	permission == "catalog.entity.read"
	not is_admin
}
