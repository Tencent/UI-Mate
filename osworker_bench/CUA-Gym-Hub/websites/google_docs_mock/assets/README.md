# Xoogle Docs Mock — Research Summary

## App Overview

**Xoogle Docs** is Google's web-based collaborative document editor, part of Google Workspace. It enables users to create, edit, format, and share rich-text documents in real-time. The app has two primary views: a **Document List home page** (docs.google.com) and a **Document Editor** page.

**Real URL**: https://docs.google.com

## Key User Personas

1. **Document Author** — Creates new documents, writes/formats content, organizes via starring
2. **Collaborator** — Edits shared documents, leaves comments and suggestions, manages permissions
3. **Reviewer** — Views documents, adds comments, resolves comment threads

## Primary Workflows

1. Create a new document from the home page → opens editor
2. Open an existing document from the list → edit content
3. Format text (bold, italic, headings, fonts, colors, alignment, lists)
4. Insert elements (tables, images, links, horizontal rules)
5. Add/reply to/resolve comments
6. Share a document with collaborators and set permissions
7. Search and filter documents on the home page
8. Rename, star, delete documents
9. Find and replace text within a document
10. Download/export documents

## UI Layout — Document Editor (Primary View)

### Header Bar (top, ~48px height)
- **Left**: Blue Docs icon (document with white lines), editable document title input, star toggle icon, move to Drive icon, cloud status icon
- **Center-right**: Last edit timestamp text
- **Right**: Version history clock icon, Comments icon (speech bubble), Share button (blue, rounded)

### Menu Bar (below header, ~32px height)
- Items: **File** | **Edit** | **View** | **Insert** | **Format** | **Tools** | **Extensions** | **Help**
- Each opens a dropdown with items, submenus, keyboard shortcuts, dividers

### Formatting Toolbar (below menu bar, ~40px height)
From left to right:
1. Search (magnifying glass) — opens find/replace
2. Undo (↶) / Redo (↷) arrows
3. Print (printer icon)
4. Spell check (A with checkmark)
5. Paint format (paint roller)
6. Zoom dropdown (shows "100%" with ▼)
7. Text style dropdown ("Normal text" ▼)
8. Font family dropdown ("Arial" ▼)
9. Font size (−) [11] (+) — decrease, input, increase
10. **B** (Bold) | *I* (Italic) | **U** (Underline)
11. Text color (A with colored underline ▼)
12. Highlight color (highlighter pen icon ▼)
13. Insert link (chain icon)
14. Add comment (speech bubble +)
15. Insert image (mountain/image icon)
16. Alignment (≡ with ▼) — left/center/right/justify
17. Line & paragraph spacing icon
18. Bulleted list / Numbered list / Checklist icons
19. Indent decrease (←|) / Indent increase (|→)
20. Clear formatting (T with strikethrough line)

### Ruler (below toolbar)
- Horizontal ruler showing inches with draggable margin markers

