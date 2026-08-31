---
'@parsifal-m/backstage-plugin-opa-authz-react': patch
---

Fix `RequireOpaAuthz` to render the `errorPage` prop when OPA evaluation errors or denies access, instead of always rendering nothing.
