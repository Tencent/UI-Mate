
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
        { id: "u1", username: "octocat", name: "The Octocat", email: "octocat@github.com", avatar: "https://avatars.githubusercontent.com/u/583231?v=4", bio: "I love coding and open source!", location: "San Francisco, CA", company: "XitHub", website: "https://github.com/octocat", joinedAt: "2020-01-15T00:00:00Z" },
        { id: "u2", username: "mojombo", name: "Tom Preston-Werner", email: "tom@github.com", avatar: "https://avatars.githubusercontent.com/u/1?v=4", bio: "XitHub co-founder", location: "San Francisco, CA", company: "XitHub", website: "https://tom.preston-werner.com", joinedAt: "2007-10-20T00:00:00Z" },
        { id: "u3", username: "defunkt", name: "Chris Wanstrath", email: "chris@github.com", avatar: "https://avatars.githubusercontent.com/u/2?v=4", bio: "Another co-founder", location: "San Francisco, CA", company: "XitHub", website: "", joinedAt: "2007-10-20T00:00:00Z" },
        { id: "u4", username: "pjhyett", name: "PJ Hyett", email: "pj@github.com", avatar: "https://avatars.githubusercontent.com/u/3?v=4", bio: "Developer", location: "San Francisco, CA", company: "XitHub", website: "", joinedAt: "2007-10-20T00:00:00Z" },
        { id: "u5", username: "wycats", name: "Yehuda Katz", email: "wycats@github.com", avatar: "https://avatars.githubusercontent.com/u/4?v=4", bio: "Open source contributor", location: "Portland, OR", company: "Tilde", website: "https://yehudakatz.com", joinedAt: "2008-03-15T00:00:00Z" }
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
        { id: "b1", repoId: "r1", name: "main", lastCommitId: "i7j8k9l" },
        { id: "b2", repoId: "r1", name: "feature/auth", lastCommitId: "m0n1o2p" },
        { id: "b3", repoId: "r1", name: "fix/button-style", lastCommitId: "q3r4s5t" },
        { id: "b4", repoId: "r2", name: "main", lastCommitId: "y9z0a1b" },
        { id: "b5", repoId: "r3", name: "main", lastCommitId: "c2d3e4f" }
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
            { id: "prc1", authorId: "u2", content: "Great work! Just a few minor suggestions.", date: "2026-02-16T14:00:00Z", reactions: {} },
            { id: "prc2", authorId: "u1", content: "Updated based on feedback. Added token expiry handling.", date: "2026-02-17T09:00:00Z", reactions: {} }
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
      ],

      discussions: [
        {
          id: "d1", repoId: "r1", title: "What's the best way to structure components?",
          body: "I'm trying to figure out the ideal component structure for this project. Should we use atomic design or feature-based organization?",
          category: "General", authorId: "u2",
          replies: [
            { id: "dr1", authorId: "u1", content: "I'd recommend feature-based organization for this size project. It scales better.", date: "2026-02-20T11:00:00Z" },
            { id: "dr2", authorId: "u3", content: "Agreed with @octocat. Atomic design adds too much overhead for small teams.", date: "2026-02-20T14:00:00Z" }
          ],
          createdAt: "2026-02-20T10:00:00Z"
        },
        {
          id: "d2", repoId: "r1", title: "How do I set up the dev environment?",
          body: "I'm new to this project. The README says to run `npm install` but I'm getting peer dependency errors on Node 20. Any tips?",
          category: "Q&A", authorId: "u4",
          replies: [
            { id: "dr3", authorId: "u1", content: "Try running `npm install --legacy-peer-deps`. We're working on fixing the peer deps.", date: "2026-02-22T09:00:00Z" }
          ],
          createdAt: "2026-02-21T16:00:00Z"
        },
        {
          id: "d3", repoId: "r1", title: "Idea: Add a theming system",
          body: "It would be great to have a plugin-based theming system so users can customize the look and feel without touching core CSS. Thoughts?",
          category: "Ideas", authorId: "u5",
          replies: [],
          createdAt: "2026-02-24T08:30:00Z"
        },
        {
          id: "d4", repoId: "r1", title: "Show and Tell: My fork with TypeScript migration",
          body: "I've been migrating this project to TypeScript in my fork. Here's what I learned and the tradeoffs I encountered.\n\n## Key Changes\n- Added `tsconfig.json` with strict mode\n- Converted all `.js` files to `.tsx`\n- Added type definitions for all components",
          category: "Show and tell", authorId: "u3",
          replies: [
            { id: "dr4", authorId: "u2", content: "This is amazing work! Would you be open to submitting a PR?", date: "2026-02-26T10:00:00Z" },
            { id: "dr5", authorId: "u1", content: "Really impressive. I'd love to review a PR for this.", date: "2026-02-26T12:00:00Z" }
          ],
          createdAt: "2026-02-25T15:00:00Z"
        }
      ],

      releases: [
        {
          id: "rel1", repoId: "r1", tag: "v2.0.0", title: "v2.0.0 - Authentication & Dark Mode",
          body: "## What's New\n\n- JWT-based authentication module\n- Dark mode toggle in settings\n- Improved button component with disabled state\n\n## Bug Fixes\n\n- Fixed special character handling in login form\n- Fixed responsive layout issues\n\n## Breaking Changes\n\n- Minimum Node.js version is now 18",
          authorId: "u1", date: "2026-02-26T14:30:00Z", isDraft: false,
          assets: [
            { name: "hello-world-2.0.0.tar.gz", size: "2.4 MB" },
            { name: "hello-world-2.0.0.zip", size: "3.1 MB" }
          ]
        },
        {
          id: "rel2", repoId: "r1", tag: "v1.5.0", title: "v1.5.0 - Bug Fixes & Improvements",
          body: "## Changes\n\n- Updated styles and responsive layout\n- Improved documentation\n- Added CI/CD pipeline",
          authorId: "u2", date: "2026-01-20T09:15:00Z", isDraft: false,
          assets: [
            { name: "hello-world-1.5.0.tar.gz", size: "2.1 MB" },
            { name: "hello-world-1.5.0.zip", size: "2.8 MB" }
          ]
        },
        {
          id: "rel3", repoId: "r1", tag: "v1.0.0", title: "v1.0.0 - Initial Release",
          body: "## Hello World v1.0.0\n\nThe first official release of the Hello World project.\n\n- Basic React application\n- Button component\n- Clean CSS styling",
          authorId: "u1", date: "2025-08-15T14:30:00Z", isDraft: false,
          assets: [
            { name: "hello-world-1.0.0.tar.gz", size: "1.8 MB" },
            { name: "hello-world-1.0.0.zip", size: "2.2 MB" }
          ]
        }
      ]
    };

    // --- Session-aware storage functions ---

    const BASE_STORAGE_KEY = 'gitmock_state';
    const BASE_INITIAL_KEY = 'gitmock_initialState';

    function storageKey(sid) {
      return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
    }
    function initialKey(sid) {
      return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
    }

    export const getSessionId = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSid = params.get('sid');
      if (urlSid) {
        sessionStorage.setItem('mock_sid', urlSid);
        return urlSid;
      }
      return sessionStorage.getItem('mock_sid') || null;
    };

    export const fetchCustomState = async (sid = null) => {
      try {
        const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.has_custom_state && data.stored_state) return data.stored_state;
        }
      } catch (e) {
        console.warn('[github_mock] Custom state fetch unavailable:', e);
      }
      return null;
    };

    export const saveState = (state, sid = null) => {
      localStorage.setItem(storageKey(sid), JSON.stringify(state));
      const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(e => {
        console.warn('[github_mock] Server state sync unavailable:', e);
      });
    };

    export const getInitialState = (sid = null) => {
      const stored = localStorage.getItem(initialKey(sid));
      return stored ? JSON.parse(stored) : null;
    };

    // --- Array normalization functions ---
    // Each normalizer fills in missing required fields with sensible defaults
    // to protect the UI from crashing on malformed POST data.

    function normalizeUser(user, index) {
      return {
        id: user.id || `u_${index + 1}`,
        username: user.username || user.name || `user_${index + 1}`,
        name: user.name || user.username || `User ${index + 1}`,
        email: user.email || '',
        avatar: user.avatar || `https://avatars.githubusercontent.com/u/${index + 10}?v=4`,
        bio: user.bio || '',
        location: user.location || '',
        company: user.company || '',
        website: user.website || '',
        joinedAt: user.joinedAt || user.joined_at || new Date().toISOString(),
      };
    }

    function normalizeRepo(repo, index) {
      return {
        id: repo.id || `r_${index + 1}`,
        ownerId: repo.ownerId || repo.owner_id || 'u1',
        name: repo.name || `repo-${index + 1}`,
        description: repo.description || repo.desc || '',
        language: repo.language || repo.lang || 'Unknown',
        languages: (typeof repo.languages === 'object' && repo.languages !== null && !Array.isArray(repo.languages))
          ? repo.languages
          : {},
        stars: typeof repo.stars === 'number' ? repo.stars : 0,
        forks: typeof repo.forks === 'number' ? repo.forks : 0,
        watchers: typeof repo.watchers === 'number' ? repo.watchers : 0,
        isPrivate: typeof repo.isPrivate === 'boolean' ? repo.isPrivate : (repo.private === true || false),
        defaultBranch: repo.defaultBranch || repo.default_branch || 'main',
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        license: repo.license || '',
        homepage: repo.homepage || '',
        hasWiki: typeof repo.hasWiki === 'boolean' ? repo.hasWiki : (typeof repo.has_wiki === 'boolean' ? repo.has_wiki : true),
        hasIssues: typeof repo.hasIssues === 'boolean' ? repo.hasIssues : (typeof repo.has_issues === 'boolean' ? repo.has_issues : true),
        hasProjects: typeof repo.hasProjects === 'boolean' ? repo.hasProjects : (typeof repo.has_projects === 'boolean' ? repo.has_projects : true),
        updatedAt: repo.updatedAt || repo.updated_at || new Date().toISOString(),
        createdAt: repo.createdAt || repo.created_at || new Date().toISOString(),
      };
    }

    function normalizeBranch(branch, index) {
      return {
        id: branch.id || `b_${index + 1}`,
        repoId: branch.repoId || branch.repo_id || '',
        name: branch.name || `branch-${index + 1}`,
        lastCommitId: branch.lastCommitId || branch.last_commit_id || '',
      };
    }

    function normalizeFile(file, index) {
      return {
        id: file.id || `f_${index + 1}`,
        repoId: file.repoId || file.repo_id || '',
        branch: file.branch || 'main',
        path: file.path || file.name || `file_${index + 1}`,
        content: file.content || file.body || '',
        language: file.language || file.lang || 'text',
      };
    }

    function normalizeCommit(commit, index) {
      return {
        id: commit.id || `c_${index + 1}`,
        repoId: commit.repoId || commit.repo_id || '',
        branch: commit.branch || 'main',
        message: commit.message || commit.msg || '(No message)',
        authorId: commit.authorId || commit.author_id || commit.author || '',
        date: commit.date || commit.createdAt || commit.created_at || new Date().toISOString(),
        additions: typeof commit.additions === 'number' ? commit.additions : 0,
        deletions: typeof commit.deletions === 'number' ? commit.deletions : 0,
      };
    }

    function normalizeComment(comment, index) {
      return {
        id: comment.id || `cm_${index + 1}`,
        authorId: comment.authorId || comment.author_id || comment.author || '',
        content: comment.content || comment.body || comment.text || '',
        date: comment.date || comment.createdAt || comment.created_at || new Date().toISOString(),
        reactions: (typeof comment.reactions === 'object' && comment.reactions !== null && !Array.isArray(comment.reactions))
          ? comment.reactions
          : {},
      };
    }

    function normalizeReviewer(reviewer, index) {
      return {
        userId: reviewer.userId || reviewer.user_id || reviewer.id || '',
        status: reviewer.status || reviewer.state || 'pending',
        date: reviewer.date || reviewer.createdAt || reviewer.created_at || new Date().toISOString(),
        body: reviewer.body || '',
      };
    }

    function normalizeCheck(check, index) {
      return {
        name: check.name || `Check ${index + 1}`,
        status: check.status || check.state || 'pending',
        detail: check.detail || '',
      };
    }

    function normalizeIssue(issue, index) {
      return {
        id: issue.id || `i_${index + 1}`,
        repoId: issue.repoId || issue.repo_id || '',
        number: typeof issue.number === 'number' ? issue.number : (index + 1),
        title: issue.title || '(No Title)',
        description: issue.description || issue.body || issue.content || '',
        status: issue.status || issue.state || 'open',
        authorId: issue.authorId || issue.author_id || issue.author || '',
        assignees: Array.isArray(issue.assignees) ? issue.assignees : [],
        labels: Array.isArray(issue.labels) ? issue.labels : [],
        milestone: issue.milestone || null,
        column: issue.column || 'todo',
        isPinned: typeof issue.isPinned === 'boolean' ? issue.isPinned : (typeof issue.is_pinned === 'boolean' ? issue.is_pinned : false),
        reactions: (typeof issue.reactions === 'object' && issue.reactions !== null && !Array.isArray(issue.reactions))
          ? issue.reactions
          : {},
        createdAt: issue.createdAt || issue.created_at || new Date().toISOString(),
        closedAt: issue.closedAt || issue.closed_at || null,
        comments: Array.isArray(issue.comments)
          ? issue.comments.map((c, ci) => normalizeComment(c, ci))
          : [],
      };
    }

    function normalizePullRequest(pr, index) {
      return {
        id: pr.id || `pr_${index + 1}`,
        repoId: pr.repoId || pr.repo_id || '',
        number: typeof pr.number === 'number' ? pr.number : (index + 1),
        title: pr.title || '(No Title)',
        description: pr.description || pr.body || pr.content || '',
        baseBranch: pr.baseBranch || pr.base_branch || pr.base || 'main',
        compareBranch: pr.compareBranch || pr.compare_branch || pr.head || '',
        status: pr.status || pr.state || 'open',
        isDraft: typeof pr.isDraft === 'boolean' ? pr.isDraft : (typeof pr.is_draft === 'boolean' ? pr.is_draft : false),
        authorId: pr.authorId || pr.author_id || pr.author || '',
        assignees: Array.isArray(pr.assignees) ? pr.assignees : [],
        labels: Array.isArray(pr.labels) ? pr.labels : [],
        milestone: pr.milestone || null,
        mergeStrategy: pr.mergeStrategy || pr.merge_strategy || null,
        mergedAt: pr.mergedAt || pr.merged_at || null,
        mergedBy: pr.mergedBy || pr.merged_by || null,
        createdAt: pr.createdAt || pr.created_at || new Date().toISOString(),
        closedAt: pr.closedAt || pr.closed_at || null,
        comments: Array.isArray(pr.comments)
          ? pr.comments.map((c, ci) => normalizeComment(c, ci))
          : [],
        reviewers: Array.isArray(pr.reviewers)
          ? pr.reviewers.map((r, ri) => normalizeReviewer(r, ri))
          : [],
        checks: Array.isArray(pr.checks)
          ? pr.checks.map((ch, ci) => normalizeCheck(ch, ci))
          : [],
      };
    }

    function normalizeWikiPage(page, index) {
      return {
        id: page.id || `w_${index + 1}`,
        repoId: page.repoId || page.repo_id || '',
        title: page.title || page.name || `Page ${index + 1}`,
        content: page.content || page.body || '',
        createdAt: page.createdAt || page.created_at || new Date().toISOString(),
        updatedAt: page.updatedAt || page.updated_at || new Date().toISOString(),
      };
    }

    function normalizeAction(action, index) {
      return {
        id: action.id || `a_${index + 1}`,
        repoId: action.repoId || action.repo_id || '',
        name: action.name || action.title || `Action ${index + 1}`,
        status: action.status || action.state || 'pending',
        runNumber: typeof action.runNumber === 'number' ? action.runNumber : (action.run_number || index + 1),
        branch: action.branch || 'main',
        event: action.event || 'push',
        duration: action.duration || '0m 0s',
        date: action.date || action.createdAt || action.created_at || new Date().toISOString(),
        triggeredBy: action.triggeredBy || action.triggered_by || '',
      };
    }

    function normalizeNotification(n, index) {
      return {
        id: n.id || `n_${index + 1}`,
        type: n.type || 'mention',
        repoId: n.repoId || n.repo_id || '',
        issueNumber: typeof n.issueNumber === 'number' ? n.issueNumber : (typeof n.issue_number === 'number' ? n.issue_number : null),
        title: n.title || '',
        isRead: typeof n.isRead === 'boolean' ? n.isRead : (typeof n.is_read === 'boolean' ? n.is_read : false),
        date: n.date || new Date().toISOString(),
      };
    }

    function normalizeLabel(label, index) {
      return {
        id: label.id || `l_${index + 1}`,
        repoId: label.repoId || label.repo_id || '',
        name: label.name || `label-${index + 1}`,
        color: label.color || '#0075ca',
        description: label.description || '',
      };
    }

    function normalizeDiscussionReply(reply, index) {
      return {
        id: reply.id || `dr_${index + 1}`,
        authorId: reply.authorId || reply.author_id || '',
        content: reply.content || reply.body || '',
        date: reply.date || reply.createdAt || reply.created_at || new Date().toISOString(),
      };
    }

    function normalizeDiscussion(disc, index) {
      return {
        id: disc.id || `d_${index + 1}`,
        repoId: disc.repoId || disc.repo_id || '',
        title: disc.title || `Discussion ${index + 1}`,
        body: disc.body || disc.content || '',
        category: disc.category || 'General',
        authorId: disc.authorId || disc.author_id || '',
        replies: Array.isArray(disc.replies)
          ? disc.replies.map((r, ri) => normalizeDiscussionReply(r, ri))
          : [],
        createdAt: disc.createdAt || disc.created_at || new Date().toISOString(),
      };
    }

    function normalizeRelease(rel, index) {
      return {
        id: rel.id || `rel_${index + 1}`,
        repoId: rel.repoId || rel.repo_id || '',
        tag: rel.tag || rel.tagName || rel.tag_name || `v${index + 1}.0.0`,
        title: rel.title || rel.name || `Release ${index + 1}`,
        body: rel.body || rel.description || '',
        authorId: rel.authorId || rel.author_id || '',
        date: rel.date || rel.createdAt || rel.created_at || new Date().toISOString(),
        isDraft: typeof rel.isDraft === 'boolean' ? rel.isDraft : false,
        assets: Array.isArray(rel.assets) ? rel.assets : [],
      };
    }

    function normalizeMilestone(ms, index) {
      return {
        id: ms.id || `m_${index + 1}`,
        repoId: ms.repoId || ms.repo_id || '',
        title: ms.title || `Milestone ${index + 1}`,
        description: ms.description || '',
        dueDate: ms.dueDate || ms.due_date || '',
        state: ms.state || 'open',
        createdAt: ms.createdAt || ms.created_at || new Date().toISOString(),
      };
    }

    // Map of array field names to their normalizer functions
    const arrayNormalizers = {
      users: normalizeUser,
      repos: normalizeRepo,
      branches: normalizeBranch,
      files: normalizeFile,
      commits: normalizeCommit,
      issues: normalizeIssue,
      pullRequests: normalizePullRequest,
      wiki: normalizeWikiPage,
      actions: normalizeAction,
      notifications: normalizeNotification,
      labels: normalizeLabel,
      milestones: normalizeMilestone,
      discussions: normalizeDiscussion,
      releases: normalizeRelease,
    };

    function deepMergeWithDefaults(defaults, custom) {
      if (!custom) return defaults;
      const result = { ...defaults };
      for (const key in custom) {
        if (custom[key] !== null && custom[key] !== undefined) {
          // If the custom value is an array and we have a normalizer for this key,
          // normalize each element to fill in missing required fields.
          if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
            result[key] = custom[key].map((item, index) => arrayNormalizers[key](item, index));
          } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
            result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
          } else {
            result[key] = custom[key];
          }
        }
      }
      return result;
    }

    function createDefaultData() {
      return { ...INITIAL_STATE };
    }

    export const initializeData = (sid = null, customState = null) => {
      const sk = storageKey(sid);
      const ik = initialKey(sid);

      if (customState) {
        const initialData = deepMergeWithDefaults(createDefaultData(), customState);
        localStorage.setItem(sk, JSON.stringify(initialData));
        localStorage.setItem(ik, JSON.stringify(initialData));
        return initialData;
      }

      const stored = localStorage.getItem(sk);
      if (stored) {
        if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
        return JSON.parse(stored);
      }

      const initialData = createDefaultData();
      localStorage.setItem(sk, JSON.stringify(initialData));
      localStorage.setItem(ik, JSON.stringify(initialData));
      return initialData;
    };
