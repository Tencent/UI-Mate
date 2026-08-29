# Xucidchart Mock — Data Model

> This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity: User

The currently logged-in user. App starts pre-authenticated.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"user-1"` | UUID |
| `name` | string | `"Alex Johnson"` | Full display name |
| `email` | string | `"alex.johnson@company.com"` | Shown in header |
| `avatar` | string | `"AJ"` | Initials (rendered as colored circle) |
| `avatarColor` | string | `"#4A86C8"` | Background color for avatar circle |

---

## Entity: Folder

Organizational containers for documents.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"folder-1"` | UUID |
| `name` | string | `"Marketing Diagrams"` | Folder display name |
| `parentId` | string\|null | `null` | For nested folders; `null` = top-level |
| `type` | enum | `"my_documents"` | `"my_documents"`, `"shared"`, `"team"`, `"trash"` |
| `createdAt` | string | `"2025-01-15T10:00:00Z"` | ISO timestamp |
| `updatedAt` | string | `"2025-03-01T14:30:00Z"` | ISO timestamp |

### System Folders (non-deletable)
- `"my_documents"` — Root folder for user's own docs
- `"shared"` — Documents shared with this user
- `"team"` — Team folders
- `"trash"` — Deleted items

---

## Entity: Document

A diagram file. Contains one or more pages.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"doc-1"` | UUID |
| `title` | string | `"Sales Process Flowchart"` | Editable doc name |
| `folderId` | string | `"folder-1"` | Parent folder |
| `ownerId` | string | `"user-1"` | Creator |
| `starred` | boolean | `false` | Favorited |
| `status` | enum | `"draft"` | `"draft"`, `"published"` |
| `thumbnailUrl` | string\|null | `null` | Preview image (can be generated from canvas) |
| `createdAt` | string | `"2025-02-10T09:00:00Z"` | ISO timestamp |
| `updatedAt` | string | `"2025-03-05T16:45:00Z"` | ISO timestamp |
| `lastOpenedAt` | string | `"2025-03-08T11:00:00Z"` | For "Recent" sorting |
| `sharedWith` | array | `[{userId, permission}]` | Sharing permissions |
| `pageOrder` | array | `["page-1", "page-2"]` | Ordered page IDs |

---

## Entity: Page

A single canvas within a document. Most documents have 1-3 pages.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"page-1"` | UUID |
| `documentId` | string | `"doc-1"` | Parent document |
| `name` | string | `"Page 1"` | Tab label (editable) |
| `order` | number | `0` | Sort order (0-indexed) |
| `width` | number | `1200` | Canvas width in px |
| `height` | number | `900` | Canvas height in px |
| `gridVisible` | boolean | `true` | Show grid lines |
| `gridSize` | number | `20` | Grid spacing in px |
| `backgroundColor` | string | `"#FFFFFF"` | Canvas background |

---

## Entity: Shape

