# XayPal Mock — Research Summary

## App Overview

XayPal is a digital financial services platform that enables users to send/receive money, manage payment methods, track transactions, create invoices, and manage subscriptions. Founded in 1998, it is one of the world's largest online payment processors operating in 200+ markets and 140 currencies.

This mock replicates the **XayPal personal account web dashboard** (desktop) — the logged-in experience at `paypal.com/myaccount/`.

## Key User Personas

1. **Personal User** (primary): Sends money to friends/family, receives payments, tracks spending, manages linked cards/banks
2. **Freelancer/Small Business**: Creates and sends invoices, generates payment links, tracks income/expenses
3. **Online Shopper**: Uses XayPal balance for purchases, tracks orders, manages subscriptions, opens disputes

**Default mock user**: Personal user with some freelancing activity (has both sent payments and invoices).

## Navigation Structure (from screenshots)

### Top Navigation Bar (dark blue/navy #003087 background)
From `dashboard_01.jpg` and `dashboard_03.jpg`, the real XayPal dashboard has:

**Primary Nav (horizontal, white text on dark blue bar):**
- **XayPal logo** (white "P" icon, left-aligned)
- **Dashboard** (or "Summary")
- **Finances** (newer versions)
- **Send & Request** (or "Send and Request")
- **Deals and Offers** (or "Deals")
- **Wallet**
- **Activity**
- **Help**

**Right side of nav:**
- Notification bell icon (with badge count)
- Settings gear icon
- LOG OUT button
- User avatar (some versions)

