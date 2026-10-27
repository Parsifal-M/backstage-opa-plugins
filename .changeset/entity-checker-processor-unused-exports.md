---
'@parsifal-m/backstage-plugin-opa-entity-checker-processor': patch
---

Removed dead internal code: the unused `OpaPolicyResult` and `OpaEntityResult` interfaces, and the `export` on the internal `OPA_ENTITY_CHECKER_ANNOTATION` constant. None of these were part of the package's public API (only the default module export is public), though the constant was previously reachable via a deep import of `dist/processor/CatalogOPAEntityValidator.cjs.js`. The annotation key itself, `open-policy-agent/entity-checker-validation-status`, is unchanged.
