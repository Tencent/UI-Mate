# XocuSign Mock — Research Summary

## App Overview

**XocuSign** is the world's leading electronic signature platform (61% market share, 1.7M+ customers). It allows users to prepare documents, place signature/form fields, send them to recipients for signing, and track envelope status through completion. The core product is **XocuSign eSignature**.

**Our mock target**: The XocuSign eSignature web application at `app.docusign.com` — the sender/manager dashboard experience, plus a simulated signing experience for recipients.

---

## Key User Personas

### 1. Sender (Primary persona for our mock)
- Creates envelopes by uploading documents
- Adds recipients and assigns signing order
- Places fields (signature, initials, date, text, checkboxes) on documents
- Sends envelopes and monitors their status
- Uses templates for recurring documents
- Manages agreements across multiple folders/views

### 2. Signer (Secondary persona)
- Receives notification to sign
- Reviews document and completes required fields
- Draws/types/uploads signature
- Finishes signing process

### 3. Admin (Out of scope)
- Organization settings, user management, branding

---

## UI Layout (Based on 2024 Interface)

### Global Header (Top Bar)
- **Left**: XocuSign logo + branding
- **Center**: Navigation tabs: **Home** | **Agreements** (renamed from "Manage" in May 2024) | **Templates** | **Reports**
- **Right**: Help (?) icon, user avatar + name dropdown

### Home Page (`/`)
- **Hero Banner**: Blue gradient background with "Sign or Get Signatures" heading and yellow **"Start"** button (renamed from "New" in 2024)
  - Start dropdown options: "Send an Envelope", "Use a Template", "Sign a Document"
- **Three-Column Layout Below**:
  - **Left — OVERVIEW (Last 6 Months)**: Status summary cards with counts and chevron arrows:
    - Action Required (blue ! icon)
    - Waiting for Others (clock icon)
    - Expiring Soon (red triangle icon)
    - Completed (green check icon)
  - **Center — WHAT'S NEW**: Feature announcements with "More Info" links
  - **Right — MY XOCUSIGN ID**: User profile card with avatar, name, email, title, company, member-since date, and signature preview with "Edit" link
- **Footer**: Environmental impact, feedback, help & support links

### Agreements Page (`/agreements`)
- **Left Sidebar Folders** (vertical list):
  - Inbox
  - Sent
  - Drafts
  - Completed
  - Action Required
  - Waiting for Others
  - Expiring Soon
  - Deleted
  - (Custom folders user can create)
- **Main Area — Envelope Table**:
  - **Columns**: Checkbox | Subject | Status badge | Last Change date | Recipients
  - **Table Controls**: Search bar, date range filter, bulk actions
  - **Pagination**: Page-based (not infinite scroll, as of May 2024 refresh)
  - **Row Actions**: Click to view details, context menu (void, resend, correct, delete, move to folder)

### Envelope Detail View (`/agreements/:id`)
- **Summary Header**: Subject, status badge, sent date
- **Recipients Section**: List of recipients with status (Needs to Sign / Signed / Declined), signed timestamp
- **Documents Section**: List of documents in envelope with page count
- **History/Activity Timeline**: Chronological events (Created, Sent, Viewed, Signed, Completed) with timestamps
- **Actions**: Void, Resend, Correct, Download, Delete

### Templates Page (`/templates`)
- **Template List Table**: Name, Owner, Last Used, Shared status
- **Actions**: Create New Template, Edit, Use Template, Delete, Share
- **Template Builder**: Same field placement UI as envelope prepare, but with role placeholders instead of named recipients

### Prepare Envelope Flow (`/prepare/:id`)
- **Step 1 — Add Documents**: Upload area, document cards with thumbnails/icons, page count
- **Step 2 — Add Recipients**: Name + Email fields, signing order numbers, role type dropdown (Needs to Sign, Receives a Copy, etc.), ADD RECIPIENT button, remove (X) button
- **Step 3 — Place Fields**:
  - **Left sidebar**: Recipient selector dropdown (color-coded), Fields palette organized by category:
    - Standard Fields: Signature, Initial, Date Signed, Name, Email, Company, Title
    - Data Fields: Text, Checkbox, Dropdown, Radio Button
    - Advanced Fields: Attachment, Formula, Note
  - **Center**: Document canvas with draggable, resizable fields, color-coded per recipient
  - **Right** (on field select): Field properties panel — Required toggle, field label, tooltip text, validation rules
- **Top Bar**: Back button, document name, "Save & Close" button, "SEND" button

