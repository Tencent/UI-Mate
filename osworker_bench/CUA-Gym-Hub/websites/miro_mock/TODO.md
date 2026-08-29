# Xiro Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest miro_mock -- --template react`, install deps: `react-router-dom`. No Tailwind — use plain CSS to match Xiro's custom design system.

- [x] **Visual design system**: Study `assets/screenshots/toolbar_000002.jpg` (full board), `assets/screenshots/toolbar_000003.jpg` (dashboard), and `assets/screenshots/board_content_000003.jpg` (color picker). Exact color palette:
  - Primary Blue: `#4262ff` (Share button, new board card, active tool highlight, links)
  - Dark Navy: `#050038` (Xiro logo text, headings)
  - White: `#ffffff` (toolbar bg, top bar bg, card bg)
  - Canvas Gray: `#f5f5f5` (board canvas background)
  - Border Gray: `#e0e0e0` (card borders, dividers)
  - Text Dark: `#1a1a1a` (body text)
  - Text Muted: `#b3b3b3` (placeholder text, secondary info)
  - Hover Gray: `#f0f0f0` (button/item hover states)
  - Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Border radius: 8px for cards/panels, 12px for toolbar, 20px for Share button pill
  - Shadows: `0 2px 8px rgba(0,0,0,0.1)` for floating panels, `0 1px 4px rgba(0,0,0,0.08)` for cards

- [x] **App layout & routing**: `App.jsx` with `BrowserRouter`. Two main routes:
  - `/` → Dashboard page (boards list)
  - `/board/:boardId` → Board canvas page
  - `/go` → State inspection endpoint (JSON response with `initial_state`, `current_state`, `state_diff`)
  Route structure: `<BrowserRouter><Routes><Route path="/" element={<Dashboard />} /><Route path="/board/:boardId" element={<BoardView />} /><Route path="/go" element={<StateInspector />} /></Routes></BrowserRouter>`

- [x] **State management**: React Context (`AppContext.jsx`) + `dataManager.js`. The context provides `{ state, dispatch }` where state contains all entities from `data_model.md`. Actions: `ADD_BOARD`, `UPDATE_BOARD`, `DELETE_BOARD`, `STAR_BOARD`, `ADD_ITEM`, `UPDATE_ITEM`, `DELETE_ITEM`, `MOVE_ITEM`, `RESIZE_ITEM`, `ADD_COMMENT`, `RESOLVE_COMMENT`, `ADD_TAG`, etc. Persist to localStorage under key `miro_mock_state`. Load initial data from `createInitialData()` (see `data_model.md` for full structure with 5 boards, items for board_1 retro + board_4 architecture).

- [x] **`/go` endpoint**: `src/pages/StateInspector.jsx`. On mount, reads `initialState` (stored at first load) and `currentState` from context. Computes diff: for each board, compare items arrays. Returns JSON: `{ initial_state: {...}, current_state: {...}, state_diff: { boards: {added:[], modified:[], removed:[]}, boardItems: {<boardId>: {added:[], modified:[], removed:[]}}, comments: {...}, tags: {...} } }`. Render as formatted `<pre>` JSON block.

- [x] **Session isolation**: Add `vite.config.js` mock-api plugin. `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` stores state keyed by session ID in a Map. `GET /state?sid=<sid>` returns `{initial_state, current_state, state_diff}`. `POST /post?sid=<sid>` with `{"action":"reset"}` clears session state. `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` updates only current state. In `dataManager.js`, add session helpers: `getSessionState(sid)`, `setSessionState(sid, state)`, `resetSession(sid)`.

---

## P0 — Dashboard Page