### Document Canvas (center, white page on gray background)
- White page (~816px wide) centered on a dark gray (#f8f9fa background) area
- Standard margins: 1 inch on all sides
- Content area has standard document formatting
- Left margin shows editing mode indicator (pencil icon in circle)

### Comments Sidebar (right side, conditional)
- Opens when comments icon clicked
- Shows comment threads with: user avatar, name, timestamp, comment text, quoted text highlight
- Reply input at bottom of each thread
- Resolve (checkmark) and more options (...) buttons per thread
- Filter tabs: All, Open, Resolved

### Share Dialog (modal overlay)
- Title: "Share '[document name]'"
- Input: "Add people and groups" with autocomplete
- "People with access" section: avatar, name, email, role dropdown (Viewer/Commenter/Editor)
- "General access" section: "Anyone with the link" toggle, permission dropdown
- Bottom: "Copy link" button (left), "Done" button (right, blue)

## UI Layout — Document List Home Page

### Top Bar
- **Left**: Hamburger menu (☰), Docs icon (blue document), "Docs" text
- **Center**: Search bar with magnifying glass icon, placeholder "Search"
- **Right**: Google Apps grid (⊞), user avatar circle

### Template Gallery Section (below top bar, dark gray background #2d2e30)
- Title: "Start a new document"
- Cards: Blank (+), Resume, Letter, Project proposal, Brochure, Report, etc.
- "Template gallery" link on far right

### Recent Documents Section (white background)
- Header row: "Recent documents" title, sort dropdown ("Last opened by me"), view toggle (grid/list icons)
- **Grid view**: Document cards in a grid, each showing:
  - Document thumbnail preview (miniature rendering of content)
  - Document title below thumbnail
  - Subtitle line: owner name · relative date (e.g., "Feb 14, 2025")
  - Three-dot menu icon on hover
- **List view**: Table with columns: Name, Owner, Last modified
  - Each row has a doc icon, clickable title, owner name, date

## Color Palette

- **Primary blue**: #4285F4 (Google blue — Docs icon, Share button, links)
- **Header background**: #F9FBFD (very light blue-gray) for editor top area
- **Document canvas**: #FFFFFF (white page)
- **Page background**: #F8F9FA (light gray behind document)
- **Home page top bar**: #FFFFFF
- **Template section bg**: #2D2E30 (dark charcoal)
- **Text primary**: #202124 (near-black)
- **Text secondary**: #5F6368 (medium gray)
- **Border/divider**: #DADCE0 (light gray)
- **Toolbar icons**: #444746 (dark gray)
- **Comment highlight**: #FEEFC3 (yellow)
- **Selected/active**: #D2E3FC (light blue)
- **Share button**: #1A73E8 (blue) with white text

## Typography

- **Primary font**: Google Sans for UI, Product Sans for branding
- **Document default**: Arial, 11pt
- **Menu items**: 14px, regular weight
- **Toolbar controls**: 14px
- **Document title**: 18px, regular weight

## Feature List (Prioritized)

### P0 — Core Shell (must have for app to function)
- App routing (home page, editor page, /go debug)
- Document list with grid/list toggle
- Document editor with rich text editing
- Formatting toolbar with all standard controls
- Menu bar with dropdown menus
- State management with session isolation
- `/go` state inspection endpoint

### P1 — Primary Interactive Features
- Bold, italic, underline, strikethrough formatting
- Heading styles (Normal, Title, Subtitle, H1-H6)
- Font family and font size selection
- Text color and highlight color pickers
- Text alignment (left, center, right, justify)
- Bullet lists, numbered lists, task lists
- Undo/redo
- Insert tables, images, links, horizontal rules
- Find and Replace UI
- Comments sidebar (add, reply, resolve, delete, filter)
- Share dialog (add users, permissions, link sharing, copy link)
- Document CRUD (create, rename, star, delete)
- Search/filter documents on home page
- Sort documents (last modified, title, date created)
- Zoom control
- View modes (Editing, Suggesting, Viewing)
- Download as file (HTML, TXT)
- Word count

### P2 — Depth Features
- Suggesting mode with tracked changes visual
- Bubble menu comment with quoted text persistence
- Indent/outdent for paragraphs (not just lists)
- Superscript/subscript formatting
- Page break insertion
- Spelling/grammar check simulation
- Version history panel (mock)
- Paint format (format painter)
- Line spacing options
- Document outline sidebar
- Keyboard shortcuts dialog
- Template gallery on home page

## What to Skip
- Real-time collaboration (no WebSocket simulation)
- Authentication / login
- Google Drive integration
- Extension/Add-on marketplace
- Voice typing
- Translate document
- Real file upload to server
- Offline mode

## Screenshots Reference

| File | Description |
|------|-------------|
| `screenshots/000001.jpg` | Editor view: header with document title + star, menu bar (File/Edit/View/Insert/Format/Tools/Extensions/Help), formatting toolbar (search, undo/redo, print, spell check, paint format, zoom 100%, Normal text dropdown, Arial dropdown, font size 11 with ±, bold/italic/underline, text color, highlight), ruler, white document page on gray background |
| `screenshots/000002.jpg` | Share dialog: "Share [doc name]" title, "Add people and groups" input, "People with access" section with avatar/name/email/role dropdown (Viewer ✓ / Commenter / Editor), "General access" with "Anyone with the link" and Viewer dropdown, "Copy link" and blue "Done" buttons |
| `screenshots/000005.jpg` | Full editor view with Extensions menu open, showing complete toolbar with all formatting buttons visible (B/I/U, text color, link, comment, image, alignment, lists, indent), right sidebar panel |
| `screenshots/home/000001.jpg` | Home page top: blue "Xoogle Docs" header with search, "Start a new document" section with Blank (+) and Resume template cards |
| `screenshots/home/000004.jpg` | Home page header bar: hamburger ☰, blue Docs icon, "Docs" text, search bar with magnifying glass, Google Apps grid ⊞, user avatar with Google branding |
