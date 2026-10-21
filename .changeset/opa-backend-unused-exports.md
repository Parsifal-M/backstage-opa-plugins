---
'@parsifal-m/plugin-opa-backend': patch
---

Removed unused internal exports: the duplicate `RouterOptions` re-export from the internal `service` barrel, and the `export` on the internal `OpaResult` interface. The public API is unchanged — `RouterOptions` and `createRouter` are still exported from the package entry point.
