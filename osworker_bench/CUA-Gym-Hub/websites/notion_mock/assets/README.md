# Xotion Mock — Research Summary

> Last updated: 2026-02-27 by plan agent
> Sources: notion.com/help, developers.notion.com, en.wikipedia.org, producthunt.com

## App Overview

**Xotion** is an all-in-one productivity workspace combining note-taking, project management, databases, and collaboration. Its core innovation is the **block-based architecture** — everything (text, images, lists, pages, database rows) is a "block" that can be nested, rearranged, and transformed. Users build custom workflows by combining pages, databases, and blocks.

## Key User Personas & Primary Workflows

### 1. Knowledge Worker (Primary)
- **Daily workflow**: Open workspace → navigate sidebar → open/edit pages → create notes → organize with headings/lists/toggles → search for content
- **Key interactions**: Block editing, slash commands, page hierarchy, favorites, search

### 2. Project Manager
- **Daily workflow**: Open database → switch between table/board/calendar views → filter by status/assignee → drag cards between columns → update properties → add new items
- **Key interactions**: Database CRUD, view switching, filtering, sorting, board drag-and-drop

### 3. Team Collaborator
- **Daily workflow**: Check inbox/updates → navigate shared pages → leave comments → mention teammates → share pages
- **Key interactions**: Comments, @mentions, sharing, notifications

---

## Complete Feature List (Prioritized)

### P0 — Core Shell (App frame, routing, state)
| Feature | Status in Mock |
|---------|---------------|
| App layout (sidebar + main area) | ✅ Built |
| Sidebar navigation with page tree | ✅ Built |
| Page routing (/page/:id) | ✅ Built |
| Block editor (text, headings, lists, todos, quotes, callouts, dividers, images, code, toggle, table, ToC) | ✅ Built |
| Slash command menu (/) | ✅ Built |
| Block drag-and-drop reorder | ✅ Built |
| Session isolation + /go endpoint | ✅ Built |
| State persistence (localStorage) | ✅ Built |
| Database table + board view | ✅ Built |
| Sidebar collapse/expand + resize | ✅ Built |
| **TopBar favorite button (click handler)** | ❌ Missing handler |
| **TopBar breadcrumb navigation** | ❌ Only shows current page |
| **Sidebar page context menu (rename, delete, duplicate, move to, favorite)** | ❌ "..." button has no handler |
| **Trash functionality (soft delete + restore)** | ❌ Trash link is non-functional |

### P1 — Primary Interactive Features
| Feature | Status in Mock |
|---------|---------------|
| Search modal (Cmd+K / sidebar click) | ❌ Not built |
| Block inline formatting toolbar (bold, italic, strikethrough, code, link, color on text select) | ❌ Not built |
| Block "Turn into" transformation (paragraph → heading, list → todo, etc.) | ❌ Not built |
| Block color & background color | ❌ Not built |
| Database: multiple views per database (view tabs, add/switch views) | ❌ Only single view |
| Database: filter (single/multiple conditions, AND/OR) | ❌ Button exists but non-functional |
| Database: sort (single/multiple sort rules) | ❌ Button exists but non-functional |
| Database: property management (add, edit, delete, reorder properties) | ❌ Not built |
| Database: list view | ❌ Not built |
| Database: gallery view | ❌ Not built |
| Database: calendar view | ❌ Not built |
| Page cover image (add, change, remove, reposition) | ⚠️ Exists in data model but limited UI |
| Sidebar: search pages by title | ❌ Not built |
| Sidebar: reorder pages via drag-and-drop | ❌ Not built |
| Database: board view drag-and-drop (move cards between columns) | ❌ Not built |
| Page duplication | ❌ Not built |
| More properties: multi-select, checkbox, URL, number, status | ❌ Only text/select/person/date |

