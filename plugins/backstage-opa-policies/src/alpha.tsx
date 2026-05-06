import {
  ApiBlueprint,
  createFrontendPlugin,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import SecurityIcon from '@material-ui/icons/Security';
import { opaApiRef, OpaClient } from './api';
import { rootRouteRef } from './routes';

const opaPoliciesApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: opaApiRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new OpaClient({ fetchApi }),
    }),
});

const opaPoliciesEntityContent = EntityContentBlueprint.make({
  name: 'opa-policies',
  params: {
    path: '/opa-policy',
    title: 'OPA Policy',
    icon: <SecurityIcon fontSize="inherit" />,
    loader: () =>
      import('./components/OpaPolicyComponent').then(m => <m.OpaPolicyPage />),
    routeRef: rootRouteRef,
  },
});

export default createFrontendPlugin({
  pluginId: 'opa-policies',
  title: 'OPA Policies',
  extensions: [opaPoliciesApi, opaPoliciesEntityContent],
  routes: {
    root: rootRouteRef,
  },
});
