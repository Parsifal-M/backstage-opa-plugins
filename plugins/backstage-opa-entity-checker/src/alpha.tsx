import {
  ApiBlueprint,
  createFrontendPlugin,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { opaApiRef } from './api';
import { OpaClient } from './api/opaBackendClient';
import { rootRouteRef } from './routes';

const opaEntityCheckerApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: opaApiRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new OpaClient({ fetchApi }),
    }),
});

const opaEntityCheckerCard = EntityCardBlueprint.make({
  name: 'metadata-analysis',
  params: {
    loader: () =>
      import('./components/OpaMetadataAnalysisCard').then(m => (
        <m.OpaMetadataAnalysisCard />
      )),
  },
});

export { OpaMetadataAnalysisCard } from './components/OpaMetadataAnalysisCard';

export default createFrontendPlugin({
  pluginId: 'opa-entity-checker',
  extensions: [opaEntityCheckerApi, opaEntityCheckerCard],
  routes: {
    root: rootRouteRef,
  },
});