- [x] **Dashboard layout** (see `assets/screenshots/toolbar_000003.jpg`): Full-width page, white background `#ffffff`. Structure:
  - Top area: Xiro logo (bold "xiro" text, `#050038`, 28px font, top-left at 24px margin) + Search bar (centered, ~600px wide, 44px height, rounded 8px, border `#e0e0e0`, placeholder "Search boards", magnifying glass icon left-aligned inside)
  - Left sidebar (260px fixed width, padding 24px):
    - "Recent" link with clock icon (16px, `#1a1a1a` text)
    - "Starred" link with star outline icon
    - Divider line
    - Team selector: bold "My Team" text + "4 members" muted below + dropdown chevron
    - "Boards in this team" link with monitor icon (highlighted blue `#4262ff` when active)
    - "Templates" link with grid icon
    - Divider line
    - "Projects" bold heading + "+ Add" button (small outlined pill)
    - Project list: each project name as a clickable link (e.g., "Q1 Planning", "Product Design", "Engineering")
  - Main content area (flex: 1, padding 32px):
    - Section heading "Boards in this team" (28px bold, `#050038`)
    - Board cards grid: CSS Grid, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap 24px

- [x] **Board cards**: Each card is 280px min width, ~200px height, border-radius 8px, border `#e0e0e0`, background white, hover shadow `0 2px 8px rgba(0,0,0,0.15)`, cursor pointer.
  - **"New board" card**: First in grid, solid blue `#4262ff` background, white "+" icon (48px) centered, "New board" text below icon (14px white). Clicking creates a new empty board and navigates to `/board/<newId>`.
  - **Existing board cards**: Show thumbnail preview area (top 70%, light gray or colored background with miniature representation of board content — can be a simple colored rectangle for now), board name below (14px, dark text, truncated with ellipsis if too long), bottom-left shows modified date ("Feb 15" format), bottom-right shows "···" more menu on hover.
  - **Star icon**: Small star in top-right corner of card, outline when not starred, filled yellow `#f5d128` when starred. Click toggles starred status.
  - **Card hover**: On hover, show subtle shadow elevation and "···" three-dot menu button in bottom-right corner.

- [x] **Board card context menu**: Clicking "···" opens a dropdown menu (white bg, shadow, rounded 8px, 200px wide) with options: "Rename" (opens inline text input), "Duplicate" (clones board + all items), "Move to project" (submenu with project list), "Star/Unstar", divider, "Delete" (red text, shows confirm dialog). Each option has an icon left-aligned.

- [x] **Sidebar navigation**: Clicking "Recent" filters main area to show boards sorted by `viewedAt` desc. Clicking "Starred" filters to only starred boards. Clicking a project name filters to boards in that project. Active item is highlighted with blue text `#4262ff` and light blue background `#eef0ff`.

- [x] **Create new board**: Clicking "New board" card or a "+" floating action button creates a board with auto-generated name "Untitled board", empty items array, and navigates to `/board/<newBoardId>`.

---

## P0 — Board Canvas Page (Core)

- [x] **Board page layout** (see `assets/screenshots/toolbar_000002.jpg`): Full viewport, no scroll on body. Structure:
  - **Top bar**: Fixed, 56px height, full width, white bg, border-bottom `1px solid #e0e0e0`, z-index 100. Layout is flexbox with three sections:
    - Left: Xiro logo ("xiro" bold 20px navy, clickable → navigates to dashboard `/`), vertical divider (1px gray, 24px tall), board name (16px, editable on click — turns into text input with blue border, Enter to save, Escape to cancel), then icon buttons (20px each, gray, hover dark): Settings gear, Bell notification, Upload arrow, Search magnifying glass
    - Center: Row of collaboration tool buttons: ">" chevron, lightning bolt + "Meeting" text, clock timer, camera icon, sticky-notes icon, list icon, down-chevron "more". These are 32px height, rounded 6px, 12px padding, gray text, hover `#f0f0f0` bg.
    - Right: Filter funnel icon, cursor-trail icon, user avatar circle (32px, colored ring, initials "AM"), **Share** button — pill shape: 36px height, rounded 20px, `#4262ff` bg, white text "Share" 14px, globe icon left of text. Hover: `#3451d1`.

