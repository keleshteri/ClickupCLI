import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getWorkspaces } from '../../api/workspace';
import { displayWorkspaceTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';
import { config } from '../../config/store';

interface ListOptions {
  json?: boolean;
}

export async function listWorkspaces(options: ListOptions): Promise<void> {
  try {
    const spinner = createSpinner('Fetching workspaces…').start();
    const client = createApiClient();
    const workspaces = await getWorkspaces(client);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(workspaces, null, 2));
      return;
    }

    const acc = config.getActiveAccountConfig();
    console.log(`\n  ${chalk.cyan('Workspaces')} · ${chalk.dim(acc?.username ?? '')}`);
    displayWorkspaceTable(workspaces);
  } catch (error) {
    handleError(error);
  }
}
