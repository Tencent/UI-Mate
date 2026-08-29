# Xoogle Docs Mock - Architecture Design

## 1. Application Overview

**Real Application**: https://docs.google.com
**Core Purpose**: A rich-text document editor with real-time formatting toolbar, document management, comments, and sharing UI -- replicating the core Xoogle Docs experience for RL agent training.

## 2. Core Features (Priority Ordered)

1. **Rich Text Editing** - Tiptap-based WYSIWYG editor with formatting (bold, italic, underline, strikethrough, text color, highlight) -- High priority
2. **Formatting Toolbar** - Xoogle Docs-style toolbar with font family, font size, text style (Normal, Title, Subtitle, Heading 1-6), alignment, lists, indent/outdent, undo/redo -- High priority
3. **Menu Bar** - File, Edit, View, Insert, Format, Tools, Help menus with submenus and keyboard shortcuts -- High priority
4. **Document List/Home Page** - Grid/list of recent documents with create, rename, delete, star, and search -- High priority
5. **Insert Features** - Insert images, tables, links, horizontal rules, page breaks, special characters -- Medium priority
6. **Comments & Suggestions** - Comment sidebar, add/reply/resolve comments anchored to text selections -- Medium priority
7. **Share Dialog** - Share modal with email input, permission levels (Viewer/Commenter/Editor), link sharing toggle -- Medium priority
8. **Find and Replace** - In-document search with replace functionality -- Low priority (stretch)
9. **Version History** - View previous versions, restore old versions -- Low priority (stretch)
10. **Print/Download** - Export as PDF/DOCX stubs -- Out of scope

## 3. Pages and Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | DocumentList | Home page showing recent documents grid with search and create |
| `/document/:docId` | DocumentEditor | Full editor view with toolbar, menu bar, editor canvas, and comments |
| `/go` | GoDebug | State inspection endpoint returning initial_state, current_state, state_diff |

## 4. Data Structure

```javascript
{
  // Current user
  "currentUser": {
    "id": "user-1",
    "name": "Demo User",
    "email": "demo@example.com",
    "avatar": "https://picsum.photos/100/100?random=user1"
  },

  // All known users (for sharing, comments, collaborator display)
  "users": [
    {
      "id": "user-1",
      "name": "Demo User",
      "email": "demo@example.com",
      "avatar": "https://picsum.photos/100/100?random=user1"
    },
    {
      "id": "user-2",
      "name": "Alice Chen",
      "email": "alice@example.com",
      "avatar": "https://picsum.photos/100/100?random=user2"
    },
    {
      "id": "user-3",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "avatar": "https://picsum.photos/100/100?random=user3"
    }
  ],

  // Documents (flat map keyed by ID)
  "documents": {
    "doc-1": {
      "id": "doc-1",
      "title": "Project Proposal",
      "content": "<h1>Project Proposal</h1><p>Overview of the project...</p>",
      "ownerId": "user-1",
      "starred": false,
      "created": "2025-01-15T10:00:00Z",
      "updated": "2025-02-18T14:30:00Z",
      "sharedWith": [
        { "userId": "user-2", "permission": "editor" },
        { "userId": "user-3", "permission": "viewer" }
      ],
      "linkSharing": { "enabled": false, "permission": "viewer" }
    }
  },

  // Comments (flat array, linked to documents by docId)
  "comments": [
    {
      "id": "comment-1",
      "docId": "doc-1",
      "userId": "user-2",
      "content": "Can we add more detail here?",
      "resolved": false,
      "created": "2025-02-10T09:00:00Z",
      "quotedText": "Overview of the project",
      "replies": [
        {
          "id": "reply-1",
          "userId": "user-1",
          "content": "Sure, I will expand this section.",
          "created": "2025-02-10T10:00:00Z"
        }
      ]
    }
  ],

  // UI state (ephemeral, not persisted in some cases)
  "ui": {
    "currentDocId": null,
    "sidebarOpen": false,
    "sidebarTab": "comments",
    "shareDialogOpen": false,
    "findReplaceOpen": false,
    "viewMode": "editing",
    "zoom": 100,
    "documentListView": "grid",
    "searchQuery": ""
  }
}
```

