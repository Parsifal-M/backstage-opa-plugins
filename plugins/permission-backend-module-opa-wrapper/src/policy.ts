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
    return await this.evaluatePolicy(request, user);
  }

  private async evaluatePolicy(
    request: PolicyQuery,
    user: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const input: PermissionsFrameworkPolicyInput = {
      permission: {
        name: request.permission.name,
      },
      identity: {
        user: user.info.userEntityRef,
        claims: user.info.ownershipEntityRefs ?? [],
      },
    };

    try {
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
        if (!response.conditions) {
          this.logger.error('Conditions are missing for CONDITIONAL decision');
          throw new Error('Conditions are missing for CONDITIONAL decision');
        }
        if (!response.pluginId) {
          this.logger.error('PluginId is missing for CONDITIONAL decision');
          throw new Error('PluginId is missing for CONDITIONAL decision');
        }
        if (!response.resourceType) {
          this.logger.error('ResourceType is missing for CONDITIONAL decision');
          throw new Error('ResourceType is missing for CONDITIONAL decision');
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
    } catch (error: unknown) {
      throw error;
    }
  }
}
