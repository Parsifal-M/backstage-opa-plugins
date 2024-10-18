package opa_demo

import rego.v1

default allow := false

# Example Demo Policy
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
