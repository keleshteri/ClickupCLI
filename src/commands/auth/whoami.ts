import chalk from 'chalk';
import { config } from '../../config/store';
import { handleError, CliError } from '../../utils/errors';

export function whoami(): void {
  try {
    const acc = config.getActiveAccountConfig();
    if (!acc) {
      throw new CliError('No active account. Run `clickup auth add` to authenticate.');
    }

    const sep = chalk.dim('─'.repeat(40));
    console.log(`
${sep}
  ${chalk.cyan('Active Account')}
${sep}
  ${chalk.cyan('Alias')}     ${chalk.bold(acc.name)}
  ${chalk.cyan('Username')}  ${acc.username}
  ${chalk.cyan('Email')}     ${acc.email}
  ${chalk.cyan('Config')}    ${chalk.dim(config.configPath)}
${sep}
`);
  } catch (error) {
    handleError(error);
  }
}
