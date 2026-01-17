export type PermissionsFrameworkPolicyInput = {
  permission: {
    name: string;
  };
  identity?: {
    user: string | undefined;
    claims: string[];
  };
};

export type PermissionsFrameworkPolicyEvaluationResult = {
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
    not?: {
      params: {
        [key: string]: any;
      };
      resourceType: string;
      rule: string;
    }[];
  };
};

export type PolicyEvaluationResponse = {
  result: PermissionsFrameworkPolicyEvaluationResult;
};

export type FallbackPolicyDecision = 'allow' | 'deny' | undefined;
