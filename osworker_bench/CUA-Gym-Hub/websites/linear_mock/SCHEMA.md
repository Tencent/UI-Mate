# linear_mock Schema

**Deploy order**: 55 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8055)
**Base URL**: `http://localhost:8055/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUserId` | string | ID of the logged-in user (always `"u1"` by default) |
| `workspace` | object | `{id, name, urlKey}` — workspace-level metadata |
| `users` | array | All workspace members; each: `{id, name, email, avatarUrl, displayName, role, active}` |
| `teams` | array | Each: `{id, name, key, icon, color, memberIds[], workflowStates[], triageEnabled, cycleEnabled, cycleDuration, activeCycleId}` |
| `issues` | array | Each: `{id, identifier, number, title, description, stateId, priority, estimate, assigneeId, creatorId, teamId, projectId, cycleId, labelIds[], parentId, dueDate, subscriberIds[], relationIds[], createdAt, updatedAt, completedAt, sortOrder}` — `priority`: 0=none,1=urgent,2=high,3=medium,4=low |
| `labels` | array | Each: `{id, name, color, teamId}` — `teamId` is null for workspace labels |
| `projects` | array | Each: `{id, name, description, icon, color, status, health, leadId, memberIds[], teamIds[], targetDate, startDate, progress, createdAt, updatedAt}` — `status`: backlog/planned/started/paused/completed/canceled; `health`: onTrack/atRisk/offTrack/null |
| `cycles` | array | Each: `{id, number, name, teamId, startsAt, endsAt, isActive, isCompleted, progress}` |
| `comments` | array | Each: `{id, body, issueId, userId, createdAt, updatedAt, parentId}` — `parentId` null for top-level, set for replies |
| `notifications` | array | Each: `{id, type, actorId, issueId, projectId, title, body, isRead, isSnoozed, isArchived, createdAt}` — `type`: issue_assigned/comment/issue_mention/issue_status_changed/project_update |
| `views` | array | Each: `{id, name, icon, filters, groupBy, sortBy, layout, teamId, creatorId}` |
| `favorites` | array | Each: `{id, type, targetId, userId, sortOrder}` — `type`: project/view/cycle |
| `issueRelations` | array | Each: `{id, issueId, relatedIssueId, type}` — `type`: blocks/blocked_by/relates_to/duplicate_of |
| `issueCounters` | object | `{teamId: nextIssueNumber}` — used to generate identifiers on new issue creation |
| `sidebarCollapsed` | boolean | UI state: whether the sidebar is collapsed to icon-only mode |
| `teamSectionsExpanded` | object | UI state: `{teamId: boolean}` — which team sections are expanded in sidebar |

### Default IDs

**Users**: `u1` (Alex Morgan, Admin, currentUser) through `u6` (Riley Zhang, Guest)

**Teams**: `t1` (Engineering, key ENG), `t2` (Design, key DES)

**Workflow State IDs** (Engineering team `t1`):
`ws_eng_triage`, `ws_eng_backlog`, `ws_eng_todo`, `ws_eng_in_progress`, `ws_eng_in_review`, `ws_eng_done`, `ws_eng_canceled`

**Workflow State IDs** (Design team `t2`):
`ws_des_triage`, `ws_des_backlog`, `ws_des_todo`, `ws_des_in_progress`, `ws_des_in_review`, `ws_des_done`, `ws_des_canceled`

**Issues**: `i1`–`i32` (ENG-1 through ENG-24 and DES-1 through DES-8)

**Projects**: `p1` (Website Redesign), `p2` (API v2 Migration), `p3` (Mobile App Launch)

**Cycles**: `c1` (ENG Cycle 5, active), `c2` (ENG Cycle 4, completed), `c3` (ENG Cycle 6, upcoming), `c4` (DES Cycle 3, active)

**Labels**: `l1` (Bug), `l2` (Feature), `l3` (Improvement), `l4` (Design), `l5` (Documentation), `l6` (Performance), `l7` (Security), `l8` (Infrastructure)

**Comments**: `cm1`–`cm17`

**Notifications**: `n1`–`n10`

**Views**: `v1` (High Priority Bugs), `v2` (My In Progress)

**Favorites**: `f1` (project p1), `f2` (view v1), `f3` (cycle c1)

