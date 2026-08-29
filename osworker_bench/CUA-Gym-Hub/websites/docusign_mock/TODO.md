# XocuSign Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-27
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Existing Project State

The project already has a basic scaffold: Vite + React + Tailwind, react-router-dom, react-draggable, react-signature-canvas, uuid, lucide-react, date-fns. Session isolation (vite.config.js with /post, /state, /go) is already implemented. There are existing pages: Dashboard, PrepareEnvelope, SigningRoom, GoEndpoint. These need significant expansion, not creation from scratch.

---

## P0 — Core Shell

These items fix or expand the foundational architecture. Without them, the app doesn't match XocuSign's real structure.

- [x] **Expand data model in dataManager.js**: Replace the minimal `getDefaultState()` with the full data model from `assets/data_model.md`. Add 9 realistic envelopes at various statuses (2 draft, 3 sent/delivered/signed, 2 completed, 1 voided, 1 declined), 4 templates, 8 contacts, 2 custom folders, and ~15 pre-populated audit log entries. Each envelope must have realistic `documents[]`, `recipients[]`, `fields[]`, and `history[]` arrays. Use deterministic IDs (env_1, env_2, etc.) not UUIDs. Generate realistic dates spanning the last 3 months.

- [x] **Expand StoreContext.jsx with full action set**: Add these missing actions to the context provider: `voidEnvelope(id, reason)` — sets status to "voided" + voidedAt timestamp; `declineEnvelope(envId, recipientId, reason)` — sets recipient status to "declined" + envelope status to "declined"; `correctEnvelope(id, updates)` — update recipients/fields on a sent envelope; `resendEnvelope(id)` — reset sentAt, add history event; `createFromTemplate(templateId, recipients)` — clone template into new draft envelope; `createTemplate(templateData)` — add new template; `deleteTemplate(id)` — remove template; `moveToFolder(envId, folderId)` — set envelope's folderId; `createFolder(name)` / `deleteFolder(id)` — manage custom folders; `addContact(contact)` / `deleteContact(id)` — manage contacts; `updateUser(updates)` — update user profile/signature. Each action must call `addAuditLog()`.

- [x] **Expand routing in App.jsx**: Add these routes: `/` → Home page (new component, NOT Dashboard); `/agreements` → Agreements page (envelope list with folders); `/agreements/:folder` → Agreements filtered by folder (inbox, sent, drafts, completed, action-required, waiting, expiring, deleted); `/agreements/detail/:id` → Envelope detail view; `/templates` → Templates list page; `/templates/:id/edit` → Template editor (reuse PrepareEnvelope logic); `/reports` → Reports page; `/settings` → User profile/settings page. Keep existing `/prepare/:id`, `/sign/:id`, `/go`.

- [x] **Redesign Layout.jsx to match XocuSign global header**: Replace the current sidebar layout with XocuSign's real layout: a **horizontal top navigation bar** with XocuSign logo on the left, centered nav tabs (Home | Agreements | Templates | Reports), and user avatar + help icon on the right. The nav tabs should be text links with an underline on the active tab, styled like the real XocuSign header (blue background #1A3763, white text). Remove the left sidebar — XocuSign uses a top-nav pattern. Below the header, render `{children}` as full-width content. Add a "Start" button (yellow/gold, #FFC829 background, dark text) in the header hero area on the Home page only, with a dropdown: "Send an Envelope" (navigates to new envelope flow), "Use a Template" (opens template picker modal), "Sign a Document" (navigates to sign flow for first actionable envelope).

---

## P1 — Primary Features

These are the core interactive workflows an agent would practice.

### Home Page

- [x] **Build Home page component** (`src/pages/Home.jsx`): Three sections below the hero banner. **Left column — OVERVIEW**: Four clickable status rows, each with an icon (blue circle-! for Action Required, gray clock for Waiting for Others, red triangle-! for Expiring Soon, green checkmark for Completed), the label, a count derived from `state.envelopes`, and a right-chevron arrow. Clicking a row navigates to `/agreements/<folder>`. **Center column — WHAT'S NEW**: Static promotional content block with 2-3 feature announcements (just hardcoded text — "Comments", "Bulk Send for Multiple Recipients", "Template Sorting" — with "More Info" links that do nothing). **Right column — MY XOCUSIGN ID**: Shows user avatar, name, email, title, company, member-since date, signature preview (if adopted), and an "Edit" link that navigates to `/settings`. The hero banner at top should be a blue gradient (#1A3763 to #2D5FA0) with white text "Sign or Get Signatures" and the yellow "Start" dropdown button.

