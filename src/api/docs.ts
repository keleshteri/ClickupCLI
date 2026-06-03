import { createV3ApiClient } from './client';
import type { ClickUpDoc, ClickUpDocPage } from './types';

export async function getDocs(workspaceId: string): Promise<ClickUpDoc[]> {
  const client = createV3ApiClient();
  const { data } = await client.get<{ docs: ClickUpDoc[] }>(`/workspaces/${workspaceId}/docs`, {
    params: { deleted: false, archived: false },
  });
  return data.docs ?? [];
}

export async function getDoc(workspaceId: string, docId: string): Promise<ClickUpDoc> {
  const client = createV3ApiClient();
  const { data } = await client.get<ClickUpDoc>(`/workspaces/${workspaceId}/docs/${docId}`);
  return data;
}

export async function getDocPage(
  workspaceId: string,
  docId: string,
  pageId: string
): Promise<ClickUpDocPage> {
  const client = createV3ApiClient();
  const { data } = await client.get<ClickUpDocPage>(
    `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
    { params: { content_format: 'text/md' } }
  );
  return data;
}

export async function getDocPages(workspaceId: string, docId: string): Promise<ClickUpDocPage[]> {
  const client = createV3ApiClient();
  const { data } = await client.get<{ pages: ClickUpDocPage[] }>(
    `/workspaces/${workspaceId}/docs/${docId}/pages`,
    { params: { content_format: 'text/md' } }
  );
  return data.pages ?? [];
}

export async function createDoc(
  workspaceId: string,
  name: string,
  visibility: 'public' | 'private' = 'private'
): Promise<ClickUpDoc> {
  const client = createV3ApiClient();
  const { data } = await client.post<ClickUpDoc>(`/workspaces/${workspaceId}/docs`, {
    name,
    visibility,
  });
  return data;
}

export async function createDocPage(
  workspaceId: string,
  docId: string,
  name: string,
  content = '',
  parentPageId?: string
): Promise<ClickUpDocPage> {
  const client = createV3ApiClient();
  const body: Record<string, unknown> = { name, content, content_format: 'text/md' };
  if (parentPageId) body['parent_page_id'] = parentPageId;
  const { data } = await client.post<ClickUpDocPage>(
    `/workspaces/${workspaceId}/docs/${docId}/pages`,
    body
  );
  return data;
}

export async function updateDocPage(
  workspaceId: string,
  docId: string,
  pageId: string,
  fields: { name?: string; content?: string }
): Promise<ClickUpDocPage | null> {
  const client = createV3ApiClient();
  const { data } = await client.put<ClickUpDocPage | string>(
    `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
    { ...fields, content_format: 'text/md' }
  );
  // ClickUp returns HTTP 200 with an empty body on success
  if (!data || (typeof data === 'string' && data.trim() === '')) return null;
  return data as ClickUpDocPage;
}
