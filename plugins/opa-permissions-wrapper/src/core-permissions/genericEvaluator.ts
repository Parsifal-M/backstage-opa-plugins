import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PolicyDecision,
  AuthorizeResult,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import { OpaClient } from '../opa-client/opaClient';
import { Config } from '@backstage/config';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { PolicyEvaluationInput } from '../../types';

export const policyEvaluator = (opaClient: OpaClient, config: Config) => {
  return async (
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> => {
    const resourceType = isResourcePermission(request.permission)
      ? request.permission.resourceType
      : undefined;
    const userGroups = user?.identity.ownershipEntityRefs ?? [];
    const userName = user?.identity.userEntityRef;

    const {
      type,
      name,
      attributes: { action },
    } = request.permission;

    const input: PolicyEvaluationInput = {
      permission: {
        type,
        name,
        action,
        resourceType,
      },
      identity: {
        username: userName,
        groups: userGroups,
      },
    };

    const response = await opaClient.evaluatePolicy(
      input,
      config.getString('opaClient.policies.package'),
    );

    if (response.decision.result === 'CONDITIONAL') {
      return {
        result: AuthorizeResult.CONDITIONAL,
        pluginId: response.decision.pluginId,
        resourceType: response.decision.resourceType,
        conditions: response.condition,
      };
    }

    if (response.decision.result !== 'ALLOW') {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  };
};
