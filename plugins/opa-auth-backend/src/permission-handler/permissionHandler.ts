
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { Logger } from 'winston';
import { catalogPermissions } from '../catalog-policies/policies';
import { OpaClient } from '../opa-client/opaClient';
import { PolicyDecision } from '@backstage/plugin-permission-common';

export class PermissionsHandler {
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

export function createPermissionsHandler(opaClient: OpaClient, logger: Logger): PermissionsHandler {
  return new PermissionsHandler(opaClient, logger);
}