export interface Config {
  /**
   * Configuration options for the OpenPolicyAgent plugins
   */
  openPolicyAgent?: {
    /**
     * The base url of the OPA server used for all OPA plugins.
     * This is used across all the OPA plugins.
     */
    baseUrl?: string;

    /**
     * Configuration options for the OPA Entity Checker plugin
     */
    entityChecker?: {
      /**
       * Enable the OPA Entity Checker plugin
       */
      enabled?: boolean;

      /**
       * The policy entry point for entity metadata checking in the OPA server
       */
      policyEntryPoint?: string;
    };

    /**
     * Configuration options for the OPA Policies plugin
     */
    policyViewer?: {
      /**
       * Enable the OPA Policies plugin
       */
      enabled?: boolean;
    };
  };
}
