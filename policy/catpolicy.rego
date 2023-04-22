package catalog_policy

default deny := false

deny{
    input.permission.name == "catalog.entity.delete"
    input.identity.username == "user:default/guest"
}
