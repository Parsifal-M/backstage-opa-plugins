// /* eslint-disable @backstage/no-undeclared-imports */
// import { Permission, PolicyDecision } from "@backstage/plugin-permission-common";
// import { PolicyQuery } from "@backstage/plugin-permission-node";
// import { AuthorizeResult } from "@backstage/plugin-permission-common";
// import { OpaClient } from "../opa/opaClient";

// export async function cannotDeleteEntities(opaClient: OpaClient) {
//   async handle(request: PolicyQuery): Promise<PolicyDecision> {
//     if (request.permission.name === 'catalog.entity.delete') {
//       return {
//         result: AuthorizeResult.DENY,
//       };
//     }

//     return { result: AuthorizeResult.ALLOW };
//   }