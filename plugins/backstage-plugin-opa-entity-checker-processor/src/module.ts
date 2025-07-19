import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { CatalogOPAEntityValidator } from './processor';
import { EntityCheckerClientImpl } from './client/EntityCheckerClient';

export const catalogModuleEntityChecker = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'opa-entity-checker',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ catalog, logger, config }) {
        const opaBaseUrl =
          config.getOptionalString('openPolicyAgent.baseUrl') ??
          'http://localhost:8181';
        const enabled =
          config.getOptionalBoolean(
            'openPolicyAgent.entityCheckerProcessor.enabled',
          ) ?? false;
        const entityCheckerEntrypoint = config.getOptionalString(
          'openPolicyAgent.entityCheckerProcessor.policyEntryPoint',
        );

        if (!enabled) {
          logger.warn(
            'OPA entity checker processor is disabled, set openPolicyAgent.entityCheckerProcessor.enabled to true to enable it. Skipping processor registration.',
          );
          return;
        }

        if (!opaBaseUrl) {
          logger.warn(
            'No OPA base URL configured, using default: http://localhost:8181',
          );
        }

        if (!entityCheckerEntrypoint) {
          logger.error(
            'OPA entity checker processor policyEntryPoint is required, please set it in the configuration',
          );
          throw new Error(
            'OPA entity checker processor policyEntryPoint is required, please set it in the configuration',
          );
        }

        const entityCheckerClient = new EntityCheckerClientImpl({
          logger,
          opaBaseUrl,
          entityCheckerEntrypoint,
        });

        catalog.addProcessor(
          new CatalogOPAEntityValidator(logger, entityCheckerClient),
        );
      },
    });
  },
});
