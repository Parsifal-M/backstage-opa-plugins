import { Entity } from '@backstage/catalog-model';

export interface GroupEntity extends Entity {
    metadata: {
      name: string;
    };
  }