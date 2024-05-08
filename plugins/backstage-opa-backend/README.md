![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-backend?logo=npm)

# backstage-opa-backend

This serves as the OPA Backend Plugin, eventually to route all your OPA needs through!

This plugin is still in development so please use with caution.

# Pre-requisites

The only pre-requisites to use this plugin is that you have set up an OPA server. You can find more information on how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/). And you have a Backstage instance running. More info on how to do that [here](https://backstage.io/docs/getting-started).

## Installation

This plugin is currently used by the [backstage-opa-entity-checker](../backstage-opa-entity-checker/README.md).

Start with installing the package:

```bash
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

In your `app-config.yaml` file, add the following:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      entrypoint: 'entity_checker/violation'
```

### Import the plugin into the Backstage Backend

This assumes you are using the [New Backend System](https://backstage.io/docs/backend-system/), (you should be!) registering the plugin is much easier.

Add the following to your `packages/backend/src/index.ts` file:

```ts
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ...
backend.add(import('@parsifal-m/plugin-opa-backend'));

// ...
backend.start();
```

# Note!

The `entrypoint` name in the `app-config.yaml` file should be the entrypoint to the policy in the `rego` file. You can find some working example of policies to use with this plugin [here](https://github.com/Parsifal-M/backstage-opa-policies) or in [here](../../example-opa-policies/README.md)

## Contributing

I am happy to accept contributions to this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal)

## License

This project is released under the Apache 2.0 License.
