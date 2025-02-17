import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { createTodoListService } from './services/TodoListService';

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
        config: coreServices.rootConfig,
      },
      async init({
        logger,
        auth,
        httpAuth,
        httpRouter,
        catalog,
        config,
        userInfo,
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
            config,
            userInfo,
          }),
        );
      },
    });
  },
});
