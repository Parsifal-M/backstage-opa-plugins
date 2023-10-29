import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  PolicyDecision,
  AuthorizeResult,
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
    const input: PolicyEvaluationInput = {
      permission: request.permission,
      identity: {
        user: user?.identity.userEntityRef,
        claims: user?.identity.ownershipEntityRefs ?? [],
      },
    };

    const response = await opaClient.evaluatePolicy(
      input,
      config.getString('opaClient.policies.rbac.package'),
    );

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
