import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { OpaClient } from '../opa-client/opaClient';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { createCatalogConditionalDecision } from '@backstage/plugin-catalog-backend/alpha';
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

    // For debugging purposes
    console.log('input', JSON.stringify(input, null, 2));

    const response: PolicyEvaluationResult = await opaClient.evaluatePolicy(
      input,
    );
    if (response.allow) {
      if (
        response.conditional &&
        response.condition &&
        isResourcePermission(request.permission, 'catalog-entity')
      ) {
        const conditionalDescision = response.condition;
        return createCatalogConditionalDecision(
          request.permission,
          conditionalDescision,
        );
      }

      return { result: AuthorizeResult.ALLOW };
    }

    return { result: AuthorizeResult.DENY };
  };
};
