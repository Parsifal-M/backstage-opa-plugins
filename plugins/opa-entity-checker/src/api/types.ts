export interface OpaResult {
  allow: boolean;
  violation?: Violation[];
}

export interface Violation {
  level: 'error' | 'warning';
  message: string;
}

  