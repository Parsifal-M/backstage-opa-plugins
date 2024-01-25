import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';

export const permissionModuleOpaPermissionWrapper = createBackendModule({
  pluginId: 'permission',
  moduleId: 'opa-permission-wrapper',
  register(reg) {
    reg.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('Hello World!')
      },
    });
  },
});
