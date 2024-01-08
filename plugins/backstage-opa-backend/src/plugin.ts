import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { loggerToWinstonLogger } from '@backstage/backend-common';

/**
 * The OPA Backend Plugin.
 * @public
 */

export const opaBackendPlugin = createBackendPlugin({
  pluginId: 'opa-backend',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, httpRouter }) {
        httpRouter.use(
          await createRouter({ config, logger: loggerToWinstonLogger(logger) }),
        );
      },
    });
  },
});