A visual element on the canvas. The core building block of diagrams.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"shape-1"` | UUID |
| `pageId` | string | `"page-1"` | Which page this shape is on |
| `type` | enum | `"rectangle"` | See Shape Types below |
| `category` | enum | `"flowchart"` | `"standard"`, `"flowchart"`, `"shapes"`, `"uml"` |
| `x` | number | `400` | Left position (px) |
| `y` | number | `200` | Top position (px) |
| `width` | number | `160` | Width (px) |
| `height` | number | `80` | Height (px) |
| `rotation` | number | `0` | Degrees (0-360) |
| `text` | string | `"Process Step"` | Text label inside shape |
| `fontSize` | number | `14` | Font size (pt) |
| `fontFamily` | string | `"Liberation Sans"` | Font family |
| `fontWeight` | enum | `"normal"` | `"normal"`, `"bold"` |
| `fontStyle` | enum | `"normal"` | `"normal"`, `"italic"` |
| `textAlign` | enum | `"center"` | `"left"`, `"center"`, `"right"` |
| `textColor` | string | `"#333333"` | Text fill color |
| `fillColor` | string | `"#FFFFFF"` | Shape fill color |
| `borderColor` | string | `"#333333"` | Stroke color |
| `borderWidth` | number | `2` | Stroke width (px) |
| `borderStyle` | enum | `"solid"` | `"solid"`, `"dashed"`, `"dotted"` |
| `opacity` | number | `1` | 0–1 range |
| `locked` | boolean | `false` | Prevents modification |
| `visible` | boolean | `true` | Layer visibility |
| `zIndex` | number | `1` | Stacking order |
| `groupId` | string\|null | `null` | If part of a group |
| `connectionPoints` | array | `[{position, id}]` | Auto-generated: top, right, bottom, left |

### Shape Types

**Standard category:**
| Type | Description | Visual |
|------|-------------|--------|
| `"text"` | Standalone text block | T |
| `"rectangle"` | Basic rectangle | □ |
| `"sticky_note"` | Yellow sticky note | 📋 |
| `"container"` | Container/group box | ⬜ with dotted border |
| `"line"` | Standalone line | ─ |
| `"table"` | Data table | ⊞ |
| `"list"` | Bulleted list | ☰ |

**Flowchart category:**
| Type | Description | Visual |
|------|-------------|--------|
| `"process"` | Process/action step | Rectangle |
| `"decision"` | Decision point | Diamond ◇ |
| `"terminator"` | Start/End | Rounded rectangle (⊂⊃) |
| `"data"` | Data/IO | Parallelogram |
| `"document_shape"` | Document | Rectangle with wavy bottom |
| `"predefined_process"` | Predefined process | Rectangle with vertical bars |
| `"manual_input"` | Manual input | Trapezoid (wider top) |
| `"preparation"` | Preparation | Hexagon |
| `"connector_shape"` | Connector | Circle |
| `"merge"` | Merge | Inverted triangle ▽ |
| `"delay"` | Delay | Half-circle (D shape) |
| `"stored_data"` | Stored data | Cylinder-like |
| `"or_gate"` | OR gate | Circle with + |
| `"summing_junction"` | Summing junction | Circle with × |
| `"display"` | Display | Rounded right pentagon |
| `"off_page"` | Off-page reference | Pentagon pointing down |
| `"manual_operation"` | Manual operation | Trapezoid (wider bottom) |

**Shapes category:**
| Type | Description | Visual |
|------|-------------|--------|
| `"triangle"` | Triangle | △ |
| `"right_triangle"` | Right triangle | ◺ |
| `"arrow_right"` | Right arrow | → |
| `"arrow_left"` | Left arrow | ← |
| `"arrow_up"` | Up arrow | ↑ |
| `"arrow_down"` | Down arrow | ↓ |
| `"double_arrow_h"` | Horizontal double arrow | ↔ |
| `"double_arrow_v"` | Vertical double arrow | ↕ |
| `"circle"` | Circle | ○ |
| `"ellipse"` | Ellipse | ⬭ |
| `"diamond"` | Diamond | ◇ |
| `"pentagon"` | Pentagon | ⬠ |
| `"hexagon"` | Hexagon | ⬡ |
| `"octagon"` | Octagon | ⯃ |
| `"star_4"` | 4-point star | ✦ |
| `"star_5"` | 5-point star | ★ |
| `"star_6"` | 6-point star | ✶ |
| `"cross"` | Cross/plus | + |
| `"heart"` | Heart | ♥ |
| `"cloud"` | Cloud | ☁ |

---

## Entity: Connector

A line connecting two shapes. The fundamental diagram relationship.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"conn-1"` | UUID |
| `pageId` | string | `"page-1"` | Which page |
| `sourceShapeId` | string | `"shape-1"` | Start shape ID |
| `sourcePoint` | enum | `"bottom"` | `"top"`, `"right"`, `"bottom"`, `"left"` |
| `targetShapeId` | string | `"shape-2"` | End shape ID |
| `targetPoint` | enum | `"top"` | `"top"`, `"right"`, `"bottom"`, `"left"` |
| `waypoints` | array | `[{x: 400, y: 350}]` | Intermediate routing points |
| `lineStyle` | enum | `"solid"` | `"solid"`, `"dashed"`, `"dotted"` |
| `lineWidth` | number | `2` | Stroke width (px) |
| `lineColor` | string | `"#333333"` | Stroke color |
| `sourceArrow` | enum | `"none"` | `"none"`, `"arrow"`, `"open_arrow"`, `"diamond"`, `"circle"` |
| `targetArrow` | enum | `"arrow"` | Same options as sourceArrow |
| `label` | string | `""` | Text label on the line |
| `labelPosition` | number | `0.5` | 0–1 along line where label sits |
| `routingType` | enum | `"orthogonal"` | `"straight"`, `"orthogonal"`, `"curved"` |
| `zIndex` | number | `0` | Below shapes typically |

