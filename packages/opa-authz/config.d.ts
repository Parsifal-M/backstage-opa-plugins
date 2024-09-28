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
     * A flag to enable or disable the middleware in backend plugin routes, this is only for the opa-authz plugin! 
     * The OPA Permissions Wrapper plugin does not use any middleware.
     */
    useMiddleware?: boolean;
  };
}