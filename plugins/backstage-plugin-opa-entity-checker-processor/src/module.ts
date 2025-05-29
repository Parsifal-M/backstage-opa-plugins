import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { CatalogOPAEntityValidator } from './processor/CatalogOPAEntityValidator';

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
        logger.info(
          'Initializing OPA Entity Validation Processor, validating configuration...',
        );

        const baseUrl =
          config.getOptionalString('opaClient.baseUrl') ??
          'http://localhost:8181';
        const entrypoint = config.getOptionalString(
          'opaClient.policies.entityChecker.entrypoint',
        );

        if (!entrypoint) {
          logger.error('Missing OPA configuration: entrypoint must be defined');
          return;
        }

        catalog.addProcessor(
          new CatalogOPAEntityValidator(logger, {
            baseUrl,
            entrypoint,
          }),
        );

        logger.info('OPA Entity Validation Processor registered successfully');
      },
    });
  },
});
