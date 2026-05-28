import { Command } from 'commander';
import { addAuth } from './add';
import { listAuth } from './list';
import { switchAuth } from './switch';
import { removeAuth } from './remove';
import { whoami } from './whoami';

export function createAuthCommand(): Command {
  const auth = new Command('auth').description('Manage ClickUp accounts');

  auth
    .command('add')
    .description('Add a ClickUp account')
    .option('-n, --name <alias>', 'Account alias')
    .option('-t, --token <token>', 'API token (skip prompt)')
    .action((opts) => addAuth(opts));

  auth
    .command('list')
    .alias('ls')
    .description('List all configured accounts')
    .action(() => listAuth());

  auth
    .command('switch <name>')
    .description('Switch to a different account')
    .action((name) => switchAuth(name));

  auth
    .command('remove <name>')
    .alias('rm')
    .description('Remove an account')
    .action((name) => removeAuth(name));

  auth
    .command('whoami')
    .description('Show the currently active account')
    .action(() => whoami());

  return auth;
}
