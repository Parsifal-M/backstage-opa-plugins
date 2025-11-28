import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createTodoListService } from './services/TodoListService';
import { opaService } from '@parsifal-m/backstage-plugin-opa-node';

/**
 * opaDemoPlugin backend plugin
 *
 * @public
 */
export const opaDemoPlugin = createBackendPlugin({
  pluginId: 'opa-demo',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        // We add the OPA service as a dependency this will allow the plugin to use it
        opa: opaService,
      },
      async init({
        logger,
        auth,
        httpAuth,
        httpRouter,
        catalog,
        userInfo,
        opa,
      }) {
        const todoListService = await createTodoListService({
          logger,
          auth,
          catalog,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            todoListService,
            logger,
            userInfo,
            opa,
          }),
        );
      },
    });
  },
});
