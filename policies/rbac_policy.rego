package rbac_policy

import rego.v1
import data.catalog_rules
import data.scaffolder_rules

default decision := {"result": "DENY"}

permission := input.permission.name
claims := input.identity.claims

is_admin if "group:default/maintainers" in claims

# Admins have god mode
decision := {"result": "ALLOW"} if {
	is_admin
}

# Non-admins can only read components
# Does not apply to admins
decision := catalog_rules.catalog_entity_read_rule if {
    permission == "catalog.entity.read"
    not is_admin
}

# Only owners of the entity can delete it
# Does not apply to admins
decision := catalog_rules.catalog_entity_delete_rule if {
    permission == "catalog.entity.delete"
    not is_admin
}

# Only admins can read templates with the admin tag
decision := scaffolder_rules.scaffolder_entity_read_rule if {
	permission == "scaffolder.template.parameter.read"
	not is_admin
}

# Only admins can execute the debug action
decision := scaffolder_rules.scaffolder_entity_action_rule if {
	permission == "scaffolder.action.execute"
	not is_admin
}
