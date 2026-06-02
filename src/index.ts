import { Command } from 'commander';
import chalk from 'chalk';
import { createAuthCommand } from './commands/auth';
import { createWorkspaceCommand } from './commands/workspace';
import { createSpaceCommand } from './commands/space';
import { createFolderCommand } from './commands/folder';
import { createListCommand } from './commands/list';
import { createBrowseCommand } from './commands/browse';
import { createTaskCommand } from './commands/task';
import { createConfigCommand } from './commands/config';
import { createDocsCommand } from './commands/docs';

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
${dim('─'.repeat(62))}
${bold('  Quick start')}

  ${dim('1.')} ${green('clickup auth add')}              Add your ClickUp account
  ${dim('2.')} ${green('clickup browse')}                Find a list ID (interactive)
  ${dim('3.')} ${green('clickup task list -l <id>')}     Fetch tasks from that list

${bold('  Commands')}

  ${cyan('auth')}         ${dim('add · list · switch · remove · whoami')}
  ${cyan('workspace')}    ${dim('list')}                        Show all workspaces
  ${cyan('space')}        ${dim('list -w <workspaceId>')}      Show spaces in a workspace
  ${cyan('folder')}       ${dim('list -s <spaceId>')}          Show folders in a space
  ${cyan('list')}         ${dim('list -f <folderId>')}         Show lists in a folder
  ${cyan('browse')}       ${dim('(no args)')}                  Interactive hierarchy picker
  ${cyan('task')}         ${dim('list -l <listId>')}                     Show tasks in a list
                ${dim('get  <taskId>')}                 Show one task in detail
                ${dim('subtasks <taskId>')}             List subtasks of a task
                ${dim('update <taskId>')}               Update any fields on a task
                ${dim('status <taskId> <status>')}      Update only the status (safe)
                ${dim('comment add <taskId> -m "…"')}   Post a comment
                ${dim('comment update <taskId> <cId>')} Edit your own comment
  ${cyan('docs')}         ${dim('list -w <workspaceId>')}             List ClickUp Docs in a workspace
                ${dim('get  <docId> -w <id>')}          Show or export a doc
                ${dim('create -w <id> --name "Title"')} Create a new doc
                ${dim('page add <docId> -w <id>')}      Add a page to a doc
                ${dim('page update <docId> <pageId>')}  Update a doc page
  ${cyan('config')}       ${dim('export-path [dir]')}                 Get or set export directory

${bold('  task update flags')}

  ${yellow('--name <name>')}           New task name
  ${yellow('--description <text>')}    New description
  ${yellow('--status <status>')}       New status
  ${yellow('--priority <level>')}      urgent | high | normal | low
  ${yellow('--due-date <date>')}       Due date ${dim('(ISO 8601, e.g. 2025-12-31)')}
  ${yellow('--start-date <date>')}     Start date ${dim('(ISO 8601)')}
  ${yellow('--add-assignee <id…>')}    Add assignee by user ID ${dim('(repeatable)')}
  ${yellow('--remove-assignee <id…>')} Remove assignee by user ID ${dim('(repeatable)')}
  ${yellow('--notify-all')}            Notify all watchers

${bold('  task list flags')}

  ${yellow('-l, --list')}      List ID ${dim('(required)')}
  ${yellow('-s, --status')}    Filter by status  ${dim('(repeatable)')}
  ${yellow('-a, --assignee')}  Filter by assignee username or ID  ${dim('(repeatable)')}
  ${yellow('--tag')}           Filter by tag  ${dim('(repeatable)')}
  ${yellow('-p, --page')}      Page number  ${dim('(0-based, default 0)')}
  ${yellow('--subtasks')}      Include subtasks inline

${bold('  task get flags')}

  ${yellow('--subtasks')}      Also show subtasks below the detail
  ${yellow('--comments')}      Also show all task comments
  ${yellow('--export')}        Save task + attachments to a local folder with README.md
  ${yellow('--path <dir>')}    Export destination  ${dim('(overrides config export-path)')}

${bold('  Global flags')}

  ${yellow('--json')}          Output raw JSON  ${dim('(works on most commands)')}
  ${yellow('--help')}          Help for any command
  ${yellow('-v')}              Show version

${bold('  Examples')}

  ${dim('$')} clickup auth add --name work
  ${dim('$')} clickup auth list
  ${dim('$')} clickup workspace list
  ${dim('$')} clickup space list --workspace 9012345
  ${dim('$')} clickup task list --list 901234567 --status open --assignee john
  ${dim('$')} clickup task list --list 901234567 --tag bug --json
  ${dim('$')} clickup task get abc123 --comments
  ${dim('$')} clickup task get abc123 --export --path ~/exports
  ${dim('$')} clickup task subtasks abc123
  ${dim('$')} clickup task update abc123 --status "in progress" --priority high
  ${dim('$')} clickup task status abc123 "in review"
  ${dim('$')} clickup task comment add abc123 -m "Looks good!"
  ${dim('$')} clickup task comment update abc123 <commentId> -m "Updated note"
  ${dim('$')} clickup docs list --workspace 9012345
  ${dim('$')} clickup docs create -w 9012345 --name "My Doc"
  ${dim('$')} clickup docs get <docId> --workspace 9012345 --pages
  ${dim('$')} clickup docs get <docId> --workspace 9012345 --export --path ~/exports
  ${dim('$')} clickup docs page add <docId> -w 9012345 --name "Intro" --file intro.md
  ${dim('$')} clickup docs page update <docId> <pageId> -w 9012345 --content "# Updated"
  ${dim('$')} clickup config export-path ~/clickup-exports
  ${dim('$')} clickup browse

  Run ${cyan('clickup <command> --help')} for per-command flags.
${dim('─'.repeat(62))}
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
program.addCommand(createDocsCommand());
program.addCommand(createConfigCommand());

program.parse(process.argv);
