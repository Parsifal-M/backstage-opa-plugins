import { Entity } from '@backstage/catalog-model';
import { createApiRef } from '@backstage/core-plugin-api';

export interface OpaBackendApi {
  entityCheck(entityMetadata: Entity): Promise<OpaResult>;
}

export const opaBackendApiRef = createApiRef<OpaBackendApi>({
  id: 'plugin.opa-backend.service',
});

export interface OpaResult {
  good_entity: boolean;
  result?: EntityResult[];
}

export interface EntityResult {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}
