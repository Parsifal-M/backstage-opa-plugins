import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { opaPoliciesPlugin, OpaPoliciesPage } from '../src/plugin';

createDevApp()
  .registerPlugin(opaPoliciesPlugin)
  .addPage({
    element: <OpaPoliciesPage />,
    title: 'Root Page',
    path: '/opa-policies',
  })
  .render();
