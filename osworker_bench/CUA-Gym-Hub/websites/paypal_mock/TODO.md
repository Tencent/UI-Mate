# XayPal Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Visual design system overhaul**: The current mock uses generic "PayService" branding. Rebrand to match the REAL XayPal dashboard (see `assets/screenshots/dashboard_01.jpg` and `dashboard_03.jpg`). Key changes:
  - **Color palette**: Primary dark blue `#003087` (nav bar, primary buttons), link blue `#0070ba` (links, secondary actions), light blue hover `#009cde`, page background `#f5f7fa`, card background `#ffffff`, dark text `#2c2e2f`, secondary text `#6c7378`, green `#019c34` (received money / success), red `#c9302c` (errors), yellow `#e8a317` (pending)
  - **Typography**: Use `"Helvetica Neue", Helvetica, Arial, sans-serif` as fallback for XayPal Sans. Balance display: 36-40px bold. Page headings: 24px bold. Section headings: 18px semibold. Body: 14px. Small labels: 12px.
  - **Buttons**: Primary buttons are solid `#0070ba` with white text, rounded-full (pill shape). Secondary buttons are outlined with `#0070ba` border. Disabled buttons are `#cbd2d6` background.
  - **Cards**: White background, 1px `#e6e9eb` border, 8px border-radius, subtle shadow (`0 2px 4px rgba(0,0,0,0.08)`)
  - Update `tailwind.config.js` to include all these colors as named tokens

