import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
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
        fetchApi: fetchApiRef,
      },
      factory: ({ fetchApi }) => new OpaBackendClient({ fetchApi }),
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

export const OpaMetadataAnalysisCardV2 = opaEntityCheckerPlugin.provide(
    createRoutableExtension({
      name: 'OpaMetadataAnalysisCardV2',
      component: () =>
          import('./components/OpaMetadataAnalysisCardV2').then(
              m => m.OpaMetadataAnalysisCardV2,
          ),
      mountPoint: rootRouteRef,
    }),
);
