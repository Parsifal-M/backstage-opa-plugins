import { PolicyDecision, isResourcePermission, AuthorizeResult } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { PolicyEvaluationInput, PolicyEvaluationResult } from "../../types";
import { OpaClient } from "../opa-client/opaClient";
// eslint-disable-next-line @backstage/no-undeclared-imports
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';

export function createOpaPermissionEvaluator(opaClient: OpaClient) {
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
            type: type,
            name: name,
            action: action,
            resourceType: resourceType,
          },
          identity: {
            username: userName,
            groups: userGroups,
          },
        },
      };
  
      const evaluationResult: PolicyEvaluationResult =
        await opaClient.evaluatePolicy(input);
  
      return {
        result: evaluationResult.deny
          ? AuthorizeResult.DENY
          : AuthorizeResult.ALLOW,
      };
    };
  }