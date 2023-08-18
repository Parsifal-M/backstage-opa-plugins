import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { gitlabRunnersPlugin, GitlabRunnersPage } from '../src/plugin';

createDevApp()
  .registerPlugin(gitlabRunnersPlugin)
  .addPage({
    element: <GitlabRunnersPage />,
    title: 'Root Page',
    path: '/gitlab-runners',
  })
  .render();
