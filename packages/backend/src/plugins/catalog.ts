import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GithubOrgEntityProvider } from '@backstage/plugin-catalog-backend-module-github';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());

  builder.addEntityProvider(
    GithubOrgEntityProvider.fromConfig(env.config, {
      id: 'development',
      orgUrl: 'https://github.com/twocodersbrewing',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 2 },
        timeout: { minutes: 3 },
      }),
    }),
  );


  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
