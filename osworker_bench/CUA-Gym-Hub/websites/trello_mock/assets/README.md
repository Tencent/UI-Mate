# Xrello Mock — Research Summary

## App Overview

Xrello is an Atlassian-owned visual project management tool based on the Kanban methodology. Users organize work into **Boards** (projects), which contain **Lists** (workflow stages like "To Do", "In Progress", "Done"), which contain **Cards** (individual tasks). Cards move between lists as work progresses. The entire experience is built around drag-and-drop interaction.

**Category:** Productivity / Project Management
**Distinct from competitors:** Extreme visual simplicity — everything is a card on a board. No complex Gantt charts or resource planning by default. Power-Ups add optional complexity.

## Key User Personas

1. **Project Manager (Alice)** — Creates boards, assigns tasks, monitors progress, uses filters and labels to track status across many cards.
2. **Team Member (Bob)** — Opens assigned cards, checks off items, adds comments, moves cards between lists, uploads attachments.
3. **Casual User (Charlie)** — Uses Xrello for personal task management, creates simple boards, stars favorites, uses checklists.

## Primary Workflows (Agent Training Focus)

1. **Board Navigation** — Home → Board List → Click Board → View Lists & Cards
2. **Card CRUD** — Create card → Edit title/description → Add labels/members/due date → Move card → Archive card
3. **Drag & Drop** — Reorder cards within list, move cards between lists, reorder lists on board
4. **Checklist Management** — Add checklist to card → Add items → Toggle complete/incomplete
5. **Label Management** — Create labels with color + name → Apply to cards → Filter by label
6. **Due Date Workflow** — Set due date → Mark complete/incomplete → Visual badges (overdue/soon/complete)
7. **Search & Filter** — Search cards across boards → Filter board by label/due date/member
8. **Board Management** — Create board → Set background → Star/unstar → Edit title → Change visibility

## Complete Feature List

### P0 — Core Shell (Exists)
- [x] App shell with Navbar + routing
- [x] Session isolation (vite.config.js)
- [x] State management (React Context + useReducer)
- [x] `/go` endpoint for state debugging
- [x] Board list page (home)
- [x] Board view with drag-and-drop
- [x] Card modal (detail view)

### P1 — Primary Interactive Features
| Feature | Status | Notes |
|---------|--------|-------|
| Create/View Boards | Exists | Modal with bg picker |
| Create/View Lists | Exists | Add list button |
| Create/View Cards | Exists | Add card composer |
| Drag cards between lists | Exists | @hello-pangea/dnd |
| Drag lists to reorder | Exists | Horizontal DnD |
| Card modal (back) | Exists | Title, desc, labels, members, dates, checklists, attachments, cover, activity |
| Label picker | Exists | 6 colors + custom |
| Member picker | Exists | 3 mock users |
| Date picker calendar | Exists | Full calendar component |
| Checklist + progress | Exists | Add checklist, add items, toggle |
| Filter by label/due date | Exists | Dropdown on board header |
| Board menu sidebar | Exists | Background, archived items, activity |
| Archive card/list | Exists | With restore |
| Star board toggle | **BROKEN** | Button renders but doesn't dispatch |
| Board title inline edit | **MISSING** | Header shows title but no edit |
| Search functionality | **MISSING** | Input renders but no search logic |
| Notifications panel | **MISSING** | Bell icon renders but no panel |
| Copy/Move card | **MISSING** | Not in card modal actions |
| Delete checklist | **MISSING** | Button renders but no handler |
| Edit/Delete comments | **MISSING** | No edit/delete on comments |
| Quick card edit | **MISSING** | Pencil icon on hover exists but non-functional |
| Workspace dropdown menus | **MISSING** | Navbar buttons don't open dropdowns |
| Board description | **MISSING** | Menu shows placeholder text |

### P2 — Secondary / Depth Features
| Feature | Status |
|---------|--------|
| Table view | Not implemented |
| Calendar view (board-level) | Not implemented |
| Keyboard shortcuts | Not implemented |
| Card "Watch" toggle | Not implemented |
| Copy board | Not implemented |
| Board visibility settings | Visual only |
| Card position/ordering | Implicit via array index |
| Custom label text editing | Partial (color only) |
| Notification badges/counts | Not implemented |
| User profile dropdown | Not implemented |
| Template boards | Not implemented |

## UI Layout Description

### Global Header (Navbar) — 48px height
- Left: Xrello logo + "TrelloClone" text → links to home
- Left nav buttons: Workspaces, Recent, Starred, Templates (currently non-functional dropdowns)
- Debug State link (dev tool)
- Right: Search input, Notification bell, Help icon, User avatar

### Board List Page (Home) — `/`
- Full white background
- Max-width 1024px centered content
- "Starred boards" section: grid of board thumbnails (4 cols)
- "Your workspaces" section: grid of board thumbnails + "Create new board" button
- Board thumbnail: 96px height, background image, white title overlay
- Create board modal: background preview + title input + bg picker grid

### Board View — `/board/:boardId`
- Full viewport height, background image/color fills entire screen
- Board header: 56px, black/20 backdrop blur
  - Left: Board title (editable), Star button, Visibility badge, Member avatars, Share button
  - Right: Power-Ups, Filter, Show Menu
- Board canvas: horizontal scroll, flex row of lists + "Add another list" button
- Board menu: 320px slide-in panel from right

### List Component — 288px (w-72) fixed width
- Gray background (#ebecf0), rounded corners
- Header: title (click to edit) + ... menu (sort, archive)
- Card stack: vertical scroll, droppable zone
- Footer: "Add a card" button / card composer

### Card Component (in list)
- White background, rounded corners, subtle shadow
- Optional cover image at top (128px)
- Label pills: colored dots (2px height, 40px width)
- Title text
- Badge row: due date (color-coded), description icon, attachment count, checklist progress
- Member avatars bottom-right
- Pencil edit button on hover (top-right)

### Card Modal (Detail View)
- Full-screen overlay, centered modal (max-w 768px)
- Optional cover image header
- Two-column layout: main content (left) + sidebar actions (right, 200px)
- Main content: Title, "in list X", Labels/Members/Due Date row, Description (markdown), Checklists, Attachments, Activity/Comments
- Sidebar: Members, Labels, Checklist, Dates, Attachment, Cover, Archive

## Data Model Overview
See `data_model.md` for complete entity definitions.

Core entities: Board, List, Card, User (Member), Label, Checklist, CheckItem, Comment, Attachment, Activity

## What to Skip
- **Authentication/Login** — App starts pre-logged-in as "Alice" (user u1)
- **Real file uploads** — Attachments use simulated random images
- **Real notifications/email** — Visual mock only
- **Power-Up installation** — Modal displays but "Add" buttons are visual only
- **Real-time collaboration** — Single-user simulation
- **OAuth/SSO** — No identity verification
- **Workspace/Organization management** — Simplified to single workspace
