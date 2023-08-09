package catalog_policy

default deny = true

allow {
    input.permission.resource == "catalog"
    input.permission.resourceType == "catalog-entity"
    input.permission.action == "read"
    input.permission.condition.owner == input.identity.username
}
