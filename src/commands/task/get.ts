import { createApiClient } from '../../api/client';
import { getTask } from '../../api/task';
import { displayTaskDetail, displaySubtaskTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface GetOptions {
  json?: boolean;
  subtasks?: boolean;
}

export async function getTaskCommand(taskId: string, options: GetOptions): Promise<void> {
  try {
    const spinner = createSpinner(`Fetching task ${taskId}…`).start();
    const client = createApiClient();
    // Always include subtasks so the detail view can show the count
    const task = await getTask(client, taskId, true);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(task, null, 2));
      return;
    }

    displayTaskDetail(task);

    if (options.subtasks && task.subtasks && task.subtasks.length > 0) {
      displaySubtaskTable(task, task.subtasks);
    }
  } catch (error) {
    handleError(error);
  }
}
