# Xmail Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-27
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell (ALREADY DONE)

These items are complete and should NOT be re-implemented. Listed for reference only.

- [x] Project scaffold: Vite + React + Tailwind CSS + lucide-react + date-fns
- [x] App layout: 64px sticky header, 256px sidebar, fluid main area with `bg-[#f6f8fc]`
- [x] HashRouter with routes: `/inbox`, `/starred`, `/important`, `/sent`, `/drafts`, `/spam`, `/trash`, `/all-mail`, `/label/:labelId`, `/email/:threadId`, `/go`
- [x] State management: StoreContext with React Context + localStorage persistence
- [x] Session isolation: vite.config.js mock-api plugin (`POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=`)
- [x] Data normalization: `normalizeEmail()` in `deepMergeWithDefaults` for POST API
- [x] State diff tracking: `calculateStateDiff()` returns newEmails, deletedEmails, modifiedEmails, labels changes

---

## P1 — Bug Fixes & Missing Core Interactions

These are features that visually exist but are broken or missing critical handlers. Fix these FIRST — they represent the biggest gap between "looks real" and "works real."

### P1.1 — Fix Broken Click Handlers

- [x] **EmailRow hover action buttons**: The three buttons that appear on hover in `EmailList.jsx` → `EmailRow` (Archive, Delete, Mark as read/unread) currently have NO `onClick` handlers. Wire them up:
  - Archive button (`<Archive>` icon): call `archiveEmails([email.id])` → moves email to `all-mail` folder
  - Delete button (`<Trash2>` icon): call `deleteEmails([email.id])` → moves to trash (or permanent delete if already in trash)
  - Mark as read/unread button (`<Mail>` icon): call `toggleRead(email.id, !email.read)` → toggles read status; icon should change: `Mail` when unread (will mark read), `MailOpen` when read (will mark unread)
  - All three must call `e.stopPropagation()` to prevent row click navigation

- [x] **ThreadView toolbar buttons**: In `ThreadView.jsx`, the top toolbar has Archive (`<Archive>`), Delete (`<Trash2>`), and Mark as read (`<Mail>`) buttons with NO handlers. Wire them:
  - Archive: call `archiveEmails(threadEmails.map(e => e.id))`, then `navigate(-1)` to return to list
  - Delete: call `deleteEmails(threadEmails.map(e => e.id))`, then `navigate(-1)`
  - Mark as read/unread: call `bulkUpdateEmails(threadEmails.map(e => e.id), { read: true/false })`
  - Need to import `archiveEmails`, `deleteEmails`, `bulkUpdateEmails` from `useStore()`

### P1.2 — Missing Core Features

- [x] **Forward email**: Add a Forward button in ThreadView next to the Reply button on each message. When clicked:
  - Open the ComposeModal pre-filled with: subject = `"Fwd: ${originalSubject}"`, body = quoted original message (prefix with `"---------- Forwarded message ---------\nFrom: ${from.name} <${from.email}>\nDate: ${timestamp}\nSubject: ${subject}\nTo: ${to}\n\n${body}"`), attachments = original attachments
  - Add `forwardEmail(originalEmail)` to StoreContext that opens compose with pre-filled data
  - Also add keyboard shortcut `F` for forward (when viewing a thread)

- [x] **Reply All button in ThreadView**: Currently only "Reply" exists. Add a "Reply All" button next to Reply on each message in the thread. When clicked:
  - Call `replyToEmail(email, '', true)` (isReplyAll=true) which already exists in StoreContext
  - Show both Reply and Reply All options — can be a dropdown or two separate buttons
  - The reply compose box at the bottom should also have a Reply/Reply All toggle

- [x] **Open draft in compose modal**: When user clicks on a draft email in the Drafts folder (EmailList), instead of navigating to ThreadView, it should:
  - Open ComposeModal pre-filled with the draft's `to`, `cc`, `bcc`, `subject`, `body`, `attachments`
  - Set `currentDraftId` to the draft's ID so subsequent edits update the existing draft
  - In `EmailRow`, detect if `email.folder === 'drafts'` and change `handleRowClick` to open compose instead of navigate
  - Add a new store function `openDraft(emailId)` that sets compose state from the draft email

