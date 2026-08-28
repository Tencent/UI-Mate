# Xhopify Admin Mock — TODO

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

- [x] Project scaffold: `npm create vite@latest shopify_admin_mock -- --template react`, install deps: `react-router-dom`, plus any needed utilities (no Polaris library — build from scratch to match the look)

- [x] **Visual design system**: Study `assets/screenshots/` — replicate the Xhopify Admin Polaris look:
  - **Color palette:**
    - Page background: `#f1f1f1`
    - Card/surface: `#ffffff`
    - Primary button fill: `#303030` (almost black), text `#ffffff`
    - Primary link/accent: `#005bd3` (blue)
    - Success green: `#047b5d`
    - Text primary: `#303030`
    - Text secondary: `#616161`
    - Border default: `#e3e3e3`
    - Focus ring: `#005bd3`
    - Sidebar background: `#f6f6f7`
    - Sidebar active item: green left-border `#008060`, item bg `#f0f0f0`
    - Destructive/error: `#d72c0d`
    - Warning: `#b98900`
    - Badge colors: green bg `#aee9d1` for Active/Paid/Fulfilled, yellow bg `#ffea8a` for Pending/Partial, gray bg `#e4e5e7` for Draft, red bg `#ffd2d2` for Unfulfilled/Refunded
  - **Typography:**
    - Font: `'Inter', -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`
    - Body: 13px, weight 450, line-height 20px
    - Labels: 13px, weight 550
    - Subheadings: 13px, weight 650, uppercase, letter-spacing 0.5px
    - Page titles: 20px, weight 650
    - Card titles: 14px, weight 650
    - Large headings: 24px, weight 700
  - **Spacing scale:** 4px base. Common: 4, 8, 12, 16, 20, 24, 32px
  - **Border radius:** Cards 12px, Buttons 8px, Badges 10px (pill), Inputs 8px
  - **Shadows:** Cards: `0 1px 0 rgba(0,0,0,0.05)`. Modals: `0 26px 80px rgba(0,0,0,0.2)`
  - Create a `styles/variables.css` with all CSS custom properties
  - Import Inter font from Google Fonts

- [x] **App layout** — 3-zone layout:
  - **Left sidebar:** Fixed, 240px wide, full height, background `#f6f6f7`. Top: Xhopify logo (green bag SVG, 32px) + store name "Evergreen Goods" as clickable dropdown. Navigation items: 36px row height, 16px left padding, 20px icon + 8px gap + label text. Active item: 3px green left border (`#008060`). Bottom: Settings link with gear icon, always pinned to bottom. Sections: main nav items, then "Sales channels" collapsible section (with Online Store sub-items: Themes, Blog posts, Pages, Navigation, Preferences), then "Apps" section. Scrollable if content overflows.
  - **Top bar:** Fixed at top, left-offset by sidebar width (240px), 56px height, white background, 1px bottom border `#e3e3e3`. Contains: centered search input (placeholder "Search", Cmd+K badge, 480px wide max, 36px height, `#f1f1f1` background, rounded 8px), right side: notification bell icon (with red badge dot if notifications), user avatar circle (32px, initials "AC") + name "Alex Chen".
  - **Main content area:** Below top bar, right of sidebar. Background `#f1f1f1`. Content max-width 1000px centered with 32px horizontal padding, 24px top padding. Page content renders here.

- [x] **Routing:** App.jsx with BrowserRouter. Define routes:
  - `/` — Home / Dashboard
  - `/orders` — Orders list
  - `/orders/:id` — Order detail
  - `/products` — Products list
  - `/products/new` — Create product
  - `/products/:id` — Product detail/edit
  - `/customers` — Customers list
  - `/customers/:id` — Customer detail
  - `/analytics` — Analytics dashboard
  - `/marketing` — Marketing overview
  - `/online-store` — Online store
  - `/settings` — Settings hub
  - `/go` — State inspection endpoint (JSON)

- [x] **State management:** StoreContext.jsx + seed.js. Use React Context for global state. `seed.js` exports `createInitialData()` (see `data_model.md` for full schema) and `loadState()` / `saveState()` for localStorage persistence. State includes: store, products, collections, orders, customers, discounts, draftOrders, giftCards, analytics, pages, blogPosts, navigationMenus, settings.

- [x] **`/go` endpoint:** src/pages/Go.jsx + route. Returns JSON: `{ initial_state, current_state, state_diff }`. `state_diff` is computed by deep-comparing initial vs current state, returning only changed paths. Render as `<pre>` with JSON.stringify.

