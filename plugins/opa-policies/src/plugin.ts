import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { opaPolicyBackendApiRef } from './api/types';
import { OpaPolicyBackendClient } from './api/opaBackendClient';

export const opaPoliciesPlugin = createPlugin({
  id: 'opa-policies',
  apis: [
    createApiFactory({
      api: opaPolicyBackendApiRef,
      deps: {
        fetchApi: fetchApiRef,
      },
      factory: ({ fetchApi }) => new OpaPolicyBackendClient({ fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const OpaPolicyPage = opaPoliciesPlugin.provide(
  createRoutableExtension({
    name: 'OpaPolicyPage',
    component: () =>
      import('./components/OpaPolicyComponent').then(m => m.OpaPolicyPage),
    mountPoint: rootRouteRef,
  }),
);
