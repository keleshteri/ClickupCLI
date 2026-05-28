import inquirer from 'inquirer';
import chalk from 'chalk';
import { config } from '../../config/store';
import { handleError, CliError } from '../../utils/errors';

export async function removeAuth(name: string): Promise<void> {
  try {
    const account = config.getAccount(name);
    if (!account) {
      throw new CliError(`Account "${name}" not found. Run \`clickup auth list\` to see available accounts.`);
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Remove account "${name}" (${account.email})?`,
        default: false,
      },
    ]);

    if (!confirmed) {
      console.log(chalk.dim('\n  Aborted.\n'));
      return;
    }

    config.removeAccount(name);
    console.log(chalk.green(`\n  Account "${name}" removed.\n`));

    const remaining = Object.keys(config.getAccounts());
    if (remaining.length > 0 && !config.getActiveAccount()) {
      config.setActiveAccount(remaining[0]);
      console.log(chalk.dim(`  Active account set to "${remaining[0]}".\n`));
    }
  } catch (error) {
    handleError(error);
  }
}
