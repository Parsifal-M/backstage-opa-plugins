# Changelog

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
