import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
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
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new OpaPolicyBackendClient({ discoveryApi }),
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
