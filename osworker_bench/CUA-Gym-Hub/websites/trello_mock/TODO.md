# Xrello Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-27
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell & Data Model Upgrade
<!-- The app already exists and renders. P0 items fix foundational data model issues that block P1 features. -->

- [x] **Data model migration: Users into state** — Move the hardcoded `mockUsers` array from `CardModal.jsx` into `state.users` as an object map `{ u1: {...}, u2: {...}, u3: {...}, u4: {...} }`. Add `state.currentUser = "u1"`. Update `mockData.js` `createInitialData()` to include `users` and `currentUser`. Update all components that reference hardcoded user data (CardModal member picker, Board header avatars, activity feed avatar/names, Navbar user avatar) to read from `state.users`.

- [x] **Data model migration: Board-level labels** — Move label definitions from inline on cards (`card.labels: [{id, text, color}]`) to board-level (`board.labels: [{id, name, color}]`). Cards should reference labels by ID: `card.labelIds: ["lbl-1", "lbl-2"]`. Update the reducer, CardModal label picker, Card badge display, and filter logic to resolve label data via `state.boards[boardId].labels`. See `data_model.md §Board` and `§Card` for exact field shapes.

- [x] **Data model migration: Cover object** — Change `card.cover` from a plain string (URL or empty) to an object `{ type: "color" | "image", value: string } | null`. Update Card.jsx cover rendering to handle both types: if `type === "color"`, render a solid color div; if `type === "image"`, render a background-image div. Update CardModal cover picker and `handleSetCover` accordingly.

- [x] **Expand seed data: 3 boards, 14 cards** — Replace the current `generateMockData()` with deterministic seed data (no random UUIDs for initial data — use fixed IDs like `"board-1"`, `"card-1"` etc.) matching the structure in `data_model.md §createInitialData()`. Include 3 boards ("Project Alpha" with 4 lists/7 cards, "Marketing Campaign" with 3 lists/4 cards, "Personal Tasks" with 2 lists/3 cards), 4 users, varied card states (overdue, due soon, completed, with checklists, with comments, with covers, with attachments). Keep `generateMockData()` as a wrapper that calls the deterministic `createInitialData()` for backward compatibility.

- [x] **Fix `/go` endpoint state sync** — Ensure the Vite server `/go` middleware correctly reads the initial state snapshot saved at session start (`.initial.json` file) vs the current state (`.json` file). Verify that `state_diff` accurately shows only changed fields. The DebugState component at `/go` route should also show state from the server-side files (via fetch to `/go`) rather than only React context, to ensure server and client are in sync. Add a "Refresh" button to the DebugState page.

---

## P1 — Primary Interactive Features
<!-- Core features a user interacts with in the first 5 minutes. Fix broken features first, then add missing ones. -->

### P1.0 — Fix Broken Features

- [x] **Fix: Star board toggle** — The star button in Board.jsx header renders but doesn't dispatch any action. Wire it to dispatch `UPDATE_BOARD` with `{ boardId, field: 'starred', value: !board.starred }`. The star should toggle between filled (yellow) and outlined (white) states. Also add star/unstar functionality on the BoardList page: add a star icon overlay on each board thumbnail (bottom-right, visible on hover), clicking it dispatches the same action. Starred boards should appear in the "Starred boards" section on the home page.

- [x] **Fix: Board title inline editing** — The board title in the Board.jsx header (`<h1>`) has `cursor-pointer` and `hover:bg-white/20` but no click handler for editing. Make it editable: clicking the title replaces it with an `<input>` (white text, transparent bg, blue border on focus), pressing Enter or blurring saves via `UPDATE_BOARD { boardId, field: 'title', value }`, pressing Escape cancels. The input should auto-select all text on focus.

- [x] **Fix: Delete checklist** — The "Delete" button next to each checklist title in CardModal.jsx has no click handler. Add a `DELETE_CHECKLIST` reducer action that removes the checklist from `card.checklists` by checklist ID. Wire the button with `confirm('Delete checklist?')` guard. Add activity: "removed checklist {title}".

- [x] **Fix: Quick card edit button** — The pencil icon button on Card.jsx hover (`opacity-0 group-hover:opacity-100`) has no click handler. Clicking it should open a small floating editor positioned over the card that shows: (1) a textarea pre-filled with the card title for quick editing, (2) quick action buttons below: "Change Labels", "Change Members", "Change Due Date", "Move", "Archive". The floating editor should close on blur/Escape. "Save" button or Enter key saves title changes via `UPDATE_CARD`. The other quick actions should open the CardModal with the relevant picker pre-opened (pass a prop like `initialAction`).

