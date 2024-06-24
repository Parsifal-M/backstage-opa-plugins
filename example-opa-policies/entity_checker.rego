package entity_checker

import rego.v1

# By default we assume the entity is bad :)
default good_entity := false

# Its a good entity if there are no error violations
good_entity if {
	count({v | some v in violation; v.level == "error"}) == 0
}

# We check if the entity has a system set
is_system_present if {
	input.spec.system
}

# In each rule we check for certain entity metadata and if it is not present we add a violation
# In this one, we check if the entity has tags set, if it does not we add a warning violation
violation contains {"check_title": entity_check, "message": msg, "level": "warning"} if {
	not input.metadata.tags
	entity_check := "Tags"
	msg := "You do not have any tags set!"
}

# In this example, we check the lifecycle of the entity and if it is not one of the valid ones we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_lifecycles = {"production", "development", "experimental"}
	not valid_lifecycles[input.spec.lifecycle]
	entity_check := "Lifecycle"
	msg := "Incorrect lifecycle, should be one of production or development, experimental!"
}

# Here we check if the entity has a system set, if it does not we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	not is_system_present
	entity_check := "System"
	msg := "System is missing!"
}

# Lastly here, we check if the entity type is one of the valid ones, if it is not we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_types = {"website", "library", "service"}
	not valid_types[input.spec.type]
	entity_check := "Type"
	msg := "Incorrect component type!"
}
