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

```diff
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-auth-backend'));
// ..... other plugins
+ backend.add(import('@parsifal-m/plugin-opa-backend'));
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

# By default we assume the entity is bad :)
default good_entity := false

# Its a good entity if there are no error violations
good_entity if {
	count({v | some v in violation; v.level == "error"}) == 0
}

# We check if the entity has a system set
is_system_present if {
	input.spec.system
}

# In each rule we check for certain entity metadata and if it is not present we add a violation
# In this one, we check if the entity has tags set, if it does not we add a warning violation
violation contains {"check_title": entity_check, "message": msg, "level": "warning"} if {
	not input.metadata.tags
	entity_check := "Tags"
	msg := "You do not have any tags set!"
}

# In this example, we check the lifecycle of the entity and if it is not one of the valid ones we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_lifecycles = {"production", "development", "experimental"}
	not valid_lifecycles[input.spec.lifecycle]
	entity_check := "Lifecycle"
	msg := "Incorrect lifecycle, should be one of production or development, experimental!"
}

# Here we check if the entity has a system set, if it does not we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	not is_system_present
	entity_check := "System"
	msg := "System is missing!"
}

# Lastly here, we check if the entity type is one of the valid ones, if it is not we add an error violation
violation contains {"check_title": entity_check, "message": msg, "level": "error"} if {
	valid_types = {"website", "library", "service"}
	not valid_types[input.spec.type]
	entity_check := "Type"
	msg := "Incorrect component type!"
}
```
