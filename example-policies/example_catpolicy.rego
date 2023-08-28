package catalog_policy

# Default decisions
default allow = true
default conditional = false

# Set conditions if the user is a maintainer or avenger
conditional {
    is_maintainer
} else {
    is_avenger
}

# condition for maintainers
condition = {
    "allOf": [{
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_KIND",
        "params": {
            "kinds": ["Component", "API"]
            }
        },
        {
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_OWNER",
        "params": {
            "claims": ["group:default/maintainers"]
            }
    }]
} { is_maintainer }

# condition for avengers
condition = {
    "anyOf": [{
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_KIND",
        "params": {
            "kinds": ["Group", "User"]
        }
    }]
} { is_avenger }

# Helper rule to check if the identity is a maintainer
is_maintainer {
    user_group := input.identity.groups[_]
    user_group == "group:default/maintainers"
}

# Helper rule to check if the identity is an avenger
is_avenger {
    user_group := input.identity.groups[_]
    user_group == "group:default/avengers"
}

