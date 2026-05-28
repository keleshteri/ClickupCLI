import inquirer from 'inquirer';
import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { getCurrentUser } from '../../api/auth';
import { config } from '../../config/store';
import { createSpinner } from '../../utils/spinner';
import { handleError, CliError } from '../../utils/errors';

interface AddOptions {
  name?: string;
  token?: string;
}

export async function addAuth(options: AddOptions): Promise<void> {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Account alias (e.g. work, personal):',
        default: 'default',
        when: !options.name,
        validate: (v: string) => {
          if (!v.trim()) return 'Alias cannot be empty';
          if (config.getAccount(v.trim())) return `"${v.trim()}" already exists. Choose a different alias.`;
          return true;
        },
      },
      {
        type: 'password',
        name: 'token',
        message: 'ClickUp API token (Settings → Apps → API Token):',
        mask: '*',
        when: !options.token,
        validate: (v: string) => {
          if (!v.trim()) return 'Token cannot be empty';
          if (!v.trim().startsWith('pk_')) return 'Token should start with "pk_"';
          return true;
        },
      },
    ]);

    const name = (options.name ?? answers.name as string).trim();
    const token = (options.token ?? answers.token as string).trim();

    const spinner = createSpinner('Verifying token…').start();

    let user;
    try {
      user = await getCurrentUser(createApiClient(token));
    } catch {
      spinner.fail('Token verification failed');
      throw new CliError('Could not verify the API token. Check it at Settings → Apps and try again.');
    }

    config.addAccount({ name, token, userId: user.id, username: user.username, email: user.email });

    if (!config.getActiveAccount()) config.setActiveAccount(name);

    spinner.succeed(chalk.green(`Account "${name}" added!`));
    console.log(chalk.dim(`  Logged in as: ${user.username} (${user.email})\n`));

    if (config.getActiveAccount() !== name) {
      console.log(chalk.dim(`  Run ${chalk.white(`clickup auth switch ${name}`)} to make it active.\n`));
    }
  } catch (error) {
    handleError(error);
  }
}
