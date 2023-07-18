import { createApiRef } from "@backstage/core-plugin-api";

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

  export const GitlabRunnerApiRef = createApiRef<Runners>({
    id: 'plugin.gitlabrunner.service',
});
  
  export type Runners = Runner[];
  