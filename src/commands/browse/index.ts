import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getWorkspaces, getSpaces, getFolders, getFolderLists, getFolderlessLists } from '../../api/workspace';
import { handleError } from '../../utils/errors';
import type { AxiosInstance } from 'axios';
import type { ClickUpTeam, ClickUpSpace, ClickUpFolder, ClickUpList } from '../../api/types';

async function pickWorkspace(client: AxiosInstance): Promise<ClickUpTeam> {
  const workspaces = await getWorkspaces(client);
  if (workspaces.length === 1) return workspaces[0];

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'Select a workspace:',
    choices: workspaces.map((w) => ({ name: `${w.name}  ${chalk.dim(w.id)}`, value: w })),
  }]);
  return choice as ClickUpTeam;
}

async function pickSpace(client: AxiosInstance, workspaceId: string): Promise<ClickUpSpace> {
  const spaces = await getSpaces(client, workspaceId);

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'Select a space:',
    choices: [
      ...spaces.map((s) => ({ name: `${s.name}  ${chalk.dim(s.id)}`, value: s })),
      new inquirer.Separator(),
      { name: chalk.dim('← back'), value: null },
    ],
  }]);
  return choice as ClickUpSpace;
}

async function pickList(client: AxiosInstance, space: ClickUpSpace): Promise<ClickUpList | null> {
  const [folders, folderlessLists] = await Promise.all([
    getFolders(client, space.id),
    getFolderlessLists(client, space.id),
  ]);

  type Choice = { name: string; value: ClickUpList | ClickUpFolder | null };

  const choices: Choice[] = [];

  if (folderlessLists.length) {
    choices.push({ name: chalk.dim('── No folder ──'), value: null } as unknown as Choice);
    for (const l of folderlessLists) {
      choices.push({ name: `  ${l.name}  ${chalk.dim(l.id)}`, value: l as unknown as ClickUpList });
    }
  }

  for (const folder of folders) {
    choices.push({ name: chalk.dim(`── ${folder.name} ──`), value: null } as unknown as Choice);
    const lists = await getFolderLists(client, folder.id);
    for (const l of lists) {
      choices.push({ name: `  ${l.name}  ${chalk.dim(l.id)}`, value: l as unknown as ClickUpList });
    }
  }

  if (choices.length === 0) {
    console.log(chalk.yellow('  No lists found in this space.'));
    return null;
  }

  choices.push(new inquirer.Separator() as unknown as Choice);
  choices.push({ name: chalk.dim('← back'), value: null } as unknown as Choice);

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: `Select a list in ${chalk.bold(space.name)}:`,
    choices,
    pageSize: 20,
  }]);

  return choice as ClickUpList | null;
}

export function createBrowseCommand(): Command {
  const browse = new Command('browse')
    .description('Interactively browse workspaces → spaces → lists to find a list ID')
    .action(async () => {
      try {
        const client = createApiClient();

        console.log(`\n  ${chalk.cyan('Browse')} — navigate to any list to get its ID\n`);

        const workspace = await pickWorkspace(client);
        console.log(chalk.dim(`  Workspace: ${workspace.name}  ${workspace.id}`));

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const space = await pickSpace(client, workspace.id);
          if (!space) break;

          const list = await pickList(client, space);
          if (!list) continue;

          const sep = chalk.dim('─'.repeat(50));
          console.log(`
${sep}
  ${chalk.green('Selected list')}
  ${chalk.cyan('Name')}  ${chalk.bold(list.name)}
  ${chalk.cyan('ID')}    ${chalk.bold.yellow(list.id)}

  ${chalk.dim('Use this ID with:')}
  ${chalk.white(`clickup task list --list ${list.id}`)}
${sep}
`);
          break;
        }
      } catch (e) { handleError(e); }
    });

  return browse;
}
