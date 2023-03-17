/* eslint-disable @backstage/no-undeclared-imports */
import { PolicyDecision } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { AuthorizeResult } from "@backstage/plugin-permission-common";
import { OpaClient } from "../opa/opaClient";

export async function cannotDeleteEntities(opaClient: OpaClient) {
  return async (request: PolicyQuery): Promise<PolicyDecision> => {
    // Check if the requested action is to remove a catalog entity
    if (request.permission.name === "catalog.entity.delete") {
      const result = await opaClient.evaluatePolicy("my-custom-policy", {
        input: {
          permission: {
            path: "catalog.entity.delete",
          },
        },
      });

      return { result: result ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
    }

    // Return ALLOW for all other permissions
    return { result: AuthorizeResult.ALLOW };
  };
}

export async function cannotViewEntities(opaClient: OpaClient) {
  return async (request: PolicyQuery): Promise<PolicyDecision> => {
    // Check if the requested action is to view a catalog entity
    if (request.permission.name === "catalog.entity.view") {
      const result = await opaClient.evaluatePolicy("my-custom-policy", {
        input: {
          permission: {
            path: "catalog.entity.view",
          },
        },
      });

      return { result: result ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
    }

    // Return ALLOW for all other permissions
    return { result: AuthorizeResult.ALLOW };
  };
}

export async function cannotAddEntities(opaClient: OpaClient) {
  return async (request: PolicyQuery): Promise<PolicyDecision> => {
    // Check if the requested action is to add a catalog entity
    if (request.permission.name === "catalog.entity.add") {
      const result = await opaClient.evaluatePolicy("my-custom-policy", {
        input: {
          permission: {
            path: "catalog.entity.add",
          },
        },
      });

      return { result: result ? AuthorizeResult.DENY : AuthorizeResult.ALLOW };
    }

    // Return ALLOW for all other permissions
    return { result: AuthorizeResult.ALLOW };
  };
}