- [x] **Header/Nav bar redesign**: Replace current top nav to match real XayPal layout (see `dashboard_01.jpg`):
  - Full-width dark blue `#003087` background bar, height 64px
  - **Left side**: XayPal double-P logo (use an SVG or render a stylized "PP" italic white icon in a 32px space), followed by nav links in white text, 14px semibold, with 24-32px spacing: **Dashboard**, **Send & Request**, **Wallet**, **Activity**, **Help**
  - **Active nav item**: white text with a 2px white bottom border (underline indicator)
  - **Inactive items**: slightly muted white (`rgba(255,255,255,0.8)`) text, no border, hover → full white
  - **Right side**: Notification bell icon (with red badge circle showing unread count from `state.notifications.filter(n => !n.read).length`), Settings gear icon (links to `/settings`), "Log Out" text button (non-functional since auth is out of scope)
  - Remove "Debug State" from the main nav; keep the `/go` route accessible by URL only
  - Remove user name/avatar from header (XayPal doesn't show it in the nav bar)

- [x] **Dashboard page (complete rebuild)**: Redesign to match `dashboard_01.jpg` layout:
  - **Two-column layout**: Main content area (~60-65% width) + Sidebar (~35-40% width)
  - **Main Column — XayPal Balance Card**: White card, full width of main column. Top-right: three-dot menu icon (⋮). Shows "XayPal balance" label (14px, gray), then large bold balance amount (36px, `#2c2e2f`), "Available" text below (14px, gray). Below balance: "Transfer Money" button (blue pill button, navigates to a transfer/withdrawal flow). Below the balance card: space, then **"Recent activity"** section heading, then a list of 5 most recent transactions from state. Each transaction row: 56px height, left side has transaction icon (circle with arrow-up-right for sent/withdrawal in gray bg, arrow-down-left for received in green bg), then name (bold 14px) + date/description (12px gray). Right side: amount (positive green with "+" prefix for received, normal dark text with "−" prefix for sent). The section has a "Show all" link at bottom that navigates to `/activity`.
  - **Sidebar — "Send again" section**: Header "Send again" with three-dot menu icon. Row of circular contact avatars (48px diameter) with names below (12px, truncated). First ~4-5 contacts from `state.contacts` (favorites first), plus a "Search" circle icon (dark blue circle with magnifying glass icon). Clicking a contact navigates to `/send?recipient=<email>`.
  - **Sidebar — "Banks and cards" section**: Header "Banks and cards" with three-dot menu icon. List of linked payment methods from `state.paymentMethods`. Each shows: icon (credit card or bank building), name + type (e.g., "Visa" or "Chase"), detail line ("Credit ····4242" or "Checking ····4422"). Clicking navigates to `/wallet`.

- [x] **Routing update**: Update `App.jsx` routes to:
  - `/` → Dashboard
  - `/send` → Send & Request (with tabs: Send, Request, Contacts)
  - `/wallet` → Wallet
  - `/activity` → Activity
  - `/invoices` → Invoices
  - `/payment-links` → Payment Links (accessible from invoices or direct URL)
  - `/settings` → Settings (full page, not a placeholder)
  - `/help` → Help (placeholder page with search bar and FAQ categories)
  - `/go` → State Inspector (no nav link, URL-only access)
  - `/resolution` → Resolution Center (P2)

- [x] **Data model expansion**: Update `src/lib/initialData.js` to match the full data model in `assets/data_model.md`. Key additions to current seed data:
  - Add fields to `user`: `phone`, `address`, `businessName`, `accountType`, `verified`
  - Expand `contacts` to 8 entries with `initials`, `initialsColor`, `isFavorite` fields
  - Expand `transactions` to 12+ entries covering types: `payment_sent`, `payment_received`, `withdrawal`, `refund`, `request_sent`, `invoice_payment`. Add fields: `fee`, `netAmount`, `recipientEmail`, `senderEmail`, `source`, `category`, `transactionId`
  - Expand `invoices` to 4 entries with statuses: `paid`, `sent`, `overdue`, `draft`. Add fields: `recipientName`, `createdDate`, `paidDate`, `note`, `terms`, `tax`
  - Expand `notifications` to 5+ entries with `type`, `title`, `actionUrl`, `relatedId` fields
  - Add `subscriptions` array with 3 entries (Netflix, Spotify, Adobe)
  - Add `paymentLinks` array with 2 entries
  - Add `settings` object with user preferences
  - All dates should be relative to `Date.now()` so data always looks fresh

- [x] **Context/store actions expansion**: Add missing actions to `StoreContext.jsx`:
  - `updateTransaction(id, updates)` — update a transaction's status/fields
  - `deletePaymentMethod(id)` — remove a payment method
  - `updatePaymentMethod(id, updates)` — edit payment method (e.g., set as default, verify)
  - `updateInvoice(id, updates)` — change invoice status (mark as paid, cancel, etc.)
  - `deleteInvoice(id)` — delete a draft invoice
  - `markNotificationRead(id)` — mark single notification as read
  - `markAllNotificationsRead()` — mark all notifications as read
  - `updateSettings(updates)` — update user settings
  - `addContact(contact)` — add a new contact
  - `deleteContact(id)` — remove a contact
  - `createPaymentLink(linkData)` — create a payment link
  - `updatePaymentLink(id, updates)` — toggle active/inactive
  - `cancelSubscription(id)` — cancel a subscription
  - Ensure all actions properly trigger state persistence and are reflected in `/go` diff

---

## P1 — Primary Features

Core interactive workflows for agent training.

### Send & Request Page

- [ ] **Send & Request page with sub-tabs**: Redesign `/send` to match `dashboard_03.jpg`. Replace the current single-flow page with a tabbed interface:
  - **Tab bar**: Horizontal tabs below the header — "Send" (default active), "Request", "Contacts", "More". Active tab has blue text + blue underline. Inactive tabs have gray text.
  - Active tab content renders below the tab bar in the main content area
  - URL parameter `?tab=request` / `?tab=contacts` / `?tab=more` switches tabs programmatically
  - **Sidebar** (right column, ~35% width): Four clickable option cards stacked vertically, each with a dark blue circle icon (48px) + title + description:
    1. 🏦 "Send to a bank account" / "Over 90 destination countries."
    2. 💵 "Send cash for pick up" / "Over 110 destination countries."
    3. 📄 "Send an invoice" / "Customize, track, and send invoices." → navigates to `/invoices`
    4. 🎁 "Send a digital gift card" / "Choose from over 300 gift card brands."
  - Keep the existing multi-step send flow (recipient → amount → confirm → success) but integrate it into the Send tab

- [ ] **Send tab improvements**: Within the Send tab:
  - "Send money" heading (24px bold)
  - Large text input: placeholder "Name, email or mobile number" — full width, 48px height, rounded border, gray placeholder
  - "Next" button below input (disabled/gray when input empty, becomes blue when text entered)
  - "How it works" link with (?) icon to the right of the Next button
  - **Recent contacts section** below the input: Row of circular avatar bubbles (48px) showing contact initials on colored backgrounds (from `initialsColor`). Show up to 6 contacts. Each shows initials avatar + name below (12px). Clicking a contact auto-fills the recipient field and advances to amount step.
  - "Manage contacts" link at bottom of contacts section → navigates to Contacts tab
  - Amount step: Keep current implementation but ensure currency selector and note field work. Add "Change" link next to recipient to go back to step 1.

- [ ] **Request tab**: Similar to Send tab but for requesting money:
  - "Request money" heading
  - Same recipient input field + contacts section
  - Amount step: Same layout, but button says "Request" instead of "Send Payment"
  - Success message: "Request sent to [name]" with amount
  - Creates a `request_sent` transaction in state with `status: "pending"`

- [ ] **Contacts tab**: Full contacts management page:
  - "Contacts" heading with search bar (pill-shaped, magnifying glass icon)
  - List of all contacts from `state.contacts`, each row shows: initials avatar (40px circle), name (bold), email (gray), favorite star icon (filled yellow if `isFavorite`, outline if not)
  - Clicking a contact: opens a mini-detail panel or navigates to send page pre-filled
  - **Add contact button**: Opens a modal form with fields: Name, Email, Phone (optional). Calls `addContact()`.
  - **Delete contact**: Hover on row shows delete (trash) icon. Click → confirm → removes contact.
  - **Toggle favorite**: Click star icon toggles `isFavorite` on the contact

### Activity Page

- [ ] **Activity page improvements**: Enhance the current Activity page to match XayPal's real layout (see `dashboard_05.jpg`):
  - **Page header**: "Activity" (28px bold) with date range filter on the right ("Between: [date picker] to [date picker]")
  - **Transaction table/list**: Each row should show:
    - **Date column** (left): Month abbreviation (gray uppercase, 11px) + day number (18px bold) stacked vertically
    - **Icon**: Circle with directional arrow (sent=gray, received=green, refund=blue)
    - **Details**: Name (bold 14px), description + status text below (12px gray)
    - **Amount** (right-aligned): Formatted with currency, green with "+" for received, dark for sent with "−"
    - **Status badge**: Small text — "Completed" (green), "Pending" (yellow), "Failed" (red), "Refunded" (blue)
  - **Transaction detail expand/modal**: Clicking a transaction row should expand it or show a detail panel with:
    - Full transaction details: Transaction ID, date/time, type, from/to names and emails, amount, fee, net amount, payment source, status, description
    - Action buttons (contextual): "Refund" (for received payments), "Cancel" (for pending), "Report a problem" link
  - **Download statement**: "Download" button/link in the header area that triggers a mock CSV download (generates a blob URL with transaction data)

- [ ] **Activity filters enhancement**: Improve the existing filters:
  - **Type filter pills**: "All", "Payments sent", "Payments received", "Withdrawals", "Refunds", "Pending". Active pill is filled blue, inactive is gray outline.
  - **Search**: Debounced search that filters by name, email, description, or transaction ID
  - **Date range**: Two date inputs with calendar icons. When set, only show transactions within range.
  - **Show count**: "Showing X of Y transactions" text below filters
  - **Clear filters**: "Clear all filters" link that resets everything

### Wallet Page

- [ ] **Wallet page redesign**: Improve to match real XayPal wallet layout:
  - **Page header**: "Wallet" (28px bold)
  - **XayPal Balance card** (top, full width): Shows current balance prominently. "Transfer Money" button (withdraw to bank). "Add Money" button (mock — shows a modal explaining how to add money).
  - **Banks and Cards section**:
    - Section header: "Banks and cards" with "Link a card or bank" button (blue pill)
    - **Card display**: Each payment method renders as a visual card-like element:
      - For cards: Show card brand logo area (Visa/Mastercard/Amex icon or text), "····XXXX" last 4, expiry, cardholder name, verified badge (green checkmark + "Confirmed"), default indicator ("Preferred" badge if `isDefault`)
      - For banks: Show bank icon, bank name, account type + last 4, verified status
    - **Set as default**: Click "Set as preferred" option
    - **Remove**: Red "Remove" link on each card, shows confirmation dialog before calling `deletePaymentMethod()`
    - **Verify unverified**: If `verified: false`, show yellow "Confirm your card/bank" CTA that opens micro-deposit verification form (existing implementation is good, keep it)
  - **Add payment method modal**: Improve the existing modal:
    - Tab toggle: "Debit or credit card" / "Bank account"
    - Card tab: Card number (mock: just last 4), Brand selector, Expiry (MM/YY), Billing address (optional)
    - Bank tab: Bank name, Routing number (mock), Account number (mock: just last 4), Account type (Checking/Savings)
    - Submit adds method with `verified: false`

### Invoices Page

- [ ] **Invoices page improvements**:
  - **Status filter tabs** at top: "All", "Draft", "Sent", "Paid", "Overdue", "Cancelled". Active tab underlined blue.
  - **Invoice table**: Enhance columns:
    - Invoice # (blue link text, clickable to view detail)
    - Recipient (name + email)
    - Created date
    - Due date
    - Amount (bold)
    - Status badge: `paid` = green bg, `sent` = blue bg, `draft` = gray bg, `overdue` = red bg, `cancelled` = gray strikethrough
  - **Invoice actions**: Hover on row reveals action icons:
    - Sent/Draft: "Edit", "Send", "Delete"
    - Paid: "View", "Download PDF" (mock)
    - Overdue: "Send reminder", "Cancel"
  - **Empty state**: Show placeholder illustration + "Create your first invoice" CTA when no invoices exist

- [ ] **Invoice detail view**: Clicking an invoice number opens a detail view:
  - Invoice preview showing: From (user name/email), To (recipient name/email), Invoice #, Date, Due Date, Payment Terms
  - Line items table: Description, Qty, Unit Price, Amount
  - Subtotal, Tax, Total
  - Status badge prominently displayed
  - **Actions**: "Mark as Paid" (for sent/overdue), "Send Reminder" (for overdue), "Edit" (for drafts), "Cancel", "Download PDF" (mock)
  - "Mark as Paid" should: update invoice status to `paid`, set `paidDate` to now, create a `invoice_payment` transaction in state, create a notification

- [ ] **Create invoice form improvements**:
  - **From section**: Pre-filled with user's name and email (editable)
  - **Bill To section**: Recipient name field + email field (both required)
  - **Invoice details**: Invoice number (auto-generated, editable), Invoice date (today, editable), Due date (required), Payment terms dropdown ("Net 15", "Net 30", "Net 60", "Due on receipt")
  - **Line items**: Keep existing implementation but add:
    - Amount column (auto-calculated: qty × price)
    - Subtotal row
    - Tax % input → Tax amount auto-calculated
    - **Total** row (bold, larger text)
  - **Note field**: "Note to recipient" textarea
  - **Buttons**: "Save as Draft" (secondary) + "Send Invoice" (primary blue pill)
  - Successful send → navigate back to invoice list with success toast

### Notifications

- [ ] **Notification dropdown/panel**: Clicking the bell icon in the header opens a dropdown panel (not a new page):
  - Panel: 360px wide, max-height 480px, scrollable, positioned below the bell icon
  - Header: "Notifications" title + "Mark all as read" link
  - List of notifications from `state.notifications`, sorted by date (newest first)
  - Each notification row: left-side colored icon (based on type: green for payment_received, blue for payment_sent, red for security, gray for system), title (bold if unread), message text, relative time ("2 hours ago", "3 days ago")
  - Unread notifications have a blue dot indicator and slightly bolder text
  - Clicking a notification: marks it as read via `markNotificationRead(id)`, navigates to `actionUrl` if present
  - "Mark all as read" calls `markAllNotificationsRead()` and updates bell badge count to 0
  - **Bell badge**: Red circle with white number showing count of unread notifications. Hidden when count is 0.

---

## P2 — Secondary Features

Depth features for realism. Implement after P1 is solid.

### Settings Page

- [ ] **Full Settings page**: Replace the placeholder at `/settings` with a real settings page:
  - **Left sidebar/tabs**: "Account", "Security", "Notifications", "Payments"
  - **Account tab**:
    - Profile section: Name, Email, Phone, Address — each with current value shown + "Update" link/button that opens inline edit mode
    - Account type: Shows "Personal" with "Upgrade to Business" button (non-functional)
  - **Security tab**:
    - Password: "Last changed 30 days ago" + "Update" button (mock — shows success toast)
    - 2-Step Verification: Toggle switch (on/off), description text
    - Security questions: "Set up" link
  - **Notifications tab**:
    - Toggle switches for: Email notifications, Push notifications, Marketing emails, Payment confirmations, Monthly statements
    - Each toggle updates `state.settings` via `updateSettings()`
  - **Payments tab**:
    - Auto-accept payments: Toggle
    - Default currency: Dropdown selector (USD, EUR, GBP, CAD)
    - Preferred payment method: Dropdown of linked methods
    - Blocked users: Empty list with "Add" button

### Payment Links Page

- [ ] **Payment Links page improvements**:
  - **List view**: Show existing payment links in a card grid or table:
    - Description, Amount (or "Any amount"), Created date, Times used, Total collected, Status (Active/Inactive)
    - Copy link button (clipboard icon) on each card
    - Toggle active/inactive switch
    - Delete button
  - **Create form**: Keep existing form but add:
    - Preview of what the link page would look like
    - QR code generation (use a simple QR code image placeholder or canvas-based generator)
    - Expiration date option
  - Store payment links in state via `createPaymentLink()` action

### Subscriptions Management

- [ ] **Subscriptions section** (can be a tab on the Wallet page or a separate page):
  - List of active subscriptions from `state.subscriptions`
  - Each shows: Merchant name, amount, frequency ("Monthly" / "Yearly"), next billing date, payment method
  - Status badge: Active (green), Paused (yellow), Cancelled (gray)
  - **Actions**: "Cancel subscription" button → confirmation modal → calls `cancelSubscription(id)`
  - **Empty state**: "No subscriptions found" message

### Resolution Center

- [ ] **Resolution Center page** at `/resolution`:
  - Header: "Resolution Center"
  - Two main sections:
    - "Report a problem" card: "If you have a problem with a transaction, let us know" + "Report a Problem" button
    - "View open cases" list: Shows disputes/claims (seed 1-2 mock disputes)
  - **Report a Problem flow**: Select transaction from a dropdown of recent transactions → Select reason (Item not received, Significantly not as described, Unauthorized transaction) → Add details textarea → Submit → Creates a mock dispute case
  - **Dispute entity**: `{ id, transactionId, reason, description, status: "open"/"under_review"/"resolved"/"closed", createdDate, resolvedDate }`

### Help Page

- [ ] **Help page** at `/help`:
  - Search bar at top: "Search Help"
  - Category cards grid: "Payments", "Wallet", "Account", "Security", "Disputes", "Invoices" — each with an icon and brief description
  - Clicking a category shows a list of mock FAQ items (3-5 per category)
  - FAQ items are expandable accordion: click to expand answer text
  - "Contact Us" section at bottom with phone number and "Message Us" button (non-functional)

### Polish & Micro-interactions

- [ ] **Toast notification system**: Add a toast/snackbar system for success/error feedback:
  - Appears bottom-center or top-right
  - Auto-dismisses after 4 seconds
  - Types: success (green), error (red), info (blue), warning (yellow)
  - Used for: "Payment sent successfully", "Invoice created", "Payment method removed", etc.

- [ ] **Loading states**: Add skeleton loading states / spinners for:
  - Page transitions (brief loading shimmer)
  - Form submissions (button spinner)
  - Transaction processing animation

- [ ] **Empty states**: Add illustrations/messaging for empty scenarios:
  - No transactions: "You haven't made any transactions yet"
  - No contacts: "Add contacts to quickly send and receive money"
  - No invoices: "Create your first invoice to get paid"
  - No payment methods: "Link a card or bank to get started"

- [ ] **Responsive mobile menu**: Improve the existing mobile hamburger menu to match XayPal's mobile web:
  - Slide-in panel from left
  - Full-height, dark blue background
  - Nav items stacked vertically with icons
  - User info section at top (name, email)
  - Close button (X) top-right

---

## Data Seed (implement in createInitialData())

- [x] **User**: 1 record — "Alex Johnson", alex.johnson@email.com, balance $4,250.50, verified personal account, San Francisco address
- [x] **Contacts**: 8 records — Mix of personal contacts (Sarah Smith, Mike Johnson, Emily Chen, David Wilson, Lisa Anderson, Robert Brown, Jennifer Lee) and one business (Tech Gadgets Inc). Each has unique `initials` and `initialsColor`. 3 marked as `isFavorite`.
- [x] **Transactions**: 12 records — Covering last 30 days. Types: 4 payment_sent (Starbucks, Amazon, Sarah Smith, Spotify), 3 payment_received (Mike Johnson dinner split, Acme Corp invoice, Emily Chen concert tix, Robert Brown freelance), 2 withdrawal (Chase Bank), 1 refund (Tech Gadgets), 1 request_sent (David Wilson pending), 1 invoice_payment (Acme Corp). Mix of completed/pending/refunded statuses.
- [x] **Payment Methods**: 3 records — Visa ····4242 (default, verified), Chase Bank ····4422 (verified), Mastercard ····8910 (verified)
- [x] **Invoices**: 4 records — INV-0001 (paid, Acme Corp $1,200), INV-0002 (sent, StartupXYZ $850), INV-0003 (overdue, Freelance Client $2,500), INV-0004 (draft, Local Coffee Shop $175)
- [x] **Notifications**: 5 records — 2 unread (payment received from Mike, security alert), 3 read (invoice paid, account verified, payment sent)
- [x] **Subscriptions**: 3 records — Netflix $15.99/mo, Spotify $9.99/mo, Adobe CC $54.99/mo
- [x] **Payment Links**: 2 records — Consulting Session $100 (used 3x), Donate link open-amount (used 7x)
- [x] **Settings**: Default preferences — English, PT timezone, email notifications on, push on, marketing off

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / Login / Logout**: App starts pre-logged-in as "Alex Johnson". "Log Out" button in nav is non-functional or hidden.
- **Real payment processing**: All sends/receives are instant mock operations
- **Cryptocurrency features**: Bitcoin/Ethereum buying/selling
- **XayPal Credit / Loans**: Financial products
- **Deals and Offers page**: Promotional content, low training value
- **Real file uploads for invoices**: Invoice "Download PDF" can generate a simple text blob
- **Email/SMS sending**: No real communication — all notifications are in-app only
- **Two-factor authentication flows**: Security settings are visual-only toggles
- **International money transfer (Xoom)**: Complex, out of scope
- **XayPal Debit Card management**: Physical card features
