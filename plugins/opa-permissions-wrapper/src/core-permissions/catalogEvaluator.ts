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
import { Config } from '@backstage/config';

export const catalogPolicyEvaluator = (
  opaClient: OpaClient,
  config: Config,
) => {
  return async (
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> => {
    const resourceType = isResourcePermission(request.permission)
      ? request.permission.resourceType
      : undefined;
    const userGroups = user?.identity.ownershipEntityRefs ?? [];
    const userName = user?.identity.userEntityRef;
    const opaCatalogPackage = config.getString(
      'opaClient.policies.catalogPermission.package',
    );

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

    const response: PolicyEvaluationResult = await opaClient.evaluatePolicy(
      input,
      opaCatalogPackage,
    );

    if (response.allow) {
      if (
        response.conditional &&
        response.catalog_condition &&
        isResourcePermission(request.permission, 'catalog-entity')
      ) {
        const conditionalDescision = response.catalog_condition;
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
