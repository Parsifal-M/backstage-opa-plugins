# Changelog

All notable changes to this project will be documented in this file.

## 1.3.4 - 15-03-2024

### Added

N/A

### Changed

- Changed to `LoggerService` from `'@backstage/backend-plugin-api'` instead of using the default Winston logger, this allows for printing debug logs to the console.

- We now expect an `entrypoint` instead of a `package` in the `app-config.yaml` file. This instead allows you to evaluate the rule head you want to use instead of evaluating the whole package this is especially relevant for the [backstage-opa-entity-checker](../backstage-opa-entity-checker/README.md) plugin.

### Fixed

N/A
