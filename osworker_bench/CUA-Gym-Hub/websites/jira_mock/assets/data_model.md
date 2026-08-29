# Xira Mock — Data Model

> This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Types

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID (e.g., `"u1"`) |
| name | string | ✅ | Display name (e.g., `"Admin User"`) |
| email | string | ✅ | Email address |
| avatar | string | ✅ | Avatar URL (use picsum.photos or UI Faces) |

**Example:**
```json
{ "id": "u1", "name": "Admin User", "email": "admin@example.com", "avatar": "https://picsum.photos/100/100?random=u1" }
```

### Project

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID (e.g., `"p1"`) |
| key | string | ✅ | Short uppercase key (e.g., `"KAN"`) — used in issue keys |
| name | string | ✅ | Full project name |
| leadId | string | ✅ | User ID of project lead |
| category | string | ✅ | Project category (e.g., `"Software"`, `"Marketing"`) |
| icon | string | ✅ | Project icon URL |
| description | string | ❌ | Optional project description |

**Example:**
```json
{ "id": "p1", "key": "KAN", "name": "Kanban Project", "leadId": "u1", "category": "Software", "icon": "https://picsum.photos/64/64?random=p1" }
```

### Issue (Central Entity)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID (e.g., `"i1"`) |
| key | string | ✅ | Project-scoped key (e.g., `"KAN-1"`) |
| projectId | string | ✅ | Parent project ID |
| summary | string | ✅ | Issue title/summary (1 line) |
| description | string | ✅ | Full description (supports multiline, markdown-like) |
| type | IssueType | ✅ | One of: `"Story"`, `"Task"`, `"Bug"`, `"Epic"` |
| status | IssueStatus | ✅ | One of: `"To Do"`, `"In Progress"`, `"In Review"`, `"Done"` |
| priority | Priority | ✅ | One of: `"Highest"`, `"High"`, `"Medium"`, `"Low"`, `"Lowest"` |
| storyPoints | number | ✅ | Fibonacci-ish: 0, 1, 2, 3, 5, 8, 13 |
| reporterId | string | ✅ | User ID who created the issue |
| assigneeId | string \| null | ✅ | User ID or null (unassigned) |
| sprintId | string \| null | ✅ | Sprint ID or null (in backlog) |
| epicId | string \| null | ❌ | Parent epic issue ID or null |
| labels | string[] | ✅ | Array of label strings (e.g., `["frontend", "urgent"]`) |
| subtasks | Subtask[] | ✅ | Array of subtask objects |
| linkedIssueIds | string[] | ❌ | IDs of linked issues |
| createdAt | string (ISO) | ✅ | Creation timestamp |
| updatedAt | string (ISO) | ✅ | Last update timestamp |

**Example:**
```json
{
  "id": "i1",
  "key": "KAN-1",
  "projectId": "p1",
  "summary": "Set up CI/CD pipeline for staging environment",
  "description": "Configure GitHub Actions to deploy to staging on merge to develop branch.\n\nAcceptance Criteria:\n- Pipeline triggers on push to develop\n- Runs tests before deploy\n- Sends Slack notification on failure",
  "type": "Story",
  "status": "In Progress",
  "priority": "High",
  "storyPoints": 5,
  "reporterId": "u1",
  "assigneeId": "u3",
  "sprintId": "s1",
  "epicId": "i25",
  "labels": ["devops", "infrastructure"],
  "subtasks": [
    { "id": "st1", "title": "Create workflow YAML file", "completed": true },
    { "id": "st2", "title": "Add test step", "completed": false }
  ],
  "linkedIssueIds": [],
  "createdAt": "2026-02-15T10:30:00.000Z",
  "updatedAt": "2026-02-27T14:22:00.000Z"
}
```

### Subtask (Embedded in Issue)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID |
| title | string | ✅ | Subtask description |
| completed | boolean | ✅ | Whether subtask is done |

### Sprint

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID (e.g., `"s1"`) |
| projectId | string | ✅ | Parent project ID |
| name | string | ✅ | Sprint name (e.g., `"Sprint 1"`) |
| goal | string | ✅ | Sprint goal description |
| startDate | string (ISO) | ✅ | Sprint start date |
| endDate | string (ISO) | ✅ | Sprint end date |
| state | SprintState | ✅ | One of: `"active"`, `"future"`, `"closed"` |

**State Machine:**
- `future` → `active` (Start Sprint action)
- `active` → `closed` (Complete Sprint action)
- Only ONE sprint can be `active` per project at a time

**Example:**
```json
{
  "id": "s1",
  "projectId": "p1",
  "name": "Sprint 1",
  "goal": "Setup core infrastructure and auth flow",
  "startDate": "2026-02-23T00:00:00.000Z",
  "endDate": "2026-03-09T00:00:00.000Z",
  "state": "active"
}
```

### Comment

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID |
| issueId | string | ✅ | Parent issue ID |
| userId | string | ✅ | Author user ID |
| content | string | ✅ | Comment text |
| createdAt | string (ISO) | ✅ | Creation timestamp |

**Example:**
```json
{ "id": "c1", "issueId": "i1", "userId": "u2", "content": "I've started working on the YAML config. Should have a PR ready by EOD.", "createdAt": "2026-02-26T09:15:00.000Z" }
```

