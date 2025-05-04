package entity_checker

import rego.v1

is_system_present if {
    input.spec.system
}

check contains {
    "check_title": "Tags", 
    "message": "You do not have any tags set!", 
    "level": "info", 
    "url": "https://docs.gitlab.com/user/project/repository/tags/"
} if {
    not input.metadata.tags
}

check contains {
    "check_title": "Lifecycle",
    "message": "Incorrect lifecycle, should be one of production or development, experimental!",
    "level": "error"
} if {
    valid_lifecycles = {"production", "development", "experimental"}
    not valid_lifecycles[input.spec.lifecycle]
}

check contains {
    "check_title": "Namespace",
    "message": "Correct namespace!",
    "level": "error"
} if {
    valid_namespaces = {"boga", "dev", "staging", "production"}
    valid_namespaces[input.metadata.namespace]
}

check contains {
    "check_title": "System",
    "message": "System is missing!",
    "level": "error"
} if {
    not is_system_present
}

check contains {
    "check_title": "Type",
    "message": "Incorrect component type!",
    "level": "success"
} if {
    valid_types = {"website", "library", "service"}
    not valid_types[input.spec.type]
}