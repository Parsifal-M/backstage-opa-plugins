export interface User {
  id: number;
  name: string;
  username: string;
  state: string;
  avatar_url: string;
  web_url: string;
  created_at: string;
  bio: null | string;
  location: null | string;
  public_email: string;
  skype: string;
  linkedin: string;
  twitter: string;
  website_url: string;
  organization: null | string;
}

export interface Commit {
  id: string;
  short_id: string;
  title: string;
  created_at: string;
  parent_ids: string[];
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
}

export interface Pipeline {
  id: number;
  sha: string;
  ref: string;
  status: string;
  web_url: string;
}

export interface Project {
  id: number;
  description: null | string;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
}

export interface RunnerDetails {
  active: boolean;
  paused: boolean;
  architecture: null | string;
  description: string;
  id: number;
  ip_address: string;
  is_shared: boolean;
  runner_type: string;
  contacted_at: string;
  name: null | string;
  online: boolean;
  status: string;
  platform: null | string;
  projects: Project[];
  revision: null | string;
  tag_list: string[];
  version: null | string;
  access_level: string;
  maximum_timeout: number;
}

export interface Job {
  id: number;
  ip_address: string;
  status: string;
  stage: string;
  name: string;
  ref: string;
  tag: boolean;
  coverage: null | number;
  created_at: string;
  started_at: string;
  finished_at: string;
  duration: number;
  user: User;
  commit: Commit;
  pipeline: Pipeline;
  project: Project;
}

export type Jobs = Job[];

export interface Runner {
  active: boolean;
  paused: boolean;
  description: string;
  id: number;
  ip_address: string;
  is_shared: boolean;
  runner_type: string;
  name: string | null;
  online: boolean;
  status: string;
}

export type Runners = Runner[];
