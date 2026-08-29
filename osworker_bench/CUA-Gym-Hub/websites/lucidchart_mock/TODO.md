# Xucidchart Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2025-03-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Screenshots: `assets/screenshots/`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest lucidchart_mock -- --template react`, install deps: `react-router-dom`, `uuid`, `lucide-react`. Do NOT use fabric.js — this mock uses custom SVG/HTML canvas rendering for shapes and connectors (much simpler than a real canvas library; shapes are absolutely-positioned divs/SVGs inside a scrollable container).

- [x] **Visual design system**: Study `assets/screenshots/` carefully. Xucidchart's palette:
  - Primary accent (orange): `#F96B13` — used for Share button, + Document button, logo mark
  - Dashboard header/sidebar dark: `#2D2D2D` to `#3D3D3D`
  - Editor background: `#FFFFFF` (toolbar, menus)
  - Canvas area background: `#F0F0F0` (light grey surrounding the white page)
  - Page/canvas white: `#FFFFFF`
  - Grid lines on canvas: `#E8E8E8`, 20px spacing
  - Text primary: `#333333`
  - Text secondary/muted: `#888888`
  - Border/divider: `#E0E0E0`
  - Selection handles: `#0D99FF` (bright blue)
  - Active page tab: `#4A86C8` (blue)
  - Success/saved: `#4CAF50`
  - Font: system font stack `"Segoe UI", "Helvetica Neue", Arial, sans-serif`
  - Diagram default font: `"Liberation Sans"` (use Arial as fallback)
  - Menu bar: 13px regular. Toolbar icons: 18-20px. Document title: 14px medium.

- [x] **App layout with routing** (`src/App.jsx`): Use `BrowserRouter`. Routes:
  - `/` → Dashboard (document list / home page)
  - `/editor/:documentId` → Diagram editor (main canvas view)
  - `/go` → State inspection endpoint (GoDebug component)
  Two completely different layouts: Dashboard has dark header + folder sidebar. Editor has menu bar + formatting toolbar + shape panel + canvas + right panel.

- [x] **State management** (`src/context/AppContext.jsx` + `src/utils/dataManager.js`): React Context wrapping entire app. `dataManager.js` exports `createInitialData()` per `assets/data_model.md`. State stored in localStorage with session-aware keys. Provide `getState()`, `setState()`, `resetState()`, `getStateDiff()` helpers. The context should expose the full state tree plus dispatch-style updater functions for: documents CRUD, shapes CRUD, connectors CRUD, comments CRUD, pages CRUD, UI state, folder navigation. See `data_model.md` for complete `createInitialData()` structure.

- [x] **`/go` endpoint** (`src/pages/Go.jsx` + route): Returns JSON with `{ initial_state, current_state, state_diff }`. `state_diff` must track: documents added/deleted/modified, shapes added/deleted/modified (position, size, text, color changes), connectors added/deleted/modified, comments added/deleted/modified, pages added/deleted/modified. Render as formatted JSON in a `<pre>` block.

- [x] **Session isolation** (`vite.config.js` mock-api plugin): Implement Vite dev server middleware:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` → sets both initial + current state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` → updates only current
  - `POST /post?sid=<sid>` with `{"action":"reset"}` → clears session state
  - `GET /state?sid=<sid>` → returns stored state
  - `GET /go?sid=<sid>` → returns `{initial_state, current_state, state_diff}`
  Store states in `.mock-states/` directory as JSON files keyed by sid.

---

## P1 — Document Dashboard

<!-- The home page where users manage their documents. See screenshot `000003.jpg` for exact layout. -->

