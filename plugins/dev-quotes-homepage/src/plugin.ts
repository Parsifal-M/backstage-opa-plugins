import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const devQuotesHomepagePlugin = createPlugin({
  id: 'dev-quotes-homepage',
  routes: {
    root: rootRouteRef,
  },
});

export const DevQuotesHomepagePage = devQuotesHomepagePlugin.provide(
  createRoutableExtension({
    name: 'DevQuotesHomepagePage',
    component: () =>
      import('./components/QuotesCardComponent').then(m => m.QuoteCard),
    mountPoint: rootRouteRef,
  }),
);
