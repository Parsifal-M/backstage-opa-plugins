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

export interface PolicyEvaluationResult {
  decision_id: string;
  allow: boolean;
  conditional: boolean;
  condition?: PermissionCriteria<
    PermissionCondition<'catalog-entity', PermissionRuleParams>
  >;
}
