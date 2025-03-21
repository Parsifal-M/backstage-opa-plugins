export type PolicyInput = Record<string, unknown>;

export type PolicyResult = {
  decision_id?: string;
  result: {
    allow: boolean;
  };
};

export type OpaAuthzApi = {
  evalPolicy(input: PolicyInput, entryPoint: string): Promise<PolicyResult>;
};
