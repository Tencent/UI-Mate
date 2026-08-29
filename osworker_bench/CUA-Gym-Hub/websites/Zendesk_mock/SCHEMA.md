# Zendesk_mock Schema

**Deploy order**: 60 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8060)
**Base URL**: `http://172.17.46.46:8060/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart) → `{success, files: [{url, original_name, stored_name, size, content_type}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with appropriate Content-Type

---

## API Endpoint Details

### POST /post

Accepts a JSON body with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Required. One of: `"set"`, `"set_current"`, `"reset"` |
| `state` | object | Required for `"set"` and `"set_current"`. The state to write |
| `merge` | boolean | Optional. If `true`, deep-merges `state` into the existing stored state instead of replacing it. Applies to both `"set"` and `"set_current"` |

- **`"set"`**: Writes both current state AND initial state (used as baseline for diff). Resets the diff baseline.
- **`"set_current"`**: Writes only current state; preserves existing initial state (baseline unchanged, so diff continues to grow from original baseline).
- **`"reset"`**: Deletes both current and initial state files for the given `sid`. App will reload from hardcoded defaults on next visit.

### GET /state

Returns the raw stored state without running view logic or diff computation:

```json
{
  "stored_state": { /* full state object or null if never set */ },
  "has_custom_state": true,
  "sid": "task001"
}
```

### GET /go

Returns full state inspection output. The `state_diff` uses a deep diff format where each changed path maps to `{old, new}`:

```json
{
  "initial_state": { /* state at inject/reset time */ },
  "current_state": { /* current live state */ },
  "state_diff": {
    "tickets": { "old": [...], "new": [...] },
    "ui.activeView": { "old": 1, "new": 3 },
    "ui.openTicketTabs": { "old": [], "new": [1001] }
  }
}
```

The diff is computed by the in-browser `/go` route (React component using `stateTracker.js`). The server-side `/go` endpoint uses a simpler format (`{added, modified}` per top-level key). For reliable deep-path diffs, use the in-app `/go?sid=<sid>` route.

### POST /upload

Accepts `multipart/form-data`. Returns:

```json
{
  "success": true,
  "files": [
    {
      "original_name": "screenshot.png",
      "stored_name": "a1b2c3d4_screenshot.png",
      "size": 204800,
      "content_type": "image/png",
      "url": "/files/<sid>/a1b2c3d4_screenshot.png"
    }
  ]
}
```

Supported MIME types: `.pdf`, `.png`, `.jpg`/`.jpeg`, `.gif`, `.txt`, `.csv`, `.zip`, `.doc`, `.docx`, `.xls`, `.xlsx`.

---

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | The currently logged-in agent (same shape as an item in `users[]` with `role: "agent"`) |
| `users` | array | All users (both agents and end-users); see User object below |
| `organizations` | array | Customer organizations; see Organization object below |
| `groups` | array | Support groups/teams; see Group object below |
| `tickets` | array | All support tickets; see Ticket object below |
| `comments` | object | Keyed by ticket ID (number, as string key) → array of Comment objects |
| `views` | array | Saved ticket views/filters; see View object below |
| `macros` | array | Automation macros; see Macro object below |
| `tags` | array | Global list of available tag strings |
| `ui` | object | UI state; see UI object below |

---

### User Object

Each element in `users[]` (also the shape of `currentUser`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique user ID. Agents: 1-5. End-users: 101-110 |
| `name` | string | Full name |
| `email` | string | Email address |
| `role` | string | `"agent"` or `"end-user"` |
| `phone` | string\|null | Phone number |
| `photo` | string\|null | Avatar URL (null by default) |
| `organization_id` | number\|null | FK to organization. Agents have null |
| `group_id` | number\|null | FK to group (agents only; end-users have null) |
| `time_zone` | string | IANA timezone (e.g. `"America/New_York"`) |
| `locale` | string | Locale code (e.g. `"en-US"`) |
| `signature` | string | Agent email signature (empty string for end-users) |
| `notes` | string | Internal notes about user |
| `suspended` | boolean | Whether user is suspended |
| `verified` | boolean | Whether email is verified |
| `active` | boolean | Whether user is active |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp — auto-updated to `new Date().toISOString()` by `UPDATE_USER` |
| `last_login_at` | string | ISO 8601 timestamp |
| `initials` | string | Two-letter initials for avatar display |

**Editable fields via `UPDATE_USER`**: Any user field may be updated. The CustomerDetail page exposes inline editing for `phone`, `time_zone`, and `notes`.

---

### Organization Object

Each element in `organizations[]`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique org ID (1-5) |
| `name` | string | Organization name |
| `domain_names` | string[] | Associated domain names |
| `details` | string | Description / details |
| `notes` | string | Internal notes (editable inline on OrganizationDetail page) |
| `group_id` | number | Default support group |
| `shared_tickets` | boolean | Whether tickets are shared across org |
| `shared_comments` | boolean | Whether comments are shared across org |
| `tags` | string[] | Organization tags |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp — auto-updated to `new Date().toISOString()` by `UPDATE_ORGANIZATION` |

**Editable fields via `UPDATE_ORGANIZATION`**: Any org field may be updated. The OrganizationDetail page exposes inline editing for `notes`.

---

### Group Object

Each element in `groups[]`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique group ID (1-4) |
| `name` | string | Group name (e.g. `"Tier 1 Support"`) |
| `description` | string | Group description |
| `default` | boolean | Whether this is the default group |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |

---

### Ticket Object

Each element in `tickets[]`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique ticket ID (1001-1015 default) |
| `subject` | string | Ticket subject line |
| `description` | string | Initial ticket description |
| `status` | string | One of: `"new"`, `"open"`, `"pending"`, `"hold"`, `"solved"`, `"closed"` |
| `type` | string\|null | One of: `"question"`, `"incident"`, `"problem"`, `"task"`, or null |
| `priority` | string\|null | One of: `"urgent"`, `"high"`, `"normal"`, `"low"`, or null |
| `requester_id` | number | FK to user who submitted the ticket |
| `submitter_id` | number | FK to user who created the ticket |
| `assignee_id` | number\|null | FK to agent assigned, or null if unassigned |
| `group_id` | number | FK to support group |
| `organization_id` | number\|null | FK to organization |
| `collaborator_ids` | number[] | User IDs of collaborators (CC'd) |
| `follower_ids` | number[] | Agent IDs following this ticket |
| `tags` | string[] | Ticket tags |
| `via` | object | `{channel: string}` — channel is `"email"` or `"web"` |
| `satisfaction_rating` | object\|null | `{score: string, comment: string}` or null. Score: `"good"` or `"bad"` |
| `due_at` | string\|null | ISO 8601 due date or null |
| `is_public` | boolean | Whether ticket is public |
| `custom_fields` | array | Custom field values (empty array by default) |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp — auto-updated on any `UPDATE_TICKET` or `BULK_UPDATE_TICKETS` |
| `comment_count` | number | Number of comments on ticket |
| `sla` | object | SLA tracking object (see below) |

#### SLA Sub-Object (`ticket.sla`)

| Field | Type | Description |
|-------|------|-------------|
| `first_reply_at` | string\|null | ISO 8601 timestamp of first agent reply, or null if not yet replied |
| `next_reply_due` | string\|null | ISO 8601 timestamp when next reply is due, or null |
| `breached` | boolean | Whether the SLA has been breached |

---

### Comment Object

Each element in `comments[ticketId]` (note: the object key is the ticket ID as a string, e.g. `"1001"`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique comment ID (5001+ in default data; `Date.now()` for new comments) |
| `ticket_id` | number | FK to parent ticket |
| `author_id` | number | FK to user who wrote the comment |
| `body` | string | Plain text body |
| `html_body` | string | HTML formatted body |
| `public` | boolean | `true` for public replies, `false` for internal notes |
| `type` | string | Always `"Comment"` |
| `attachments` | array | File attachments (empty array by default) |
| `created_at` | string | ISO 8601 timestamp |

---

### View Object

Each element in `views[]`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique view ID (1-8) |
| `title` | string | View name displayed in sidebar |
| `description` | string | View description |
| `active` | boolean | Whether view is active |
| `position` | number | Sort position (0-indexed) |
| `type` | string | `"standard"`, `"shared"`, or `"personal"` |
| `conditions` | object | Filter conditions: `{all: Condition[], any: Condition[]}` |

#### View Condition Object

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Ticket field to evaluate: `"assignee_id"`, `"status"`, `"priority"`, `"updated_at"` |
| `operator` | string | `"is"`, `"is_not"`, `"less_than"`, `"within"` |
| `value` | string\|number\|null | Value to match. `"current_user"` resolves to `currentUser.id` at evaluation time |

**Operator behavior:**
- `"is"` / `"is_not"`: Exact equality check. For `assignee_id`, `null` means unassigned.
- `"less_than"`: For `status` only — compares position in the ordered list: `new < open < pending < hold < solved < closed`.
- `"within"`: For `updated_at` only — ticket was updated within the last N days. Value formats accepted: plain number (e.g. `7`), `"7_days"`, `"2_weeks"` (multiplied by 7), `"1_month"` (multiplied by 30).

**Condition evaluation:** All conditions in `all[]` must match AND at least one condition in `any[]` must match (if `any[]` is non-empty). An empty `any[]` means the any clause is ignored.

---

### Macro Object

Each element in `macros[]`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique macro ID (1-6) |
| `title` | string | Macro name |
| `description` | string | What the macro does |
| `active` | boolean | Whether macro is active |
| `position` | number | Sort position (0-indexed) |
| `actions` | object[] | Array of action objects: `{field: string, value: string\|number}` |
| `restriction` | null | Access restriction (null = globally available) |

#### Macro Action Fields

Supported `field` values in macro `actions[]`:

| Field value | Effect |
|-------------|--------|
| `"status"` | Sets `ticket.status` to the specified value |
| `"priority"` | Sets `ticket.priority` to the specified value |
| `"group_id"` | Sets `ticket.group_id` to the specified value |
| `"assignee_id"` | Sets `ticket.assignee_id`; the special string `"current_user"` resolves to `currentUser.id` |
| `"comment_mode"` | Sets the mode for the comment added by `comment_value`: `"public"` or `"internal"` (maps to `comment.public = true/false`) |
| `"comment_value"` | Text body of comment to add to the ticket. Newlines (`\n`) are converted to `<br>` in `html_body`. Comment is always created even if `comment_mode` is absent (defaults to `"public"`) |

---

### UI Object (`ui`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `activeView` | number | `1` | Currently selected view ID |
| `openTicketTabs` | number[] | `[]` | Ticket IDs open as tabs in the header |
| `activeTicketId` | number\|null | `null` | Currently active/focused ticket tab |
| `searchQuery` | string | `""` | Current search query text |
| `selectedTicketIds` | number[] | `[]` | Ticket IDs selected for bulk operations |
| `replyMode` | string | `"public"` | Default reply mode: `"public"` or `"internal"` |
| `sidebarCollapsed` | boolean | `false` | Whether the left sidebar is collapsed |

---

## Default IDs Reference

### Agents (users with `role: "agent"`)
| ID | Name | Email | Group |
|----|------|-------|-------|
| 1 | Sarah Chen | sarah.chen@company.com | Tier 1 Support (group 1) |
| 2 | Marcus Johnson | marcus.j@company.com | Tier 1 Support (group 1) |
| 3 | Emily Rodriguez | emily.r@company.com | Tier 2 Support (group 2) |
| 4 | David Kim | david.kim@company.com | Billing (group 3) |
| 5 | Priya Patel | priya.p@company.com | Engineering (group 4) |

`currentUser` defaults to agent ID 1 (Sarah Chen).

### End-Users (users with `role: "end-user"`)
| ID | Name | Email | Organization |
|----|------|-------|--------------|
| 101 | Alex Thompson | alex.t@acmecorp.com | Acme Corp (org 1) |
| 102 | Jordan Lee | jordan.lee@techstart.io | TechStart Inc (org 2) |
| 103 | Maria Garcia | maria.g@globalretail.com | Global Retail (org 3) |
| 104 | Sam Wilson | sam.wilson@acmecorp.com | Acme Corp (org 1) |
| 105 | Nina Patel | nina.p@techstart.io | TechStart Inc (org 2) |
| 106 | Chris Brown | chris.b@designhub.co | DesignHub Co (org 4) |
| 107 | Lisa Wang | lisa.wang@globalretail.com | Global Retail (org 3) |
| 108 | Tom Anderson | tom.a@freelance.com | (none) |
| 109 | Rachel Kim | rachel.k@edutech.org | EduTech Foundation (org 5) |
| 110 | Mike Davis | mike.d@acmecorp.com | Acme Corp (org 1) |

### Organizations
| ID | Name | Domain | Tags |
|----|------|--------|------|
| 1 | Acme Corp | acmecorp.com | enterprise, key-account |
| 2 | TechStart Inc | techstart.io | startup, growth |
| 3 | Global Retail | globalretail.com | enterprise, retail |
| 4 | DesignHub Co | designhub.co | smb |
| 5 | EduTech Foundation | edutech.org | nonprofit, education |

### Groups
| ID | Name | Description | Default |
|----|------|-------------|---------|
| 1 | Tier 1 Support | Front-line customer support | true |
| 2 | Tier 2 Support | Escalated technical issues | false |
| 3 | Billing | Payment and subscription issues | false |
| 4 | Engineering | Bug reports and feature requests | false |

### Default Ticket IDs

15 tickets (IDs 1001–1015) with varying statuses, types, priorities, and assignments:

| ID | Subject (abbreviated) | Status | Priority | Assignee |
|----|----------------------|--------|----------|----------|
| 1001 | Cannot login after password reset | open | high | 1 (Sarah) |
| 1002 | Billing discrepancy on January invoice | pending | normal | 4 (David) |
| 1003 | App crashes when uploading files > 10MB | open | urgent | 3 (Emily) |
| 1004 | How to export data to CSV? | solved | low | 1 (Sarah) |
| 1005 | Feature request: Dark mode support | open | normal | 5 (Priya) |
| 1006 | Cannot access API documentation | new | normal | (none) |
| 1007 | Integration with Slack not sending notifications | open | high | 2 (Marcus) |
| 1008 | Subscription upgrade not reflected | pending | high | 4 (David) |
| 1009 | Mobile app performance issues on Android | open | normal | 3 (Emily) |
| 1010 | Need to change organization admin | new | low | (none) |
| 1011 | Two-factor authentication setup failing | open | urgent | 1 (Sarah) |
| 1012 | Data import from legacy system | hold | normal | 5 (Priya) |
| 1013 | Custom report builder not loading | solved | normal | 3 (Emily) |
| 1014 | Request for team training session | pending | low | 2 (Marcus) |
| 1015 | SSO configuration errors after domain change | new | high | (none) |

### Default Views
| ID | Title | Type | Condition summary |
|----|-------|------|-------------------|
| 1 | Your unsolved tickets | standard | assignee = current_user AND status < solved |
| 2 | Unassigned tickets | standard | assignee = null AND status < solved |
| 3 | All unsolved tickets | standard | status < solved |
| 4 | Recently updated tickets | standard | updated_at within 7_days |
| 5 | Recently solved tickets | standard | status = solved |
| 6 | Pending tickets | standard | status = pending |
| 7 | New tickets | shared | status = new |
| 8 | Urgent & High priority | personal | status < solved AND (priority = urgent OR priority = high) |

### Default Macros
| ID | Title | Actions |
|----|-------|---------|
| 1 | Close and redirect to FAQ | status=solved, public comment with FAQ link |
| 2 | Escalate to Tier 2 | group_id=2, priority=high, internal comment |
| 3 | Request more information | status=pending, public comment asking for details |
| 4 | Assign to me | assignee_id=current_user, status=open |
| 5 | Downgrade priority — resolved | priority=low, status=solved, public comment |
| 6 | Transfer to Billing | group_id=3, internal comment |

### Default Tags (global `tags` array, 31 entries)

`login`, `password`, `billing`, `invoice`, `api`, `integration`, `bug`, `feature-request`, `urgent-fix`, `mobile`, `performance`, `sso`, `2fa`, `export`, `import`, `slack`, `android`, `ios`, `enterprise`, `training`, `documentation`, `csv`, `dark-mode`, `crash`, `upload`, `notification`, `subscription`, `upgrade`, `key-account`, `startup`, `retail`, `smb`, `nonprofit`

---

## Reducer Actions Reference

These are the action `type` strings accepted by the `appReducer` in `AppContext.jsx`. They are dispatched from React components but can also be used to understand how state transitions work.

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `SET_STATE` | `{...stateFields}` | Shallow-merges payload into state, replacing any top-level key present in payload |
| `UPDATE_TICKET` | `{id: number, changes: {...}}` | Merges `changes` into the matching ticket; sets `updated_at` to current ISO timestamp |
| `ADD_TICKET` | `{...ticketObject}` | Appends new ticket object to `tickets[]` array |
| `DELETE_TICKET` | `ticketId: number` | Removes ticket from `tickets[]`; also removes from `ui.openTicketTabs`, clears `ui.activeTicketId` if it matched, removes from `ui.selectedTicketIds` |
| `ADD_COMMENT` | `{ticketId: number, comment: {...}}` | Appends comment to `comments[ticketId]`; increments `tickets[i].comment_count`; sets `tickets[i].updated_at` |
| `UPDATE_COMMENT` | `{ticketId: number, commentId: number, changes: {...}}` | Merges `changes` into the matching comment in `comments[ticketId]` |
| `APPLY_MACRO` | `{ticketId: number, macro: {actions: []}}` | Applies macro actions to ticket (status, priority, group_id, assignee_id fields); if macro has `comment_value`, appends a new Comment using `comment_mode` to determine `public` flag |
| `UPDATE_ORGANIZATION` | `{id: number, changes: {...}}` | Merges `changes` into the matching organization; sets `updated_at` to current ISO timestamp |
| `UPDATE_USER` | `{id: number, changes: {...}}` | Merges `changes` into the matching user in `users[]`; sets `updated_at` to current ISO timestamp. Does NOT update `currentUser` — update that separately if needed |
| `SET_ACTIVE_VIEW` | `viewId: number` | Sets `ui.activeView` to `viewId` |
| `OPEN_TICKET_TAB` | `ticketId: number` | Adds `ticketId` to `ui.openTicketTabs` (no-op if already present); sets `ui.activeTicketId` to `ticketId` |
| `CLOSE_TICKET_TAB` | `ticketId: number` | Removes `ticketId` from `ui.openTicketTabs`; if it was the active tab, sets `ui.activeTicketId` to the last remaining tab or `null` |
| `SET_ACTIVE_TICKET` | `ticketId: number` | Sets `ui.activeTicketId` to `ticketId` (does not modify `openTicketTabs`) |
| `SET_SEARCH_QUERY` | `query: string` | Sets `ui.searchQuery` to `query` |
| `TOGGLE_SELECTED_TICKET` | `ticketId: number` | Adds `ticketId` to `ui.selectedTicketIds` if absent; removes it if present |
| `SELECT_ALL_TICKETS` | `ticketIds: number[]` | Replaces `ui.selectedTicketIds` with the provided array |
| `DESELECT_ALL_TICKETS` | (none) | Sets `ui.selectedTicketIds` to `[]` |
| `BULK_UPDATE_TICKETS` | `{ids: number[], changes: {...}}` | Applies `changes` to every ticket whose ID is in `ids`; sets each matching ticket's `updated_at`; clears `ui.selectedTicketIds` |
| `SET_UI` | `{...uiChanges}` | Shallow-merges `uiChanges` into the `ui` object |

---

## Search Functionality

The `/search` route (`SearchPage`) performs a multi-entity search across three categories, displayed as separate tabs:

### Ticket Search
Matches if **any** of the following contain the query (case-insensitive):
- `ticket.subject`
- `ticket.description`
- The requester's `name` (resolved via `requester_id`)
- Any entry in `ticket.tags`
- `String(ticket.id)` (matches partial ID strings)
- The `body` of any comment in `comments[ticket.id]`

### User / Customer Search
Matches if **any** of the following contain the query:
- `user.name`
- `user.email`
- `user.phone`
- `user.notes`

### Organization Search
Matches if **any** of the following contain the query:
- `org.name`
- Any entry in `org.domain_names`
- `org.details`
- `org.notes`
- Any entry in `org.tags`

The total result count is shown in the heading. Tabs show per-category counts. Clicking a ticket result opens it as a tab (`OPEN_TICKET_TAB`). Clicking a user result navigates to `/customers/:userId`. Clicking an org result navigates to `/organizations/:orgId`.

---

## Bulk Actions

Available in the ViewsPage when one or more tickets are selected (`ui.selectedTicketIds` is non-empty):

| Action | UI Label | State Changes |
|--------|----------|---------------|
| Edit | "Edit" | Opens modal to set status, priority, assignee, or group on all selected tickets at once. Dispatches `BULK_UPDATE_TICKETS`; clears `ui.selectedTicketIds` |
| Merge | "Merge" | Opens modal to select a target ticket. Source tickets are closed (`status: "closed"`) and an internal comment is added to each source (`"This ticket was merged into #<targetId>."`). An internal comment is added to the target (`"Merged tickets #<id>, ... into this ticket."`). Dispatches `ADD_COMMENT` + `UPDATE_TICKET` per source ticket + `DESELECT_ALL_TICKETS`. Navigates to target ticket |
| Mark as spam | "Mark as spam" | For each selected ticket: adds the tag `"spam"` (if not already present) and sets `status: "solved"`. Dispatches `UPDATE_TICKET` per ticket + `DESELECT_ALL_TICKETS` |
| Delete | "Delete" | Permanently deletes all selected tickets. Dispatches `DELETE_TICKET` per ticket (which also removes from tabs and selection). Requires confirmation |

---

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Assign ticket to agent | `tickets[i].assignee_id` updated; `tickets[i].updated_at` refreshed |
| Change ticket status | `tickets[i].status` updated; `tickets[i].updated_at` refreshed |
| Change ticket priority | `tickets[i].priority` updated; `tickets[i].updated_at` refreshed |
| Change ticket type | `tickets[i].type` updated; `tickets[i].updated_at` refreshed |
| Change ticket group | `tickets[i].group_id` updated; `tickets[i].updated_at` refreshed |
| Add tag to ticket | `tickets[i].tags` array grows; `tickets[i].updated_at` refreshed |
| Remove tag from ticket | `tickets[i].tags` array shrinks; `tickets[i].updated_at` refreshed |
| Add follower to ticket | `tickets[i].follower_ids` array grows |
| Remove follower from ticket | `tickets[i].follower_ids` array shrinks |
| Submit public reply | `comments[ticketId]` grows by 1 (`public: true`); `tickets[i].comment_count` incremented; `tickets[i].updated_at` refreshed; `tickets[i].status` may change |
| Submit internal note | `comments[ticketId]` grows by 1 (`public: false`); `tickets[i].comment_count` incremented; `tickets[i].updated_at` refreshed; `tickets[i].status` may change |
| Create new ticket | `tickets[]` grows by 1; `comments[newTicketId]` initialized; `ui.openTicketTabs` grows; `ui.activeTicketId` set |
| Delete ticket | `tickets[]` shrinks; ticket removed from `ui.openTicketTabs`, `ui.activeTicketId` cleared if matched, removed from `ui.selectedTicketIds` |
| Apply macro to ticket | `tickets[i]` fields updated per macro actions; `comments[ticketId]` may grow if macro includes `comment_value` |
| Open ticket tab | `ui.openTicketTabs` grows (idempotent); `ui.activeTicketId` set to ticket ID |
| Close ticket tab | `ui.openTicketTabs` shrinks; `ui.activeTicketId` changes to last remaining tab or null |
| Switch active ticket tab | `ui.activeTicketId` changes |
| Switch view | `ui.activeView` changes to new view ID |
| Search | `ui.searchQuery` updated |
| Select ticket (checkbox) | `ui.selectedTicketIds` grows |
| Deselect ticket | `ui.selectedTicketIds` shrinks |
| Select all tickets in view | `ui.selectedTicketIds` set to all visible ticket IDs |
| Bulk edit tickets | Multiple `tickets[i]` updated with same changes; `ui.selectedTicketIds` cleared |
| Bulk merge tickets | Source tickets `status` set to `"closed"`; internal comments added to source and target; `ui.selectedTicketIds` cleared; `ui.activeTicketId` set to target; target's `comment_count` incremented |
| Bulk mark as spam | Selected tickets get `"spam"` tag added and `status` set to `"solved"`; `ui.selectedTicketIds` cleared |
| Bulk delete tickets | Selected tickets removed from `tickets[]`; `ui.selectedTicketIds` cleared; affected tabs cleaned up |
| Edit organization notes | `organizations[i].notes` updated; `organizations[i].updated_at` refreshed |
| Edit user phone/timezone/notes | `users[i].phone` / `users[i].time_zone` / `users[i].notes` updated; `users[i].updated_at` refreshed |

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Home dashboard with summary stats and recent activity |
| `/views/:viewId` | ViewsPage | Ticket list filtered and sorted by selected view; supports bulk actions |
| `/tickets/new` | NewTicket | New ticket creation form |
| `/tickets/:ticketId` | TicketDetail | Full ticket view: conversation thread, properties panel, macro application, SLA indicator |
| `/customers` | CustomersPage | Paginated list of all end-user customers |
| `/customers/:userId` | CustomerDetail | Customer profile with inline-editable `phone`, `time_zone`, `notes`; ticket history |
| `/organizations` | OrganizationsPage | List of all organizations |
| `/organizations/:orgId` | OrganizationDetail | Organization profile with inline-editable `notes`; member list; ticket history |
| `/reporting` | ReportingPage | Charts and agent leaderboard (read-only, no state mutations) |
| `/search` | SearchPage | Tabbed search results for tickets, customers, and organizations (query param `?q=`) |
| `/go` | Go | State inspection endpoint (JSON: `initial_state`, `current_state`, `state_diff`) |
| `/*` | Redirect | Any unmatched path redirects to `/` |

All routes preserve the `sid` query parameter automatically.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus the header search input |
| `n` | Navigate to `/tickets/new` |
| `?` | Toggle keyboard shortcuts modal |
| `j` | Move keyboard focus down one row in ticket list |
| `k` | Move keyboard focus up one row in ticket list |
| `Enter` | Open the keyboard-focused ticket row |
| `Escape` | Close any open modal or shortcuts overlay |

Shortcuts are disabled when focus is inside an `INPUT`, `TEXTAREA`, `SELECT`, or a `contentEditable` element.

---

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": 1, "name": "Sarah Chen", "email": "sarah.chen@company.com",
      "role": "agent", "phone": "+1-555-0101", "photo": null,
      "organization_id": null, "group_id": 1,
      "time_zone": "America/New_York", "locale": "en-US",
      "signature": "Best regards,\nSarah Chen", "notes": "",
      "suspended": false, "verified": true, "active": true,
      "created_at": "2023-06-15T10:00:00Z", "updated_at": "2025-01-01T00:00:00Z",
      "last_login_at": "2025-01-01T00:00:00Z", "initials": "SC"
    },
    "users": [
      {
        "id": 1, "name": "Sarah Chen", "email": "sarah.chen@company.com",
        "role": "agent", "phone": "+1-555-0101", "photo": null,
        "organization_id": null, "group_id": 1,
        "time_zone": "America/New_York", "locale": "en-US",
        "signature": "Best regards,\nSarah Chen", "notes": "",
        "suspended": false, "verified": true, "active": true,
        "created_at": "2023-06-15T10:00:00Z", "updated_at": "2025-01-01T00:00:00Z",
        "last_login_at": "2025-01-01T00:00:00Z", "initials": "SC"
      },
      {
        "id": 101, "name": "Alex Thompson", "email": "alex.t@acmecorp.com",
        "role": "end-user", "phone": "+1-555-1001", "photo": null,
        "organization_id": 1, "group_id": null,
        "time_zone": "America/New_York", "locale": "en-US",
        "signature": "", "notes": "VIP customer",
        "suspended": false, "verified": true, "active": true,
        "created_at": "2024-03-10T10:00:00Z", "updated_at": "2025-01-01T00:00:00Z",
        "last_login_at": "2025-01-01T00:00:00Z", "initials": "AT"
      }
    ],
    "organizations": [
      {
        "id": 1, "name": "Acme Corp", "domain_names": ["acmecorp.com"],
        "details": "Enterprise customer", "notes": "",
        "group_id": 1, "shared_tickets": false, "shared_comments": false,
        "tags": ["enterprise"], "created_at": "2023-01-15T00:00:00Z", "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "groups": [
      {
        "id": 1, "name": "Tier 1 Support", "description": "Front-line support",
        "default": true, "created_at": "2023-01-01T00:00:00Z", "updated_at": "2024-06-01T00:00:00Z"
      }
    ],
    "tickets": [
      {
        "id": 2001, "subject": "Cannot access dashboard",
        "description": "Getting a 403 error when trying to access the main dashboard.",
        "status": "new", "type": "problem", "priority": "high",
        "requester_id": 101, "submitter_id": 101, "assignee_id": null,
        "group_id": 1, "organization_id": 1,
        "collaborator_ids": [], "follower_ids": [],
        "tags": ["access", "dashboard"],
        "via": {"channel": "email"},
        "satisfaction_rating": null, "due_at": null, "is_public": true, "custom_fields": [],
        "created_at": "2025-01-01T10:00:00Z", "updated_at": "2025-01-01T10:00:00Z",
        "comment_count": 1,
        "sla": {"first_reply_at": null, "next_reply_due": "2025-01-01T14:00:00Z", "breached": false}
      }
    ],
    "comments": {
      "2001": [
        {
          "id": 9001, "ticket_id": 2001, "author_id": 101,
          "body": "Getting a 403 error when trying to access the main dashboard.",
          "html_body": "<p>Getting a 403 error when trying to access the main dashboard.</p>",
          "public": true, "type": "Comment", "attachments": [],
          "created_at": "2025-01-01T10:00:00Z"
        }
      ]
    },
    "views": [
      {
        "id": 1, "title": "Your unsolved tickets",
        "description": "Tickets assigned to you that are not yet solved",
        "active": true, "position": 0, "type": "standard",
        "conditions": {
          "all": [
            {"field": "assignee_id", "operator": "is", "value": "current_user"},
            {"field": "status", "operator": "less_than", "value": "solved"}
          ],
          "any": []
        }
      },
      {
        "id": 2, "title": "Unassigned tickets",
        "description": "Tickets with no assignee",
        "active": true, "position": 1, "type": "standard",
        "conditions": {
          "all": [
            {"field": "assignee_id", "operator": "is", "value": null},
            {"field": "status", "operator": "less_than", "value": "solved"}
          ],
          "any": []
        }
      }
    ],
    "macros": [
      {
        "id": 1, "title": "Close and redirect to FAQ",
        "description": "Closes ticket and sends FAQ link",
        "active": true, "position": 0,
        "actions": [
          {"field": "status", "value": "solved"},
          {"field": "comment_mode", "value": "public"},
          {"field": "comment_value", "value": "This is covered in our FAQ."}
        ],
        "restriction": null
      }
    ],
    "tags": ["access", "dashboard", "login", "billing", "api", "bug"],
    "ui": {
      "activeView": 1,
      "openTicketTabs": [],
      "activeTicketId": null,
      "searchQuery": "",
      "selectedTicketIds": [],
      "replyMode": "public",
      "sidebarCollapsed": false
    }
  }
}
```

To inject via HTTP:

```bash
curl -X POST "http://172.17.46.46:8060/post?sid=task001" \
  -H "Content-Type: application/json" \
  -d '{"action":"set","state":{...}}'
```
