import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { opaPoliciesPlugin, OpaPolicyPage } from '../src/plugin';

createDevApp()
  .registerPlugin(opaPoliciesPlugin)
  .addPage({
    element: <OpaPolicyPage />,
    title: 'Root Page',
    path: '/opa-policies',
  })
  .render();
