import { createApiClient } from '../../api/client';
import { getTask } from '../../api/task';
import { displayTaskDetail } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface GetOptions {
  json?: boolean;
}

export async function getTaskCommand(taskId: string, options: GetOptions): Promise<void> {
  try {
    const spinner = createSpinner(`Fetching task ${taskId}…`).start();
    const client = createApiClient();
    const task = await getTask(client, taskId);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(task, null, 2));
      return;
    }

    displayTaskDetail(task);
  } catch (error) {
    handleError(error);
  }
}
