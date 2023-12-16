package entity_checker

import future.keywords.contains
import future.keywords.if
import future.keywords.in

default allow := false

allow if {
	count({v | some v in violation; v.level == "error"}) == 0
}

violation contains [{"message": msg, "level": "warning"}] if {
	not contains(input.metadata.tags)
	msg := "You do not have any tags set!"
}

violation contains [{"message": msg, "level": "error"}] if {
	valid_lifecycles := {"production", "development", "experimental"}
	not contains(valid_lifecycles, input.spec.lifecycle)
	msg := "Incorrect lifecycle, should be one of production, development or experimental"
}

violation contains [{"message": msg, "level": "error"}] if {
	not is_system_present
	msg := "System is missing!"
}

violation contains [{"message": msg, "level": "error"}] if {
	valid_types := {"website", "library", "service"}
	not contains(valid_types, input.spec.type)
	msg := "Incorrect component type!"
}

is_system_present if {
	contains(input.spec.system)
}
