package catalog_policy

import future.keywords.in
import future.keywords.if

default deny := false


deny if {
  input.identity.username == "user:default/parsifal-m"
}