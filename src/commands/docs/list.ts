import chalk from 'chalk';
import { getDocs } from '../../api/docs';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface ListDocsOptions { json?: boolean }

export async function listDocs(workspaceId: string, opts: ListDocsOptions): Promise<void> {
  try {
    const spinner = createSpinner('Fetching docs…').start();
    const docs = await getDocs(workspaceId);
    spinner.stop();

    if (opts.json) {
      console.log(JSON.stringify(docs, null, 2));
      return;
    }

    if (!docs.length) {
      console.log(chalk.dim('No docs found in this workspace.'));
      return;
    }

    console.log('');
    for (const d of docs) {
      const updated = new Date(d.date_updated).toLocaleDateString();
      console.log(`${chalk.cyan(d.id.padEnd(24))} ${d.name}  ${chalk.dim(updated)}`);
    }
    console.log(chalk.dim(`\n${docs.length} doc${docs.length !== 1 ? 's' : ''}`));
  } catch (e) {
    handleError(e);
  }
}
