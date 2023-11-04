export type PolicyEvaluationInput = {
  permission: {
    name: string;
  };
  identity?: {
    user: string | undefined;
    claims: string[];
  };
};

export interface ConditionalDecision {
  claims: string;
  decision: {
    conditions: {
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
    pluginId: string;
    resourceType: string;
    result: string;
  };
  permission: string;
}
