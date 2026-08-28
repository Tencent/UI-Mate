# Xinear Mock -- Data Model

> This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Types

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID (e.g., `"u1"`) |
| name | string | yes | Display name |
| email | string | yes | Email address |
| avatarUrl | string | yes | Avatar URL (use `https://i.pravatar.cc/150?u=<id>`) |
| displayName | string | yes | Short display name (first name or handle) |
| role | string | yes | Role in workspace: `"Admin"`, `"Member"`, `"Guest"` |
| active | boolean | yes | Whether user is active |

**Current user**: `u1` ("Alex Morgan") -- the app is pre-logged-in as this user.

**Example:**
```json
{
  "id": "u1",
  "name": "Alex Morgan",
  "email": "alex@acmecorp.com",
  "avatarUrl": "https://i.pravatar.cc/150?u=u1",
  "displayName": "Alex",
  "role": "Admin",
  "active": true
}
```

**Seed data** -- 6 users:
| id | name | email | role |
|----|------|-------|------|
| u1 | Alex Morgan | alex@acmecorp.com | Admin |
| u2 | Jamie Chen | jamie@acmecorp.com | Member |
| u3 | Sam Patel | sam@acmecorp.com | Member |
| u4 | Taylor Kim | taylor@acmecorp.com | Member |
| u5 | Jordan Lee | jordan@acmecorp.com | Member |
| u6 | Riley Zhang | riley@acmecorp.com | Guest |

---

### Workspace

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | Workspace name |
| urlKey | string | yes | URL slug (e.g., `"acme"`) |

**Seed data** -- 1 workspace:
```json
{ "id": "w1", "name": "Acme Corp", "urlKey": "acme" }
```

---

### Team

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | Team name (e.g., `"Engineering"`) |
| key | string | yes | Short uppercase key (e.g., `"ENG"`) used in issue identifiers |
| icon | string | yes | Emoji or icon identifier |
| color | string | yes | Team accent color hex (e.g., `"#5e6ad2"`) |
| memberIds | string[] | yes | Array of user IDs in this team |
| workflowStates | WorkflowState[] | yes | Ordered list of workflow states for this team |
| triageEnabled | boolean | yes | Whether triage is enabled for this team |
| cycleEnabled | boolean | yes | Whether cycles are enabled |
| cycleDuration | number | yes | Default cycle duration in weeks (typically 1 or 2) |
| activeCycleId | string or null | yes | ID of currently active cycle |

**Seed data** -- 2 teams:

1. **Engineering** (`ENG`): members u1, u2, u3, u4; color `#5e6ad2`; triage enabled; cycles enabled (2-week)
2. **Design** (`DES`): members u1, u4, u5; color `#e5484d`; triage disabled; cycles enabled (1-week)

---

### WorkflowState

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | Status name |
| category | string | yes | One of: `"triage"`, `"backlog"`, `"unstarted"`, `"started"`, `"completed"`, `"canceled"` |
| color | string | yes | Status color hex |
| position | number | yes | Sort order within category |
| teamId | string | yes | Parent team ID |

**Default workflow states per team** (use these for both teams, with unique IDs per team):

| Category | Name | Color | Icon hint |
|----------|------|-------|-----------|
| triage | Triage | `#8a8f98` | Dotted circle |
| backlog | Backlog | `#8a8f98` | Dashed circle |
| unstarted | Todo | `#e2e2e3` | Empty circle |
| started | In Progress | `#f2c94c` | Half-filled circle (yellow) |
| started | In Review | `#5e6ad2` | Three-quarter circle (indigo) |
| completed | Done | `#27a644` | Filled circle with check (green) |
| canceled | Canceled | `#8a8f98` | Crossed circle |

---

### Issue (Central Entity)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID (e.g., `"i1"`) |
| identifier | string | yes | Human-readable key: `"{TEAM_KEY}-{number}"` (e.g., `"ENG-42"`) |
| number | number | yes | Auto-incrementing number within team |
| title | string | yes | Issue title (1 line) |
| description | string | no | Rich text description (markdown) |
| stateId | string | yes | Workflow state ID (references WorkflowState.id) |
| priority | number | yes | 0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low |
| estimate | number or null | no | Point estimate: null, 0, 1, 2, 3, 5, 8, 13, 21 |
| assigneeId | string or null | yes | User ID or null |
| creatorId | string | yes | User ID who created the issue |
| teamId | string | yes | Team this issue belongs to |
| projectId | string or null | no | Project ID or null |
| cycleId | string or null | no | Cycle ID or null |
| labelIds | string[] | yes | Array of Label IDs |
| parentId | string or null | no | Parent issue ID (for sub-issues) |
| dueDate | string or null | no | ISO date string or null |
| subscriberIds | string[] | yes | User IDs subscribed to this issue |
| relationIds | IssueRelation[] | yes | Array of issue relation objects |
| createdAt | string | yes | ISO timestamp |
| updatedAt | string | yes | ISO timestamp |
| completedAt | string or null | no | ISO timestamp when moved to completed/canceled |
| sortOrder | number | yes | Manual sort position (lower = higher in list) |

