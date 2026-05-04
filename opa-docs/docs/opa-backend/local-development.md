# Local Development

The OPA Backend plugin has a self-contained dev setup that lets you run and test it in isolation — no full Backstage app required.

## Prerequisites

- Node 22 or 24
- A running OPA server at `http://localhost:8181` — run `docker-compose up -d` from the repo root
- Dependencies installed: `yarn install --immutable`

## Starting the plugin

```bash
yarn workspace @parsifal-m/plugin-opa-backend start
```

The backend starts at `http://localhost:7007`. All routes are mounted under `/api/opa`.

The dev setup uses mocked Backstage services (`auth`, `httpAuth`, `userInfo`) so no real Backstage instance or database is needed. OPA itself must still be running for any route that evaluates a policy.

## Mock authentication

The dev backend uses `mockServices.httpAuth` and `mockServices.userInfo`, both permissive by design. Requests without an `Authorization` header succeed, and OPA always receives the same mock identity regardless of which token you pass:

```json
{
  "userEntityRef": "user:default/mock",
  "ownershipEntityRefs": ["user:default/mock"]
}
```

No auth header needed when testing locally.

## Testing the routes

### Health check

```bash
curl http://localhost:7007/api/opa/health
```

Expected response:

```json
{ "status": "ok" }
```

---

### POST /api/opa/opa-authz

Evaluates an OPA policy.

```bash
curl -X POST http://localhost:7007/api/opa/opa-authz \
  -H 'Content-Type: application/json' \
  -d '{
    "entryPoint": "opa_demo/allow",
    "input": {
      "method": "GET",
      "permission": { "name": "read-all-todos" }
    }
  }'
```

Expected response (policy returns `true` for this input — no ownership check on this rule):

```json
{ "result": true }
```

The plugin automatically merges `userEntityRef` and `ownershipEntityRefs` from the mock user into `input` before forwarding to OPA. See the [reference](./reference.md#post-apiopaopa-authz) for the full list of auto-injected fields.

To also include the full user entity, set `includeUserEntity: true`. The dev setup includes a mock `User` entity for `user:default/mock` in the catalog, so this resolves without needing a real catalog:

```bash
curl -X POST http://localhost:7007/api/opa/opa-authz \
  -H 'Content-Type: application/json' \
  -d '{
    "entryPoint": "opa_demo/allow",
    "input": {
      "method": "GET",
      "permission": { "name": "read-all-todos" }
    },
    "includeUserEntity": true
  }'
```

OPA will receive the full entity including annotations like `company.com/role`, `company.com/department`, and `company.com/team` — useful for writing policies that gate on role or other annotations. To change the mock user entity, edit `dev/index.ts`.

---

### POST /api/opa/entity-checker

Requires `openPolicyAgent.entityChecker.enabled: true` and `openPolicyAgent.entityChecker.policyEntryPoint` set in `app-config.yaml`.

```bash
curl -X POST http://localhost:7007/api/opa/entity-checker \
  -H 'Content-Type: application/json' \
  -d '{
    "input": {
      "apiVersion": "backstage.io/v1alpha1",
      "kind": "Component",
      "metadata": { "name": "sample", "namespace": "default" },
      "spec": { "type": "service", "lifecycle": "production" }
    }
  }'
```

---

### GET /api/opa/get-policy

Requires `openPolicyAgent.policyViewer.enabled: true`.

```bash
curl "http://localhost:7007/api/opa/get-policy?opaPolicy=https://raw.githubusercontent.com/your-org/your-repo/main/policies/my_policy.rego"
```
