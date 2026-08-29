# Xtripe Dashboard — Research Summary

## App Overview

**Xtripe Dashboard** (dashboard.stripe.com) is the web-based management console for Xtripe, the leading online payment processing platform. It provides businesses with a comprehensive interface to manage payments, customers, subscriptions, invoices, products, payouts, disputes, and financial reporting. The dashboard is the primary interface through which merchants interact with their Xtripe account.

**Category:** Financial SaaS / Payment Management Dashboard
**Target Users:** Business owners, finance teams, developers, and operations staff managing online payments.

---

## Key User Personas & Primary Workflows

### 1. Business Owner / Finance Manager
- Reviews daily gross volume and revenue on the Home page
- Monitors balance and upcoming payouts
- Views reports summary (gross volume, net volume, dispute activity)
- Exports financial data for accounting

### 2. Operations / Support Staff
- Searches for specific payments by amount, email, or ID
- Issues refunds on individual payments
- Views customer profiles and their payment history
- Manages disputes and submits evidence

### 3. Product Manager / Billing Admin
- Creates and manages products and prices in the Product Catalog
- Sets up subscriptions and billing plans
- Creates and sends invoices
- Manages coupons and discounts

### 4. Developer
- Toggles between Live and Test mode
- Views API logs and webhook events
- Uses the Developers section for integration debugging

---

## UI Layout (Modern Dashboard — 2024+)

### Global Shell
Based on screenshots from dashboard.stripe.com:

**Top Header Bar (height ~48px):**
- Left: Business name dropdown (with logo icon), breadcrumb navigation link
- Center: Search bar (⌘K shortcut), ~400px wide, placeholder "Search..."
- Right: "Create" button (with + icon), Help (? icon), Notifications (bell icon), Settings (gear icon), User avatar

**Navigation Bar (height ~40px, immediately below header):**
- Left-aligned tabs: **Home**, **Payments**, **Balances**, **Customers**, **Products**, **Reports**, **Connect**, **More ▼**
- Right-aligned: **Developers** link, **Test mode** toggle switch (purple when active)
- Active tab highlighted with a colored pill/underline (Home is purple/indigo pill)

