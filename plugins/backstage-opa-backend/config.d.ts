export interface Config {
  /**
   * Configuration options for the OpaClient plugin
   */
  opaClient?: {
    /**
     * The base url of the OPA server used for all OPA plugins.
     * This is used across all the OPA plugins.
     */
    baseUrl?: string;

    /**
     * Configuration options for the OPA policies
     */
    policies?: {
      /**
       * Configuration options for the entity metadata checker policy
       */
      entityChecker?: {
        /**
         * The path to the entity metadata checker package in the OPA server
         */
        entrypoint?: string;
      };
      /**
       * Configuration options for the OPA Permissions Wrapper
       */
      permissions?: {
        /**
         * The entrypoint to the OPA Permissions Wrapper
         */
        entrypoint?: string;

        /**
         * The fallback policy to use when the OPA server is unavailable
         */
        policyFallback?: string;
      };
    };
  };
}
