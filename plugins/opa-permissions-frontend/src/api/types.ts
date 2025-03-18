import { createApiRef } from '@backstage/core-plugin-api';

export interface OpaPolicy {
  id: string;
  raw: string;
  ast?: any;
}

export interface OpaPoliciesResponse {
  result: OpaPolicy[];
}

export interface OpaBackendApi {
  getOpaPermissionPolicies(): Promise<OpaPoliciesResponse>;
}

export const opaPermissionsBackendApiRef = createApiRef<OpaBackendApi>({
  id: 'plugin.opa-permissions-backend.service',
});
