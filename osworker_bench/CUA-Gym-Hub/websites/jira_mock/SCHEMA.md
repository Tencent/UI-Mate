# jira_mock Schema

**Deploy order**: 29 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8029)
**Base URL**: `http://172.17.46.46:8029/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Merge**: `POST /post?sid=<sid>` with body `{"action":"set","merge":true,"state":{...}}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `users` | `User[]` | All team members. Default: u1 (Admin), u2 (Jane), u3 (John), u4 (Sarah) |
| `projects` | `Project[]` | Projects. Default: p1 (KAN / Kanban Project), p2 (SCRUM / Scrum Alpha) |
| `issues` | `Issue[]` | All issues (Stories, Tasks, Bugs, Epics). 25 defaults (i1–i25) |
| `sprints` | `Sprint[]` | Sprints. Default: s1 (active), s2 (future), s3 (closed) |
| `comments` | `Comment[]` | Issue comments. 18 defaults (c1–c18) |
| `workflows` | `Workflow[]` | Status transition rules. Default: w1 (Software Workflow) |
| `notifications` | `Notification[]` | Per-user notifications. 8 defaults (n1–n8; n1–n3 unread) |
| `currentUser` | `User` | Logged-in user object. Default: u1 (Admin User) |

### User fields
`{ id, name, email, avatar }`

### Project fields
`{ id, key, name, leadId, category, icon, description? }`
- `description` is optional; editable from the Settings page

### Issue fields
`{ id, key, projectId, summary, description, type, status, priority, storyPoints, reporterId, assigneeId, sprintId, epicId, createdAt, updatedAt, labels[], subtasks[], linkedIssueIds[] }`
- `type`: `"Story" | "Task" | "Bug" | "Epic"`
- `status`: `"To Do" | "In Progress" | "In Review" | "Done"`
- `priority`: `"Highest" | "High" | "Medium" | "Low" | "Lowest"`
- `subtask`: `{ id, title, completed }`

### Sprint fields
`{ id, projectId, name, goal, startDate, endDate, state }` — `state`: `"active" | "future" | "closed"`

### Comment fields
`{ id, issueId, userId, content, createdAt }`

### Notification fields
`{ id, type, issueId, actorId, message, read, createdAt }` — `type`: `"comment" | "status_change" | "assignment" | "mention"`