### Design Principles

- **Flat structure**: Documents and comments stored as flat collections keyed/referenced by ID
- **Normalized data**: Users stored once, referenced by userId in documents and comments
- **UI state separate**: Transient UI flags (sidebar, dialogs, zoom) separated from persistent data
- **Immutable updates**: All state updates produce new objects for reliable state diff tracking

## 5. Module Division

### Module A: Document Editor (Implementer-1)

**Components:**
- `components/Editor.jsx` - Tiptap rich text editor with content binding
- `components/Toolbar.jsx` - Xoogle Docs-style formatting toolbar (font, size, bold, italic, underline, color, alignment, lists, indent, undo/redo)
- `components/MenuBar.jsx` - Top menu bar (File, Edit, View, Insert, Format, Tools, Help) with dropdown submenus

**Responsibilities:**
- Rich text editing with Tiptap (StarterKit + extensions for underline, text color, highlight, text align, image, table, link, placeholder, task list)
- Toolbar buttons that toggle formatting on the editor
- Menu bar dropdowns with clickable actions (insert image, insert table, toggle bold, etc.)
- Heading style dropdown (Normal, Title, Subtitle, Heading 1-6)
- Font family and font size dropdowns
- Text and highlight color pickers
- Undo/redo buttons

**Dependencies:** None (receives `content`, `onChange`, `onTitleChange` props from parent)

**Exports:**
```
<Editor content={string} onChange={fn} editable={bool} />
<Toolbar editor={tiptapEditorInstance} />
<MenuBar editor={tiptapEditorInstance} onAction={fn} />
```

---

### Module B: Document Management (Implementer-2)

**Components:**
- `pages/DocumentList.jsx` - Home page with document grid/list, search bar, create button
- `components/DocumentCard.jsx` - Individual document card (thumbnail preview, title, last modified, owner)
- `components/RenameDialog.jsx` - Inline rename or modal for renaming documents

**Responsibilities:**
- Display documents as a grid (default) or list with toggle
- Search/filter documents by title
- Create new blank document (navigates to editor)
- Rename document (inline editable title)
- Delete document (with confirmation)
- Star/unstar document
- Sort documents (last modified, alphabetical, created date)
- Show document metadata (owner, last modified date, shared status icon)

**Dependencies:** None (reads documents from context, dispatches actions)

**Exports:**
```
<DocumentList />
<DocumentCard doc={object} onOpen={fn} onStar={fn} onDelete={fn} onRename={fn} />
<RenameDialog isOpen={bool} currentName={string} onRename={fn} onClose={fn} />
```

---

### Module C: Comments & Sharing (Implementer-3)

**Components:**
- `components/CommentsSidebar.jsx` - Right sidebar listing all comments for the current document, with add/reply/resolve
- `components/CommentThread.jsx` - Individual comment thread (original comment + replies)
- `components/ShareDialog.jsx` - Share modal with email input, permission selector, link sharing toggle

**Responsibilities:**
- Display comments sidebar (toggle open/close)
- Add new comment (with quoted text from selection)
- Reply to existing comment
- Resolve/unresolve comment
- Delete comment
- Share dialog: add collaborators by email, set permission (Viewer/Commenter/Editor)
- Share dialog: toggle link sharing on/off, set link permission
- Display shared user avatars in document header

**Dependencies:** None (reads comments/documents from context, dispatches actions)

**Exports:**
```
<CommentsSidebar docId={string} />
<CommentThread comment={object} onReply={fn} onResolve={fn} onDelete={fn} />
<ShareDialog docId={string} isOpen={bool} onClose={fn} />
```

---

### Module D: Integration + Data Layer (Implementer-4)

**Components:**
- `App.jsx` - Main application with routing (BrowserRouter, Routes)
- `pages/DocumentEditor.jsx` - Editor page layout assembling Toolbar + MenuBar + Editor + CommentsSidebar + ShareDialog + document title
- `pages/GoDebug.jsx` - /go state inspection endpoint
- `context/DocsContext.jsx` - React Context with useReducer for global state management
- `store/initialData.js` - Default data, session-aware initialization, localStorage persistence, custom state fetching

