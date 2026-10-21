export interface Config {
  permission?: {
    opa: {
      /**
       * Base URL of the OPA server
       * @visibility backend
       */
      baseUrl: string;
      policy: {
        /** Entry point into the OPA policy */
        policyEntryPoint: string;
        /**
         * Optional fallback decision if OPA evaluation fails.
         * Accepts 'allow' or 'deny' (case-insensitive); any other value disables the fallback.
         */
        policyFallbackDecision?: string;
      };
    };
  };
}
