package catalog_policy

# Default decisions
default allow = true
default conditional = false

# Allow and set conditions if the user is a maintainer
allow {
    is_maintainer
}

conditional = true {
    is_maintainer
}

# conditions structure
condition = {
    "anyOf": [{
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_KIND",
        "params": {
            "kinds": ["API"]
        },
    }]
} { is_maintainer }

# Helper rule to check if the identity is a maintainer
is_maintainer {
    user_group := input.identity.groups[_]
    user_group == "group:default/justice_league"
}

allow = false {
    user_group := input.identity.groups[_]
    user_group == "group:default/maintainers"
}
