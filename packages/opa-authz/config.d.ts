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
  };
}