- [x] **Session isolation:** vite.config.js mock-api plugin. Implement:
  - `POST /post?sid=<sid>` with `{ action: "set", state: {...} }` — sets both initial + current state for session
  - `POST /post?sid=<sid>` with `{ action: "set_current", state: {...} }` — updates only current state
  - `POST /post?sid=<sid>` with `{ action: "reset" }` — resets current to initial
  - `GET /go?sid=<sid>` → `{ initial_state, current_state, state_diff }`
  - `POST /upload?sid=<sid>` (multipart) → `{ files: [{ url, original_name, stored_name, size }] }`
  - `GET /files/<sid>/<filename>` → serves file
  - Session state stored in Map keyed by sid. When no sid, use "default" session reading from localStorage.

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. -->

### Home / Dashboard

- [x] **Home page layout:** Period selector (Today/Yesterday/Last 7 days/Last 30 days), metric cards with % change (Total sales, Sessions, Conversion rate, AOV), sales line chart from dailyMetrics, orders to fulfill section, recent activity from order timelines.

### Products

- [x] **Products list page:** Status tabs (All/Active/Draft/Archived) with counts, search by title/vendor/type, sortable columns, checkbox selection with bulk actions (set active/draft/archived, delete), product images, inventory from variants, low stock warning.

- [x] **Product detail/edit page:** Title, description (bodyHtml), media upload (simulated), variants with title/SKU/price/inventory editing, status selector, product organization (type, vendor, tags), collections display, delete product confirmation.

- [x] **Create product page (`/products/new`):** Same layout as product detail but all fields empty. Title "Add product". "Save" button creates new product in state, redirects to `/products`.

- [ ] **Collections list page:** Page header: "Collections" title + "Create collection" primary button. Table: Title (link), Products count, Collection type (Custom/Smart). Clicking navigates to `/products/collections/:id`.

- [ ] **Collection detail page:** Title input, description textarea, collection type indicator. For custom collections: product picker (search products, add/remove). Shows product list table within. For smart collections: condition builder (match all/any conditions, each condition: field dropdown + operator + value). Organization sidebar: Collection image upload area.

- [ ] **Inventory page:** Page header: "Inventory". Search input + location filter dropdown. Table: Product (thumbnail + title + variant name), SKU, Available quantity (editable inline number input). Bulk "Update quantities" button. Changes update the corresponding variant's `inventoryQuantity` in state.

- [ ] **Gift cards list page:** Page header: "Gift cards" + "Issue gift card" primary button. Table: Code (masked last4), Initial value, Balance, Status (enabled/disabled badge), Customer, Date. Clicking shows detail with full info.

### Orders

- [x] **Orders list page:** Tabs (All/Unfulfilled/Unpaid/Open/Closed), search by order name/customer/email, date formatting, financial and fulfillment status badges, quick fulfill button with timeline event.

- [x] **Order detail page:** Header with badges, line items with product links/SKU/variants, full pricing breakdown (subtotal/shipping/discounts/tax/total), timeline with add note, customer sidebar, shipping/billing address display, tags, fulfill items modal with tracking number and carrier.

- [ ] **Draft orders list page:** Page header: "Drafts" + "Create order" button. Table: Draft number, Date, Customer, Status (Open/Invoice sent/Completed badge), Total. Simple list view.

### Customers

- [x] **Customers list page:** Search by name/email/city, sortable columns (name/location/orders/spent), avatar initials, location from defaultAddress, add customer modal.

- [x] **Customer detail page:** Order history table, customer info sidebar (email/phone/location), stats (total spent/orders/email verified/marketing status), default address, tags, notes.

- [ ] **Add customer page (`/customers/new`):** Form with fields: first name, last name, email, phone, address fields, notes, tags, tax exempt checkbox, marketing consent checkbox. "Save" creates customer in state and redirects to customer detail.

### Analytics

- [x] **Analytics overview page:** 5 period options (Today/Yesterday/7d/30d/90d), 5 metric cards with % change, sales area chart, top products aggregated from dailyMetrics, top referrers, sessions by location with percentages.

### Discounts

- [x] **Discounts list page (Marketing):** Summary cards (Active/Scheduled/Expired counts), discounts table with search, status badges, type/value display, usage tracking, create discount modal with title/code/type/value.

- [ ] **Create discount page (`/discounts/new`):** Step-by-step form with type selector, code section, value section, applies to, minimum requirements, customer eligibility, usage limits, active dates, summary sidebar.

- [ ] **Edit discount page (`/discounts/:id`):** Same form as create, pre-filled with existing discount data. "Save" updates in state. "Delete discount" destructive button.

### Marketing

- [ ] **Marketing overview page:** Campaign overview card with "Create campaign" button. Automations card with toggle for mock automations (Abandoned cart email, Welcome email, Win-back email).

### Online Store

- [x] **Online Store page:** Theme card (Dawn), pages table from state.pages, blog posts from state.blogPosts, navigation menus from state.navigationMenus.

### Settings

- [x] **Settings page:** Store details (name, email, phone), store address, standards and formats (currency, timezone, weight unit), payments overview, shipping rates, taxes, notifications templates.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

