import { createComponentExtension, createPlugin } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const opaEntityCheckerPlugin = createPlugin({
  id: 'opa-entity-checker',
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