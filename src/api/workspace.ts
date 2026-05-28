import type { AxiosInstance } from 'axios';
import type { ClickUpTeam } from './types';

export async function getWorkspaces(client: AxiosInstance): Promise<ClickUpTeam[]> {
  const { data } = await client.get<{ teams: ClickUpTeam[] }>('/team');
  return data.teams;
}
