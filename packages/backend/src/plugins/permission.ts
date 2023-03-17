/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { PermissionPolicy, PolicyQuery } from '@backstage/plugin-permission-node';
import { Router } from 'express';
import { OpaClient } from '../../../../plugins/opa-auth-backend/src/opa/opaClient';
import { cannotAddEntities, cannotDeleteEntities, cannotViewEntities } from '../../../../plugins/opa-auth-backend/src/policies/policies';
import { PluginEnvironment } from '../types';


class CatalogPermission implements PermissionPolicy {
  constructor(private readonly opaClient: OpaClient) {}

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    const denyPolicies = [cannotDeleteEntities, cannotViewEntities, cannotAddEntities];
    
    for (const denyPolicy of denyPolicies) {
      const denyDecision = await (await denyPolicy(this.opaClient))(request);
      if (denyDecision.result === AuthorizeResult.DENY) {
        return denyDecision;
      }
    }

    // Allow if no deny policies match
    return { result: AuthorizeResult.ALLOW };
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config.getString('integrations.opa.baseUrl'));
  const policy = new CatalogPermission(opaClient);

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: policy,
    identity: env.identity,
  });
}
