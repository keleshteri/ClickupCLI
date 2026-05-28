import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getSpaces } from '../../api/workspace';
import { displaySpaceTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

export function createSpaceCommand(): Command {
  const space = new Command('space').description('List spaces inside a workspace');

  space
    .command('list')
    .alias('ls')
    .description('List all spaces in a workspace')
    .requiredOption('-w, --workspace <id>', 'Workspace (team) ID  — get it from `clickup workspace list`')
    .option('--json', 'Output as JSON')
    .action(async (opts: { workspace: string; json?: boolean }) => {
      try {
        const spinner = createSpinner('Fetching spaces…').start();
        const client = createApiClient();
        const spaces = await getSpaces(client, opts.workspace);
        spinner.stop();

        if (opts.json) { console.log(JSON.stringify(spaces, null, 2)); return; }

        console.log(`\n  ${chalk.cyan('Spaces')} · workspace ${chalk.bold(opts.workspace)}`);
        displaySpaceTable(spaces);
      } catch (e) { handleError(e); }
    });

  return space;
}
