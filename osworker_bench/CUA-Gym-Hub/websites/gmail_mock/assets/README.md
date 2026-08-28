# Xmail Mock — Research Summary

## App Overview

Xmail is Google's web-based email client, the world's most popular email service with over 1.8 billion users. The desktop web interface is a full-featured email management application with threaded conversations, rich composition, label-based organization, tabbed inbox categories, and deep keyboard-shortcut support.

**Purpose of this mock**: Provide a realistic Xmail training sandbox for computer-use AI agents. The agent should be able to compose/reply/forward emails, manage labels, star/archive/delete, search, navigate folders, use keyboard shortcuts, and observe all state changes via `/go`.

---

## Key User Personas & Primary Workflows

### Persona: Office Knowledge Worker ("Demo User")
1. **Triage inbox** — Scan inbox, mark read/unread, star important items, archive or delete noise
2. **Compose & send** — Write new email with recipients, subject, formatted body, attachments
3. **Reply / Reply-All / Forward** — Respond within threads, forward threads to others
4. **Organize** — Apply labels, move to folders, use category tabs (Primary/Social/Promotions)
5. **Search** — Find old emails by sender, subject, keyword, attachment, date range
6. **Bulk operations** — Select multiple emails, archive/delete/label in batch
7. **Draft management** — Save drafts, resume editing later, discard
8. **Trash/Spam management** — Report spam, empty trash, recover from trash

---

## Complete Feature List (Priority Ratings)

### P0 — Core Shell (App Cannot Render Without These)
| # | Feature | Status |
|---|---------|--------|
| 1 | Vite + React project scaffold | DONE |
| 2 | App layout: 64px header, 256px sidebar, fluid main area | DONE |
| 3 | HashRouter with all routes (inbox, starred, important, sent, drafts, spam, trash, all-mail, label/:id, email/:threadId, /go) | DONE |
| 4 | React Context state management (StoreContext) | DONE |
| 5 | Session isolation (vite.config.js plugin, POST/GET/go endpoints) | DONE |
| 6 | Data normalization for POST API | DONE |
| 7 | State diff tracking (calculateStateDiff) | DONE |

