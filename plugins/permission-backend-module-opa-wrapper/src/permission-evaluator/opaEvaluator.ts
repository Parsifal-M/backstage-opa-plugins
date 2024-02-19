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

export const policyEvaluator = (
  opaClient: OpaClient,
  logger: Logger,
  opaEntryPoint?: string,
) => {
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

    try {
      const response = await opaClient.evaluatePolicy(input, opaEntryPoint);

      if (!response) {
        logger.error(
          'The decision is missing in the response from OPA, are you sure the policy is loaded?',
        );
        throw new Error(
          'The decision is missing in the response from OPA, are you sure the policy is loaded?',
        );
      }

      if (response.result === 'CONDITIONAL') {
        if (!response.conditions) {
          logger.error('Conditions are missing for CONDITIONAL decision');
          throw new Error('Conditions are missing for CONDITIONAL decision');
        }
        if (!response.pluginId) {
          logger.error('PluginId is missing for CONDITIONAL decision');
          throw new Error('PluginId is missing for CONDITIONAL decision');
        }
        if (!response.resourceType) {
          logger.error('ResourceType is missing for CONDITIONAL decision');
          throw new Error('ResourceType is missing for CONDITIONAL decision');
        }

        return {
          result: AuthorizeResult.CONDITIONAL,
          pluginId: response.pluginId,
          resourceType: response.resourceType,
          conditions: response.conditions as PermissionCriteria<
            PermissionCondition<string, PermissionRuleParams>
          >,
        };
      }

      if (response.result !== 'ALLOW') {
        return { result: AuthorizeResult.DENY };
      }

      return { result: AuthorizeResult.ALLOW };
    } catch (error: unknown) {
      throw error;
    }
  };
};
