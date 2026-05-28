import type { AxiosInstance } from 'axios';
import type { ClickUpTeam, ClickUpSpace, ClickUpFolder, ClickUpList } from './types';

export async function getWorkspaces(client: AxiosInstance): Promise<ClickUpTeam[]> {
  const { data } = await client.get<{ teams: ClickUpTeam[] }>('/team');
  return data.teams;
}

export async function getSpaces(client: AxiosInstance, workspaceId: string): Promise<ClickUpSpace[]> {
  const { data } = await client.get<{ spaces: ClickUpSpace[] }>(`/team/${workspaceId}/space`);
  return data.spaces;
}

export async function getFolders(client: AxiosInstance, spaceId: string): Promise<ClickUpFolder[]> {
  const { data } = await client.get<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`);
  return data.folders;
}

export async function getFolderLists(client: AxiosInstance, folderId: string): Promise<ClickUpList[]> {
  const { data } = await client.get<{ lists: ClickUpList[] }>(`/folder/${folderId}/list`);
  return data.lists;
}

export async function getFolderlessLists(client: AxiosInstance, spaceId: string): Promise<ClickUpList[]> {
  const { data } = await client.get<{ lists: ClickUpList[] }>(`/space/${spaceId}/list`);
  return data.lists;
}
