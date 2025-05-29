export type ValidationResult = {
  id?: string;
  check_title?: string;
  level: 'error' | 'warning' | 'info' | 'success';
  url?: string;
  decisionId?: string;
  message: string;
};

export type ValidationResponse = {
  result?: ValidationResult[];
};

export type OpaConfig = {
  baseUrl: string;
  entrypoint: string;
};