---

## Entity: Comment

A threaded comment attached to a shape or canvas position.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"comment-1"` | UUID |
| `pageId` | string | `"page-1"` | Which page |
| `shapeId` | string\|null | `"shape-3"` | Attached shape (null = canvas position) |
| `x` | number\|null | `null` | Canvas position if no shape |
| `y` | number\|null | `null` | Canvas position if no shape |
| `authorId` | string | `"user-2"` | Comment author |
| `authorName` | string | `"Sarah Smith"` | Display name |
| `text` | string | `"Can this be larger?"` | Comment body |
| `resolved` | boolean | `false` | Resolved state |
| `createdAt` | string | `"2025-03-05T10:30:00Z"` | ISO timestamp |
| `replies` | array | `[{id, authorId, authorName, text, createdAt}]` | Threaded replies |

---

## Entity: Template

Pre-built document starters.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"template-flowchart"` | Unique key |
| `name` | string | `"Flowchart"` | Display name |
| `category` | string | `"flowchart"` | Category grouping |
| `icon` | string | `"flowchart"` | Icon identifier |
| `description` | string | `"Basic flowchart template"` | Short description |
| `pages` | array | `[{shapes, connectors}]` | Pre-built content |

---

## Relationships

```
User ──owns──▸ Document (1:many)
Document ──contains──▸ Page (1:many, ordered)
Page ──contains──▸ Shape (1:many)
Page ──contains──▸ Connector (1:many)
Page ──contains──▸ Comment (1:many)
Connector ──connects──▸ Shape (many:2, source + target)
Comment ──attached_to──▸ Shape (many:1, optional)
Folder ──contains──▸ Document (1:many)
Folder ──contains──▸ Folder (1:many, nested)
```

---

## `createInitialData()` Structure

