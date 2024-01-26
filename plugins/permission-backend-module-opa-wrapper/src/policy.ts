import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { PolicyDecision } from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { OpaClient } from './opa-client';
import { Logger } from 'winston';
import { policyEvaluator } from './permission-evaluator';

export class OpaPermissionPolicy implements PermissionPolicy {
  private opaClient: OpaClient;
  private logger: Logger;

  constructor(opaClient: OpaClient, logger: Logger) {
    this.opaClient = opaClient;
    this.logger = logger;
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    const opaRbacPolicy = policyEvaluator(this.opaClient, this.logger);
    return await opaRbacPolicy(request, user);
  }
}
