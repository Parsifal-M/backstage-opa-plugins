import {
  coreServices,
  createBackendPlugin,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { EntityCheckerApi, EntityCheckerApiImpl } from './api/EntityCheckerApi';

/**
 * entityCheckerServiceRef expose the OPA Entity Checker implementation so that it can be used by other plugins
 */
export const entityCheckerServiceRef = createServiceRef<EntityCheckerApi>({
  id: 'opa.entity-checker',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service: service,
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async factory({ logger, config }) {
        return new EntityCheckerApiImpl({
          logger: logger,
          opaBaseUrl: config.getOptionalString('opaClient.baseUrl'),
          entityCheckerEntrypoint: config.getOptionalString(
            'opaClient.policies.entityChecker.entrypoint',
          ),
        });
      },
    }),
});

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
        opaEntityChecker: entityCheckerServiceRef,
      },
      async init({
        config,
        logger,
        httpRouter,
        httpAuth,
        urlReader,
        userInfo,
        opaEntityChecker,
      }) {
        httpRouter.use(
          await createRouter({
            config,
            logger,
            httpAuth,
            urlReader,
            userInfo,
            opaEntityChecker,
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
