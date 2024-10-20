![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-backend?logo=npm)

# Backstage OPA Backend Plugin

A backend plugin for Backstage, this plugin integrates with the Open Policy Agent (OPA) to facilitate policy evaluation.

It's a dependency of the following plugins:

- [OPA Entity Checker](../opa-entity-checker/introduction.md#keep-your-entity-data-in-check-with-opa-entity-checker)
- [OPA Policies](../opa-policies/introduction.md)
- [OPA Authz React](../opa-authz-react/introduction.md)

By itself, this plugin does not provide any user-facing features.

> This plugin is **NOT** required for the [OPA Permissions Wrapper Module](../opa-permissions-wrapper-module/introduction.md).

# Pre-requisites

The only pre-requisites to use this plugin is that you have set up an OPA server. You can find more information on how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/). And you have a Backstage instance running. More info on how to do that [here](https://backstage.io/docs/getting-started).

Or, you can check [these docs](../../docs/deploying-opa/deploying-opa.md#deploying-opa) for a quick guide on how to deploy OPA as a sidecar to your Backstage instance and add policies to it.

## Installation

This plugin is currently used by the [backstage-opa-entity-checker](../backstage-opa-entity-checker/README.md), and the [backstage-opa-policies](../backstage-opa-policies/README.md) plugins. You can install it by running the following command:

Start with installing the package:

```bash
yarn add --cwd packages/backend @parsifal-m/plugin-opa-backend
```

In your `app-config.yaml` file, add the following:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
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

I am happy to accept contributions and suggestions for these plugins, if you are looking to make significant changes, please open an issue first to discuss the changes you would like to make!

Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal).

Please remember to sign your commits with `git commit -s` so that your commits are signed!

## License

This project is released under the Apache 2.0 License.