- [x] **Left toolbar** (see `assets/screenshots/toolbar_000001.jpg` and `toolbar_000002.jpg`): Fixed, left edge, 56px wide, floating with white bg, rounded 12px, shadow `0 2px 8px rgba(0,0,0,0.1)`, margin 12px from edge, z-index 90. Contains two groups separated by gap:
  - **Top group** (creation tools), each tool is a 40x40px button area, centered icon 20px, hover bg `#f0f0f0` rounded 8px, active/selected tool has light blue bg `#eef0ff` and blue icon `#4262ff`:
    1. **Select** tool (cursor/arrow icon) — default active tool. Keyboard: V
    2. **Templates** (grid/layout icon). Click opens templates panel (P2)
    3. **Text** tool (T icon). Keyboard: T. Click then click on canvas → places text item at click position
    4. **Sticky Note** tool (post-it/note icon). Keyboard: N. Click then click on canvas → places sticky note at click position
    5. **Pen** tool (pen/draw icon). Keyboard: P. (For mock: just show as selectable tool, no actual drawing)
    6. **Frames & Shapes** (frame icon). Click opens submenu panel showing: Shapes section (grid of shape type icons: rectangle, round_rectangle, circle, triangle, rhombus, star, etc.) and Frames section. Clicking a shape selects it as active tool, then click on canvas places that shape. Keyboard: S for shape, F for frame
    7. **More tools** (>> double-chevron icon with small blue dot). Click opens apps/more-tools panel (P2)
  - **Bottom group** (undo/redo):
    8. **Undo** (curved left arrow). Click dispatches undo. Keyboard: Ctrl+Z
    9. **Redo** (curved right arrow). Click dispatches redo. Keyboard: Ctrl+Shift+Z
  - **Bottom-left corner** (separate from toolbar):
    10. **Minimap toggle** (grid icon, 40x40px, white bg, rounded 8px, shadow). Click shows/hides minimap panel (P2)

- [x] **Canvas area**: Fills remaining viewport space after top bar. Implementation: a div with `overflow: hidden`, position relative. Inside: a transformable container div that holds all board items, applying CSS `transform: translate(${panX}px, ${panY}px) scale(${zoom})`. Background: `#f5f5f5`. Canvas starts centered on the board's content center.
  - **Pan**: Mouse down on empty canvas area (not on an item) + drag → updates `panX`, `panY`. Also: middle-mouse-button drag always pans. Space+drag pans.
  - **Zoom**: Ctrl+scroll wheel changes zoom level. Zoom range: 10% to 400%, default 100%. Zoom steps: 10%, 25%, 50%, 75%, 100%, 150%, 200%, 300%, 400%. Zoom toward mouse cursor position (adjust panX/panY to keep cursor point stable).

- [x] **Zoom controls** (see bottom-right of `toolbar_000002.jpg`): Fixed position, bottom-right corner (16px margin), white bg, rounded 8px, shadow, z-index 90, row layout:
  - "−" minus button (32x32, hover bg)
  - Zoom percentage text (e.g., "100%", 14px, 50px width, center aligned)
  - "+" plus button (32x32, hover bg)
  - "|" vertical divider
  - "?" help circle icon (32x32, hover bg) — click does nothing in mock, or shows keyboard shortcut overlay

---

## P1 — Board Items Rendering & Interaction

- [x] **Render board items**: For each item in the current board's items array, render an absolutely-positioned element on the canvas. Each item div:
  - Position: `left: ${item.x - item.width/2}px`, `top: ${item.y - item.height/2}px` (items positioned by center point)
  - Size: `width: ${item.width}px`, `height: ${item.height}px`
  - Rotation: `transform: rotate(${item.rotation}deg)`
  - Z-index: `item.zIndex`
  - Apply `transform-origin: center center`
  - Items scale with the canvas zoom

