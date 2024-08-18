package authz

import rego.v1

default allow := false

# Allow GET requests to /health
allow if {
	input.request.path == "/entity-checker"
	input.request.method == "POST"
}

# Deny requests to the /info route
deny if {
	input.path == "/info"
}
