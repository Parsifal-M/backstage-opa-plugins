import { createPlugin } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const opaEntityCheckerPlugin = createPlugin({
  id: 'opa-entity-checker',
  routes: {
    root: rootRouteRef,
  },
});


export { MetadataAnalysisCard } from './components/MetadataAnalysisCard';