- [x] **Sticky note rendering**: Render as a div with:
  - Background color from sticky note color map (see `data_model.md` §StickyNote)
  - Slight rotation (-2 to 2 degrees random per note) for realistic "sticky" feel
  - Shadow: `2px 2px 6px rgba(0,0,0,0.15)` for paper-like shadow
  - Text centered (or per `style.textAlign`), vertical alignment per `style.textAlignVertical`
  - Font size: if "auto", calculate to fit content within dimensions; otherwise use specified size
  - Border-radius: 0 (square corners, like real sticky notes — but with very subtle 2px radius)
  - Slight "folded corner" effect: pseudo-element at bottom-right corner with a small triangle fold

- [x] **Shape rendering**: Render as a div or SVG depending on shapeType:
  - `rectangle`, `round_rectangle`: div with appropriate border-radius (0 for rectangle, 8px for round_rectangle)
  - `circle`: div with `border-radius: 50%`
  - `triangle`, `rhombus`, `parallelogram`, `pentagon`, `hexagon`, `octagon`: Use CSS `clip-path` polygons
  - `star`: CSS clip-path star
  - `cloud`: SVG path or border-radius bubble approximation
  - `can` (cylinder): SVG with ellipse top + rectangle body + ellipse bottom
  - Apply `fillColor`, `fillOpacity`, `borderColor`, `borderWidth`, `borderStyle` from style
  - Render text content centered inside shape, with specified font/color/alignment

- [x] **Text item rendering**: Render as a div with:
  - Content displayed with HTML rendering (bold, italic, etc. via dangerouslySetInnerHTML or parsed)
  - Font styling from `style` object
  - Transparent background by default
  - Min-height based on font size, auto-expands vertically

- [x] **Frame rendering**: Render as a div with:
  - Light background (from `style.fillColor`, default semi-transparent gray)
  - Dashed border: `2px dashed #d0d0d0`
  - Title text at top-left: 14px bold, padding 8px, positioned outside/above the frame top edge
  - Children items render inside the frame (their absolute positions are relative to canvas, not frame — but visually they appear inside)
  - Frame has lower z-index than its children (renders behind them)

- [x] **Connector rendering**: Render connectors as SVG `<path>` elements overlaid on the canvas:
  - Calculate start point from `start.itemId` + `start.snapTo` (get item position, then offset to the snap point: top=center-top, right=center-right, etc.)
  - Calculate end point similarly
  - Path type: `straight` = line, `elbowed` = right-angle path, `curved` = cubic bezier
  - Apply stroke color, width, style (dashed = `stroke-dasharray: 8 4`, dotted = `stroke-dasharray: 2 4`)
  - Arrow caps: render as SVG marker at path endpoints (stealth arrow, filled triangle, diamond, etc.)
  - Captions: render text label at the midpoint of the path, white bg pill behind text

- [x] **Item selection**: Clicking on a board item selects it:
  - Show blue selection border around item: `2px solid #4262ff`
  - Show 8 resize handles: 4 corners (8x8px white circles with blue border) + 4 midpoints (6x6px white circles with blue border)
  - Show rotation handle: small circle above the top-center, connected by a thin line, cursor changes to rotate icon
  - Selected item gets a subtle blue glow: `box-shadow: 0 0 0 2px rgba(66,98,255,0.3)`
  - Clicking empty canvas deselects

- [x] **Multi-select**: Drag on empty canvas area creates a blue selection rectangle (semi-transparent `rgba(66,98,255,0.1)` fill, `1px solid #4262ff` border). All items whose bounding boxes intersect the selection rect become selected. Shift+click adds/removes from selection.

- [x] **Move items**: When an item (or multi-selection) is selected, click+drag moves it. Update `x`, `y` in state. Show position change in real-time. Dispatch `MOVE_ITEM` on mouse up.

- [x] **Resize items**: Dragging a corner handle resizes the item. Corner handles maintain aspect ratio (unless Shift held). Edge handles resize in one dimension. Update `width`, `height` in state. Minimum size: 40x40px. Dispatch `RESIZE_ITEM` on mouse up.

