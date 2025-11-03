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
        const baseUrl = config.getString('openPolicyAgent.baseUrl');
        return DefaultOpaService.create({
          baseUrl,
          logger,
        });
      },
    }),
});