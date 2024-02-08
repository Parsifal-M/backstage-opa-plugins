![NPM Version](https://img.shields.io/npm/v/%40parsifal-m%2Fplugin-opa-backend?logo=npm)

# backstage-opa-backend

This serves as the OPA Backend Plugin, eventually to route all your OPA needs through!

This plugin is still in development so please use with caution.

# Pre-requisites

The only pre-requisites to use this plugin is that you have set up an OPA server. You can find more information on how to do that [here](https://www.openpolicyagent.org/docs/latest/deployments/). And you have a Backstage instance running. More info on how to do that [here](https://backstage.io/docs/getting-started).

## Installation

This plugin currently works together with the [opa-entity-checker](../backstage-opa-entity-checker/README.md) and the [opa-permissions-wrapper](../../packages/backstage-opa-permissions-wrapper/README.md) plugin(s).

Start with installing the package:

```bash
yarn --cwd packages/backend add @parsifal-m/plugin-opa-backend
```

In your `app-config.yaml` file, add the following:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      package: 'entity_checker'
    rbac: # Permission wrapper plugin
      package: 'rbac_policy'
```

> NOTE: Currently backstage supports a new way to register backend plugins on the [New Backend System](https://backstage.io/docs/backend-system/), if you are already using the new backend system please continue with the installation of this plugin in the following section: [Register To The New Backend System](#register-to-the-new-backend-system).

Then add `opa.ts` to your packages/backend/src/plugins.ts directory with the following contents:

```ts
import { createRouter } from '@parsifal-m/plugin-opa-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

And then add the following to your `packages/backend/src/index.ts` file:

```ts
// Add this to your imports
import opa from './plugins/opa';

// And the lines below to the main function
const opaEnv = useHotMemoize(module, () => createEnv('opa'));

apiRouter.use('/opa', await opa(opaEnv));
```

### Register To The New Backend System

If you are already using the [New Backend System](https://backstage.io/docs/backend-system/), registering the plugin is much easier.

Add the following to your `packages/backend/src/index.ts` file:

```ts
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@parsifal-m/plugin-opa-backend'));

backend.start();
```

# Note!

The `package` name in the `app-config.yaml` file should match the `package` name in the `rego` file. You can find some working example of policies to use with this plugin [here](https://github.com/Parsifal-M/backstage-opa-policies) or in [here](../../example-opa-policies/README.md)

## Contributing

I am happy to accept contributions to this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal)

## License

This project is released under the Apache 2.0 License.
