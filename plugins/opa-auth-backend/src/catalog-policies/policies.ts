/* eslint-disable @backstage/no-undeclared-imports */
import { isResourcePermission, PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa/opaClient";
import { BackstageIdentityResponse } from "@backstage/plugin-auth-node";

export async function catalogPermissions(opaClient: OpaClient) {
  return async (request: PolicyQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> => {
    const isResouceType = isResourcePermission(request.permission, "catalog-entity");
    const result = await opaClient.evaluatePolicy("catalog_policy", {
      "input": {
        "permission": {
          "type": request.permission.type,
          "name": request.permission.name,
          "attributes": request.permission.attributes,
          "resourceType": isResouceType
        },
        "user": {
          "identity": user?.identity.userEntityRef,
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

