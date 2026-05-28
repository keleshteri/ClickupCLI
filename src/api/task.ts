import type { AxiosInstance } from 'axios';
import type { ClickUpTask } from './types';

export interface TaskFilters {
  page?: number;
  statuses?: string[];
  assignees?: string[];
  tags?: string[];
  subtasks?: boolean;
  archived?: boolean;
}

export async function getTasks(
  client: AxiosInstance,
  listId: string,
  filters: TaskFilters = {}
): Promise<{ tasks: ClickUpTask[]; lastPage: boolean }> {
  const params: Record<string, unknown> = {
    page: filters.page ?? 0,
    subtasks: filters.subtasks ?? false,
    archived: filters.archived ?? false,
  };

  if (filters.statuses?.length) params['statuses[]'] = filters.statuses;
  if (filters.assignees?.length) params['assignees[]'] = filters.assignees;
  if (filters.tags?.length) params['tags[]'] = filters.tags;

  const { data } = await client.get<{ tasks: ClickUpTask[]; last_page?: boolean }>(
    `/list/${listId}/task`,
    { params }
  );

  return { tasks: data.tasks, lastPage: data.last_page ?? true };
}

export async function getTask(client: AxiosInstance, taskId: string): Promise<ClickUpTask> {
  const { data } = await client.get<ClickUpTask>(`/task/${taskId}`);
  return data;
}
