export interface OpaEntityCheckResult {
  result?: OpaResult[];
}

export interface OpaResult {
  decision_id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}
