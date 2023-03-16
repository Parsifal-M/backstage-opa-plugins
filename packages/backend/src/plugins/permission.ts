/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { OpaClient } from '../../../../plugins/opa-auth-backend/src/opa/opaClient';
import { cannotDeleteEntities } from '../../../../plugins/opa-auth-backend/src/policies/policies';



class CatalogPermission implements PermissionPolicy {
  private readonly opaClient: OpaClient;

  constructor(opaClient: OpaClient) {
    this.opaClient = opaClient;
  }

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    if (request.permission.name !== 'catalog.entity.delete') {
      return { result: AuthorizeResult.ALLOW };
    }
  
    const policyResult = await (await cannotDeleteEntities(this.opaClient))(request);
  
    return policyResult;
  }
  
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config);
  const policy = new CatalogPermission(opaClient);

  return createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy,
    identity: env.identity,
  });
}
