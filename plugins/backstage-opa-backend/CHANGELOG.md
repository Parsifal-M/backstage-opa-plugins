# Changelog

## 2.0.1

### Patch Changes

- 2804c01: Core Package Version Bumps

## 2.0.0

### Major Changes

- 9b92100: **BREAKING CHANGE: Configuration structure updated for all OPA plugins**

  This release introduces breaking changes to the configuration structure across all OPA plugins. The configuration has been restructured to provide better separation of concerns and clearer organization.

  ## Migration Guide

  ### Permission Backend Module OPA Wrapper

  **Old Configuration:**

  ```yaml
  opaClient:
    baseUrl: 'http://localhost:8181'
    policies:
      permissions:
        entrypoint: 'rbac_policy/decision'
        policyFallback: 'allow'
  ```

  **New Configuration:**

  ```yaml
  permission:
    opa:
      baseUrl: 'http://localhost:8181'
      policies:
        permissions:
          entrypoint: 'rbac_policy/decision'
          policyFallback: 'allow'
  ```

  ### OPA Backend Services (Entity Checker, Policy Viewer)

  **Old Configuration:**

  ```yaml
  opaClient:
    baseUrl: 'http://localhost:8181'
    policies:
      entityChecker:
        entrypoint: 'entity_checker/violation'
  ```

  **New Configuration:**

  ```yaml
  openPolicyAgent:
    baseUrl: 'http://localhost:8181'
    entityChecker:
      enabled: true # REQUIRED: Must be explicitly enabled
      policyEntryPoint: 'entity_checker/violation' # Note: renamed from 'entrypoint'
    entityCheckerProcessor:
      enabled: true # REQUIRED: Must be explicitly enabled
      policyEntryPoint: 'entity_checker/violation'
    policyViewer:
      enabled: true # REQUIRED: Must be explicitly enabled
  ```

  ## Key Changes

  1. **Configuration Namespace Changes:**

     - Permission wrapper: `opaClient.*` → `permission.opa.*`
     - Backend services: `opaClient.*` → `openPolicyAgent.*`

  2. **New Required `enabled` Flags:**

     - All OPA backend features are now **disabled by default**
     - You must explicitly set `enabled: true` for each feature you want to use

  3. **Property Rename:**
     - `entrypoint` → `policyEntryPoint` (for backend services only)

  ## Required Actions

  1. **Update your `app-config.yaml`** with the new configuration structure
  2. **Add `enabled: true`** for all OPA backend features you want to use
  3. **Update property names** (`entrypoint` → `policyEntryPoint` for backend services)
  4. **Test your configuration** to ensure all features work as expected

  ## Benefits of This Change

  - **Better organization:** Clear separation between permission framework and backend services
  - **Resource optimization:** Only load the OPA features you actually need
  - **Future-proof:** Better foundation for additional OPA features

  ## Troubleshooting

  If OPA features are not working after upgrade:

  1. Verify you've updated the configuration structure
  2. Ensure `enabled: true` is set for features you want to use
  3. Check that `policyEntryPoint` is correctly specified
  4. Confirm OPA server connectivity with the new `baseUrl` locations

### Patch Changes

- 74814c1: Core backstage version bump

## 1.7.0

### Minor Changes

- 0f6c2ce: It is now optional to use the entity checker plugin when using the opa-backend plugin. It is now possible to manually trigger a call to the opa policy endpoint with a new react hook called useOpaAuthzManual

## 1.6.2

### Patch Changes

- Bumps version packages for all plugins, refactors opa entity checker and add additional testing.
- 2ac102e: Minor refactoring of types and interfaces

## 1.6.1

### Patch Changes

- d07f3ed: Core versions bump

## 1.6.0

### Minor Changes

- ffd8c74: Add a new plugin that implements a catalog entity processor to validate entities during ingestion. The opa-backend was refactored to exposed the entity Checker Api as a service that can be used by other backend plugins.

## 1.4.8

### Patch Changes

- def1136: Removes all dependencies on the backend common deprecated Backstage package. And updates them to the new packages.

## 1.4.7

### Patch Changes

- 9f7ddea: Core Backstage Version Bumps

## 1.4.6

### Patch Changes

- 958115b: Updates dependencies, also includes the new mandatory metadata in the package.json

All notable changes to this project will be documented in this file.

## 1.4.5 - 24-05-2024

### Added

N/A

### Changed

Bumps the Backstage packages to the latest version.

### Fixed

N/A

## 1.4.4 - 12-04-2024

### Added

- Added a new route `/get-policy` to the plugin. This route is designed to fetch and display the content of Open Policy Agent (OPA) policy files. Currently the [backstage-opa-policies](../backstage-opa-policies/README.md) plugin uses this route to fetch and display the content of OPA policies in the Backstage UI on entity pages.

### Changed

N/A

### Fixed

N/A

## 1.3.4 - 15-03-2024

### Added

N/A

### Changed

- Changed to `LoggerService` from `'@backstage/backend-plugin-api'` instead of using the default Winston logger, this allows for printing debug logs to the console.

- We now expect an `entrypoint` instead of a `package` in the `app-config.yaml` file. This instead allows you to evaluate the rule head you want to use instead of evaluating the whole package this is especially relevant for the [backstage-opa-entity-checker](../backstage-opa-entity-checker/README.md) plugin.

### Fixed

N/A
