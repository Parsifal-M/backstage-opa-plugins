# AGENTS.md — Backstage OPA Plugins

This file provides context for AI agents working in this repository.

## What this repo is

A Yarn monorepo containing a collection of published Backstage plugins and modules that integrate Open Policy Agent (OPA) with Backstage. The goal is to decouple authorization policy from application code — policies live in `.rego` files, are evaluated by a running OPA server, and can be updated without redeploying Backstage.

The repo also contains a full local Backstage app (`packages/app` + `packages/backend`) used for development and demonstration.

## Repo structure

```
plugins/          — published plugins and modules (see below)
packages/app      — Backstage frontend app (local dev only)
packages/backend  — Backstage backend app (local dev only)
policies/         — example Rego policies used by the local dev app
opa-docs/         — Docusaurus documentation site
.claude/skills/   — Claude Code skills for working with this repo
```

## Plugins at a glance

### Published plugins

| Directory                                               | npm package                                                 | Type                                            | Purpose                                                                                                                                                                                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugins/permission-backend-module-opa-wrapper`         | `@parsifal-m/plugin-permission-backend-module-opa-wrapper`  | Backend module                                  | Wraps the Backstage Permission Framework — delegates permission decisions to OPA. Self-registers, no policy code needed in TypeScript.                                                                                    |
| `plugins/backstage-opa-backend`                         | `@parsifal-m/plugin-opa-backend`                            | Backend plugin                                  | Provides HTTP routes used by `opa-authz-react` and `opa-entity-checker` to evaluate policies. Required for those frontend plugins.                                                                                        |
| `plugins/opa-node`                                      | `@parsifal-m/backstage-plugin-opa-node`                     | Backend library                                 | Provides `opaService` — a Backstage service ref that any backend plugin can inject to call OPA directly for route-level authorization.                                                                                    |
| `plugins/backstage-plugin-opa-authz-react`              | `@parsifal-m/backstage-plugin-opa-authz-react`              | Web library (`web-library`)                     | React components (`RequireOpaAuthz`) and hooks (`useOpaAuthz`, `useOpaAuthzManual`) for hiding/showing UI elements based on OPA decisions. **Legacy frontend system only — not yet migrated to the new frontend system.** |
| `plugins/backstage-opa-entity-checker`                  | `@parsifal-m/plugin-opa-entity-checker`                     | Frontend plugin                                 | Entity page card that shows whether an entity passes an OPA validation policy.                                                                                                                                            |
| `plugins/backstage-plugin-opa-entity-checker-processor` | `@parsifal-m/backstage-plugin-opa-entity-checker-processor` | Backend plugin module (`backend-plugin-module`) | Catalog processor that validates entity metadata during ingestion using OPA and adds annotation results.                                                                                                                  |
| `plugins/backstage-opa-policies`                        | `@parsifal-m/plugin-opa-policies`                           | Frontend plugin                                 | Entity page component that fetches and displays the OPA policy associated with an entity via a catalog annotation.                                                                                                        |
| `plugins/opa-common`                                    | `@parsifal-m/backstage-plugin-opa-common`                   | Shared library                                  | Shared TypeScript types used across multiple plugins (`PolicyInput`, `PolicyResult`, etc.).                                                                                                                               |

### Internal (demo only, not published)

| Directory                   | npm package                                    | Purpose                                                                 |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `plugins/opa-demo-backend`  | `@internal/backstage-plugin-opa-demo-backend`  | Demo backend plugin showing `opaService` usage with a todo list service |
| `plugins/opa-demo-frontend` | `@internal/backstage-plugin-opa-frontend-demo` | Demo frontend plugin showing `RequireOpaAuthz` usage                    |

## Key architectural concepts

### Two separate config sections

The plugins use two distinct `app-config.yaml` sections — do not confuse them:

```yaml
# Used by permission-backend-module-opa-wrapper only
permission:
  enabled: true
  opa:
    baseUrl: 'http://localhost:8181'
    policy:
      policyEntryPoint: 'rbac_policy/decision'
      policyFallbackDecision: 'allow'

