# Xoogle Drive Mock — Research Summary

> Last updated: 2026-03-08 by plan agent

## App Overview

Xoogle Drive is Google's cloud file storage and synchronization service. The web app at `drive.google.com` provides a file manager interface for organizing, sharing, and previewing files stored in the cloud. It integrates tightly with Google Workspace apps (Docs, Sheets, Slides) and supports file upload/download, sharing with granular permissions, and collaborative workflows.

**Category**: Cloud file storage / File manager
**URL**: `drive.google.com`

## Key User Personas

1. **Knowledge Worker** — Organizes project files in folders, shares documents with teammates, uses search to find files quickly
2. **Student** — Uploads assignments, shares group project folders, stars important files
3. **Team Manager** — Creates shared folder structures, manages permissions (Viewer/Editor/Commenter), reviews recent activity

## Primary Workflows (ordered by frequency)

1. Browse files in My Drive (folder navigation, breadcrumbs)
2. Upload files (drag-drop or button)
3. Create new folder / Google Doc / Sheet / Slide
4. Share file or folder with specific people (email, role)
5. Search for files by name, type, or owner
6. Star/unstar important files for quick access
7. Move files between folders (drag-drop or "Move to")
8. Rename files/folders inline
9. Delete files to Trash, restore or permanently delete
10. Preview files (images, PDFs, videos, text)

## UI Layout (Desktop Web — from screenshots)

### Header Bar (~64px height)
- **Left**: Xoogle Drive triangle logo + "Drive" text
- **Center**: Large search bar with magnifying glass icon, placeholder "Search in Drive", filter/advanced search button on right of search bar
- **Right**: Help icon (?) , Settings gear icon, Google Apps grid (9-dot) icon, User avatar circle

### Left Sidebar (~256px width)
- **"+ New" button** — Large rounded button with + icon, opens creation menu (New folder, File upload, Folder upload, Google Docs, Google Sheets, Google Slides, Google Forms, More...)
- **Navigation items** (icon + label, single-click):
  - Home (house icon) — shows suggested/recent files
  - My Drive (Drive icon) — expandable folder tree below
  - Computers (monitor icon) — synced computer folders
  - Shared with me (person icon)
  - Recent (clock icon)
  - Starred (star icon)
  - Spam (warning icon)
  - Trash (trash can icon)
- **Storage section** at bottom:
  - Progress bar showing used/total (e.g., "9.64 GB of 15 GB used")
  - "Buy storage" link

### Main Content Area
- **Toolbar row**: Breadcrumb path (e.g., "My Drive > Android Police"), action buttons when file selected: Share (person+), Get link, Move to, Star, Trash, More (⋮), View toggle (grid/list)
- **Filter chips**: "File type ▼", "People ▼", "Last modified ▼" (visible in My Drive)
- **Suggested section**: Horizontal row of recently edited file cards (only on Home/My Drive root)
- **File area**:
  - **Grid view**: Cards with large thumbnail, file type icon overlay, filename below, 3-dot menu on hover
  - **List view**: Table rows with columns: Name (icon + name), Owner, Last modified, File size; sortable column headers; checkbox for multi-select on left

### Right Details Panel (opens on info icon click)
- File preview thumbnail
- Details tab: Type, Size, Storage used, Location, Owner, Modified, Opened, Created
- Activity tab: Shows who viewed/edited and when

### Context Menu (right-click on file)
From screenshot analysis and research, the full context menu includes:
1. Open / Open with ▶
2. Download
3. Rename
4. Make a copy
5. Move to ▶
6. Add to starred / Remove from starred
7. Organize ▶
8. File information ▶ (Details, Activity, Description)
9. Share ▶
10. Copy link
11. Move to trash
12. (Divider)
13. Open in new window

### Share Dialog (from screenshot 000004.jpg)
- Title: "Share [N] files" with back arrow
- Help (?) and Settings (gear) icons in header
- Email input field with chips for added users
- Role dropdown: "Editor ▼" → Viewer, Commenter, Editor
- "Notify people" checkbox
- Message textarea
- File list below (showing files being shared)
- Footer: "Copy links" button (left), "Cancel" + "Send" buttons (right)

