import {
  scaffolderPlugin,
  createScaffolderFieldExtension,
} from '@backstage/plugin-scaffolder';
import { OwnedGroupsPicker } from './components/OwnedGroupsPicker';


export const SelectOwnedGroupsExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'OwnedGroupsPicker',
    component: OwnedGroupsPicker,
  }),
);