### P2 — Depth & Realism Features
| Feature | Status in Mock |
|---------|---------------|
| Comment system (block-level comments) | ❌ Not built |
| Settings modal (workspace settings, preferences) | ❌ Not built |
| Page history / version indicator | ❌ Not built |
| Keyboard shortcuts (Cmd+B bold, Cmd+I italic, Cmd+K link, etc.) | ❌ Not built |
| Database: timeline view | ❌ Not built |
| Multi-column layout for blocks | ❌ Not built |
| Undo/redo (Cmd+Z / Cmd+Shift+Z) | ❌ Not built |
| Inline page mentions (@page, [[page) | ❌ Not built |
| Templates system | ❌ Sidebar link exists but non-functional |
| Notifications/inbox | ❌ Not built |
| Share dialog | ❌ Button exists but non-functional |
| Database: sub-groups | ❌ Not built |
| Database: calculations/aggregations per column | ❌ Not built |

---

## UI Layout Description

### Sidebar (Left Panel, ~240px default, resizable 150-480px)
- **Top**: Workspace switcher (icon + name + dropdown arrow)
- **Quick links**: Search, Home, Inbox (with unread badge), Settings & Members
- **Favorites section**: Pages starred by user
- **Private section**: Root-level pages owned by user, infinitely nested
- **Each page row**: Expand chevron | emoji icon | title | hover actions (+ add child, ... more menu)
- **Bottom**: Templates link, Trash link
- **Interactions**: Click to navigate, hover to show actions, drag right edge to resize, collapse button (<<)

### TopBar (Top of main area, ~44px height)
- **Left**: Breadcrumb trail (workspace > parent page > current page)
- **Right**: "Edited [time]" label | Share button | Comment button | History/clock button | Star/favorite toggle | "..." more menu

### Page Editor (Main content area, centered, max-width ~900px)
- **Cover image**: Full-width banner at top (optional, clickable to change)
- **Page header**: Large emoji icon (clickable to change) + Page title (contentEditable, large font)
- **Block list**: Vertical stack of blocks, each with:
  - Hover: 6-dot drag handle on left + "+" button to add block below
  - Click: contentEditable editing
  - "/": Opens slash command menu
  - Text selection: Shows floating formatting toolbar

### Database Views
- **View tabs**: Tab bar showing view names, "+" to add view
- **Toolbar**: Filter | Sort | Search | "..." more options | New button
- **Table view**: Spreadsheet-like grid, frozen title column, editable cells
- **Board view**: Kanban columns grouped by select property, draggable cards
- **Calendar view**: Month grid with date cards, navigation arrows, "Today" button
- **List view**: Minimal rows with title and key properties
- **Gallery view**: Card grid showing cover images or page content previews

---

## Xotion's Block Types (Complete List)

### Basic Blocks
- Text (paragraph)
- Page (sub-page link)
- To-do list (checkbox + text)
- Heading 1, Heading 2, Heading 3
- Bulleted list
- Numbered list
- Toggle list (collapsible)
- Quote
- Divider (horizontal rule)
- Callout (icon + colored background)
- Link to page

### Media Blocks
- Image (upload or URL)
- Video (embed)
- Audio (embed)
- File (attachment)
- Code (syntax-highlighted, language selector)
- Web bookmark (URL preview card)

### Database Blocks
- Table view (inline)
- Board view (inline)
- Calendar view (inline)
- Gallery view (inline)
- List view (inline)
- Timeline view (inline)

### Advanced Blocks
- Table of contents
- Breadcrumb
- Math equation (LaTeX)
- Button / Template button
- Synced block
- Column layout (2-5 columns)

---

## Database Property Types (Complete List)

1. **Text** — Free-form formatted text
2. **Number** — Numeric values (formattable as currency, percent, etc.)
3. **Select** — Single choice from tag list
4. **Multi-select** — Multiple choices from tag list
5. **Status** — Progress tracking (To-do / In Progress / Complete)
6. **Date** — Date or date range with optional time
7. **Person** — Workspace member reference
8. **File** — File/image attachment
9. **Checkbox** — Boolean true/false
10. **URL** — Web link
11. **Email** — Email address
12. **Phone** — Phone number
13. **Formula** — Calculated from other properties
14. **Relation** — Link to another database
15. **Rollup** — Aggregate from related database
16. **Created time** — Auto timestamp (read-only)
17. **Created by** — Auto person (read-only)
18. **Last edited time** — Auto timestamp (read-only)
19. **Last edited by** — Auto person (read-only)
20. **ID** — Auto-incrementing number (read-only)
21. **Button** — Action trigger

---

## Database Views Detail

### Table View
- Rows = database items, columns = properties
- First column (Name/Title) is frozen/sticky
- Click cell to edit inline
- Column headers: click to rename, drag to reorder, right-click for options
- Bottom row: "+ New" button to add item
- Column calculations at bottom (count, sum, etc.)

### Board View
- Columns grouped by a select/status property
- Cards show title + selected properties
- Drag cards between columns to change property value
- Each column header shows group name + count
- "+" button per column to add item in that group
- "+ Add Group" to create new column

### Calendar View
- Monthly grid (7 columns for days of week)
- Items displayed as cards on their date
- Drag cards to change date
- Drag card edges to set date ranges
- Navigation: < Today > arrows at top
- "+" button on hover over any date cell

### List View
- Minimal rows showing title and 1-2 key properties
- Clean, document-oriented look
- Click to open page

### Gallery View
- Card grid (3-4 columns)
- Each card shows cover image/preview + title
- Click to open page
- Card size: small/medium/large option

### Timeline View
- Horizontal bars on a time axis
- Zoom: hours, days, weeks, months, quarters, years
- Optional left-side table showing properties
- Drag bar edges to change dates
- "Today" button to navigate to current date

---

## Keyboard Shortcuts (Key Ones for Mock)

| Shortcut | Action |
|----------|--------|
| Cmd+K / Cmd+P | Open search |
| Cmd+N | New page |
| Cmd+B | Bold |
| Cmd+I | Italic |
| Cmd+U | Underline |
| Cmd+E | Inline code |
| Cmd+Shift+S | Strikethrough |
| Cmd+K (with selection) | Add link |
| Cmd+D | Duplicate block |
| Cmd+Shift+M | Add comment |
| Cmd+\ | Toggle sidebar |
| Cmd+[ | Go back |
| Cmd+] | Go forward |
| Cmd+Shift+L | Toggle dark/light mode |
| Esc | Select block |
| Enter | Edit block / new line |
| Shift+Enter | New line within block |
| Tab | Indent block |
| Shift+Tab | Outdent block |
| / | Open slash command menu |
| Backspace (empty block) | Delete block |

---

## What to Skip (Out of Scope)

- **Authentication/login** — App starts pre-logged-in as "Sarah Chen"
- **Real-time collaboration** — No WebSocket/multiplayer
- **AI features** — No Xotion AI
- **Import/export** — No file import/export
- **Integrations** — No third-party connections
- **Notifications** — Simplified (no real push)
- **OAuth/SSO** — No identity verification
- **File uploads** — Mock only (URLs, not real uploads)
- **Mobile responsive** — Desktop-only focus

---

## Screenshots Reference

Downloaded to `assets/screenshots/`:
- `000003.jpg` — Xotion workspace settings modal showing sidebar navigation, workspace name, icon settings
- `000004.jpg` — Xotion preferences modal showing appearance, language & time settings, sidebar structure

Key UI observations from screenshots:
- Sidebar has light gray background (#FBFBFA)
- Top of sidebar: workspace icon (colored square with initial letter) + name + chevron
- Quick links: Search, Home, Inbox (with icon), Settings & Members
- Section headers: "Private", "Shared", "Favorites" in small uppercase gray text
- Page rows: 28px height, subtle hover highlight
- Settings modal: left sidebar tabs (Account > name, Preferences, Notifications, Connections; Workspace > General, People, Teamspaces, etc.)