### Agreements Page

- [x] **Build Agreements page** (`src/pages/Agreements.jsx`): Left sidebar (240px wide, white background) with folder navigation: static folders at top (Inbox, Sent, Drafts, Completed) with counts in gray, then a "Show More" toggle that reveals (Action Required, Waiting for Others, Expiring Soon, Authentication Failed, Deleted), then a "Folders" section header with custom folders from `state.folders` and a "+" button to create new folder. Active folder is highlighted with blue background. Main area: a search bar at top (magnifying glass icon, placeholder "Search agreements..."), envelope table below. Table columns: checkbox (for bulk select), Subject (bold text + envelope ID in gray below), Status (colored badge — green "Completed", yellow "Waiting for Others", blue "Sent", gray "Draft", red "Declined", dark gray "Voided", orange "Expiring Soon"), Last Change (relative date like "2 days ago" with absolute date on hover tooltip), Recipients (first recipient name + "+N more" if multiple). Row click → navigate to `/agreements/detail/:id`. Filter envelopes by folder: "inbox" = received by current user (status sent/delivered where user is a recipient); "sent" = sentAt is set; "drafts" = status === "draft"; "completed" = status === "completed"; "action-required" = needs user action; "waiting" = status sent/delivered and user is sender; "expiring" = expiresAt within 7 days; "deleted" = voided; custom folder = matching folderId. Add pagination: 10 envelopes per page with Previous/Next buttons and page indicator.

- [x] **Envelope Detail page** (`src/pages/EnvelopeDetail.jsx`): Top section: back arrow to Agreements, envelope subject as h1, status badge, "Created [date]" subtext. **Action buttons row** (top right): "Resend" (only if sent/delivered — calls resendEnvelope), "Correct" (only if sent/delivered — opens modal to edit recipients), "Void" (only if not completed/voided — opens confirm dialog, calls voidEnvelope), "Delete" (moves to voided), "Download" (mock: alert "Downloaded"). **Recipients card**: list each recipient with: colored role icon (pen for signer, eye for CC), name, email, status badge, signed/viewed timestamp if available. If declined, show decline reason. **Documents card**: list documents with PDF icon, name, page count. **History timeline card**: vertical timeline with dots and connecting lines, each event shows icon, description, timestamp, actor name. Events sorted newest-first. Use the envelope's `history[]` array.

### Prepare Envelope Flow

- [x] **Expand PrepareEnvelope with multi-step flow**: Restructure as a stepped wizard with 3 stages shown in a top progress bar: "1. Add Documents" → "2. Add Recipients" → "3. Place Fields", with Next/Back buttons. **Step 1 (Documents)**: Show uploaded document cards (PDF icon, filename, page count, three-dot menu with Remove option). Add document area: dashed border drop zone + "Upload" button + "Use a Template" button. For mock: clicking Upload creates a mock document with random picsum image; clicking "Use a Template" opens a modal listing templates from `state.templates`. **Step 2 (Recipients)**: Current recipient add form, but enhanced: add a "Role" dropdown next to each recipient (Needs to Sign | Receives a Copy | Needs to View), add "Set signing order" checkbox that shows ordering number inputs, add "Message" textarea for email body sent to all recipients. Include subject line input field. **Step 3 (Fields)**: Keep existing drag-and-drop canvas but expand the field palette to include all field types from data_model.md (Signature, Initial, Date Signed, Name, Email, Company, Title, Text, Checkbox, Dropdown). Group fields under "Standard Fields" (Signature, Initial, Date Signed, Name, Email, Company, Title) and "Data Fields" (Text, Checkbox, Dropdown) headers. Add a **field properties panel** on the right sidebar (300px) when a field is selected: shows field type label, "Assigned to" dropdown, "Required" toggle switch, "Label/Tooltip" text input, and "Delete Field" button. Maintain the color-coding per recipient.

