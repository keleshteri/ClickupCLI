# ClickUp CLI — Phased Roadmap

## Overview

Cross-platform CLI (Linux · macOS · Windows) built with **TypeScript + Node.js**.  
Distributed via `npm install -g clickup-cli` or `npx clickup-cli`.  
Config stored in `~/.clickup-cli/config.json`.

---

## Phase 1 — Foundation & Authentication ✅ (Current)

**Goal:** Connect to ClickUp, manage multiple accounts, and fetch tasks from any list.

### Commands
| Command | Description |
|---|---|
| `clickup auth add` | Add a ClickUp account (API token, interactive) |
| `clickup auth list` | List all configured accounts |
| `clickup auth switch <name>` | Set a different account as active |
| `clickup auth remove <name>` | Remove a saved account |
| `clickup auth whoami` | Show current active account info |
| `clickup workspace list` | List all ClickUp workspaces for active account |
| `clickup task list --list <id>` | List tasks from a ClickUp list |
| `clickup task get <id>` | Show full detail for a single task |

### Technical
- API token auth via `GET /api/v2/user` validation
- Multiple named accounts stored locally (`~/.clickup-cli/config.json`)
- Active account concept — all commands use the active account
- Table output with status/priority color coding
- `--json` flag for machine-readable output

---

## Phase 2 — Hierarchy Navigation

**Goal:** Browse workspaces → spaces → folders → lists from the CLI without needing the web app.

### Commands
| Command | Description |
|---|---|
| `clickup space list --workspace <id>` | List spaces in a workspace |
| `clickup folder list --space <id>` | List folders in a space |
| `clickup list list --folder <id>` | List ClickUp lists in a folder |
| `clickup list list --space <id>` | List folderless lists in a space |
| `clickup browse` | Interactive tree navigator (arrow keys) |

### Technical
- Inquirer-based interactive mode
- Breadcrumb display: `workspace > space > folder > list`
- Store last-browsed list ID for convenience (`clickup task list` with no args reuses it)

---

## Phase 3 — Full Task Management

**Goal:** Create, update, and manage tasks entirely from the terminal.

### Commands
| Command | Description |
|---|---|
| `clickup task create` | Create a task (interactive or flags) |
| `clickup task update <id>` | Update status, priority, assignee, due date |
| `clickup task close <id>` | Mark task as closed/complete |
| `clickup task delete <id>` | Delete a task (with confirmation) |
| `clickup task move <id> --list <id>` | Move task to a different list |
| `clickup task search <query>` | Full-text search across a workspace |

### Flags for `task create`
```
--list <id>        Target list (required)
--title "..."      Task name
--description "…"  Task description
--priority urgent|high|normal|low
--assignee <user>  Username or user ID
--due <date>       Due date (e.g. "tomorrow", "2026-06-01")
--status <status>  Initial status
```

### Technical
- Natural language date parsing (e.g. "next friday", "in 3 days")
- Confirm prompt before destructive actions

---

## Phase 4 — Time Tracking

**Goal:** Start/stop timers and log time directly from the terminal.

### Commands
| Command | Description |
|---|---|
| `clickup time start <taskId>` | Start a timer on a task |
| `clickup time stop` | Stop the currently running timer |
| `clickup time log <taskId> --duration 2h30m` | Manually log time |
| `clickup time list --task <id>` | View time entries for a task |
| `clickup time report --week` | Weekly time summary |
| `clickup time report --date 2026-06-01` | Time report for a specific day |

### Technical
- Local timer state (start timestamp) in config
- Duration parser: `2h`, `90m`, `1h30m`, `1:30`

---

## Phase 5 — Comments & Collaboration

**Goal:** Communicate around tasks without leaving the terminal.

### Commands
| Command | Description |
|---|---|
| `clickup comment list <taskId>` | View all comments on a task |
| `clickup comment add <taskId>` | Add a comment (opens $EDITOR or inline) |
| `clickup task assign <taskId> --user <name>` | Assign or unassign a task |
| `clickup task watch <taskId>` | Watch a task for notifications |

### Technical
- Markdown rendering in terminal for comment bodies
- `$EDITOR` integration for long comments

---

## Phase 6 — Advanced Features

**Goal:** Power-user features for automation and deep integration.

### Features
| Feature | Description |
|---|---|
| **Git integration** | Auto-detect task ID from branch name (`feat/CU-abc123-fix`) |
| **Multiple output formats** | `--format table|json|csv|tsv` |
| **Shell completion** | `clickup completion bash|zsh|fish|powershell` |
| **Export** | `clickup task export --list <id> --format csv > tasks.csv` |
| **Watch mode** | `clickup task list --list <id> --watch` (live refresh) |
| **Custom fields** | Read and write custom field values |
| **Webhooks** | Register/list/delete webhooks via CLI |
| **MCP mode** | `clickup --mcp` — expose all commands as MCP tools for AI agents |
| **Aliases** | `clickup alias set daily "task list --list <id> --status open"` |

### Technical
- `clickup config set default.list <id>` — set a default list
- `clickup config set output.format json` — set default output format
- Keychain/OS credential store for token security (instead of plain JSON)
- Plugin architecture for community-built extensions

---

## Token Reference

```
GET  /api/v2/user                          Current user
GET  /api/v2/team                          Workspaces (teams)
GET  /api/v2/team/{teamId}/space           Spaces
GET  /api/v2/space/{spaceId}/folder        Folders
GET  /api/v2/folder/{folderId}/list        Lists in folder
GET  /api/v2/space/{spaceId}/list          Folderless lists
GET  /api/v2/list/{listId}/task            Tasks in list
GET  /api/v2/task/{taskId}                 Single task
POST /api/v2/list/{listId}/task            Create task
PUT  /api/v2/task/{taskId}                 Update task
DEL  /api/v2/task/{taskId}                 Delete task
POST /api/v2/task/{taskId}/comment         Add comment
GET  /api/v2/task/{taskId}/comment         List comments
POST /api/v2/team/{teamId}/time_entries    Log time
GET  /api/v2/team/{teamId}/time_entries    Time entries
```

---

## Config File (`~/.clickup-cli/config.json`)

```json
{
  "activeAccount": "work",
  "accounts": {
    "work": {
      "name": "work",
      "token": "pk_xxx",
      "userId": 123,
      "username": "john",
      "email": "john@company.com"
    },
    "personal": {
      "name": "personal",
      "token": "pk_yyy",
      "userId": 456,
      "username": "john_personal",
      "email": "john@gmail.com"
    }
  }
}
```
