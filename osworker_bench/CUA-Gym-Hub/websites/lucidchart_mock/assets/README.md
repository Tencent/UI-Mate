# Xucidchart — Comprehensive Research Summary

## App Overview

**Xucidchart** is a web-based intelligent diagramming application developed by Lucid Software. It enables users to create, edit, and collaborate on flowcharts, org charts, UML diagrams, mind maps, network diagrams, ERDs, wireframes, and many other diagram types. It is one of the most popular cloud-based diagramming tools, competing with Microsoft Visio, draw.io, and Miro.

**Key value proposition:** Real-time collaborative diagramming with an extensive shape library, smart connectors, and template gallery — all in a browser-based canvas editor.

**URL:** `https://lucid.app/`

---

## Key User Personas & Primary Workflows

### Persona 1: Software Engineer
- Creates UML class/sequence diagrams
- Draws system architecture diagrams
- Documents API flows and data pipelines
- **Primary workflow:** Open doc → drag shapes from library → connect with lines → add labels → share with team

### Persona 2: Business Analyst
- Creates flowcharts for business processes
- Builds org charts for team structures
- Maps customer journey flows
- **Primary workflow:** Start from template → customize shapes/text → add decision diamonds → export as PDF

### Persona 3: Product Manager
- Creates wireframes and mockups
- Builds mind maps for brainstorming
- Creates swimlane diagrams for cross-team processes
- **Primary workflow:** Browse templates → pick layout → edit content → add comments → present to stakeholders

### Persona 4: IT Administrator
- Documents network infrastructure
- Creates cloud architecture diagrams (AWS, Azure, GCP)
- Maps database schemas (ERD)
- **Primary workflow:** Use specialized shape libraries → drag infrastructure icons → connect with labeled lines

---

## Complete Feature List

### P0 — Critical (App Cannot Render Without These)

1. **Document Dashboard/Home Page** — Grid/list view of all documents with thumbnails, names, last-modified dates, starring, and folder navigation
2. **Canvas Editor** — Infinite scrollable canvas with grid background where shapes are placed and connected
3. **Shape Panel (Left Sidebar)** — Categorized drag-and-drop shape libraries: Standard, Flowchart, Shapes, UML, etc.
4. **Top Menu Bar** — File, Edit, Select, View, Insert, Arrange, Share, Help menus
5. **Formatting Toolbar** — Font family, size, bold/italic/underline, text color, fill color, line style, arrowheads, alignment
6. **Connectors/Lines** — Lines that snap between shapes with auto-routing, arrowhead styles, and labels
7. **Page Tabs** — Multi-page documents with Page 1, Page 2, etc. tabs at bottom
8. **Zoom Controls** — Zoom slider, zoom percentage display, fit-to-page

### P1 — Important (Core Interactive Workflows)

9. **Shape Drag & Drop** — Drag shapes from sidebar onto canvas; shapes snap to grid
10. **Shape Selection & Manipulation** — Click to select, multi-select with marquee/Shift+click, resize handles, rotation handle
11. **Text Editing** — Double-click shapes to edit text inline; standalone text blocks
12. **Connector Creation** — Click connection points (dots on shape edges) and drag to target shape
13. **Right Sidebar Panel** — Tabs for: Settings, Comments, Present, History, Layers, Theme, Chat
14. **Comments** — Add comments on specific shapes; threaded conversations; resolve comments
15. **Document Management** — Create new document, create folder, rename, delete, move, duplicate, star/favorite
16. **Template Gallery** — Pre-built templates: Blank, Flowchart, Org Chart, Mind Map, Education, Business Analysis
17. **Shape Properties** — Position (x, y), size (w, h), rotation, fill color, border color, border width, opacity
18. **Undo/Redo** — Ctrl+Z / Ctrl+Shift+Z with visual buttons
19. **Copy/Paste** — Ctrl+C / Ctrl+V for shapes and groups
20. **Delete** — Delete/Backspace to remove selected shapes
21. **Document Title** — Editable document name in top bar with star/favorite toggle
22. **Share Dialog** — Share button opens dialog with email invite, link sharing, permission levels (view/edit)
23. **Save Status** — Auto-save indicator showing "Saved" / "Saving..." in menu bar

### P2 — Secondary (Depth & Realism)

