import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const opaPlugin = createBackendPlugin({
  pluginId: 'opa',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, httpRouter, config }) {
        httpRouter.use(
          await createRouter({
            config,
            logger: loggerToWinstonLogger(logger),
          }),
        );
      },
    });
  },
});
