import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getTask, getTaskComments } from '../../api/task';
import { displayTaskDetail, displaySubtaskTable, displayComments } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';
import { exportTask } from './export';

interface GetOptions {
  json?: boolean;
  subtasks?: boolean;
  comments?: boolean;
  export?: boolean;
  path?: string;
}

export async function getTaskCommand(taskId: string, options: GetOptions): Promise<void> {
  try {
    const needComments = options.comments || options.export;

    const spinner = createSpinner(`Fetching task ${taskId}…`).start();
    const client = createApiClient();

    const [task, comments] = await Promise.all([
      getTask(client, taskId, true),
      needComments ? getTaskComments(client, taskId) : Promise.resolve(null),
    ]);
    spinner.stop();

    if (options.export) {
      const exportSpinner = createSpinner('Exporting task…').start();
      const result = await exportTask(task, comments ?? [], options.path);
      exportSpinner.stop();

      console.log(`\n${chalk.green('✓')} Exported to ${chalk.cyan(result.dir)}`);
      if (result.filesDownloaded > 0) {
        console.log(chalk.dim(`  ${result.filesDownloaded} file${result.filesDownloaded !== 1 ? 's' : ''} downloaded`) +
          (result.filesFailed > 0 ? chalk.yellow(`, ${result.filesFailed} failed`) : ''));
      }
      console.log(chalk.dim(`  Open README.md in any markdown viewer for a local ClickUp view.\n`));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(comments !== null ? { ...task, comments } : task, null, 2));
      return;
    }

    displayTaskDetail(task);

    if (options.subtasks && task.subtasks && task.subtasks.length > 0) {
      displaySubtaskTable(task, task.subtasks);
    }

    if (comments !== null) {
      displayComments(comments);
    }
  } catch (error) {
    handleError(error);
  }
}
