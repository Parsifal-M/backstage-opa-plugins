export type OpaLevel = 'error' | 'warning' | 'info';

export type OpaEntityResult = {
  decision_id?: string;
  check_title?: string;
  level: OpaLevel;
  message: string;
};

export type OpaEntityCheckResult = {
  result?: OpaEntityResult[];
};

export type PolicyInput = Record<string, unknown>;

export type PolicyResult = {
  decision_id?: string;
  result: {
    allow: boolean;
  };
  [key: string]: unknown;
};
