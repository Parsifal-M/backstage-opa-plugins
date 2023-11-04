import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PolicyDecision,
  AuthorizeResult,
} from '@backstage/plugin-permission-common';
import { OpaClient } from '../opa-client/opaClient';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { PolicyEvaluationInput } from '../types';
import { Logger } from 'winston';

export const policyEvaluator = (opaClient: OpaClient, logger: Logger) => {
  return async (
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> => {
    const input: PolicyEvaluationInput = {
      permission: {
        name: request.permission.name,
      },
      identity: {
        user: user?.identity.userEntityRef,
        claims: user?.identity.ownershipEntityRefs ?? [],
      },
    };

    logger.info(`Evaluating policy ${request.permission.name} for user ${user?.identity.userEntityRef}`)
    const response = await opaClient.evaluatePolicy(input);

    if (response.decision.result === 'CONDITIONAL') {
      return {
        result: AuthorizeResult.CONDITIONAL,
        pluginId: response.decision.pluginId,
        resourceType: response.decision.resourceType,
        conditions: response.decision.conditions,
      };
    }

    if (response.decision.result !== 'ALLOW') {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  };
};