- [x] **Send confirmation flow**: When user clicks "Send Envelope" on the final step, show a confirmation modal summarizing: envelope subject, number of documents, list of recipients with roles, number of fields placed. "Send" and "Cancel" buttons. On send: update envelope status to "sent", set sentAt, update all recipient statuses to "sent", add "sent" history event, navigate to `/agreements/sent` and show a success toast "Envelope sent successfully".

### Signing Experience

- [x] **Enhance SigningRoom with adoption modal tabs**: Replace the current basic signature canvas with a tabbed adoption modal matching XocuSign's real UI. Three tabs: **"Type"** — show user's name in 4 different handwriting-style fonts (use CSS font-family with cursive/serif variants), let user select one, render name as SVG/canvas data URL; **"Draw"** — the existing SignatureCanvas component; **"Upload"** — a file input that accepts image files, preview the uploaded image. All three tabs produce a data URL that gets stored as the field value. Add "Change Style" link on the Type tab. The modal header should say "Adopt Your Signature" for signature fields and "Adopt Your Initials" for initial fields.

- [x] **Required field navigation in SigningRoom**: Add a bottom bar or floating panel showing "N of M required fields completed" with a progress indicator. Add "Next" button that scrolls to the next unfilled required field (highlight it with a pulsing yellow border). Add "Previous" button. The "Finish" button should be disabled until all required fields for the current recipient are filled. When all fields are complete, show a green "All fields complete!" message and enable the Finish button.

- [x] **Signing completion screen**: After clicking Finish, instead of `alert()` + navigate, show a full-screen success overlay: green checkmark icon, "Document Signed Successfully!" heading, "You will receive a copy via email" subtext, "Download a Copy" button (mock: does nothing or alerts), "Close" button that navigates to home. Update envelope status appropriately.

### Templates

- [x] **Build Templates page** (`src/pages/Templates.jsx`): Similar layout to Agreements but simpler. Top bar: "Templates" h1, "Create Template" button. Table with columns: Template Name (bold), Description, Owner, Last Used (relative date), Times Used (number), Shared (icon badge). Row actions via three-dot menu: "Use" (creates new envelope from template via createFromTemplate, navigates to /prepare/:newId), "Edit" (navigates to /templates/:id/edit), "Delete" (confirm dialog, calls deleteTemplate). Add search bar filtering by template name.

- [x] **Template create/edit flow**: Reuse PrepareEnvelope component logic but adapted for templates. Key differences: instead of named recipients, use **Roles** (e.g., "Signer 1", "Signer 2", "CC 1") with a role name input. Fields are assigned to roles, not specific people. Template has a name and description input at the top. "Save Template" button instead of "Send". When saving, create/update template in state.

### Search & Filter

- [x] **Global search across Agreements**: The search bar on the Agreements page should filter envelopes by: subject (case-insensitive substring match), recipient name, recipient email. Add debounced input (300ms). Show "No results found" empty state when no matches. Search should work across all envelopes regardless of current folder filter.

- [x] **Date range filter on Agreements**: Add a date range picker next to the search bar. Two date inputs (From / To) that filter envelopes by lastActivityAt. Include quick presets: "Last 7 days", "Last 30 days", "Last 6 months", "All time" as clickable chips above the date inputs.

### Envelope Actions

- [x] **Void envelope flow**: On EnvelopeDetail, "Void" button opens a modal with: "Are you sure you want to void this envelope?" heading, a required textarea "Reason for voiding", "Void" (red) and "Cancel" buttons. On confirm: call voidEnvelope, add history event "Envelope voided: [reason]", navigate back to agreements. Voided envelopes show a red "VOIDED" watermark overlay on the detail page.

- [x] **Resend envelope**: On EnvelopeDetail, "Resend" button shows a confirmation: "Resend to all recipients who haven't completed?" with "Resend" and "Cancel". On confirm: add history event "Envelope resent", show success toast.

- [x] **Correct envelope**: On EnvelopeDetail, "Correct" button opens a modal pre-filled with current recipients. User can: change recipient name/email, add new recipients, remove recipients who haven't signed. Save calls correctEnvelope, adds history event.

---

## P2 — Secondary Features

Depth features for realism, implement only after P1 is solid.

