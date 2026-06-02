import { Command } from 'commander';
import { listTasks } from './list';
import { getTaskCommand } from './get';
import { showSubtasks } from './subtasks';
import { updateTaskCommand } from './update';
import { updateTaskStatus } from './status';
import { addCommentCommand, updateCommentCommand } from './comment';

export function createTaskCommand(): Command {
  const task = new Command('task').description('Manage ClickUp tasks');

  task
    .command('list')
    .alias('ls')
    .description('List tasks in a ClickUp list')
    .requiredOption('-l, --list <listId>', 'ClickUp list ID')
    .option('-s, --status <status...>', 'Filter by status (repeatable)')
    .option('-a, --assignee <user...>', 'Filter by assignee username or ID (repeatable)')
    .option('--tag <tag...>', 'Filter by tag (repeatable)')
    .option('-p, --page <n>', 'Page number (0-based)', '0')
    .option('--subtasks', 'Include all subtasks inline', false)
    .option('--json', 'Output as JSON')
    .action((opts) => listTasks(opts));

  task
    .command('get <taskId>')
    .description('Show full detail for a task')
    .option('--subtasks', 'Also show subtasks below the detail')
    .option('--comments', 'Also show all task comments')
    .option('--export', 'Save task + attachments to a local folder with README.md')
    .option('--path <dir>', 'Export destination (overrides configured export path)')
    .option('--json', 'Output as JSON')
    .action((taskId, opts) => getTaskCommand(taskId, opts));

  task
    .command('subtasks <taskId>')
    .alias('sub')
    .description('List all subtasks of a task')
    .option('--json', 'Output as JSON')
    .action((taskId, opts) => showSubtasks(taskId, opts));

  task
    .command('update <taskId>')
    .description('Update any fields on a task')
    .option('--name <name>', 'New task name')
    .option('--description <text>', 'New description (plain text)')
    .option('--status <status>', 'New status')
    .option('--priority <level>', 'Priority: urgent | high | normal | low')
    .option('--due-date <date>', 'Due date (ISO 8601, e.g. 2025-12-31)')
    .option('--start-date <date>', 'Start date (ISO 8601)')
    .option('--add-assignee <id...>', 'Add assignee by user ID (repeatable)')
    .option('--remove-assignee <id...>', 'Remove assignee by user ID (repeatable)')
    .option('--notify-all', 'Notify all watchers of the update', false)
    .option('--json', 'Output as JSON')
    .action((taskId, opts) => updateTaskCommand(taskId, opts));

  task
    .command('status <taskId> <status>')
    .description('Update only the status of a task (safe targeted change)')
    .option('--notify', 'Notify all watchers', false)
    .option('--json', 'Output as JSON')
    .action((taskId, status, opts) => updateTaskStatus(taskId, status, opts));

  // comment sub-group
  const comment = new Command('comment').description('Manage task comments');

  comment
    .command('add <taskId>')
    .description('Post a new comment on a task')
    .requiredOption('-m, --message <text>', 'Comment text')
    .option('--notify', 'Notify all watchers', false)
    .option('--json', 'Output as JSON')
    .action((taskId, opts) => addCommentCommand(taskId, opts.message, opts));

  comment
    .command('update <taskId> <commentId>')
    .description('Edit one of your own comments on a task')
    .requiredOption('-m, --message <text>', 'New comment text')
    .option('--resolved', 'Mark the comment as resolved')
    .option('--unresolved', 'Mark the comment as unresolved')
    .option('--json', 'Output as JSON')
    .action((taskId, commentId, opts) => {
      const resolved = opts.resolved ? true : opts.unresolved ? false : undefined;
      updateCommentCommand(taskId, commentId, opts.message, { resolved, json: opts.json });
    });

  task.addCommand(comment);

  return task;
}
