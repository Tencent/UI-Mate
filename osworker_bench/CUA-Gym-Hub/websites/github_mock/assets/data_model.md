# XitHub Mock — Data Model

> Defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js` (currently `src/lib/mockData.js`).

## Entity Types

### User
```javascript
{
  id: "u1",                    // String, unique ID
  username: "octocat",         // String, unique handle (used in URLs)
  name: "The Octocat",         // String, display name
  email: "octocat@github.com", // String, email address
  avatar: "https://...",       // String, avatar image URL
  bio: "I love coding!",       // String, short bio (optional, used on profile)
  location: "San Francisco",   // String, location (optional)
  company: "XitHub",           // String, company (optional)
  website: "https://github.com/octocat", // String, website URL (optional)
  joinedAt: "2020-01-15T..."   // ISO date, when user joined
}
```

### Repository
```javascript
{
  id: "r1",                        // String, unique ID
  ownerId: "u1",                   // String, FK → User.id
  name: "hello-world",            // String, repo name (URL-safe)
  description: "My first repo",    // String, short description
  language: "JavaScript",          // String, primary language
  languages: {                     // Object, language breakdown (optional, for stats bar)
    "JavaScript": 65.4,
    "CSS": 22.1,
    "HTML": 12.5
  },
  stars: 124,                      // Number, star count
  forks: 32,                       // Number, fork count
  watchers: 56,                    // Number, watcher count
  isPrivate: false,                // Boolean, visibility
  defaultBranch: "main",           // String, default branch name
  topics: ["react", "javascript"], // String[], repository topics/tags
  license: "MIT",                  // String, license name (optional)
  homepage: "https://example.com", // String, project website (optional)
  hasWiki: true,                   // Boolean, wiki enabled
  hasIssues: true,                 // Boolean, issues enabled
  hasProjects: true,               // Boolean, projects enabled
  updatedAt: "2026-02-25T...",     // ISO date, last update
  createdAt: "2025-06-01T..."      // ISO date, creation date
}
```

### Branch
```javascript
{
  id: "b1",               // String, unique ID
  repoId: "r1",           // String, FK → Repository.id
  name: "main",           // String, branch name
  lastCommitId: "c2",     // String, FK → Commit.id (head of branch)
  isProtected: false       // Boolean, whether branch is protected (optional)
}
```

### File
```javascript
{
  id: "f1",                      // String, unique ID
  repoId: "r1",                  // String, FK → Repository.id
  branch: "main",                // String, branch name
  path: "src/index.js",          // String, full file path from repo root
  content: "console.log('hi')",  // String, file content
  language: "javascript"         // String, syntax highlighting language key
}
```

### Commit
```javascript
{
  id: "c1",                        // String, unique ID (7+ char hex-like)
  repoId: "r1",                    // String, FK → Repository.id
  branch: "main",                  // String, branch name
  message: "Add button component", // String, commit message
  authorId: "u1",                  // String, FK → User.id
  date: "2026-02-20T...",          // ISO date, commit date
  additions: 45,                   // Number, lines added (optional, for diff display)
  deletions: 12                    // Number, lines removed (optional)
}
```

### Issue
```javascript
{
  id: "i1",                        // String, unique ID
  repoId: "r1",                    // String, FK → Repository.id
  number: 1,                       // Number, issue number (shared with PRs, unique per repo)
  title: "Fix login bug",          // String, issue title
  description: "Login fails...",   // String, Markdown body
  status: "open",                  // "open" | "closed"
  authorId: "u2",                  // String, FK → User.id
  assignees: ["u1"],               // String[], FK → User.id[]
  labels: ["bug", "high-priority"],// String[], label names
  milestone: null,                 // String | null, milestone name (optional)
  column: "todo",                  // "todo" | "inprogress" | "done" — for project board
  isPinned: false,                 // Boolean, pinned to top of issue list (optional)
  reactions: {                     // Object, reaction counts (optional, for P1 reactions feature)
    "+1": 3,
    "-1": 0,
    "heart": 1,
    "rocket": 0,
    "eyes": 2
  },
  createdAt: "2026-02-10T...",     // ISO date
  closedAt: null,                  // ISO date | null, when closed
  comments: [                      // Comment[] (embedded)
    {
      id: "cm1",
      authorId: "u1",
      content: "I will look into this.",
      date: "2026-02-10T...",
      reactions: { "+1": 1, "heart": 0 }  // Optional
    }
  ]
}
```

### PullRequest
```javascript
{
  id: "pr1",                       // String, unique ID
  repoId: "r1",                    // String, FK → Repository.id
  number: 3,                       // Number, PR number (shared with issues)
  title: "Add Login Feature",      // String, PR title
  description: "Implemented...",   // String, Markdown body
  baseBranch: "main",              // String, target branch
  compareBranch: "feature/login",  // String, source branch
  status: "open",                  // "open" | "closed" | "merged"
  isDraft: false,                  // Boolean, draft PR (optional)
  authorId: "u1",                  // String, FK → User.id
  assignees: [],                   // String[], FK → User.id[]
  labels: [],                      // String[], label names
  milestone: null,                 // String | null
  mergeStrategy: null,             // "merge" | "squash" | "rebase" | null
  mergedAt: null,                  // ISO date | null
  mergedBy: null,                  // String | null, FK → User.id
  createdAt: "2026-02-15T...",     // ISO date
  closedAt: null,                  // ISO date | null
  reviewers: [                     // Reviewer[] (embedded)
    {
      userId: "u2",
      status: "approved",          // "pending" | "approved" | "changes_requested" | "commented"
      date: "2026-02-16",
      body: ""                     // Review comment body (optional)
    }
  ],
  comments: [                      // Comment[] (embedded)
    {
      id: "prc1",
      authorId: "u2",
      content: "LGTM!",
      date: "2026-02-16T..."
    }
  ],
  checks: [                        // Check[] (optional, for CI status in merge box)
    {
      name: "CI / Build",
      status: "success",           // "success" | "failure" | "pending"
      detail: "Build passed in 2m 34s"
    }
  ]
}
```

### WikiPage
```javascript
{
  id: "w1",                    // String, unique ID
  repoId: "r1",               // String, FK → Repository.id
  title: "Home",              // String, page title
  content: "# Welcome...",    // String, Markdown content
  createdAt: "2026-02-01T...",// ISO date (optional)
  updatedAt: "2026-02-20T..." // ISO date (optional)
}
```

### Action (Workflow Run)
```javascript
{
  id: "a1",                      // String, unique ID
  repoId: "r1",                  // String, FK → Repository.id
  name: "Build & Test",          // String, workflow name
  status: "success",             // "success" | "failure" | "running" | "queued"
  runNumber: 15,                 // Number, workflow run number
  branch: "main",                // String, triggering branch
  event: "push",                 // String, trigger event (push, pull_request, etc.)
  duration: "2m 34s",            // String, run duration
  date: "2026-02-25T...",        // ISO date, run date
  triggeredBy: "u1"              // String, FK → User.id (optional)
}
```

### Notification (new entity for P1)
```javascript
{
  id: "n1",                         // String, unique ID
  type: "issue_comment",            // "issue_comment" | "pr_review" | "mention" | "assign" | "ci_status"
  repoId: "r1",                     // String, FK → Repository.id
  issueNumber: 1,                   // Number | null, related issue/PR number
  title: "admin commented on #1",   // String, notification summary
  isRead: false,                    // Boolean, read status
  date: "2026-02-27T..."            // ISO date
}
```

### Label (new entity for P1, currently labels are just strings)
```javascript
{
  id: "l1",                 // String, unique ID
  repoId: "r1",             // String, FK → Repository.id
  name: "bug",              // String, label name
  color: "#d73a4a",         // String, hex color
  description: "Something isn't working" // String (optional)
}
```

### Milestone (new entity for P1)
```javascript
{
  id: "m1",                    // String, unique ID
  repoId: "r1",               // String, FK → Repository.id
  title: "v1.0",              // String, milestone title
  description: "First release", // String
  dueDate: "2026-03-31",      // String, ISO date (optional)
  state: "open",              // "open" | "closed"
  createdAt: "2026-01-15T..."  // ISO date
}
```

## Relationships Diagram

```
User ─1──*─ Repository (ownerId)
User ─1──*─ Issue (authorId)
User ─1──*─ PullRequest (authorId)
User ─1──*─ Commit (authorId)
User ─*──*─ Issue (assignees[])
User ─*──*─ PullRequest (assignees[])
User ─*──*─ PullRequest (reviewers[].userId)

