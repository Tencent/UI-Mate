# Xtripe Dashboard Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2025-03-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest stripe_dashboard_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `recharts` (for charts), `date-fns` (for date formatting). No Tailwind — use plain CSS to match Xtripe's custom design system.

- [x] **Visual design system**: Create `src/styles/variables.css` with CSS custom properties extracted from `assets/screenshots/home/000002.jpg` and `assets/screenshots/invoices/000001.jpg`. Exact values:
  - `--color-primary`: `#635BFF` (Xtripe indigo/purple — active nav items, primary buttons, links)
  - `--color-primary-light`: `#7A73FF` (hover state)
  - `--color-primary-dark`: `#4B45C6` (pressed state)
  - `--color-background`: `#F6F8FA` (main page background, light gray)
  - `--color-surface`: `#FFFFFF` (card backgrounds)
  - `--color-text-primary`: `#1A1F36` (headings, primary text — very dark navy)
  - `--color-text-secondary`: `#697386` (secondary text, descriptions — medium gray)
  - `--color-text-muted`: `#A3ACB9` (timestamps, tertiary text)
  - `--color-border`: `#E3E8EE` (borders, dividers)
  - `--color-success`: `#30B130` (succeeded badges, positive changes)
  - `--color-danger`: `#DF1B41` (failed badges, negative changes, destructive actions)
  - `--color-warning`: `#E5993E` (pending badges, warnings)
  - `--color-info`: `#3D7DE5` (informational)
  - `--font-family`: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`
  - `--font-mono`: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace`
  - `--font-size-xs`: `11px`, `--font-size-sm`: `12px`, `--font-size-base`: `14px`, `--font-size-md`: `16px`, `--font-size-lg`: `20px`, `--font-size-xl`: `24px`, `--font-size-2xl`: `28px`
  - `--font-weight-normal`: `400`, `--font-weight-medium`: `500`, `--font-weight-semibold`: `600`, `--font-weight-bold`: `700`
  - `--spacing-xs`: `4px`, `--spacing-sm`: `8px`, `--spacing-md`: `12px`, `--spacing-base`: `16px`, `--spacing-lg`: `20px`, `--spacing-xl`: `24px`, `--spacing-2xl`: `32px`, `--spacing-3xl`: `48px`
  - `--radius-sm`: `4px`, `--radius-md`: `6px`, `--radius-lg`: `8px`, `--radius-xl`: `12px`
  - `--shadow-sm`: `0 1px 3px rgba(0,0,0,0.08)`, `--shadow-md`: `0 2px 8px rgba(0,0,0,0.1)`, `--shadow-lg`: `0 4px 16px rgba(0,0,0,0.12)`
  - `--header-height`: `52px`, `--nav-height`: `44px`

- [x] **App layout** (see `assets/screenshots/home/000002.jpg`): The modern Xtripe Dashboard uses a **top navigation** layout (NOT a left sidebar). Structure:
  - **Header bar** (52px height, white background, bottom border `#E3E8EE`): Contains from left to right:
    - Business logo (small 20x20 icon) + business name "Rocket Rides" as dropdown button (gray text, down chevron)
    - Center: Search bar input ~420px wide, left-aligned magnifying glass icon, placeholder "Search..." with "Cmd+K" hint badge on right side. Light gray background `#F1F3F5`, rounded `--radius-lg`, 36px height.
    - Right section: "Create" button (white background, border, "+" icon left, text "Create", dropdown arrow) | Help icon (? circle) | Notification bell icon | Settings gear icon | User avatar circle (32x32, initials or image)
  - **Navigation bar** (44px height, white background, bottom border `#E3E8EE`):
    - Left-aligned tabs with horizontal spacing: **Home** | **Payments** | **Balances** | **Customers** | **Products** | **Reports** | **Connect** | **More**
    - Active tab has purple/indigo pill background (`--color-primary` at 10% opacity) and `--color-primary` text color
    - Inactive tabs: `--color-text-secondary` text, on hover background `#F6F8FA`
    - Right-aligned: "Developers" text link (gray) | "Test mode" label + toggle switch (purple when on, gray when off)
  - **Main content** (below nav, `--color-background` bg, 100% width): content centered, max-width ~1200px with 32px horizontal padding, 24px top padding

- [x] **Routing**: `App.jsx` with `BrowserRouter`, routes:
  - `/` -> Home page (default)
  - `/payments` -> Payments list
  - `/payments/:id` -> Payment detail
  - `/balances` -> Balances overview
  - `/customers` -> Customers list
  - `/customers/:id` -> Customer detail
  - `/products` -> Products list
  - `/invoices` -> Invoices list
  - `/subscriptions` -> Subscriptions list
  - `/balance` -> Balance overview
  - `/reports` -> Reports overview
  - `/disputes` -> Disputes list
  - `/settings` -> Settings page
  - `/go` -> State inspection endpoint (JSON output)

