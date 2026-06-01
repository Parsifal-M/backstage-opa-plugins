# Local Development

The OPA Entity Checker Processor has a self-contained dev setup that lets you run and test it in isolation — no full Backstage app, no database, and no catalog ingestion cycle required.

## Prerequisites

- Node 22 or 24
- A running OPA server at `http://localhost:8181` with the `entity_checker` policy loaded — run `docker-compose up -d` from the repo root
- Dependencies installed: `yarn install --immutable`

## Starting the plugin

```bash
yarn workspace @parsifal-m/backstage-plugin-opa-entity-checker-processor start
```

The backend starts at `http://localhost:7007`.

## How it works

The dev backend directly instantiates `EntityCheckerClientImpl` (the OPA HTTP client) and `CatalogOPAEntityValidator` (the processor), then wires them into a single `POST /process` endpoint. Send any entity, get back the same entity with the `open-policy-agent/entity-checker-validation-status` annotation added. No catalog, no database, no waiting.

The root `app-config.yaml` in this repo already has the required config:

```yaml
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityCheckerProcessor:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
```

## Testing the endpoint

### POST /api/opa-entity-checker-processor-dev/process

Send an entity body. The response is the same entity with the validation annotation added.

#### Example: entity that passes all checks

```bash
curl -X POST http://localhost:7007/api/opa-entity-checker-processor-dev/process \
  -H 'Content-Type: application/json' \
  -d '{
    "apiVersion": "backstage.io/v1alpha1",
    "kind": "Component",
    "metadata": {
      "name": "good-component",
      "namespace": "default",
      "tags": ["java", "service"]
    },
    "spec": {
      "type": "service",
      "lifecycle": "production",
      "owner": "user:default/mock",
      "system": "examples"
    }
  }'
```

Expected response — annotation is `pass`:

```json
{
  "apiVersion": "backstage.io/v1alpha1",
  "kind": "Component",
  "metadata": {
    "name": "good-component",
    "namespace": "default",
    "tags": ["java", "service"],
    "annotations": {
      "open-policy-agent/entity-checker-validation-status": "pass"
    }
  },
  "spec": {
    "type": "service",
    "lifecycle": "production",
    "owner": "user:default/mock",
    "system": "examples"
  }
}
```

#### Example: entity with violations

Remove `metadata.tags`, set an invalid `spec.lifecycle`, and omit `spec.system` to trigger violations in the `entity_checker` policy:

```bash
curl -X POST http://localhost:7007/api/opa-entity-checker-processor-dev/process \
  -H 'Content-Type: application/json' \
  -d '{
    "apiVersion": "backstage.io/v1alpha1",
    "kind": "Component",
    "metadata": {
      "name": "bad-component",
      "namespace": "default"
    },
    "spec": {
      "type": "custom-type",
      "lifecycle": "legacy",
      "owner": "user:default/mock"
    }
  }'
```

Expected response — annotation is `error`:

```json
{
  "apiVersion": "backstage.io/v1alpha1",
  "kind": "Component",
  "metadata": {
    "name": "bad-component",
    "namespace": "default",
    "annotations": {
      "open-policy-agent/entity-checker-validation-status": "error"
    }
  },
  "spec": {
    "type": "custom-type",
    "lifecycle": "legacy",
    "owner": "user:default/mock"
  }
}
```

## Modifying the policy

The `entity_checker` Rego file lives at `policies/entity_checker/entity_checker.rego`. OPA runs with `--watch` in docker-compose, so policy changes reload without restarting OPA or the dev backend. Send another request immediately after saving the policy file to see the new result.

## No auth header required

The `/process` route is explicitly marked as unauthenticated (`addAuthPolicy({ allow: 'unauthenticated' })`), so no `Authorization` header is needed in Bruno or curl.