**Main Content Area:**
- Full width below nav bar
- White/light gray background (#f6f8fa or similar)
- Content cards with subtle shadows and rounded corners
- Responsive, typically max-width ~1200px centered

### Color Palette (from screenshots)
- **Primary/Brand:** #635BFF (Xtripe indigo/purple) — used for active states, buttons, links
- **Secondary:** #0A2540 (dark navy) — used for text headings
- **Background:** #F6F8FA (light gray) — main content background
- **Card Background:** #FFFFFF (white)
- **Text Primary:** #1A1F36 (very dark navy/black)
- **Text Secondary:** #697386 (medium gray)
- **Text Muted:** #A3ACB9 (light gray)
- **Border:** #E3E8EE (light gray border)
- **Success/Green:** #30B130 — positive amounts, successful status
- **Danger/Red:** #CD3D64 — failed, declined, negative changes
- **Warning/Yellow:** #E5993E — pending, requires attention
- **Info/Blue:** #3D7DE5 — informational badges

### Typography
- **Font Family:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif` (system font stack)
- **Headings:** 600-700 weight, sizes 24px (h1), 20px (h2), 16px (h3)
- **Body:** 400 weight, 14px
- **Small/Labels:** 400 weight, 12px
- **Monospace (IDs, amounts):** `'SF Mono', 'Monaco', 'Inconsolata', monospace`

---

## Complete Feature List

### P0 — Core Shell (Must have for app to render)
1. **App Header** — Business name dropdown, search bar, Create button, Help/Notifications/Settings/User icons
2. **Navigation Bar** — Home, Payments, Balances, Customers, Products, Reports, Connect, More dropdown
3. **Test Mode Toggle** — Purple toggle switch in nav bar right side
4. **Routing** — All major pages linked from nav
5. **Search (Command-K)** — Global search modal with filters

### P1 — Primary Views

#### Home Page
6. **Today Section** — Gross volume chart (real-time line chart), date selector dropdown
7. **Metrics Cards** — Gross volume amount, comparison to previous period date
8. **Balance Card** — Available to pay out amount, "View detail" link
9. **Payouts Card** — Expected today amount, "View detail" link
10. **Reports Summary Section** — Period selector (Last 4 weeks, etc.), "Compared to previous period" toggle
11. **Summary Mini-Charts** — Gross volume (with % change), Net volume from sales (with % change), Dispute activity (with % change)
12. **Customize Button** — Allows adding/removing overview widgets

#### Payments Page
13. **Payments List** — Sortable table with columns: Amount, Description, Customer, Date
14. **Payment Status Badges** — Succeeded (green), Pending (yellow), Failed (red), Refunded (gray)
15. **Filters Bar** — Status, Amount, Date, Currency, Payment method filters
16. **Export Button** — Export filtered data as CSV
17. **Payment Detail Page** — Full payment information with timeline, metadata, refund button
18. **Create Payment** — Manual payment creation form
19. **Issue Refund** — Refund modal with amount input (full/partial)

#### Customers Page
20. **Customers List** — Table with: Name, Email, Created date, # of payments
21. **Add Customer** — Modal/form with name, email, phone, address fields
22. **Customer Detail Page** — Overview, payment methods, payments history, subscriptions, invoices
23. **Edit Customer** — Inline editing of customer fields
24. **Customer Search/Filter** — Search by name/email, filter by created date

#### Balances Page
25. **Balance Overview** — Available, Pending, Reserved amounts
26. **Payouts List** — Table of payouts with status, amount, date, arrival date
27. **Balance Transactions** — Detailed list of all balance-affecting transactions
28. **Payout Schedule** — Shows automatic payout schedule configuration

#### Products Page
29. **Products List** — Grid/table of products with name, price, status (active/archived)
30. **Add Product** — Form with name, description, image, price, recurring settings
31. **Product Detail** — Product info with associated prices
32. **Price Management** — Add/edit prices with currency, amount, recurring interval

#### Billing (under Payments or separate)
33. **Invoices List** — Table with: Number, Customer, Amount, Status, Due date
34. **Create Invoice** — Multi-step form: select customer, add line items, set due date, send
35. **Invoice Detail** — Full invoice view with line items, status timeline, payment info
36. **Invoice Actions** — Send, Void, Mark uncollectible, Download PDF

37. **Subscriptions List** — Table with: Customer, Product, Status, Amount, Current period
38. **Create Subscription** — Form: select customer, product/price, trial settings
39. **Subscription Detail** — Status, current period, upcoming invoice, cancel/pause actions
40. **Subscription Actions** — Cancel, Pause, Update, Resume

### P2 — Secondary Features

#### Disputes
41. **Disputes List** — Table with: Amount, Reason, Status, Due date for response
42. **Dispute Detail** — Evidence submission form, timeline, status tracking

#### Reports
43. **Reports Overview** — Revenue, Refunds, Disputes summary cards
44. **Financial Reports** — Balance summary, Payout reconciliation
45. **Date Range Selector** — Custom date range picker for all reports

#### Connect
46. **Connected Accounts** — List of platform-connected accounts (if applicable)

#### Developers
47. **API Logs** — List of recent API requests with method, endpoint, status, timestamp
48. **Webhooks** — List of webhook endpoints and recent events
49. **Events** — System event log

#### Settings
50. **Business Settings** — Business name, support info, branding
51. **Team Members** — List of team members with roles
52. **Payout Settings** — Bank account, payout schedule

---

## Page-by-Page UI Description

### Home Page
- **Header area:** "Today" label with date; dropdowns for "Gross volume" metric selection
- **Main chart:** Large line chart (~400px tall) showing today's volume over time (12:00 AM to 11:50 PM)
- **Right sidebar cards:** Balance (green amount, "Available to pay out"), Payouts (amount, "Expected today")
- **Reports summary section:** Row of 3 mini cards, each showing: metric label, % change badge (green +X.X% or red -X.X%), large dollar amount, subtitle, small sparkline/area chart
- **Customize button** at top right of reports section

### Payments Page
- **Top bar:** "Payments" heading, tabs (All payments, Succeeded, Refunded, etc.)
- **Filter bar:** Dropdowns for status, date, amount range, etc.
- **Table:** Striped rows, columns: checkbox, Amount ($XX.XX), Status badge, Description, Customer email/name, Date (relative like "Jul 18")
- **Pagination:** Bottom of table
- **Clicking a row** opens Payment Detail page

### Payment Detail Page
- **Breadcrumb:** Payments > py_XXXX
- **Status header:** Large amount, status badge, "Refund" and "..." more actions button
- **Timeline:** Vertical timeline showing: Payment created → Charge succeeded → etc.
- **Details section:** Payment method (card brand + last 4), Risk evaluation, Customer link
- **Metadata section:** Key-value pairs
- **Events section:** All related API events

### Customers Page
- **Header:** "Customers" + "+ Add customer" button
- **Table:** Email, Name, Created (date), Default payment method
- **Search bar:** Inline search/filter at top of table

### Customer Detail Page
- **Header:** Customer name, email, created date
- **Tabs or sections:** Overview, Payments, Subscriptions, Invoices
- **Overview:** Account balance, default payment method, metadata
- **Payments list:** All payments from this customer

### Invoices Page
- **Header:** "Invoices" + "Create invoice" button
- **Table:** Invoice number, Customer, Amount, Status (Draft/Open/Paid/Void/Uncollectible), Created, Due date
- **Status badges:** Color-coded per status

### Products Page
- **Header:** "Products" + "Add product" button
- **Table/Grid:** Product name, pricing, status (Active/Archived), Created date
- **Each product links to detail** with prices list

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities:**
1. **Payments** (PaymentIntent/Charge) — The central transaction object
2. **Customers** — People/businesses that pay
3. **Products** — What's being sold
4. **Prices** — How much products cost (one-time or recurring)
5. **Invoices** — Bills sent to customers
6. **Subscriptions** — Recurring billing relationships
7. **Payouts** — Money sent to the business's bank account
8. **Disputes** — Chargebacks and fraud claims
9. **Refunds** — Money returned to customers
10. **Balance Transactions** — Ledger of all balance-affecting events
11. **Events** — System audit log

---

## Notes on What to Skip

- **Authentication/Login** — App starts pre-logged-in as "Rocket Rides" (a common Xtripe demo business)
- **Real API calls** — All data is mock, stored in localStorage
- **Xtripe.js / Elements** — No actual payment form embedding needed
- **Webhooks** — No real webhook delivery; just show a logs list
- **Connect** — Simplified; just show a list of connected accounts if implemented
- **Tax/Identity/Atlas/Issuing/Capital/Climate** — Out of scope for mock; these are specialized Xtripe products

---

## Screenshot Inventory

| Directory | Contents | Key Observations |
|-----------|----------|------------------|
| `home/` | 5 images | Modern dashboard with top nav, charts, metrics cards. Key: `000002.jpg` shows modern layout clearly |
| `payments/` | 5 images | Payment lists with status badges, amount columns |
| `customers/` | 5 images | Customer list tables |
| `products/` | 5 images | Product catalog views |
| `invoices/` | 5 images | Invoice listing and billing pages |
| `subscriptions/` | 3 images | Subscription management views |
| `balances/` | 5 images | Balance and payout views |
| `sidebar/` | 5 images | Navigation reference |
| `payment_detail/` | 5 images | Payment detail and dashboard views |
| `customer_detail/` | 4 images | Customer detail views |

**Most useful reference screenshots:**
- `home/000002.jpg` — Modern Xtripe Dashboard with top navigation, search, Create button, Test mode toggle
- `invoices/000001.jpg` — Shows the promotional/marketing view of Xtripe's dashboard with chart and balance cards
- `home/000004.jpg` — Older but detailed sidebar layout showing section groupings (General, Transactions, Subscriptions, Relay, Requests)
