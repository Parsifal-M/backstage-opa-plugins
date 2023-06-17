package backstage

default allow = false

allow {
    input.spec.system == "opa"
}

allow {
    input.spec.lifecycle == "production"
}

violation[{"message": msg, "level": "warning"}] {
    not input.metadata.tags
    msg := "You do not have any tags set!"
}

violation[{"message": msg, "level": "error"}] {
    input.spec.lifecycle != "production"
    msg := "The spec field 'lifecycle' is not 'production'"
}

violation[{"message": msg, "level": "error"}] {
    input.spec.system != "opa"
    msg := "The spec field 'system' is not 'opa'"
}

violation[{"message": msg, "level": "success"}] {
    input.spec.type == "website"
    msg := "Correct component type!"
}
