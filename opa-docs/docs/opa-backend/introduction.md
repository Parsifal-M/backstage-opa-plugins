# OPA Backend Plugin

The OPA Backend plugin (`@parsifal-m/plugin-opa-backend`) is a Backstage backend plugin that acts as a proxy between Backstage plugins and your OPA server. It exposes HTTP routes that other plugins call — it does not evaluate policy itself. Policy evaluation always happens inside OPA.

## What this plugin does

The plugin mounts three HTTP routes under `/api/opa`:

| Route             | Method | Always mounted? | Purpose                                                   |
| ----------------- | ------ | --------------- | --------------------------------------------------------- |
| `/health`         | GET    | Yes             | Health check, unauthenticated                             |
| `/opa-authz`      | POST   | Yes             | UI authorization — used by `opa-authz-react`              |
| `/entity-checker` | POST   | Opt-in          | Entity metadata validation — used by `opa-entity-checker` |
| `/get-policy`     | GET    | Opt-in          | Fetch a Rego policy file — used by `opa-policies`         |

`/opa-authz` is always mounted regardless of configuration. The other two routes are disabled by default and must be explicitly enabled in `app-config.yaml`.

## Which plugin uses which route

| Plugin                                                        | Route consumed                 |
| ------------------------------------------------------------- | ------------------------------ |
| [`opa-authz-react`](../opa-authz-react/introduction.md)       | `POST /api/opa/opa-authz`      |
| [`opa-entity-checker`](../opa-entity-checker/introduction.md) | `POST /api/opa/entity-checker` |
| [`opa-policies`](../opa-policies/introduction.md)             | `GET /api/opa/get-policy`      |

Install only this plugin if you are using at least one of the above.

## What this plugin is NOT

**Not required for the OPA Permissions Wrapper Module.** The [`permission-backend-module-opa-wrapper`](../opa-permissions-wrapper-module/introduction.md) talks directly to OPA — it does not go through this plugin. The two are completely independent.

**`/get-policy` does not call OPA.** The policy viewer route fetches the raw `.rego` file content from a repository URL using Backstage's `UrlReader` service. OPA is not involved.

## How `/opa-authz` enriches input

When `opa-authz-react` calls `/opa-authz`, the plugin automatically enriches the input before forwarding it to OPA:

- `userEntityRef` — the Backstage entity ref of the calling user (e.g. `user:default/jane`)
- `ownershipEntityRefs` — all entity refs the user owns
- `userEntity` _(optional)_ — the full Backstage `User` entity from the catalog, included only when the caller sets `includeUserEntity: true`

This means your Rego policy always has user identity context available without the frontend needing to fetch or pass it explicitly.

See the [Reference](./reference.md) for full request and response shapes.

## Get started

- [Quick Start](./quick-start.md) — install and configure the plugin
- [Reference](./reference.md) — config keys and HTTP endpoint specs

## Join the community

- [Backstage Community](https://backstage.io)
- [Open Policy Agent Community](https://www.openpolicyagent.org)
- [Join OPA on Slack](https://slack.openpolicyagent.org/)
- [Backstage Discord](https://discord.com/invite/MUpMjP2)

## License

This project is licensed under the Apache 2.0 License.
