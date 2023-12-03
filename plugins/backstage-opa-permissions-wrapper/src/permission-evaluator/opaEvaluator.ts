import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PolicyDecision,
  AuthorizeResult,
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
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

    const response = await opaClient.evaluatePolicy(input);

    if (response.decision.result === 'CONDITIONAL') {
      if (!response.decision.conditions) {
        logger.error('Conditions are missing for CONDITIONAL decision');
        throw new Error('Conditions are missing for CONDITIONAL decision');
      }
      if (!response.decision.pluginId) {
        logger.error('PluginId is missing for CONDITIONAL decision');
        throw new Error('PluginId is missing for CONDITIONAL decision');
      }
      if (!response.decision.resourceType) {
        logger.error('ResourceType is missing for CONDITIONAL decision');
        throw new Error('ResourceType is missing for CONDITIONAL decision');
      }

      return {
        result: AuthorizeResult.CONDITIONAL,
        pluginId: response.decision.pluginId,
        resourceType: response.decision.resourceType,
        conditions: response.decision.conditions as PermissionCriteria<
          PermissionCondition<string, PermissionRuleParams>
        >,
      };
    }

    if (response.decision.result !== 'ALLOW') {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  };
};