### P1.1 — Card Modal Improvements

- [x] **Edit comment** — Add an "Edit" link next to each user comment (type === "comment", not activity) in CardModal.jsx. Clicking "Edit" replaces the comment text with a textarea + Save/Cancel buttons. Save dispatches a new `EDIT_COMMENT` reducer action that updates `comment.text` and sets `comment.editedAt = new Date().toISOString()`. Display "(edited)" label next to edited comments' timestamp.

- [x] **Delete comment** — Add a "Delete" link next to the Edit link on user comments. Clicking dispatches `DELETE_COMMENT` reducer action (with `confirm()` guard) that removes the comment from `card.comments`. Add activity: "deleted a comment".

- [x] **Move card action** — Add a "Move" button to the CardModal sidebar (under "Actions", before Archive). Clicking opens a popover with two dropdowns: (1) Board selector (shows all boards), (2) List selector (shows lists of selected board). A "Move" submit button dispatches a new `MOVE_CARD_TO_LIST` reducer action that: removes `cardId` from source `list.cardIds`, adds to destination `list.cardIds`, updates `card.listId` and `card.boardId`. Add activity: "moved this card from {srcList} to {destList}". Close the popover after move. Also update the "in list X" text below the card title.

- [x] **Copy card action** — Add a "Copy" button to the CardModal sidebar (between Move and Archive). Clicking opens a popover with: title input (pre-filled with "Copy of {title}"), board dropdown, list dropdown. A "Create card" button dispatches `ADD_CARD` with all the copied card's data (description, labels, members, checklists with items reset to uncompleted, due date). Close popover and select the new card.

- [x] **Watch card toggle** — Add an "Watch" button to the CardModal sidebar (after Cover, before Actions header). It shows an eye icon + "Watch" text. If `card.watching` is true, show "Watching" with a checkmark. Clicking dispatches `UPDATE_CARD { cardId, field: 'watching', value: !card.watching }`. When watching is true, show a small eye icon badge on the card in the list view (Card.jsx).

- [x] **Label text editing in picker** — Enhance the label picker popover in CardModal: each label row should show the color swatch + label name text. Add a pencil/edit icon on each row. Clicking it opens an inline editor: text input for label name + color picker. Save updates the label in `board.labels` via a new `UPDATE_BOARD_LABEL` reducer action. Also add a "Create new label" button at the bottom of the picker that opens the same editor for a new label.

- [x] **Remove due date** — Add a "Remove" button in the date picker popover (below the calendar) that sets `card.dueDate` to `null` and `card.completed` to `false`. Currently there's no way to unset a due date.

### P1.2 — Board & List Features

- [x] **Board description** — In the Board menu sidebar "About this board" section, replace the placeholder text with an editable description. Show the current `board.description` (or "Add a description..." placeholder). Clicking opens a textarea editor with Save/Cancel. Save dispatches `UPDATE_BOARD { boardId, field: 'description', value }`. Add basic markdown rendering (bold, italic, lists) matching the card description renderer.

- [x] **Board visibility toggle** — The visibility badge button in Board.jsx header shows `board.visibility` text but doesn't do anything. Clicking should open a small dropdown with three options: "Private" (lock icon, "Only board members can see this"), "Workspace" (people icon, "All Workspace members can see this"), "Public" (globe icon, "Anyone can see this"). Selecting dispatches `UPDATE_BOARD { boardId, field: 'visibility', value }`. Show the appropriate icon next to the visibility text on the badge.

- [x] **List "Move all cards" action** — Add a "Move all cards in this list..." option to the List.jsx dropdown menu (between Sort by Date and Archive List). Clicking opens a popover showing other lists on the board. Selecting a destination list moves ALL cards from this list to the destination (dispatch `MOVE_CARD` for each, or a new bulk `MOVE_ALL_CARDS` reducer action). Add activity on each card.

- [x] **List "Copy list" action** — Add "Copy list" to the List.jsx dropdown menu. Clicking opens a small popover with a title input (pre-filled with "Copy of {title}") and a "Create list" button. Creates a new list with copies of all cards (new IDs, reset completion states). Add the new list immediately after the source list in `board.listIds`.

