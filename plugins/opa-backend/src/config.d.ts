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
       * Configuration options for the catalog policy
       */
      entityChecker?: {
        /**
         * The path to the catalog package in the OPA server
         */
        package?: string;
      };
      /**
       * Configuration options for the catalog permission policy
       */
      catalogPermission?: {
        /**
         * The path to the catalog package in the OPA server
         */
        package?: string;
      };
    };
  };
}
