# Xhopify Admin Mock — Research Summary

## App Overview

**Xhopify Admin** (admin.shopify.com) is the centralized back-office dashboard for Xhopify merchants. It is where store owners manage every aspect of their e-commerce business: products, orders, customers, inventory, analytics, marketing, discounts, and store settings. The admin panel is a web application (also available as a mobile app) that serves as the command center for running an online store.

**Category:** E-commerce admin panel / back-office management
**Primary users:** Online store owners, store managers, fulfillment staff
**URL pattern:** `https://admin.shopify.com/store/<store-name>/`

---

## Key User Personas & Workflows

### 1. Store Owner (Primary)
- **Daily:** Review dashboard metrics (sales today, orders, visitor count), check new orders, respond to customer inquiries
- **Weekly:** Add/edit products, create discount codes, review analytics reports, manage inventory
- **Monthly:** Review marketing campaigns, adjust settings, manage staff accounts

### 2. Fulfillment Staff
- **Daily:** View unfulfilled orders, mark orders as fulfilled, print packing slips
- **Actions:** Filter orders by fulfillment status, bulk actions on orders

### 3. Marketing Manager
- **Weekly:** Create discount codes, set up marketing campaigns, review analytics
- **Actions:** Navigate Marketing and Discounts sections

---

## Sidebar Navigation Structure (Modern 2024/2025 Admin)

The Xhopify admin uses a **left sidebar** navigation with the following sections:

### Top Bar
- **Xhopify logo** (green bag icon) — top-left
- **Store name dropdown** — next to logo (allows switching stores)
- **Search bar** — centered, prominent (Cmd+K shortcut)
- **Setup guide** button — top-right area
- **Notification bell** — with red badge count
- **User avatar + name** — far right

### Left Sidebar (240px wide, light gray bg `#f1f1f1`)
1. **Home** (house icon) — Dashboard/overview
2. **Orders** (document icon) — Order list, draft orders, abandoned checkouts
3. **Products** (tag icon) — Product list, inventory, transfers, collections, gift cards
4. **Customers** (person icon) — Customer list and segments
5. **Content** (file icon) — Files, Metaobjects (newer admin versions)
6. **Finances** (dollar icon) — Billing (newer versions)
7. **Analytics** (bar chart icon) — Reports, Live View
8. **Marketing** (megaphone icon) — Campaigns, Automations
9. **Discounts** (percent icon) — Discount codes and automatic discounts

### Sales Channels Section (collapsible)
- **Online Store** — sub-items: Themes, Blog posts, Pages, Navigation, Preferences

### Apps Section (collapsible)
- List of installed apps

### Bottom
- **Settings** (gear icon) — always at bottom of sidebar

---

## Feature List by Priority

### P0 — Core (App Cannot Render Without)
1. App shell with sidebar navigation, topbar, and main content area
2. Routing between major sections
3. State management with dataManager.js
4. `/go` endpoint for state inspection
5. Session isolation via mock API

### P1 — Primary Features (Core Workflows)

#### Home / Dashboard
- Sales summary cards: Today's sales ($), total orders, visitors, conversion rate
- Sales chart (line graph, last 7/30/90 days)
- Recent orders list (mini-table)
- Quick action buttons: "Add product", "Create order"
- Activity feed / setup guide checklist

#### Products
- **Product List View:** Sortable/filterable table with columns: checkbox, thumbnail image, title, status badge (Active/Draft/Archived), inventory count, type, vendor. Search bar. Filter pills (status, type, vendor, tagged with). Bulk actions on selected. "Add product" button.
- **Product Detail/Edit Page:** Title input, description rich text editor, media/images section (drag-to-reorder thumbnails), pricing section (price, compare-at price, cost per item), inventory section (SKU, barcode, quantity), shipping section (weight), variants section (Size, Color options → variant table with columns: variant name, price, quantity, SKU, edit/delete buttons), Organization sidebar (product type dropdown, vendor dropdown, collections multi-select, tags input), Status sidebar (Active/Draft selector), Sales channels checkboxes.
- **Collections List:** Table with title, products count, conditions. "Create collection" button.
- **Inventory Page:** Table with product/variant, SKU, available quantity. Bulk adjust quantities.
- **Gift Cards Page:** List of gift cards with code, balance, status.

