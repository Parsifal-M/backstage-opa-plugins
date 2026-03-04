export * from './opa-client/opaClient';
export type {
  PermissionsFrameworkPolicyInput,
  PermissionsFrameworkPolicyEvaluationResult,
  FallbackPolicyDecision,
} from './types';
export { permissionModuleOpaWrapper as default } from './module';
