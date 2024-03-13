export interface Config {
  /**
   * Configuration options for the OpaClient plugin
   */
  opaClient?: {
    /**
     * The base url of the OPA server used for the plugin
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
        package?: string;
      };
      /**
       * Configuration options for the OPA Permissions Wrapper
       */
      permissions?: {
        /**
         * The entrypoint to the OPA Permissions Wrapper
         */
        entrypoint?: string;
      };
    };
  };
}
