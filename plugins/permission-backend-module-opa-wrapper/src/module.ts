import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { OpaPermissionPolicy } from './policy';
import { OpaClient } from './opa-client';
import { loggerToWinstonLogger } from '@backstage/backend-common';

export const permissionModuleOpaWrapper = createBackendModule({
  pluginId: 'permission',
  moduleId: 'opa-wrapper',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        policy: policyExtensionPoint,
      },
      async init({ config, logger, policy }) {
        policy.setPolicy(
          new OpaPermissionPolicy(
            new OpaClient(config, loggerToWinstonLogger(logger)),
            loggerToWinstonLogger(logger),
          ),
        );
      },
    });
  },
});
