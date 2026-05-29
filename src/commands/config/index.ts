import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { config } from '../../config/store';

export function createConfigCommand(): Command {
  const cfg = new Command('config').description('Manage CLI settings');

  cfg
    .command('export-path [path]')
    .description('Get or set the default directory for --export')
    .action((path?: string) => {
      if (path) {
        const abs = resolve(path);
        config.setExportPath(abs);
        console.log(`${chalk.green('✓')} Export path set to ${chalk.cyan(abs)}`);
      } else {
        const current = config.getExportPath();
        if (current) {
          console.log(`Export path: ${chalk.cyan(current)}`);
        } else {
          console.log(chalk.dim('No export path configured. Defaults to ~/clickup-exports'));
          console.log(chalk.dim('Set one with: clickup config export-path <dir>'));
        }
      }
    });

  return cfg;
}
