import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { updateTask } from '../../api/task';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface StatusOptions {
  notify?: boolean;
  json?: boolean;
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  options: StatusOptions
): Promise<void> {
  try {
    const spinner = createSpinner(`Updating status of ${taskId}…`).start();
    const client = createApiClient();
    const task = await updateTask(client, taskId, {
      status,
      notify_all: options.notify ?? false,
    });
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify({ id: task.id, status: task.status }, null, 2));
      return;
    }

    const s = task.status;
    let colored: string;
    try {
      colored = chalk.hex(s.color)(s.status);
    } catch {
      colored = s.status;
    }
    console.log(chalk.green('✓') + ` Status → ${colored}`);
  } catch (error) {
    handleError(error);
  }
}
