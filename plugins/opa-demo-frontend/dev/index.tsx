import { createDevApp } from '@backstage/dev-utils';
import { opaFrontendDemoPlugin, OpaFrontendDemoPage } from '../src/plugin';

createDevApp()
  .registerPlugin(opaFrontendDemoPlugin)
  .addPage({
    element: <OpaFrontendDemoPage />,
    title: 'Root Page',
    path: '/opa-frontend-demo',
  })
  .render();
