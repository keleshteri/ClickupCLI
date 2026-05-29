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

export async function getDocPages(workspaceId: string, docId: string): Promise<ClickUpDocPage[]> {
  const client = createV3ApiClient();
  const { data } = await client.get<{ pages: ClickUpDocPage[] }>(
    `/workspaces/${workspaceId}/docs/${docId}/pages`,
    { params: { content_format: 'text/md' } }
  );
  return data.pages ?? [];
}