- [x] **State management**: `AppContext.jsx` + `src/utils/dataManager.js`. The dataManager exports `createInitialData()` (see `data_model.md` for full schema), `loadState()`, `saveState()`, `resetState()`. AppContext wraps the entire app, provides `state` and `dispatch` (useReducer pattern). Reducer handles actions: `SET_STATE`, `UPDATE_PAYMENT`, `ADD_PAYMENT`, `ADD_CUSTOMER`, `UPDATE_CUSTOMER`, `DELETE_CUSTOMER`, `ADD_PRODUCT`, `UPDATE_PRODUCT`, `ADD_INVOICE`, `UPDATE_INVOICE`, `ADD_SUBSCRIPTION`, `UPDATE_SUBSCRIPTION`, `CANCEL_SUBSCRIPTION`, `ADD_REFUND`, `UPDATE_DISPUTE`, `TOGGLE_TEST_MODE`, `SET_SEARCH_QUERY`. State persisted to localStorage under key `stripe_dashboard_state`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` — renders raw JSON (white background, monospace font) with `{ initial_state, current_state, state_diff }`. Computes state_diff by deep-comparing initial vs current, showing only changed keys. Register as route `/go`.

- [x] **Session isolation**: `vite.config.js` — add mock-api plugin that intercepts:
  - `POST /post?sid=<sid>` — accepts `{ action: "set"|"set_current"|"reset", state: {...} }`. "set" replaces both initial and current state. "set_current" updates only current state. "reset" restores initial state.
  - `GET /state?sid=<sid>` — returns `{ initial_state, current_state, state_diff }`
  - `GET /go?sid=<sid>` — alias for `/state`
  - `POST /upload?sid=<sid>` — multipart form upload, stores files, returns `{ files: [{ url, original_name, stored_name, size }] }`
  - `GET /files/:sid/:filename` — serves uploaded files
  - In `dataManager.js`, add `getSessionState(sid)`, `setSessionState(sid, state)`, `resetSession(sid)` helpers that namespace localStorage by session ID.

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. These are the essential interactive workflows for agent training. -->

### Home Page

- [x] **Today section header**: "Today" heading left-aligned, right side shows date. Below it, metric selectors and volume display.

- [x] **Gross volume chart**: Large area/line chart showing today's volume over time with recharts AreaChart. Hover tooltip with time + exact amount.

- [x] **Balance card** (right side of Today section): White card, amount, "Available to pay out", "View detail" link navigates to `/balances`.

- [x] **Payouts card** (below Balance card): White card, amount, "Expected today", "View detail" link navigates to `/balances`.

- [x] **Reports summary section**: Below Today section. 3 equal-width summary cards (Gross volume, Net volume, Dispute activity) each with change badge, amount, sparkline chart.

### Payments Page

- [x] **Payments list page header**: "Payments" heading, "Create payment" button, "Export" button. Filter tabs: "All" | "Succeeded" | "Pending" | "Failed" | "Refunded".

- [x] **Payments filter bar**: Filter tabs implemented (All/Succeeded/Pending/Failed/Refunded).

- [x] **Payments table**: Full-width table with Amount, Status, Description, Customer, Date columns. Rows clickable to navigate to `/payments/:id`. Pagination at bottom.

- [x] **Create payment modal**: Triggered by "Create payment" button. Modal overlay with form: Amount, Customer dropdown, Description. On submit: creates new payment in state.

- [x] **Payment detail page**: Route `/payments/:id`. Breadcrumb navigation. Amount heading with status badge. Payment details card with key-value pairs. Timeline section. Sidebar with customer info and metadata.

- [x] **Refund modal**: Triggered from Payment detail "Refund" button. Amount input, confirms refund. Updates payment amount_refunded and creates refund in state.

### Customers Page

- [x] **Customers list page**: "Customers" heading, "+ Add customer" button. Search input. Table with Name, Email, Total spent, Payments, Created columns. Rows link to `/customers/:id`.

- [x] **Add customer modal**: Form with Name, Email, Phone, Description. Creates Customer with `cus_` prefixed ID.

- [x] **Customer detail page**: Route `/customers/:id`. Breadcrumb. Customer details card. Recent payments table. Subscriptions section. Sidebar with balance and metadata.

- [x] **Edit customer**: From customer detail "Edit" button, modal pre-filled with current values. Updates customer in state.

- [x] **Delete customer**: Confirmation dialog, removes customer from state, navigates back to customers list.

### Balances Page

- [x] **Balances overview**: Route `/balances`. 3 metric cards (Available, Pending, Reserved). Tab navigation: Overview | Payouts | Transactions. Payouts table and balance transactions table.

### Products Page

- [x] **Products list page**: "Products" heading, "+ Add product" button. Table with Name, Pricing, Status, Created columns.

- [x] **Add product form**: Modal with Name, Description, Price, Billing interval. Creates Product + Price objects.

- [x] **Product detail page**: Route `/products/:id`. Product info, prices section, edit/archive actions.

### Invoices Page

- [x] **Invoices list page**: "Invoices" heading, "Create invoice" button. Filter tabs: All | Draft | Open | Paid | Uncollectible | Void. Table with Number, Customer, Amount, Status, Due date, Created columns. Inline actions (Finalize, Mark paid, Void).

- [x] **Create invoice page**: Modal with Customer, Amount, Description. Creates Invoice with status "draft".

- [x] **Invoice detail page**: Route `/invoices/:id`. Invoice header with status-dependent actions. Invoice details card, line items, timeline.

### Subscriptions Page

- [x] **Subscriptions list page**: "Subscriptions" heading. Filter tabs: All | Active | Trialing | Past due | Canceled | Paused. Table with Customer, Plan, Status, Current period, Created columns. Cancel button for active subscriptions.

- [x] **Create subscription modal/page**: Form with Customer, Product, Price, Quantity. Creates Subscription + first Invoice.

- [x] **Subscription detail page**: Route `/subscriptions/:id`. Product + customer info, status badge. Cancel/Pause/Update actions. Invoices and events timeline.

- [x] **Cancel subscription dialog**: Confirm modal with "Cancel immediately" / "Cancel at end of billing period" options.

---

## P2 — Secondary Features

<!-- Depth and realism. Implement after P1 is solid. -->

### Search

- [ ] **Global search modal**: Triggered by clicking search bar or Cmd+K. Results grouped by type (Payments, Customers, Invoices, Products). Keyboard navigation.

### Disputes Page

- [x] **Disputes list page**: Route `/disputes`. Table with Amount, Status, Reason, Payment ID, Evidence Due columns. "Respond" button for needs_response disputes.

- [ ] **Dispute detail page**: Route `/disputes/:id`. Dispute reason, response deadline, evidence submission form. Original payment details.

### Reports Page

- [x] **Reports overview**: Route `/reports`. Gross volume and Net volume charts with recharts. Key metrics section.

### Developers Page

- [ ] **Developers overview**: Route `/developers`. Tabs: API logs | Events | Webhooks.

### Settings Page

- [x] **Settings page**: Route `/settings`. Tabs: Account Details | API Keys | Webhooks | Tax. Business info form, API keys display, webhook config.

### Test Mode Toggle

- [x] **Test mode functionality**: Toggle in nav bar. Banner appears when test mode is on.

### Create Button Dropdown

- [x] **Create button menu**: "Create +" button in header with dropdown: Payment, Invoice, Customer, Product.

### Toast Notifications

- [ ] **Toast notification system**: Global toast manager. Bottom-right, auto-dismiss. Types: success, error, info.

### Table Features

- [ ] **Bulk actions**: Checkbox selection with floating action bar.

- [ ] **Empty states**: Centered empty state with icon, heading, description, and action button when list/table is empty.

### Navigation Polish

- [x] **"More" dropdown in nav**: Dropdown with Billing, Subscriptions, Disputes links.

- [ ] **Breadcrumb navigation**: On detail pages. Parent section link + current item.

- [ ] **Keyboard shortcuts**: Press `?` for shortcuts help modal.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for complete field definitions. -->

- [x] **Business & User**: Business "Rocket Rides" (rocketrides.io), user "Alex Johnson" (alex@rocketrides.io, administrator role).

- [x] **Customers**: 18 customers with realistic names (mix of personal/business), emails, some with addresses, some with multiple payment methods.

- [x] **Products & Prices**: 7 products with 10 prices total (Starter Plan, Pro Plan, Enterprise Plan, API Access, One-time Setup Fee, Data Export Add-on, Priority Support).

- [x] **Payments**: 45 payments spread over last 30 days. Mix: 32 succeeded, 5 pending, 4 failed, 2 partial refund, 2 full refund.

- [x] **Invoices**: 22 invoices. Status distribution: 2 draft, 3 open, 14 paid, 2 void, 1 uncollectible.

- [x] **Subscriptions**: 10 subscriptions. Status: 6 active, 1 past_due, 1 canceled, 1 trialing, 1 paused.

- [x] **Payouts**: 12 payouts over last 60 days. Status: 9 paid, 2 in_transit, 1 pending.

- [x] **Disputes**: 4 disputes. Status: 1 needs_response, 1 under_review, 1 won, 1 lost.

- [x] **Refunds**: 6 refunds. Mix of full and partial refunds.

- [x] **Balance Transactions**: 55+ entries covering charges, refunds, payouts, fees.

- [x] **Events**: 35 events covering recent activity.

- [x] **Dashboard metrics**: Pre-computed in `metrics` object with today's gross volume, summary data, and chart data.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- **Authentication / login** — App starts pre-logged-in as Alex Johnson (alex@rocketrides.io), administrator at Rocket Rides
- **Real payment processing** — No actual Xtripe API calls; all data is mock
- **Xtripe.js / Elements** — No real payment form embedding
- **Connect platform** — Simplified page only if time permits; no real connected accounts flow
- **Tax / Identity / Atlas / Issuing / Financial Connections / Capital / Climate** — These are specialized Xtripe products, out of scope
- **Webhooks delivery** — Just show a logs list, no real webhook sending
- **Real file uploads** — Image upload placeholders only (no actual server-side storage beyond the session API)
- **Email sending** — "Send invoice" and "Send receipt" actions just update state and show toast
- **PDF generation** — "Download PDF" shows a toast or opens a placeholder
- **Mobile responsive** — Desktop-only layout is fine (min-width ~1024px)
