import {
  scaffolderPlugin,
  createScaffolderFieldExtension,
} from '@backstage/plugin-scaffolder';


export const SelectFieldFromApiExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
  }),
);