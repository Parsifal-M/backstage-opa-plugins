import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const gitlabMyMrCardPlugin = createPlugin({
  id: 'gitlab-my-mr-card',
  routes: {
    root: rootRouteRef,
  },
});

export const GitlabMyMrCardPage = gitlabMyMrCardPlugin.provide(
  createRoutableExtension({
    name: 'GitlabMyMrCardPage',
    component: () =>
      import('./components/MergeRequestCardComponent').then(
        m => m.MergeRequestCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
