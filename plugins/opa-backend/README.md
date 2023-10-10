# opa-backend

This serves as the OPA Backend Plugin, eventually to route all your OPA needs through!

This plugin is still in development so please use with caution.

# Pre-requisites

This plugin has no pre-requisites.

## Installation

```bash
yarn add @parsifal-m/opa-backend
```

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
//...
import opa from './plugins/opa';

//...
const opaEnv = useHotMemoize(module, () => createEnv('opa'));

//...
apiRouter.use('/opa', await opa(opaEnv));
```

In your `app-config.yaml` file, add the following:

```yaml
opaClient:
  baseUrl: 'http://localhost:8181'
  policies:
    entityChecker: # Entity checker plugin
      package: 'entitymeta'
    catalogPermission: # Permission wrapper plugin
      package: 'catalog_policy'
    scaffolderTemplatePermission:
      package: 'scaffolder_template_policy'
    scaffolderActionPermission:
      package: 'scaffolder_action_policy'
```

This plugin currently works together with the [opa-entity-checker](../opa-entity-checker/README.md) plugin. The `package` name in the `app-config.yaml` file should match the `package` name in the `rego` file of the `opa-entity-checker` plugin.

## Contributing

I am happy to accept contributions to this plugin. Please fork the repository and open a PR with your changes. If you have any questions, please feel free to reach out to me on [Mastodon](https://hachyderm.io/@parcifal) or [Twitter](https://twitter.com/_PeterM_) (I am not as active on Twitter)

## License

This project is released under the Apache 2.0 License.
