# Xoogle Drive Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-08
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: TypeScript + React + Tailwind, already has basic structure

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## IMPORTANT: Existing Codebase Notes

This mock already has a partially working implementation. The dev agent should **improve and extend** the existing code rather than starting from scratch. Key existing files:
- `src/App.tsx` — Routing with BrowserRouter
- `src/context/FileSystemContext.tsx` — React Context + useReducer, 13 action types
- `src/lib/types.ts`, `src/lib/mockData.ts`, `src/lib/utils.ts`
- `src/components/` — Header, Sidebar, FileGrid, FileList, ContextMenu, ShareModal, CreateModal, PreviewModal, UploadProgress
- `src/pages/` — Drive, Starred, Recent, Trash, Search, Go
- `vite.config.ts` — Session isolation already implemented (POST /post, GET /go, /upload, /files)
- Session isolation is ALREADY WORKING — do not rewrite

---

## P0 — Core Shell Improvements
<!-- These fix critical gaps in the existing implementation. -->

- [x] **Visual design system overhaul**: The current UI needs to match Xoogle Drive's actual design language. Study `assets/screenshots/000004.jpg` closely. Apply these exact colors:
  - Background: `#FFFFFF` (main content), `#F8F9FA` (sidebar bg)
  - Sidebar active item: `#C2E7FF` (light blue) with rounded corners (28px border-radius)
  - Primary text: `#202124`, Secondary text: `#5F6368`
  - Primary accent: `#1A73E8` (Google Blue)
  - Border/divider: `#DADCE0`
  - Selected row: `#E8F0FE`
  - Star active: `#F4B400`
  - Font: `"Google Sans", "Roboto", "Helvetica Neue", sans-serif`
  - Sidebar nav items: 14px, left padding 12px, height 32px, icon 20px, 12px gap
  - Header height: 64px; Sidebar width: 256px

- [x] **Expand data model**: Current mock data is minimal (only ~10 items). Replace with the comprehensive seed data from `assets/data_model.md` — need 5 users, 7+ folders (nested 2 levels deep), 15+ files of various types (doc, spreadsheet, presentation, pdf, image, video, text, archive), 4 "shared with me" items, and 3 trashed items. Add `mimeType`, `color`, `description`, `sharedWith` as `SharedUser[]` (with `role` and `addedAt`), and `selectedItems: string[]` to state. Update `types.ts` accordingly.

- [x] **File type icons**: Replace generic icons with Xoogle Drive's colored file-type icons. Each file type gets a distinct icon and color: folder (gray folder icon), Google Docs (blue doc icon with lines), Google Sheets (green grid icon), Google Slides (yellow presentation icon), PDF (red PDF icon), image (red landscape icon), video (red play icon), audio (orange music note), text (blue text icon), archive (gray zip icon). Use inline SVGs or a consistent icon set (lucide-react recommended). The icon should appear both in grid cards and list rows.

- [x] **"+ New" button and creation menu**: Replace the current simple create modal. The "+ New" button should be a prominent rounded button (~56px tall, white bg, subtle shadow, "+ New" text with + icon in Google Blue `#1A73E8`). Clicking opens a dropdown/popover menu with sections:
  - **New folder** (folder icon) — opens folder name dialog
  - Divider
  - **File upload** (upload icon) — triggers hidden `<input type="file">`
  - **Folder upload** (folder upload icon) — triggers `<input type="file" webkitdirectory>`
  - Divider
  - **Google Docs** (blue doc icon) — creates new doc item in current folder
  - **Google Sheets** (green sheet icon) — creates new spreadsheet item
  - **Google Slides** (yellow slides icon) — creates new presentation item
  - **Google Forms** (purple form icon) — creates new form item
  - Divider
  - **More ▶** (optional, can skip)

  Each creation action should: create a new `FileSystemItem` with the right `type` and `mimeType`, set `parentId` to current folder (or null if at root), set timestamps to now, and navigate to show the new item.

- [x] **Multi-file selection**: Add checkbox column to list view (leftmost, appears on hover or when any item is selected). Support: click checkbox to toggle single item; Shift+click to select range; Ctrl/Cmd+click for additive select. When items are selected, toolbar shows selection count ("3 selected") and bulk action buttons (Share, Move to, Star, Move to trash). Store selection in `selectedItems: string[]` in state. In grid view, selected cards get a blue check overlay on the thumbnail.

