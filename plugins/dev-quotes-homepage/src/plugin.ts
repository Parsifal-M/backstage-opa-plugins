import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const devQuotesHomepageCard = createPlugin({
  id: 'dev-quotes-homepage',
  routes: {
    root: rootRouteRef,
  },
});

export const DevQuotesHomepageCard = devQuotesHomepageCard.provide(
  createRoutableExtension({
    name: 'DevQuotesHomepageCard',
    component: () =>
      import('./components/QuotesCardComponent').then(m => m.DevQuoteCard),
    mountPoint: rootRouteRef,
  }),
);
