import { MergeRequest, User } from './types';

export const getUser = async (status: string): Promise<User> => {
  const response = await fetch(
    `http://localhost:7007/api/proxy/gitlab-runners?status=${status}&order_by=id&per_page=40`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch runners');
  }
  return response.json();
};

export const getMergeRequests = async (
  status: string,
): Promise<MergeRequest[]> => {
  const response = await fetch(
    `http://localhost:7007/api/proxy/gitlab-runners?status=${status}&order_by=id&per_page=40`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch runners');
  }
  return response.json();
};
