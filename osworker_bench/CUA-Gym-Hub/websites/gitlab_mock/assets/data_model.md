# XitLab Mock — Data Model

All entities below should be defined in `src/utils/dataManager.js` inside a `createInitialData()` function that returns the complete initial state object.

---

## 1. Current User

```javascript
currentUser: {
  id: "u1",
  username: "svelasquez",
  name: "Sofia Velasquez",
  email: "sofia@gitlab-mock.dev",
  avatar: "https://i.pravatar.cc/150?u=svelasquez",
  bio: "Full-stack developer. Open source enthusiast.",
  location: "San Francisco, CA",
  organization: "Acme Corp",
  state: "active",
  createdAt: "2023-03-15T00:00:00Z"
}
```

## 2. Users

| Field | Type | Example |
|-------|------|---------|
| id | string | "u1" |
| username | string | "svelasquez" |
| name | string | "Sofia Velasquez" |
| email | string | "sofia@gitlab-mock.dev" |
| avatar | string | "https://i.pravatar.cc/150?u=svelasquez" |
| bio | string | "Full-stack developer" |
| state | string | "active" |
| role | string | "Owner" / "Maintainer" / "Developer" / "Reporter" / "Guest" |
| createdAt | string (ISO 8601) | "2023-03-15T00:00:00Z" |

**Seed**: 6 users
- u1: Sofia Velasquez (current user, Owner)
- u2: Marcus Chen (Maintainer)
- u3: Aisha Patel (Developer)
- u4: James O'Brien (Developer)
- u5: Yuki Tanaka (Reporter)
- u6: Lars Eriksson (Developer)

## 3. Groups (Namespaces)

| Field | Type | Example |
|-------|------|---------|
| id | string | "g1" |
| name | string | "Acme Corp" |
| path | string | "acme-corp" |
| description | string | "Main engineering group" |
| avatar | string | URL or null |
| visibility | string | "private" / "internal" / "public" |
| parentId | string or null | null (top-level) or "g1" (subgroup) |

**Seed**: 2 groups
- g1: "Acme Corp" (path: "acme-corp") — main org
- g2: "Frontend Team" (path: "frontend-team", parentId: "g1") — subgroup

## 4. Projects

| Field | Type | Example |
|-------|------|---------|
| id | string | "p1" |
| name | string | "web-platform" |
| nameWithNamespace | string | "Acme Corp / web-platform" |
| path | string | "web-platform" |
| pathWithNamespace | string | "acme-corp/web-platform" |
| description | string | "Main web application monorepo" |
| visibility | string | "private" / "internal" / "public" |
| groupId | string | "g1" |
| defaultBranch | string | "main" |
| starCount | number | 24 |
| forksCount | number | 5 |
| openIssuesCount | number | 12 |
| openMergeRequestsCount | number | 3 |
| language | string | "TypeScript" |
| languages | object | { "TypeScript": 62, "JavaScript": 20, "CSS": 12, "HTML": 6 } |
| topics | string[] | ["react", "typescript", "web-app"] |
| license | string | "MIT" |
| hasWiki | boolean | true |
| hasIssues | boolean | true |
| lastActivityAt | string | "2026-04-09T14:30:00Z" |
| createdAt | string | "2024-06-01T10:00:00Z" |
| updatedAt | string | "2026-04-09T14:30:00Z" |
| archived | boolean | false |
| emptyRepo | boolean | false |

**Seed**: 4 projects
- p1: "web-platform" (acme-corp, TypeScript, 12 open issues, active)
- p2: "mobile-app" (acme-corp, Kotlin, 6 open issues, active)
- p3: "design-system" (frontend-team, TypeScript/CSS, 3 open issues, active)
- p4: "docs-site" (acme-corp, Markdown, 1 open issue, less active)

## 5. Labels

