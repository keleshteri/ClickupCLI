import chalk from 'chalk';
import { createDoc } from '../../api/docs';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface CreateDocOptions {
  workspace: string;
  name: string;
  visibility?: 'public' | 'private';
  json?: boolean;
}

export async function createDocCommand(options: CreateDocOptions): Promise<void> {
  try {
    const spinner = createSpinner('Creating doc…').start();
    const doc = await createDoc(options.workspace, options.name, options.visibility ?? 'private');
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(doc, null, 2));
      return;
    }

    console.log(chalk.green('✓') + ' Doc created');
    const label = (l: string) => chalk.cyan(l.padEnd(12));
    console.log(`\n${label('ID')}${chalk.dim(doc.id)}`);
    console.log(`${label('Name')}${doc.name}`);
    console.log(`${label('Workspace')}${doc.workspace_id}\n`);
  } catch (error) {
    handleError(error);
  }
}
