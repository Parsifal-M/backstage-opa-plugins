---
'@parsifal-m/plugin-permission-backend-module-opa-wrapper': patch
---

The `permission.opa` configuration schema is now published and registered with Backstage. Previously `config.d.ts` lived under `src/` without a `configSchema` entry, so it was never shipped and the configuration was not validated. Backstage now validates `permission.opa.baseUrl` and `permission.opa.policy.policyEntryPoint` at startup, and both are listed in the config schema.
