import { Command } from 'commander';
import { listWorkspaces } from './list';

export function createWorkspaceCommand(): Command {
  const ws = new Command('workspace').alias('ws').description('Manage ClickUp workspaces');

  ws.command('list')
    .alias('ls')
    .description('List all workspaces for the active account')
    .option('--json', 'Output as JSON')
    .action((opts) => listWorkspaces(opts));

  return ws;
}
