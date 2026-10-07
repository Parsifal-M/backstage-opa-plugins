---
'@parsifal-m/plugin-permission-backend-module-opa-wrapper': patch
---

Fix `policyFallbackDecision` not being applied when the OPA server is unreachable. Node's built-in `fetch` rejects with `TypeError: fetch failed` rather than `FetchError`, so connection failures were thrown instead of falling back. Any transport failure or non-2xx response from OPA now applies the configured fallback; an unparseable 2xx body still fails closed.

Because native `fetch` also rejects malformed or non-HTTP(S) URLs with a `TypeError`, the OPA URL is now validated when the module starts. An invalid `permission.opa.baseUrl` (for example `localhost:8181` without a scheme) fails backend startup instead of silently triggering the fallback on every request.

`OpaClient.evaluatePermissionsFrameworkPolicy` now throws when OPA returns no usable decision (for example `{}` because the policy is not loaded, or an entry point that resolves to a non-object), instead of returning `undefined` despite its declared return type. This never applies the fallback.

`OpaPermissionPolicy` now also honours the `PermissionPolicy` contract where `user` is optional: when no user is supplied, the `identity` field is omitted from the OPA input instead of throwing a `TypeError`.

The policy no longer reads the deprecated `PolicyQueryUser.info` field. The user's entity ref and ownership refs are now resolved from their credentials via `coreServices.userInfo`, and non-user principals (service or unauthenticated) are sent to OPA without an `identity`. The module now depends on `coreServices.auth` and `coreServices.userInfo`, both provided by default in the new backend system.
