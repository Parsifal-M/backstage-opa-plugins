/**
 * Represents the input to a policy evaluation.
 *
 * This type is a record where the keys are strings and the values can be of any type.
 * It allows for flexible input structures to be passed to the policy evaluation function.
 *
 * @example
 * const input: PolicyInput = {
 *   user: {
 *     id: "123",
 *     role: "admin"
 *   },
 *   resource: {
 *     type: "document",
 *     id: "456"
 *   },
 *   action: "read"
 * };
 */
export type PolicyInput = Record<string, unknown>;

/**
 * Represents the result of a policy evaluation.
 *
 * @property {string} decision_id - A unique identifier for the decision, useful for tracking and auditing purposes.
 * @property {object} result - The outcome of the policy evaluation.
 * @property {boolean} result.allow - Indicates whether the action is allowed based on the policy evaluation.
 *
 * @example
 * const result: PolicyResult = {
 *   decision_id: "abc-123-def-456",
 *   result: {
 *     allow: true
 *   }
 * };
 */
export type PolicyResult = {
  decision_id: string;
  result: {
    allow: boolean;
  };
};

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
  result: PermissionsFrameworkPolicyEvaluationResult;
};

export type FallbackPolicyDecision = 'allow' | 'deny' | undefined;
