/* eslint-disable @backstage/no-relative-monorepo-imports */
import { createRouter } from '@backstage/plugin-permission-backend';
import { Router } from 'express-serve-static-core';
import { PluginEnvironment } from '../types';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  catalogPolicyEvaluator,
  scaffolderActionPolicyEvaluator,
  scaffolderTemplatePolicyEvaluator,
  OpaClient,
} from '@parsifal-m/opa-permissions-wrapper';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const opaClient = new OpaClient(env.config, env.logger);
  const logger = env.logger;
  class PermissionsHandler implements PermissionPolicy {
    async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> {
      logger.info(
        `User: ${JSON.stringify(
          user?.identity,
        )} has made a request: ${JSON.stringify(request)}`,
      );

      if (isResourcePermission(request.permission, 'catalog-entity')) {
        logger.info('Catalog Permission Request'); // Debugging for now
        const makeCatalogPolicyDecision = catalogPolicyEvaluator(
          opaClient,
          env.config,
        );
        const policyDescision = await makeCatalogPolicyDecision(request, user);

        return policyDescision;
      }

      if (isResourcePermission(request.permission, 'scaffolder-action')) {
        logger.info('Scaffolder Action Permission Request'); // Debugging for now
        const makeScaffolderActionPolicyDecision =
          scaffolderActionPolicyEvaluator(opaClient, env.config);
        const policyDescision = await makeScaffolderActionPolicyDecision(
          request,
          user,
        );

        return policyDescision;
      }

      if (isResourcePermission(request.permission, 'scaffolder-template')) {
        logger.info('Scaffolder Template Permission Request'); // Debugging for now
        const makeScaffolderTemplatePolicyDecision =
          scaffolderTemplatePolicyEvaluator(opaClient, env.config);
        const policyDescision = await makeScaffolderTemplatePolicyDecision(
          request,
          user,
        );

        return policyDescision;
      }

      return { result: AuthorizeResult.ALLOW };
    }
  }

  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new PermissionsHandler(),
    identity: env.identity,
  });
}
