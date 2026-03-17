import {
  PolicyInput,
  PolicyResult,
} from '@parsifal-m/backstage-plugin-opa-common';

export type OpaAuthzApi = {
  evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult>;
};
