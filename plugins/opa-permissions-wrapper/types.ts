import {
  PermissionCriteria,
  PermissionCondition,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';

export type PolicyEvaluationInput = {
  permission: {
    type: string;
    name: string;
    action: string | undefined;
    resourceType?: string;
  };
  identity?: {
    username: string | undefined;
    groups: string[];
  };
};

export type PolicyEvaluationResult = {
  descision_id: string;
  allow: boolean;
  conditional?: boolean;
  catalog_condition?: PermissionCriteria<
    PermissionCondition<'catalog-entity', PermissionRuleParams>
  >;
  software_template_action_condition?: PermissionCriteria<
    PermissionCondition<'scaffolder-action', PermissionRuleParams>
  >;
  software_template_condition?: PermissionCriteria<
    PermissionCondition<'scaffolder-template', PermissionRuleParams>
  >;
};

export interface ConditionalDecision {
  claims: string;
  decision: {
    conditions: {
      anyOf?: {
        params: {
          [key: string]: any;
        };
        resourceType: string;
        rule: string;
      }[];
      allOf?: {
        params: {
          [key: string]: any;
        };
        resourceType: string;
        rule: string;
      }[];
      none?: {
        params: {
          [key: string]: any;
        };
        resourceType: string;
        rule: string;
      }[];
    };
    pluginId: string;
    resourceType: string;
    result: string;
  };
  permission: string;
}