- [x] **Drag & drop: card count badge** — When dragging a card, show a small badge on the drag preview indicating which list it's being dragged from. Not critical but adds polish.

### P1.3 — Search & Navigation

- [x] **Search functionality** — Wire the search input in Navbar.jsx. On focus, expand the input width. As the user types (debounce 300ms), search across ALL cards in ALL boards: match against `card.title`, `card.description`, and label names. Display results in a dropdown below the search input (max 300px width, max 10 results). Each result shows: board name (gray, small), card title (bold), list name (gray). Clicking a result navigates to `/board/{boardId}` and opens the CardModal for that card (pass `cardId` via URL query param or React state). Show "No results" when empty. Press Escape to close. Press Enter to navigate to first result.

- [x] **Notifications panel** — Clicking the bell icon in Navbar.jsx opens a dropdown panel (320px wide, max 400px height, positioned below the bell). Show a list of recent activity items pulled from ALL cards across all boards (collect all `card.comments` where `type === 'activity'`, sort by `createdAt` desc, limit to 20). Each notification row shows: user avatar (24px), bold user name, activity text, relative timestamp ("2 min ago", "1 hour ago", etc., use `date-fns` `formatDistanceToNow`). Mark the panel as "read" when opened (store `lastReadTimestamp` in state). Show a red dot badge on the bell icon when there are newer activities than `lastReadTimestamp`. Clicking a notification navigates to the board and opens that card's modal.

- [x] **Navbar dropdown menus** — Wire the "Workspaces", "Recent", "Starred", "Templates" buttons in Navbar:
  - **Starred**: Dropdown showing all boards where `board.starred === true`, each as a clickable link to `/board/{boardId}` with board background thumbnail and title. Show "No starred boards" if empty.
  - **Recent**: Dropdown showing the most recently visited boards (track `lastVisitedAt` on boards, update on board view mount). Show up to 5 boards.
  - **Workspaces**: Dropdown with a single "My Workspace" entry containing a list of all boards, plus links to "Boards", "Members", "Settings" (non-functional links for display).
  - **Templates**: Dropdown with 3-4 template board previews (just title + background color — "Kanban Template", "Project Management", "Weekly Planner", "Bug Tracker"). Clicking creates a new board pre-populated with template lists.

- [x] **User profile dropdown** — Clicking the user avatar in Navbar.jsx top-right opens a dropdown (240px wide) showing: user name, email, divider, "Profile and visibility" (link, non-functional), "Activity" (link, non-functional), "Cards" (link, non-functional), divider, "Theme" toggle (switch between light header and dark header — store preference in state), divider, "Help" (non-functional), "Shortcuts" (opens keyboard shortcuts modal). Show the current user's name and email from `state.users[state.currentUser]`.

### P1.4 — Board Home Page Enhancements

- [x] **Board home page: Recently viewed section** — Add a "Recently viewed" section above "Your workspaces" on BoardList.jsx. Show boards sorted by `lastVisitedAt` (add this field to Board entity, update on board mount). Display up to 4 boards. Show relative time ("Viewed 2 hours ago") below each board title.

- [x] **Board home page: Board context menu** — Right-clicking (or long-pressing) a board thumbnail on BoardList.jsx shows a context menu with: "Open board", "Star/Unstar", "Close board" (archives it — add `board.closed` boolean field). Implement via a custom context menu component (positioned at mouse coordinates, closes on click-away).

- [x] **Create board: Visibility picker** — Enhance the create board modal in BoardList.jsx to include a "Visibility" dropdown (Private/Workspace/Public) below the background picker. Default to "Workspace". The selected value should be passed in the `ADD_BOARD` dispatch payload.

---

## P2 — Secondary Features
<!-- Depth and realism. Implement only after P1 is solid. -->

- [ ] **Calendar view** — Add a `/board/:boardId/calendar` route that displays a monthly calendar view of all cards with due dates on the current board. Use the same calendar rendering approach from CardModal but full-page. Each day cell shows card titles as small colored bars (color from first label). Clicking a card opens CardModal. Add a "Calendar" view tab in the Board header (next to the board title area or as a view switcher button). Allow drag-and-drop of cards between days to update due dates.