---

## P1 — Primary Features
<!-- Core interactive workflows for agent training. -->

- [x] **Shared with me page**: Add route `/shared` and page component. Shows files/folders where `ownerId !== currentUser.id` and `sharedWith` includes current user. List view columns: Name, Shared by (owner name), Shared date (from `sharedWith[].addedAt`), File size. No breadcrumb (flat list). Add "Shared with me" to sidebar nav with person icon. Items in this view should NOT show "My Drive" folder structure — they float independently.

- [x] **Home page (default landing)**: Add route `/home` or make `/` show the Home view instead of jumping to My Drive root. Home page has:
  - **"Suggested" section**: Horizontal scrollable row of 5-8 file cards (recently modified files), each card ~180px wide with thumbnail, file type icon, filename, and "Last opened [date]" subtext
  - **"Recent" section** below: List of recently accessed files (similar to current Recent page but embedded)
  - Header shows "Home" in breadcrumb area, no folder filter chips

- [x] **Toolbar actions when file selected**: When one or more files are selected (clicked in list/grid), show a toolbar with action buttons:
  - **Share** (person+ icon) — opens ShareModal
  - **Get link** (link icon) — copies `https://drive.google.com/file/d/{id}` to clipboard, shows toast "Link copied"
  - **Move to** (folder-move icon) — opens folder picker modal (see P2)
  - **Add to starred / Remove from starred** (star outline/filled)
  - **Move to trash** (trash icon)
  - **More ⋮** dropdown: Download, Rename, Make a copy, Open in new window
  - **View toggle** (grid/list icons) — already exists, keep it
  These should replace/overlay the default toolbar when items are selected.

- [x] **Enhanced context menu**: Current context menu is basic. Expand to match real Xoogle Drive:
  1. **Open** (or "Open folder" for folders) — navigates to folder or opens preview
  2. **Open with ▶** (submenu arrow, shows "Google Docs", "Google Sheets" etc. based on type)
  3. Divider
  4. **Download** — simulated (toast "Downloading [filename]...")
  5. **Rename** — inline rename (see below)
  6. **Make a copy** — duplicates item with "Copy of [name]", same parent folder
  7. Divider
  8. **Share ▶** — opens ShareModal
  9. **Copy link** — copies mock URL to clipboard
  10. Divider
  11. **Move to ▶** — opens folder picker
  12. **Add to starred** / **Remove from starred**
  13. **Change color** (folders only) — color picker with 8 preset colors
  14. Divider
  15. **File information ▶** — submenu: Details, Activity, Description
  16. Divider
  17. **Move to trash**

  Context menu should have: 8px vertical padding, items 32px height, 16px horizontal padding, icons 20px, dividers as 1px `#DADCE0` lines with 8px vertical margin. Submenus appear to the right on hover.

- [x] **Inline rename**: Double-clicking a file/folder name (in list or grid view) should make the name editable inline. Show a text input with the current name pre-selected (without extension for files). Press Enter to confirm, Escape to cancel. The input should have a blue border (`#1A73E8`) and match the surrounding text size. Dispatch RENAME_ITEM action on confirm.

- [x] **Filter chips on My Drive**: Below the toolbar/breadcrumb in My Drive view, show horizontal filter chips:
  - **Type ▼** — dropdown: Folders, Documents, Spreadsheets, Presentations, PDFs, Images, Videos, Audio
  - **People ▼** — dropdown: lists users who own/shared items in current view
  - **Modified ▼** — dropdown: Today, Last 7 days, Last 30 days, This year, Custom range
  Each chip is a rounded pill (height 32px, border `#DADCE0`, text `#3C4043`). Active filter chip has blue bg `#D2E3FC`, blue text `#1A73E8`, and X button to clear. Filtering should work client-side on the current folder's items.

- [x] **Drag-and-drop upload visual**: Current drag-drop exists but improve the visual feedback. When dragging files over the main content area, show a full-area overlay with dashed border (2px dashed `#1A73E8`), light blue bg (`#E8F0FE` at 80% opacity), and centered text "Drop files to upload to [current folder name]" with upload icon. The overlay should appear on dragenter and disappear on dragleave/drop.