#### Orders
- **Orders List View:** Filterable table with columns: checkbox, order number (#1001), date, customer name, total amount, payment status badge (Paid/Pending/Refunded), fulfillment status badge (Fulfilled/Unfulfilled/Partially fulfilled), items count, delivery method. Tabs: All, Unfulfilled, Unpaid, Open, Closed. Search + date range filter. Bulk actions. "Create order" button.
- **Order Detail Page:** Two-column layout. Left: order items list (product image, title, variant, qty × price), fulfillment card (Unfulfilled badge, item list, "Fulfill items" button), payment summary (subtotal, shipping, discount, tax, total, paid/refund amounts), timeline of events. Right sidebar: Notes textarea, customer card (name linked, email, phone, order count, total spent), shipping address card, billing address card, tags, fraud analysis section.
- **Draft Orders:** Similar to orders but for manually created quotes.

#### Customers
- **Customer List View:** Table with name, email, location (city, country), orders count, amount spent. Search. Segment filters (e.g., "Email subscribers", "Repeat customers"). "Add customer" button.
- **Customer Detail Page:** Name heading, contact info (email, phone), default address, order history list (embedded mini-table), notes, tags, tax exemptions, marketing consent checkboxes, timeline.

#### Analytics
- **Overview Dashboard:** Date range selector (Today/Yesterday/Last 7 days/Last 30 days/Custom). Key metrics cards: Total sales, Online store sessions, Returning customer rate, Conversion rate, Average order value. Line charts for sales over time. Top products table. Top referrers. Sessions by location.
- **Reports List:** Table of available reports by category (Sales, Customers, Behavior, Marketing, Finances).

#### Discounts
- **Discounts List:** Table with code/title, status badge (Active/Scheduled/Expired), type (percentage/fixed/free shipping), usage count. "Create discount" button.
- **Create Discount Page:** Discount type selector (Amount off products, Amount off order, Buy X get Y, Free shipping). Code input (or auto-generate). Value input (%, $). Applies to (all/specific collections/specific products). Minimum requirements (none, min purchase amount, min quantity). Customer eligibility. Usage limits. Active dates (start/end).

#### Marketing
- **Marketing Overview:** Campaign performance cards. "Create campaign" button.
- **Campaigns List:** Table with campaign name, status, channel, clicks, orders, sales.

### P2 — Secondary Features (Depth & Realism)

#### Settings
- **Settings Hub:** Grid of setting categories: Store details, Plan, Users and permissions, Payments, Checkout, Shipping and delivery, Taxes and duties, Locations, Gift cards, Markets, Notifications, Custom data, Languages, Policies, Domains, Brand.
- **Store Details Page:** Store name, email, phone, address, currency, timezone, weight unit.
- **Shipping and Delivery:** Shipping zones with rates table.
- **Notifications:** Email template list.

#### Online Store (Sales Channel)
- **Themes Page:** Current theme card (with "Customize" button), theme library section.
- **Pages:** List of store pages (About, Contact). Create/edit with title + content editor.
- **Navigation:** Menus list (Main menu, Footer menu). Edit menu items.
- **Blog Posts:** List of blog posts. Create/edit with title, content, author, tags.

#### Search (Command Palette)
- Cmd+K or click search bar opens command palette modal with: search input, recent searches, suggested actions ("Add product", "View orders"), search results grouped by type (Products, Orders, Customers).

#### Bulk Actions
- Select multiple items via checkboxes → action bar appears at bottom ("2 products selected: Edit, Delete, Archive").

---

## UI Layout Details (from screenshots)

### Overall Layout
- **Sidebar:** ~240px wide, background `#f1f1f1` (very light gray), navigation items with 16px icons + text labels. Active item has green left border accent (`#008060`) and bold text. Hover: slightly darker bg.
- **Top bar:** Full width, white background, ~56px height, contains search bar center, store name left, user info right.
- **Main content area:** White background cards on `#f1f1f1` gray page background. Cards have 1px border `#e3e3e3`, border-radius 8px, padding 16-20px.
- **Max content width:** ~1000px centered in main area with horizontal padding.

### Color Palette (from Polaris design tokens)
- **Background (page):** `#f1f1f1` (rgba 241,241,241)
- **Surface/cards:** `#ffffff`
- **Primary brand (buttons):** `#303030` (dark, almost black)
- **Primary accent (links, active states):** `#005bd3` (blue)
- **Success/green:** `#047b5d`
- **Text primary:** `#303030`
- **Text secondary:** `#616161`
- **Border:** `#e3e3e3`
- **Focus ring:** `#005bd3`
- **Destructive/error:** Red tones
- **Warning:** Yellow/amber tones
- **Xhopify green (logo/brand):** `#96bf48` (bag icon)

### Typography
- **Font family:** `'Inter', -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`
- **Sizes:** 13px body, 14px labels, 16px subheadings, 20px page titles, 24-28px large headings
- **Weights:** Regular (450), Medium (550), Semibold (650), Bold (700)

### Common UI Patterns
- **Status badges:** Small rounded pills: green bg for Active/Paid/Fulfilled, yellow for Pending/Partially, gray for Draft/Archived, red for Unfulfilled/Refunded
- **Data tables:** White card with header row (gray text, smaller font), alternating hover. Checkbox column. Sortable column headers.
- **Page headers:** Page title (20px bold) + subtitle/description + primary action button (right-aligned)
- **Cards:** White background, rounded corners (8px), 1px border, 16px internal padding, card title (semibold) + optional "more" actions
- **Modals:** Centered overlay, white card, close X button, title, content, action buttons in footer
- **Toast notifications:** Bottom-center, dark background, white text, auto-dismiss

---

## Screenshots Reference

### Key Screenshots
| File | Description |
|------|-------------|
| `screenshots/000004.jpg` | Modern Xhopify admin home page showing sidebar with: Home, Orders, Products, Customers, Analytics, Marketing, Discounts, Apps. Search bar centered top. White/gray color scheme. Setup guide section in main area. |
| `screenshots/000003.jpg` | Analytics dashboard (older version) with dark sidebar. Shows sales metrics, visitor chart, traffic sources, top referrers. |
| `screenshots/000001.jpg` | Online Store > Themes page showing sidebar with Sales channels > Online Store expanded (Themes, Blog posts, Pages, Navigation, Preferences). Apps section visible. Settings at bottom. |
| `screenshots/products/000004.jpg` | Product detail page showing: breadcrumb "Products / Men's Ringer Tshirt", product title, images section with thumbnails, variants table (Size, Color, Inventory, Price, SKU), Organization sidebar (Product type, Vendor, Collections, Tags). Top-right buttons: View, Apps, Duplicate, Save. |

### UI Observations from Screenshots
1. **Sidebar navigation** uses small icons (20-24px) followed by text labels, vertically stacked
2. **Active nav item** has a green left-border accent bar (3-4px wide)
3. **Search bar** is the most prominent element in the top bar — wide, centered
4. **Cards** are the primary content container — rounded corners, subtle border
5. **Tables** have clean, minimal styling with hover states
6. **Status badges** use color-coded pills (green = active/good, yellow = pending, red = error/attention)
7. **Page layout** is single-column on most pages, two-column on detail pages (main content 65% + sidebar 35%)

---

## Data Model Overview

See `data_model.md` for detailed entity schemas. Key entities:

1. **Products** — with variants, images, collections
2. **Orders** — with line items, fulfillment status, payment status
3. **Customers** — with addresses, order history
4. **Collections** — groupings of products
5. **Discounts** — codes and automatic rules
6. **Draft Orders** — manual order quotes
7. **Gift Cards** — store credit instruments
8. **Analytics Data** — sales metrics, sessions, conversion rates

---

## What to Skip (Out of Scope)

- **Authentication/Login** — App starts pre-logged-in as "Store Owner" user
- **Real payment processing** — Show mock payment status badges
- **Theme editor/customizer** — Complex visual builder, skip entirely
- **App installation/marketplace** — Show static app list only
- **Real-time live view** — Use mock data for analytics
- **Email/notification sending** — Show notification templates as static content
- **File uploads** — Show placeholder images for products
- **Multi-currency/multi-language** — Use USD and English only
