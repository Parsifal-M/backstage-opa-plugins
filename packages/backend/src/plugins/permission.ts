/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from "@backstage/plugin-permission-backend";
import { Router } from "express-serve-static-core";
import { PluginEnvironment } from "../types";
import { PolicyDecision } from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { Logger } from 'winston';
import { catalogPermissions } from "../../../../plugins/opa-auth-backend/src/catalog-policies/policies";
import { OpaClient } from "../../../../plugins/opa-auth-backend/src/opa/opaClient";

class PermissionsHandler {
  constructor(
    private opaClient: OpaClient,
    private logger: Logger,
  ) {}

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    this.logger.info('PermissionsHandler.handle called');
    this.logger.info(JSON.stringify(request));
    const catalogPermissionsPolicy = await catalogPermissions(this.opaClient);

    const policyDecision = await catalogPermissionsPolicy(request);
    this.logger.info(`Policy decision: ${JSON.stringify(policyDecision)}`);

    return policyDecision;
  }
}

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
