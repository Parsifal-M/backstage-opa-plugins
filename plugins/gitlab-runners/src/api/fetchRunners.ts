import { Job, Runner, RunnerDetails } from '../types';

export const getRunners = async (status: string): Promise<Runner[]> => {
  const response = await fetch(
    `http://localhost:7007/api/proxy/gitlab-runners?status=${status}&order_by=id&per_page=40`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch runners');
  }
  return response.json();
};

export const getRunnerDetails = async (
  runnerId: number,
): Promise<RunnerDetails> => {
  const response = await fetch(
    `http://localhost:7007/api/proxy/gitlab-runners/${runnerId}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch runner details');
  }
  const details: RunnerDetails = await response.json();
  return details;
};

export const getRunnerJobs = async (runnerId: number): Promise<Job[]> => {
  const response = await fetch(
    `http://localhost:7007/api/proxy/gitlab-runners/${runnerId}/jobs?order_by=id&per_page=5`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch runner jobs');
  }
  const jobs: Job[] = await response.json();
  return jobs;
};
