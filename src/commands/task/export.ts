import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';

function resolvePath(p: string): string {
  return resolve(p.replace(/^~(?=$|\/)/, homedir()));
}
import axios from 'axios';
import { config } from '../../config/store';
import type { ClickUpTask, ClickUpComment, ClickUpRichBlock, ClickUpCustomField } from '../../api/types';

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

interface LinkRef {
  url: string;
  label: string;
  source: string;
}

const URL_RE = /https?:\/\/[^\s\)\]'"<>\\]+/g;

function extractUrlsFromText(text: string): string[] {
  return [...new Set(text.match(URL_RE) ?? [])];
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

// Collect all links/URLs from every part of the task for the "Links & References" section.
// ClickUp's REST API strips iframe embeds (Google Drive, Figma, etc.) from the description
// plain-text field, so we gather every other available signal here.
function collectAllLinks(task: ClickUpTask, comments: ClickUpComment[]): LinkRef[] {
  const seen = new Set<string>();
  const links: LinkRef[] = [];

  function add(url: string, label: string, source: string) {
    const clean = url.replace(/[.,;)]+$/, '');
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      links.push({ url: clean, label: label.trim() || clean, source });
    }
  }

  // URLs found in description plain text
  if (task.description) {
    for (const url of extractUrlsFromText(task.description)) {
      add(url, url, 'description');
    }
  }

  // Task-level attachments (files uploaded to the task)
  for (const att of task.attachments ?? []) {
    if (!att.deleted && !att.hidden) {
      add(att.url, att.title || att.id, 'attachment');
    }
  }

  // Custom field values that look like links
  for (const cf of task.custom_fields ?? []) {
    const val = cf.value;
    if (typeof val === 'string' && /^https?:\/\//.test(val)) {
      add(val, cf.name, `custom field: ${cf.name}`);
    }
  }

  // Comment rich blocks
  for (const c of comments) {
    const who = c.user.username;
    for (const b of c.comment ?? []) {
      // Inline hyperlinks on text spans
      const link = b.attributes?.link as string | undefined;
      if (link) add(link, b.text?.trim() || link, `comment by ${who}`);

      // Embed/frame blocks (Google Drive, Figma, YouTube embeds in comments)
      if (b.type === 'embed' || b.type === 'frame') {
        const url = (b.embed?.url ?? b.attributes?.url ?? b.attributes?.src) as string | undefined;
        if (url) add(url, b.embed?.title || b.text || url, `embed in comment by ${who}`);
      }

      // Attachment blocks inside comments
      if (b.type === 'attachment') {
        const att = b.attributes?.attachment as Record<string, unknown> | undefined;
        const url = att?.url as string | undefined;
        if (url) add(url, (att?.title as string) || url, `attachment in comment by ${who}`);
      }

      // Any bare URLs in text spans
      if (b.text && !link) {
        for (const url of extractUrlsFromText(b.text)) {
          add(url, url, `comment by ${who}`);
        }
      }
    }
  }

  return links;
}

function richToMarkdown(blocks: ClickUpRichBlock[], images: Map<string, ImageRef>): string {
  let out = '';
  for (const b of blocks) {
    if (b.type === 'image' && b.image) {
      const ref = images.get(b.image.id);
      const path = ref ? `attachments/${ref.localName}` : b.image.url;
      out += `\n![image](${path})\n`;
    } else if (b.type === 'embed' || b.type === 'frame') {
      // Embedded content (Google Drive, Figma, etc.)
      const url = (b.embed?.url ?? b.attributes?.url ?? b.attributes?.src) as string | undefined;
      const title = b.embed?.title || (b.attributes?.title as string) || b.text || 'Embedded content';
      if (url) {
        out += `\n> [${title}](${url})\n`;
      }
    } else if (b.type === 'attachment') {
      // File attachment block in comment body
      const att = b.attributes?.attachment as Record<string, unknown> | undefined;
      const url = att?.url as string | undefined;
      const title = (att?.title as string) || 'Attachment';
      if (url) {
        out += `\n> [${title}](${url})\n`;
      }
    } else if (b.type === 'tag' && b.text) {
      out += b.text;
    } else if (b.text) {
      const link = b.attributes?.link as string | undefined;
      if (link && link !== b.text && !b.text.match(/^\s*\n\s*$/)) {
        out += `[${b.text}](${link})`;
      } else {
        out += b.text;
      }
    }
  }
  return out.trim();
}

function formatCustomFieldValue(cf: ClickUpCustomField): string {
  const v = cf.value;
  if (v === null || v === undefined || v === '') return '';
  switch (cf.type) {
    case 'url':
      return typeof v === 'string' ? `[${v}](${v})` : String(v);
    case 'email':
      return typeof v === 'string' ? `[${v}](mailto:${v})` : String(v);
    case 'date':
      return typeof v === 'string' ? fmtDate(v) : String(v);
    case 'checkbox':
      return v ? 'Yes' : 'No';
    case 'drop_down': {
      const opts = cf.type_config?.options;
      if (opts && typeof v === 'number') {
        return opts.find(o => o.orderindex === v)?.name ?? String(v);
      }
      return String(v);
    }
    case 'labels': {
      if (Array.isArray(v)) return v.join(', ');
      return String(v);
    }
    default:
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
}

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);

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
    // Note: ClickUp's REST API returns description as plain text only.
    // Embedded content (Google Drive, Figma, etc.) is stripped by the API
    // and will appear in the Links & References section if discoverable.
  }

  // Custom fields
  const customFields = task.custom_fields?.filter(cf => {
    const v = cf.value;
    return v !== null && v !== undefined && v !== '';
  }) ?? [];
  if (customFields.length > 0) {
    md += `## Custom Fields\n\n| Field | Value |\n|---|---|\n`;
    for (const cf of customFields) {
      const val = formatCustomFieldValue(cf);
      if (val) md += `| ${cf.name} | ${val} |\n`;
    }
    md += '\n';
  }

  // Attachments
  const visibleAttachments = (task.attachments ?? []).filter(a => !a.deleted && !a.hidden);
  if (visibleAttachments.length > 0) {
    md += `## Attachments\n\n`;
    for (const att of visibleAttachments) {
      const ext = (att.extension || '').toLowerCase();
      const isImage = IMAGE_EXTS.has(ext);
      if (isImage && images.has(att.id)) {
        md += `- ![${att.title}](attachments/${att.id})\n`;
      } else {
        const size = att.size > 0 ? ` *(${(att.size / 1024).toFixed(1)} KB)*` : '';
        md += `- [${att.title}](attachments/${att.id})${size}\n`;
      }
    }
    md += '\n';
  }

  // Links & References — aggregated from all sources
  const links = collectAllLinks(task, comments);
  if (links.length > 0) {
    md += `## Links & References\n\n`;
    md += `> Note: embedded content (Google Drive, Figma, etc.) embedded via ClickUp's rich editor\n`;
    md += `> may not appear here — the ClickUp REST API strips iframe embeds from the description.\n\n`;
    for (const l of links) {
      const label = l.label !== l.url ? `${l.label}` : l.url;
      md += `- [${label}](${l.url}) *(${l.source})*\n`;
    }
    md += '\n';
  }

  // Comments
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

  // Collect inline images from comment rich blocks
  const images = collectCommentImages(comments);

  // Add task-level attachments (downloadable files)
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

  writeFileSync(join(taskDir, 'README.md'), buildReadme(task, comments, images), 'utf-8');

  return { dir: taskDir, filesDownloaded: ok, filesFailed: fail };
}
