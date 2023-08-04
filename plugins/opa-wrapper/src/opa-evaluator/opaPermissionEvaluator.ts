import {
  PolicyDecision,
  isResourcePermission,
  AuthorizeResult
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { OpaClient } from '../opa-client/opaClient';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { PolicyEvaluationInput, PolicyEvaluationResult } from '../../types';



export const createOpaPermissionEvaluator = (opaClient: OpaClient) => {
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
      input: {
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
      },
    };

    // For debugging purposes
    console.log('input', JSON.stringify(input, null, 2));

    const response: PolicyEvaluationResult = await opaClient.evaluatePolicy(input);
    const allow = !response.deny; // If 'deny' is false, then 'allow' will be true

    return {
      result: allow ? AuthorizeResult.ALLOW : AuthorizeResult.DENY,
    };
  };
};
