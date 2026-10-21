---
'@parsifal-m/plugin-opa-backend': patch
'@parsifal-m/plugin-permission-backend-module-opa-wrapper': patch
'@parsifal-m/plugin-opa-entity-checker': patch
'@parsifal-m/plugin-opa-policies': patch
'@parsifal-m/backstage-plugin-opa-entity-checker-processor': patch
---

Removed unused runtime dependencies, reducing the install footprint for consumers:

- `@parsifal-m/plugin-opa-backend`: `knex`, `yn`, `@backstage/integration`, `@backstage/catalog-client`, `@backstage/errors`
- `@parsifal-m/plugin-permission-backend-module-opa-wrapper`: `winston`, `@backstage/errors`, `@backstage/plugin-auth-node`
- `@parsifal-m/plugin-opa-entity-checker`: `react-use`, `@backstage/core-components`, `@backstage/theme`, `@backstage/config`, `@parsifal-m/backstage-plugin-opa-common`
- `@parsifal-m/plugin-opa-policies`: `react-use`, `@material-ui/lab`, `@backstage/theme`
- `@parsifal-m/backstage-plugin-opa-entity-checker-processor`: `lodash-es`