- [x] **Delete items**: With item(s) selected, pressing Delete or Backspace key removes them from the board. Dispatch `DELETE_ITEM` for each. Also available via context menu.

- [x] **Context toolbar** (see `assets/screenshots/board_content_000003.jpg`): When an item is selected, show a floating toolbar above the selection. Toolbar appears 8px above the top of the selected item, centered horizontally. White bg, rounded 8px, shadow, 40px height, row of icon buttons:
  - **For sticky notes**: Bold (B), Text align (≡ dropdown: left/center/right), Connection arrow (creates connector from this item), Flip (↔ vertical), Font size (Aa + "Auto" dropdown: Auto, 10, 14, 18, 24, 36, 48, 72), Link (🔗), Size toggle (S/M/L letter — changes between small sticky and large), **Color swatch** (circle showing current fill color, clicking opens 4x4 color picker grid per `assets/screenshots/board_content_000003.jpg` — 16 colors in a popover), Tag (🏷), Emoji (😊), Lock (🔒), More (···)
  - **For shapes**: Fill color (circle swatch → hex picker or preset grid), Border color, Border width slider, Border style (solid/dashed/dotted toggles), Text formatting group (Bold, Italic, font size), More
  - **For text**: Bold, Italic, Underline, Strikethrough, Font family dropdown, Font size, Text color, Alignment
  - **For connectors**: Line shape (3 icons: straight, elbowed, curved), Stroke style, Start cap selector, End cap selector, Color, Width

- [x] **Sticky note color picker popover**: When color swatch is clicked in context toolbar, show a popover (180px x 180px, white bg, rounded 8px, shadow, padding 8px). Contains a 4x4 grid of color circles (36px each, 8px gap). Each circle shows the color filled. Currently selected color has a blue ring border (`2px solid #4262ff`). Clicking a color: updates the selected sticky note's `style.fillColor`, closes popover, note immediately changes color.

- [x] **Create items from toolbar**: When a tool is active (text, sticky note, shape):
  - Cursor changes to crosshair
  - Click on canvas creates item at that position with default properties:
    - Sticky note: 199x199, light_yellow, centered at click point
    - Text: 200x40, empty content, cursor ready for typing
    - Shape: 200x120, rectangle, white fill, black border
    - Frame: 800x600, no fill, dashed border
  - After placing, automatically switch back to Select tool and select the new item
  - For connector tool: click first item (start), then click second item (end) to create connector

- [x] **Double-click to edit**: Double-clicking a sticky note, shape, text, or frame title enters inline edit mode:
  - The text content becomes an editable `<div contenteditable="true">` or `<textarea>`
  - Show a blinking cursor
  - For sticky notes/shapes: text area fills the item bounds
  - Apply current font styling
  - Click outside or press Escape to exit edit mode and save changes
  - For frame: double-click the title area specifically to edit frame title

---

## P1 — Keyboard Shortcuts & Quick Actions

- [x] **Tool keyboard shortcuts**: Listen for keydown events (only when not editing text):
  - `V` → Select tool active
  - `N` → Sticky note tool active
  - `T` → Text tool active
  - `S` → Shape tool active (default rectangle)
  - `L` → Connector/Line tool active
  - `F` → Frame tool active
  - `P` → Pen tool active (visual only, no drawing)
  - `C` → Comment tool active (P2)
  - `Delete` / `Backspace` → Delete selected items
  - `Ctrl+Z` / `Cmd+Z` → Undo
  - `Ctrl+Shift+Z` / `Cmd+Shift+Z` → Redo
  - `Ctrl+D` / `Cmd+D` → Duplicate selected items (offset +20px in x and y)
  - `Ctrl+C` / `Cmd+C` → Copy selected items to clipboard (store in state)
  - `Ctrl+V` / `Cmd+V` → Paste from clipboard (offset from original position)
  - `Ctrl+A` / `Cmd+A` → Select all items on current board
  - `Escape` → Deselect all / cancel current tool / exit edit mode

