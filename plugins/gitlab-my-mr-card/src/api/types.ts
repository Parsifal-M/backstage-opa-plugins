export interface User {
  id: number;
  username: string;
  name?: string;
  state?: string;
  avatar_url?: string;
  web_url?: string;
}

export interface MergeRequest {
  web_url: string;
  title: string;
}

export type MergeRequestList = MergeRequest[];
