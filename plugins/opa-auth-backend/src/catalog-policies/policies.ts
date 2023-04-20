/* eslint-disable @backstage/no-undeclared-imports */
import { isResourcePermission, PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa-client/opaClient";
import { BackstageIdentityResponse } from "@backstage/plugin-auth-node";

export async function catalogPermissions(opaClient: OpaClient) {
  return async (request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> => {
    const isResourceType = isResourcePermission(request.permission, "catalog-entity");
    const userGroups = user?.identity.ownershipEntityRefs ?? [];
    const userName = user?.identity.userEntityRef ?? [];
    const { type, name, attributes: { action } } = request.permission;
    
    const result = await opaClient.evaluatePolicy("catalog_policy", {
      "input": {
        "permission": {
          "type": type,
          "name": name,
          "action": action,
          "resourceType": isResourceType
        },
        "identity": {
          "username": userName,
          "groups": userGroups
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

