---
'@parsifal-m/plugin-permission-backend-module-opa-wrapper': minor
---

Added configuration option to add blanket fallback policies in the case that OPA server is unreachable. No functional changes occur if the config variable is not added in the app-config.yaml, save for a reworded logger message.