- [ ] **Table view** — Add a `/board/:boardId/table` route that displays all cards on the board in a spreadsheet-like table with columns: Card Title, List, Labels, Members, Due Date, Status (complete/incomplete). Rows are sortable by clicking column headers. Inline editing: clicking a cell opens an editor for that field (text input for title, dropdown for list, label picker for labels, date picker for due date, checkbox for status). Add a "Table" view tab button in the Board header.

- [ ] **Keyboard shortcuts** — Implement common Xrello keyboard shortcuts. Show a help modal when pressing `Shift + ?` listing all shortcuts. Key bindings: `b` = focus board search in navbar, `f` = toggle filter panel, `n` = start adding a new card (when hovering a list), `e` = quick edit card (when hovering a card), `c` = archive card (when hovering), `l` = open label picker (when card modal is open), `d` = open date picker (when card modal is open), `m` = open member picker (when card modal is open), `Escape` = close modal/popover, `j`/`k` = navigate cards up/down, arrow keys for list navigation. Track which card/list is "focused" visually with a blue outline.

- [ ] **Undo/Redo** — Implement undo (`Ctrl+Z` / `Cmd+Z`) and redo (`Ctrl+Shift+Z` / `Cmd+Shift+Z`) by maintaining a state history stack in the context. Limit to last 20 actions. Show a brief toast notification "Action undone" when undo is triggered.

- [ ] **Card template / recurring card** — In CardModal sidebar, add a "Make Template" button that marks a card as a template (visual badge). Template cards appear with a template icon in the list view. "Create card from template" option in the add card composer allows selecting a template card to pre-fill all fields.

- [ ] **Board activity feed (real data)** — Replace the hardcoded activity feed in the Board menu sidebar with real activity data aggregated from all cards' comments where `type === 'activity'`. Sort by `createdAt` desc, limit to 30 items. Each entry shows: user avatar, user name (from `state.users`), activity text, relative timestamp. Paginate with a "Show more" button.

- [ ] **Drag & drop: cross-list card preview** — When dragging a card over a different list, show a translucent preview placeholder in the destination list at the drop position (the `@hello-pangea/dnd` library handles this, but ensure the placeholder styling matches — same card width, light blue dashed border).

- [ ] **Card aging** — Cards that haven't been moved or edited in >7 days get a subtle visual "aging" effect: slightly reduced opacity (0.8) and a faint sepia tint. This is a visual-only effect calculated from `card.createdAt` or last activity timestamp.

- [ ] **Board close/delete** — Add "Close Board" button at the bottom of the Board menu sidebar. Closed boards are hidden from the home page by default but shown in a "Closed Boards" section (collapsible). Closed boards can be reopened ("Send to workspace") or permanently deleted (with confirm dialog).

- [ ] **Color-blind friendly labels** — Add subtle patterns (stripes, dots, crosshatch) to label colors so they're distinguishable without relying solely on color. Toggle in user settings.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. See data_model.md for full structure. -->

- [x] **Users**: 4 users — Alice Johnson (u1, current user, assigned to most cards), Bob Smith (u2, dev teammate), Charlie Brown (u3, contributor), Diana Ross (u4, marketing). Each with name, username, initials, avatarUrl, email.

- [x] **Boards**: 3 boards — "Project Alpha" (starred, workspace visibility, blue bg, 4 lists, 7 cards with varied states), "Marketing Campaign" (private, orange bg, 3 lists, 4 cards), "Personal Tasks" (starred, private, green bg, 2 lists, 3 cards).

- [x] **Cards variety**: Cards must cover these training scenarios: card with no description, card with long markdown description, card with overdue due date, card with due date in the future, card marked complete, card with checklist (partially complete), card with full checklist (100% complete), card with comments, card with attachments, card with cover image, card with cover color, card with multiple labels, card assigned to multiple members, card with no labels/members/dates (bare minimum). At least 2 cards should have the `watching: true` flag.

- [x] **Activity history**: Cards should have realistic activity/comment history. Include at least 3 cards with 2+ comments from different users. Include activity entries for "moved from X to Y", "added this card to Z", "completed checklist item", etc.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as Alice Johnson, user u1)
- Real file uploads (attachments use simulated random images from picsum.photos)
- Real-time collaboration / WebSocket sync
- Power-Up installation / execution (modal is visual display only)
- Workspace creation / organization management
- Email notifications / sending
- Mobile-specific responsive layouts (desktop-first, basic responsiveness OK)
- Billing / premium plan features
- OAuth, SSO, or any identity verification
