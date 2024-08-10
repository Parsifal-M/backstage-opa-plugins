package authz

import rego.v1

default allow := false

# Allow GET requests to /health
allow if {
	input.request.path == "/health"
	input.request.method == "GET"
}

# Deny requests to the /info route
deny if {
	input.path == "/info"
}
