import chalk from 'chalk';

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof CliError) {
    console.error(chalk.red(`\n  Error: ${error.message}\n`));
  } else if (error instanceof Error) {
    console.error(chalk.red(`\n  Unexpected error: ${error.message}\n`));
    if (process.env.DEBUG) console.error(error.stack);
  } else {
    console.error(chalk.red('\n  An unknown error occurred\n'));
  }
  process.exit(1);
}
