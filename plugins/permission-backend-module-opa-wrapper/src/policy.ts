import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { PolicyDecision } from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { OpaClient } from './opa-client';
import { LoggerService } from '@backstage/backend-plugin-api';
import { policyEvaluator } from './permission-evaluator';

export class OpaPermissionPolicy implements PermissionPolicy {
  private opaClient: OpaClient;
  private logger: LoggerService;

  constructor(opaClient: OpaClient, logger: LoggerService) {
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
