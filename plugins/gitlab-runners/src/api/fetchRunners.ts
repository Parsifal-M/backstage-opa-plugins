// fetchRunners.ts

export const getRunners = async (): Promise<any> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners?per_page=100`);
  if (response.ok) {
    return response.json();
  } 
  console.error('Failed to fetch runners'); // TODO handle error
  return null;
};

export const getRunnerJobs = async (runnerId: number): Promise<any> => {
  const response = await fetch(`http://localhost:7007/api/proxy/gitlab-runners/${runnerId}/jobs`);
  if (response.ok) {
    return response.json();
  } 
  console.error('Failed to fetch runner jobs'); // TODO handle error
  return null;
}
