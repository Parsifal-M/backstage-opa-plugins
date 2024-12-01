package catalog_rules

import rego.v1

claims := input.identity.claims

# Shared helper functions
conditional(plugin_id, resource_type, conditions) := {
    "result": "CONDITIONAL",
    "pluginId": plugin_id,
    "resourceType": resource_type,
    "conditions": conditions,
}

catalog_entity_delete_rule := conditional("catalog", "catalog-entity", {"anyOf": [{
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_OWNER",
        "params": {"claims": claims},
    }]})

catalog_entity_read_rules := conditional("catalog", "catalog-entity", {"anyOf": [{
		"resourceType": "catalog-entity",
		"rule": "IS_ENTITY_KIND",
		"params": {"kinds": ["Component"]},
	}]})
