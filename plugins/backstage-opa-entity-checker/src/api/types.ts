import { Entity } from '@backstage/catalog-model';
import { createApiRef } from '@backstage/core-plugin-api';

export interface OpaBackendApi {
  entityCheck(entityMetadata: Entity): Promise<OpaResult>;
}

export const opaBackendApiRef = createApiRef<OpaBackendApi>({
  id: 'plugin.opa-backend.service',
});

export interface OpaResult {
  result: {
    allow: boolean;
    violation?: Violation[];
  };
}

export interface Violation {
  level: 'error' | 'warning';
  message: string;
}
