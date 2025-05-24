# Using The Plugin In Local Development

If you are using this plugin and want to know how to use it in local development, you can follow the steps below, note that this is not the only way to do it, but how its done in this repository.

## Pre-requisites

- Install the [OPA Backend](../opa-backend/quick-start.md) plugin.
- Install the [OPA Entity Checker](../opa-entity-checker/quick-start.md) plugin.
- This assumes you are using `Postgres` as your database in your `app-config.yaml` file, although this is not mandatory.

## Installing The OPA Entity Checker Plugin And The OPA Backend Plugin

Run the following command to install the OPA Entity Checker plugin in your Backstage project.

```bash
yarn add --cwd packages/app @parsifal-m/plugin-opa-entity-checker && yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

Then make the following changes to the `packages/backend/src/index.ts` file in your Backstage project.

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
backend.add(import('@parsifal-m/plugin-opa-backend'));
```

## Add The OPA Entity Checker Plugin To Your Frontend

Add the following to your `EntityPage.tsx` file:

```tsx
import { OpaMetadataAnalysisCard } from '@parsifal-m/plugin-opa-entity-checker';

//...

const overviewContent = (
  //...
  <Grid item md={6} xs={12}>
    <OpaMetadataAnalysisCard />
  </Grid>
  //...
);
```

## Configuration

The OPA client requires configuration to connect to the OPA server. You need to provide a `baseUrl` and an `entrypoint` for the OPA server in your Backstage app-config.yaml, based on the example above we would have the following configuration:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      entrypoint: 'entity_checker/violation'
```

## Docker Compose

You can create a `docker-compose.yaml` file in the root of the repository with the following content:

```yaml
services:
  postgres:
    image: postgres:15.5-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devPostgres
    ports:
      - 5432:5432
  opa:
    image: openpolicyagent/opa:0.60.0-static
    command:
      - 'run'
      - '--server'
      - '--watch'
      - '--log-format=json-pretty'
      - '--set=decision_logs.console=true'
      - '/policies/entity_checker.rego'
    ports:
      - 8181:8181
    volumes:
      - ./policies:/policies
```

Then you'll need to make sure you have a `policies` folder in the root of the repository with the following content:

```rego
package entity_checker

import rego.v1

is_system_present if {
    input.spec.system
}

check contains {
    # The title of the check
    "check_title": "Tags",
    # The message to display
    "message": "You do not have any tags set!",
    # The level of the check, can be info, warning, error, or success
    "level": "info",
    # A url to the documentation about tags, helpful for the user to understand the check
    "url": "https://docs.gitlab.com/user/project/repository/tags/"
} if {
    not input.metadata.tags
}

check contains {
    "check_title": "Lifecycle",
    "message": "Incorrect lifecycle, should be one of production or development, experimental!",
    "level": "error"
} if {
    valid_lifecycles = {"production", "development", "experimental"}
    not valid_lifecycles[input.spec.lifecycle]
}

check contains {
    "check_title": "Namespace",
    "message": "Correct namespace!",
    "level": "error"
} if {
    valid_namespaces = {"dev", "staging", "production"}
    valid_namespaces[input.metadata.namespace]
}

check contains {
    "check_title": "System",
    "message": "System is missing!",
    "level": "error"
} if {
    not is_system_present
}

check contains {
    "check_title": "Type",
    "message": "Correct Component Type!",
    "level": "success"
} if {
    valid_types = {"website", "library", "service"}
    valid_types[input.spec.type]
}
```
