---
'@parsifal-m/backstage-plugin-opa-common': patch
'@parsifal-m/backstage-plugin-opa-authz-react': major
---

Extend `PolicyResult` type to support additional fields in the OPA policy result object. The `result` field now accepts `[key: string]: unknown` alongside `allow`, allowing policies to return extra data such as a `message` or `reason`.

**Breaking change:** `PolicyResult` is no longer re-exported from `@parsifal-m/backstage-plugin-opa-authz-react`. Import it directly from `@parsifal-m/backstage-plugin-opa-common` instead.