### P1 — Primary Interactive Features
| # | Feature | Status |
|---|---------|--------|
| 1 | Email list view with thread grouping | DONE |
| 2 | Inbox category tabs (Primary/Social/Promotions) | DONE |
| 3 | Thread view with all messages | DONE |
| 4 | Compose modal (new email) | DONE |
| 5 | Reply in thread view | DONE |
| 6 | Star / Important toggles | DONE |
| 7 | Mark as read/unread | DONE |
| 8 | Delete (move to trash / permanent delete from trash) | DONE |
| 9 | Archive emails | DONE |
| 10 | Custom labels (view, create, apply to emails) | DONE |
| 11 | Search (basic text + advanced modal: from, to, subject, has:attachment) | DONE |
| 12 | Bulk select + bulk operations | DONE |
| 13 | Draft auto-save (2s debounce) | DONE |
| 14 | Empty trash | DONE |
| 15 | Keyboard shortcuts (C, /, E, #) | DONE |
| 16 | **Hover action buttons in email row — BROKEN (no click handlers)** | NEEDS FIX |
| 17 | **Thread view toolbar buttons — BROKEN (archive/delete/mark-read no handlers)** | NEEDS FIX |
| 18 | **Forward email** — Not implemented | MISSING |
| 19 | **Reply All button in thread view** — Missing UI | MISSING |
| 20 | **Open draft in compose** — Clicking draft doesn't pre-fill compose modal | MISSING |
| 21 | **Create label dialog** — Plus button in sidebar labels section has no modal | MISSING |
| 22 | **"Move to" menu** — No way to move emails between folders | MISSING |
| 23 | **Report as spam** — No spam button/handler | MISSING |
| 24 | **"Not spam" in spam folder** — Missing button | MISSING |
| 25 | **Undo toast notifications** — No feedback after destructive actions | MISSING |
| 26 | **Right-click context menu** — Xmail has rich context menus on email rows | MISSING |
| 27 | **Snooze emails** — Not implemented | MISSING |

### P2 — Secondary / Depth Features
| # | Feature | Status |
|---|---------|--------|
| 1 | Rich text formatting toolbar in compose | MISSING |
| 2 | More keyboard shortcuts (R, Shift+R, F, G+I, G+T, G+D, J, K, X, etc.) | PARTIAL |
| 3 | Thread message count badge in email list | MISSING |
| 4 | Unread count per category tab | MISSING |
| 5 | Sidebar collapse/expand (hamburger menu) | MISSING |
| 6 | Settings panel (mock, non-functional internals) | MISSING |
| 7 | Profile avatar dropdown | MISSING |
| 8 | "More" expandable section in sidebar (All Mail normally hidden under "More") | MISSING |
| 9 | Date group headers in email list ("Today", "Yesterday", "This month") | MISSING |
| 10 | Scheduled send (time picker) | MISSING |
| 11 | Email signature | MISSING |
| 12 | Tooltip/hover info on buttons | MISSING |
| 13 | Updates + Forums category tabs | MISSING |
| 14 | Undo send countdown timer | MISSING |
| 15 | Print email thread | MISSING |

---

## UI Layout Description

### Header (64px, sticky top)
- **Left**: Hamburger menu (☰) → toggles sidebar | Xmail logo+wordmark
- **Center**: Search bar (rounded pill, `#eaf1fb` bg) → expands on focus with white bg + shadow | Advanced search toggle (sliders icon) opens dropdown
- **Right**: Help (?) | Settings (⚙) | Apps grid (⊞) | Profile avatar (circular, 32px)

### Sidebar (256px, left)
- **Top**: Compose button — large, `#c2e7ff` bg, rounded-2xl, 56px height, "+Compose" with plus icon
- **Navigation items** — each is a rounded-right pill (`rounded-r-full`), 36px height:
  - Inbox (with unread badge count)
  - Starred (with count)
  - Important (with count)
  - Sent
  - Drafts (with draft count)
  - [More ▾] expandable
    - Spam
    - Trash
    - All Mail
- **Labels section** — "Labels" header with "+" create button, then each label as a nav item with colored dot

### Main Content Area
- **Email List View**: White card with `rounded-tl-2xl`, shadow-sm
  - Toolbar: Select all checkbox | Archive | Delete | Mark read | Label | More | (Empty Trash if trash folder)
  - Category tabs (inbox only): Primary (red) | Social (blue) | Promotions (green)
  - Email rows: Checkbox | Star | Important marker | From (bold if unread) | Subject – snippet | Label dots | Timestamp (hover: action buttons)

- **Thread View**: White card with rounded top-left
  - Toolbar: Back arrow | Archive | Delete | Mark read
  - Subject heading (h1, 24px) with label badges
  - Message cards: Avatar | From (bold) | Timestamp | Star | Reply | More menu | Body (HTML rendered) | Attachments grid
  - Reply box at bottom: Avatar + collapsed "Reply" input → expands to textarea + Send button + attach

### Compose Modal (bottom-right floating)
- Default: 500x500px, pinned bottom-right
- Minimized: 64x256px bar showing "New Message"
- Maximized: Fills viewport with padding
- Header: "New Message" | Minimize | Maximize | Close
- Fields: To (with Cc/Bcc toggle) | Subject | Body textarea
- Footer: Send (blue pill) | Attach | Link | Emoji | Image | Trash (right)

---

## Data Model Overview
See `assets/data_model.md` for complete schema.

**Entities**: User, Email, Label, Draft (emails with folder='drafts')
**Key relationships**: Emails grouped by threadId; emails reference labelIds; user is singleton

---

## What to Skip (and why)
- **Authentication / login** — App starts pre-logged-in as "Demo User" (`demo@example.com`)
- **Real email sending** — Sent emails are just added to state with `folder: 'sent'`
- **Real file uploads** — Attachments are mock metadata objects with placeholder URLs
- **OAuth / API calls** — All data is in-memory + localStorage
- **Notifications (push/desktop)** — Out of scope for sandbox
- **Google Chat / Meet / Spaces integration** — The sidebar panel for Chat/Meet is not included
- **Multi-account** — Only one user session
