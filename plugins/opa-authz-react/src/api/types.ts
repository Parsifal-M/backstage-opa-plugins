import { ApiRef, createApiRef } from '@backstage/core-plugin-api';

export type PolicyInput = Record<string, unknown>;

export type PolicyResult = {
    decision_id?: string;
    result: {
      allow: boolean;
    }
  };


export type OpaAuthzApi = {
  evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult>;
}

export const opaAuthzBackendApiRef: ApiRef<OpaAuthzApi> = createApiRef<OpaAuthzApi>({
  id: 'plugin.opa-authz.api',
});
