# @parsifal-m/backstage-plugin-opa-common

## 0.1.2

### Patch Changes

- e273d1d: Bumps core Backstage dependencies to 1.50.4.

## 0.1.1

### Patch Changes

- 923b236: Extend `PolicyResult` type to support additional fields in the OPA policy result object. The `result` field now accepts `[key: string]: unknown` alongside `allow`, allowing policies to return extra data such as a `message` or `reason`.

  **Breaking change:** `PolicyResult` is no longer re-exported from `@parsifal-m/backstage-plugin-opa-authz-react`. Import it directly from `@parsifal-m/backstage-plugin-opa-common` instead.
