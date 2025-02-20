package rbac_policy

import data.catalog_rules
import data.scaffolder_rules
import rego.v1

permission := input.permission.name

claims := input.identity.claims

is_admin if "group:default/maintainers" in claims

default decision := {"result": "DENY"}

# Admins have god mode
decision := {"result": "ALLOW"} if {
	is_admin
}

# Offload all catalog permissions to the catalog_rules
# This is a good example of how you might offload all decisions of a certain plugin, e.g. "plugin_name."
# Does not apply to admins
decision := catalog_rules.decision if {
	startswith(permission, "catalog.")
	not is_admin
}

# Here we don't offload all decisions to the scaffolder_rules, we pick and choose depending.
# Only admins can read templates with the admin tag
decision := scaffolder_rules.scaffolder_entity_read_admin_tag if {
	permission == "scaffolder.template.parameter.read"
	not is_admin
}

# Only admins can execute the debug action
decision := scaffolder_rules.scaffolder_entity_action_debug_log if {
	permission == "scaffolder.action.execute"
	not is_admin
}
