import { Entity } from '@backstage/catalog-model';

export interface OpaBackendApi {
  entityCheck(entityMetadata: Entity): Promise<OpaEntityResult>;
}

export interface OpaEntityResult {
  result?: OpaMetadataEntityResult[];
}

export interface OpaMetadataEntityResult {
  id: number;
  decisionId?: string;
  check_title?: string;
  message?: string;
  url?: string;
  level: 'error' | 'warning' | 'info' | 'success';
}
