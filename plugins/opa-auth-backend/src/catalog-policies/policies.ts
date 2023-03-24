/* eslint-disable @backstage/no-undeclared-imports */
import { isResourcePermission, PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa/opaClient";


export async function cannotDeleteEntities(opaClient: OpaClient) {
    return async (request: PolicyQuery): Promise<PolicyDecision> => {
      // Check if the requested action is to remove a catalog entity
      if (isResourcePermission(request.permission, "catalog-entity")) {
        const result = await opaClient.evaluatePolicy("catalog-policy", {
          input: {
            permission: {
              action: "blah",
            },
          },
        });
  
        // Deny if result is false, empty string or undefined, otherwise, allow
        return {
          result:
            result === undefined || !result
              ? AuthorizeResult.ALLOW
              : AuthorizeResult.DENY,
        };
        }

        return { result: AuthorizeResult.ALLOW };
    };
  }
  