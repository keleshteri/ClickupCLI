import chalk from 'chalk';
import { config } from '../../config/store';
import { handleError, CliError } from '../../utils/errors';

export function switchAuth(name: string): void {
  try {
    const account = config.getAccount(name);
    if (!account) {
      throw new CliError(`Account "${name}" not found. Run \`clickup auth list\` to see available accounts.`);
    }
    config.setActiveAccount(name);
    console.log(chalk.green(`\n  Switched to "${name}" (${account.username})\n`));
  } catch (error) {
    handleError(error);
  }
}
