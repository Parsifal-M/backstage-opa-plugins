export interface Config {
  permission?: {
    opa: {
      /** Base URL of the OPA server */
      baseUrl: string;
      policy: {
        /** Entry point into the OPA policy */
        policyEntryPoint?: string;
        /** Optional fallback decision if OPA evaluation fails */
        policyFallbackDecision?: 'allow' | 'deny';
      };
    };
  };
}
