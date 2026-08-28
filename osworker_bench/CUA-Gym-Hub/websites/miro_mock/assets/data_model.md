# Xiro Mock — Data Model

## Overview

The Xiro mock data is managed through `dataManager.js` using localStorage persistence. The core concept: a **User** owns **Boards**, each Board contains **Board Items** (sticky notes, shapes, text, connectors, frames), plus **Comments**, **Tags**, and metadata.

---

## Entity Definitions

### 1. User (Current User)

```javascript
{
  id: "user_1",
  name: "Alex Morgan",
  email: "alex.morgan@company.com",
  avatarUrl: "/avatars/alex.jpg",    // or generated initials avatar
  initials: "AM",
  color: "#4262ff",                   // user cursor/avatar color
  role: "owner",                      // owner | editor | viewer
  teamId: "team_1"
}
```

### 2. Team

```javascript
{
  id: "team_1",
  name: "My Team",
  memberCount: 4,
  members: [
    { id: "user_1", name: "Alex Morgan", initials: "AM", avatarUrl: null },
    { id: "user_2", name: "Jordan Lee", initials: "JL", avatarUrl: null },
    { id: "user_3", name: "Sam Chen", initials: "SC", avatarUrl: null },
    { id: "user_4", name: "Taylor Kim", initials: "TK", avatarUrl: null }
  ]
}
```

### 3. Project

```javascript
{
  id: "project_1",
  name: "Q1 Planning",
  teamId: "team_1",
  boardIds: ["board_1", "board_2"],
  createdAt: "2025-01-15T10:00:00Z"
}
```

### 4. Board

```javascript
{
  id: "board_1",
  name: "Sprint Retrospective",
  description: "Team retro for Sprint 23",
  projectId: "project_1",           // null if not in a project
  teamId: "team_1",
  createdBy: "user_1",
  createdAt: "2025-02-01T09:00:00Z",
  modifiedAt: "2025-02-15T14:30:00Z",
  starred: false,
  thumbnailColor: "#4262ff",        // fallback color for thumbnail
  viewedAt: "2025-02-15T14:30:00Z"  // for "Recent" sorting
}
```

### 5. Board Items (Common Fields)

All board items share these base fields:

```javascript
{
  id: "item_<uuid>",
  type: "sticky_note" | "shape" | "text" | "connector" | "frame" | "image",
  boardId: "board_1",
  x: 200,                          // center X position on canvas (pixels)
  y: 150,                          // center Y position on canvas (pixels)
  width: 199,                      // width in pixels
  height: 199,                     // height in pixels
  rotation: 0,                     // degrees, clockwise positive
  parentId: null,                  // frame ID if inside a frame, null otherwise
  locked: false,
  zIndex: 1,                       // layering order
  createdBy: "user_1",
  createdAt: "2025-02-01T09:15:00Z",
  modifiedAt: "2025-02-01T09:20:00Z"
}
```

### 6. StickyNote (extends Board Item)

```javascript
{
  // ...base fields
  type: "sticky_note",
  content: "Improve test coverage",    // plain text or simple HTML (<b>, <i>, <u>, <s>)
  shape: "square",                      // "square" (199x199 default) | "rectangle" (350x199 default)
  style: {
    fillColor: "light_yellow",          // one of the 16 sticky note colors (see below)
    textAlign: "center",                // "left" | "center" | "right"
    textAlignVertical: "middle",        // "top" | "middle" | "bottom"
    fontSize: "auto"                    // "auto" | number (14, 18, 24, 36, etc.)
  },
  tagIds: [],                           // array of tag IDs
  width: 199,
  height: 199
}
```

**Sticky Note Color Values (16 options):**

| Key | Hex | Visual |
|-----|-----|--------|
| `white` | `#ffffff` | White |
| `light_yellow` | `#fff9b1` | Light Yellow (default) |
| `yellow` | `#f5d128` | Yellow |
| `orange` | `#ff9d48` | Orange |
| `lime` | `#d5f692` | Lime |
| `yellow_green` | `#c9df56` | Yellow-Green |
| `green` | `#7bc86c` | Green |
| `cyan` | `#67c6c0` | Cyan/Teal |
| `light_pink` | `#f5c8d0` | Light Pink |
| `pink` | `#e481a8` | Pink |
| `violet` | `#be88c7` | Violet |
| `red` | `#ea6162` | Red/Coral |
| `light_blue` | `#b5c4e3` | Light Blue |
| `sky_blue` | `#97d5f2` | Sky Blue |
| `blue` | `#6fa0e3` | Blue |
| `black` | `#1a1a1a` | Black |

