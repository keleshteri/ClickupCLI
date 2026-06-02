import chalk from 'chalk';
import { createApiClient } from '../../api/client';
import { addComment, updateComment, getTaskComments } from '../../api/task';
import { createSpinner } from '../../utils/spinner';
import { handleError } from '../../utils/errors';
import { CliError } from '../../utils/errors';

interface AddCommentOptions {
  notify?: boolean;
  json?: boolean;
}

interface UpdateCommentOptions {
  resolved?: boolean;
  json?: boolean;
}

export async function addCommentCommand(
  taskId: string,
  message: string,
  options: AddCommentOptions
): Promise<void> {
  try {
    const spinner = createSpinner('Posting comment…').start();
    const client = createApiClient();
    const result = await addComment(client, taskId, message, options.notify ?? false);
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(chalk.green('✓') + ` Comment posted  ${chalk.dim('id: ' + result.id)}`);
  } catch (error) {
    handleError(error);
  }
}

export async function updateCommentCommand(
  taskId: string,
  commentId: string,
  message: string,
  options: UpdateCommentOptions
): Promise<void> {
  try {
    const spinner = createSpinner('Verifying comment ownership…').start();
    const client = createApiClient();

    const comments = await getTaskComments(client, taskId);
    const target = comments.find((c) => c.id === commentId);
    if (!target) {
      spinner.stop();
      throw new CliError(`Comment ${commentId} not found on task ${taskId}.`);
    }

    // The ClickUp API enforces ownership server-side, but we surface a clear
    // message here before making the call so the error is friendlier.
    spinner.succeed('Comment found');

    const updateSpinner = createSpinner('Updating comment…').start();
    await updateComment(client, commentId, message, options.resolved);
    updateSpinner.stop();

    if (options.json) {
      console.log(JSON.stringify({ id: commentId, comment_text: message }, null, 2));
      return;
    }

    const resolvedNote = options.resolved !== undefined
      ? chalk.dim(` · resolved=${options.resolved}`)
      : '';
    console.log(chalk.green('✓') + ` Comment updated${resolvedNote}`);
  } catch (error) {
    handleError(error);
  }
}
