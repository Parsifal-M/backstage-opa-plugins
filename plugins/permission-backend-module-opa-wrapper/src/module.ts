import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { OpaPermissionPolicy } from './policy';
import { OpaClient } from './opa-client';

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
        const opaClient = new OpaClient(config, logger);
        const entryPoint = config.getOptionalString(
          'permission.opa.policy.policyEntryPoint',
        );
        policy.setPolicy(
          new OpaPermissionPolicy(opaClient, logger, entryPoint),
        );
      },
    });
  },
});
