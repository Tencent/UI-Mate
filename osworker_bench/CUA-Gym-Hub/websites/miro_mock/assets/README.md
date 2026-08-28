# Xiro Mock — Research Summary

## App Overview

**Xiro** is an AI-powered online collaborative whiteboard platform used by 50M+ professionals. It enables teams to brainstorm, diagram, plan projects, and collaborate visually on an infinite canvas. Xiro's core value proposition is replacing physical whiteboards with a persistent, shareable, digital visual workspace.

**Category:** Productivity / Visual Collaboration / Whiteboarding
**Primary users:** Engineers, Product Managers, Project Managers, UX Designers, Educators
**Differentiator:** Infinite canvas with diverse object types (sticky notes, shapes, connectors, frames, text, images), real-time multi-user collaboration, and extensive template library.

---

## Key User Personas & Primary Workflows

### 1. Product Manager — Sprint Planning
- Creates a board, adds frames for each sprint
- Places sticky notes for user stories, groups by priority
- Uses connectors to show dependencies
- Collaborators vote on priorities using voting feature

### 2. UX Designer — User Journey Mapping
- Lays out stages as shapes/frames across the canvas
- Adds sticky notes under each stage for touchpoints
- Connects them with labeled connectors
- Groups content in frames for organization

### 3. Engineer — Architecture Diagramming
- Uses shapes (rectangles, cylinders, clouds) for system components
- Connects with labeled connectors showing data flow
- Groups in frames labeled by service/domain
- Adds text annotations

### 4. Team Lead — Retrospective / Brainstorming
- Creates columns with frames: "What went well", "Improvements", "Action items"
- Team members add sticky notes to columns
- Uses voting to prioritize
- Uses timer for timeboxing

### 5. Educator — Lesson Planning
- Uses templates, adds content to frames
- Students interact with sticky notes
- Uses presentation mode to walk through frames

---

## Complete Feature List

### P0 — Must Have (Core Shell & Canvas)