```javascript
function createInitialData() {
  return {
    // Current user (pre-authenticated)
    currentUser: {
      id: "user-1",
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      avatar: "AJ",
      avatarColor: "#4A86C8"
    },

    // Other users (for shared docs, comments)
    users: [
      { id: "user-2", name: "Sarah Smith", email: "sarah.smith@company.com", avatar: "SS", avatarColor: "#E74C3C" },
      { id: "user-3", name: "Mike Chen", email: "mike.chen@company.com", avatar: "MC", avatarColor: "#2ECC71" },
      { id: "user-4", name: "Emily Davis", email: "emily.davis@company.com", avatar: "ED", avatarColor: "#9B59B6" }
    ],

    // Folder tree
    folders: [
      { id: "folder-root", name: "My Documents", parentId: null, type: "my_documents" },
      { id: "folder-shared", name: "Shared with Me", parentId: null, type: "shared" },
      { id: "folder-team", name: "Team Folders", parentId: null, type: "team" },
      { id: "folder-trash", name: "Trash", parentId: null, type: "trash" },
      { id: "folder-1", name: "Marketing Diagrams", parentId: "folder-root", type: "my_documents" },
      { id: "folder-2", name: "Engineering", parentId: "folder-root", type: "my_documents" },
      { id: "folder-3", name: "Q1 Planning", parentId: "folder-team", type: "team" }
    ],

    // Documents (8-12 documents for realism)
    documents: [
      {
        id: "doc-1",
        title: "Sales Process Flowchart",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-03-05T16:45:00Z",
        lastOpenedAt: "2025-03-08T11:00:00Z",
        sharedWith: [
          { userId: "user-2", permission: "edit" },
          { userId: "user-3", permission: "view" }
        ],
        pageOrder: ["page-1", "page-2"]
      },
      {
        id: "doc-2",
        title: "System Architecture",
        folderId: "folder-2",
        ownerId: "user-1",
        starred: false,
        status: "published",
        createdAt: "2025-02-01T09:00:00Z",
        updatedAt: "2025-02-28T12:00:00Z",
        lastOpenedAt: "2025-03-07T15:30:00Z",
        sharedWith: [{ userId: "user-3", permission: "edit" }],
        pageOrder: ["page-3"]
      },
      {
        id: "doc-3",
        title: "Org Chart by Department",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        createdAt: "2025-02-10T14:00:00Z",
        updatedAt: "2025-03-04T10:20:00Z",
        lastOpenedAt: "2025-03-06T09:00:00Z",
        sharedWith: [],
        pageOrder: ["page-4"]
      },
      {
        id: "doc-4",
        title: "User Registration Flow",
        folderId: "folder-1",
        ownerId: "user-1",
        starred: false,
        status: "draft",
        createdAt: "2025-01-20T11:00:00Z",
        updatedAt: "2025-02-15T08:30:00Z",
        lastOpenedAt: "2025-03-02T14:00:00Z",
        sharedWith: [{ userId: "user-4", permission: "edit" }],
        pageOrder: ["page-5"]
      },
      {
        id: "doc-5",
        title: "Database ER Diagram",
        folderId: "folder-2",
        ownerId: "user-1",
        starred: false,
        status: "published",
        createdAt: "2025-02-05T16:00:00Z",
        updatedAt: "2025-03-01T11:00:00Z",
        lastOpenedAt: "2025-03-01T11:00:00Z",
        sharedWith: [{ userId: "user-2", permission: "view" }],
        pageOrder: ["page-6"]
      },
      {
        id: "doc-6",
        title: "Sprint Planning Mind Map",
        folderId: "folder-3",
        ownerId: "user-3",
        starred: false,
        status: "draft",
        createdAt: "2025-02-20T09:30:00Z",
        updatedAt: "2025-03-06T17:00:00Z",
        lastOpenedAt: "2025-03-06T17:00:00Z",
        sharedWith: [{ userId: "user-1", permission: "edit" }],
        pageOrder: ["page-7"]
      },
      {
        id: "doc-7",
        title: "Customer Journey Map",
        folderId: "folder-1",
        ownerId: "user-1",
        starred: false,
        status: "draft",
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-03-07T13:00:00Z",
        lastOpenedAt: "2025-03-07T13:00:00Z",
        sharedWith: [],
        pageOrder: ["page-8"]
      },
      {
        id: "doc-8",
        title: "Network Infrastructure",
        folderId: "folder-2",
        ownerId: "user-2",
        starred: false,
        status: "published",
        createdAt: "2025-01-10T08:00:00Z",
        updatedAt: "2025-02-20T16:00:00Z",
        lastOpenedAt: "2025-02-20T16:00:00Z",
        sharedWith: [{ userId: "user-1", permission: "view" }],
        pageOrder: ["page-9"]
      },
      {
        id: "doc-blank",
        title: "Blank Diagram",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        createdAt: "2025-03-08T09:00:00Z",
        updatedAt: "2025-03-08T09:00:00Z",
        lastOpenedAt: "2025-03-08T09:00:00Z",
        sharedWith: [],
        pageOrder: ["page-blank"]
      }
    ],

    // Pages (one per document, some documents have multiple)
    pages: [
      // Doc 1: Sales Process Flowchart (2 pages)
      { id: "page-1", documentId: "doc-1", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-2", documentId: "doc-1", name: "Page 2", order: 1, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 2: System Architecture
      { id: "page-3", documentId: "doc-2", name: "Page 1", order: 0, width: 1600, height: 1200, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 3: Org Chart
      { id: "page-4", documentId: "doc-3", name: "Page 1", order: 0, width: 1400, height: 800, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 4: User Registration
      { id: "page-5", documentId: "doc-4", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 5: ER Diagram
      { id: "page-6", documentId: "doc-5", name: "Page 1", order: 0, width: 1400, height: 1000, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 6: Mind Map
      { id: "page-7", documentId: "doc-6", name: "Page 1", order: 0, width: 1600, height: 1200, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 7: Customer Journey
      { id: "page-8", documentId: "doc-7", name: "Page 1", order: 0, width: 1800, height: 600, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Doc 8: Network
      { id: "page-9", documentId: "doc-8", name: "Page 1", order: 0, width: 1400, height: 1000, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      // Blank
      { id: "page-blank", documentId: "doc-blank", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" }
    ],

    // Shapes for doc-1 page-1 (Sales Process Flowchart)
    // This is the "active" document shown when opening the editor
    shapes: [
      // Start
      { id: "shape-1", pageId: "page-1", type: "terminator", category: "flowchart", x: 460, y: 40, width: 160, height: 60, rotation: 0, text: "Start", fontSize: 14, fontFamily: "Liberation Sans", fontWeight: "bold", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#E8F5E9", borderColor: "#4CAF50", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 1, groupId: null },
      // Customer Purchase Order
      { id: "shape-2", pageId: "page-1", type: "process", category: "flowchart", x: 440, y: 160, width: 200, height: 70, rotation: 0, text: "Customer\npurchase order", fontSize: 13, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 2, groupId: null },
      // Sales Order
      { id: "shape-3", pageId: "page-1", type: "process", category: "flowchart", x: 440, y: 290, width: 200, height: 70, rotation: 0, text: "Sales order", fontSize: 13, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 3, groupId: null },
      // Decision: POP or Pick?
      { id: "shape-4", pageId: "page-1", type: "decision", category: "flowchart", x: 440, y: 420, width: 200, height: 120, rotation: 0, text: "POP decision:\npick, order, or\nproduce?", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 4, groupId: null },
      // Create pick ticket (left branch)
      { id: "shape-5", pageId: "page-1", type: "process", category: "flowchart", x: 140, y: 440, width: 160, height: 60, rotation: 0, text: "Create\n\"pick ticket\"", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 5, groupId: null },
      // Determine quantity (right branch - produce)
      { id: "shape-6", pageId: "page-1", type: "process", category: "flowchart", x: 700, y: 440, width: 160, height: 60, rotation: 0, text: "Determine\nquantity", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 6, groupId: null },
      // Ship to customer
      { id: "shape-7", pageId: "page-1", type: "process", category: "flowchart", x: 880, y: 440, width: 140, height: 60, rotation: 0, text: "Ship to\ncustomer", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 7, groupId: null },
      // End
      { id: "shape-8", pageId: "page-1", type: "terminator", category: "flowchart", x: 460, y: 660, width: 160, height: 60, rotation: 0, text: "End", fontSize: 14, fontFamily: "Liberation Sans", fontWeight: "bold", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFEBEE", borderColor: "#F44336", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 8, groupId: null }
    ],

    // Connectors for doc-1 page-1
    connectors: [
      { id: "conn-1", pageId: "page-1", sourceShapeId: "shape-1", sourcePoint: "bottom", targetShapeId: "shape-2", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-2", pageId: "page-1", sourceShapeId: "shape-2", sourcePoint: "bottom", targetShapeId: "shape-3", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-3", pageId: "page-1", sourceShapeId: "shape-3", sourcePoint: "bottom", targetShapeId: "shape-4", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-4", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "left", targetShapeId: "shape-5", targetPoint: "right", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Pick", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-5", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "right", targetShapeId: "shape-6", targetPoint: "left", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Produce", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-6", pageId: "page-1", sourceShapeId: "shape-6", sourcePoint: "right", targetShapeId: "shape-7", targetPoint: "left", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-7", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "bottom", targetShapeId: "shape-8", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Order", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 }
    ],

    // Comments for doc-1
    comments: [
      {
        id: "comment-1",
        pageId: "page-1",
        shapeId: "shape-4",
        x: null, y: null,
        authorId: "user-2",
        authorName: "Sarah Smith",
        text: "Can this be larger if we need to add more conditions?",
        resolved: false,
        createdAt: "2025-03-05T10:30:00Z",
        replies: [
          { id: "reply-1", authorId: "user-1", authorName: "Alex Johnson", text: "Yes, we can make the decision diamond bigger. Will update.", createdAt: "2025-03-05T11:00:00Z" }
        ]
      },
      {
        id: "comment-2",
        pageId: "page-1",
        shapeId: "shape-7",
        x: null, y: null,
        authorId: "user-3",
        authorName: "Mike Chen",
        text: "Should we add a 'verify address' step before shipping?",
        resolved: false,
        createdAt: "2025-03-06T14:20:00Z",
        replies: []
      },
      {
        id: "comment-3",
        pageId: "page-1",
        shapeId: "shape-2",
        x: null, y: null,
        authorId: "user-2",
        authorName: "Sarah Smith",
        text: "This step needs more detail about validation checks.",
        resolved: true,
        createdAt: "2025-03-04T09:15:00Z",
        replies: [
          { id: "reply-2", authorId: "user-1", authorName: "Alex Johnson", text: "Done - added a sub-process on Page 2.", createdAt: "2025-03-04T10:00:00Z" }
        ]
      }
    ],

    // Templates for the template gallery
    templates: [
      { id: "template-blank", name: "Blank", category: "general", icon: "blank", description: "Start with an empty canvas" },
      { id: "template-flowchart", name: "Flowchart", category: "flowchart", icon: "flowchart", description: "Basic flowchart with start/end and decision" },
      { id: "template-org-chart", name: "Org Chart", category: "org", icon: "org-chart", description: "Organizational hierarchy chart" },
      { id: "template-mind-map", name: "Mind Map", category: "brainstorm", icon: "mind-map", description: "Radial mind mapping layout" },
      { id: "template-education", name: "Education", category: "education", icon: "education", description: "Educational diagram layout" },
      { id: "template-business", name: "Business Analysis", category: "business", icon: "business", description: "Business process analysis template" }
    ],

    // UI State
    ui: {
      activeFolderId: "folder-root",
      activeDocumentId: null,         // null when on dashboard, doc ID when in editor
      activePageId: null,             // current page being edited
      selectedShapeIds: [],           // currently selected shape IDs
      dashboardViewMode: "grid",      // "grid" or "list"
      dashboardSearchQuery: "",
      rightPanelTab: null,            // null (collapsed) or "settings" | "comments" | "present" | "history" | "layers" | "theme" | "chat"
      zoomLevel: 100,                 // percentage
      shapePanelSearchQuery: "",
      shapePanelSections: {           // which sections are expanded
        shapesInUse: true,
        standard: true,
        flowchart: true,
        shapes: true
      }
    }
  };
}
```

---

## State Diff Tracking

The `/go` endpoint should compare `initial_state` vs `current_state` and report:

```javascript
{
  documents: { added: [], deleted: [], modified: [] },
  shapes: { added: [], deleted: [], modified: [] },
  connectors: { added: [], deleted: [], modified: [] },
  comments: { added: [], deleted: [], modified: [] },
  pages: { added: [], deleted: [], modified: [] },
  ui: { /* any changed UI state fields */ }
}
```

For shapes, track changes to: position (x/y), size (width/height), rotation, text, colors, borders, visibility, lock state.
For connectors, track changes to: source/target, routing, style, labels.
For documents, track changes to: title, starred, folder, sharing.
