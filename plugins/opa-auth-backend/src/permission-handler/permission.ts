import { catalogPermissions } from "../catalog-policies/policies";
import { OpaClient } from "../opa/opaClient";
import { PolicyDecision, AuthorizeResult, isResourcePermission } from "@backstage/plugin-permission-common";
import { PolicyQuery } from "@backstage/plugin-permission-node";
import { Logger } from "winston";

export class PermissionsHandler {
  constructor(private opaClient: OpaClient, private logger: Logger) {}

  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    // Use the policy function from your policies.ts file here
    this.logger.info("PermissionsHandler.handle called");
    this.logger.info(JSON.stringify(request));

    const cannotDeleteEntitiesPolicy = await catalogPermissions(this.opaClient);

    if (isResourcePermission(request.permission, "catalog-entity")) {
      const policyDecision = await cannotDeleteEntitiesPolicy(request);
      this.logger.info(`Policy decision: ${JSON.stringify(policyDecision)}`);
      return policyDecision;
    }

    // If the entity is not a "catalog-entity", you can decide what to do, e.g.:
    return { result: AuthorizeResult.ALLOW };
  }
}
