# Local Development

The OPA Node service has a self-contained dev setup that lets you run and test it in isolation — no full Backstage app required.

## Prerequisites

- Node 22 or 24
- A running OPA server at `http://localhost:8181` — run `docker-compose up -d` from the repo root
- Dependencies installed: `yarn install`

## Starting the service

```bash
yarn workspace @parsifal-m/backstage-plugin-opa-node start
```

The backend starts at `http://localhost:7007`. The dev plugin mounts a single test route at `/api/opa-node-dev/evaluate`.

The dev setup uses mocked Backstage services (`auth`, `httpAuth`) so no real Backstage instance or database is needed. OPA itself must still be running.

## Mock authentication

The dev backend uses `mockServices.auth` and `mockServices.httpAuth`, both permissive by design. No `Authorization` header is needed when testing locally.

## Testing the route

### POST /api/opa-node-dev/evaluate

Evaluates an OPA policy via the `opaService`. Send any `input` object and an `entryPoint` matching a policy loaded into your OPA server.

The example below targets the `opa_demo` policy from the repo's `policies/` directory:

```bash
curl -X POST http://localhost:7007/api/opa-node-dev/evaluate \
  -H 'Content-Type: application/json' \
  -d '{
    "input": {
      "method": "GET",
      "permission": { "name": "read-all-todos" }
    },
    "entryPoint": "opa_demo"
  }'
```

Expected response — the `allow` rule in `package opa_demo` fires for this input:

```json
{ "result": { "allow": true } }
```

To verify a deny, change `method` to anything other than `"GET"` — no rule matches and `default allow := false` applies:

```json
{ "result": { "allow": false } }
```

The `entryPoint` string maps directly to the Rego package path: `"opa_demo"` → `/v1/data/opa_demo`. To target a specific rule, use the full path: `"opa_demo/allow"`.
