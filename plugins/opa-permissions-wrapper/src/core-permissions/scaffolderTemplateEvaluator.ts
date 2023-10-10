import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import { OpaClient } from '../opa-client/opaClient';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { createScaffolderTemplateConditionalDecision } from '@backstage/plugin-scaffolder-backend/alpha';
import { PolicyEvaluationInput, PolicyEvaluationResult } from '../../types';
import { Config } from '@backstage/config';

export const scaffolderTemplatePolicyEvaluator = (
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
    const opaScaffolderTemplatePackage = config.getString(
      'opaClient.policies.opaScaffolderTemplatePackage.package',
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
      opaScaffolderTemplatePackage,
    );
    if (response.allow) {
      if (
        response.conditional &&
        response.software_template_condition &&
        isResourcePermission(request.permission, 'scaffolder-template')
      ) {
        const conditionalDescision = response.software_template_condition;
        return createScaffolderTemplateConditionalDecision(
          request.permission,
          conditionalDescision,
        );
      }

      return { result: AuthorizeResult.ALLOW };
    }

    return { result: AuthorizeResult.DENY };
  };
};