**Priority mapping:**
- 0 = No priority (gray dash icon)
- 1 = Urgent (red exclamation in filled circle)
- 2 = High (orange up-pointing bars, 3 bars)
- 3 = Medium (yellow bars, 2 bars)
- 4 = Low (blue down-pointing bars, 1 bar)

**Example:**
```json
{
  "id": "i1",
  "identifier": "ENG-1",
  "number": 1,
  "title": "Set up CI/CD pipeline for staging environment",
  "description": "Configure GitHub Actions to deploy to staging on merge to develop branch.\n\n**Acceptance Criteria:**\n- Pipeline triggers on push to develop\n- Runs tests before deploy\n- Sends Slack notification on failure",
  "stateId": "ws_eng_in_progress",
  "priority": 2,
  "estimate": 5,
  "assigneeId": "u3",
  "creatorId": "u1",
  "teamId": "t1",
  "projectId": "p1",
  "cycleId": "c1",
  "labelIds": ["l1", "l3"],
  "parentId": null,
  "dueDate": "2026-04-18",
  "subscriberIds": ["u1", "u3"],
  "relationIds": [],
  "createdAt": "2026-03-28T10:00:00Z",
  "updatedAt": "2026-04-09T14:30:00Z",
  "completedAt": null,
  "sortOrder": 100
}
```

**Seed data** -- 30 issues across both teams. See section "Seed Data Specifications" below.

---

### IssueRelation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| issueId | string | yes | Source issue ID |
| relatedIssueId | string | yes | Target issue ID |
| type | string | yes | `"blocks"`, `"blocked_by"`, `"relates_to"`, `"duplicate"` |

---

### Label

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | Label text (e.g., `"Bug"`, `"Feature"`) |
| color | string | yes | Color hex |
| teamId | string or null | no | If team-scoped, the team ID; null for workspace labels |

**Seed labels:**
| id | name | color | teamId |
|----|------|-------|--------|
| l1 | Bug | `#eb5757` | null |
| l2 | Feature | `#5e6ad2` | null |
| l3 | Improvement | `#27a644` | null |
| l4 | Design | `#f2994a` | null |
| l5 | Documentation | `#8a8f98` | null |
| l6 | Performance | `#bb6bd9` | null |
| l7 | Security | `#e5484d` | null |
| l8 | Infrastructure | `#56b4be` | null |

---

### Project

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | Project name |
| description | string | no | Project description |
| icon | string | yes | Emoji icon |
| color | string | yes | Project color hex |
| status | string | yes | `"backlog"`, `"planned"`, `"started"`, `"paused"`, `"completed"`, `"canceled"` |
| health | string or null | no | `"onTrack"`, `"atRisk"`, `"offTrack"`, or null |
| leadId | string or null | no | User ID of project lead |
| memberIds | string[] | yes | User IDs involved in this project |
| teamIds | string[] | yes | Team IDs this project spans |
| targetDate | string or null | no | ISO date for target completion |
| startDate | string or null | no | ISO date for planned start |
| progress | number | yes | 0-100 calculated from completed vs total issues |
| createdAt | string | yes | ISO timestamp |
| updatedAt | string | yes | ISO timestamp |

**Seed data** -- 3 projects:

1. **Website Redesign** (`p1`): status "started", health "onTrack", lead u1, 65% progress, color `#5e6ad2`
2. **API v2 Migration** (`p2`): status "started", health "atRisk", lead u2, 30% progress, color `#f2994a`
3. **Mobile App Launch** (`p3`): status "planned", health null, lead u4, 0% progress, color `#27a644`

---

### Cycle

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| number | number | yes | Cycle number within team |
| name | string | yes | Display name (e.g., `"Cycle 5"`) |
| teamId | string | yes | Parent team ID |
| startsAt | string | yes | ISO date for cycle start |
| endsAt | string | yes | ISO date for cycle end |
| isActive | boolean | yes | Whether this is the current active cycle |
| isCompleted | boolean | yes | Whether cycle has been completed |
| progress | number | yes | 0-100, calculated from completed issue count |

**Seed data** -- 4 cycles (3 for Engineering, 1 for Design):

