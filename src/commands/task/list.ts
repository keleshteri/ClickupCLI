import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getTasks } from '../../api/task';
import { displayTaskTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface ListOptions {
  list: string;
  status?: string[];
  assignee?: string[];
  tag?: string[];
  page?: string;
  subtasks?: boolean;
  json?: boolean;
}

export async function listTasks(options: ListOptions): Promise<void> {
  try {
    const page = options.page ? parseInt(options.page, 10) : 0;
    const spinner = createSpinner(`Fetching tasks from list ${chalk.bold(options.list)}…`).start();
    const client = createApiClient();

    const { tasks, lastPage } = await getTasks(client, options.list, {
      statuses: options.status,
      assignees: options.assignee,
      tags: options.tag,
      subtasks: options.subtasks,
      page,
    });

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(tasks, null, 2));
      return;
    }

    const pageInfo = lastPage ? '' : chalk.dim(`  · page ${page}, more available (--page ${page + 1})`);
    console.log(`\n  ${chalk.cyan('Tasks')} · list ${chalk.bold(options.list)}${pageInfo}`);
    displayTaskTable(tasks);
  } catch (error) {
    handleError(error);
  }
}
