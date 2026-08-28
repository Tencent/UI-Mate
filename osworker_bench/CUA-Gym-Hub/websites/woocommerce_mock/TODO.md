# XooCommerce Admin Mock -- TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

- [x] **Project scaffold**: Vite React app scaffolded, dependencies installed: react-router-dom, recharts, date-fns, lucide-react. Plain CSS, no Tailwind.

- [x] **Global CSS reset and WordPress admin base styles**: `src/styles/wp-admin.css` with full WordPress admin design system per DESIGN.md.

- [x] **App layout -- three-zone structure**: AdminBar (32px, #1d2327), Sidebar (160px, #1d2327 with full nav tree, submenu, collapse toggle), Content area (background #f0f0f1, padding 20px).

- [x] **XooCommerce Activity Panel**: 5 icon tabs (Inbox, Orders, Stock, Reviews, Notices). Badge counts. Dropdowns open on click. Orders panel shows processing orders with "Begin fulfillment" button. Inbox shows notifications. Stock shows low-stock products. Reviews shows recent reviews with approve/spam/trash actions.

- [x] **Routing**: All routes defined in App.jsx with BrowserRouter. RedirectWithQuery preserves ?sid= param.

- [x] **State management**: AppContext with useReducer, dataManager.js with createInitialData() seeding all data per data_model.md. All reducer actions implemented.

- [x] **`/go` endpoint**: Go.jsx renders JSON with initial_state, current_state, state_diff. stateTracker.js computes diffs.

- [x] **Session isolation**: vite.config.js mock-api plugin handles POST /post and GET /state. dataManager.js getSessionId(), storageKey(), initialKey(), fetchCustomState(), initializeData() with sid support.

---

## P1 -- Primary Features

### XooCommerce Home / Dashboard

- [x] **Dashboard page** (`/`): Summary cards row (6 cards with values/changes/trend arrows), line chart (recharts), Top Products and Top Categories leaderboards, Store Activity feed.

- [x] **Dashboard recent activity section**: Recent orders, low-stock alerts, new reviews with icons and relative timestamps.

### Orders

- [x] **Orders list page** (`/orders`): Status filter tabs with counts, search box (debounced 300ms), bulk actions dropdown, sortable table, pagination. Status badges per DESIGN.md.

- [x] **Orders list -- search and filter**: Real-time filtering by status tab, search by order#/name/email. Filters compose.

- [x] **Order detail page** (`/orders/:orderId`): Two-column layout (65/35). Status dropdown, billing/shipping addresses, line items table with totals, refund button. Order notes chronological list with add note form.

- [x] **Order detail -- status change and notes**: Status change auto-adds system note. Admin can add private/customer notes.

### Products

- [x] **Products list page** (`/products`): Admin table with thumbnails, stock status, price (with sale), categories, tags, date. Quick edit inline form. Row actions on hover.

- [x] **Products list -- bulk and quick actions**: Bulk trash, Quick Edit with inline form (title/status/price fields). Update saves to state.

- [x] **Add/Edit product page** (`/products/new` and `/products/:productId`): Vertical tabs (General/Inventory/Shipping/Linked/Attributes/Advanced), product type dropdown, categories checklist, tags pills, image URL input, publish metabox.

- [x] **Product form -- save and validation**: Required name validation, price validation, status change, admin notice on save.

### Customers

- [x] **Customers list page** (`/customers`): Searchable, sortable table with avatar, orders count, total spent, date registered.

- [x] **Customer detail page** (`/customers/:customerId`): Overview card with stats, recent orders table, billing/shipping address cards.

### Analytics

- [x] **Analytics Revenue page** (`/analytics/revenue`): Breadcrumb, date range picker, 6 summary cards (clickable to update chart), dual-line recharts chart (current vs previous year), sortable data table with download button.

- [x] **Analytics Orders page** (`/analytics/orders`): 4 summary cards, line chart, data table.

- [x] **Analytics Products page** (`/analytics/products`): 3 summary cards, products table with sales data.

- [x] **Analytics left sidebar navigation**: Analytics menu expanded with all sub-items when on /analytics/* routes.

### Settings

- [x] **Settings page with tab navigation** (`/settings/*`): Horizontal tabs (General/Products/Tax/Shipping/Payments/Accounts/Emails).

- [x] **Settings -- General tab**: Store address form, General Options (tax/coupons toggles), Currency Options. Save updates state.

- [x] **Settings -- Products tab**: Measurements (weight/dimension units), Reviews toggle. Save updates state.

- [x] **Settings -- Tax tab**: Editable tax rates table with insert/delete rows. Save updates state.

- [x] **Settings -- Shipping tab**: Shipping zones display table. Save button.

- [x] **Settings -- Payments tab**: Payment gateway toggle switches. Toggling updates state. Save button.

---

## P2 -- Secondary Features

- [x] **Coupons list page** (`/coupons`): Admin table with code, type, description, amount, usage, expiry. Expired badge.

- [x] **Product categories page** (`/products/categories`): Two-panel layout. Add form + category table with hierarchy.

- [x] **Product tags page** (`/products/tags`): Two-panel layout. Add form + tags table.

- [x] **Inbox notification panel**: Dropdown from activity panel with read/unread notifications.

- [x] **Stock alerts panel**: Low stock products list from activity panel.

- [x] **Reviews panel**: Recent reviews from activity panel with approve/spam/trash actions.

- [x] **Collapse sidebar toggle**: Sidebar collapses to 36px icon-only mode, persisted in localStorage.

---

## Data Seed (implement in createInitialData())

- [x] **Store settings**: GreenLeaf Organics store object
- [x] **Products**: 15 products (10 simple, 5 variable) across 5 categories, 2 out-of-stock, 3 on-sale, 2 draft
- [x] **Product categories**: 5 categories + 2 subcategories
- [x] **Product tags**: 8 tags
- [x] **Orders**: 25 orders (8 processing, 5 completed, 3 on-hold, 4 pending, 2 cancelled, 2 refunded, 1 failed)
- [x] **Customers**: 12 customers with varied profiles
- [x] **Coupons**: 4 coupons (SAVE10, FREESHIP, WELCOME15, EXPIRED20)
- [x] **Reviews**: 20 reviews (16 approved, 4 on-hold)
- [x] **Analytics data**: 30 daily data points
- [x] **Notifications**: 8 notifications (3 unread, 5 read)
- [x] **Shipping zones**: 3 zones (US, Canada, International)
- [x] **Tax rates**: 3 rates (CA, NY, TX)
- [x] **Payment gateways**: 4 gateways
- [x] **Current user**: Alex Rivera admin

---

## Out of Scope

Dev must NOT implement these (unchanged).
