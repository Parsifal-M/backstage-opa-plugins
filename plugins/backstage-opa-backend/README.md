![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-backend?logo=npm)

# Backstage OPA Backend Plugin

A Backstage backend plugin that acts as a proxy between Backstage plugins and your OPA server. It exposes HTTP routes that other plugins call — policy evaluation always happens inside OPA.

By itself, this plugin provides no user-facing features. It is a dependency of the plugins listed below.

> **Note:** This plugin is **NOT** required for the [OPA Permissions Wrapper Module](https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-permissions-wrapper-module/introduction). That module talks directly to OPA.

## Dependent plugins

| Plugin                                                                                                        | Route used                     |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| [OPA Authz React](https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-authz-react/introduction)       | `POST /api/opa/opa-authz`      |
| [OPA Entity Checker](https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-entity-checker/introduction) | `POST /api/opa/entity-checker` |
| [OPA Policies](https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-policies/introduction)             | `GET /api/opa/get-policy`      |

## Installation

### 1. Install the package

```bash
yarn --cwd packages/backend add @parsifal-m/plugin-opa-backend
```

### 2. Register the plugin

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins
backend.add(import('@parsifal-m/plugin-opa-backend'));

backend.start();
```

### 3. Configure `app-config.yaml`

```yaml
openPolicyAgent:
  # Base URL of your OPA server. Required for routes that call OPA.
  baseUrl: 'http://localhost:8181'

  entityChecker:
    # Enable the /api/opa/entity-checker route (used by opa-entity-checker)
    enabled: true
    policyEntryPoint: 'entity_checker/violation'

  policyViewer:
    # Enable the /api/opa/get-policy route (used by opa-policies)
    enabled: true
```

> The `/api/opa/opa-authz` route (used by `opa-authz-react`) is **always mounted** — no `enabled` flag needed. All other routes are disabled by default.

## Full documentation

[https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-backend/introduction](https://parsifal-m.github.io/backstage-opa-plugins/docs/opa-backend/introduction)

## Contributing

Contributions and suggestions welcome. For significant changes, open an issue first. Fork the repo, make your changes, and open a PR.

Remember to sign your commits with `git commit -s`.

Reach out on [Mastodon](https://hachyderm.io/@parcifal) with any questions.

## License

This project is released under the Apache 2.0 License.
