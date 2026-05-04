# Reference

Technical specification for the OPA Backend plugin — configuration keys and HTTP endpoints.

## Configuration

All keys live under `openPolicyAgent` in `app-config.yaml`.

| Key                                              | Type      | Default                                                                    | Description                                                                                                                   |
| ------------------------------------------------ | --------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `openPolicyAgent.baseUrl`                        | `string`  | `http://localhost:8181` for `/opa-authz`, no default for `/entity-checker` | Base URL of your OPA server. Set this explicitly — `/entity-checker` returns a 500 if it is missing.                          |
| `openPolicyAgent.entityChecker.enabled`          | `boolean` | `false`                                                                    | Mounts the `/entity-checker` route when `true`.                                                                               |
| `openPolicyAgent.entityChecker.policyEntryPoint` | `string`  | —                                                                          | Rego entry point for entity validation. Required when `entityChecker.enabled` is `true`. Example: `entity_checker/violation`. |
| `openPolicyAgent.policyViewer.enabled`           | `boolean` | `false`                                                                    | Mounts the `/get-policy` route when `true`.                                                                                   |

### Entry point format

Entry points map directly to Rego package and rule names. The string `entity_checker/violation` maps to `package entity_checker`, rule `violation`.

---

## HTTP Endpoints

All routes are mounted under `/api/opa`.

---

### `GET /api/opa/health`

Health check endpoint.

- **Auth:** unauthenticated
- **Always mounted:** yes

**Response**

```json
{ "status": "ok" }
```

---

### `POST /api/opa/opa-authz`

Evaluates an OPA policy and returns the result. Used by [`opa-authz-react`](../opa-authz-react/introduction.md).

- **Auth:** requires user credentials (Backstage user token)
- **Always mounted:** yes — no config flag required

**Request body**

```json
{
  "entryPoint": "my_policy/decision",
  "input": {
    "action": "read",
    "resourceType": "catalog-entity"
  },
  "includeUserEntity": false
}
```

| Field               | Type      | Required | Description                                                                                                          |
| ------------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `entryPoint`        | `string`  | Yes      | Rego entry point to evaluate (e.g. `my_policy/decision`).                                                            |
| `input`             | `object`  | Yes      | Arbitrary input data forwarded to OPA.                                                                               |
| `includeUserEntity` | `boolean` | No       | When `true`, fetches the full Backstage `User` entity from the catalog and adds it to the OPA input as `userEntity`. |

**Auto-injected fields**

The plugin automatically adds the following to `input` before forwarding to OPA, regardless of what the caller sends:

| Field                 | Type             | Description                                                                |
| --------------------- | ---------------- | -------------------------------------------------------------------------- |
| `userEntityRef`       | `string`         | Backstage entity ref of the calling user (e.g. `user:default/jane`).       |
| `ownershipEntityRefs` | `string[]`       | All entity refs the user owns.                                             |
| `userEntity`          | `Entity \| null` | Full Backstage `User` entity. Only present when `includeUserEntity: true`. |

**Response**

The raw response body from OPA's `/v1/data/<entryPoint>` endpoint, passed through unchanged. Shape depends on your Rego policy.

**Error responses**

| Status | Cause                                                               |
| ------ | ------------------------------------------------------------------- |
| `400`  | Missing `input` or `entryPoint` in request body.                    |
| `500`  | OPA server unreachable, or error fetching user entity from catalog. |

---

### `POST /api/opa/entity-checker`

Validates a Backstage entity against an OPA policy. Used by [`opa-entity-checker`](../opa-entity-checker/introduction.md).

- **Auth:** requires a valid Backstage token (user or service-to-service); enforced by the framework
- **Requires config:** `openPolicyAgent.entityChecker.enabled: true` and `openPolicyAgent.entityChecker.policyEntryPoint`

**Request body**

```json
{
  "input": {
    /* Backstage Entity object */
  }
}
```

**Response**

```json
{
  "result": [
    {
      "decision_id": "abc123",
      "check_title": "Owner must be set",
      "level": "error",
      "message": "Entity is missing an owner annotation."
    }
  ]
}
```

| Field                  | Type                             | Description                                                                                  |
| ---------------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| `result`               | `OpaResult[]`                    | Array of violation messages returned by OPA. Empty array means the entity passes all checks. |
| `result[].level`       | `"error" \| "warning" \| "info"` | Severity of the violation.                                                                   |
| `result[].message`     | `string`                         | Human-readable violation description.                                                        |
| `result[].check_title` | `string`                         | Optional title for the check.                                                                |
| `result[].decision_id` | `string`                         | Optional OPA decision ID for tracing.                                                        |

**Error responses**

| Status | Cause                                                                |
| ------ | -------------------------------------------------------------------- |
| `400`  | Missing entity metadata in request body.                             |
| `500`  | `baseUrl` or `policyEntryPoint` not configured, or OPA server error. |

---

### `GET /api/opa/get-policy`

Fetches the raw content of a Rego policy file from a URL. Used by [`opa-policies`](../opa-policies/introduction.md).

- **Auth:** requires a valid Backstage token (user or service-to-service); enforced by the framework
- **Requires config:** `openPolicyAgent.policyViewer.enabled: true`
- **Does not call OPA** — reads the file via Backstage's `UrlReader` service

**Query parameters**

| Parameter   | Type     | Required | Description                                                                                                |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `opaPolicy` | `string` | Yes      | URL of the `.rego` policy file to fetch (e.g. a raw GitHub URL). Omitting this will result in a 500 error. |

**Response**

```json
{
  "opaPolicyContent": "package my_policy\n\ndefault allow = false\n..."
}
```

**Edge cases**

| Scenario                                | Status | Body                                   |
| --------------------------------------- | ------ | -------------------------------------- |
| `opaPolicy` query param missing         | `500`  | Error passed to middleware             |
| Policy file not found (`NotFoundError`) | `200`  | `{}` — `opaPolicyContent` field absent |
| Other fetch error (network, auth)       | `500`  | Error passed to middleware             |
