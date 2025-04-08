package entity_checker

import rego.v1

is_system_present if {
	input.spec.system
}

check contains {"check_title": entity_check, "message": msg, "level": "info", "url": url} if {
	not input.metadata.tags
	entity_check := "Tags"
	msg := "You do not have any tags set!"
	url:= "https://docs.gitlab.com/user/project/repository/tags/"
}

check contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_lifecycles = {"production", "development", "experimental"}
	not valid_lifecycles[input.spec.lifecycle]
	entity_check := "Lifecycle"
	msg := "Incorrect lifecycle, should be one of production or development, experimental!"
}

check contains {"check_title": entity_check, "message": msg, "level": level} if {
	level := "error"
	valid_namespaces = {"boga", "dev", "staging", "production"}
	valid_namespaces[input.metadata.namespace]
	level := "success"
	entity_check := "Namespace"
	msg := "Correct namespace!"
}


check contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	not is_system_present
	entity_check := "System"
	msg := "System is missing!"
}

check contains {"check_title": entity_check, "message": msg, "level": "success"} if {
	valid_types = {"website", "library", "service"}
	not valid_types[input.spec.type]
	entity_check := "Type"
	msg := "Incorrect component type!"
}


