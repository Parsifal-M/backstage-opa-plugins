import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

export const opaPlugin = createBackendPlugin({
  pluginId: 'opa',
  register(env) {
    env.registerInit({
      deps: {
        catalogApi: catalogServiceRef,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        urlReader: coreServices.urlReader,
      },
      async init({
        catalogApi,
        config,
        logger,
        httpRouter,
        auth,
        httpAuth,
        discovery,
        urlReader,
      }) {
        httpRouter.use(
          await createRouter({
            catalogApi,
            config,
            logger,
            auth,
            httpAuth,
            discovery,
            urlReader,
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
