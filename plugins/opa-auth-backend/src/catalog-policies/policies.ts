/* eslint-disable @backstage/no-undeclared-imports */
import { isResourcePermission, PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa/opaClient";


export async function catalogPermissions(opaClient: OpaClient) {
  return async (request: PolicyQuery): Promise<PolicyDecision> => {
    // Check if the requested action is on the catalog.
    if (isResourcePermission(request.permission, "catalog-entity")) {
      const result = await opaClient.evaluatePolicy("example_policy", {
        "input": {
          "permission": {
            "type": request.permission.type,
            "name": request.permission.name,
            "attributes": request.permission.attributes,
            "resourceType": request.permission.resourceType,
          },
        },
      });

      // Deny if the 'deny' property is true
      return {
        result:
          result.deny
            ? AuthorizeResult.DENY
            : AuthorizeResult.ALLOW,
      };
    }

    return { result: AuthorizeResult.ALLOW };
  };
}


 