| id | number | name | teamId | startsAt | endsAt | isActive | isCompleted |
|----|--------|------|--------|----------|--------|----------|-------------|
| c1 | 5 | Cycle 5 | t1 | 2026-03-31 | 2026-04-13 | true | false |
| c2 | 4 | Cycle 4 | t1 | 2026-03-17 | 2026-03-30 | false | true |
| c3 | 6 | Cycle 6 | t1 | 2026-04-14 | 2026-04-27 | false | false |
| c4 | 3 | Cycle 3 | t2 | 2026-04-07 | 2026-04-13 | true | false |

---

### Notification (Inbox Item)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| type | string | yes | `"issue_assigned"`, `"issue_mention"`, `"issue_status_changed"`, `"comment"`, `"project_update"` |
| actorId | string | yes | User ID who triggered the notification |
| issueId | string or null | no | Related issue ID |
| projectId | string or null | no | Related project ID |
| title | string | yes | Short notification text |
| body | string | no | Extended detail text |
| isRead | boolean | yes | Whether user has read this |
| isSnoozed | boolean | yes | Whether user has snoozed this |
| isArchived | boolean | yes | Whether user has archived this |
| createdAt | string | yes | ISO timestamp |

**Seed data** -- 10 notifications for u1 (the current user):
- 4 unread, 6 read
- Mix of types: 3 issue_assigned, 2 comment, 2 issue_status_changed, 2 issue_mention, 1 project_update
- Timestamps spread across last 3 days

---

### Comment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| body | string | yes | Comment text (markdown) |
| issueId | string | yes | Parent issue ID |
| userId | string | yes | Author user ID |
| createdAt | string | yes | ISO timestamp |
| updatedAt | string | yes | ISO timestamp |
| parentId | string or null | no | Parent comment ID for threading |

**Seed data**: 15-20 comments spread across 8-10 issues, 2-3 threaded replies.

---

### View (Custom View)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| name | string | yes | View name |
| icon | string | no | Emoji or icon |
| filters | object | yes | Filter configuration (see below) |
| groupBy | string | no | `"status"`, `"priority"`, `"assignee"`, `"project"`, `"label"` |
| sortBy | string | no | `"priority"`, `"created"`, `"updated"`, `"status"`, `"manual"` |
| layout | string | yes | `"list"` or `"board"` |
| teamId | string or null | no | Team-scoped or null for workspace |
| creatorId | string | yes | User who created this view |

**Seed views** -- 2 custom views:
1. "High Priority Bugs" -- filters: priority in [1,2], labelIds includes l1; groupBy status; layout list
2. "My In Progress" -- filters: assigneeId = currentUser, stateCategory = "started"; layout list

---

### Favorite

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique ID |
| type | string | yes | `"project"`, `"view"`, `"cycle"`, `"issue"` |
| targetId | string | yes | ID of the favorited entity |
| userId | string | yes | User who favorited |
| sortOrder | number | yes | Display order |

**Seed**: 3 favorites for u1: project p1, custom view v1, cycle c1.

---

## Relationships Diagram

```
Workspace
  |-- Teams
  |     |-- WorkflowStates
  |     |-- Issues
  |     |     |-- Comments
  |     |     |-- IssueRelations
  |     |     |-- Sub-issues (parentId)
  |     |-- Cycles
  |     |-- Labels (team-scoped)
  |
  |-- Projects (cross-team)
  |     |-- Issues (via projectId)
  |
  |-- Users
  |     |-- Notifications
  |     |-- Favorites
  |
  |-- Views (custom filtered lists)
  |-- Labels (workspace-scoped)
```

---

## Seed Data Specifications

### Engineering Team Issues (ENG-1 through ENG-22)

**Active Cycle (c1) issues -- 10 issues:**

| id | identifier | title | stateId | priority | estimate | assigneeId | projectId | labelIds |
|----|-----------|-------|---------|----------|----------|------------|-----------|----------|
| i1 | ENG-1 | Set up CI/CD pipeline for staging | in_progress | 2 | 5 | u3 | p2 | [l8] |
| i2 | ENG-2 | Fix authentication token refresh race condition | in_progress | 1 | 3 | u1 | p2 | [l1, l7] |
| i3 | ENG-3 | Implement user avatar upload endpoint | todo | 3 | 3 | u2 | p1 | [l2] |
| i4 | ENG-4 | Update API error response format to RFC 7807 | todo | 3 | 2 | u4 | p2 | [l3] |
| i5 | ENG-5 | Add rate limiting to public API endpoints | todo | 2 | 5 | u3 | p2 | [l7, l8] |
| i6 | ENG-6 | Refactor database connection pooling | in_review | 2 | 8 | u1 | p2 | [l6, l8] |
| i7 | ENG-7 | Write integration tests for payment flow | in_progress | 2 | 5 | u2 | p1 | [l5] |
| i8 | ENG-8 | Fix mobile viewport breakpoint inconsistencies | done | 3 | 2 | u4 | p1 | [l1] |
| i9 | ENG-9 | Add dark mode support to settings page | done | 4 | 3 | u1 | p1 | [l2, l4] |
| i10 | ENG-10 | Optimize image lazy loading performance | in_progress | 3 | 3 | u3 | p1 | [l6] |

