# Local Development

The OPA Permissions Wrapper Module has a self-contained dev setup that lets you run and test it in isolation — no full Backstage app or database required.

## Prerequisites

- Node 22 or 24
- A running OPA server at `http://localhost:8181` with the `rbac_policy` loaded — run `docker-compose up -d` from the repo root
- Dependencies installed: `yarn install --immutable`

## Starting the plugin

```bash
yarn workspace @parsifal-m/plugin-permission-backend-module-opa-wrapper start
```

The backend starts at `http://localhost:7007`.

## How it works

The dev backend directly instantiates `OpaClient` and `OpaPermissionPolicy`, then wires them into a single `POST /evaluate` endpoint. Send a permission name and optional user identity, get back the raw OPA decision. No permission framework validation, no `resourceRef` requirements, no auth headers needed.

The root `app-config.yaml` in this repo already has the required config:

```yaml
permission:
  opa:
    baseUrl: 'http://localhost:8181'
    policy:
      policyEntryPoint: 'rbac_policy/decision'
      policyFallbackDecision: 'allow'
```

## Testing the endpoint

### POST /api/opa-permission-wrapper-dev/evaluate

Send `permissionName` and optionally override `userEntityRef` and `ownershipEntityRefs`. The defaults simulate a non-admin user (`user:default/mock` with no group memberships).

#### Testing a DENY decision

Any permission with no matching rule in `rbac_policy` hits the `default decision := {"result": "DENY"}`:

```bash
curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"permissionName": "scaffolder.task.create"}'
```

Expected response:

```json
{ "result": "DENY" }
```

---

#### Testing a CONDITIONAL decision

`catalog.entity.read` is delegated to `catalog_rules`, which returns CONDITIONAL for non-admins (only Component-kind entities are readable):

```bash
curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"permissionName": "catalog.entity.read"}'
```

Expected response:

```json
{
  "result": "CONDITIONAL",
  "pluginId": "catalog",
  "resourceType": "catalog-entity",
  "conditions": {
    "anyOf": [
      {
        "resourceType": "catalog-entity",
        "rule": "IS_ENTITY_KIND",
        "params": { "kinds": ["Component"] }
      }
    ]
  }
}
```

---

#### Testing an ALLOW decision (admin user)

Override `ownershipEntityRefs` to include `group:default/maintainers`, which satisfies `is_admin` in `rbac_policy`:

```bash
curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "permissionName": "catalog.entity.read",
    "ownershipEntityRefs": ["group:default/maintainers"]
  }'
```

Expected response:

```json
{ "result": "ALLOW" }
```

---

#### Testing with a custom user

You can fully override the identity sent to OPA:

```bash
curl -X POST http://localhost:7007/api/opa-permission-wrapper-dev/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "permissionName": "catalog.entity.delete",
    "userEntityRef": "user:default/alice",
    "ownershipEntityRefs": ["user:default/alice", "group:default/team-a"]
  }'
```

This maps directly to the `input.identity` object OPA receives:

```json
{
  "permission": { "name": "catalog.entity.delete" },
  "identity": {
    "user": "user:default/alice",
    "claims": ["user:default/alice", "group:default/team-a"]
  }
}
```

## Modifying the policy

The `rbac_policy` and `catalog_rules` Rego files live in `policies/` at the repo root. OPA runs with `--watch` in docker-compose, so any change to those files reloads without restarting OPA or the dev backend. Send another request immediately after saving to see the updated decision.

## Fallback behaviour

If OPA is unreachable, the module returns the configured fallback (`allow` by default in this repo). To test the deny fallback, stop OPA — the next request returns `{ "result": "DENY" }` and logs a warning.
