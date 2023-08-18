package entitymeta

default allow := false

allow {
	count({v | v := violation[_]; v.level == "error"}) == 0
}

violation[{"message": msg, "level": "warning"}] {
	not input.metadata.tags
	msg := "You do not have any tags set!"
}

violation[{"message": msg, "level": "error"}] {
	valid_lifecycles = {"production", "development", "experimental"}
	not valid_lifecycles[input.spec.lifecycle]
	msg := "Incorrect lifecycle, should be one of production, development or experimental"
}

violation[{"message": msg, "level": "error"}] {
	not is_system_present
	msg := "System is missing!"
}

violation[{"message": msg, "level": "error"}] {
	valid_types = {"website", "library", "service"}
	not valid_types[input.spec.type]
	not valid_types
	msg := "Incorrect component type!"
}

is_system_present {
	input.spec.system
}
