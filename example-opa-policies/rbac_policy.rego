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

# Conditional based on scaffolder template tags unless they are an admin
decision := conditional("scaffolder", "scaffolder-template", {"anyOf": [{
    "resourceType": "scaffolder-template",
    "rule": "HAS_TAG",
    "params": {"tag": "admin"},
}]}) if {
	permission == "scaffolder.template.parameter.read"
    not is_admin
}

# Conditional based on scaffolder template tags unless they are an admin
decision := conditional("scaffolder", "scaffolder-template", {"anyOf": [{
    "resourceType": "scaffolder-template",
    "rule": "HAS_TAG",
    "params": {"tag": "admin"},
}]}) if {
	permission == "scaffolder.template.step.read"
    not is_admin
}
# Conditional based on scaffolder actionID tags unless they are an admin
decision := conditional("scaffolder", "scaffolder-action", {"anyOf": [{
    "resourceType": "scaffolder-action",
    "rule": "HAS_ACTION_ID",
    "params": {"actionId": "action123"},
}]}) if {
	permission == "scaffolder.action.execute"
    not is_admin
}

# Conditional based on scaffolder properties unless they are an admin
decision := conditional("scaffolder", "scaffolder-action", {"anyOf": [{
	"resourceType": "scaffolder-action",
	"rule": "HAS_PROPERTY", # OR HAS_BOOLEAN_PROPERTY, HAS_NUMBER_PROPERTY, HAS_STRING_PROPERTY
	"params": {"property": "admin"},
}]}) if {
	permission == "scaffolder.template.parameter.read"
	not is_admin
}

# export const RESOURCE_TYPE_SCAFFOLDER_TEMPLATE = 'scaffolder-template';
# export const RESOURCE_TYPE_SCAFFOLDER_ACTION = 'scaffolder-action';