### 7. Shape (extends Board Item)

```javascript
{
  // ...base fields
  type: "shape",
  shapeType: "rectangle",             // see shape types below
  content: "User Service",            // text inside shape
  style: {
    fillColor: "#ffffff",              // hex color
    fillOpacity: 1.0,                  // 0.0 - 1.0
    borderColor: "#1a1a1a",            // hex color
    borderWidth: 2,                    // 0 - 24
    borderStyle: "normal",             // "normal" | "dashed" | "dotted"
    borderOpacity: 1.0,
    fontFamily: "arial",               // see font families below
    fontSize: 14,                      // device-independent pixels
    color: "#1a1a1a",                  // text color hex
    textAlign: "center",
    textAlignVertical: "middle"
  },
  width: 200,
  height: 120
}
```

**Shape Types:**
- Basic: `rectangle`, `round_rectangle`, `circle`, `triangle`, `rhombus`
- Extended: `parallelogram`, `trapezoid`, `pentagon`, `hexagon`, `octagon`
- Special: `star`, `cloud`, `cross`, `can` (cylinder)
- Callout: `wedge_round_rectangle_callout`
- Arrows: `right_arrow`, `left_arrow`, `left_right_arrow`
- Braces: `left_brace`, `right_brace`
- Flowchart: `flow_chart_predefined_process`

**Font Families (common subset for mock):**
`arial`, `roboto`, `open_sans`, `noto_sans`, `poppins`, `georgia`, `times_new_roman`, `courier_new`

### 8. Text (extends Board Item)

```javascript
{
  // ...base fields
  type: "text",
  content: "<p>Project Overview</p>",  // HTML content
  style: {
    fillColor: "transparent",           // background color, usually transparent
    fontFamily: "arial",
    fontSize: 24,
    color: "#1a1a1a",
    textAlign: "left",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  },
  width: 300,
  height: 40                            // auto-grows with content
}
```

### 9. Connector (extends Board Item — special positioning)

```javascript
{
  // ...base fields (x/y/width/height are computed from start/end)
  type: "connector",
  start: {
    itemId: "item_abc",               // ID of connected item (null for loose end)
    position: { x: 1.0, y: 0.5 },    // relative position on item (0-1 range)
    snapTo: "right"                   // "top" | "bottom" | "left" | "right" | "auto" | null
  },
  end: {
    itemId: "item_def",
    position: { x: 0.0, y: 0.5 },
    snapTo: "left"
  },
  shape: "curved",                    // "straight" | "elbowed" | "curved"
  style: {
    strokeColor: "#000000",
    strokeWidth: 1,                   // 1 - 24
    strokeStyle: "normal",            // "normal" | "dashed" | "dotted"
    startStrokeCap: "none",           // see cap types below
    endStrokeCap: "stealth"           // default arrow
  },
  captions: [                         // optional text labels on connector
    {
      content: "API Call",
      position: 0.5,                  // 0.0 = start, 1.0 = end
      textAlignVertical: "middle"
    }
  ]
}
```

**Connector Cap Types:**
- `none` — no cap
- `stealth` — arrow (default for end)
- `arrow` — open arrow
- `filled_triangle`, `triangle`
- `filled_diamond`, `diamond`
- `filled_oval`, `oval`

### 10. Frame (extends Board Item)

```javascript
{
  // ...base fields
  type: "frame",
  title: "Sprint 23",                  // plain text, shown at top-left
  style: {
    fillColor: "#f5f5f5"               // background color (transparent or light color)
  },
  childrenIds: ["item_1", "item_2"],   // IDs of items inside this frame
  showContent: true,                    // whether to show children
  width: 800,
  height: 600
}
```

### 11. Comment

```javascript
{
  id: "comment_1",
  boardId: "board_1",
  x: 500,                             // position on canvas
  y: 300,
  resolved: false,
  threads: [
    {
      id: "thread_msg_1",
      authorId: "user_1",
      authorName: "Alex Morgan",
      content: "Should we add more detail here?",
      createdAt: "2025-02-10T11:00:00Z"
    },
    {
      id: "thread_msg_2",
      authorId: "user_2",
      authorName: "Jordan Lee",
      content: "Yes, let's add the API specs.",
      createdAt: "2025-02-10T11:05:00Z"
    }
  ]
}
```

