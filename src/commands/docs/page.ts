import chalk from 'chalk';
import { readFileSync } from 'fs';
import { createDocPage, updateDocPage } from '../../api/docs';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';

interface PageAddOptions {
  workspace: string;
  name: string;
  content?: string;
  file?: string;
  parent?: string;
  json?: boolean;
}

interface PageUpdateOptions {
  workspace: string;
  name?: string;
  content?: string;
  file?: string;
  json?: boolean;
}

function resolveContent(options: { content?: string; file?: string }): string {
  if (options.file) {
    return readFileSync(options.file, 'utf-8');
  }
  return options.content ?? '';
}

export async function addPageCommand(
  docId: string,
  options: PageAddOptions
): Promise<void> {
  try {
    const content = resolveContent(options);
    const spinner = createSpinner('Adding page…').start();
    const page = await createDocPage(
      options.workspace,
      docId,
      options.name,
      content,
      options.parent
    );
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(page, null, 2));
      return;
    }

    const label = (l: string) => chalk.cyan(l.padEnd(12));
    console.log(chalk.green('✓') + ' Page created');
    console.log(`\n${label('Page ID')}${chalk.dim(page.id)}`);
    console.log(`${label('Name')}${page.name}`);
    if (options.parent) console.log(`${label('Parent')}${chalk.dim(options.parent)}`);
    console.log();
  } catch (error) {
    handleError(error);
  }
}

export async function updatePageCommand(
  docId: string,
  pageId: string,
  options: PageUpdateOptions
): Promise<void> {
  const fields: { name?: string; content?: string } = {};
  if (options.name) fields.name = options.name;
  if (options.file || options.content !== undefined) {
    fields.content = resolveContent(options);
  }

  if (Object.keys(fields).length === 0) {
    console.error(chalk.yellow('Nothing to update. Pass --name and/or --content (or --file).'));
    process.exit(1);
  }

  try {
    const spinner = createSpinner('Updating page…').start();
    const page = await updateDocPage(options.workspace, docId, pageId, fields);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(page, null, 2));
      return;
    }

    console.log(chalk.green('✓') + ` Page updated  ${chalk.dim('id: ' + page.id)}`);
    if (fields.name) console.log(`  ${chalk.cyan('Name')}  ${page.name}`);
    console.log();
  } catch (error) {
    handleError(error);
  }
}
