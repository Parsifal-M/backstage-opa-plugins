---
name: opa-permissions-wrapper-setup
description: Set up or modify the OPA Permissions Wrapper Module in a Backstage app. Use this skill whenever the user wants to integrate OPA with the Backstage Permission Framework, add or change permission rules, write a Rego policy for Backstage permissions, wire up the opa-wrapper module, or troubleshoot why a permission is being allowed or denied. Trigger on phrases like "add OPA permissions", "set up permission policy", "Rego policy for Backstage", "permission wrapper", "ALLOW/DENY/CONDITIONAL", or any time the user is working with `@parsifal-m/plugin-permission-backend-module-opa-wrapper`.
---

# OPA Permissions Wrapper Module Setup

This skill covers installing, wiring up, configuring, and writing policies for `@parsifal-m/plugin-permission-backend-module-opa-wrapper`. It also covers adding new permission rules to an existing setup.

The module sits between the Backstage Permission Framework and OPA: when a plugin checks a permission, the framework calls this module, which sends a request to OPA, and OPA's decision (ALLOW / DENY / CONDITIONAL) is returned to the framework. No OPA-specific code lives in your plugins.

## Step 1: Prerequisites

Confirm with the user that they have:

1. The Backstage Permission Framework enabled in `app-config.yaml` (`permission.enabled: true`) — but **no** `policy` set yet (the wrapper provides that).
2. A running OPA server. If not, offer to help with local dev setup using Docker (see the Deploying OPA section below).

For OPA server setup guidance, refer the user to the official OPA documentation — search for "OPA deployments" or "OPA getting started" on the Open Policy Agent website. The docs cover running OPA as a standalone server, as a sidecar, and as a Docker container.

## Step 2: Install the package

```bash
yarn add --cwd packages/backend @parsifal-m/plugin-permission-backend-module-opa-wrapper
```

## Step 3: Register the module

In `packages/backend/src/index.ts`, add the import. This is the only TypeScript change needed — the module self-registers:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
// ... existing plugins ...
backend.add(import('@parsifal-m/plugin-permission-backend-module-opa-wrapper'));
```

## Step 4: Configure the OPA connection

In `app-config.yaml`, add the OPA config under the `permission` key:

```yaml
permission:
  enabled: true
  opa:
    baseUrl: 'http://localhost:8181'
    policy:
      policyEntryPoint: 'rbac_policy/decision'
```

- `baseUrl`: URL of your OPA server
- `policyEntryPoint`: The Rego rule path OPA evaluates (package + rule name, e.g. `rbac_policy/decision`)

## Step 5: Write the Rego policy

Create a `.rego` file (e.g. `policies/rbac_policy.rego`). The starter policy below is a safe default — it allows everything by default, then adds targeted restrictions for admins vs. regular users. Show this to the user and ask them to adjust the `is_admin` claim and rules to fit their setup.

```rego
package rbac_policy

import rego.v1

# Helper for CONDITIONAL decisions (resource-level filtering)
conditional(plugin_id, resource_type, conditions) := {
  "result": "CONDITIONAL",
  "pluginId": plugin_id,
  "resourceType": resource_type,
  "conditions": conditions,
}

# Default: allow everything. Remove or tighten this once you have specific rules in place.
default decision := {"result": "ALLOW"}

# Shorthand aliases for readability
permission := input.permission.name
claims     := input.identity.claims

# Replace "group:default/admins" with the actual entity ref of your admin group
is_admin if "group:default/admins" in claims

# --- Catalog rules ---

