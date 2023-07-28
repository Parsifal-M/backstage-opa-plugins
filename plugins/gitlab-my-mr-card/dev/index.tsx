import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { gitlabMyMrCardPlugin, GitlabMyMrCardPage } from '../src/plugin';

createDevApp()
  .registerPlugin(gitlabMyMrCardPlugin)
  .addPage({
    element: <GitlabMyMrCardPage />,
    title: 'Root Page',
    path: '/gitlab-my-mr-card'
  })
  .render();