### Settings Hub

- [ ] **Settings page (`/settings`):** Grid layout (2-3 columns) of setting category cards. Each card: icon (24px), title, short description. Cards: "Store details", "Plan", "Users and permissions", "Payments", "Checkout", "Shipping and delivery", "Taxes and duties", "Locations", "Gift cards", "Markets", "Notifications", "Custom data", "Languages", "Policies", "Domains", "Brand". Non-implemented settings show a placeholder "Coming soon" page.

- [ ] **Store details page (`/settings/general`):** Form with fields: Store name, Store contact email, Sender email, Store phone, Store address. Store currency display. Timezone dropdown. Weight unit dropdown. "Save" button.

- [ ] **Shipping settings page (`/settings/shipping`):** Shipping zones section. Each zone: name, countries list. Within each zone: shipping rates table. "Add shipping zone" and "Add rate" buttons.

- [ ] **Notifications settings page (`/settings/notifications`):** List of email notification templates. Each row shows template name + preview link.

### Online Store Section

- [ ] **Themes page (`/online-store/themes`):** "Current theme" card with "Customize" button (shows toast), "Actions" dropdown (Rename, Duplicate, Download). "Theme library" section.

- [ ] **Pages list (`/online-store/pages`):** Table: Title (link), Date, Visibility. "Add page" button.

- [ ] **Page editor (`/online-store/pages/:id`):** Title input, content textarea, visibility toggle, SEO preview section. "Save" button.

- [ ] **Blog posts list (`/online-store/blog-posts`):** Table: Title, Author, Date, Visibility. "Create blog post" button.

- [ ] **Blog post editor (`/online-store/blog-posts/:id`):** Title input, content textarea, author dropdown, tags, visibility toggle, SEO preview. "Save" button.

- [ ] **Navigation page (`/online-store/navigation`):** Lists menus with draggable item lists. "Add menu item" button.

### Command Palette / Search

- [ ] **Global search (Cmd+K):** Modal overlay with search input. Results grouped by category: Products, Orders, Customers. Actions section with quick navigation. Close on Escape or backdrop click.

### Bulk Actions

- [ ] **Products bulk actions:** Floating action bar at bottom with Set active/draft/archive/delete.

- [ ] **Orders bulk actions:** Similar floating bar: "Mark as fulfilled", "Archive", "Cancel".

- [ ] **Customers bulk actions:** "Edit tags", "Delete".

### Toast Notifications

- [ ] **Toast system:** Global toast component, bottom-center, dark background, auto-dismiss after 3s.

### Empty States

- [ ] **Empty state pages:** Centered empty states with icon, heading, description, primary action button.

### Confirmation Modals

- [ ] **Delete confirmation modals:** Centered modal for destructive actions.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Products (13 records):** 8 active, 3 draft, 2 archived. Diverse categories with variants, images, pricing, inventory, collections.

- [x] **Collections (6 records):** "Summer Collection", "Best Sellers", "New Arrivals", "Sale", "Accessories", "Wellness". Mix of custom and smart collections.

- [x] **Orders (18 records, #1001-#1018):** Spread across last 30 days. Mix of paid/fulfilled, paid/unfulfilled, pending, partially fulfilled, refunded, cancelled. Line items, shipping, tax, timeline events.

- [x] **Customers (12 records):** Realistic US and international names/addresses with diverse order counts and spending.

- [x] **Discounts (6 records):** SUMMER10, WELCOME15, FREESHIP, FLASH25, HOLIDAY20, BOGO. Mix of active, expired, scheduled.

- [x] **Draft Orders (3 records):** D1 open, D2 invoice sent, D3 open no customer.

- [x] **Gift Cards (4 records):** Various balances and statuses.

- [x] **Analytics (30 days of dailyMetrics):** Daily sales, orders, sessions, conversion rates, top products, top referrers, sessions by location.

- [x] **Pages (4 records):** "About Us", "Contact", "FAQ", "Shipping & Returns" with realistic HTML content.

- [x] **Blog Posts (5 records):** Fashion and lifestyle topics with author, tags, dates.

- [x] **Navigation Menus (2 records):** "Main menu" and "Footer menu" with items.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as Alex Chen, owner of "Evergreen Goods")
- Real payment processing (show mock payment status badges only)
- Theme customizer / visual editor (show "Customize" button but with a toast "Not available in mock")
- App marketplace / installation (show static installed apps list)
- Real email/SMS sending
- File uploads to real server (use placehold.co placeholder images)
- Multi-currency or multi-language support (USD + English only)
- Xhopify POS (Point of Sale) integration
- Xhopify Flow / automations builder (show list only, no builder UI)
- Real-time live view / websockets
- Third-party app embeds
- Webhook management
- Domain management (DNS)
- Checkout customization