- [x] **Upload progress improvements**: Upload progress widget in bottom-right should match Xoogle Drive: minimizable header bar showing "Uploading N items" or "N uploads complete", expand to show individual file progress bars. Each item shows: file icon, filename (truncated), progress bar (blue `#1A73E8`), percentage text. Completed items show green checkmark. Error items show red X with "Retry" link.

- [x] **Toast notifications**: Add a toast/snackbar system for action feedback. Toasts appear at bottom-center, dark bg (`#323232`), white text, 14px, rounded 8px, with optional "Undo" action link in blue. Duration: 4 seconds auto-dismiss. Show toasts for:
  - "Moved to trash" (with Undo)
  - "File starred" / "File unstarred"
  - "Link copied to clipboard"
  - "Folder created"
  - "[N] files moved to [folder]"
  - "Item restored from trash"

- [x] **Trash page improvements**: Current Trash page needs:
  - Banner at top: "Items in trash are deleted after 30 days" (info blue bg)
  - "Empty trash" button in toolbar (red text, confirmation dialog: "Delete all items in trash forever? You can't undo this action." with Cancel and "Delete forever" buttons)
  - Right-click context menu in Trash should show: "Restore" and "Delete forever" only
  - Restoring should show toast "Item restored" with Undo (re-trash)
  - "Delete forever" should show confirmation dialog before permanent delete

- [x] **Search enhancements**: Current search only matches filename. Improve:
  - Search bar should be prominent (480px width, centered in header, 48px height, rounded 28px, `#F1F3F4` bg, darker on focus `#FFFFFF` with shadow)
  - Search should filter by: name (partial match, case-insensitive), file type, owner name
  - Results page should show "Search results for '[query]'" header
  - Each result should show file path breadcrumb below filename (e.g., "My Drive > Work Projects > Q4 Reports")
  - "No results" state with illustration/icon and "No results found for '[query]'" text

---

## P2 — Secondary Features
<!-- Depth and realism. Implement after P1 is solid. -->

- [x] **Details/info side panel**: Clicking the info (ⓘ) icon on a selected file opens a right side panel (~300px wide, slides in from right). Panel has:
  - File preview/thumbnail at top
  - Tab bar: **Details** | **Activity**
  - Details tab: Type, Size, Storage used, Location (folder path), Owner, Modified date, Opened date, Created date, Description (editable text)
  - Activity tab: Mock activity entries ("Alex Johnson edited • Mar 7", "Sarah Chen viewed • Mar 5", etc.)
  - Panel closes with X button or clicking info icon again

- [x] **Move to dialog (folder picker)**: A modal with a folder tree browser. Shows "My Drive" as root with expandable folder hierarchy. User can click to select destination folder, then "Move here" button. Should also have "New folder" button to create inline. Used by both context menu "Move to" and toolbar "Move to" actions. On move: update `parentId` of selected items, show toast "[N] items moved to [folder]".

- [x] **Make a copy action**: Context menu "Make a copy" should duplicate the item:
  - New item gets `name: "Copy of [original name]"`
  - Same `parentId`, `type`, `mimeType`, `size`
  - New unique `id`, `createdAt`/`modifiedAt` set to now
  - `sharedWith` cleared (copy is private to owner)
  - `starred` set to false
  - Show toast "Copy created"

- [x] **Folder colors**: Folders can have custom colors. Context menu → "Change color" shows a popover grid of 24 color swatches matching Xoogle Drive colors: `#AC725E`, `#D06B64`, `#F83A22`, `#FA573C`, `#FF7537`, `#FFAD46`, `#42D692`, `#16A765`, `#7BD148`, `#B3DC6C`, `#FBE983`, `#FAD165`, `#92E1C0`, `#9FE1E7`, `#9FC6E7`, `#4986E7`, `#9A9CFF`, `#B99AFF`, `#C2C2C2`, `#CABDBF`, `#CCA6AC`, `#F691B2`, `#CD74E6`, `#A47AE2`. When a color is set, the folder icon in both grid and list views shows in that color.

- [x] **Drag-to-move files between folders**: In list view, allow dragging a file/folder row and dropping it onto a folder row. Visual: dragged item becomes semi-transparent ghost, valid drop targets (folders) highlight with blue border. On drop: update `parentId`. In grid view: similar drag from card to folder card. Show toast "Moved to [folder]" with Undo.

