import {
  PolicyInput,
  PolicyResult,
} from '@parsifal-m/backstage-plugin-opa-common';

export type OpaAuthzApi = {
  evalPolicy(
    input: PolicyInput,
    entryPoint: string,
    options?: { includeUserEntity?: boolean },
  ): Promise<PolicyResult>;
};
