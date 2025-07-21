# Changelog

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

## 1.4.1

### Patch Changes

- Bumps version packages for all plugins, refactors opa entity checker and add additional testing.
- 68bfc14: overloaded evaluatePolicy in order to change the return type
- 439af64: `none` was not accepted by the permissions framework and should be `not` updated the types to accept `not`

## 1.4.0

### Minor Changes

- e59b31f: Adds a new method to the OPA Permissions Wrapper you can call inside your backend plugins to control Authz on your backend routes!

### Patch Changes

- 871ce53: updating docs

## 1.3.2

### Patch Changes

- c50f833: Change to using PolicyUser instead of BackstageIdentity when passing the user information to the OPA policy to be more inline with how it was intended to be used.

## 1.3.1

### Patch Changes

- 9f7ddea: Core Backstage Version Bumps

## 1.3.0

### Minor Changes

- ca79146: Added configuration option to add blanket fallback policies in the case that OPA server is unreachable. No functional changes occur if the config variable is not added in the app-config.yaml, save for a reworded logger message.

## 1.2.3

### Patch Changes

- 958115b: Updates dependencies, also includes the new mandatory metadata in the package.json

All notable changes to this project will be documented in this file.

## 1.2.2 - 24-05-2024

### Added

N/A

### Changed

Bumps the Backstage packages to the latest version.

### Fixed

N/A

## 1.2.1 - 14-03-2024

### Added

N/A

### Changed

- #158 Updated the way logs are handled, we now use `LoggerService` from `@backstage/backend-plugin-api` what this allows now is that if you start up the backend with `LOG_LEVEL=debug` you will see debug logs from the OPA wrapper.

### Fixed

N/A

## 1.2.0 - 26-02-2024

### Added

- Some new additions and updates to the documentation.

### Changed

- #146 We now use `entrypoint` in the `app-config.yaml` to evaluate rules, and we have renamed `rbac` to `permissions` these changes where reported in #143 thank you @anderseknert!
- #144 Changed the logger to stop logging too much information on what is happening when OPA is called to evaluate a permission, this helps with security and its less spammy. Reported in #141 thanks again @anderseknert!

### Deprecated

N/A

### Removed

N/A

### Fixed

N/A
