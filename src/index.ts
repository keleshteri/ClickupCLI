import { Command } from 'commander';
import chalk from 'chalk';
import { createAuthCommand } from './commands/auth';
import { createWorkspaceCommand } from './commands/workspace';
import { createSpaceCommand } from './commands/space';
import { createFolderCommand } from './commands/folder';
import { createListCommand } from './commands/list';
import { createBrowseCommand } from './commands/browse';
import { createTaskCommand } from './commands/task';

const c = chalk;
const dim = c.dim;
const cyan = c.cyan;
const bold = c.bold;
const green = c.green;
const yellow = c.yellow;

const BANNER = `
${cyan('  ██████╗██╗     ██╗ ██████╗██╗  ██╗██╗   ██╗██████╗')}
${cyan('  ██╔════╝██║     ██║██╔════╝██║ ██╔╝██║   ██║██╔══██╗')}
${cyan('  ██║     ██║     ██║██║     █████╔╝ ██║   ██║██████╔╝')}
${cyan('  ██║     ██║     ██║██║     ██╔═██╗ ██║   ██║██╔═══╝')}
${cyan('  ╚██████╗███████╗██║╚██████╗██║  ██╗╚██████╔╝██║')}
${cyan('   ╚═════╝╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝')} ${dim('CLI v0.1.0')}
`;

const AFTER_HELP = `
${dim('─'.repeat(58))}
${bold('  Quick start')}

  ${dim('1.')} ${green('clickup auth add')}              Add your ClickUp account
  ${dim('2.')} ${green('clickup browse')}                Find a list ID (interactive)
  ${dim('3.')} ${green('clickup task list -l <id>')}     Fetch tasks from that list

${bold('  Commands')}

  ${cyan('auth')}         ${dim('add · list · switch · remove · whoami')}
  ${cyan('workspace')}    ${dim('list')}                   Show all workspaces
  ${cyan('space')}        ${dim('list -w <workspaceId>')} Show spaces in a workspace
  ${cyan('folder')}       ${dim('list -s <spaceId>')}     Show folders in a space
  ${cyan('list')}         ${dim('list -f <folderId>')}    Show lists in a folder
  ${cyan('browse')}       ${dim('(no args)')}             Interactive hierarchy picker
  ${cyan('task')}         ${dim('list -l <listId>')}      Show tasks
                ${dim('get  <taskId>')}       Show one task in detail

${bold('  Useful flags')}

  ${yellow('--json')}   Output raw JSON  ${dim('(works on most commands)')}
  ${yellow('--help')}   Help for any command
  ${yellow('-v')}       Show version

${bold('  Examples')}

  ${dim('$')} clickup auth add --name work
  ${dim('$')} clickup auth list
  ${dim('$')} clickup workspace list
  ${dim('$')} clickup space list --workspace 9012345
  ${dim('$')} clickup task list --list 901234567 --status open
  ${dim('$')} clickup task list --list 901234567 --json
  ${dim('$')} clickup task get abc123
  ${dim('$')} clickup browse

  Run ${cyan('clickup <command> --help')} for per-command flags.
${dim('─'.repeat(58))}
`;

const program = new Command();

program
  .name('clickup')
  .description(cyan('ClickUp CLI') + ' — manage ClickUp from your terminal')
  .version('0.1.0', '-v, --version', 'Show version')
  .addHelpText('beforeAll', BANNER)
  .addHelpText('afterAll', AFTER_HELP);

program.addCommand(createAuthCommand());
program.addCommand(createWorkspaceCommand());
program.addCommand(createSpaceCommand());
program.addCommand(createFolderCommand());
program.addCommand(createListCommand());
program.addCommand(createBrowseCommand());
program.addCommand(createTaskCommand());

program.parse(process.argv);