24. **Layers Panel** — Show/hide/lock layers; reorder objects front/back
25. **Theme/Styling Panel** — Pre-made color themes applied to all shapes
26. **History/Revision Panel** — View revision timeline, restore previous versions
27. **Present Mode** — Full-screen presentation of diagram pages
28. **Search Shapes** — Search within shape panel to filter shapes
29. **Grid Snapping** — Toggle grid visibility, snap shapes to grid
30. **Alignment Guides** — Smart alignment guides when dragging shapes near others
31. **Shape Grouping** — Group/ungroup multiple shapes (Ctrl+G)
32. **Arrange Menu Actions** — Bring to front, send to back, align left/center/right, distribute evenly
33. **Export Options** — Download as PNG, PDF, SVG, CSV, Visio
34. **Import** — Import Visio, draw.io, CSV files
35. **Folder Navigation** — My Documents, Shared with Me, Team Folders, Trash, Recent, Starred
36. **Document View Modes** — Grid view vs. list view toggle on dashboard
37. **Keyboard Shortcuts** — Comprehensive shortcuts for all major actions
38. **Complexity Counter** — Shows object count (e.g., "9/60")
39. **Import Data** — Import data from external sources to auto-generate diagrams
40. **My Saved Shapes** — User's personal shape library; drop shapes to save

---

## UI Layout Description

