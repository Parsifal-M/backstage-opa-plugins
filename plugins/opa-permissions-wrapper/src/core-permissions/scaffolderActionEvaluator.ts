import {
    AuthorizeResult,
    PolicyDecision,
    isResourcePermission,
  } from '@backstage/plugin-permission-common';
  import { PolicyQuery } from '@backstage/plugin-permission-node';
  import { OpaClient } from '../opa-client/opaClient';
  import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
  import { createScaffolderActionConditionalDecision } from '@backstage/plugin-scaffolder-backend/alpha';
  import { PolicyEvaluationInput, PolicyEvaluationResult } from '../../types';
import { Config } from '@backstage/config';
  
  export const scaffolderActionPolicyEvaluator = (opaClient: OpaClient, config: Config) => {
    return async (
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
    ): Promise<PolicyDecision> => {
      const resourceType = isResourcePermission(request.permission)
        ? request.permission.resourceType
        : undefined;
      const userGroups = user?.identity.ownershipEntityRefs ?? [];
      const userName = user?.identity.userEntityRef;
      const opaScaffolderActionPackage = config.getString('opaClient.policies.scaffolderActionPermission.package')

  
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
        opaScaffolderActionPackage
      );
      if (response.allow) {
        if (
          response.conditional &&
          response.software_template_action_condition &&
          isResourcePermission(request.permission, 'scaffolder-action')
        ) {
          const conditionalDescision = response.software_template_action_condition;
          return createScaffolderActionConditionalDecision(
            request.permission,
            conditionalDescision,
          );
        }
  
        return { result: AuthorizeResult.ALLOW };
      }
  
      return { result: AuthorizeResult.DENY };
    };
  };
  