**Issue Relations**: `r1`–`r4`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUserId": "u1",
    "workspace": {"id": "w1", "name": "Acme Corp", "urlKey": "acme"},
    "users": [
      {"id": "u1", "name": "Alex Morgan", "email": "alex@acmecorp.com", "avatarUrl": "https://i.pravatar.cc/150?u=u1", "displayName": "Alex", "role": "Admin", "active": true},
      {"id": "u2", "name": "Jamie Chen", "email": "jamie@acmecorp.com", "avatarUrl": "https://i.pravatar.cc/150?u=u2", "displayName": "Jamie", "role": "Member", "active": true}
    ],
    "teams": [
      {
        "id": "t1", "name": "Engineering", "key": "ENG", "icon": "⚙️", "color": "#5e6ad2",
        "memberIds": ["u1", "u2"],
        "workflowStates": [
          {"id": "ws_eng_backlog", "name": "Backlog", "category": "backlog", "color": "#8a8f98", "position": 1, "teamId": "t1"},
          {"id": "ws_eng_todo", "name": "Todo", "category": "unstarted", "color": "#e2e2e3", "position": 2, "teamId": "t1"},
          {"id": "ws_eng_in_progress", "name": "In Progress", "category": "started", "color": "#f2c94c", "position": 3, "teamId": "t1"},
          {"id": "ws_eng_done", "name": "Done", "category": "completed", "color": "#27a644", "position": 5, "teamId": "t1"}
        ],
        "triageEnabled": false, "cycleEnabled": true, "cycleDuration": 2, "activeCycleId": "c1"
      }
    ],
    "issues": [
      {
        "id": "i1", "identifier": "ENG-1", "number": 1,
        "title": "Set up CI/CD pipeline",
        "description": "", "stateId": "ws_eng_todo", "priority": 2, "estimate": 3,
        "assigneeId": "u2", "creatorId": "u1", "teamId": "t1",
        "projectId": null, "cycleId": "c1", "labelIds": [], "parentId": null,
        "dueDate": null, "subscriberIds": ["u1"], "relationIds": [],
        "createdAt": "2026-04-01T10:00:00Z", "updatedAt": "2026-04-01T10:00:00Z",
        "completedAt": null, "sortOrder": 100
      }
    ],
    "labels": [{"id": "l1", "name": "Bug", "color": "#eb5757", "teamId": null}],
    "projects": [],
    "cycles": [{"id": "c1", "number": 1, "name": "Cycle 1", "teamId": "t1", "startsAt": "2026-04-01", "endsAt": "2026-04-14", "isActive": true, "isCompleted": false, "progress": 0}],
    "comments": [],
    "notifications": [],
    "views": [],
    "favorites": [],
    "issueRelations": [],
    "issueCounters": {"t1": 1},
    "sidebarCollapsed": false,
    "teamSectionsExpanded": {"t1": true}
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create new issue (modal or sub-issue) | `issues` array grows by 1; `issueCounters[teamId]` increments by 1 |
| Update issue status (dropdown or board drag) | `issues[i].stateId` updated; `issues[i].updatedAt` updated |
| Update issue priority (dropdown) | `issues[i].priority` updated; `issues[i].updatedAt` updated |
| Update issue assignee (dropdown) | `issues[i].assigneeId` updated; `issues[i].updatedAt` updated |
| Update issue labels (detail page) | `issues[i].labelIds` array updated; `issues[i].updatedAt` updated |
| Update issue title (inline edit) | `issues[i].title` updated; `issues[i].updatedAt` updated |
| Update issue description (textarea) | `issues[i].description` updated; `issues[i].updatedAt` updated |
| Update issue estimate | `issues[i].estimate` updated; `issues[i].updatedAt` updated |
| Update issue due date | `issues[i].dueDate` updated; `issues[i].updatedAt` updated |
| Update issue project | `issues[i].projectId` updated; `issues[i].updatedAt` updated |
| Update issue cycle | `issues[i].cycleId` updated; `issues[i].updatedAt` updated |
| Delete issue | `issues` array shrinks by 1 |
| Add comment | `comments` array grows by 1 |
| Update comment | `comments[i].body` updated; `updatedAt` updated |
| Delete comment | `comments` array shrinks by 1 |
| Accept triage issue | `issues[i].stateId` → todo state id |
| Decline triage issue | `issues[i].stateId` → canceled state id |
| Drag card to board column | `issues[i].stateId` → target column's state id |
| Add issue to cycle (CycleDetail page) | `issues[i].cycleId` updated |
| Move backlog issues to cycle | `issues[i].cycleId` updated for each selected issue |
| Mark notification read (click or button) | `notifications[i].isRead` → true |
| Mark notification unread (button) | `notifications[i].isRead` → false |
| Archive notification | `notifications[i].isArchived` → true |
| Archive all notifications | all `notifications[].isArchived` → true |
| Mark all notifications read | all `notifications[].isRead` → true |
| Update workspace name | `workspace.name` updated |
| Update project status | `projects[i].status` updated; `updatedAt` updated |
| Update project health | `projects[i].health` updated; `updatedAt` updated |
| Update project lead | `projects[i].leadId` updated; `updatedAt` updated |
| Update project target/start date | `projects[i].targetDate` / `startDate` updated |
| Update project description | `projects[i].description` updated |
| Update project name | `projects[i].name` updated |
| Toggle sidebar | `sidebarCollapsed` toggled |
| Toggle team section in sidebar | `teamSectionsExpanded[teamId]` toggled |
| Toggle favorite | `favorites` array grows or shrinks by 1 |
