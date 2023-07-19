// fetchRunners.ts

import { Job } from "../types";

export const getRunners = async (): Promise<any> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners?per_page=100`);
  if (response.ok) {
    return response.json();
  } 
  console.error('Failed to fetch runners'); // TODO handle error
  return null;
};

export const getRunnerJobs = async (runnerId: number): Promise<Job[]> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners/${runnerId}/jobs?order_by=id&per_page=30`);
  if (response.ok) {
    const jobs: Job[] = await response.json();
    return jobs;
  } 
  console.error('Failed to fetch runner jobs'); // TODO handle error
  return [];
}


