package entity_checker

import future.keywords.contains
import future.keywords.if
import future.keywords.in

default good_entity := false

good_entity if {
	count({v | some v in violations; v.level == "error"}) == 0
}

violations contains {"check_title": entity_check, "message": msg, "level": "warning"} if {
	not input.metadata.tags
	entity_check := "Tags"
	msg := "You do not have any tags set!"
}

violations contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_lifecycles = {"production", "development"}
	not valid_lifecycles[input.spec.lifecycle]
	entity_check := "Lifecycle"
	msg := "Incorrect lifecycle, should be one of production, development or experimental"
}

violations contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	not is_system_present
	entity_check := "System"
	msg := "System is missing!"
}

violations contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_types = {"website", "library", "service"}
	not valid_types[input.spec.type]
	entity_check := "Type"
	msg := "Incorrect component type!"
}

is_system_present if {
	input.spec.system
}