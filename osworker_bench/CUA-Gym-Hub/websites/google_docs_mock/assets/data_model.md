# Xoogle Docs Mock — Data Model

## Entity Types

### User
```javascript
{
  id: 'user-1',              // string, unique identifier
  name: 'Demo User',         // string, display name
  email: 'demo@example.com', // string, email address
  avatar: 'https://...'      // string, avatar image URL
}
```

### Document
```javascript
{
  id: 'doc-1',                            // string, unique identifier
  title: 'Project Proposal',              // string, document title
  content: '<h1>...</h1><p>...</p>',      // string, HTML content (TipTap-compatible)
  ownerId: 'user-1',                      // string, references User.id
  starred: true,                          // boolean, starred by current user
  created: '2025-01-15T10:00:00Z',        // string, ISO 8601 timestamp
  updated: '2025-02-18T14:30:00Z',        // string, ISO 8601 timestamp
  sharedWith: [                           // array, sharing permissions
    { userId: 'user-2', permission: 'editor' }    // 'editor' | 'commenter' | 'viewer'
  ],
  linkSharing: {                          // object, link sharing settings
    enabled: false,                       // boolean, link sharing on/off
    permission: 'viewer'                  // 'viewer' | 'commenter' | 'editor'
  }
}
```

### Comment
```javascript
{
  id: 'comment-1',                          // string, unique identifier
  docId: 'doc-1',                           // string, references Document.id
  userId: 'user-2',                         // string, references User.id (comment author)
  content: 'Should we add budget estimates?', // string, comment text
  resolved: false,                          // boolean, resolved status
  created: '2025-02-12T09:00:00Z',         // string, ISO 8601 timestamp
  quotedText: 'goals, timeline, and deliverables', // string, highlighted text from document
  replies: [                                // array, nested replies (max 1 level)
    {
      id: 'reply-1',                        // string, unique identifier
      userId: 'user-1',                     // string, references User.id
      content: 'Good idea, I will add a budget section.', // string
      created: '2025-02-12T10:30:00Z'       // string, ISO 8601 timestamp
    }
  ]
}
```

### UI State
```javascript
{
  currentDocId: null,              // string | null, currently open document
  sidebarOpen: false,              // boolean, comments sidebar visibility
  sidebarTab: 'comments',         // string, active sidebar tab
  shareDialogOpen: false,          // boolean, share dialog visibility
  findReplaceOpen: false,          // boolean, find/replace bar visibility
  viewMode: 'editing',            // 'editing' | 'suggesting' | 'viewing'
  zoom: 100,                      // number, zoom percentage (50-200)
  documentListView: 'grid',       // 'grid' | 'list'
  searchQuery: ''                 // string, home page search filter
}
```

## Relationships

```
User (1) ──owns──> (N) Document
User (1) ──authors──> (N) Comment
User (1) ──authors──> (N) Reply
Document (1) ──has──> (N) Comment
Document (1) ──sharedWith──> (N) User (via sharedWith array)
Comment (1) ──has──> (N) Reply (nested, max 1 level)
```

## createInitialData() Structure

```javascript
export const initialData = {
  currentUser: { id, name, email, avatar },
  users: [ /* 3-5 users */ ],
  documents: {
    'doc-1': { /* keyed by id for O(1) lookup */ },
    'doc-2': { ... },
    // ... 5 documents total
  },
  comments: [
    { /* flat array, filtered by docId */ },
    // ... 3+ comments across documents
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

## Reducer Actions (Already Implemented)

| Action | Payload | Effect |
|--------|---------|--------|
| `INIT_STATE` | `{ ...fullState }` | Replace entire state |
| `CREATE_DOC` | `{ id, title }` | Add new document to `documents` map |
| `UPDATE_DOC` | `{ docId, ...fields }` | Merge fields into existing document |
| `DELETE_DOC` | `{ docId }` | Remove document + its comments |
| `STAR_DOC` | `{ docId }` | Toggle `starred` boolean |
| `RENAME_DOC` | `{ docId, title }` | Update document title + timestamp |
| `ADD_COMMENT` | `{ docId, content, quotedText }` | Push new comment to array |
| `REPLY_COMMENT` | `{ commentId, content }` | Push reply to comment's replies |
| `RESOLVE_COMMENT` | `{ commentId }` | Toggle `resolved` boolean |
| `DELETE_COMMENT` | `{ commentId }` | Remove comment from array |
| `SHARE_DOC` | `{ docId, userId, permission }` | Add/update/remove sharing |
| `UPDATE_LINK_SHARING` | `{ docId, enabled, permission }` | Update link sharing settings |
| `SET_UI` | `{ ...uiFields }` | Merge into `ui` state |

## Normalization Notes for POST API

When custom state is POSTed via `/post?sid=`, the `deepMergeWithDefaults` function should ensure:
- `documents` is an object (not array), keyed by id
- Each document has all required fields with defaults
- `comments` is an array with properly structured objects
- `sharedWith` arrays contain valid `{ userId, permission }` objects
- `linkSharing` objects have both `enabled` and `permission` fields
- `ui` state has all fields with sensible defaults