Repository ─1──*─ Branch
Repository ─1──*─ File
Repository ─1──*─ Commit
Repository ─1──*─ Issue
Repository ─1──*─ PullRequest
Repository ─1──*─ WikiPage
Repository ─1──*─ Action
Repository ─1──*─ Notification
Repository ─1──*─ Label
Repository ─1──*─ Milestone

Issue ─1──*─ Comment (embedded)
PullRequest ─1──*─ Comment (embedded)
PullRequest ─1──*─ Reviewer (embedded)
PullRequest ─1──*─ Check (embedded)
```

## Suggested createInitialData() Structure

```javascript
export const INITIAL_STATE = {
  currentUser: {
    id: "u1",
    username: "octocat",
    name: "The Octocat",
    email: "octocat@github.com",
    avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
    bio: "I love coding and open source!",
    location: "San Francisco, CA",
    company: "XitHub",
    website: "https://github.com/octocat",
    joinedAt: "2020-01-15T00:00:00Z"
  },

  users: [
    { id: "u1", username: "octocat", name: "The Octocat", avatar: "https://avatars.githubusercontent.com/u/583231?v=4", bio: "I love coding!" },
    { id: "u2", username: "mojombo", name: "Tom Preston-Werner", avatar: "https://avatars.githubusercontent.com/u/1?v=4", bio: "XitHub co-founder" },
    { id: "u3", username: "defunkt", name: "Chris Wanstrath", avatar: "https://avatars.githubusercontent.com/u/2?v=4", bio: "Another co-founder" },
    { id: "u4", username: "pjhyett", name: "PJ Hyett", avatar: "https://avatars.githubusercontent.com/u/3?v=4", bio: "Developer" },
    { id: "u5", username: "wycats", name: "Yehuda Katz", avatar: "https://avatars.githubusercontent.com/u/4?v=4", bio: "Open source contributor" }
  ],

  repos: [
    {
      id: "r1", ownerId: "u1", name: "hello-world",
      description: "A sample repository for testing XitHub features. Contains a basic web app.",
      language: "JavaScript",
      languages: { "JavaScript": 55.2, "TypeScript": 28.1, "CSS": 10.3, "HTML": 6.4 },
      stars: 342, forks: 87, watchers: 56, isPrivate: false,
      defaultBranch: "main",
      topics: ["javascript", "tutorial", "hello-world", "starter-template"],
      license: "MIT",
      homepage: "https://octocat.github.io/hello-world",
      hasWiki: true, hasIssues: true, hasProjects: true,
      updatedAt: "2026-02-26T14:30:00Z",
      createdAt: "2025-06-01T10:00:00Z"
    },
    {
      id: "r2", ownerId: "u1", name: "spoon-knife",
      description: "This repo is for demonstration purposes. You can use it to test forking.",
      language: "HTML",
      languages: { "HTML": 78.0, "CSS": 22.0 },
      stars: 12400, forks: 145000, watchers: 1200, isPrivate: false,
      defaultBranch: "main",
      topics: ["demo", "forking", "tutorial"],
      license: "MIT",
      homepage: "",
      hasWiki: true, hasIssues: true, hasProjects: true,
      updatedAt: "2026-02-20T09:00:00Z",
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "r3", ownerId: "u1", name: "private-notes",
      description: "Personal notes and snippets (private).",
      language: "Markdown",
      languages: { "Markdown": 100.0 },
      stars: 0, forks: 0, watchers: 1, isPrivate: true,
      defaultBranch: "main", topics: [],
      license: "", homepage: "",
      hasWiki: false, hasIssues: true, hasProjects: false,
      updatedAt: "2026-02-28T08:00:00Z",
      createdAt: "2026-01-01T00:00:00Z"
    }
  ],

  branches: [
    { id: "b1", repoId: "r1", name: "main", lastCommitId: "c3" },
    { id: "b2", repoId: "r1", name: "feature/auth", lastCommitId: "c4" },
    { id: "b3", repoId: "r1", name: "fix/button-style", lastCommitId: "c5" },
    { id: "b4", repoId: "r2", name: "main", lastCommitId: "c7" },
    { id: "b5", repoId: "r3", name: "main", lastCommitId: "c8" }
  ],

  files: [
    // r1 (hello-world) files
    { id: "f1", repoId: "r1", branch: "main", path: "package.json", content: '{\n  "name": "hello-world",\n  "version": "2.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}', language: "json" },
    { id: "f2", repoId: "r1", branch: "main", path: "src/index.js", content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./styles.css";\n\nReactDOM.createRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);', language: "javascript" },
    { id: "f3", repoId: "r1", branch: "main", path: "src/App.js", content: 'import React from "react";\nimport Button from "./components/Button";\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n      <Button label="Click me" />\n    </div>\n  );\n}', language: "javascript" },
    { id: "f4", repoId: "r1", branch: "main", path: "src/components/Button.js", content: 'import React from "react";\n\nexport default function Button({ label, onClick }) {\n  return (\n    <button className="btn" onClick={onClick}>\n      {label}\n    </button>\n  );\n}', language: "javascript" },
    { id: "f5", repoId: "r1", branch: "main", path: "src/styles.css", content: '.app {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n.btn {\n  background: #238636;\n  color: white;\n  padding: 8px 16px;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n}', language: "css" },
    { id: "f6", repoId: "r1", branch: "main", path: "README.md", content: '# Hello World\n\nA sample web application demonstrating React components.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Features\n\n- Button component with customizable label\n- Clean CSS styling\n- Fast Vite dev server\n\n## License\n\nMIT', language: "markdown" },
    { id: "f7", repoId: "r1", branch: "main", path: ".gitignore", content: 'node_modules/\ndist/\n.env\n*.log', language: "text" },

    // r2 (spoon-knife) files
    { id: "f8", repoId: "r2", branch: "main", path: "index.html", content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Spoon-Knife</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>This project is great!</h1>\n  <p>A demo repo for practicing forks and pull requests.</p>\n</body>\n</html>', language: "html" },
    { id: "f9", repoId: "r2", branch: "main", path: "styles.css", content: 'body {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 2rem auto;\n  padding: 1rem;\n}', language: "css" },
    { id: "f10", repoId: "r2", branch: "main", path: "README.md", content: '# Spoon-Knife\n\nThis repo is for demonstration purposes.\n\nFeel free to fork it and submit a pull request!', language: "markdown" },

    // r3 (private-notes) files
    { id: "f11", repoId: "r3", branch: "main", path: "README.md", content: '# Private Notes\n\nPersonal notes and code snippets.', language: "markdown" },
    { id: "f12", repoId: "r3", branch: "main", path: "todo.md", content: '# TODO\n\n- [ ] Learn TypeScript\n- [x] Set up CI/CD\n- [ ] Write tests\n- [ ] Deploy v2.0', language: "markdown" }
  ],

  commits: [
    { id: "a1b2c3d", repoId: "r1", branch: "main", message: "Initial commit: project scaffold", authorId: "u1", date: "2025-06-01T10:00:00Z", additions: 150, deletions: 0 },
    { id: "e4f5g6h", repoId: "r1", branch: "main", message: "Add Button component with onClick handler", authorId: "u1", date: "2025-08-15T14:30:00Z", additions: 25, deletions: 3 },
    { id: "i7j8k9l", repoId: "r1", branch: "main", message: "Update styles and fix responsive layout", authorId: "u2", date: "2026-01-20T09:15:00Z", additions: 45, deletions: 12 },
    { id: "m0n1o2p", repoId: "r1", branch: "feature/auth", message: "Add authentication module with JWT support", authorId: "u1", date: "2026-02-10T16:45:00Z", additions: 120, deletions: 5 },
    { id: "q3r4s5t", repoId: "r1", branch: "fix/button-style", message: "Fix button hover state and add disabled styling", authorId: "u3", date: "2026-02-24T11:00:00Z", additions: 15, deletions: 8 },
    { id: "u6v7w8x", repoId: "r1", branch: "main", message: "Merge PR #3: Add Login Feature", authorId: "u1", date: "2026-02-26T14:30:00Z", additions: 0, deletions: 0 },
    { id: "y9z0a1b", repoId: "r2", branch: "main", message: "Create index.html with initial content", authorId: "u1", date: "2024-01-01T00:00:00Z", additions: 20, deletions: 0 },
    { id: "c2d3e4f", repoId: "r3", branch: "main", message: "Add personal notes", authorId: "u1", date: "2026-01-01T00:00:00Z", additions: 30, deletions: 0 }
  ],

  issues: [
    {
      id: "i1", repoId: "r1", number: 1,
      title: "Login fails with special characters in password",
      description: "When a user enters special characters like `!@#$%` in the password field, the login form throws a validation error.\n\n## Steps to reproduce\n1. Go to login page\n2. Enter `test@example.com` as email\n3. Enter `P@ss!w0rd#` as password\n4. Click Submit\n\n## Expected\nLogin should succeed.\n\n## Actual\nForm shows 'Invalid input' error.",
      status: "open", authorId: "u2", assignees: ["u1"],
      labels: ["bug", "high-priority"],
      milestone: "v2.0",
      column: "inprogress", isPinned: false,
      reactions: { "+1": 5, "-1": 0, "heart": 1, "rocket": 0, "eyes": 3 },
      createdAt: "2026-02-10T08:30:00Z", closedAt: null,
      comments: [
        { id: "cm1", authorId: "u1", content: "I can reproduce this. Looking into the input sanitization logic.", date: "2026-02-10T09:00:00Z", reactions: { "+1": 2 } },
        { id: "cm2", authorId: "u3", content: "Same issue here. It seems like the regex validation is too strict.", date: "2026-02-11T14:20:00Z", reactions: {} }
      ]
    },
    {
      id: "i2", repoId: "r1", number: 2,
      title: "Add dark mode support",
      description: "It would be great to have a dark mode toggle in the settings.\n\nReference: [XitHub dark mode](https://github.com/settings/appearance)",
      status: "open", authorId: "u3", assignees: [],
      labels: ["enhancement", "good first issue"],
      milestone: "v2.0",
      column: "todo", isPinned: false,
      reactions: { "+1": 12, "heart": 3 },
      createdAt: "2026-02-12T10:00:00Z", closedAt: null,
      comments: [
        { id: "cm3", authorId: "u4", content: "I'd love to work on this! Can I be assigned?", date: "2026-02-13T11:00:00Z", reactions: { "+1": 1 } }
      ]
    },
    {
      id: "i3", repoId: "r1", number: 4,
      title: "Update documentation for v2.0",
      description: "The README is outdated. Need to update installation steps and add API docs.",
      status: "closed", authorId: "u1", assignees: ["u2"],
      labels: ["documentation"],
      milestone: null,
      column: "done", isPinned: false,
      reactions: {},
      createdAt: "2026-01-20T15:00:00Z", closedAt: "2026-02-05T10:00:00Z",
      comments: []
    },
    {
      id: "i4", repoId: "r1", number: 5,
      title: "Button component doesn't support disabled state",
      description: "The Button component accepts an `onClick` handler but has no `disabled` prop support.\n\n```jsx\n<Button label=\"Submit\" disabled={true} />\n```\n\nThis should render a grayed-out, non-clickable button.",
      status: "open", authorId: "u5", assignees: ["u3"],
      labels: ["bug", "good first issue"],
      milestone: null,
      column: "todo", isPinned: false,
      reactions: { "+1": 2 },
      createdAt: "2026-02-22T09:45:00Z", closedAt: null,
      comments: []
    },
    {
      id: "i5", repoId: "r2", number: 1,
      title: "Add a navigation menu",
      description: "The demo page needs a proper navigation menu.",
      status: "open", authorId: "u2", assignees: [],
      labels: ["enhancement"],
      milestone: null,
      column: "todo", isPinned: false,
      reactions: {},
      createdAt: "2026-02-01T12:00:00Z", closedAt: null,
      comments: []
    }
  ],

  pullRequests: [
    {
      id: "pr1", repoId: "r1", number: 3,
      title: "Add Login Feature with JWT authentication",
      description: "This PR adds the login feature with JWT-based authentication.\n\n## Changes\n- New `Login.js` component\n- JWT token handling in `auth.js`\n- Protected route wrapper\n\n## Testing\n- [x] Unit tests for auth module\n- [x] Integration test for login flow\n- [ ] E2E test with Playwright",
      baseBranch: "main", compareBranch: "feature/auth",
      status: "open", isDraft: false,
      authorId: "u1", assignees: ["u1"], labels: ["feature"],
      milestone: "v2.0",
      mergeStrategy: null, mergedAt: null, mergedBy: null,
      createdAt: "2026-02-15T10:00:00Z", closedAt: null,
      reviewers: [
        { userId: "u2", status: "approved", date: "2026-02-16T14:00:00Z", body: "LGTM! Clean implementation." },
        { userId: "u3", status: "changes_requested", date: "2026-02-16T16:00:00Z", body: "Please add error handling for expired tokens." }
      ],
      comments: [
        { id: "prc1", authorId: "u2", content: "Great work! Just a few minor suggestions.", date: "2026-02-16T14:00:00Z" },
        { id: "prc2", authorId: "u1", content: "Updated based on feedback. Added token expiry handling.", date: "2026-02-17T09:00:00Z" }
      ],
      checks: [
        { name: "CI / Build", status: "success", detail: "Build passed in 2m 34s" },
        { name: "CI / Test", status: "success", detail: "All 47 tests passed" },
        { name: "CI / Lint", status: "failure", detail: "3 lint warnings found" }
      ]
    },
    {
      id: "pr2", repoId: "r1", number: 6,
      title: "Fix button hover state and disabled styling",
      description: "Fixes #5. Adds disabled prop to Button component with proper styling.\n\n```diff\n+ <button className={`btn ${disabled ? 'btn-disabled' : ''}`}\n+   disabled={disabled}\n+   onClick={disabled ? undefined : onClick}>\n```",
      baseBranch: "main", compareBranch: "fix/button-style",
      status: "open", isDraft: false,
      authorId: "u3", assignees: [], labels: ["bug"],
      milestone: null,
      mergeStrategy: null, mergedAt: null, mergedBy: null,
      createdAt: "2026-02-24T11:30:00Z", closedAt: null,
      reviewers: [],
      comments: [],
      checks: [
        { name: "CI / Build", status: "success", detail: "Build passed in 1m 45s" },
        { name: "CI / Test", status: "success", detail: "All 47 tests passed" }
      ]
    }
  ],

  wiki: [
    { id: "w1", repoId: "r1", title: "Home", content: "# Hello World Wiki\n\nWelcome to the project wiki!\n\n## Quick Links\n- [[Getting Started]]\n- [[API Reference]]\n- [[Contributing]]", createdAt: "2025-06-15T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z" },
    { id: "w2", repoId: "r1", title: "Getting Started", content: "# Getting Started\n\n## Prerequisites\n- Node.js 18+\n- npm or yarn\n\n## Installation\n```bash\ngit clone https://github.com/octocat/hello-world.git\ncd hello-world\nnpm install\nnpm run dev\n```\n\n## Configuration\nCopy `.env.example` to `.env` and fill in the values.", createdAt: "2025-07-01T00:00:00Z", updatedAt: "2026-01-15T00:00:00Z" },
    { id: "w3", repoId: "r1", title: "API Reference", content: "# API Reference\n\n## Components\n\n### Button\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| label | string | - | Button text |\n| onClick | function | - | Click handler |\n| disabled | boolean | false | Disabled state |", createdAt: "2025-08-01T00:00:00Z", updatedAt: "2025-12-01T00:00:00Z" }
  ],

  actions: [
    { id: "a1", repoId: "r1", name: "CI / Build", status: "success", runNumber: 42, branch: "main", event: "push", duration: "2m 34s", date: "2026-02-26T14:30:00Z", triggeredBy: "u1" },
    { id: "a2", repoId: "r1", name: "CI / Test", status: "success", runNumber: 42, branch: "main", event: "push", duration: "4m 12s", date: "2026-02-26T14:30:00Z", triggeredBy: "u1" },
    { id: "a3", repoId: "r1", name: "Deploy to Staging", status: "failure", runNumber: 41, branch: "feature/auth", event: "pull_request", duration: "1m 05s", date: "2026-02-25T16:45:00Z", triggeredBy: "u1" },
    { id: "a4", repoId: "r1", name: "CI / Build", status: "success", runNumber: 40, branch: "fix/button-style", event: "push", duration: "1m 45s", date: "2026-02-24T11:00:00Z", triggeredBy: "u3" },
    { id: "a5", repoId: "r1", name: "CI / Lint", status: "failure", runNumber: 39, branch: "feature/auth", event: "pull_request", duration: "0m 32s", date: "2026-02-23T09:00:00Z", triggeredBy: "u1" }
  ],

  notifications: [
    { id: "n1", type: "issue_comment", repoId: "r1", issueNumber: 1, title: "mojombo commented on: Login fails with special characters", isRead: false, date: "2026-02-27T10:00:00Z" },
    { id: "n2", type: "pr_review", repoId: "r1", issueNumber: 3, title: "defunkt requested changes on: Add Login Feature", isRead: false, date: "2026-02-16T16:00:00Z" },
    { id: "n3", type: "mention", repoId: "r1", issueNumber: 2, title: "pjhyett mentioned you in: Add dark mode support", isRead: true, date: "2026-02-13T11:00:00Z" },
    { id: "n4", type: "ci_status", repoId: "r1", issueNumber: null, title: "CI / Lint failed on feature/auth", isRead: true, date: "2026-02-23T09:00:00Z" }
  ],

  labels: [
    { id: "l1", repoId: "r1", name: "bug", color: "#d73a4a", description: "Something isn't working" },
    { id: "l2", repoId: "r1", name: "enhancement", color: "#a2eeef", description: "New feature or request" },
    { id: "l3", repoId: "r1", name: "documentation", color: "#0075ca", description: "Improvements or additions to documentation" },
    { id: "l4", repoId: "r1", name: "good first issue", color: "#7057ff", description: "Good for newcomers" },
    { id: "l5", repoId: "r1", name: "help wanted", color: "#008672", description: "Extra attention is needed" },
    { id: "l6", repoId: "r1", name: "high-priority", color: "#b60205", description: "Needs immediate attention" },
    { id: "l7", repoId: "r1", name: "feature", color: "#0e8a16", description: "New feature" },
    { id: "l8", repoId: "r1", name: "question", color: "#d876e3", description: "Further information is requested" },
    { id: "l9", repoId: "r2", name: "enhancement", color: "#a2eeef", description: "New feature or request" }
  ],

  milestones: [
    { id: "m1", repoId: "r1", title: "v2.0", description: "Major release with auth and dark mode", dueDate: "2026-03-31", state: "open", createdAt: "2026-01-01T00:00:00Z" },
    { id: "m2", repoId: "r1", title: "v1.5", description: "Bug fixes and improvements", dueDate: "2026-02-28", state: "closed", createdAt: "2025-12-01T00:00:00Z" }
  ]
};
```

## Notes for Implementation

1. **New entities** (notifications, labels, milestones) need corresponding normalizer functions in `deepMergeWithDefaults` and actions in the reducer.

2. **Labels entity**: Currently labels are stored as plain strings on issues. The new `labels` entity adds color and description. The UI should look up label color from the `labels` array to render colored badges. Falls back to default blue if label entity not found.

3. **Reactions**: Currently not implemented. Add `reactions` field to issues and comments as an object `{ "+1": N, "-1": N, "heart": N, "rocket": N, "eyes": N }`.

4. **Actions data**: Currently hardcoded in `Actions.jsx`. Should be moved to state (already in `INITIAL_STATE.actions`) and rendered from state.

5. **Commit IDs**: Use 7-character hex-like strings for realism (e.g., `"a1b2c3d"`).
