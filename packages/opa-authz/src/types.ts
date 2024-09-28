export type PolicyInput = Record<string, unknown>;

export type PolicyResult = {
  decision_id: string;
  result: {
    allow: boolean;
  }
};