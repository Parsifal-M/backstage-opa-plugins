import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { DefaultOpaService, OpaService } from '../../service';

export const opaService = createServiceRef<OpaService>({
  id: 'opa.service',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      factory({ config, logger }) {
        return DefaultOpaService.create({
          config,
          logger,
        });
      },
    }),
});
