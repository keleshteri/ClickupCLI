import { Command } from 'commander';
import chalk from 'chalk';
import { createAuthCommand } from './commands/auth';
import { createWorkspaceCommand } from './commands/workspace';
import { createTaskCommand } from './commands/task';

const program = new Command();

program
  .name('clickup')
  .description(chalk.cyan('ClickUp CLI') + ' — manage ClickUp from your terminal')
  .version('0.1.0', '-v, --version', 'Show version');

program.addCommand(createAuthCommand());
program.addCommand(createWorkspaceCommand());
program.addCommand(createTaskCommand());

program.parse(process.argv);
