# ClickUp CLI — Claude Context

## What this is

A TypeScript CLI (`clickup`) for managing ClickUp tasks from the terminal.
Multi-account auth, full hierarchy navigation, task export, and subtask support.

## Directory layout

```
src/
  api/          # ClickUp REST API wrappers (client.ts, task.ts, workspace.ts)
  commands/     # One folder per CLI command group
    auth/       # clickup auth list|switch|remove
    browse/     # clickup browse  (interactive hierarchy picker)
    config/     # clickup config
    docs/       # clickup docs list
    folder/     # clickup folder list -s <spaceId>
    list/       # clickup list list -f <folderId> | -s <spaceId>
    space/      # clickup space list -w <workspaceId>
    task/       # clickup task list|get|subtasks|export
    workspace/  # clickup workspace list
  utils/        # display, spinner, errors helpers
dist/           # compiled output (tsup)
.claude/
  commands/
    clickup.md  # /clickup slash command — AI agent for ClickUp operations
```

## Build & run

```bash
npm run build          # compile TypeScript → dist/
npm run dev            # watch mode
npm run install-cli    # build + npm link (makes `clickup` available globally)
npm run typecheck      # type-check without emitting
```

## CLI hierarchy & commands

ClickUp structure: **Workspace → Space → Folder → List → Tasks**

```bash
clickup workspace list --json
clickup space list -w <workspaceId> --json
clickup folder list -s <spaceId> --json
clickup list list -f <folderId> --json        # lists in a folder
clickup list list -s <spaceId> --json         # folderless lists in a space
clickup task list -l <listId> --subtasks --json
clickup task get <taskId> --comments --json
clickup task subtasks <taskId> --json
clickup browse                                # interactive picker
```

Every command supports `--json` for machine-readable output.

## URL → List ID

```
https://app.clickup.com/<workspace>/v/l/li/<listId>
                                             ↑ listId
```

## Auth

API tokens live in `~/.config/clickup-cli/config.json` (managed by `clickup auth`).
The active token is used automatically by every command.

## Key patterns

- All API calls go through `createApiClient()` which injects the auth token
- Errors use `handleError(e)` from `utils/errors.ts`
- Spinners use `createSpinner` from `utils/spinner.ts`
- `--json` flag: every command prints raw JSON to stdout then returns early

## AI usage

Use the `/clickup` slash command to get a ClickUp agent that runs CLI commands directly.
To use ClickUp in any project: copy `.claude/commands/clickup.md` into that project's
`.claude/commands/` folder — no other setup needed.
