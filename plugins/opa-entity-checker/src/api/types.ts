import { createApiRef } from '@backstage/core-plugin-api';

export interface OpaBackendApi {
  entityCheck(): Promise<{ status: string; }>;
}

export const opaBackendApiRef = createApiRef<OpaBackendApi>({
  id: 'plugin.opa-backend.service',
});

export interface OpaResult {
  allow: boolean;
  violation?: Violation[];
}

export interface Violation {
  level: 'error' | 'warning';
  message: string;
}

  