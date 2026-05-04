---
'@parsifal-m/plugin-opa-backend': major
---

Refactors the OPA backend plugin internals:

- Replaces `CatalogClient` with `catalogServiceRef` — the plugin now uses the Backstage catalog service directly rather than making HTTP calls to the catalog API
- Removes `auth` from `RouterOptions` and the `authzRouter` signature — no longer needed now that `CatalogService` accepts credentials directly
- Renames `catalogApi` to `catalog` in `RouterOptions` — consumers constructing the router directly must update accordingly
- Adds Zod validation on the `/opa-authz` request body — invalid requests now return a structured 400 with field-level errors
- Strips `userEntity` from caller-supplied input before forwarding to OPA — prevents clients from spoofing identity fields in policy evaluation
