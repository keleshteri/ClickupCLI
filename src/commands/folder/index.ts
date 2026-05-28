import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getFolders } from '../../api/workspace';
import { displayFolderTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

export function createFolderCommand(): Command {
  const folder = new Command('folder').description('List folders inside a space');

  folder
    .command('list')
    .alias('ls')
    .description('List all folders in a space')
    .requiredOption('-s, --space <id>', 'Space ID  — get it from `clickup space list`')
    .option('--json', 'Output as JSON')
    .action(async (opts: { space: string; json?: boolean }) => {
      try {
        const spinner = createSpinner('Fetching folders…').start();
        const client = createApiClient();
        const folders = await getFolders(client, opts.space);
        spinner.stop();

        if (opts.json) { console.log(JSON.stringify(folders, null, 2)); return; }

        console.log(`\n  ${chalk.cyan('Folders')} · space ${chalk.bold(opts.space)}`);
        displayFolderTable(folders);
      } catch (e) { handleError(e); }
    });

  return folder;
}
