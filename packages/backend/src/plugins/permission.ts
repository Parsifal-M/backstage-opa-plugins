import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express-serve-static-core';
import { PluginEnvironment } from '../types';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import {
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  OpaClient,
  policyEvaluator,
} from '@parsifal-m/opa-permissions-wrapper';
import { catalogEntityDeletePermission } from '@backstage/plugin-catalog-common/alpha';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  // Example of how you can use the OPA client to create a policy evaluator and pass different policies to it
  const adminPolicyEvaluator = policyEvaluator(
    opaClient,
    env.logger,
    'rbac_policy.admin',
  );
  const userPolicyEvaluator = policyEvaluator(
    opaClient,
    env.logger,
    'rbac_policy.user',
  );

  class OpaPermissionPolicy implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      // Example of how you can still use some custom logic to decide which policy to use
      if (isPermission(request.permission, catalogEntityDeletePermission)) {
        return await adminPolicyEvaluator(request, user);
      }
      return await userPolicyEvaluator(request, user);
    }
  }

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new OpaPermissionPolicy(),
    identity: env.identity,
  });
}
