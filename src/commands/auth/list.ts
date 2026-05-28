import chalk from 'chalk';
import Table from 'cli-table3';
import { config } from '../../config/store';

export function listAuth(): void {
  const accounts = config.getAccounts();
  const active = config.getActiveAccount();
  const entries = Object.values(accounts);

  if (entries.length === 0) {
    console.log(chalk.yellow('\n  No accounts configured. Run `clickup auth add` to get started.\n'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan(''), chalk.cyan('Alias'), chalk.cyan('Username'), chalk.cyan('Email')],
    style: { head: [], border: ['grey'] },
  });

  for (const acc of entries) {
    const isActive = acc.name === active;
    table.push([
      isActive ? chalk.green('●') : chalk.dim('○'),
      isActive ? chalk.green.bold(acc.name) : acc.name,
      acc.username,
      acc.email,
    ]);
  }

  console.log('\n' + table.toString());
  console.log(chalk.dim(`\n  Active: ${active ?? 'none'}`) + '\n');
}
