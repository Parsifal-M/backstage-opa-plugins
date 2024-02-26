# Changelog

All notable changes to this project will be documented in this file.

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
