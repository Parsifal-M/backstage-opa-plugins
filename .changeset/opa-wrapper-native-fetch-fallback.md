---
'@parsifal-m/plugin-permission-backend-module-opa-wrapper': patch
---

Fix `policyFallbackDecision` not being applied when the OPA server is unreachable. Node's built-in `fetch` rejects with `TypeError: fetch failed` rather than `FetchError`, so connection failures were thrown instead of falling back. Any transport failure or non-2xx response from OPA now applies the configured fallback; an unparseable 2xx body still fails closed.

`OpaPermissionPolicy` now also honours the `PermissionPolicy` contract where `user` is optional: when no user is supplied, the `identity` field is omitted from the OPA input instead of throwing a `TypeError`.

The policy no longer reads the deprecated `PolicyQueryUser.info` field. The user's entity ref and ownership refs are now resolved from their credentials via `coreServices.userInfo`, and non-user principals (service or unauthenticated) are sent to OPA without an `identity`. The module now depends on `coreServices.auth` and `coreServices.userInfo`, both provided by default in the new backend system.
