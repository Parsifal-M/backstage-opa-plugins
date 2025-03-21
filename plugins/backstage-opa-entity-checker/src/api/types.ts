import { Entity } from '@backstage/catalog-model';

export interface OpaBackendApi {
  entityCheck(entityMetadata: Entity): Promise<OpaEntityResult>;
}

export interface OpaEntityResult {
  good_entity: boolean;
  result?: OpaMetadataEntityResult[];
}

export interface OpaMetadataEntityResult {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}