- [x] **Right-click context menu**: Right-clicking on canvas or items shows a context menu (white bg, rounded 8px, shadow, 220px wide, z-index 200):
  - On empty canvas: "Paste" (if clipboard has items), divider, "Select all"
  - On selected item(s): "Copy", "Paste", "Duplicate", divider, "Bring to front", "Send to back", divider, "Lock/Unlock", "Group" (if multiple selected) / "Ungroup" (if group selected), divider, "Delete" (red text with trash icon)
  - Menu items: 36px height each, 12px left padding, icon (20px) + text (14px), hover bg `#f0f0f0`

---

## P2 — Secondary Features

Implement after P1 is solid.

- [ ] **Search on board**: Clicking search icon in top bar opens a search overlay: a text input field that appears below the top bar, full width, with "Search on board" placeholder. Typing filters/highlights items whose content matches the search term. Matching items get a yellow highlight ring. "Enter" navigates canvas to center on next match. "Escape" closes search.

- [ ] **Board name inline editing**: Clicking the board name in the top bar:
  - Text turns into an input field with current name pre-filled
  - Blue outline border
  - Enter saves, Escape cancels
  - Name updates in state and on dashboard

- [ ] **Comments**: Comment tool (C key or toolbar). Click on canvas places a comment pin (small circle with chat icon, yellow/orange). Clicking pin opens a comment thread panel (right-side slide-in, 320px wide):
  - Shows thread of messages: each with avatar, name, timestamp, message text
  - Input field at bottom to add reply
  - "Resolve" button to mark comment resolved (pin turns gray/dimmed)

- [ ] **Voting panel**: Clicking "Meeting" tools in top bar center → voting option. Opens right panel (300px wide, white bg, shadow):
  - Header: "Voting" with feedback icon and close X
  - Two tabs: "New session" / "Results"
  - In "New session": Votes per person (number with +/- buttons), Time limit (minutes with +/- buttons), "One vote per object" toggle, Filter section (checkboxes for: Sticky notes, Shapes, Images, Text — with counts), "Start" button (blue, full width)
  - In mock: clicking Start briefly shows a "Voting in progress" state, then returns to Results showing random vote counts on sticky notes

- [ ] **Timer**: Timer button in top bar center section. Click opens a small popover with minute/second setter and Start/Stop/Reset buttons. When running, shows countdown in the top bar area.

- [ ] **Minimap**: Bottom-left toggle opens a small panel (200x150px, white bg, rounded 8px, shadow). Shows a miniature representation of the entire board (all items as tiny colored rectangles). A semi-transparent blue rectangle shows the current viewport area. Clicking/dragging on minimap pans the main canvas.

- [ ] **Templates panel**: Clicking Templates icon in left toolbar opens a left-side panel (320px wide, slide-in). Shows categories ("Brainstorming", "Planning", "Mapping", "Diagrams") with thumbnail cards. Clicking a template creates a new board pre-populated with template items and navigates to it.

- [ ] **Shape picker submenu**: When Frame/Shape tool is clicked, show a popover panel (240px wide, white bg, shadow):
  - "Shapes" section header, then a grid of shape icons (4 per row, 48x48px each): rectangle, round_rectangle, circle, triangle, rhombus, parallelogram, star, cloud, hexagon, pentagon, can, cross, right_arrow, left_arrow
  - "Frames" section header, then frame size options: "Custom", "16:9", "4:3", "A4"
  - Clicking a shape selects it as the active placement tool

- [ ] **Connector type picker**: When connector is selected, context toolbar shows three line-type buttons (straight, elbowed, curved — visual icon of each) + start cap dropdown + end cap dropdown. Cap dropdowns show icons for: none, stealth arrow, filled triangle, diamond, oval.

- [ ] **Item locking**: Lock button in context toolbar toggles `item.locked`. When locked: item cannot be moved, resized, or edited. Shows a small lock icon overlay. Selection border changes from blue to gray.

