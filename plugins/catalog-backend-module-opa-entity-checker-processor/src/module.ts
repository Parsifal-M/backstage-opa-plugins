import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { entityCheckerServiceRef } from '@parsifal-m/plugin-opa-backend';
import { CatalogOPAEntityValidator } from './processor';

export const catalogModuleEntityChecker = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'entity-checker',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        opa: entityCheckerServiceRef,
      },
      async init({ catalog, logger, opa }) {
        catalog.addProcessor(new CatalogOPAEntityValidator(logger, opa));
      },
    });
  },
});
