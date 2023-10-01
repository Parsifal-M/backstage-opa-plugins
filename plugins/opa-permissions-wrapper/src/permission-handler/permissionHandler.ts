import { PolicyQuery } from '@backstage/plugin-permission-node';
import { Logger } from 'winston';
import { OpaClient } from '../opa-client/opaClient';
import { PolicyDecision, isResourcePermission } from '@backstage/plugin-permission-common';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { createOpaPermissionEvaluator } from '../opa-evaluator/opaPermissionEvaluator';
import { catalogPolicyEvaluator } from '../core-permissions/catalogEvaluator';

export class PermissionsHandler {
  constructor(private opaClient: OpaClient, private logger: Logger) {}

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    this.logger.info(
      `User: ${JSON.stringify(user)} has made a request: ${JSON.stringify(
        request,
      )}`,
    );

    if (isResourcePermission(request.permission, 'catalog-entity')) {
      this.logger.info('Catalog Permission Request') // Debugging for now
      const makeCatalogPolicyDecision = catalogPolicyEvaluator(
        this.opaClient
      );
      const policyDescision = await makeCatalogPolicyDecision(request, user);

      return policyDescision;
    }

    const makePolicyDecision = createOpaPermissionEvaluator(this.opaClient);

    const policyDecision = await makePolicyDecision(request, user);

    this.logger.info(
      `Policy decision: ${JSON.stringify(
        policyDecision,
      )} for user: ${JSON.stringify(user)} and request: ${JSON.stringify(
        request,
      )}`,
    );

    return policyDecision;
  }
}

export function createPermissionsHandler(
  opaClient: OpaClient,
  logger: Logger,
): PermissionsHandler {
  return new PermissionsHandler(opaClient, logger);
}
