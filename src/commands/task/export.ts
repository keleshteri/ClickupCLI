import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

function resolvePath(p: string): string {
  return resolve(p.replace(/^~(?=$|\/)/, homedir()));
}
import axios from 'axios';
import { config } from '../../config/store';
import type { ClickUpTask, ClickUpComment, ClickUpRichBlock } from '../../api/types';

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function fmtDate(ts: string | null): string {
  if (!ts) return '—';
  return new Date(parseInt(ts, 10)).toLocaleDateString();
}

async function download(url: string, token: string, dest: string): Promise<void> {
  const res = await axios.get(url, {
    responseType: 'stream',
    headers: { Authorization: token },
    timeout: 30_000,
  });
  return new Promise((resolve, reject) => {
    const w = createWriteStream(dest);
    (res.data as NodeJS.ReadableStream).pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });
}

interface ImageRef {
  id: string;
  url: string;
  localName: string;
}

function collectCommentImages(comments: ClickUpComment[]): Map<string, ImageRef> {
  const map = new Map<string, ImageRef>();
  for (const c of comments) {
    for (const block of (c.comment ?? [])) {
      if (block.type === 'image' && block.image) {
        const { id, url } = block.image;
        if (!map.has(id)) {
          map.set(id, { id, url, localName: id });
        }
      }
    }
  }
  return map;
}

function richToMarkdown(blocks: ClickUpRichBlock[], images: Map<string, ImageRef>): string {
  let out = '';
  for (const b of blocks) {
    if (b.type === 'image' && b.image) {
      const ref = images.get(b.image.id);
      const path = ref ? `attachments/${ref.localName}` : b.image.url;
      out += `\n![image](${path})\n`;
    } else if (b.type === 'tag' && b.text) {
      out += b.text;
    } else if (b.text) {
      const link = b.attributes?.link as string | undefined;
      // Only make hyperlink if URL is different from display text
      if (link && link !== b.text && !b.text.match(/^\s*\n\s*$/)) {
        out += `[${b.text}](${link})`;
      } else {
        out += b.text;
      }
    }
  }
  return out.trim();
}

function buildReadme(
  task: ClickUpTask,
  comments: ClickUpComment[],
  images: Map<string, ImageRef>
): string {
  const assignees = task.assignees.map((a) => a.username).join(', ') || '—';
  const tags = task.tags.map((t) => t.name).join(', ') || '—';
  const priority = task.priority?.priority ?? '—';
  const subtaskCount = task.subtasks?.length ?? 0;

  let md = `---
id: ${task.id}
status: "${task.status.status}"
priority: ${priority}
list: "${task.list.name}"
url: ${task.url}
exported: ${new Date().toISOString()}
---

# ${task.name}

| | |
|---|---|
| **Status** | ${task.status.status} |
| **Priority** | ${priority} |
| **Assignees** | ${assignees} |
| **Due** | ${fmtDate(task.due_date)} |
| **Created** | ${fmtDate(task.date_created)} |
| **Updated** | ${fmtDate(task.date_updated)} |
| **List** | ${task.list.name} |
| **Tags** | ${tags} |
| **Subtasks** | ${subtaskCount} |
| **URL** | [${task.url}](${task.url}) |

`;

  if (task.description) {
    md += `## Description\n\n${task.description}\n\n`;
  }

  const sorted = [...comments].sort((a, b) => parseInt(a.date) - parseInt(b.date));

  if (sorted.length > 0) {
    md += `## Comments (${sorted.length})\n\n`;
    for (const c of sorted) {
      const date = new Date(parseInt(c.date, 10)).toLocaleString();
      const resolved = c.resolved ? ' *(resolved)*' : '';
      md += `---\n\n### ${c.user.username} — ${date}${resolved}\n\n`;

      const richMd = c.comment?.length
        ? richToMarkdown(c.comment, images)
        : c.comment_text;

      md += richMd ? richMd + '\n\n' : '\n';
    }
  }

  return md;
}

export interface ExportResult {
  dir: string;
  filesDownloaded: number;
  filesFailed: number;
}

export async function exportTask(
  task: ClickUpTask,
  comments: ClickUpComment[],
  outputPath?: string
): Promise<ExportResult> {
  const token = config.getActiveAccountConfig()?.token;
  if (!token) throw new Error('No active account token');

  const base = resolvePath(outputPath ?? config.getExportPath() ?? join(homedir(), 'clickup-exports'));
  const folderName = `${task.id}-${sanitize(task.name)}`;
  const taskDir = join(base, folderName);
  const attDir = join(taskDir, 'attachments');
  mkdirSync(attDir, { recursive: true });

  // Collect images referenced in comment rich text (for inline embedding)
  const images = collectCommentImages(comments);

  // Add any task-level attachments not already covered by comment images
  for (const att of (task.attachments ?? [])) {
    if (!images.has(att.id) && !att.deleted && !att.hidden) {
      images.set(att.id, { id: att.id, url: att.url, localName: att.id });
    }
  }

  // Download all files
  let ok = 0;
  let fail = 0;
  for (const ref of images.values()) {
    const dest = join(attDir, ref.localName);
    if (existsSync(dest)) { ok++; continue; }
    try {
      await download(ref.url, token, dest);
      ok++;
    } catch {
      fail++;
    }
  }

  // Write README.md
  writeFileSync(join(taskDir, 'README.md'), buildReadme(task, comments, images), 'utf-8');

  return { dir: taskDir, filesDownloaded: ok, filesFailed: fail };
}
