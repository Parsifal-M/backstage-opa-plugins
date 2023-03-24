import { createRouter } from "@backstage/plugin-app-backend";
import { PolicyDecision, AuthorizeResult } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { Router } from "express-serve-static-core";
import { OpaClient, createOpaClient } from "../../../../plugins/opa-auth-backend/src/opa/opaClient";
import { PluginEnvironment } from "../types";


const catalogPermissions = new CatalogPermissions();

export class PermissionsHandler {
  constructor(private opaClient: OpaClient) {}

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    if (isResourcePermission(request.permission, "catalog-entity")) {
      return await catalogPermissions.decide(request, this.opaClient);
    }

    // If the entity is not a "catalog-entity", you can decide what to do, e.g.:
    return { result: AuthorizeResult.ALLOW };
  }
}

function isResourcePermission(permission: any, resourceType: string): boolean {
  return permission.resourceType === resourceType;
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = createOpaClient(env.config);
  const permissionsHandler = new PermissionsHandler(opaClient);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: permissionsHandler,
    identity: env.identity,
  });
}