| Feature | Description |
|---------|-------------|
| Dashboard / Boards list | Landing page showing all boards as grid cards with thumbnails, search bar, sidebar with Recent/Starred/Team sections, project folders, "New board" button |
| Board canvas view | Infinite pannable/zoomable canvas (light gray background #f5f5f5), grid dots optional |
| Top navigation bar | Xiro logo, board name (editable), settings gear, notifications bell, export/upload button, search icon; right side: collaboration tools (Meeting, Timer, Voting, Notes), user avatar, Share button |
| Left toolbar | Vertical toolbar with icons: Select (cursor), Templates, Text, Sticky Note, Pen/Draw, Frames & Shapes, More tools (expandable); below: Undo/Redo; bottom-left: minimap toggle |
| Zoom controls | Bottom-right: minus button, zoom percentage display, plus button, help (?) icon |
| Board items: Sticky Notes | Square or rectangle sticky notes with 16 color options, editable text, resizable, rotatable |
| Board items: Shapes | Rectangle, round rectangle, circle, triangle, rhombus, parallelogram, pentagon, hexagon, octagon, star, cloud, cross, arrow shapes, etc. with fill color, border, text |
| Board items: Text | Free text on canvas with font family, size, color, alignment, bold/italic/underline/strikethrough |
| Board items: Connectors | Lines connecting two items; straight/elbowed/curved; stroke style (solid/dashed/dotted); arrow caps at start/end; optional text label |
| Board items: Frames | Container rectangles that group items; titled; act as parent for child items; used for organizing sections |
| Selection & multi-select | Click to select item (shows blue selection box with resize handles); drag to multi-select; Shift+click to add to selection |
| Move items | Drag selected items to reposition on canvas |
| Resize items | Drag corner/edge handles to resize |
| Delete items | Select + Delete/Backspace key |
| Pan canvas | Click and drag on empty canvas space, or use scroll wheel |
| Zoom canvas | Ctrl+scroll wheel, or pinch gesture, or zoom buttons |

### P1 — Core Interactive Features

| Feature | Description |
|---------|-------------|
| Sticky note color picker | When sticky note selected, top context toolbar shows: Bold, Align, Connection, Flip, Font size (Auto/sizes), Link, Tag size (S/M/L), Color swatch (opens 4x4 grid: white, light_yellow, yellow, orange, lime, light_green, green, cyan, light_pink, pink, violet, red, light_blue, sky_blue, blue, black), Tag, Emoji, Lock, More |
| Shape property bar | When shape selected: fill color picker (full hex), border color, border width (0-24), border style (solid/dashed/dotted), text formatting |
| Connector property bar | When connector selected: line shape (straight/elbowed/curved), stroke style, stroke width, start/end cap type, color |
| Text formatting toolbar | Bold, italic, underline, strikethrough, font family dropdown, font size, text color, alignment (left/center/right) |
| Double-click to edit | Double-clicking any text-bearing item enters inline editing mode |
| Context menu (right-click) | Copy, Paste, Duplicate, Delete, Bring to front, Send to back, Lock, Group/Ungroup |
| Copy/Paste | Ctrl+C/Ctrl+V for items |
| Undo/Redo | Ctrl+Z / Ctrl+Shift+Z; also undo/redo buttons on left toolbar |
| Create from toolbar | Click tool in left toolbar, then click on canvas to place item at that position |
| Drag from toolbar | Some tools (sticky note, shape) allow drag-placing |
| Board name editing | Click board name in top bar to edit inline |
| Search on board | Search icon opens search overlay to find text on current board |
| Comments | Click comment tool, click on canvas to place a comment pin; opens comment thread panel |
| Frame title | Frames show a title at top-left; click to edit |

### P2 — Depth & Realism

| Feature | Description |
|---------|-------------|
| Dashboard sidebar navigation | Recent boards, Starred boards, Team selector (dropdown with member count), "Boards in this team" link, Templates link, Projects section with Add button and project list |
| Board grid/list view toggle | Dashboard can show boards as grid cards or list rows |
| Star/Favorite boards | Star icon on board card to add to Starred section |
| Board card context menu | Right-click board card: Rename, Duplicate, Move to project, Star, Delete |
| Templates panel | Clicking Templates in toolbar opens a panel with pre-made templates; categories and search |
| Presentation mode | Full-screen mode that cycles through frames as slides |
| Voting panel | Right-side panel: "New session" / "Results" tabs, vote count per person, time limit, filter by object type (sticky notes, shapes, images, text), Start button |
| Timer | Top toolbar timer widget: set minutes, start/stop |
| Minimap | Bottom-left overlay showing bird's-eye view of canvas with viewport rectangle |
| Grid background | Optional dot grid on canvas |
| Layers/Z-ordering | Bring to front / Send to back for overlapping items |
| Lock items | Lock toggle prevents moving/editing an item |
| Group items | Select multiple items and group them; group moves/resizes as unit |
| Tags on sticky notes | Colored tags (labels) attachable to sticky notes |
| Emoji reactions | Emoji picker on sticky notes for reactions |
| Export board | Export as image (JPG/PNG) or PDF |
| Share dialog | Modal with link sharing, permission levels, invite by email |
| Keyboard shortcuts | V=select, N=sticky note, T=text, S=shape, L=connector, P=pen, F=frame, C=comment, Delete=delete, Ctrl+Z=undo, Ctrl+D=duplicate, Ctrl+A=select all |

---

## UI Layout Description

### Dashboard Page (`/dashboard`)
- **Full width**, white background
- **Top-left**: Xiro logo (bold, dark navy)
- **Top-center/right**: Search bar ("Search boards") spanning most of width
- **Left sidebar** (~280px):
  - Recent (clock icon)
  - Starred (star icon)
  - Team selector dropdown ("My Team" / "4 members")
  - "Boards in this team" link
  - Templates link
  - **Projects** section header with "+ Add" button
  - Project names listed below
- **Main content area**:
  - Section heading "Boards in this team" (large, bold)
  - Grid of board cards (~300x200px each):
    - First card is "New board" (blue background #4262ff with white + icon)
    - Other cards show board thumbnail, board name below
  - Cards have hover state with options menu (three dots)

### Board Page (`/board/:id`)
Refer to screenshots: `toolbar_000002.jpg`, `board_content_000002.jpg`, `board_content_000003.jpg`

- **Top bar** (56px height, white background, slight shadow):
  - Left section: Xiro logo, board name (editable text), Settings gear, Bell notification, Upload/Export, Search magnifying glass
  - Center section: Collaboration tools row — chevron ">", lightning bolt "Meeting", Timer clock, Camera/screen, Notes/board, List, down-chevron for more
  - Right section: Filter icon, Cursor icon (showing collaborators), User avatar circle, **Share** button (blue pill with globe icon, text "Share")

- **Left toolbar** (48px wide, left edge, white background, rounded corners, floating):
  - **Creation tools** (top section, separated group):
    - Cursor/Select tool (arrow icon) — V key
    - Templates (grid icon)
    - Text tool (T icon) — T key
    - Sticky Note (post-it icon) — N key
    - Pen/Draw tool (pen icon) — P key
    - Frames & connector tools (frame icon)
    - More tools (>> chevron with blue dot for new tools)
  - **History tools** (second section, below):
    - Undo (curved left arrow)
    - Redo (curved right arrow)
  - **Bottom-left**: Minimap toggle (grid icon)

- **Canvas area**: Fills remaining space, light gray (#f5f5f5) or white background
  - Items rendered as absolutely-positioned div elements
  - Blue selection box with circular resize handles at corners and midpoints when selected
  - Blue rotation handle above top-center

- **Context toolbar** (appears above/near selected item, floating bar):
  - For sticky note: B (bold), alignment, connector, flip, Aa Auto (font size), link, M (size), color swatch, tag, emoji, lock, more (...)
  - For shape: similar but with fill color, border color, border width/style controls
  - For connector: line type, stroke style, cap selectors, color

- **Zoom controls** (bottom-right, floating):
  - Minus "−" button, percentage text (e.g., "46%"), Plus "+" button, Help "?" circle

- **Right panels** (slide in from right, ~300px wide):
  - Voting panel, Comments panel, etc.

---

## Color Palette (from screenshots)

### Xiro Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#4262ff` | Share button, new board card, selected tool highlight, links |
| Dark Navy | `#050038` | Xiro logo text, headings, primary text |
| White | `#ffffff` | Backgrounds, toolbar, top bar |
| Light Gray | `#f5f5f5` | Canvas background |
| Medium Gray | `#b3b3b3` | Borders, muted text |
| Dark Gray | `#1a1a1a` | Body text on items |

### Sticky Note Colors (16 colors, 4x4 grid)
| Name | Approximate Hex |
|------|----------------|
| White | `#ffffff` |
| Light Yellow | `#fff9b1` |
| Yellow | `#f5d128` |
| Orange | `#ff9d48` |
| Light Green/Lime | `#d5f692` |
| Yellow-Green | `#c9df56` |
| Green | `#7bc86c` |
| Cyan/Teal | `#67c6c0` |
| Light Pink | `#f5c8d0` (selected in screenshot) |
| Pink/Mauve | `#e481a8` |
| Violet | `#be88c7` |
| Red/Coral | `#ea6162` |
| Light Blue | `#b5c4e3` |
| Sky Blue | `#97d5f2` |
| Blue | `#6fa0e3` |
| Black | `#1a1a1a` |

---

## Typography
- **Logo**: "xiro" — custom wordmark, bold, navy
- **Board name**: 16px, medium weight, dark navy
- **Toolbar icons**: 20-24px, stroke icons
- **Sticky note text**: Default 14px, auto-sizing, centered
- **Shape text**: Default 14px, centered both horizontally and vertically
- **Dashboard headings**: 28px, bold

---

## Data Model Overview
See `data_model.md` for complete entity definitions.

**Core entities:**
1. **Board** — container for all items, has name, thumbnail, dates, starred status
2. **StickyNote** — positioned text note with color, shape (square/rectangle), content
3. **Shape** — geometric shape with type, fill, border, text content
4. **Text** — free text on canvas
5. **Connector** — line connecting two items with style and optional caption
6. **Frame** — container/grouping element with title
7. **Comment** — positioned comment thread on canvas
8. **Tag** — colored label attachable to items
9. **User** — current logged-in user
10. **Project** — folder organizing boards

---

## What to Skip (Out of Scope)
- Authentication / login / signup (app starts pre-logged-in)
- Real-time collaboration cursors (too complex for mock)
- AI features (Xiro AI, content generation)
- Video calls on board
- File upload to real servers
- Integration with external tools (Jira, Slack, etc.)
- Mobile interface (desktop only)
- Presentation recording (Talktracks)
- Complex template editing
- Pen/freehand drawing (canvas drawing is complex to implement realistically)

---

## Screenshots Index

| File | Description |
|------|-------------|
| `toolbar_000002.jpg` | **KEY** — Complete board view with left toolbar, top bar, zoom controls, empty canvas |
| `toolbar_000003.jpg` | **KEY** — Dashboard page with sidebar, board cards, search, projects |
| `toolbar_000001.jpg` | Apps/More tools panel expanded from left toolbar |
| `board_content_000002.jpg` | Board with frame containing many sticky notes + voting panel on right |
| `board_content_000003.jpg` | **KEY** — Sticky note selected with color picker open (16 colors, 4x4 grid) and formatting toolbar |
| `flowchart_000001.jpg` | Xiro homepage showing board with flowchart/data flow diagram |
| `board_content_000001.jpg` | Agile workflow board with sticky notes in columns |
| `000004.jpg` | Xiro whiteboard with mind map diagram |
| `000005.jpg` | Xiro board overview (YouTube thumbnail) |
