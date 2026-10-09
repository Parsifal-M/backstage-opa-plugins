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
import {
  AuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { PermissionsFrameworkPolicyInput } from './types';

/**
 * The subset of {@link OpaClient} the policy depends on, so tests (and
 * alternative transports) can supply their own implementation.
 */
export type PermissionsFrameworkPolicyEvaluator = Pick<
  OpaClient,
  'evaluatePermissionsFrameworkPolicy'
>;

export type OpaPermissionPolicyOptions = {
  opaClient: PermissionsFrameworkPolicyEvaluator;
  auth: AuthService;
  userInfo: UserInfoService;
  logger: LoggerService;
};

export class OpaPermissionPolicy implements PermissionPolicy {
  private readonly opaClient: PermissionsFrameworkPolicyEvaluator;
  private readonly auth: AuthService;
  private readonly userInfo: UserInfoService;
  private readonly logger: LoggerService;

  constructor(options: OpaPermissionPolicyOptions) {
    this.opaClient = options.opaClient;
    this.auth = options.auth;
    this.userInfo = options.userInfo;
    this.logger = options.logger;
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const identity = await this.resolveIdentity(user);

    this.logger.debug(
      `Evaluating permission "${request.permission.name}" for user "${
        identity?.user ?? '<none>'
      }"`,
    );

    const input: PermissionsFrameworkPolicyInput = {
      permission: {
        name: request.permission.name,
      },
      ...(identity && { identity }),
    };

    const response = await this.opaClient.evaluatePermissionsFrameworkPolicy(
      input,
    );

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

  /**
   * Resolves the user's identity from their credentials via the UserInfo
   * service, replacing the deprecated `PolicyQueryUser.info`.
   *
   * The PermissionPolicy contract allows `user` to be undefined, and its
   * credentials are not guaranteed to belong to a user principal. In both
   * cases no identity is sent to OPA.
   */
  private async resolveIdentity(
    user: PolicyQueryUser | undefined,
  ): Promise<PermissionsFrameworkPolicyInput['identity']> {
    if (!user || !this.auth.isPrincipal(user.credentials, 'user')) {
      return undefined;
    }

    const { userEntityRef, ownershipEntityRefs } =
      await this.userInfo.getUserInfo(user.credentials);

    return { user: userEntityRef, claims: ownershipEntityRefs };
  }
}