**Responsibilities:**
- Define React Context with all actions (CREATE_DOC, UPDATE_DOC, DELETE_DOC, STAR_DOC, RENAME_DOC, ADD_COMMENT, REPLY_COMMENT, RESOLVE_COMMENT, DELETE_COMMENT, SHARE_DOC, UPDATE_LINK_SHARING, SET_UI)
- Session-aware state initialization (sid from URL query, localStorage persistence, custom state from /state endpoint)
- Wire up routing: `/` -> DocumentList, `/document/:docId` -> DocumentEditor, `/go` -> GoDebug
- Assemble DocumentEditor page layout (import Editor, Toolbar, MenuBar from Module A; CommentsSidebar, ShareDialog from Module C)
- Implement /go endpoint with initial_state, current_state, state_diff
- Configure project scaffolding: package.json, vite.config.js, tailwind.config.js, index.html, main.jsx

**Dependencies:** Depends on Modules A, B, C for components

**Exports:**
```
<DocsProvider> (wraps App)
useDocsContext() (hook for all modules to access state + dispatch)
```

## 6. API Endpoints

- `GET /go` - Returns `{ initial_state, current_state, state_diff }` for RL training observation
- `GET /state?sid=xxx` - (Optional) Fetch custom initial state for a session
- All other interactions are purely client-side state changes (no real backend)

## 7. Tech Stack

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | React 18 | Standard across all mocks |
| **Build Tool** | Vite 5 | Standard across all mocks |
| **Rich Text Editor** | Tiptap (@tiptap/react + extensions) | Proven in confluence_mock, extensible, provides programmatic control ideal for toolbar binding |
| **State Management** | React Context + useReducer | Sufficient for this scope, matches confluence_mock pattern |
| **Styling** | Tailwind CSS 3 | Standard for newer mocks, fast development |
| **Routing** | react-router-dom v6 | Standard across all mocks |
| **Icons** | lucide-react | Standard across all mocks |
| **Utilities** | uuid, clsx, date-fns | Standard utility set |

### Tiptap Extensions Required

```
@tiptap/react
@tiptap/starter-kit          (bold, italic, strike, code, headings, lists, blockquote, code-block, horizontal-rule, history)
@tiptap/extension-underline  (underline formatting)
@tiptap/extension-text-align (left, center, right, justify)
@tiptap/extension-color      (text color)
@tiptap/extension-text-style (required by color/font-family)
@tiptap/extension-highlight  (background highlight color)
@tiptap/extension-image      (insert images)
@tiptap/extension-link       (hyperlinks)
@tiptap/extension-table      (tables)
@tiptap/extension-table-row
@tiptap/extension-table-cell
@tiptap/extension-table-header
@tiptap/extension-placeholder (placeholder text)
@tiptap/extension-task-list  (checklist)
@tiptap/extension-task-item
@tiptap/extension-font-family (font selection)
```

## 8. File Structure

```
google_docs_mock/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── ARCHITECTURE.md
├── src/
│   ├── main.jsx                          # React entry point
│   ├── App.jsx                           # (Implementer-4) Routing + providers
│   ├── index.css                         # Tailwind directives + global styles
│   ├── components/
│   │   ├── Editor.jsx                    # (Implementer-1) Tiptap rich text editor
│   │   ├── Toolbar.jsx                   # (Implementer-1) Formatting toolbar
│   │   ├── MenuBar.jsx                   # (Implementer-1) File/Edit/View/Insert/Format/Tools/Help menus
│   │   ├── DocumentCard.jsx              # (Implementer-2) Document card for list/grid
│   │   ├── RenameDialog.jsx              # (Implementer-2) Rename modal
│   │   ├── CommentsSidebar.jsx           # (Implementer-3) Comments panel
│   │   ├── CommentThread.jsx             # (Implementer-3) Single comment thread
│   │   └── ShareDialog.jsx              # (Implementer-3) Share/permissions modal
│   ├── pages/
│   │   ├── DocumentList.jsx              # (Implementer-2) Home page with doc grid
│   │   ├── DocumentEditor.jsx            # (Implementer-4) Editor page layout
│   │   └── GoDebug.jsx                   # (Implementer-4) /go debug endpoint
│   ├── context/
│   │   └── DocsContext.jsx               # (Implementer-4) State management
│   └── store/
│       └── initialData.js                # (Implementer-4) Default data + persistence
```

