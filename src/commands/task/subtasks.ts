import { createApiClient } from '../../api/client';
import { getTask } from '../../api/task';
import { displaySubtaskTable } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError, CliError } from '../../utils/errors';

interface SubtasksOptions {
  json?: boolean;
}

export async function showSubtasks(taskId: string, options: SubtasksOptions): Promise<void> {
  try {
    const spinner = createSpinner(`Fetching subtasks for ${taskId}…`).start();
    const client = createApiClient();
    const task = await getTask(client, taskId, true);
    spinner.stop();

    const subtasks = task.subtasks ?? [];

    if (subtasks.length === 0) {
      throw new CliError(`Task "${task.name}" has no subtasks.`);
    }

    if (options.json) {
      console.log(JSON.stringify(subtasks, null, 2));
      return;
    }

    displaySubtaskTable(task, subtasks);
  } catch (error) {
    handleError(error);
  }
}
