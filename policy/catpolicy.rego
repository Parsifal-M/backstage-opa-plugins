package catalog_policy

import future.keywords.if

default deny := false

deny if {
    input.permission.name == "catalog.entity.delete"
}