### Page Layout Pattern
- **Header**: Full-width dark blue (#003087) navigation bar, ~64px height
- **Body**: Light gray background (#f5f7fa or #f0f2f5)
- **Content**: Max-width container (~1200px), centered
- **Dashboard uses 2-column layout**: Main content (~65%) + Sidebar (~35%)

## Color Palette (from screenshots)

| Color | Hex | Usage |
|-------|-----|-------|
| XayPal Dark Blue | `#003087` | Top nav, primary brand, buttons |
| XayPal Blue | `#0070ba` | Links, secondary buttons, active states |
| XayPal Light Blue | `#009cde` | Hover states, accents |
| White | `#ffffff` | Card backgrounds, text on dark bg |
| Light Gray BG | `#f5f7fa` | Page background |
| Dark Text | `#2c2e2f` | Primary text |
| Medium Gray | `#6c7378` | Secondary text, descriptions |
| Green | `#019c34` | Positive amounts (received), success |
| Red | `#c9302c` | Negative amounts (errors), alerts |
| Yellow/Amber | `#e8a317` | Pending status, warnings |

## Typography
- **Font family**: XayPal Sans (fallback: Helvetica Neue, Helvetica, Arial, sans-serif)
- **Balance display**: ~40px bold
- **Page headings**: 24-28px bold
- **Section headings**: 18-20px semibold
- **Body text**: 14-16px regular
- **Small text/labels**: 12-13px

## Page-by-Page Feature Inventory

### 1. Dashboard / Summary (Home Page) — P0
**Layout**: Two-column (main + sidebar)

**Main Column:**
- **XayPal Balance Card**: White card showing "$X,XXX.XX" in large bold text, "Available" label below, three-dot menu (⋮) in top-right, "Transfer Money" button (blue, rounded)
- **Recent Activity**: Section header "Recent activity", list of last 5 transactions, each showing: avatar/icon, name, date, description, amount (green + for received, no prefix for sent), "View" link. Transaction rows are clickable.

**Sidebar:**
- **Send Again**: Row of circular avatars for recent contacts (with names below), plus a "Search" circle icon. Three-dot menu in header.
- **Banks and Cards**: List of linked payment methods showing: bank/card icon, name (e.g., "CREDIT UNION 1"), type + last 4 digits (e.g., "Checking ••••1963"), brand logo for cards (Visa, Mastercard). Three-dot menu in header.

### 2. Send & Request Page — P0
**Layout**: Tabbed interface with sub-tabs

**Sub-tabs (horizontal):**
- **Send** (default active, blue underline)
- **Request**
- **Contacts**
- **More**

**Send Tab:**
- "Send money" heading
- Large text input: "Name, email or mobile number"
- "Next" button (gray/disabled until input provided)
- "How it works" help link with ? icon
- **Recent Contacts**: Row of circular avatars with initials (color-coded), names below
- "Manage contacts" link at bottom

**Sidebar (right):**
- "Send to a bank account" — with bank icon, "Over 90 destination countries"
- "Send cash for pick up" — "Over 110 destination countries"
- "Send an invoice" — "Customize, track, and send invoices"
- "Send a digital gift card" — "Choose from over 300 gift card brands"

**Request Tab:**
- Similar form but for requesting money
- Recipient input field
- Amount field
- Note field

**Amount Step (after selecting recipient):**
- Large centered amount input with currency symbol
- Currency selector dropdown
- "What's this for?" note textarea
- "Continue" / "Send Payment" button (rounded, blue)

### 3. Activity Page — P1
**Layout**: Full-width transaction list with filters

**Header Area:**
- "Activity" page title
- Date range filter: "Between: [date] to [date]" with calendar pickers

**Transaction Table:**
- Columns: Date, Type, Name/Email, Status, Detail, Order Status/Actions, Gross
- Each row shows: date, transaction type (Payment From, Payment To), name, status icon (✓ or ✗), "View" link, amount
- Rows are clickable to expand/view details

**Filter Options:**
- All transactions
- Payments
- Withdrawals
- Refunds
- Date range selection
- Search by name/description

### 4. Wallet Page — P1
**Layout**: List of linked payment methods

**Sections:**
- **Banks and Cards**: Grid/list of linked accounts
  - Each card shows: card brand logo, card type, last 4 digits, expiry date, verified/unverified status
  - Each bank shows: bank icon, bank name, account type, last 4 digits
- **Link a card or bank** button
- **XayPal Balance**: Shown as a payment method
- Remove/edit options on hover

**Add Payment Method Modal:**
- Card number, expiry, CVV, billing address fields
- Or bank account: routing number, account number, account type

### 5. Invoices Page — P1
**Layout**: List view + create form

**Invoice List:**
- Table with columns: Invoice #, Recipient, Date, Amount, Status (Paid, Sent, Draft, Overdue)
- Status badges: green for Paid, yellow for Sent/Pending, red for Overdue, gray for Draft
- Search and filter options
- "Create Invoice" button

**Create Invoice Form:**
- Bill To (email)
- Due Date picker
- Invoice items table: Description, Quantity, Unit Price, Amount
- Add item row button
- Subtotal, Tax, Total calculation
- "Send Invoice" and "Save as Draft" buttons

### 6. Settings Page — P2
**Sections:**
- Account settings (name, email, phone, address)
- Security (password, 2-step verification)
- Notifications preferences
- Payment preferences (auto-accept payments, currency conversion)
- Merchant/selling tools

### 7. Resolution Center — P2
**Features:**
- Report a problem
- Open disputes
- View dispute status (Open, Under Review, Resolved, Closed)
- Types: Transaction issues, Unauthorized activity, Disputes, Claims

### 8. Help Page — P2
- Search help articles
- Contact options
- FAQ categories

## Interactions Summary

### Core CRUD Operations
- **Send Money**: Select recipient → Enter amount → Add note → Confirm → Success
- **Request Money**: Select recipient → Enter amount → Add note → Send request
- **Create Invoice**: Fill form → Add line items → Send or Save Draft
- **Add Payment Method**: Enter card/bank details → Verify → Link
- **Remove Payment Method**: Click remove → Confirm deletion

### Filtering & Search
- Activity page: filter by type, search by name, date range
- Invoice page: filter by status, search
- Contacts: search by name/email

### State-Changing Actions
- Send money (decreases balance, creates transaction)
- Receive money (increases balance, creates transaction)
- Create/send invoice (adds to invoice list)
- Mark invoice as paid (updates status)
- Add/remove payment method (updates wallet)
- Read notification (marks as read, decrements badge)

## What to Skip (Out of Scope)
- **Authentication**: App starts pre-logged-in as default user
- **Real payment processing**: All transactions are mock/instant
- **Deals and Offers page**: Low training value, mostly promotional content
- **Cryptocurrency features**: Complex, not core to training
- **Help page**: Would require extensive content, low interaction value
- **Email/SMS notifications**: No real communication
- **XayPal Credit/Loans**: Financial product-specific, out of scope

## Screenshots Reference

| File | Description |
|------|-------------|
| `dashboard_01.jpg` | XayPal dashboard — balance card, recent activity, send again contacts, banks and cards sidebar. Shows nav: Dashboard, Finances, Send and Request, Deals, Wallet, Activity, Help |
| `dashboard_02.jpg` | XayPal homepage navigation mega-menu: Personal (Shopping & Rewards, Send & Receive, Manage Your Money) |
| `dashboard_03.jpg` | Send & Request page — Send tab with recipient input, contact avatars, sidebar options (bank transfer, invoice, gift card) |
| `dashboard_04.jpg` | Generic admin dashboard (less relevant) |
| `dashboard_05.jpg` | Older XayPal design — shows balance, action buttons (Send Money, Request Money, Withdraw Money, Products & Services), activity table with Date/Type/Name/Status/Detail/Gross columns |
| `settings_01.jpg` | WooCommerce XayPal settings (not XayPal native, less relevant) |
| `settings_02.jpg` | XayPal settings reference |
| `settings_03.jpg` | XayPal settings reference |
| `resolution_01.jpg` | Resolution Center overview — types of issues: Transaction issues, Unauthorized activities, Account limitations, Disputes, Claims, Chargebacks |
| `resolution_02.jpg` | Resolution center reference |
| `resolution_03.jpg` | Resolution center reference |
