import { Command } from 'commander';
import { listDocs } from './list';
import { getDocCommand } from './get';

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

  return docs;
}
