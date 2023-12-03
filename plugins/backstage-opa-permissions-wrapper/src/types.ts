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
  decision: {
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
};
