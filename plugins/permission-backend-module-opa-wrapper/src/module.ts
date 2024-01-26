import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';

export const permissionModuleOpaWrapper = createBackendModule({
  pluginId: 'permission',
  moduleId: 'opa-wrapper',
  register(reg) {
    reg.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('Hello World!')
      },
    });
  },
});
