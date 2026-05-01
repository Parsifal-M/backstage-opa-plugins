import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from './service';

export const opaPlugin = createBackendPlugin({
  pluginId: 'opa',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        urlReader: coreServices.urlReader,
        userInfo: coreServices.userInfo,
      },
      async init({
        auth,
        config,
        discovery,
        logger,
        httpRouter,
        httpAuth,
        urlReader,
        userInfo,
      }) {
        httpRouter.use(
          await createRouter({
            auth,
            catalogApi: new CatalogClient({ discoveryApi: discovery }),
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
