# Example Permissions (RBAC) Policy

The below rego is an example of what a policy might look like for your Backstage application. You could use this as a starting point and modify it to fit your needs!

```rego
package rbac_policy

import rego.v1

# Helper method for constructing a conditional decision
conditional(plugin_id, resource_type, conditions) := {
 "result": "CONDITIONAL",
 "pluginId": plugin_id,
 "resourceType": resource_type,
 "conditions": conditions,
}

# Default decision is to allow, this is to not block the policy
default decision := {"result": "ALLOW"}

# This is the permission name, i.e. catalog.entity.read
permission := input.permission.name

# These are the claims of the user, i.e. groups they belong to
claims := input.identity.claims

# An example of setting the is_admin flag based on the claims
is_admin if "kind:namespace:name" in claims

# Catalog Permission: Allow users to only delete entities they claim ownership of.
# Allow admins to delete any entity regardless of ownership.
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
 "resourceType": "catalog-entity",
 "rule": "IS_ENTITY_OWNER",
 "params": {"claims": claims},
}]}) if {
 permission == "catalog.entity.delete"
 not is_admin
}

# Catalog Permission: Only allow users to read API entities, you can change "API" to any other kind.
# You can also add more kinds to the list, e.g. "kinds": ["API", "Component", "Template"]
# Allow admins to read any entity regardless of kind.
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
 "resourceType": "catalog-entity",
 "rule": "IS_ENTITY_KIND",
 "params": {"kinds": ["API"]},
}]}) if {
 permission == "catalog.entity.read"
 not is_admin
}

# Example Scaffolder Permissions

# Scaffolder Permission: Only allow users to read parameters of templates that do not have the "admin" tag.
# Allow admins to read any template parameter regardless of tags.
decision := conditional("scaffolder", "scaffolder-template", {"not": {"anyOf": [{
 "resourceType": "scaffolder-template",
 "rule": "HAS_TAG",
 "params": {"tag": "admin"},
}]}}) if {
 permission == "scaffolder.template.parameter.read"
 not is_admin
}

# Scaffold Permission: Only allow users to execute actions that do not have the "debug:log" action ID.
# Allow admins to execute any action regardless of action ID.
decision := conditional("scaffolder", "scaffolder-action", {"not": {"anyOf": [{
 "resourceType": "scaffolder-action",
 "rule": "HAS_ACTION_ID",
 "params": {"actionId": "debug:log"},
}]}}) if {
 permission == "scaffolder.action.execute"
 not is_admin
}
```

## Dynamic Policies

Its also possible to have a dynamic policy setup, you can read a great blog post by Anders Eknert [Dynamic Policy Composition](https://www.styra.com/blog/dynamic-policy-composition-for-opa/) you can find a similar example of this setup
[here](https://github.com/Parsifal-M/backstage-opa-plugins/blob/main/policies/rbac_policy.rego) you'll notice the `imports` where we are importing other policies and routing decisions to them.

There are also some great examples of this here [PlaTT Policy Template](https://github.com/ap-communications/platt-policy-template)