## Reducer Actions

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `SET_STATE` | `AppState` | Replace entire state |
| `ADD_ISSUE` | `Issue` | Append new issue to `issues[]` |
| `UPDATE_ISSUE` | `Issue` | Replace issue with matching `id` |
| `DELETE_ISSUE` | `string` (issue id) | Remove issue from `issues[]` |
| `ADD_SPRINT` | `Sprint` | Append new sprint to `sprints[]` |
| `UPDATE_SPRINT` | `Sprint` | Replace sprint with matching `id` |
| `ADD_COMMENT` | `Comment` | Append new comment to `comments[]` |
| `DELETE_COMMENT` | `string` (comment id) | Remove comment from `comments[]` |
| `UPDATE_PROJECT` | `Project` | Replace project with matching `id` in `projects[]` |
| `SET_CURRENT_USER` | `User` | Set `currentUser` |
| `ADD_NOTIFICATION` | `Notification` | Prepend notification to `notifications[]` |
| `MARK_NOTIFICATION_READ` | `string` (notification id) | Set `read: true` on matching notification |
| `MARK_ALL_NOTIFICATIONS_READ` | — | Set `read: true` on all notifications |
| `RESET_STATE` | — | Restore `INITIAL_STATE` |

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard` | System dashboard with charts and "Assigned to Me" widget |
| `/project/:key/board` | `Board` | Kanban board for the active sprint |
| `/project/:key/backlog` | `Backlog` | Backlog list with sprint management |
| `/project/:key/reports` | `Reports` | Burndown, velocity, and sprint report charts |
| `/project/:key/settings` | `Settings` | Project settings (Details tab and Board tab) |
| `/search` | `AdvancedSearch` | Full-text + filter-based issue search table |
| `/go` | `StateInspector` | JSON state inspector (initial, current, diff) |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8029/",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "currentUser": {"id": "u1", "name": "Admin User", "email": "admin@example.com", "avatar": "https://picsum.photos/100/100?random=u1"},
        "users": [
          {"id": "u1", "name": "Admin User", "email": "admin@example.com", "avatar": "https://picsum.photos/100/100?random=u1"},
          {"id": "u2", "name": "Jane Doe", "email": "jane@example.com", "avatar": "https://picsum.photos/100/100?random=u2"}
        ],
        "projects": [
          {"id": "p1", "key": "KAN", "name": "Kanban Project", "leadId": "u1", "category": "Software", "icon": "https://picsum.photos/64/64?random=p1", "description": ""}
        ],
        "sprints": [
          {"id": "s1", "projectId": "p1", "name": "Sprint 1", "goal": "Setup core infrastructure", "startDate": "2026-02-23T12:00:00.000Z", "endDate": "2026-03-09T12:00:00.000Z", "state": "active"}
        ],
        "issues": [
          {"id": "i1", "key": "KAN-1", "projectId": "p1", "summary": "Set up CI/CD pipeline", "description": "", "type": "Story", "status": "To Do", "priority": "High", "storyPoints": 5, "reporterId": "u1", "assigneeId": "u2", "sprintId": "s1", "epicId": null, "labels": [], "subtasks": [], "linkedIssueIds": [], "createdAt": "2026-02-28T12:00:00.000Z", "updatedAt": "2026-02-28T12:00:00.000Z"}
        ],
        "comments": [],
        "workflows": [{"id": "w1", "name": "Software Workflow", "transitions": [{"from": "To Do", "to": ["In Progress"]}, {"from": "In Progress", "to": ["In Review", "To Do", "Done"]}, {"from": "In Review", "to": ["Done", "In Progress"]}, {"from": "Done", "to": ["In Progress", "To Do"]}]}],
        "notifications": []
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Change issue status (e.g., To Do → In Progress) | `issues[*].status`, `issues[*].updatedAt` |
| Assign issue to user | `issues[*].assigneeId`, `issues[*].updatedAt` |
| Change issue priority | `issues[*].priority`, `issues[*].updatedAt` |
| Add comment | `comments` (new entry appended) |
| Delete comment (own comment only) | `comments` (entry removed) |
| Mark subtask complete | `issues[*].subtasks[*].completed` |
| Mark notification as read | `notifications[*].read` |
| Mark all notifications as read | `notifications[*].read` (all set to true) |
| Update issue summary/description | `issues[*].summary`, `issues[*].description`, `issues[*].updatedAt` |
| Add label to issue | `issues[*].labels`, `issues[*].updatedAt` |
| Remove label from issue | `issues[*].labels`, `issues[*].updatedAt` |
| Add linked issue | `issues[*].linkedIssueIds`, `issues[*].updatedAt` |
| Move issue to sprint (or backlog) | `issues[*].sprintId`, `issues[*].updatedAt` |
| Create new issue (via Create modal) | `issues` (new entry appended) |
| Delete issue (via IssueModal delete button, confirmed) | `issues` (entry removed) |
| Update sprint name (inline edit) | `sprints[*].name` |
| Start sprint | `sprints[*].state` → `"active"`, `sprints[*].startDate` |
| Complete sprint (confirmed) | `sprints[*].state` → `"closed"`, `sprints[*].endDate`; incomplete issues have `issues[*].sprintId` set to `null` |
| Create new sprint | `sprints` (new entry appended) |
| Bulk edit issues | `issues[*].*` for all selected issues |
| Update project settings (name, lead, category, description) | `projects[*].name`, `projects[*].leadId`, `projects[*].category`, `projects[*].description` |
| Drag-and-drop issue on board | `issues[*].status`, `issues[*].updatedAt` |
| Drag-and-drop issue in backlog | `issues[*].sprintId`, `issues[*].updatedAt` |
| Edit story points inline (backlog) | `issues[*].storyPoints`, `issues[*].updatedAt` |
| Edit issue summary inline (backlog) | `issues[*].summary`, `issues[*].updatedAt` |

## UI Behaviors

- **Issue deletion**: Clicking the trash icon in the IssueModal header opens a `ConfirmDialog`. Confirming dispatches `DELETE_ISSUE` and closes the modal.
- **Sprint completion**: Clicking "Complete Sprint" in the Backlog opens a `ConfirmDialog`. Confirming moves all incomplete sprint issues to the backlog and marks the sprint as closed.
- **Comment deletion**: Hovering over a comment you authored reveals a trash icon. Clicking dispatches `DELETE_COMMENT`.
- **Dashboard "Assigned to Me"**: Clicking an issue row opens the IssueModal for that issue.
- **Board drag-and-drop**: Enforces workflow transitions defined in `workflows[0].transitions`. Invalid moves show an inline error banner.
- **Keyboard shortcut C**: Opens the Create Issue modal from any page (when not focused in an input).
- **Keyboard shortcut ?**: Opens the keyboard shortcuts help dialog.
