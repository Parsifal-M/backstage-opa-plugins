package opa_demo

import rego.v1

default allow := false

# OPA Frontend Demo Rules
allow if {
	input.day == "Thursday"
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
	input.permission.name == "read-all-todos"
	input.userAnnotations["company.com/department"] == "engineering"
}

  allow if {
    input.method == "POST"
    input.permission.name == "post-todo"
    input.userEntityRef == "user:default/mock"
  }

  allow if {
    input.method == "POST"
    input.permission.name == "post-todo"
    input.userAnnotations["company.com/role"] == "developer"
  }