- [x] **Keyboard shortcuts**: Implement common Drive shortcuts:
  - `/` or `f` — Focus search bar
  - `n` — Open "+ New" menu
  - `Shift+T` — Create new document
  - `Shift+P` — Create new presentation
  - `Shift+S` — Create new spreadsheet
  - `Shift+F` — Create new folder
  - `Delete` or `#` — Move selected to trash
  - `z` — Undo last action
  - `.` — Toggle star on selected items
  - `d` — Toggle details panel
  - `t` — Toggle between grid and list view
  - Arrow keys — Navigate between files
  - Enter — Open selected file/folder
  - `Ctrl+A` — Select all items in current view

- [x] **Empty states**: Show appropriate empty state illustrations and messages:
  - My Drive empty: "Welcome to Drive — Drag files here or use the New button"
  - Starred empty: "No starred files — Add stars to things that you want to find easily later"
  - Shared with me empty: "No files shared with you yet"
  - Trash empty: "No items in trash"
  - Search no results: "No results found for '[query]'"
  Each with a relevant icon/illustration above the text, centered in the content area, muted text `#5F6368`.

- [x] **Breadcrumb improvements**: Current breadcrumbs need:
  - Clickable path segments: "My Drive > Work Projects > Q4 Reports" where each segment is a link
  - Dropdown on each segment showing sibling folders
  - Overflow: if path is too long, collapse middle segments to "..." with a dropdown showing full path
  - Current folder name should be bold/non-link

- [x] **Storage quota detail**: Clicking the storage bar in sidebar should navigate to `/storage` page showing:
  - Circular/bar chart of storage breakdown by file type (Drive files, Gmail, Google Photos)
  - List of largest files sorted by size
  - "Clean up space" suggestions
  - For the mock, just show a breakdown pie chart and the largest files list

- [x] **Column resize in list view**: List view columns should be resizable by dragging column dividers. Cursor changes to `col-resize` on divider hover. Minimum column widths: Name 200px, Owner 120px, Last modified 140px, File size 80px.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. See data_model.md for full schema. -->

- [x] **Users**: 5 users — Alex Johnson (current, `user_001`), Sarah Chen (`user_002`), Mike Williams (`user_003`), Emily Davis (`user_004`), James Wilson (`user_005`). Use `ui-avatars.com` for avatar URLs with distinct background colors.

- [x] **Folders**: 7+ folders with 2-level nesting:
  - Root: "Work Projects" (starred, blue color, shared with Sarah), "Personal", "Photos", "Shared Documents"
  - Nested: "Q4 Reports" and "Design Assets" inside "Work Projects"; "Taxes 2025" inside "Personal"

- [x] **Files**: 15+ files of varied types:
  - Google Docs: "Project Roadmap" (shared), "Team Standup Notes"
  - Google Sheets: "Budget 2026" (starred), "Q4 Revenue Analysis"
  - Google Slides: "Product Launch Deck" (shared with 2 people)
  - PDFs: "Q4_Financial_Report.pdf" (2.4MB), "resume_2026.pdf" (180KB, starred), "tax_return_2025.pdf" (1MB)
  - Images: "vacation_photo_01.jpg" (3MB), "vacation_photo_02.jpg" (2.8MB), "logo_final.png" (512KB) — use picsum.photos for thumbnails
  - Video: "meeting_recording.mp4" (50MB)
  - Text: "notes.txt" (2KB, with content)
  - Archive: "project_archive.zip" (10MB)

- [x] **Shared with me items** (owned by other users): "Marketing Strategy 2026" (doc, by Sarah, editor access), "Company Handbook" (pdf, by Mike, viewer access), "Team Photo Album" (folder, by Emily, viewer access), "Sales Dashboard" (spreadsheet, by James, commenter access)

- [x] **Trashed items**: "Old_Draft.txt", "Untitled Document" (doc), "Screenshot_2025.png" — should have varied `modifiedAt` dates

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as `Alex Johnson`)
- Real file storage, cloud sync, or actual file content
- Google Workspace editors (Docs/Sheets/Slides editing experience)
- Real-time collaboration / multi-user cursors
- Comments or version history on files
- Offline mode or service workers
- Google Apps grid menu (9-dot menu in header)
- Actual email sending for share invitations
- File content rendering (PDFs show placeholder, videos show placeholder)
- Google Photos integration
- Admin console / organization management
