---
'@parsifal-m/plugin-opa-backend': minor
'@parsifal-m/backstage-plugin-opa-entity-checker-processor': patch
---

Add a new plugin that implements a catalog entity processor to validate entities during ingestion. The opa-backend was refactored to exposed the entity Checker Api as a service that can be used by other backend plugins.
