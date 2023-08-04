package catalog_policy

import future.keywords.in
import future.keywords.if

default deny := false

deny if {
  data.kind == "component"
}

deny if {
  input.permission.name == "catalog.entity.delete"
  input.identity.username == "user:default/dave"
}