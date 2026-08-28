# Xsana Mock — Data Model

> Last updated: 2026-03-02 by plan agent
> Source: `src/types/index.ts` + `src/data/initialData.ts`

## Entity Overview

The data model is already implemented in TypeScript. This document describes the existing types, their relationships, and how the dev agent should extend them for new features.

## Existing Entities (Already Defined in `types/index.ts`)

### User
```typescript
interface User {
  userId: string;       // e.g., "user-0"
  name: string;         // "Alex Johnson"
  email: string;        // "alex.johnson@company.com"
  avatar: string;       // URL to avatar image
  title: string;        // "Product Manager"
  department: string;   // "Product"
  location: string;     // "San Francisco, CA"
  timezone: string;     // "PST"
  theme: 'light' | 'dark' | 'auto';
}
```
**Current user**: `users[0]` — Alex Johnson, Product Manager

### Team
```typescript
interface Team {
  teamId: string;       // "team-1"
  name: string;         // "Product Team"
  description: string;
  memberIds: string[];  // ["user-0", "user-1", ...]
  ownerId: string;      // "user-0"
  privacy: 'public' | 'private';
  createdDate: string;  // ISO 8601
}
```

### Project
```typescript
interface Project {
  projectId: string;    // "project-1"
  name: string;         // "Q1 Product Launch"
  teamId: string;       // FK → Team.teamId
  description: string;
  color: string;        // hex, e.g., "#FC6D26"
  icon: string;         // URL
  ownerId: string;      // FK → User.userId
  memberIds: string[];
  sections: Section[];  // embedded
  customFields: CustomField[];  // embedded
  privacy: 'public' | 'private';
  startDate?: string;   // "2024-01-01"
  dueDate?: string;
  archived: boolean;
  starred: boolean;
  createdDate: string;
  modifiedDate: string;
}
```

### Section (embedded in Project)
```typescript
interface Section {
  sectionId: string;    // "section-1-1"
  name: string;         // "To Do", "In Progress", "Done"
  collapsed: boolean;
}
```

### CustomField (embedded in Project)
```typescript
interface CustomField {
  fieldId: string;      // "field-1"
  name: string;         // "Priority"
  type: 'text' | 'number' | 'single-select' | 'multi-select' | 'date' | 'person' | 'checkbox';
  options?: string[];   // ["High", "Medium", "Low"] for select types
  required: boolean;
}
```

### Task
```typescript
interface Task {
  taskId: string;           // "task-1"
  name: string;             // "Design landing page mockups"
  projectId: string;        // FK → Project.projectId
  sectionId: string;        // FK → Section.sectionId (within project)
  description: string;
  assigneeId?: string;      // FK → User.userId (optional)
  creatorId: string;        // FK → User.userId
  dueDate?: string;         // "2024-03-15"
  startDate?: string;
  completed: boolean;
  completedDate?: string;   // ISO 8601, set when completed=true
  parentTaskId?: string;    // FK → Task.taskId (for subtasks)
  dependencies: string[];   // [taskId, ...] — tasks this depends on
  tags: string[];           // ["design", "high-priority"]
  attachmentIds: string[];
  customFieldValues: Record<string, any>;  // { "field-1": "High" }
  likeCount: number;
  createdDate: string;
  modifiedDate: string;
}
```

### Comment
```typescript
interface Comment {
  commentId: string;    // "comment-1"
  taskId: string;       // FK → Task.taskId
  userId: string;       // FK → User.userId
  content: string;
  createdDate: string;
  likedBy: string[];    // [userId, ...]
}
```

### Portfolio
```typescript
interface Portfolio {
  portfolioId: string;  // "portfolio-1"
  name: string;
  description: string;
  ownerId: string;      // FK → User.userId
  memberIds: string[];
  projectIds: string[]; // FK → Project.projectId[]
  color: string;        // hex
}
```

### Goal
```typescript
interface Goal {
  goalId: string;       // "goal-1"
  name: string;
  description: string;
  ownerId: string;      // FK → User.userId
  timePeriod: string;   // "Q1 2024"
  progress: number;     // 0-100
  status: 'on-track' | 'at-risk' | 'off-track';
  parentGoalId?: string;
  supportingProjectIds: string[];
  metrics: string[];    // ["Daily Active Users", ...]
}
```

### Notification
```typescript
interface Notification {
  notificationId: string;
  userId: string;       // recipient (FK → User)
  type: 'task-assigned' | 'task-completed' | 'task-due-soon' | 'comment' | 'mention' | 'project-invite' | 'status-update';
  actorId: string;      // who triggered it (FK → User)
  targetId: string;     // task/project/comment ID
  targetType: 'task' | 'project' | 'comment';
  read: boolean;
  archived: boolean;
  createdDate: string;
}
```