# Used by backstage-opa-backend, opa-entity-checker, opa-entity-checker-processor
openPolicyAgent:
  baseUrl: 'http://localhost:8181'
  entityChecker:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
  entityCheckerProcessor:
    enabled: true
    policyEntryPoint: 'entity_checker/violation'
  policyViewer:
    enabled: true
```

The `/opa-authz` route (used by `opa-authz-react`) is **always mounted** by `backstage-opa-backend` — no `enabled` flag required. The `entityChecker` and `policyViewer` sub-features are **disabled by default** and must be explicitly enabled via their respective `enabled: true` flags. The `entityCheckerProcessor` enabled flag is read by the separate processor plugin, not by `backstage-opa-backend`.

### OPA server requirement

A running OPA server is required only by the features that actually evaluate policies:

- `permission-backend-module-opa-wrapper` — delegates permission decisions to OPA
- `backstage-opa-backend` `/opa-authz` route — used by `opa-authz-react` for UI authorization
- `backstage-opa-backend` entity checker route — validates entities against OPA
- `backstage-plugin-opa-entity-checker-processor` — calls OPA during catalog ingestion
- `opa-node` service — used by backend plugins for route-level authorization

`plugin-opa-policies` and the `policyViewer` backend route do **not** call OPA — they fetch policy file content directly from a repo URL via `UrlReader`.

For local development, `docker-compose up -d` starts OPA (port 8181) and a Postgres database. OPA runs with `--watch` so policy file changes reload without restart.

### Rego policy conventions

- The `permission-backend-module-opa-wrapper` policy must return `{"result": "ALLOW"}`, `{"result": "DENY"}`, or a `{"result": "CONDITIONAL", "pluginId": "...", "resourceType": "...", "conditions": {...}}` object.
- The `opa-authz-react` frontend policy must return `{"allow": true|false}`.
- The `opa-node` service policy shape is user-defined — whatever the plugin's router expects.
- The `entity_checker` policy returns `violation` messages as an array of strings.
- Entry point strings map to Rego packages: `"rbac_policy/decision"` → `package rbac_policy`, rule `decision`.

## Claude Code skills

Project-local skills live in `.claude/skills/`. Use them when working on these areas:

| Skill                           | When to use                                                                |
| ------------------------------- | -------------------------------------------------------------------------- |
| `opa-permissions-wrapper-setup` | Setting up or modifying the permissions wrapper module and its Rego policy |
| `opa-service-integration`       | Adding `opaService` to a backend plugin for route-level OPA authorization  |
| `opa-authz-react`               | Adding or modifying `RequireOpaAuthz` / `useOpaAuthz` in a frontend plugin |

## Development workflow

```bash
yarn install --immutable        # install deps
docker-compose up -d            # start OPA + Postgres
yarn dev                        # start Backstage (frontend + backend)
yarn test                       # run all tests
yarn lint:all                   # lint all packages
yarn tsc                        # type-check
```

Node version: 22 or 24. Backstage version: see `backstage.json` (currently 1.46.1).

Commits must be signed: `git commit -s`.

## Testing conventions

- Backend tests use `@backstage/backend-test-utils` (`mockServices`) — do not spin up real services.
- Frontend tests use `@backstage/test-utils` (`renderInTestApp`, `TestApiProvider`).
- OPA client/service is always mocked in unit tests — never call a real OPA server in tests.
- Test files sit alongside source files (`*.test.ts` / `*.test.tsx`).

## What to watch out for

- `backstage-plugin-opa-authz-react` uses the **legacy frontend system** (`createPlugin`, `createApiFactory`, `apis.ts`). Do not attempt to migrate it to the new frontend system without updating the skill and docs.
- `opaService` (from `opa-node`) has a **built-in `defaultFactory`** inside `@parsifal-m/backstage-plugin-opa-node` — it is self-registering and reads `openPolicyAgent.baseUrl` from config. No separate backend plugin registration is required; adding the library dependency is sufficient.
- `permission-backend-module-opa-wrapper` does **not** require `backstage-opa-backend` — it talks to OPA directly.
- Changesets are used for versioning — run `yarn changeset` before merging a change to a published package.
