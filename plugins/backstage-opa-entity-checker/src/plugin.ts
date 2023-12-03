import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { opaBackendApiRef } from './api';
import { OpaBackendClient } from './api/opaBackendClient';

export const opaEntityCheckerPlugin = createPlugin({
  id: 'opa-entity-checker',
  apis: [
    createApiFactory({
      api: opaBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new OpaBackendClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const OpaMetadataAnalysisCard = opaEntityCheckerPlugin.provide(
  createRoutableExtension({
    name: 'OpaMetadataAnalysisCard',
    component: () =>
      import('./components/OpaMetadataAnalysisCard').then(
        m => m.OpaMetadataAnalysisCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