### Workflow

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID |
| name | string | ✅ | Workflow name |
| transitions | WorkflowTransition[] | ✅ | Array of allowed transitions |

**WorkflowTransition:**
```typescript
{ from: IssueStatus; to: IssueStatus[] }
```

**Default Workflow Transitions:**
```
To Do       → [In Progress]
In Progress → [In Review, To Do, Done]
In Review   → [Done, In Progress]
Done        → [In Progress, To Do]  // Reopen
```

### Notification (NEW — to be added)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | Unique ID |
| type | string | ✅ | `"comment"`, `"status_change"`, `"assignment"`, `"mention"` |
| issueId | string | ✅ | Related issue ID |
| actorId | string | ✅ | User who triggered the notification |
| message | string | ✅ | Notification message text |
| read | boolean | ✅ | Whether notification has been read |
| createdAt | string (ISO) | ✅ | Timestamp |

---

## Enum Types

```typescript
type IssueType = 'Story' | 'Task' | 'Bug' | 'Epic';
type IssueStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
type SprintState = 'active' | 'future' | 'closed';
type NotificationType = 'comment' | 'status_change' | 'assignment' | 'mention';
```

---

## AppState Shape

```typescript
interface AppState {
  users: User[];
  projects: Project[];
  issues: Issue[];
  sprints: Sprint[];
  comments: Comment[];
  workflows: Workflow[];
  notifications: Notification[];
  currentUser: User;
}
```

---

## createInitialData() Structure

The `getDefaultData()` function should produce the following seed data:

### Users (4 users)
| ID | Name | Role Context |
|----|------|-------------|
| u1 | Admin User | Project lead, current logged-in user |
| u2 | Jane Doe | Developer, active contributor |
| u3 | John Smith | Developer, some issues assigned |
| u4 | Sarah Connor | QA Engineer, reports bugs |

### Projects (2 projects)
| ID | Key | Name | Lead |
|----|-----|------|------|
| p1 | KAN | Kanban Project | u1 |
| p2 | SCRUM | Scrum Alpha | u2 |

### Sprints (3 sprints for p1)
| ID | Name | State | Purpose |
|----|------|-------|---------|
| s1 | Sprint 1 | active | Current sprint with mixed-status issues |
| s2 | Sprint 2 | future | Upcoming sprint with planned issues |
| s3 | Sprint 3 | closed | Completed sprint (for velocity chart data) |

### Issues (25+ issues)
Distribute across sprints and backlog with realistic variety:

**Sprint 1 (active) — 8 issues:**
- Mix of To Do (2), In Progress (3), In Review (1), Done (2)
- Types: 3 Stories, 2 Tasks, 2 Bugs, 1 Epic
- Priorities: 1 Highest, 2 High, 3 Medium, 1 Low, 1 Lowest
- Assignees: Spread across all 4 users, 1 unassigned
- Realistic summaries: "Set up CI/CD pipeline", "Fix login page redirect bug", "Design user dashboard wireframes", etc.

**Sprint 2 (future) — 4 issues:**
- All "To Do" status
- Planned upcoming work

**Sprint 3 (closed) — 5 issues:**
- All "Done" status (for historical reporting)

**Backlog (no sprint) — 8+ issues:**
- All "To Do" status
- Mix of types and priorities
- Some with epic links, some standalone

**Issue Summaries Should Be Realistic:**
- "Set up CI/CD pipeline for staging environment"
- "Fix login page redirect loop on Safari"
- "Design user dashboard wireframes"
- "Implement search autocomplete for product catalog"
- "Update API documentation for v2 endpoints"
- "Add email notification preferences to settings"
- "Optimize database queries for reports page"
- "Create onboarding flow for new team members"
- "Investigate memory leak in WebSocket connections"
- "Add dark mode toggle to user preferences"

### Comments (15-20 comments)
Distribute across issues in Sprint 1 and some in backlog. Realistic developer conversation:
- "I've started working on this. ETA is end of day."
- "Can we clarify the requirements for the mobile view?"
- "Moving this to review — PR #142 is ready."
- "Found a blocker: the staging API is returning 500s."
- "Looks good to me! Approved."
- "@jane can you take a look at the CSS alignment?"
- "Deployed to staging for testing."
- "Tests are passing locally but failing in CI."

### Notifications (8-10 notifications for current user)
Mix of read and unread:
- 3 unread notifications (recent)
- 5 read notifications (older)
- Types: comment mentions, assignments, status changes

### Workflow (1 default)
Standard 4-status workflow with transitions as defined above.

---

## Normalization Notes (for POST /post custom state)

When receiving custom state via the POST API, the normalizer should:
1. Ensure all issues have required fields with defaults (status → "To Do", priority → "Medium", type → "Story")
2. Map unknown userIds in assigneeId/reporterId to null/u1 respectively
3. Ensure sprintId references valid sprint IDs or set to null
4. Ensure labels is always an array (not null/undefined)
5. Ensure subtasks is always an array
6. Ensure all string dates are valid ISO format
7. Default storyPoints to 0 if missing
8. Generate unique ID/key if not provided
