import { PolicyQuery } from '@backstage/plugin-permission-node';
import { Logger } from 'winston';
import { OpaClient } from '../opa-client/opaClient';
import { PolicyDecision, isResourcePermission } from '@backstage/plugin-permission-common';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { catalogPolicyEvaluator } from '../core-permissions/catalogEvaluator';
import { scaffolderActionPolicyEvaluator } from '../core-permissions/scaffolderActionEvaluator';
import { scaffolderTemplatePolicyEvaluator } from '../core-permissions/scaffolderTemplateEvaluator';


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

    if (isResourcePermission(request.permission, 'scaffolder-action')) {
      this.logger.info('Scaffolder Action Permission Request') // Debugging for now
      const makeScaffolderActionPolicyDecision = scaffolderActionPolicyEvaluator(
        this.opaClient
      );
      const policyDescision = await makeScaffolderActionPolicyDecision(request, user);

      return policyDescision;
    }

    if (isResourcePermission(request.permission, 'scaffolder-template')) {
      this.logger.info('Scaffolder Template Permission Request') // Debugging for now
      const makeScaffolderTemplatePolicyDecision = scaffolderTemplatePolicyEvaluator(
        this.opaClient
      );
      const policyDescision = await makeScaffolderTemplatePolicyDecision(request, user);

      return policyDescision;
    }

    this.logger.error('Unknown permission type');
    throw new Error('Unknown permission type');

  }
}

export function createPermissionsHandler(
  opaClient: OpaClient,
  logger: Logger,
): PermissionsHandler {
  return new PermissionsHandler(opaClient, logger);
}
