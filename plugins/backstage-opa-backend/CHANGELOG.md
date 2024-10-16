# Changelog

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
