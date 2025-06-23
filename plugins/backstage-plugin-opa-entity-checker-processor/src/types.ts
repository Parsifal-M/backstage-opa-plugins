export interface OpaPolicyResult {
  decision_id?: string;
  result?: OpaEntityResult[];
}

export interface OpaEntityResult {
  decision_id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}
