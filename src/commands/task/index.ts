import { Command } from 'commander';
import { listTasks } from './list';
import { getTaskCommand } from './get';

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
    .option('--subtasks', 'Include subtasks', false)
    .option('--json', 'Output as JSON')
    .action((opts) => listTasks(opts));

  task
    .command('get <taskId>')
    .description('Show full detail for a task')
    .option('--json', 'Output as JSON')
    .action((taskId, opts) => getTaskCommand(taskId, opts));

  return task;
}
