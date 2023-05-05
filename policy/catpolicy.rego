package catalog_policy

default deny := false

deny{
    input.permission.name == "catalog.entity.read"
    input.identity.groups[_] == "group:default/maintainers"
}
