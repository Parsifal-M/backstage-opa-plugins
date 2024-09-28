import { createApiRef } from '@backstage/core-plugin-api';

export type PolicyInput = Record<string, unknown>;

export type PolicyResult = {
    decision_id: string;
    result: {
      allow: boolean;
    }
  };


export interface OpaAuthzApi {
  evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult>;
}

export const opaPolicyBackendApiRef = createApiRef<OpaAuthzApi>({
  id: 'plugin.opa-authz.service',
});
