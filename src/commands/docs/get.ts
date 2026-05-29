import chalk from 'chalk';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { mkdirSync, writeFileSync } from 'fs';
import { getDoc, getDocPages } from '../../api/docs';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';
import { config } from '../../config/store';

interface GetDocOptions {
  json?: boolean;
  pages?: boolean;
  export?: boolean;
  path?: string;
}

function resolvePath(p: string): string {
  return resolve(p.replace(/^~(?=$|\/)/, homedir()));
}

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);
}

export async function getDocCommand(
  workspaceId: string,
  docId: string,
  opts: GetDocOptions
): Promise<void> {
  try {
    const needPages = opts.pages || opts.export;
    const spinner = createSpinner('Fetching doc…').start();
    const [doc, pages] = await Promise.all([
      getDoc(workspaceId, docId),
      needPages ? getDocPages(workspaceId, docId) : Promise.resolve(null),
    ]);
    spinner.stop();

    if (opts.export) {
      const rawBase = opts.path ?? config.getExportPath() ?? join(homedir(), 'clickup-exports');
      const base = resolvePath(rawBase);
      const dir = join(base, `doc-${doc.id}-${sanitize(doc.name)}`);
      mkdirSync(dir, { recursive: true });

      let md = `---\nid: ${doc.id}\nworkspace: ${doc.workspace_id}\nexported: ${new Date().toISOString()}\n---\n\n# ${doc.name}\n\n`;
      for (const p of (pages ?? [])) {
        md += `## ${p.name}\n\n${p.content ?? ''}\n\n`;
      }
      writeFileSync(join(dir, 'README.md'), md, 'utf-8');
      console.log(`\n${chalk.green('✓')} Doc exported to ${chalk.cyan(dir)}`);
      console.log(chalk.dim(`  ${(pages ?? []).length} page${(pages ?? []).length !== 1 ? 's' : ''} written to README.md\n`));
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(pages ? { ...doc, pages } : doc, null, 2));
      return;
    }

    const updated = new Date(doc.date_updated).toLocaleDateString();
    console.log(`\n${chalk.bold(doc.name)}  ${chalk.dim(`id: ${doc.id}  updated: ${updated}`)}`);

    if (pages) {
      if (!pages.length) {
        console.log(chalk.dim('\n  (no pages)'));
      } else {
        for (const p of pages) {
          console.log(`\n${chalk.cyan('─── ' + p.name)}`);
          if (p.content) console.log(p.content);
          else console.log(chalk.dim('  (empty page)'));
        }
      }
    } else {
      console.log(chalk.dim('\n  Use --pages to include page content.'));
    }
  } catch (e) {
    handleError(e);
  }
}
