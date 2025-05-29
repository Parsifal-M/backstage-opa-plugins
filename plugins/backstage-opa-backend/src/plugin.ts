import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

export const opaPlugin = createBackendPlugin({
  pluginId: 'opa',
  register(env) {
    env.registerInit({
      deps: {
        catalogApi: catalogServiceRef,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        urlReader: coreServices.urlReader,
        userInfo: coreServices.userInfo,
      },
      async init({
        config,
        logger,
        httpRouter,
        httpAuth,
        urlReader,
        userInfo,
      }) {
        httpRouter.use(
          await createRouter({
            config,
            logger,
            httpAuth,
            urlReader,
            userInfo,
          }),
        );

        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
