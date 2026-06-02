import type { AxiosInstance } from 'axios';
import type { ClickUpTask, ClickUpComment } from './types';

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  status?: string;
  priority?: number | null;
  due_date?: number | null;
  due_date_time?: boolean;
  start_date?: number | null;
  start_date_time?: boolean;
  time_estimate?: number | null;
  notify_all?: boolean;
  assignees?: { add?: number[]; rem?: number[] };
}

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

export async function getTask(
  client: AxiosInstance,
  taskId: string,
  includeSubtasks = false
): Promise<ClickUpTask> {
  const { data } = await client.get<ClickUpTask>(`/task/${taskId}`, {
    params: {
      ...(includeSubtasks ? { include_subtasks: true } : {}),
      custom_fields: true,
    },
  });
  return data;
}

export async function getTaskComments(
  client: AxiosInstance,
  taskId: string
): Promise<ClickUpComment[]> {
  const { data } = await client.get<{ comments: ClickUpComment[] }>(`/task/${taskId}/comment`);
  return data.comments ?? [];
}

export async function updateTask(
  client: AxiosInstance,
  taskId: string,
  payload: UpdateTaskPayload
): Promise<ClickUpTask> {
  const { data } = await client.put<ClickUpTask>(`/task/${taskId}`, payload);
  return data;
}

export async function addComment(
  client: AxiosInstance,
  taskId: string,
  text: string,
  notifyAll = false
): Promise<{ id: string }> {
  const { data } = await client.post<{ id: string }>(`/task/${taskId}/comment`, {
    comment_text: text,
    notify_all: notifyAll,
  });
  return data;
}

export async function updateComment(
  client: AxiosInstance,
  commentId: string,
  text: string,
  resolved?: boolean
): Promise<void> {
  const body: Record<string, unknown> = { comment_text: text };
  if (resolved !== undefined) body['resolved'] = resolved;
  await client.put(`/comment/${commentId}`, body);
}
