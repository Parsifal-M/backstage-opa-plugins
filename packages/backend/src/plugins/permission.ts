/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from "@backstage/plugin-permission-backend";
import { PolicyDecision, AuthorizeResult, isResourcePermission } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { Router } from "express-serve-static-core";
import { cannotDeleteEntities } from "../../../../plugins/opa-auth-backend/src/catalog-policies/policies";
import { OpaClient } from "../../../../plugins/opa-auth-backend/src/opa/opaClient";
import { PluginEnvironment } from "../types";


export class PermissionsHandler {
  constructor(private opaClient: OpaClient) {}

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    // Use the policy function from your policies.ts file here
    console.log('PermissionsHandler.handle called');
    const cannotDeleteEntitiesPolicy = await cannotDeleteEntities(this.opaClient);
    
    if (isResourcePermission(request.permission, "catalog-entity")) {
      return await cannotDeleteEntitiesPolicy(request);
    }

    // If the entity is not a "catalog-entity", you can decide what to do, e.g.:
    return { result: AuthorizeResult.ALLOW };
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config);
  const permissionsHandler = new PermissionsHandler(opaClient);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: permissionsHandler,
    identity: env.identity,
  });
}