- [x] **Create Label dialog**: The `+` button next to "Labels" heading in `Sidebar.jsx` currently does nothing. Implement:
  - Click opens a small modal/popover with: text input for label name, color picker (6-8 preset color swatches), "Create" and "Cancel" buttons
  - On create: call `createLabel(name, color)` (already exists in StoreContext)
  - The new label should immediately appear in the sidebar nav

- [x] **"Move to" menu**: Add a "Move to" action in both the bulk toolbar and the email row hover actions. When clicked:
  - Show a dropdown menu listing folders: Inbox, Spam, Trash, Archive (All Mail)
  - On selection: call `bulkUpdateEmails(emailIds, { folder: selectedFolder })`
  - Add to bulk action toolbar in EmailList (next to existing Label button)
  - In ThreadView toolbar, add a "Move to" button as well
  - Xmail shortcut: `V` opens "Move to" menu

- [x] **Report as spam / Not spam**:
  - In email row hover actions AND bulk toolbar AND thread view toolbar: add a "Report spam" button (ShieldAlert or AlertOctagon icon)
  - On click: `bulkUpdateEmails(emailIds, { folder: 'spam' })`
  - In spam folder view, each email row should show a "Not spam" button instead of "Report spam"
  - "Not spam" moves email back to inbox: `bulkUpdateEmails(emailIds, { folder: 'inbox' })`
  - Xmail shortcut: `!` reports as spam

