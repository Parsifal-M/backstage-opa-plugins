package opa_demo

import rego.v1

default allow := false

# OPA Frontend Demo Rules
allow if {
	input.day == "Friday"
	"user:default/parsifal-m" in input.ownershipEntityRefs
}

allow if {
	input.action == "see-header"
	"user:default/parsifal-m" in input.ownershipEntityRefs
}

allow if {
	input.action == "see-support-button"
	"user:default/parsifal-m" in input.ownershipEntityRefs
}

allow if {
	input.action == "see-plugin"
	"user:default/parsifal-m" in input.ownershipEntityRefs
}

allow if {
	input.action == "see-info-card"
	"user:default/parsifal-m" in input.ownershipEntityRefs
}


# OPA Backend Demo Rules
allow if {
	input.method == "GET"
	input.params.id == "23768468-6ec5-4c52-bb34-bbe18b9703c5"
}

allow if {
	input.method == "POST"
}
