import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const opaFrontendDemoPlugin = createPlugin({
  id: 'opa-frontend-demo',
  routes: {
    root: rootRouteRef,
  },
});

export const OpaFrontendDemoPage = opaFrontendDemoPlugin.provide(
  createRoutableExtension({
    name: 'OpaFrontendDemoPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