## 9. Initial Data Sample

```javascript
const initialData = {
  currentUser: {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://picsum.photos/100/100?random=user1'
  },
  users: [
    { id: 'user-1', name: 'Demo User', email: 'demo@example.com', avatar: 'https://picsum.photos/100/100?random=user1' },
    { id: 'user-2', name: 'Alice Chen', email: 'alice@example.com', avatar: 'https://picsum.photos/100/100?random=user2' },
    { id: 'user-3', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://picsum.photos/100/100?random=user3' }
  ],
  documents: {
    'doc-1': {
      id: 'doc-1',
      title: 'Project Proposal',
      content: '<h1>Project Proposal</h1><p>This document outlines the goals, timeline, and deliverables for the upcoming project.</p><h2>Goals</h2><ul><li>Improve user engagement by 25%</li><li>Launch new dashboard by Q2</li><li>Reduce page load time to under 2 seconds</li></ul><h2>Timeline</h2><p>Phase 1: January - March (Research &amp; Design)</p><p>Phase 2: April - June (Development &amp; Testing)</p><h2>Team</h2><p>Lead: Demo User</p><p>Design: Alice Chen</p><p>Engineering: Bob Smith</p>',
      ownerId: 'user-1',
      starred: true,
      created: '2025-01-15T10:00:00Z',
      updated: '2025-02-18T14:30:00Z',
      sharedWith: [
        { userId: 'user-2', permission: 'editor' },
        { userId: 'user-3', permission: 'viewer' }
      ],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-2': {
      id: 'doc-2',
      title: 'Meeting Notes - Feb 2025',
      content: '<h1>Meeting Notes</h1><h2>Date: February 14, 2025</h2><h3>Attendees</h3><p>Demo User, Alice Chen, Bob Smith</p><h3>Agenda</h3><ol><li>Review Q1 progress</li><li>Discuss new feature requests</li><li>Plan sprint goals</li></ol><h3>Action Items</h3><ul><li>Demo User: Update project timeline</li><li>Alice: Share design mockups by Friday</li><li>Bob: Set up staging environment</li></ul>',
      ownerId: 'user-1',
      starred: false,
      created: '2025-02-14T09:00:00Z',
      updated: '2025-02-14T11:00:00Z',
      sharedWith: [{ userId: 'user-2', permission: 'editor' }],
      linkSharing: { enabled: true, permission: 'viewer' }
    },
    'doc-3': {
      id: 'doc-3',
      title: 'API Documentation',
      content: '<h1>API Documentation</h1><p>REST API reference for the application backend.</p><h2>Authentication</h2><p>All API requests require a Bearer token in the Authorization header.</p><h2>Endpoints</h2><h3>GET /api/users</h3><p>Returns a list of all users.</p><h3>POST /api/documents</h3><p>Creates a new document. Required fields: title, content.</p><h3>PUT /api/documents/:id</h3><p>Updates an existing document.</p>',
      ownerId: 'user-2',
      starred: false,
      created: '2025-01-20T08:00:00Z',
      updated: '2025-02-10T16:45:00Z',
      sharedWith: [
        { userId: 'user-1', permission: 'editor' },
        { userId: 'user-3', permission: 'commenter' }
      ],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-4': {
      id: 'doc-4',
      title: 'Weekly Status Report',
      content: '<h1>Weekly Status Report</h1><h2>Week of February 10-14, 2025</h2><h3>Completed</h3><ul><li>Finished authentication module</li><li>Deployed database migration</li><li>Code review for PR #142</li></ul><h3>In Progress</h3><ul><li>Dashboard redesign (70% complete)</li><li>Performance optimization</li></ul><h3>Blocked</h3><ul><li>Waiting on design approval for mobile layout</li></ul>',
      ownerId: 'user-1',
      starred: true,
      created: '2025-02-10T08:00:00Z',
      updated: '2025-02-14T17:00:00Z',
      sharedWith: [],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-5': {
      id: 'doc-5',
      title: 'Onboarding Guide',
      content: '<h1>New Employee Onboarding Guide</h1><p>Welcome to the team! This guide will help you get set up.</p><h2>Day 1</h2><ol><li>Set up your workstation</li><li>Install required software</li><li>Join Slack channels</li></ol><h2>Week 1</h2><ol><li>Complete security training</li><li>Meet your team members</li><li>Review codebase documentation</li></ol><h2>Month 1</h2><ol><li>Complete first project milestone</li><li>Schedule 1-on-1 with manager</li><li>Submit feedback on onboarding experience</li></ol>',
      ownerId: 'user-3',
      starred: false,
      created: '2024-12-01T10:00:00Z',
      updated: '2025-01-05T09:30:00Z',
      sharedWith: [
        { userId: 'user-1', permission: 'viewer' },
        { userId: 'user-2', permission: 'viewer' }
      ],
      linkSharing: { enabled: true, permission: 'viewer' }
    }
  },
  comments: [
    {
      id: 'comment-1',
      docId: 'doc-1',
      userId: 'user-2',
      content: 'Should we add budget estimates to the proposal?',
      resolved: false,
      created: '2025-02-12T09:00:00Z',
      quotedText: 'goals, timeline, and deliverables',
      replies: [
        { id: 'reply-1', userId: 'user-1', content: 'Good idea, I will add a budget section.', created: '2025-02-12T10:30:00Z' }
      ]
    },
    {
      id: 'comment-2',
      docId: 'doc-1',
      userId: 'user-3',
      content: 'The Q2 launch date might be too aggressive. Can we discuss?',
      resolved: false,
      created: '2025-02-15T14:00:00Z',
      quotedText: 'Launch new dashboard by Q2',
      replies: []
    },
    {
      id: 'comment-3',
      docId: 'doc-2',
      userId: 'user-2',
      content: 'I have shared the mockups in the shared drive.',
      resolved: true,
      created: '2025-02-15T08:00:00Z',
      quotedText: 'Share design mockups by Friday',
      replies: []
    }
  ],
  ui: {
    currentDocId: null,
    sidebarOpen: false,
    sidebarTab: 'comments',
    shareDialogOpen: false,
    findReplaceOpen: false,
    viewMode: 'editing',
    zoom: 100,
    documentListView: 'grid',
    searchQuery: ''
  }
};
```

