import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';

export interface OpaPolicyResult {
  decision_id?: string;
  result?: OpaEntityResult[];
}

export interface OpaEntityResult {
  decision_id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

export type CheckEntityOptions = {
  entityMetadata: Entity;
};

export interface OpaEntityCheckResult {
  result?: OpaResult[];
}

export interface OpaResult {
  decision_id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

export type EntityCheckerConfig = {
  logger: LoggerService;
  opaBaseUrl: string;
  entityCheckerEntrypoint: string;
};
