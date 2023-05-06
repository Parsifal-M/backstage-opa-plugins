export type PolicyEvaluationInput = {
    input: {
      permission: {
        type: string;
        name: string;
        action: string | undefined;
        resourceType?: string;
      };
      identity: {
        username: string | undefined;
        groups: string[];
      };
    };
  };
  
  export type PolicyEvaluationResult = {
    [x: string]: any;
    deny: boolean;
  };