## Color Palette (Xoogle Drive Web)
- **Background**: `#FFFFFF` (main), `#F8F9FA` (sidebar/toolbar bg)
- **Sidebar active**: `#C2E7FF` (light blue highlight)
- **Sidebar hover**: `#E8EAED`
- **Primary text**: `#202124` (near-black)
- **Secondary text**: `#5F6368` (dark gray)
- **Primary accent**: `#1A73E8` (Google Blue)
- **"+ New" button**: White bg with `#1A73E8` text and shadow
- **Star color**: `#F4B400` (Google Yellow)
- **Folder icon**: `#5F6368` (gray) or specific folder colors
- **Border/divider**: `#DADCE0`
- **Trash/delete**: `#D93025` (red)
- **Selected row**: `#E8F0FE` (very light blue)
- **Grid card border**: `#DADCE0`, hover shadow elevation

## Typography
- **Font family**: "Google Sans", Roboto, sans-serif
- **Logo "Drive"**: 22px, Google Sans Medium, `#5F6368`
- **Sidebar nav items**: 14px, Google Sans, `#202124`
- **File names (grid)**: 14px, Roboto, `#202124`, single-line truncate
- **File names (list)**: 14px, Roboto, `#202124`
- **Column headers**: 12px, Roboto Medium, `#5F6368`, uppercase-ish
- **Breadcrumb**: 18px, Google Sans, `#202124`
- **Search placeholder**: 16px, Google Sans, `#5F6368`

## Features by Priority

### P0 — Core (App cannot render without these)
- App shell: header + sidebar + main area layout
- Routing: /, /folder/:id, /starred, /recent, /trash, /search, /go
- State management with React Context
- Session isolation (sid-based)
- /go state inspection endpoint
- Mock data with realistic files/folders

### P1 — Primary Features (Core interactive workflows)
- Folder navigation with breadcrumbs
- File grid view + list view toggle
- Sort by name, date, size (column headers in list view)
- "+ New" button menu (New folder, File upload, Folder upload, Google Docs/Sheets/Slides)
- Create new folder dialog
- File upload (drag-drop + button) with progress
- Right-click context menu with all actions
- Share dialog (add people, set roles, copy link)
- Star/unstar toggle
- Rename (inline or dialog)
- Move to trash / Restore / Permanent delete / Empty trash
- Search with results page
- File preview modal
- Multi-file selection (checkbox + Shift-click)
- Storage quota display

### P2 — Secondary Features (Depth and realism)
- "Shared with me" page (files shared by others)
- Home page with "Suggested" and "Recent" sections
- Filter chips (File type, People, Last modified)
- Details/info side panel
- Move to dialog (folder picker)
- Make a copy
- Download action
- Drag-to-move files between folders
- Color-coded folders
- File type icons (Google Docs blue, Sheets green, Slides yellow, PDF red, etc.)
- Keyboard shortcuts (/, n, t, etc.)
- Notification toast messages for actions

## What to Skip (Out of Scope)
- Authentication / login (app starts pre-logged-in as default user)
- Real file storage or cloud sync
- Google Workspace editor integration (Docs/Sheets/Slides editors)
- Real-time collaboration / cursors
- Comments on files
- Version history
- Offline mode
- Google Apps grid menu
- Actual email sending for shares

## Screenshot Inventory
- `000003.jpg` — Drive web UI showing header with logo, search bar, sidebar with "+ New", My Drive, Shared drives, and main content area with "My Drive" heading and filter chips
- `000004.jpg` — **KEY REFERENCE**: Full Drive UI showing sidebar (My Drive, Computers, Shared with me, Recent, Starred, Trash, Storage quota), file grid view with document cards, share dialog overlay with email input, role picker (Viewer/Commenter/Editor), copy links, and toolbar with breadcrumbs
- `000005.jpg` — Mobile app view (reference only, not implementing mobile)