## 10. References

### Similar Mocks Studied
- **confluence_mock** - Tiptap editor integration, Context + useReducer state management, comments system, page tree sidebar, session-aware state persistence
- **notion_mock** - Block-based editing, normalized page/block data structure, Context + useReducer, session-aware initialization
- **google_drive_mock** - Google ecosystem UI styling (header, sidebar, rounded content area), file management patterns
- **google_sheets_mock** - Google app layout patterns, simple routing structure

### Real App Research
- Xoogle Docs UI: Menu bar (File/Edit/View/Insert/Format/Tools/Help), formatting toolbar (font, size, bold, italic, underline, color, alignment, lists, indent), document canvas with margins
- Key toolbar elements: Undo/Redo, Print, Spell check, Paint format, Zoom, Text style dropdown, Font dropdown, Font size, Bold/Italic/Underline/Color/Highlight, Link, Comment, Image, Alignment, Line spacing, Lists, Indent/Outdent
- Xoogle Docs home page: Document grid with thumbnails, search bar, template gallery, recent/starred/shared sections

### Key Architectural Decisions
1. **Tiptap over custom editor** - Proven in confluence_mock, provides all needed formatting extensions, programmatic API for toolbar binding
2. **React Context over Redux** - Sufficient complexity for this scope, consistent with confluence_mock pattern, simpler setup
3. **Documents as flat map** - O(1) lookup by ID, easy to update individual documents without array mutation
4. **Comments as flat array** - Simple filtering by docId, replies nested within comments (max 1 level deep, matching Xoogle Docs pattern)
5. **Session-aware persistence** - Follows established pattern from confluence_mock/notion_mock for RL training sessions with sid support
