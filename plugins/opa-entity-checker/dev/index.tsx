import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { opaEntityCheckerPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(opaEntityCheckerPlugin)
  .addPage({
    element: <OpaEntityCheckerPage />,
    title: 'Root Page',
    path: '/opa-entity-checker'
  })
  .render();
