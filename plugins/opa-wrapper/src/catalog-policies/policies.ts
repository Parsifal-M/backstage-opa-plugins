/* eslint-disable @backstage/no-undeclared-imports */
import { PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa-client/opaClient";
import { BackstageIdentityResponse } from "@backstage/plugin-auth-node";
import { isResourcePermission } from "@backstage/plugin-permission-common";

export async function catalogPermissions(opaClient: OpaClient) {
  return async (request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> => {
    const resourceType = isResourcePermission(request.permission) ? request.permission.resourceType : undefined;
    const userGroups = user?.identity.ownershipEntityRefs ?? [];
    const userName = user?.identity.userEntityRef ?? [];
    const { type, name, attributes: { action } } = request.permission;
    
    const result = await opaClient.evaluatePolicy({
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
    });

    return {
      result:
        result.deny
          ? AuthorizeResult.DENY
          : AuthorizeResult.ALLOW,
    };
  };
}
