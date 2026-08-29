# Xrello Mock — Data Model

## State Shape

The application state uses **normalized object maps** (keyed by ID) rather than arrays, matching the existing pattern in `mockData.js`.

```js
{
  boards: { [boardId]: Board },
  lists: { [listId]: List },
  cards: { [cardId]: Card },
  users: { [userId]: User },       // NEW: Move hardcoded users into state
  boardOrder: [boardId, ...],       // Display order of boards on home page
  currentUser: "u1"                 // Pre-logged-in user ID
}
```

---

## Entity Definitions

### Board
```js
{
  id: "board-1",                          // string (UUID)
  title: "Project Alpha",                 // string
  description: "",                        // string — board description (shown in menu)
  background: "#0079BF",                  // string — CSS color OR image URL
  listIds: ["list-1", "list-2"],          // string[] — ordered list references
  starred: true,                          // boolean
  visibility: "workspace",               // "private" | "workspace" | "public"
  archivedListIds: [],                    // string[] — archived list references
  archivedCardIds: [],                    // string[] — archived card references
  labels: [                               // Label[] — board-level label definitions
    { id: "lbl-1", name: "Urgent", color: "#eb5a46" },
    { id: "lbl-2", name: "Design", color: "#0079bf" },
    { id: "lbl-3", name: "Dev", color: "#61bd4f" },
    { id: "lbl-4", name: "Bug", color: "#ff9f1a" },
    { id: "lbl-5", name: "Feature", color: "#c377e0" },
    { id: "lbl-6", name: "Docs", color: "#f2d600" }
  ],
  memberIds: ["u1", "u2", "u3"],          // string[] — board member references
  createdAt: "2025-01-15T10:00:00Z"       // ISO 8601
}
```

### List
```js
{
  id: "list-1",                           // string (UUID)
  title: "To Do",                         // string
  boardId: "board-1",                     // string — parent board reference
  cardIds: ["card-1", "card-2"],          // string[] — ordered card references
  archived: false                         // boolean
}
```

### Card
```js
{
  id: "card-1",                           // string (UUID)
  title: "Research Competitors",          // string
  description: "Analyze the top 3...",    // string (supports markdown: bold, italic, lists, headers)
  listId: "list-1",                       // string — current list reference
  boardId: "board-1",                     // string — parent board reference
  labelIds: ["lbl-1", "lbl-2"],           // string[] — references to board-level labels
  memberIds: ["u1"],                      // string[] — assigned member references
  dueDate: "2025-03-15T17:00:00Z",       // string | null — ISO 8601
  startDate: null,                        // string | null — ISO 8601
  completed: false,                       // boolean — due date completion status
  cover: {                                // object | null
    type: "color",                        // "color" | "image"
    value: "#7BC86C"                      // CSS color string or image URL
  },
  checklists: [Checklist],               // Checklist[] — inline (not separate entity)
  comments: [Comment],                   // Comment[] — newest first
  attachments: [Attachment],             // Attachment[]
  archived: false,                        // boolean
  watching: false,                        // boolean — current user watching this card
  position: 0,                            // number — ordering within list
  createdAt: "2025-02-01T09:00:00Z"      // ISO 8601
}
```

**Note on labels:** The current codebase stores labels inline on cards with `{ id, text, color }`. The improved model stores label *definitions* on the Board and only `labelIds` on cards. This matches real Xrello where labels are board-level entities. The migration requires updating the reducer and CardModal label picker.

### User (Member)
```js
{
  id: "u1",                               // string
  name: "Alice Johnson",                  // string — full display name
  username: "alice",                      // string — short handle
  initials: "AJ",                         // string — 2 chars for avatar fallback
  avatarUrl: "https://picsum.photos/100/100?random=u1",  // string
  email: "alice@example.com"              // string
}
```

### Checklist (embedded in Card)
```js
{
  id: "cl-1",                             // string (UUID)
  title: "Tasks",                         // string
  items: [CheckItem]                      // CheckItem[]
}
```

### CheckItem (embedded in Checklist)
```js
{
  id: "ci-1",                             // string (UUID)
  text: "Find competitors",              // string
  completed: true,                        // boolean
  assigneeId: null,                       // string | null — member reference
  dueDate: null                           // string | null — ISO 8601
}
```