### 12. Tag

```javascript
{
  id: "tag_1",
  boardId: "board_1",
  title: "High Priority",
  color: "red"                         // "red" | "magenta" | "violet" | "light_green" | "green" | "blue" | "yellow" | "orange" | "gray"
}
```

---

## Relationships

```
User (1) ──belongs to──> Team (1)
Team (1) ──has many──> Board (*)
Project (1) ──has many──> Board (*)
Board (1) ──has many──> BoardItem (*) [sticky_note, shape, text, connector, frame]
Board (1) ──has many──> Comment (*)
Board (1) ──has many──> Tag (*)
Frame (1) ──contains──> BoardItem (*) via childrenIds/parentId
StickyNote (*) ──tagged with──> Tag (*) via tagIds
Connector (1) ──connects──> BoardItem (start) + BoardItem (end) via start.itemId / end.itemId
Comment (1) ──has many──> Thread Messages (*)
```

---

## `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    currentUser: { /* User entity */ },
    team: { /* Team entity */ },
    projects: [
      { id: "project_1", name: "Q1 Planning", ... },
      { id: "project_2", name: "Product Design", ... },
      { id: "project_3", name: "Engineering", ... }
    ],
    boards: [
      {
        id: "board_1",
        name: "Sprint Retrospective",
        projectId: "project_1",
        starred: true,
        ...
      },
      {
        id: "board_2",
        name: "Product Roadmap 2025",
        projectId: "project_1",
        starred: false,
        ...
      },
      {
        id: "board_3",
        name: "User Flow Diagrams",
        projectId: "project_2",
        starred: false,
        ...
      },
      {
        id: "board_4",
        name: "Architecture Overview",
        projectId: "project_3",
        starred: true,
        ...
      },
      {
        id: "board_5",
        name: "Brainstorming Session",
        projectId: null,
        starred: false,
        ...
      }
    ],
    // Board items indexed by boardId
    boardItems: {
      "board_1": [
        // Frame: "What went well"
        { id: "frame_1", type: "frame", title: "What went well", x: 400, y: 400, width: 600, height: 500, ... },
        // Sticky notes inside frame
        { id: "sn_1", type: "sticky_note", content: "Great sprint velocity", parentId: "frame_1", x: 200, y: 200, style: { fillColor: "green" }, ... },
        { id: "sn_2", type: "sticky_note", content: "Good code review process", parentId: "frame_1", x: 420, y: 200, style: { fillColor: "green" }, ... },
        { id: "sn_3", type: "sticky_note", content: "Team collaboration improved", parentId: "frame_1", x: 200, y: 420, style: { fillColor: "light_yellow" }, ... },

        // Frame: "Improvements"
        { id: "frame_2", type: "frame", title: "Improvements needed", x: 1100, y: 400, width: 600, height: 500, ... },
        { id: "sn_4", type: "sticky_note", content: "Documentation gaps", parentId: "frame_2", x: 900, y: 200, style: { fillColor: "orange" }, ... },
        { id: "sn_5", type: "sticky_note", content: "Flaky CI pipeline", parentId: "frame_2", x: 1120, y: 200, style: { fillColor: "red" }, ... },
        { id: "sn_6", type: "sticky_note", content: "Need more automated tests", parentId: "frame_2", x: 900, y: 420, style: { fillColor: "orange" }, ... },

        // Frame: "Action items"
        { id: "frame_3", type: "frame", title: "Action items", x: 1800, y: 400, width: 600, height: 500, ... },
        { id: "sn_7", type: "sticky_note", content: "Set up documentation day", parentId: "frame_3", x: 1600, y: 200, style: { fillColor: "light_blue" }, ... },
        { id: "sn_8", type: "sticky_note", content: "Fix CI pipeline this sprint", parentId: "frame_3", x: 1820, y: 200, style: { fillColor: "light_blue" }, ... },

        // Title text
        { id: "text_1", type: "text", content: "Sprint 23 Retrospective", x: 1100, y: 50, width: 400, height: 50, style: { fontSize: 36, color: "#1a1a1a", textAlign: "center" }, ... },

        // Connector between frames
        { id: "conn_1", type: "connector", start: { itemId: "frame_2", snapTo: "right" }, end: { itemId: "frame_3", snapTo: "left" }, shape: "elbowed", captions: [{ content: "leads to", position: 0.5 }], ... }
      ],
      "board_4": [
        // Architecture diagram board
        { id: "shape_1", type: "shape", shapeType: "round_rectangle", content: "Frontend\n(React)", x: 200, y: 200, width: 180, height: 100, style: { fillColor: "#e3f2fd", borderColor: "#1976d2", borderWidth: 2 }, ... },
        { id: "shape_2", type: "shape", shapeType: "round_rectangle", content: "API Gateway", x: 500, y: 200, width: 180, height: 100, style: { fillColor: "#fff3e0", borderColor: "#e65100", borderWidth: 2 }, ... },
        { id: "shape_3", type: "shape", shapeType: "round_rectangle", content: "Auth Service", x: 800, y: 100, width: 180, height: 100, style: { fillColor: "#fce4ec", borderColor: "#c62828", borderWidth: 2 }, ... },
        { id: "shape_4", type: "shape", shapeType: "round_rectangle", content: "User Service", x: 800, y: 300, width: 180, height: 100, style: { fillColor: "#e8f5e9", borderColor: "#2e7d32", borderWidth: 2 }, ... },
        { id: "shape_5", type: "shape", shapeType: "can", content: "PostgreSQL", x: 1100, y: 200, width: 150, height: 120, style: { fillColor: "#f3e5f5", borderColor: "#7b1fa2", borderWidth: 2 }, ... },
        // Connectors
        { id: "conn_2", type: "connector", start: { itemId: "shape_1", snapTo: "right" }, end: { itemId: "shape_2", snapTo: "left" }, shape: "straight", style: { endStrokeCap: "stealth" }, ... },
        { id: "conn_3", type: "connector", start: { itemId: "shape_2", snapTo: "right" }, end: { itemId: "shape_3", snapTo: "left" }, shape: "elbowed", style: { endStrokeCap: "stealth" }, captions: [{ content: "/auth/*", position: 0.5 }], ... },
        { id: "conn_4", type: "connector", start: { itemId: "shape_2", snapTo: "right" }, end: { itemId: "shape_4", snapTo: "left" }, shape: "elbowed", style: { endStrokeCap: "stealth" }, captions: [{ content: "/users/*", position: 0.5 }], ... },
        { id: "conn_5", type: "connector", start: { itemId: "shape_3", snapTo: "right" }, end: { itemId: "shape_5", snapTo: "left" }, shape: "straight", style: { strokeStyle: "dashed", endStrokeCap: "stealth" }, ... },
        { id: "conn_6", type: "connector", start: { itemId: "shape_4", snapTo: "right" }, end: { itemId: "shape_5", snapTo: "left" }, shape: "straight", style: { strokeStyle: "dashed", endStrokeCap: "stealth" }, ... },
        // Title
        { id: "text_arch", type: "text", content: "System Architecture", x: 600, y: -50, width: 400, height: 50, style: { fontSize: 36, color: "#1a1a1a", textAlign: "center", bold: true }, ... }
      ]
    },
    comments: {
      "board_1": [
        {
          id: "comment_1",
          x: 750, y: 350,
          resolved: false,
          threads: [
            { id: "tm_1", authorId: "user_2", authorName: "Jordan Lee", content: "Can we prioritize the CI fixes?", createdAt: "2025-02-10T11:00:00Z" },
            { id: "tm_2", authorId: "user_1", authorName: "Alex Morgan", content: "Agreed, marking as top priority.", createdAt: "2025-02-10T11:05:00Z" }
          ]
        }
      ]
    },
    tags: {
      "board_1": [
        { id: "tag_1", title: "High Priority", color: "red" },
        { id: "tag_2", title: "Quick Win", color: "green" },
        { id: "tag_3", title: "Blocked", color: "yellow" }
      ]
    }
  };
}
```

---

## State Diff Tracking

For the `/go` endpoint, track changes to:
- `boards` — name changes, starred status, new/deleted boards
- `boardItems` — all CRUD operations on items (position, content, style, new items, deleted items)
- `comments` — new comments, resolved status changes
- `tags` — new tags, tag assignments

The diff should compare `initial_state` vs `current_state` for each board's items, producing a structured diff showing what was added, modified, or removed.
