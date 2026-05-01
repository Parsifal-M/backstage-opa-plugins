# @parsifal-m/backstage-plugin-opa-authz-react

## 2.0.1

### Patch Changes

- 3770957: Patch bump so can run the correct publish command in NPM

## 2.0.0

### Major Changes

- 923b236: Extend `PolicyResult` type to support additional fields in the OPA policy result object. The `result` field now accepts `[key: string]: unknown` alongside `allow`, allowing policies to return extra data such as a `message` or `reason`.

  **Breaking change:** `PolicyResult` is no longer re-exported from `@parsifal-m/backstage-plugin-opa-authz-react`. Import it directly from `@parsifal-m/backstage-plugin-opa-common` instead.

### Minor Changes

- 82af423: Allow the full user entity to be sent to OPA

### Patch Changes

- Updated dependencies [923b236]
  - @parsifal-m/backstage-plugin-opa-common@0.1.1

## 1.1.2

### Patch Changes

- 2804c01: Core Package Version Bumps

## 1.1.1

### Patch Changes

- 74814c1: Core backstage version bump

## 1.1.0

### Minor Changes

- 0f6c2ce: It is now optional to use the entity checker plugin when using the opa-backend plugin. It is now possible to manually trigger a call to the opa policy endpoint with a new react hook called useOpaAuthzManual

## 1.0.0

### Patch Changes

- Bumps version packages for all plugins, refactors opa entity checker and add additional testing.
- 2ac102e: Minor refactoring of types and interfaces
