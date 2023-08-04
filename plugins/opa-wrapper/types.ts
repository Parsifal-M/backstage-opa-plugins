export type PolicyEvaluationInput = {
  input: {
    permission: {
      type: string;
      name: string;
      action: string | undefined;
      resourceType?: string;
    };
    identity?: { 
      username: string | undefined;
      groups: string[];
    };
  };
};


export interface PolicyEvaluationResult {
  decision_id: string;
  deny: boolean;
}
