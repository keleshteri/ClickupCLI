import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getFolderLists, getFolderlessLists } from '../../api/workspace';
import { displayListTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError, CliError } from '../../utils/errors';
import type { ClickUpList } from '../../api/types';

export function createListCommand(): Command {
  const list = new Command('list').description('List ClickUp lists (boards/backlogs)');

  list
    .command('list')
    .alias('ls')
    .description('List all lists inside a folder or space')
    .option('-f, --folder <id>', 'Folder ID  — get it from `clickup folder list`')
    .option('-s, --space <id>', 'Space ID (shows folderless lists)  — get it from `clickup space list`')
    .option('--json', 'Output as JSON')
    .action(async (opts: { folder?: string; space?: string; json?: boolean }) => {
      try {
        if (!opts.folder && !opts.space) {
          throw new CliError('Provide --folder <id> or --space <id>.\n  Get IDs from `clickup folder list` or `clickup space list`.');
        }

        const spinner = createSpinner('Fetching lists…').start();
        const client = createApiClient();

        let lists: ClickUpList[];
        let context: string;

        if (opts.folder) {
          lists = await getFolderLists(client, opts.folder);
          context = `folder ${chalk.bold(opts.folder)}`;
        } else {
          lists = await getFolderlessLists(client, opts.space!);
          context = `space ${chalk.bold(opts.space)} (folderless lists)`;
        }

        spinner.stop();

        if (opts.json) { console.log(JSON.stringify(lists, null, 2)); return; }

        console.log(`\n  ${chalk.cyan('Lists')} · ${context}`);
        displayListTable(lists);
      } catch (e) { handleError(e); }
    });

  return list;
}