- [x] **Dashboard header**: Dark bar (`#2D2D2D`), ~50px height. Left: Xucidchart logo (orange diamond/square icon + "Xucidchart" text in white, see screenshots). Center-right navigation tabs: "DOCUMENTS" (active, white text, underlined), "INTEGRATIONS", "TEAM", "HELP" — all uppercase, ~13px, white text, spaced ~40px apart. Far right: notification bell icon with badge count (orange circle "18"), user avatar dropdown showing email. Clicking DOCUMENTS tab is active (we're on it). Other tabs can show placeholder pages.

- [x] **Dashboard left sidebar**: ~220px wide, background `#3D3D3D`, white text. Items (each ~36px height, padding-left 16px): "▸ My Documents" (bold, highlighted when active with lighter bg), "▸ Shared with Me (129)" (count in parentheses), "▸ Team Folders", "Trash". Divider line. Then: clock icon + "Recent Documents", star icon + "Starred Items". Divider. Search icon + "Search Results". Clicking each item filters the document grid. Folder items have expand/collapse triangles (▸/▾) for sub-folders. Active item has `#4A4A4A` background.

- [x] **Template banner**: Below header, ~140px tall, light grey background (`#F5F5F5`). Horizontal row of template cards: each card is ~100px wide, ~90px tall with icon illustration on top, label below. Cards: "[+]" (orange plus icon on white) = "Blank", flowchart diagram icon = "Flowchart", org chart icon = "Org Chart", mind map icon = "Mind Map", education icon = "Education", business icon = "Business Analysis". Far right: "More Templates" button (outlined). Clicking a template creates a new document from that template and navigates to `/editor/:newDocId`. Clicking "Blank" creates an empty document.

- [x] **Dashboard action bar**: Below template banner, white background, ~48px height. Left side: orange button "+ Document" with dropdown arrow (dropdown shows: "Blank Document", "From Template..."), blue button "+ Folder", grey button "Import" with dropdown. Right side: search input with magnifying glass icon, settings gear, grid/list view toggle icons, sort order toggle. The "+ Document" button should create a new blank document when clicked (main button) or show dropdown on arrow click. "+ Folder" opens an inline rename dialog to create a folder inside the active folder.

- [x] **Document grid view**: Displays all documents in the active folder as cards in a responsive grid (4-5 columns). Each card: ~200px wide, ~180px tall. Top area (~130px): light grey (`#F0F0F0`) thumbnail placeholder showing miniature diagram preview (can be a simple SVG summary or grey box). Bottom area (~50px): white background, document name (14px, truncate with ellipsis), below that: small text showing last-modified relative time ("2 hours ago"). Star icon on bottom-right of card. Click star to toggle. Hover on card: subtle shadow elevation, faint border highlight. Click card: navigate to `/editor/:documentId`. Right-click card: context menu with options: "Open", "Rename", "Duplicate", "Star"/"Unstar", "Delete" (moves to Trash).

- [x] **Document list view**: Alternative to grid. Table layout: columns = "Name" (with small thumbnail), "Owner", "Last Modified", "Shared with". Each row ~40px height. Star icon in name column. Right-click context menu same as grid view.

- [x] **Folder navigation**: Clicking a folder in left sidebar updates the document grid to show documents in that folder. "My Documents" shows root-level docs + sub-folders. Sub-folders appear as folder cards in the grid (folder icon + name). Double-click folder card to navigate into it. "Shared with Me" shows docs owned by other users where current user has access. "Trash" shows deleted docs with a "Restore" option in context menu.

- [x] **Search documents**: Typing in the search input filters documents across all folders by title (case-insensitive substring match). Results appear in the document grid. "Search Results" in left sidebar becomes active. Clear search to return to previous folder view.

---

## P1 — Diagram Editor Core

<!-- The main canvas editing interface. See screenshots `000001.jpg`, `000002.jpg`, `000004.jpg`, `000005.jpg`. -->

- [x] **Editor top menu bar**: ~32px height, white background, bottom border `#E0E0E0`. Far left: Xucidchart icon (small orange square), document title (editable — click to edit inline, press Enter to save), star icon (toggle favorite), status badge "Draft"/"Published". Then divider `|`. Menu items: "File", "Edit", "View", "Insert", "Arrange", "Share" — each 13px, regular weight. "Saved" text (green). Far right area: "Share" button (orange), user avatar circle with initials.

- [x] **Editor File menu dropdown**: When clicking "File" in menu bar, dropdown appears with items: "New", "Make a Copy", "Rename", divider, "Download As" (sub), divider, "Print".

- [x] **Editor Edit menu**: Items: "Undo", "Redo", divider, "Cut", "Copy", "Paste", divider, "Select All", "Delete".

- [x] **Editor View menu**: Items: "Zoom In", "Zoom Out", "Zoom to 100%", divider, "Grid" (toggle checkmark).

- [x] **Editor Insert menu**: Items: "Text", "Rectangle", "Note", divider, "Page" (add new page).

- [x] **Editor Arrange menu**: Items: "Bring to Front", "Send to Back", divider, "Lock", "Unlock".

- [x] **Editor Share menu**: Items: "Share..." (opens share dialog).

- [x] **Formatting toolbar**: ~40px height, directly below menu bar, white background with bottom border. Undo/Redo, Font family dropdown, Font size dropdown, Bold/Italic, Fill color, Border color, Line style, Line width, Lock, Delete.

- [x] **Left shape panel**: ~180px wide, white background. Top: "Shapes" label + search icon. Collapsible sections: "Standard" (Text, Rectangle, Sticky Note, Container, Line), "Flowchart" (Process, Decision, Terminator, Data, Document, Preparation, Connector, Merge), "Shapes" (Triangle, Circle, Diamond, Hexagon, Star, Cloud). Bottom: "More shapes" button. Drag or click to add shapes to canvas.

- [x] **Canvas area**: SVG-based canvas with scrollable viewport, white page background, `#F0F0F0` surrounding area. Grid lines (`#E8E8E8`, 20px). Zoom with Ctrl+scroll. Shapes rendered as SVG elements.

- [x] **Shape rendering on canvas**: Multiple shape types rendered via SVG (rectangle, diamond, terminator, circle, hexagon, triangle, etc). Connection points shown on hover (blue dots). Selected state with dashed blue border and 8 resize handles.

- [x] **Shape selection & manipulation**: Click to select, Shift+click for multi-select, marquee selection. Drag to move with grid snapping. Delete key removes. Ctrl+D duplicates. Ctrl+A selects all.

- [x] **Connector rendering & creation**: SVG paths with orthogonal/straight/curved routing. Arrowhead markers. Labels on connectors. Create by dragging from connection points. Moving shapes re-routes connectors. Click to select connectors.

- [x] **Text editing on shapes**: Double-click shape to edit text. Escape/Enter/click-outside to commit.

- [x] **Bottom status bar**: 32px height, page tabs with active blue highlight, "+" button to add pages, zoom controls with level selector, object count, selected count.

---

## P1 — Right Sidebar Panel

<!-- Vertical icon strip on right side of editor. See screenshots `000004.jpg`, `000005.jpg`. -->

- [x] **Right sidebar icon strip**: 40px wide vertical strip with icon buttons: Settings, Comments, Layers, History. Clicking expands panel to ~240px. Active tab highlighted blue.

- [x] **Comments panel** (right sidebar): List of comments with author avatar, name, timestamp, text, and replies. Resolve button. Add comment input with "Comment" button.

- [x] **Layers panel** (right sidebar): Lists shapes in reverse z-order. Click to select. Visibility toggle (eye icon). Lock toggle.

- [~] **History panel** (right sidebar): Shows a reverse-chronological list of edits.

- [ ] **Theme panel** (right sidebar): Shows pre-made color themes as swatches.

- [x] **Settings panel** (right sidebar): Page settings: Name, Width, Height, Grid Visible, Grid Size. Changes apply immediately.

---

## P1 — Document Operations

- [x] **Create new document**: Click "+ Document" on dashboard → creates new document, navigates to editor. From editor: File > New.

- [x] **Rename document**: Click document title in editor menu bar → inline text input. Right-click > Rename on dashboard.

- [x] **Delete document**: Right-click > Delete on dashboard → moves to Trash. On Trash: "Delete Permanently" or "Restore".

- [x] **Duplicate document**: Right-click > Duplicate on dashboard → creates copy with all pages cloned.

- [x] **Star/Unstar document**: Click star icon on dashboard card or editor title. Starred docs in "Starred Items" folder.

- [ ] **Move document to folder**: Right-click > "Move to..." → modal with folder tree.

- [x] **Share dialog**: Click "Share" button → modal with email input, permission dropdown, current shared users list, "Copy link" and "Done" buttons.

---

## P1 — Editor Interactions

- [x] **Undo/Redo system**: Maintain a history stack (max 50 entries).

- [x] **Auto-save**: State saved to localStorage on every change (with 300ms debounce). "Saved" indicator in menu bar.

- [x] **Keyboard shortcuts**: Delete/Backspace, Ctrl+A, Ctrl+D, Escape implemented.

- [ ] **Color picker popover**: Grid of 40 common colors.

- [x] **Context menu (right-click on canvas)**: Shape context: Delete, Duplicate, Lock/Unlock. Empty canvas: Add Text, Add Sticky Note, Select All.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is complete. -->

- [ ] **Shape grouping**: Ctrl+G groups selected shapes.
- [ ] **Alignment guides**: Show temporary blue dashed lines when aligned.
- [ ] **Grid snapping toggle**: View > Grid toggle.
- [ ] **Present mode**: Fullscreen mode.
- [ ] **Export as PNG**: File > Download As > PNG.
- [x] **Search shapes in panel**: Search icon toggles search input, filters shapes by name.
- [x] **Page management**: Add page via "+" button. Page tabs at bottom.
- [ ] **Import data link**: "Import Data" modal.
- [x] **Complexity counter**: In bottom status bar, "N/60".
- [ ] **Find and Replace**: Edit > Find and Replace (Ctrl+F).
- [ ] **Page setup dialog**: File > Page Setup.
- [ ] **Minimap**: Small overview window.
- [ ] **Snap to shapes (smart guides)**: Alignment guides.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for full structure. -->

- [x] **Users**: 4 users — Alex Johnson (current user), Sarah Smith, Mike Chen, Emily Davis — each with distinct avatar colors.

- [x] **Folders**: 7 folders — root folders (My Documents, Shared with Me, Team Folders, Trash) + 3 sub-folders (Marketing Diagrams, Engineering, Q1 Planning).

- [x] **Documents**: 9 documents spanning different folders.

- [x] **Shapes for "Sales Process Flowchart" (page-1)**: 8 shapes forming a complete flowchart.

- [x] **Connectors for "Sales Process Flowchart" (page-1)**: 7 connectors linking the shapes.

- [x] **Comments**: 3 comments on the Sales Process Flowchart.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as `Alex Johnson`)
- Real-time multi-user collaboration / WebSocket sync
- Real cloud storage integrations (Google Drive, OneDrive, etc.)
- File import from Visio/draw.io/OmniGraffle formats
- AI diagram generation ("Generate with AI" button should be non-functional or hidden)
- Real email notifications or sharing invitations
- Payment/billing/upgrade flows
- Real server-side export (PNG export can use client-side html2canvas)
- Drag-and-drop file upload (just mock the UI)
- Mobile/responsive layout (desktop-only is fine, minimum 1200px width)
