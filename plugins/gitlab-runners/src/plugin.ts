import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const gitlabRunnersPlugin = createPlugin({
  id: 'gitlab-runners',
  routes: {
    root: rootRouteRef,
  },
});

export const GitlabRunnersPage = gitlabRunnersPlugin.provide(
  createRoutableExtension({
    name: 'GitlabRunnersPage',
    component: () =>
      import('./components/RunnerPageComponent').then(m => m.RunnerPage),
    mountPoint: rootRouteRef,
  }),
);
