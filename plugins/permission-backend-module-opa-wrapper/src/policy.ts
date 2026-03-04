import {
  PolicyDecision,
  AuthorizeResult,
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { OpaClient } from './opa-client';
import { LoggerService } from '@backstage/backend-plugin-api';
import { PermissionsFrameworkPolicyInput } from './types';

export class OpaPermissionPolicy implements PermissionPolicy {
  private opaClient: OpaClient;
  private logger: LoggerService;

  constructor(opaClient: OpaClient, logger: LoggerService) {
    this.opaClient = opaClient;
    this.logger = logger;
  }

  async handle(
    request: PolicyQuery,
    user: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    this.logger.debug(
      `Evaluating permission "${request.permission.name}" for user "${user.info.userEntityRef}"`,
    );

    const input: PermissionsFrameworkPolicyInput = {
      permission: {
        name: request.permission.name,
      },
      identity: {
        user: user.info.userEntityRef,
        claims: user.info.ownershipEntityRefs ?? [],
      },
    };

    const response = await this.opaClient.evaluatePermissionsFrameworkPolicy(
      input,
    );

    if (!response) {
      this.logger.error(
        'The result is missing in the response from OPA, are you sure the policy is loaded?',
      );
      throw new Error(
        'The result is missing in the response from OPA, are you sure the policy is loaded?',
      );
    }

    if (response.result === 'CONDITIONAL') {
      const permissionName = request.permission.name;
      if (!response.conditions) {
        this.logger.error(
          `Conditions are missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns conditions.`,
        );
        throw new Error(
          `Conditions are missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns conditions.`,
        );
      }
      if (!response.pluginId) {
        this.logger.error(
          `pluginId is missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns pluginId.`,
        );
        throw new Error(
          `pluginId is missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns pluginId.`,
        );
      }
      if (!response.resourceType) {
        this.logger.error(
          `resourceType is missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns resourceType.`,
        );
        throw new Error(
          `resourceType is missing for CONDITIONAL decision on permission "${permissionName}". Check your OPA policy returns resourceType.`,
        );
      }

      return {
        result: AuthorizeResult.CONDITIONAL,
        pluginId: response.pluginId,
        resourceType: response.resourceType,
        conditions: response.conditions as PermissionCriteria<
          PermissionCondition<string, PermissionRuleParams>
        >,
      };
    }

    if (response.result !== 'ALLOW') {
      return { result: AuthorizeResult.DENY };
    }

    return { result: AuthorizeResult.ALLOW };
  }
}
