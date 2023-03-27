package example_policy

deny {
    input.permission.name == "catalog.entity.read"
}
