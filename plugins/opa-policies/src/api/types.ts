import { createApiRef } from "@backstage/core-plugin-api";

export type OpaPolicyAst = Record<string, unknown>;

export type OpaPolicy = {
  id: string;
  raw: string;
  ast: OpaPolicyAst;
};

export type OpaApiResponse = {
  result: OpaPolicy;
};

export interface OpaPolicyBackendApi {
    getPolicy(policyId: string): Promise<OpaPolicy>;
}

export const opaPolicyBackendApiRef = createApiRef<OpaPolicyBackendApi>({
  id: 'plugin.opa-policy-backend.service',
});