- [ ] **Bring to front / Send to back**: Context menu or keyboard shortcuts. "Bring to front" sets item's zIndex to max+1. "Send to back" sets to min-1. Affects rendering order on canvas.

- [ ] **Group/Ungroup**: Multi-select items → right-click → "Group". Grouped items move/resize together as a unit. Creates a pseudo-group entity wrapping the items. "Ungroup" dissolves the group back to individual items.

- [ ] **Tags on sticky notes**: Tag icon in sticky note context toolbar opens a tag manager popover. Shows existing tags (colored chips) with checkboxes. "Create new tag" button at bottom with name input and color picker (9 tag colors). Applied tags show as small colored dots or chips at the bottom of the sticky note.

- [ ] **Dashboard board search**: Search bar on dashboard filters boards by name as user types. Debounced (300ms). Shows matching boards, hides non-matching. Clear button (X) resets filter.

- [ ] **Dashboard view toggle**: Add grid/list view toggle buttons (top-right of main content area). Grid view shows cards (default). List view shows board rows: name, owner, modified date, starred status, more menu. Each row 48px height.

- [ ] **Share dialog**: Share button in top bar opens a modal (480px wide, centered):
  - "Share board" heading
  - Input field: "Invite by email"
  - Permission dropdown: "Can edit" / "Can view"
  - "Copy link" button with link icon
  - "Anyone with the link can view" toggle
  - Close X button top-right
  - (All actions are visual-only in mock — no real sharing)

- [ ] **Export options**: Upload/export icon in top bar opens dropdown: "Export as image (JPG)", "Export as PDF", "Save to...". Clicking any option shows a brief toast notification "Exported successfully" but performs no actual export.

- [ ] **Undo/Redo history**: Implement an action history stack (max 50 actions). Each state mutation pushes to history. Undo pops and reverses. Redo re-applies. Track: item CRUD, move, resize, style changes, board name changes. Undo/Redo buttons in toolbar gray out when unavailable.

- [ ] **Keyboard shortcut overlay**: "?" button in zoom controls or pressing "?" key shows a modal listing all keyboard shortcuts in a two-column layout.

---

## Data Seed (implement in `createInitialData()`)

See `assets/data_model.md` for complete structure. Summary:

- [x] **User**: 1 current user (Alex Morgan) with team of 4 members
- [x] **Projects**: 3 projects ("Q1 Planning", "Product Design", "Engineering")
- [x] **Boards**: 5 boards across projects and unassigned:
  - Board 1 "Sprint Retrospective" (in Q1 Planning, starred) — retro board with 3 frames ("What went well", "Improvements needed", "Action items"), 8+ sticky notes in various colors, 1 text title, 1 connector, 1 comment thread
  - Board 2 "Product Roadmap 2025" (in Q1 Planning) — empty or minimal items
  - Board 3 "User Flow Diagrams" (in Product Design) — a few shapes with connectors showing user flow
  - Board 4 "Architecture Overview" (in Engineering, starred) — system architecture diagram with 5 round_rectangle shapes (Frontend, API Gateway, Auth Service, User Service, PostgreSQL) connected by labeled connectors
  - Board 5 "Brainstorming Session" (no project) — scattered sticky notes in various colors
- [x] **Tags**: 3 tags on board_1 ("High Priority"=red, "Quick Win"=green, "Blocked"=yellow)
- [x] **Comments**: 1 comment thread on board_1 with 2 messages

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as "Alex Morgan")
- Real-time collaboration / multi-cursor
- Xiro AI features (content generation, summarization)
- Video calls on board
- Pen/freehand drawing (too complex for mock canvas)
- Real file uploads
- Integration with external tools (Jira, Slack, Figma)
- Mobile/responsive layout (desktop-only)
- Presentation mode recording (Talktracks)
- Advanced diagramming (UML, AWS icons, BPMN)
- Mind map nodes
- Data import/export to real formats
