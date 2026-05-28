import type { AxiosInstance } from 'axios';
import type { ClickUpUser } from './types';

export async function getCurrentUser(client: AxiosInstance): Promise<ClickUpUser> {
  const { data } = await client.get<{ user: ClickUpUser }>('/user');
  return data.user;
}