| Field | Type | Example |
|-------|------|---------|
| id | string | "l1" |
| projectId | string | "p1" |
| name | string | "bug" |
| color | string | "#D9534F" (hex with #) |
| textColor | string | "#FFFFFF" |
| description | string | "Something isn't working" |

**Seed per project** (at least for p1):
- l1: "bug" (#D9534F, white text)
- l2: "feature" (#428BCA, white text)
- l3: "enhancement" (#5CB85C, white text)
- l4: "documentation" (#F0AD4E, dark text)
- l5: "critical" (#D9534F, white text)
- l6: "design" (#A989F5, white text)
- l7: "backend" (#34495E, white text)
- l8: "frontend" (#3498DB, white text)
- l9: "devops" (#1ABC9C, white text)
- l10: "good first issue" (#7F8C8D, white text)
- l11: "blocked" (#E74C3C, white text)
- l12: "needs review" (#9B59B6, white text)

## 6. Milestones

| Field | Type | Example |
|-------|------|---------|
| id | string | "m1" |
| iid | number | 1 |
| projectId | string | "p1" |
| title | string | "v2.0 Release" |
| description | string | "Major release with new dashboard" |
| state | string | "active" / "closed" |
| dueDate | string or null | "2026-05-15" |
| startDate | string or null | "2026-03-01" |
| createdAt | string | "2026-02-15T10:00:00Z" |
| updatedAt | string | "2026-04-01T08:00:00Z" |

**Seed** (for p1):
- m1: "v2.0 Release" (active, due May 15, ~60% complete)
- m2: "v2.1 Hotfix" (active, due June 1)
- m3: "v1.5 Release" (closed, completed)

## 7. Issues

| Field | Type | Example |
|-------|------|---------|
| id | string | "i1" |
| iid | number | 1 |
| projectId | string | "p1" |
| title | string | "Dashboard loading takes too long" |
| description | string | "When navigating to the dashboard..." (markdown) |
| state | string | "opened" / "closed" |
| authorId | string | "u1" |
| assigneeIds | string[] | ["u2", "u3"] |
| labelIds | string[] | ["l1", "l7"] |
| milestoneId | string or null | "m1" |
| dueDate | string or null | "2026-05-01" |
| weight | number or null | 3 |
| confidential | boolean | false |
| upvotes | number | 5 |
| downvotes | number | 0 |
| userNotesCount | number | 3 |
| webUrl | string | "/acme-corp/web-platform/-/issues/1" |
| createdAt | string | "2026-03-10T09:00:00Z" |
| updatedAt | string | "2026-04-05T14:00:00Z" |
| closedAt | string or null | null |
| closedById | string or null | null |

**Seed**: 15 issues across projects (12 for p1, 3 for p2), mix of opened/closed states, various labels, some assigned to milestones, some with due dates. Include:
- Bug reports (3-4)
- Feature requests (3-4)
- Enhancement tasks (2-3)
- Documentation tasks (1-2)
- Blocked issues (1)
- Recently closed issues (2-3)

## 8. Issue Comments (Notes)

| Field | Type | Example |
|-------|------|---------|
| id | string | "n1" |
| issueId | string | "i1" |
| authorId | string | "u2" |
| body | string | "I can reproduce this on Chrome..." (markdown) |
| createdAt | string | "2026-03-10T10:00:00Z" |
| updatedAt | string | "2026-03-10T10:00:00Z" |
| system | boolean | false (true for auto-generated "assigned to X" notes) |

**Seed**: 3-5 comments per active issue, at least 25 total

## 9. Merge Requests

| Field | Type | Example |
|-------|------|---------|
| id | string | "mr1" |
| iid | number | 1 |
| projectId | string | "p1" |
| title | string | "Refactor dashboard component tree" |
| description | string | "This MR refactors the dashboard..." (markdown) |
| state | string | "opened" / "merged" / "closed" |
| authorId | string | "u1" |
| assigneeIds | string[] | ["u2"] |
| reviewerIds | string[] | ["u3"] |
| labelIds | string[] | ["l3", "l8"] |
| milestoneId | string or null | "m1" |
| sourceBranch | string | "feature/dashboard-refactor" |
| targetBranch | string | "main" |
| draft | boolean | false |
| mergeStatus | string | "can_be_merged" / "cannot_be_merged" / "checking" |
| squash | boolean | false |
| upvotes | number | 2 |
| downvotes | number | 0 |
| userNotesCount | number | 4 |
| changesCount | number | 12 |
| additions | number | 345 |
| deletions | number | 120 |
| pipelineId | string or null | "pl1" |
| webUrl | string | "/acme-corp/web-platform/-/merge_requests/1" |
| createdAt | string | "2026-04-01T09:00:00Z" |
| updatedAt | string | "2026-04-08T16:00:00Z" |
| mergedAt | string or null | null |
| closedAt | string or null | null |

**Seed**: 8 merge requests (5 for p1, 2 for p2, 1 for p3). Mix: 3 open, 3 merged, 1 closed, 1 draft. Include source/target branches.

## 10. MR Comments (Notes)

Same structure as Issue Comments but with `mergeRequestId` instead of `issueId`:

| Field | Type | Example |
|-------|------|---------|
| id | string | "mrn1" |
| mergeRequestId | string | "mr1" |
| authorId | string | "u3" |
| body | string | "Looks good, one small suggestion..." |
| createdAt | string | ISO 8601 |
| system | boolean | false |

**Seed**: 2-4 comments per open MR

## 11. Pipelines

| Field | Type | Example |
|-------|------|---------|
| id | string | "pl1" |
| iid | number | 1 |
| projectId | string | "p1" |
| status | string | "success" / "failed" / "running" / "pending" / "canceled" |
| ref | string | "main" (branch name) |
| sha | string | "a1b2c3d4e5f6" (short commit SHA) |
| source | string | "push" / "merge_request_event" / "schedule" |
| duration | number | 245 (seconds) |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |
| finishedAt | string or null | ISO 8601 |

**Seed**: 6 pipelines for p1 (mix of success/failed/running), 2 for p2

## 12. Pipeline Jobs

| Field | Type | Example |
|-------|------|---------|
| id | string | "j1" |
| pipelineId | string | "pl1" |
| name | string | "build" |
| stage | string | "build" / "test" / "deploy" |
| status | string | "success" / "failed" / "running" / "pending" / "canceled" |
| duration | number or null | 45 (seconds) |
| startedAt | string or null | ISO 8601 |
| finishedAt | string or null | ISO 8601 |
| logExcerpt | string | "$ npm run build\n> vite build\n..." (mock terminal output, 10-20 lines) |

**Seed**: 3-5 jobs per pipeline (build, lint, test-unit, test-e2e, deploy stages)

## 13. Branches

| Field | Type | Example |
|-------|------|---------|
| id | string | "br1" |
| projectId | string | "p1" |
| name | string | "main" |
| isDefault | boolean | true |
| isProtected | boolean | true |
| lastCommitId | string | "c1" |
| mergedInto | string or null | null (or "main" if merged) |

**Seed** (for p1): main, develop, feature/dashboard-refactor, feature/auth-module, fix/login-redirect, release/v2.0 (6 branches)

## 14. Commits

| Field | Type | Example |
|-------|------|---------|
| id | string | "c1" |
| shortId | string | "a1b2c3d" |
| projectId | string | "p1" |
| branch | string | "main" |
| title | string | "feat: add dashboard analytics widget" |
| message | string | Full commit message (may equal title) |
| authorId | string | "u1" |
| authorName | string | "Sofia Velasquez" |
| authorEmail | string | "sofia@gitlab-mock.dev" |
| additions | number | 45 |
| deletions | number | 12 |
| createdAt | string | ISO 8601 |

**Seed**: 20+ commits for p1, 10 for p2, 5 for p3

## 15. Files (Repository Tree)

| Field | Type | Example |
|-------|------|---------|
| id | string | "f1" |
| projectId | string | "p1" |
| branch | string | "main" |
| path | string | "src/App.tsx" |
| name | string | "App.tsx" |
| type | string | "blob" / "tree" (file or directory) |
| content | string or null | File content (null for directories) |
| language | string | "typescript" / "javascript" / "css" / etc. |
| size | number | 1234 (bytes) |
| lastCommitId | string | "c1" |

**Seed**: A realistic project structure for p1 with ~20 files:
```
README.md
package.json
tsconfig.json
.gitignore
src/
  App.tsx
  main.tsx
  index.css
  components/
    Header.tsx
    Sidebar.tsx
    Dashboard.tsx
    Button.tsx
  pages/
    Home.tsx
    Settings.tsx
  utils/
    api.ts
    helpers.ts
  types/
    index.ts
```

## 16. Wiki Pages

| Field | Type | Example |
|-------|------|---------|
| id | string | "w1" |
| projectId | string | "p1" |
| title | string | "Home" |
| slug | string | "home" |
| content | string | "# Welcome\n\nThis is the project wiki..." (markdown) |
| authorId | string | "u1" |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |

**Seed**: 3 wiki pages for p1 (Home, Getting Started, Architecture)

## 17. Snippets

| Field | Type | Example |
|-------|------|---------|
| id | string | "sn1" |
| projectId | string or null | "p1" (null for personal snippets) |
| title | string | "Useful bash aliases" |
| description | string | "My commonly used aliases" |
| fileName | string | "aliases.sh" |
| content | string | "alias ll='ls -la'\n..." |
| language | string | "bash" |
| visibility | string | "public" / "internal" / "private" |
| authorId | string | "u1" |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |

**Seed**: 3 snippets (2 project, 1 personal)

## 18. Members

| Field | Type | Example |
|-------|------|---------|
| id | string | "mem1" |
| projectId | string | "p1" |
| userId | string | "u1" |
| accessLevel | string | "Owner" / "Maintainer" / "Developer" / "Reporter" / "Guest" |
| createdAt | string | ISO 8601 |

**Seed**: All 6 users as members of p1 with varying roles

## 19. Todos

| Field | Type | Example |
|-------|------|---------|
| id | string | "t1" |
| actionName | string | "assigned" / "mentioned" / "approval_required" / "marked" |
| targetType | string | "Issue" / "MergeRequest" |
| targetId | string | "i1" |
| targetTitle | string | "Dashboard loading takes too long" |
| projectId | string | "p1" |
| authorId | string | "u2" (who triggered the todo) |
| state | string | "pending" / "done" |
| createdAt | string | ISO 8601 |

**Seed**: 5 pending todos for the current user

## 20. Issue Board

| Field | Type | Example |
|-------|------|---------|
| id | string | "board1" |
| projectId | string | "p1" |
| name | string | "Development Board" |
| lists | array | See below |

### Board Lists

| Field | Type | Example |
|-------|------|---------|
| id | string | "list1" |
| boardId | string | "board1" |
| labelId | string or null | "l1" (null for Open/Closed lists) |
| listType | string | "backlog" / "label" / "closed" |
| position | number | 0 |

**Seed**: 1 board for p1 with lists: Open (backlog), "bug", "feature", "enhancement", Closed

---

## State Shape Summary

```javascript
createInitialData() {
  return {
    currentUser: { ... },
    users: [ ... ],
    groups: [ ... ],
    projects: [ ... ],
    labels: [ ... ],
    milestones: [ ... ],
    issues: [ ... ],
    issueComments: [ ... ],
    mergeRequests: [ ... ],
    mrComments: [ ... ],
    pipelines: [ ... ],
    jobs: [ ... ],
    branches: [ ... ],
    commits: [ ... ],
    files: [ ... ],
    wikiPages: [ ... ],
    snippets: [ ... ],
    members: [ ... ],
    todos: [ ... ],
    boards: [ ... ],
    boardLists: [ ... ],
    notifications: [ ... ],
  }
}
```