### Document Dashboard (Home Page)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Xucidchart    DOCUMENTS  INTEGRATIONS  TEAM  HELP  🔔 [avatar] │
├──────────┬──────────────────────────────────────────────────┤
│          │ Template Banner:                                  │
│ My Docs  │ [+] Blank | Flowchart | Org Chart | Mind Map ... │
│ Shared   │──────────────────────────────────────────────────│
│ Team     │ [+ Document▾] [+ Folder] [Import▾]   🔍 Search  │
│ Trash    │──────────────────────────────────────────────────│
│          │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│ Recent   │ │ thumb  │ │ thumb  │ │ thumb  │ │ thumb  │    │
│ Starred  │ │        │ │        │ │        │ │        │    │
│ Search   │ │ Name   │ │ Name   │ │ Name ★ │ │ Name   │    │
│          │ └────────┘ └────────┘ └────────┘ └────────┘    │
│          │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│          │ │ thumb  │ │ thumb  │ │ thumb  │ │ thumb  │    │
│          │ └────────┘ └────────┘ └────────┘ └────────┘    │
└──────────┴──────────────────────────────────────────────────┘
```

- **Header**: Dark charcoal/near-black (#2D2D2D), white text, ~50px height
- **Left sidebar**: ~220px wide, dark grey (#3D3D3D), white text, folder tree
- **Template banner**: Light grey background, ~120px tall, horizontal scrollable template cards
- **Action bar**: White background, contains primary actions
- **Document grid**: White background, document cards ~200px wide with grey thumbnail preview area, name below

### Diagram Editor

```
┌──────────────────────────────────────────────────────────────────────┐
│ [◻] Doc Name ☆ ● Draft ▾ │ File Edit Select View Insert Arrange Share Help 🔒│ Saved │ [Feature Find] [Present] [Share] [Avatar] │
├──────────────────────────────────────────────────────────────────────┤
│ ↩ ↪ │ Liberation Sans ▾ │ 10pt ▾│ B I U │ Aa▾│ ≡▾│ T▾│ [fill][border][line] │ ─ ── ─·─ │ 1px▾│ None ▾│ →▾│ [align tools] │ 🔒 🗑 │
├────────────┬─────────────────────────────────────────┬───────────────┤
│ Shapes  🔍 │                                         │ ≫ │ [icons] │
│            │           CANVAS                        │    SETTINGS  │
│ ▾ Standard │     (grid background, shapes,           │    COMMENT   │
│  T □ 📋 📦  │      connectors, text)                  │    PRESENT   │
│            │                                         │    HISTORY   │
│ ▾ Flowchart│                                         │    LAYERS    │
│  □◇○▽⊕⊗   │                                         │    THEME     │
│  ⊏⊐}={│=  │                                         │    CHAT      │
│            │                                         │              │
│ ▾ Shapes   │                                         │              │
│  △▷◇○★☆   │                                         │              │
│  →↕⟷↑↓    │                                         │              │
│            │                                         │              │
│[More shapes]│                                        │              │
│[Import Data]│                                        │              │
├────────────┼─────────────────────────────────────────┼───────────────┤
│ ≡ ⊞ │ Page 1 ▾│ + │                    │ 🔍 ⊙ │ ━━━━━◉━━ │ − + │ 75% ▾ │
└────────────┴─────────────────────────────────────────┴───────────────┘
```

**Measurements (from screenshots):**
- **Top menu bar**: ~32px height, white background, black text, border-bottom
- **Formatting toolbar**: ~40px height, white/light grey background, icon buttons with subtle borders
- **Left shape panel**: ~140–200px wide, white background, collapsible sections, shape thumbnails ~24px each
- **Right sidebar (collapsed)**: ~40px wide, vertical icon strip with labels below
- **Right sidebar (expanded)**: ~280px wide, shows full panel content (comments, settings, etc.)
- **Canvas area**: Fills remaining space, light grey (#F5F5F5) canvas background with subtle grid pattern (~20px grid), white page area in center
- **Bottom status bar**: ~32px height, contains page tabs, zoom controls
- **Page tabs**: Blue highlighted active tab ("Page 1"), dropdown arrow, "+" add page button

**Color Palette (from screenshots):**
- Primary accent: `#F96B13` (Xucidchart orange — Share button, + Document button)
- Header/dark: `#2D2D2D` to `#3D3D3D` (dashboard header, sidebar)
- Text primary: `#333333` (dark grey)
- Text secondary: `#666666` (muted)
- Canvas background: `#F5F5F5` (light grey with grid)
- Page white: `#FFFFFF`
- Grid lines: `#E0E0E0`
- Selection blue: `#0D99FF` (selected shape handles)
- Toolbar background: `#FFFFFF` (white)
- Toolbar border: `#E0E0E0`
- Tab active (page): `#4A86C8` (blue)
- Link blue: `#1A73E8`

**Typography:**
- UI font: System font stack (Helvetica Neue, Arial, sans-serif)
- Default diagram font: "Liberation Sans" (shown in toolbar dropdown)
- Menu items: 13px, regular weight
- Document title: 14px, medium weight
- Shape panel headers: 12px, semibold, uppercase or title case

---

## Data Model Overview

### Core Entities:
1. **Document** — A diagram file containing pages, shapes, and connectors
2. **Page** — A single canvas within a document (multi-page support)
3. **Shape** — A visual element placed on the canvas (rectangle, diamond, circle, etc.)
4. **Connector** — A line connecting two shapes with optional arrowheads and labels
5. **TextBlock** — Standalone text not attached to a shape
6. **Comment** — A comment thread attached to a shape or position on canvas
7. **Folder** — Organizational container for documents
8. **Template** — Pre-built document layouts
9. **User** — The logged-in user (and collaborators for shared docs)

See `data_model.md` for complete field definitions and `createInitialData()` structure.

---

## Notes on Scope

### What to Skip (Auth, etc.)
- **Authentication/Login**: App starts pre-logged-in as a default user
- **Real-time collaboration**: No WebSocket/multi-user sync — single-user only
- **Cloud integrations**: No actual Google Drive, Slack, Jira connections
- **File import from Visio/draw.io**: Not implemented (too complex)
- **AI features**: No "Generate with AI" functionality
- **Real file export**: Can simulate download as PNG (canvas to image), but no server-side PDF/SVG generation
- **Payment/Billing**: No pricing or upgrade flows

### What Makes Xucidchart Distinct
1. **Smart connectors** that auto-route between shapes and follow shapes when moved
2. **Extensive categorized shape libraries** (not just basic shapes)
3. **Multi-page documents** (unlike simple whiteboard tools)
4. **Right sidebar panel system** with tabs (Settings, Comments, History, Layers, Theme)
5. **Document dashboard** with folder organization, templates, and sharing
6. **Canvas-based editor** with grid snapping and alignment guides

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `000001.jpg` | Full editor view with shapes panel, flowchart on canvas, formatting toolbar, page tabs, zoom |
| `000002.jpg` | Editor with comments panel open on right side, sales process flowchart |
| `000003.jpg` | Document dashboard/home page with folder sidebar, template banner, document grid |
| `000004.jpg` | Editor with right sidebar icons (settings/comment/present/history/layers/theme/chat), timeline diagram |
| `000005.jpg` | Editor variant showing right sidebar labels, connector being dragged between shapes |
| Additional | More screenshots of specific features (shapes panel, formatting, dashboard, etc.) |
