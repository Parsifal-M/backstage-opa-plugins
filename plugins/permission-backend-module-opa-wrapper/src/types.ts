export type PolicyEvaluationInput = {
  permission: {
    name: string;
  };
  identity?: {
    user: string | undefined;
    claims: string[];
  };
};

export type PolicyEvaluationResult = {
  result: string;
  pluginId?: string;
  resourceType?: string;
  conditions?: {
    anyOf?: {
      params: {
        [key: string]: any;
      };
      resourceType: string;
      rule: string;
    }[];
    allOf?: {
      params: {
        [key: string]: any;
      };
      resourceType: string;
      rule: string;
    }[];
    none?: {
      params: {
        [key: string]: any;
      };
      resourceType: string;
      rule: string;
    }[];
  };
};

export type PolicyEvaluationResponse = {
  result: PolicyEvaluationResult;
};

export type OpaFallbackPolicy = 'allow' | 'deny' | undefined;

export interface PermissionInput {
  [key: string]: unknown;
}

export interface OpaResponse {
  result: {
    allow: boolean;
  }
  [key: string]: unknown;
}