### Comment (embedded in Card.comments)
```js
{
  id: "com-1",                            // string (UUID)
  type: "comment",                        // "comment" | "activity"
  userId: "u1",                           // string — author reference
  text: "Great progress!",               // string
  createdAt: "2025-02-10T14:30:00Z",     // ISO 8601
  editedAt: null                          // string | null — ISO 8601
}
```

### Attachment (embedded in Card.attachments)
```js
{
  id: "att-1",                            // string (UUID)
  name: "Mockup.png",                    // string — display name
  url: "https://picsum.photos/300/200",  // string — image/file URL
  uploadedAt: "2025-02-05T11:00:00Z",   // ISO 8601
  uploadedBy: "u1"                        // string — member reference
}
```

---

## Relationships

```
User ←→ Board (many-to-many via board.memberIds)
Board → List (one-to-many via board.listIds, list.boardId)
Board → Label (one-to-many via board.labels)
List → Card (one-to-many via list.cardIds, card.listId)
Card → Label (many-to-many via card.labelIds → board.labels)
Card → User (many-to-many via card.memberIds)
Card → Checklist (one-to-many, embedded)
Card → Comment (one-to-many, embedded)
Card → Attachment (one-to-many, embedded)
```

---

## Suggested `createInitialData()` Structure

```js
export function createInitialData() {
  return {
    currentUser: "u1",
    users: {
      u1: { id: "u1", name: "Alice Johnson", username: "alice", initials: "AJ", avatarUrl: "...", email: "alice@example.com" },
      u2: { id: "u2", name: "Bob Smith", username: "bob", initials: "BS", avatarUrl: "...", email: "bob@example.com" },
      u3: { id: "u3", name: "Charlie Brown", username: "charlie", initials: "CB", avatarUrl: "...", email: "charlie@example.com" },
      u4: { id: "u4", name: "Diana Ross", username: "diana", initials: "DR", avatarUrl: "...", email: "diana@example.com" }
    },
    boards: {
      "board-1": {
        id: "board-1",
        title: "Project Alpha",
        description: "Main product development board for Q1 2025",
        background: "#0079BF",
        listIds: ["list-1", "list-2", "list-3", "list-4"],
        starred: true,
        visibility: "workspace",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-1", name: "Urgent", color: "#eb5a46" },
          { id: "lbl-2", name: "Design", color: "#0079bf" },
          { id: "lbl-3", name: "Dev", color: "#61bd4f" },
          { id: "lbl-4", name: "Bug", color: "#ff9f1a" },
          { id: "lbl-5", name: "Feature", color: "#c377e0" },
          { id: "lbl-6", name: "Documentation", color: "#f2d600" }
        ],
        memberIds: ["u1", "u2", "u3"],
        createdAt: "2025-01-15T10:00:00.000Z"
      },
      "board-2": {
        id: "board-2",
        title: "Marketing Campaign",
        description: "Q1 marketing initiatives",
        background: "#D29034",
        listIds: ["list-5", "list-6", "list-7"],
        starred: false,
        visibility: "private",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-7", name: "Social", color: "#0079bf" },
          { id: "lbl-8", name: "Email", color: "#61bd4f" },
          { id: "lbl-9", name: "Ads", color: "#eb5a46" },
          { id: "lbl-10", name: "Content", color: "#c377e0" }
        ],
        memberIds: ["u1", "u4"],
        createdAt: "2025-02-01T08:00:00.000Z"
      },
      "board-3": {
        id: "board-3",
        title: "Personal Tasks",
        description: "",
        background: "#519839",
        listIds: ["list-8", "list-9"],
        starred: true,
        visibility: "private",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-11", name: "Home", color: "#61bd4f" },
          { id: "lbl-12", name: "Work", color: "#0079bf" },
          { id: "lbl-13", name: "Health", color: "#eb5a46" }
        ],
        memberIds: ["u1"],
        createdAt: "2025-02-10T12:00:00.000Z"
      }
    },
    lists: {
      "list-1": { id: "list-1", title: "Backlog", boardId: "board-1", cardIds: ["card-1", "card-2"], archived: false },
      "list-2": { id: "list-2", title: "To Do", boardId: "board-1", cardIds: ["card-3", "card-4"], archived: false },
      "list-3": { id: "list-3", title: "In Progress", boardId: "board-1", cardIds: ["card-5"], archived: false },
      "list-4": { id: "list-4", title: "Done", boardId: "board-1", cardIds: ["card-6", "card-7"], archived: false },
      "list-5": { id: "list-5", title: "Ideas", boardId: "board-2", cardIds: ["card-8", "card-9"], archived: false },
      "list-6": { id: "list-6", title: "In Progress", boardId: "board-2", cardIds: ["card-10"], archived: false },
      "list-7": { id: "list-7", title: "Published", boardId: "board-2", cardIds: ["card-11"], archived: false },
      "list-8": { id: "list-8", title: "This Week", boardId: "board-3", cardIds: ["card-12", "card-13"], archived: false },
      "list-9": { id: "list-9", title: "Completed", boardId: "board-3", cardIds: ["card-14"], archived: false }
    },
    cards: {
      // Board 1 cards — varied states for training
      "card-1": {
        id: "card-1", title: "Research Competitors", description: "Analyze the top 3 competitors in the market.\n\n## Key Areas\n- **Pricing** comparison\n- Feature matrix\n- User reviews",
        listId: "list-1", boardId: "board-1", labelIds: ["lbl-1", "lbl-2"], memberIds: ["u1"],
        dueDate: null, startDate: null, completed: false,
        cover: null,
        checklists: [{ id: "cl-1", title: "Research Steps", items: [
          { id: "ci-1", text: "Identify top 3 competitors", completed: true, assigneeId: null, dueDate: null },
          { id: "ci-2", text: "SWOT analysis", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-3", text: "Pricing comparison", completed: false, assigneeId: null, dueDate: null }
        ]}],
        comments: [
          { id: "com-1", type: "comment", userId: "u2", text: "I can help with the pricing comparison part", createdAt: "2025-02-20T14:30:00.000Z", editedAt: null },
          { id: "act-1", type: "activity", userId: "u1", text: "added this card to Backlog", createdAt: "2025-02-18T09:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: false, position: 0, createdAt: "2025-02-18T09:00:00.000Z"
      },
      "card-2": {
        id: "card-2", title: "Design System Draft", description: "",
        listId: "list-1", boardId: "board-1", labelIds: ["lbl-2"], memberIds: [],
        dueDate: null, startDate: null, completed: false,
        cover: { type: "image", value: "https://picsum.photos/400/200?random=cover1" },
        checklists: [], comments: [],
        attachments: [{ id: "att-1", name: "Mockup.png", url: "https://picsum.photos/300/200?random=attach1", uploadedAt: "2025-02-19T11:00:00.000Z", uploadedBy: "u1" }],
        archived: false, watching: false, position: 1, createdAt: "2025-02-19T10:00:00.000Z"
      },
      "card-3": {
        id: "card-3", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment.",
        listId: "list-2", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u2"],
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-20T08:00:00.000Z"
      },
      "card-4": {
        id: "card-4", title: "User authentication flow", description: "Implement login, registration, and password reset flows.",
        listId: "list-2", boardId: "board-1", labelIds: ["lbl-3", "lbl-5"], memberIds: ["u1", "u3"],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), startDate: null, completed: false,
        cover: { type: "color", value: "#7BC86C" },
        checklists: [{ id: "cl-2", title: "Auth Tasks", items: [
          { id: "ci-4", text: "Login form", completed: true, assigneeId: "u1", dueDate: null },
          { id: "ci-5", text: "Registration form", completed: true, assigneeId: "u3", dueDate: null },
          { id: "ci-6", text: "Password reset", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-7", text: "Email verification", completed: false, assigneeId: null, dueDate: null }
        ]}],
        comments: [
          { id: "com-2", type: "comment", userId: "u3", text: "Registration form is ready for review", createdAt: "2025-02-22T16:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: true, position: 1, createdAt: "2025-02-20T09:00:00.000Z"
      },
      "card-5": {
        id: "card-5", title: "API Integration", description: "Connect to the backend REST endpoints.",
        listId: "list-3", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u1"],
        dueDate: new Date(Date.now() - 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [],
        comments: [
          { id: "com-3", type: "comment", userId: "u2", text: "Waiting for API keys from the backend team", createdAt: "2025-02-24T10:00:00.000Z", editedAt: null },
          { id: "act-2", type: "activity", userId: "u1", text: "moved this card from To Do to In Progress", createdAt: "2025-02-23T14:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: false, position: 0, createdAt: "2025-02-21T08:00:00.000Z"
      },
      "card-6": {
        id: "card-6", title: "Project Setup", description: "Initial repo setup with Vite + React + Tailwind",
        listId: "list-4", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u1"],
        dueDate: "2025-02-16T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-15T08:00:00.000Z"
      },
      "card-7": {
        id: "card-7", title: "Database schema design", description: "Design PostgreSQL schema for all entities.",
        listId: "list-4", boardId: "board-1", labelIds: ["lbl-3", "lbl-6"], memberIds: ["u2"],
        dueDate: "2025-02-18T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-16T10:00:00.000Z"
      },
      // Board 2 — Marketing cards
      "card-8": {
        id: "card-8", title: "Blog post: Product launch", description: "Write announcement blog post for v2.0 launch.",
        listId: "list-5", boardId: "board-2", labelIds: ["lbl-10"], memberIds: ["u4"],
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-22T09:00:00.000Z"
      },
      "card-9": {
        id: "card-9", title: "Social media campaign", description: "Plan Twitter + LinkedIn campaign for launch week.",
        listId: "list-5", boardId: "board-2", labelIds: ["lbl-7"], memberIds: ["u1", "u4"],
        dueDate: null, startDate: null, completed: false,
        cover: { type: "color", value: "#5BA4CF" }, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-22T10:00:00.000Z"
      },
      "card-10": {
        id: "card-10", title: "Email newsletter draft", description: "Write and design the launch newsletter.",
        listId: "list-6", boardId: "board-2", labelIds: ["lbl-8"], memberIds: ["u4"],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-23T08:00:00.000Z"
      },
      "card-11": {
        id: "card-11", title: "Landing page copy", description: "Updated copy for the product landing page.",
        listId: "list-7", boardId: "board-2", labelIds: ["lbl-10"], memberIds: ["u4"],
        dueDate: "2025-02-20T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-18T09:00:00.000Z"
      },
      // Board 3 — Personal tasks
      "card-12": {
        id: "card-12", title: "Grocery shopping", description: "",
        listId: "list-8", boardId: "board-3", labelIds: ["lbl-11"], memberIds: ["u1"],
        dueDate: new Date(Date.now() + 86400000).toISOString(), startDate: null, completed: false,
        cover: null,
        checklists: [{ id: "cl-3", title: "Shopping List", items: [
          { id: "ci-8", text: "Milk", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-9", text: "Bread", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-10", text: "Eggs", completed: true, assigneeId: null, dueDate: null }
        ]}],
        comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-25T08:00:00.000Z"
      },
      "card-13": {
        id: "card-13", title: "Schedule dentist appointment", description: "Call Dr. Smith's office.",
        listId: "list-8", boardId: "board-3", labelIds: ["lbl-13"], memberIds: ["u1"],
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-25T09:00:00.000Z"
      },
      "card-14": {
        id: "card-14", title: "File taxes", description: "Complete 2024 tax filing.",
        listId: "list-9", boardId: "board-3", labelIds: ["lbl-12"], memberIds: ["u1"],
        dueDate: "2025-02-20T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-10T12:00:00.000Z"
      }
    },
    boardOrder: ["board-1", "board-2", "board-3"]
  };
}
```

---

## Migration Notes from Current Codebase

The current `mockData.js` uses UUID-generated IDs and a simpler structure. Key changes needed:

1. **Labels**: Move from inline `card.labels: [{id, text, color}]` to board-level `board.labels` + `card.labelIds: [string]`
2. **Users**: Move from hardcoded array in `CardModal.jsx` to `state.users` object map
3. **Cover**: Change from simple string URL to `{ type, value }` object to support both color and image covers
4. **Members**: Rename `card.members` to `card.memberIds` for clarity
5. **Fixed IDs**: Use deterministic IDs (e.g., "board-1", "card-1") instead of random UUIDs for seed data, making state diffs easier to read in `/go` endpoint
6. **More boards**: Expand from 1 board to 3 boards with 14 total cards across varied scenarios