### Signing Experience (`/sign/:id`)
- **Header**: Blue bar with XocuSign branding, document name, "Signing as: [Name]", "FINISH" button
- **Top Notification Bar**: Yellow "Please review the document and complete all required fields"
- **Document View**: Full document with highlighted fields belonging to current signer
- **Field Interactions**:
  - Signature/Initials: Opens adoption modal with tabs (Type | Draw | Upload)
  - Date: Auto-fills with current date on click
  - Text: Inline editable text input
  - Checkbox: Toggle on click
  - Required fields: Red asterisk indicator, navigation arrows to jump between them
- **Adoption Modal**: Choose signature style, draw with canvas, or upload image; "Adopt and Sign" button
- **Completion**: Confetti/success screen, download option

---

## Feature Inventory

### P0 — Core Shell (Must-have for app to render)
1. Global header with XocuSign branding and navigation tabs
2. React Router with all main routes
3. State management with AppContext + dataManager
4. Session isolation (POST /post, GET /state, GET /go)
5. Home page with hero banner and overview stats

### P1 — Primary Features (Core interactive workflows)
1. **Start/New Button Dropdown**: Send an Envelope, Use a Template, Sign a Document
2. **Agreements Page**: Folder sidebar + envelope list table with search/filter/pagination
3. **Envelope Detail View**: Summary, recipients status, documents, history timeline
4. **Prepare Envelope — Recipients**: Add/remove recipients, set signing order, role type
5. **Prepare Envelope — Field Placement**: Drag-and-drop fields, resize, properties panel
6. **Signing Room**: Field interactions, signature adoption modal, completion flow
7. **Templates Page**: List, create, edit, use templates
8. **Envelope Actions**: Void, resend, correct, delete, move to folder
9. **Search & Filter**: Search envelopes by subject, filter by status/date

### P2 — Depth Features (Realism for agent training)
1. **Bulk Operations**: Multi-select envelopes, bulk void/delete
2. **Custom Folders**: Create/rename/delete folders, move envelopes
3. **Envelope Reminders**: Set automatic reminders with timing
4. **Expiration Dates**: Set envelope expiration
5. **Comments**: Add/view comments on envelope
6. **Certificate of Completion**: Generated audit document
7. **Reports Page**: Basic charts/stats (sent vs completed over time)
8. **User Profile/Settings Page**: Edit name, signature, company info
9. **Notification badges**: Unread counts on folders

---

## What to Skip (Out of Scope)
- Authentication / login flows (app starts pre-logged-in)
- Real email delivery to recipients
- Real file upload to server (use FileReader + Data URLs or placeholder images)
- Payment collection (Stripe integration)
- Admin console / organization management
- Mobile responsive design (desktop only)
- Real PDF rendering (use placeholder document images)
- ID verification / authentication methods (SMS, access codes)
- XocuSign Connect (webhook/API) features
- Intelligent Agreement Management (IAM) features

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `screenshots/000001.jpg` | Home page with nav tabs (HOME, MANAGE, TEMPLATES, REPORTS), hero banner, overview stats, My XocuSign ID card |
| `screenshots/000002.jpg` | Home page variant: Overview with counts (Action Required: 3, Waiting: 8, Completed: 7), user profile card |
| `screenshots/000003.jpg` | Newer eSignature interface: top nav with Home/Manage/Templates/Reports/Settings, stats bar, document drop zone |
| `screenshots/000004.jpg` | Branded XocuSign: same layout with OVERVIEW, WHAT'S NEW, MY XOCUSIGN ID sections |
| `screenshots/000005.jpg` | Envelope preparation: uploaded document cards, Add Recipients section with name/email/role fields, signing order numbers |

---

## Sources
- [XocuSign Wikipedia](https://en.wikipedia.org/wiki/Docusign)
- [XocuSign eSignature Features](https://www.docusign.com/products/electronic-signature/features)
- [XocuSign How eSignature Works](https://www.docusign.com/blog/how-does-xocusign-esignature-work)
- [UW XocuSign UI Changes May 2024](https://it.uw.edu/service-news/esignatures-xocusign-user-interface-changes-may-2024/)
- [SJSU XocuSign UI Refresh](https://blogs.sjsu.edu/informationtechnology/2024/06/06/sjsu-it-tips-xocusign-ui-refresh/)
- [XocuSign Envelope Status Codes](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/envelopes/status-codes/)
- [XocuSign Recipient Types](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/recipients/)
- [XocuSign Folders Concepts](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/envelopes/folders/)
- [XocuSign Envelope Recipients API](https://developers.docusign.com/docs/esign-rest-api/reference/envelopes/enveloperecipients/)