- [x] **Undo toast notification**: After destructive actions (delete, archive, mark as spam, move), show a toast notification at bottom-left:
  - Text: "Conversation archived" / "Conversation moved to Trash" / "Marked as spam" / etc.
  - "Undo" link/button that reverses the action
  - Auto-dismiss after 5 seconds
  - Implementation: add `undoStack` to StoreContext (array of `{action, data}` objects), render a `<Toast>` component
  - Toast component: fixed bottom-left, dark bg (#323232), white text, "Undo" link in blue

- [x] **Right-click context menu on email rows**: When user right-clicks an email row in EmailList, show a custom context menu with:
  - Reply / Reply All / Forward
  - Archive / Delete / Mark as spam
  - Mark as read / Mark as unread
  - Star / Unstar
  - Move to → (submenu with folder options)
  - Label as → (submenu with label options)
  - Implementation: `onContextMenu` handler on EmailRow, render a positioned `<ContextMenu>` component, close on click-outside or Escape

- [x] **Snooze email**: Add a snooze button (Clock icon) in email row hover actions and thread view toolbar:
  - On click: show a dropdown with options: "Later today" (3 hours), "Tomorrow" (9am), "Next week" (Monday 9am), "Pick date & time" (date picker)
  - On snooze: set `email.snoozedUntil = selectedTime`, move to virtual "Snoozed" folder
  - Add a `/snoozed` route + sidebar item showing snoozed emails
  - When current time passes `snoozedUntil`, move email back to inbox (check on component mount and periodically)
  - Add `snoozedUntil` field to email schema (see data_model.md)
  - Xmail shortcut: `B` snoozes

---

## P2 — Secondary Features (Depth & Polish)

Implement after all P1 items are solid.

### P2.1 — Compose Enhancements

- [x] **Rich text formatting toolbar**: Replace the plain `<textarea>` in ComposeModal with a contentEditable div (or simple rich text implementation). Add a formatting toolbar below the subject field:
  - Bold (Ctrl+B) / Italic (Ctrl+I) / Underline (Ctrl+U) — toggle buttons
  - Text color picker (A with colored underline)
  - Bulleted list / Numbered list
  - Indent / Outdent
  - Remove formatting
  - Insert link (Ctrl+K) — shows a popover with URL input
  - Toolbar buttons should be 28px square, gray icons, hover highlight
  - This can be implemented with `document.execCommand()` for simplicity (it's a mock, not production)

- [x] **Scheduled send**: Add a dropdown arrow (▾) next to the Send button in ComposeModal:
  - Options: "Schedule send" → shows sub-options: "Tomorrow morning (8:00 AM)", "Tomorrow afternoon (1:00 PM)", "Monday morning (8:00 AM)", "Pick date & time"
  - On schedule: save as draft with a `scheduledSend` timestamp field, show in a "Scheduled" section
  - For the mock: just save to sent immediately but show the schedule picker UI for agent training

- [x] **Email signature**: Add a signature line below the compose body area:
  - Default signature: "-- \nDemo User\ndemo@example.com"
  - Auto-inserted when compose opens (as HTML at bottom of body)
  - Can be toggled via a small link "Insert signature" in compose footer

### P2.2 — Navigation & Chrome

- [x] **Sidebar collapse/expand**: The hamburger menu (☰) button in the Header should toggle sidebar visibility:
  - Collapsed: sidebar hides completely, main content area expands
  - Expanded: sidebar shows at 256px width
  - Animation: smooth CSS transition (width 200ms)
  - Store the collapsed state in a UI state variable (not persisted in /go state)

- [x] **"More" expandable section in sidebar**: Real Xmail hides Spam, Trash, All Mail under a "More ▾" toggle. Implement:
  - Show: Inbox, Starred, Important, Sent, Drafts as always-visible
  - "More ▾" button below Drafts — on click, reveals: Spam, Trash, All Mail, (Snoozed if P1 snooze is done)
  - "Less ▴" button to collapse back
  - Default: collapsed (matching real Xmail)

- [x] **Settings panel (mock UI)**: Clicking the Settings gear (⚙) in the header should navigate to a `/settings` route:
  - Show a tabbed settings page with tabs: General, Labels, Inbox, Accounts
  - **General**: Display density radio (Default/Comfortable/Compact), Undo Send countdown (5/10/20/30 seconds), Signature text area
  - **Labels**: List of system labels with show/hide toggles, list of user labels with edit/delete
  - **Inbox**: Category tab toggles (Primary always on, Social/Promotions/Updates/Forums toggleable)
  - **Accounts**: Show current user info (read-only)
  - Non-functional save button at bottom (or auto-save to state)
  - Back button returns to inbox

- [x] **Profile avatar dropdown**: Clicking the profile avatar in the header should show a popover:
  - Shows user name, email address, avatar (larger)
  - "Manage your Google Account" link (no-op)
  - "Sign out" link (no-op — just close popover)
  - Close on click-outside

### P2.3 — Email List Enhancements

- [x] **Thread message count badge**: In EmailList, when a thread has multiple messages, show a count badge next to the sender name:
  - Format: `"Bob Jones (3)"` in gray text
  - Only show when thread has 2+ messages
  - Count = number of emails with same threadId in entire email array (not just filtered)

- [x] **Unread count per category tab**: The inbox category tabs (Primary/Social/Promotions) should show unread email counts:
  - Count = emails where `folder === 'inbox' && category === tabId && !read`
  - Show count in a small badge or inline text next to tab label
  - Only show if count > 0

- [x] **Date group headers**: Group emails in the list by date with section headers:
  - "Today" — emails from today
  - "Yesterday" — emails from yesterday
  - "This month" — earlier this month
  - "Older" — before this month
  - Headers are thin dividers with gray text, not clickable

- [x] **Select dropdown options**: The select-all checkbox in the toolbar should have a dropdown (▾) with options:
  - All, None, Read, Unread, Starred, Unstarred
  - "All" selects all visible threads, "None" deselects, "Read" selects only read threads, etc.
  - Matches Xmail's `* then A/N/R/U` keyboard shortcuts

### P2.4 — Keyboard Shortcuts (Extended)

- [x] **Navigation shortcuts**: Add these keyboard shortcuts (only active when not typing in input/textarea):
  - `G then I` → navigate to /inbox
  - `G then T` → navigate to /sent
  - `G then D` → navigate to /drafts
  - `G then S` → navigate to /starred
  - `J` → move to next (older) conversation in list
  - `K` → move to previous (newer) conversation in list
  - `O` or `Enter` → open selected conversation
  - `U` → return to threadlist (same as back button in ThreadView)
  - Implementation: track a "pending G" state — on `G` keypress, wait 1 second for second key

- [x] **Email action shortcuts**: Add these shortcuts:
  - `R` → reply to current email (in ThreadView)
  - `Shift+R` → reply all
  - `F` → forward
  - `X` → select/deselect current conversation
  - `Shift+I` → mark as read
  - `Shift+U` → mark as unread
  - `+` or `=` → mark as important
  - `-` → mark as not important
  - `!` → report as spam
  - `B` → snooze (if implemented)
  - `V` → open "Move to" menu
  - `L` → open "Label as" menu
  - `Z` → undo last action
  - `Shift+?` → show keyboard shortcuts help modal

- [x] **Keyboard shortcuts help modal**: When user presses `Shift+?` (i.e., `?`), show a modal listing all available keyboard shortcuts grouped by category. Xmail-style overlay with sections: Compose, Navigation, Thread List, Actions.

### P2.5 — Visual Polish

- [x] **Tooltip on all icon buttons**: Add `title` attributes or custom tooltip components to every icon-only button:
  - Header: "Main menu", "Search", "Show search options", "Support", "Settings", "Google apps", profile tooltip showing email
  - Sidebar: Compose tooltip "Compose"
  - Email list toolbar: "Select", "Archive", "Delete", "Mark as read", "Labels", "Move to"
  - Email row hover: "Archive", "Delete", "Mark as read/unread", "Snooze"

- [x] **Empty state illustrations per folder**: Each folder's empty state should have a unique message:
  - Inbox: "Your Primary tab is empty" (with tab context)
  - Starred: "No starred messages. Stars let you give messages a special status to make them easier to find."
  - Drafts: "You don't have any saved drafts."
  - Spam: "Hooray, no spam here!"
  - Trash: "No conversations in Trash."
  - All Mail: "You have no mail!" (should rarely be empty)

- [x] **Updates + Forums category tabs**: Add two more category tabs to inbox:
  - Updates (yellow/orange) — account alerts, receipts, bills
  - Forums (blue-green) — mailing list messages, group discussions
  - Add `'updates'` and `'forums'` to the category enum
  - Add 1-2 seed emails per category

---

## Data Seed Enhancements

Implement these additions in `createDefaultData()` in `mockData.js` to make the app feel more realistic:

- [x] **Add a pre-existing draft**: Create 1 draft email with partially filled fields (`to: "alice@company.com"`, `subject: "Meeting Notes"`, `body: "Hi Alice,\n\nHere are the notes from..."`) so the Drafts folder isn't empty and draft-resume can be tested

- [x] **Add more Social/Promotions emails**: Add 2-3 more emails per category:
  - Social: Twitter notification ("@user mentioned you"), Facebook ("You have 3 new friend requests")
  - Promotions: Uber receipt, Spotify subscription, retailer sale notification

- [x] **Add an email with multiple attachments**: One email with 3+ attachments of different types (pdf, image, spreadsheet) to test the attachment grid layout

- [x] **Add a longer thread** (6+ messages): A team discussion thread with 6-8 back-and-forth messages from 3-4 participants, testing thread scroll in ThreadView

- [x] **Add Updates/Forums category emails** (if P2 category tabs are implemented):
  - Updates: Bank statement notification, Google account security alert
  - Forums: Python mailing list discussion, internal company group message

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login flows (app starts pre-logged-in as `Demo User <demo@example.com>`)
- Real email sending via SMTP/API
- Real file upload to server (attachments are mock metadata)
- Google Chat / Meet / Spaces sidebar integration
- Google Calendar / Keep / Tasks sidebar panel
- Multi-account switching
- Real push notifications (desktop/browser)
- OAuth or any identity/security flows
- Actual data persistence beyond localStorage (no database)
