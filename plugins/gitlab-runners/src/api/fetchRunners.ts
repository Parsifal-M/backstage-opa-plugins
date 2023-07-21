// fetchRunners.ts

import { Job } from "../types";

export const getRunners = async (status: string): Promise<any> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners?status=${status}&order_by=id&per_page=40`);
  if (response.ok) {
    return response.json();
  } 
  console.error('Failed to fetch runners'); // TODO handle error
  return null;
};

export const getRunnerDetails = async (runnerId: number): Promise<any> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners/${runnerId}`);
  if (response.ok) {
    return response.json();
  }
  console.error('Failed to fetch runner details'); // TODO handle error
  return null;
};

export const getRunnerJobs = async (runnerId: number): Promise<Job[]> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners/${runnerId}/jobs?order_by=id&per_page=5`);
  if (response.ok) {
    const jobs: Job[] = await response.json();
    return jobs;
  } 
  console.error('Failed to fetch runner jobs'); // TODO handle error
  return [];
}


