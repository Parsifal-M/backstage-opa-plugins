import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  opaPermissionsFrontendPlugin,
  OpaPermissionsFrontendPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(opaPermissionsFrontendPlugin)
  .addPage({
    element: <OpaPermissionsFrontendPage />,
    title: 'Root Page',
    path: '/opa-permissions-frontend',
  })
  .render();
