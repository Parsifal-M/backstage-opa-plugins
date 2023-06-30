import { createApiFactory, createComponentExtension, createPlugin, discoveryApiRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { opaBackendApiRef } from './api';
import { MyPluginBackendClient } from './api/opaBackendClient';

export const opaEntityCheckerPlugin = createPlugin({
  id: 'opa-entity-checker',
  apis: [
    createApiFactory({
      api: opaBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) =>
        new MyPluginBackendClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const MetadataAnalysisCard = opaEntityCheckerPlugin.provide(
  createComponentExtension({
    name: 'MetadataAnalysisCard',
    component: {
      lazy: () =>
        import('./components/MetadataAnalysisCard').then(
          m => m.MetadataAnalysisCard,
        ),
    },
  }),
);