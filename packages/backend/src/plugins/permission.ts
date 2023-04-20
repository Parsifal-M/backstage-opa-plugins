/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from "@backstage/plugin-permission-backend";
import { Router } from "express-serve-static-core";
import { PluginEnvironment } from "../types";
import { OpaClient } from "../../../../plugins/opa-auth-backend/src/opa-client/opaClient";
import { PermissionsHandler } from "../../../../plugins/opa-auth-backend/src/permission-handler/permissionHandler";


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  const permissionsHandler = new PermissionsHandler(opaClient, env.logger);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: permissionsHandler,
    identity: env.identity,
  });
}