### Attachment
```typescript
interface Attachment {
  attachmentId: string;
  taskId: string;       // FK → Task
  fileName: string;
  fileType: string;     // MIME type
  fileSize: number;     // bytes
  fileUrl: string;
  uploaderId: string;   // FK → User
  uploadDate: string;
}
```

### AppState (root state shape)
```typescript
interface AppState {
  currentUser: User;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  portfolios: Portfolio[];
  goals: Goal[];
  notifications: Notification[];
  attachments: Attachment[];
}
```

## Entity Relationships

```
Workspace (implicit — single workspace)
  ├── Users[]
  ├── Teams[]
  │     └── Projects[] (via project.teamId)
  │           ├── Sections[] (embedded)
  │           ├── CustomFields[] (embedded)
  │           └── Tasks[] (via task.projectId + task.sectionId)
  │                 ├── Subtasks (via task.parentTaskId → task.taskId)
  │                 ├── Comments[] (via comment.taskId)
  │                 ├── Attachments[] (via attachment.taskId)
  │                 └── Dependencies (task.dependencies → taskId[])
  ├── Portfolios[]
  │     └── Projects[] (via portfolio.projectIds)
  ├── Goals[]
  │     └── Projects[] (via goal.supportingProjectIds)
  └── Notifications[] (via notification.userId = currentUser)
```

## Current Seed Data (in `generateInitialData()`)

| Entity | Count | Key Details |
|--------|-------|-------------|
| Users | 6 | Alex Johnson (PM), Sarah Chen (Designer), Mike Rodriguez (Eng Lead), Emily Watson (Marketing), David Kim (SWE), Lisa Anderson (UX) |
| Teams | 3 | Product Team, Engineering Team, Marketing Team |
| Projects | 4 | Q1 Product Launch (3 sections, 2 custom fields), Website Redesign (4 sections), Marketing Campaign Q1 (3 sections), Mobile App Dev (3 sections) |
| Tasks | 8 | Distributed across projects, mix of complete/incomplete, various assignees |
| Comments | 3 | On tasks 1 and 2, with likes |
| Portfolios | 2 | Q1 2024 Initiatives, Engineering Projects |
| Goals | 2 | Engagement (45%), Mobile launch (20%) |
| Notifications | 2 | Both unread, for user-0 |
| Attachments | 0 | Empty |

## Recommended Seed Data Additions

The current 8 tasks is sparse for realistic training. Dev agent should add more tasks to:

### Additional Tasks Needed (add to `generateInitialData()`)
- **Total target**: ~20-25 tasks across all projects
- More tasks in each section to populate Board view columns
- Mix of:
  - Tasks with/without due dates
  - Tasks with/without assignees
  - Tasks in different priority levels
  - Some overdue tasks (past due dates)
  - Some tasks due today/tomorrow
  - A few subtasks (parentTaskId set)
  - Tasks with start dates (for Timeline view)

### Additional Notifications Needed
- **Total target**: ~8-10 notifications
- Mix of types: task-assigned, task-completed, comment, mention, task-due-soon
- Some read, some unread
- Various actors

### Additional Comments Needed
- **Total target**: ~6-8 comments
- Spread across different tasks
- Various users commenting

## Context Methods Available (in `AppContext.tsx`)

These methods are already implemented and available for components:

```typescript
updateTask(taskId: string, updates: Partial<Task>)
addTask(task: Task)
deleteTask(taskId: string)
updateProject(projectId: string, updates: Partial<Project>)
addProject(project: Project)
addComment(comment: Comment)
markNotificationRead(notificationId: string)
toggleTaskComplete(taskId: string)
toggleProjectStar(projectId: string)
```

### Methods That Need to Be Added

The dev agent should add these context methods for new features:

```typescript
// Needed for task detail editing
updateTaskAssignee(taskId: string, assigneeId: string | undefined)  // or use updateTask
updateTaskDueDate(taskId: string, dueDate: string | undefined)     // or use updateTask
moveTaskToSection(taskId: string, sectionId: string)               // for drag-and-drop

// Needed for bulk operations
markAllNotificationsRead()
archiveNotification(notificationId: string)

// Needed for creation flows
addSection(projectId: string, section: Section)
deleteProject(projectId: string)

// Needed for goals/portfolios
updateGoal(goalId: string, updates: Partial<Goal>)
addGoal(goal: Goal)
updatePortfolio(portfolioId: string, updates: Partial<Portfolio>)
addPortfolio(portfolio: Portfolio)

// Needed for teams
addTeamMember(teamId: string, userId: string)
removeTeamMember(teamId: string, userId: string)
```

## Normalization (Already Implemented)

All entities have normalizer functions in `initialData.ts` that handle:
- Multiple field name variants (camelCase, snake_case)
- Default values for missing fields
- Type coercion and validation
- Used by `deepMergeWithDefaults()` when custom state is POSTed via session API
