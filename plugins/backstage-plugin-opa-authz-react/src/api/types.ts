import { PolicyInput } from '@parsifal-m/backstage-plugin-opa-common';

export type PolicyResult = {
  decision_id?: string;
  result: {
    allow: boolean;
  };
};

export type OpaAuthzApi = {
  evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult>;
};
