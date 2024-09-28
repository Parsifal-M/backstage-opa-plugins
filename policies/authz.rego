package authz

import rego.v1

default allow := false

# Allow GET requests to /entity-check
allow if {
	input.request.path == "/entity-checker-alpha"
}

# Deny requests to the /info route
allow if {
	input.user == "peter.macdonald"
}