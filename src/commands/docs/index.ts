import { Command } from 'commander';
import { listDocs } from './list';
import { getDocCommand } from './get';
import { createDocCommand } from './create';
import { addPageCommand, updatePageCommand, getPageCommand } from './page';

export function createDocsCommand(): Command {
  const docs = new Command('docs').description('Browse and export ClickUp Docs');

  docs
    .command('list')
    .alias('ls')
    .description('List docs in a workspace')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .option('--json', 'Output as JSON')
    .action((opts) => listDocs(opts.workspace, opts));

  docs
    .command('get <docId>')
    .description('Show or export a ClickUp Doc')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .option('--pages', 'Include page content')
    .option('--export', 'Save doc pages to a local folder with README.md')
    .option('--path <dir>', 'Export destination (overrides configured export path)')
    .option('--json', 'Output as JSON')
    .action((docId, opts) => getDocCommand(opts.workspace, docId, opts));

  docs
    .command('create')
    .description('Create a new ClickUp Doc')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .requiredOption('--name <name>', 'Doc title')
    .option('--visibility <level>', 'Visibility: public | private (default: private)')
    .option('--json', 'Output as JSON')
    .action((opts) => createDocCommand(opts));

  // page sub-group
  const page = new Command('page').description('Manage pages within a doc');

  page
    .command('get <docId> <pageId>')
    .description('Fetch a single page from a doc')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .option('--json', 'Output as JSON')
    .action((docId, pageId, opts) => getPageCommand(docId, pageId, opts));

  page
    .command('add <docId>')
    .description('Add a new page to a doc')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .requiredOption('--name <name>', 'Page title')
    .option('--content <markdown>', 'Page content as Markdown string')
    .option('--file <path>', 'Read page content from a Markdown file (overrides --content)')
    .option('--parent <pageId>', 'Parent page ID (creates a sub-page)')
    .option('--json', 'Output as JSON')
    .action((docId, opts) => addPageCommand(docId, opts));

  page
    .command('update <docId> <pageId>')
    .description('Update the title or content of an existing page')
    .requiredOption('-w, --workspace <workspaceId>', 'Workspace ID')
    .option('--name <name>', 'New page title')
    .option('--content <markdown>', 'New page content as Markdown string')
    .option('--file <path>', 'Read page content from a Markdown file (overrides --content)')
    .option('--json', 'Output as JSON')
    .action((docId, pageId, opts) => updatePageCommand(docId, pageId, opts));

  docs.addCommand(page);

  return docs;
}