- [x] **Bulk operations on Agreements page**: Checkbox in table header selects all visible. When 1+ envelopes selected, show a bulk actions bar above the table: "Void Selected" (only for non-completed), "Delete Selected", "Move to Folder" dropdown. Include a count badge "N selected".

- [x] **Custom folder management**: "+" button in folder sidebar opens a small inline input or modal to name a new folder. Right-click or three-dot menu on custom folders: "Rename", "Delete" (confirm, moves envelopes back to default). Envelopes can be moved to folders via drag-and-drop (stretch goal) or via the "Move to Folder" option in row three-dot menu on Agreements page.

- [x] **Envelope reminders**: On EnvelopeDetail for sent/delivered envelopes, add a "Reminders" section showing reminder settings (enabled/disabled, frequency, next reminder date). "Edit Reminders" button opens a modal: toggle on/off, days between reminders (number input), total reminders (number input). Save updates the envelope.

- [x] **Envelope expiration management**: On EnvelopeDetail, show expiration date if set. "Edit Expiration" button opens a date picker to set/change expiration. Envelopes past expiration date should show status "expired" with a red badge.

- [x] **Reports page** (`src/pages/Reports.jsx`): Simple dashboard with 3-4 cards: "Envelopes Sent" (count in last 30 days), "Envelopes Completed" (count), "Average Completion Time" (mock: "2.3 days"), "Completion Rate" (percentage). Below: a simple bar chart (use CSS bars, no chart library needed) showing envelopes by status. A "Sent vs Completed" line over last 6 months (mock with hardcoded data).

- [x] **User Settings page** (`src/pages/Settings.jsx`): Form with editable fields: Name, Email (read-only), Title, Company. **Signature section**: shows current adopted signature image, "Change Signature" button opens adoption modal (same as signing room). **Initials section**: same pattern. Save button calls updateUser.

- [x] **Contact address book**: On the Add Recipients step in PrepareEnvelope, add an address book icon button that opens a modal listing `state.contacts`. User can search contacts, click to add as recipient. Also add "Save to Contacts" checkbox when adding a new recipient.

- [x] **Notification badges on nav tabs**: Show a red badge with count on the "Agreements" tab indicating number of action-required envelopes. Show badge on "Home" tab if there are drafts or action-required items.

- [x] **Toast notification system**: Create a lightweight toast component that shows success/error messages (green/red bar at top-right, auto-dismisses after 3 seconds). Use for: envelope sent, envelope voided, template created/deleted, settings saved. Replace all existing `alert()` calls with toasts.

---

## Data Seed (implement in createInitialData())

- [x] **User profile**: Sarah Chen, sarah.chen@acmecorp.com, VP of Operations at Acme Corporation, member since 2021-03-15. Pre-adopted signature (generate a simple cursive "Sarah Chen" data URL using canvas or hardcode a base64 signature image).

- [x] **9 Envelopes** with realistic subjects covering business scenarios: NDA, employment offer, sales contract, vendor agreement, partnership agreement, consulting contract, lease agreement, old proposal (voided), service agreement (declined). Each with 1-3 documents, 1-3 recipients, 3-12 fields, and 3-8 history events. Use realistic company/person names. Dates should span Jan-Feb 2025 for variety.

- [x] **4 Templates**: Standard NDA (shared, used 15 times), Employment Agreement (shared, used 8 times), Sales Contract (shared, used 12 times), Lease Agreement (private, used 3 times). Each with 2-3 placeholder roles and pre-placed fields.

- [x] **8 Contacts**: Mix of names across 4-5 different companies (Partner Corp, Legal Associates, TechStart Inc, Global Ventures, Summit LLC).

- [x] **2 Custom Folders**: "Q1 2025 Contracts" (2 envelopes assigned), "HR Documents" (1 envelope assigned).

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as Sarah Chen)
- Real email delivery or SMS notifications
- Real file upload to server (use FileReader data URLs or mock placeholder images)
- Payment collection (Stripe/payment gateways)
- Admin console / organization management
- Mobile responsive design
- Real PDF rendering (use placeholder document images)
- ID verification (SMS codes, access codes, KBA)
- XocuSign Connect / webhooks
- Intelligent Agreement Management (IAM)
- PowerForms / Web Forms
- Bulk Send (sending same envelope to many recipients simultaneously)
- In-person signing on mobile device
