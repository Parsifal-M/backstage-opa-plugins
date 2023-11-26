import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const devQuotesHomepage = createPlugin({
  id: 'dev-quotes-homepage',
  routes: {
    root: rootRouteRef,
  },
});

export const DevQuotesHomepage = devQuotesHomepage.provide(
  createRoutableExtension({
    name: 'DevQuotesHomepage',
    component: () =>
      import('./components/QuotesComponent').then(m => m.DevQuote),
    mountPoint: rootRouteRef,
  }),
);
