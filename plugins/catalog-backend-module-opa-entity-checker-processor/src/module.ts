import {
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { entityCheckerServiceRef} from "@parsifal-m/plugin-opa-backend/src/plugin";
import {CatalogOPAEntityValidator} from "./processor";

export const catalogModuleEntityChecker = createBackendModule({
  pluginId: 'opa',
  moduleId: 'entity-checker',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        opa: entityCheckerServiceRef,
      },
      async init({ catalog, opa }) {
        catalog.addProcessor(new CatalogOPAEntityValidator(opa))
      },
    });
  },
});
