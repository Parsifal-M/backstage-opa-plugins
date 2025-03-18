import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { opaPermissionsBackendApiRef } from './api';
import { OpaPermissionsClient } from './api/opaBackendClient';

export const opaPermissionsFrontendPlugin = createPlugin({
  id: 'opa-permissions-frontend',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: opaPermissionsBackendApiRef,
      deps: { fetchApi: fetchApiRef },
      factory: ({ fetchApi }) => new OpaPermissionsClient({ fetchApi }),
    }),
  ],
});

export const OpaPermissionsFrontendPage = opaPermissionsFrontendPlugin.provide(
  createRoutableExtension({
    name: 'OpaPermissionsFrontendPage',
    component: () =>
      import('./components/OpaPermissionsPage').then(m => m.OpaPermissionsPage),
    mountPoint: rootRouteRef,
  }),
);
