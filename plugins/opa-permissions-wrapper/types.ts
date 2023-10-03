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

export interface CatalogPolicyEvaluationResult {
  decision_id: string;
  allow: boolean;
  conditional: boolean;
  condition?: PermissionCriteria<
    PermissionCondition<'catalog-entity', PermissionRuleParams>
  >;
}

export interface ScaffolderPolicyEvaluationResult {
  decision_id: string;
  allow: boolean;
  conditional: boolean;
  action_condition?: PermissionCriteria<
    PermissionCondition<'scaffolder-action', PermissionRuleParams>
  >;
  template_condition?: PermissionCriteria<
    PermissionCondition<'scaffolder-template', PermissionRuleParams>
  >;
}
