import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { updateTask, type UpdateTaskPayload } from '../../api/task';
import { displayTaskDetail } from '../../utils/display';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

const PRIORITY_MAP: Record<string, number> = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
};

interface UpdateOptions {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  startDate?: string;
  addAssignee?: string[];
  removeAssignee?: string[];
  notifyAll?: boolean;
  json?: boolean;
}

export async function updateTaskCommand(taskId: string, options: UpdateOptions): Promise<void> {
  const payload: UpdateTaskPayload = {};

  if (options.name) payload.name = options.name;
  if (options.description !== undefined) payload.description = options.description;
  if (options.status) payload.status = options.status;
  if (options.notifyAll) payload.notify_all = true;

  if (options.priority) {
    const p = options.priority.toLowerCase();
    if (!(p in PRIORITY_MAP)) {
      console.error(chalk.red(`Unknown priority "${options.priority}". Use: urgent, high, normal, low`));
      process.exit(1);
    }
    payload.priority = PRIORITY_MAP[p];
  }

  if (options.dueDate) {
    const ms = Date.parse(options.dueDate);
    if (isNaN(ms)) {
      console.error(chalk.red(`Invalid due-date "${options.dueDate}". Use ISO format e.g. 2025-12-31`));
      process.exit(1);
    }
    payload.due_date = ms;
    payload.due_date_time = false;
  }

  if (options.startDate) {
    const ms = Date.parse(options.startDate);
    if (isNaN(ms)) {
      console.error(chalk.red(`Invalid start-date "${options.startDate}". Use ISO format e.g. 2025-12-31`));
      process.exit(1);
    }
    payload.start_date = ms;
    payload.start_date_time = false;
  }

  const addIds = (options.addAssignee ?? []).map(Number).filter((n) => !isNaN(n));
  const remIds = (options.removeAssignee ?? []).map(Number).filter((n) => !isNaN(n));
  if (addIds.length || remIds.length) {
    payload.assignees = {};
    if (addIds.length) payload.assignees.add = addIds;
    if (remIds.length) payload.assignees.rem = remIds;
  }

  if (Object.keys(payload).length === 0) {
    console.error(chalk.yellow('No fields to update. Pass at least one option (--name, --status, etc.)'));
    process.exit(1);
  }

  try {
    const spinner = createSpinner(`Updating task ${taskId}…`).start();
    const client = createApiClient();
    const task = await updateTask(client, taskId, payload);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(task, null, 2));
      return;
    }

    console.log(chalk.green('✓') + ' Task updated');
    displayTaskDetail(task);
  } catch (error) {
    handleError(error);
  }
}