**Backlog issues -- 7 issues (no cycleId):**

| id | identifier | title | stateId | priority | estimate | assigneeId | projectId | labelIds |
|----|-----------|-------|---------|----------|----------|------------|-----------|----------|
| i11 | ENG-11 | Implement WebSocket reconnection logic | backlog | 2 | 5 | null | p2 | [l2, l8] |
| i12 | ENG-12 | Add CSV export for analytics dashboard | backlog | 4 | 3 | null | p1 | [l2] |
| i13 | ENG-13 | Migrate user preferences to new schema | backlog | 3 | 5 | u2 | p2 | [l3] |
| i14 | ENG-14 | Create API documentation with OpenAPI spec | backlog | 3 | 8 | null | p2 | [l5] |
| i15 | ENG-15 | Fix memory leak in real-time notification service | backlog | 1 | 5 | u3 | null | [l1, l6] |
| i16 | ENG-16 | Add end-to-end encryption for file uploads | backlog | 2 | 13 | null | null | [l7] |
| i17 | ENG-17 | Set up error monitoring with Sentry integration | backlog | 3 | 3 | null | p2 | [l8] |

**Completed Cycle (c2) issues -- 5 issues (all done/canceled):**

| id | identifier | title | stateId | priority | assigneeId | projectId |
|----|-----------|-------|---------|----------|------------|-----------|
| i18 | ENG-18 | Design new landing page layout | done | 2 | u4 | p1 |
| i19 | ENG-19 | Implement search indexing service | done | 1 | u1 | p2 |
| i20 | ENG-20 | Fix pagination cursor bug in API | done | 2 | u2 | p2 |
| i21 | ENG-21 | Add request logging middleware | done | 3 | u3 | p2 |
| i22 | ENG-22 | Remove deprecated v1 API routes | canceled | 4 | u1 | p2 |

### Design Team Issues (DES-1 through DES-8)

**Active Cycle (c4) issues -- 5 issues:**

| id | identifier | title | stateId | priority | estimate | assigneeId | projectId |
|----|-----------|-------|---------|----------|----------|------------|-----------|
| i23 | DES-1 | Design onboarding flow mockups | in_progress | 2 | 5 | u5 | p1 |
| i24 | DES-2 | Create component library documentation | todo | 3 | 3 | u4 | p1 |
| i25 | DES-3 | Redesign notification center UI | in_progress | 2 | 5 | u5 | p1 |
| i26 | DES-4 | Audit accessibility compliance (WCAG 2.1) | todo | 1 | 8 | u1 | p1 |
| i27 | DES-5 | Design mobile app icon and splash screen | done | 3 | 2 | u4 | p3 |

**Backlog issues -- 3 issues:**

| id | identifier | title | stateId | priority | assigneeId | projectId |
|----|-----------|-------|---------|----------|------------|-----------|
| i28 | DES-6 | Create illustration set for empty states | backlog | 4 | null | p1 |
| i29 | DES-7 | Design dark mode color palette variants | backlog | 3 | u5 | p1 |
| i30 | DES-8 | Prototype interactive data visualization | backlog | 3 | null | p3 |

### Sub-issues

- i3 (ENG-3) has 2 sub-issues:
  - i31 (ENG-23): "Design avatar upload UI component" -- todo, assigned u4, estimate 2
  - i32 (ENG-24): "Implement S3 upload service" -- in_progress, assigned u2, estimate 3

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUserId: "u1",
    workspace: { /* single workspace object */ },
    users: [ /* 6 user objects */ ],
    teams: [ /* 2 team objects, each with workflowStates array */ ],
    issues: [ /* 32 issue objects */ ],
    labels: [ /* 8 label objects */ ],
    projects: [ /* 3 project objects */ ],
    cycles: [ /* 4 cycle objects */ ],
    comments: [ /* 15-20 comment objects */ ],
    notifications: [ /* 10 notification objects */ ],
    views: [ /* 2 custom view objects */ ],
    favorites: [ /* 3 favorite objects */ ],
    issueRelations: [ /* 3-4 relation objects */ ],
    // Counters for auto-increment
    issueCounters: { "t1": 24, "t2": 8 }
  };
}
```