# Only entity owners can delete; admins can delete anything
decision := conditional("catalog", "catalog-entity", {"anyOf": [{
  "resourceType": "catalog-entity",
  "rule": "IS_ENTITY_OWNER",
  "params": {"claims": claims},
}]}) if {
  permission == "catalog.entity.delete"
  not is_admin
}
```

### How the input looks at evaluation time

OPA receives:

```json
{
  "input": {
    "permission": { "name": "catalog.entity.delete" },
    "identity": {
      "user": "user:default/jane",
      "claims": ["user:default/jane", "group:default/platform-team"]
    }
  }
}
```

### Decision values OPA must return

| Result                                                                                     | When to use                              |
| ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `{"result": "ALLOW"}`                                                                      | Blanket allow                            |
| `{"result": "DENY"}`                                                                       | Blanket deny                             |
| `{"result": "CONDITIONAL", "pluginId": "...", "resourceType": "...", "conditions": {...}}` | Filter a list to matching resources only |

The `CONDITIONAL` result is powerful — instead of blocking access entirely, Backstage will only show the user entities that match the conditions (e.g. entities they own).

### Available catalog conditions

Use these rule names inside a `CONDITIONAL` decision:

| Rule              | Params                                  | Effect                              |
| ----------------- | --------------------------------------- | ----------------------------------- |
| `IS_ENTITY_OWNER` | `{"claims": claims}`                    | Only entities the user's groups own |
| `IS_ENTITY_KIND`  | `{"kinds": ["API", "Component"]}`       | Only entities of these kinds        |
| `HAS_ANNOTATION`  | `{"annotation": "key", "value": "val"}` | Only entities with this annotation  |
| `HAS_LABEL`       | `{"label": "my-label"}`                 | Only entities with this label       |
| `HAS_METADATA`    | `{"key": "name", "value": "foo"}`       | Only entities with this metadata    |

Combine rules with `anyOf`, `allOf`, or `not`.

## Step 6: Load the policy into OPA

For local development, run OPA with the policies directory mounted:

```bash
docker run -p 8181:8181 \
  -v $(pwd)/policies:/policies \
  openpolicyagent/opa:latest run \
  --server --watch /policies
```

For production (Kubernetes), deploy OPA as a sidecar and mount policies from a ConfigMap (see the quick-start docs for the full YAML).

## Adding a new permission rule

When the user wants to add a new rule to an existing policy:

1. Identify the permission name (e.g. `scaffolder.template.parameter.read`) — find it in the plugin source or docs.
2. Decide the decision type: ALLOW/DENY blanket, or CONDITIONAL with a filter.
3. Add a new `decision :=` rule in the `.rego` file with a condition on `permission == "the.permission.name"`.
4. Reload OPA (if `--watch` is set, file changes auto-reload; no Backstage restart needed).

Example — restrict Scaffolder template visibility by tag:

```rego
decision := conditional("scaffolder", "scaffolder-template", {"not": {"anyOf": [{
  "resourceType": "scaffolder-template",
  "rule": "HAS_TAG",
  "params": {"tag": "admin"},
}]}}) if {
  permission == "scaffolder.template.parameter.read"
  not is_admin
}
```

## Testing

### Unit testing

`OpaPermissionPolicy` is an internal implementation detail — it is **not** exported from the package's public API, so consumers cannot construct or import it directly. The TypeScript wiring (input mapping, decision parsing, CONDITIONAL validation) is covered by the package's own test suite.

For your app, the meaningful unit test surface is your Rego policy. Test it with `opa eval` as shown below.

If you need to verify integration behaviour (e.g. that your backend sends the right permission input to OPA), spy on `OpaClient.evaluatePermissionsFrameworkPolicy` — `OpaClient` **is** exported:

```typescript
import { OpaClient } from '@parsifal-m/plugin-permission-backend-module-opa-wrapper';

jest
  .spyOn(OpaClient.prototype, 'evaluatePermissionsFrameworkPolicy')
  .mockResolvedValue({ result: 'ALLOW' });
```

### Testing the Rego policy itself

Use the OPA CLI or the Rego Playground (search "OPA Rego Playground" — it's an interactive browser tool from the OPA project) to test policies in isolation before connecting them to Backstage:

```bash
# Test with a mock input file
echo '{"input": {"permission": {"name": "catalog.entity.delete"}, "identity": {"user": "user:default/jane", "claims": ["user:default/jane"]}}}' \
  | opa eval -d policies/rbac_policy.rego -I 'data.rbac_policy.decision'
```

### Debugging live decisions

Enable debug logging in Backstage to see the exact input sent to OPA and the response received:

```yaml
# app-config.yaml
backend:
  logging:
    level: debug
```

## Common mistakes

- **Wrong `policyEntryPoint`**: Must match the Rego package + rule exactly (`rbac_policy/decision` maps to `package rbac_policy` + `decision` rule).
- **Missing `CONDITIONAL` fields**: If the result is `CONDITIONAL`, OPA must return `pluginId`, `resourceType`, and `conditions` — the module will throw if any are missing.
- **Default deny blocks everything**: If you remove `default decision := {"result": "ALLOW"}` without adding explicit ALLOW rules, all permissions will be denied.
- **Policy not loaded**: If OPA returns an empty result, the policy file may not have been picked up. Check OPA's decision log.
