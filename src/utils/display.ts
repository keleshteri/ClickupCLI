import chalk from 'chalk';
import Table from 'cli-table3';
import type { ClickUpTask, ClickUpComment, ClickUpTeam, ClickUpSpace, ClickUpFolder, ClickUpList } from '../api/types';

function formatDate(ts: string | null): string {
  if (!ts) return chalk.dim('-');
  return new Date(parseInt(ts, 10)).toLocaleDateString();
}

function colorPriority(p: string | null): string {
  if (!p) return chalk.dim('-');
  switch (p.toLowerCase()) {
    case 'urgent': return chalk.bgRed.white(' urgent ');
    case 'high':   return chalk.red(p);
    case 'normal': return chalk.blue(p);
    case 'low':    return chalk.dim(p);
    default:       return p;
  }
}

function colorStatus(status: string, color: string): string {
  try {
    return chalk.hex(color)(status);
  } catch {
    return status;
  }
}

export function displayTaskTable(tasks: ClickUpTask[]): void {
  if (tasks.length === 0) {
    console.log(chalk.yellow('\n  No tasks found.\n'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Name'),
      chalk.cyan('Status'),
      chalk.cyan('Priority'),
      chalk.cyan('Assignees'),
      chalk.cyan('Due'),
    ],
    colWidths: [12, 42, 16, 12, 20, 14],
    wordWrap: true,
    style: { head: [], border: ['grey'] },
  });

  for (const task of tasks) {
    const assignees = task.assignees.map((a) => a.username).join(', ') || chalk.dim('-');
    table.push([
      chalk.dim(task.custom_id ?? task.id),
      task.name.length > 40 ? task.name.slice(0, 39) + '…' : task.name,
      colorStatus(task.status.status, task.status.color),
      colorPriority(task.priority?.priority ?? null),
      assignees.length > 18 ? assignees.slice(0, 17) + '…' : assignees,
      formatDate(task.due_date),
    ]);
  }

  console.log('\n' + table.toString());
  console.log(chalk.dim(`\n  ${tasks.length} task${tasks.length !== 1 ? 's' : ''}\n`));
}

export function displayTaskDetail(task: ClickUpTask): void {
  const sep = chalk.dim('─'.repeat(50));
  const label = (l: string) => chalk.cyan(l.padEnd(12));

  const subtaskCount = task.subtasks?.length ?? 0;
  const subtaskHint = subtaskCount > 0
    ? chalk.yellow(`${subtaskCount} subtask${subtaskCount !== 1 ? 's' : ''}`) +
      chalk.dim(`  →  clickup task subtasks ${task.id}`)
    : chalk.dim('none');

  console.log(`
${sep}
${chalk.bold(task.name)}
${sep}
${label('ID')}${chalk.dim(task.id)}${task.custom_id ? chalk.dim(' · ' + task.custom_id) : ''}
${label('Status')}${colorStatus(task.status.status, task.status.color)}
${label('Priority')}${colorPriority(task.priority?.priority ?? null)}
${label('Assignees')}${task.assignees.map((a) => a.username).join(', ') || chalk.dim('none')}
${label('Due date')}${formatDate(task.due_date)}
${label('Created')}${formatDate(task.date_created)}
${label('List')}${task.list.name}
${label('Tags')}${task.tags.map((t) => t.name).join(', ') || chalk.dim('none')}
${label('Subtasks')}${subtaskHint}
${label('URL')}${chalk.underline(task.url)}
${sep}`);

  if (task.description) {
    console.log(`\n${chalk.cyan('Description')}\n${task.description}\n`);
  } else {
    console.log();
  }
}

export function displayComments(comments: ClickUpComment[]): void {
  const sep = chalk.dim('─'.repeat(50));
  console.log(`\n${sep}`);
  console.log(`  ${chalk.cyan('Comments')}  ${chalk.dim(`(${comments.length})`)}`);
  console.log(sep);

  if (comments.length === 0) {
    console.log(chalk.dim('\n  No comments.\n'));
    return;
  }

  for (const c of comments) {
    const date = new Date(parseInt(c.date, 10)).toLocaleString();
    const author = chalk.bold(c.user.username);
    const resolved = c.resolved ? chalk.dim(' [resolved]') : '';
    console.log(`\n  ${author}  ${chalk.dim(date)}${resolved}`);
    const lines = c.comment_text.split('\n');
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  }

  console.log(`\n${sep}\n`);
}

export function displaySubtaskTable(parent: ClickUpTask, subtasks: ClickUpTask[]): void {
  const sep = chalk.dim('─'.repeat(50));
  console.log(`\n${sep}`);
  console.log(`  ${chalk.cyan('Subtasks')} of ${chalk.bold(parent.name)}`);
  console.log(`  ${chalk.dim(parent.id)} · ${subtasks.length} subtask${subtasks.length !== 1 ? 's' : ''}`);
  console.log(sep);
  displayTaskTable(subtasks);
}

export function displayWorkspaceTable(teams: ClickUpTeam[]): void {
  if (teams.length === 0) {
    console.log(chalk.yellow('\n  No workspaces found.\n'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('Name'), chalk.cyan('Members')],
    style: { head: [], border: ['grey'] },
  });

  for (const team of teams) {
    table.push([team.id, team.name, String(team.members.length)]);
  }

  console.log('\n' + table.toString() + '\n');
}

export function displaySpaceTable(spaces: ClickUpSpace[]): void {
  if (spaces.length === 0) {
    console.log(chalk.yellow('\n  No spaces found.\n'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('Name'), chalk.cyan('Private')],
    style: { head: [], border: ['grey'] },
  });

  for (const s of spaces) {
    table.push([s.id, s.name, s.private ? chalk.yellow('yes') : chalk.dim('no')]);
  }

  console.log('\n' + table.toString() + '\n');
}

export function displayFolderTable(folders: ClickUpFolder[]): void {
  if (folders.length === 0) {
    console.log(chalk.yellow('\n  No folders found.\n'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('Name'), chalk.cyan('Tasks')],
    style: { head: [], border: ['grey'] },
  });

  for (const f of folders) {
    table.push([f.id, f.name, f.task_count ?? chalk.dim('-')]);
  }

  console.log('\n' + table.toString() + '\n');
}

export function displayListTable(lists: ClickUpList[]): void {
  if (lists.length === 0) {
    console.log(chalk.yellow('\n  No lists found.\n'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('ID'), chalk.cyan('Name'), chalk.cyan('Tasks'), chalk.cyan('Folder')],
    style: { head: [], border: ['grey'] },
  });

  for (const l of lists) {
    const folder = l.folder.hidden ? chalk.dim('(none)') : l.folder.name;
    table.push([l.id, l.name, l.task_count ?? chalk.dim('-'), folder]);
  }

  console.log('\n' + table.toString() + '\n');
}
