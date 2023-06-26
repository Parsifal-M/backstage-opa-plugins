import { createDevApp } from '@backstage/dev-utils';
import { opaEntityCheckerPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(opaEntityCheckerPlugin)
  .render();
