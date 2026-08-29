# Xmazon Seller Central Mock -- TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest amazon_seller_mock -- --template react` in the project directory, install deps: `react-router-dom`, `recharts` (for charts), `lucide-react` (icons). No TypeScript -- use plain JSX. No Tailwind -- use plain CSS matching DESIGN.md specifications exactly.

- [x] **Global CSS reset and base styles**: Create `src/index.css` with the full color palette from DESIGN.md as CSS custom properties (`--amazon-navy: #232f3e`, `--amazon-orange: #ff9900`, `--page-bg: #f5f7fa`, `--link-blue: #0066c0`, etc.). Set font-family to `Arial, Helvetica, sans-serif`. Set `body { margin: 0; background: var(--page-bg); font-size: 13px; line-height: 18px; color: #111; }`.

- [x] **App layout (AppLayout component)**: Fixed top navigation bar (50px height, full width, `#232f3e` background) + main content area below. No persistent sidebar -- sidebar only appears as overlay when hamburger menu is clicked. Content area: `max-width: 1400px`, centered, `padding: 20px horizontal, 16px top`. See DESIGN.md Section 4 for exact spacing.

- [x] **Top Navigation Bar**: Height 50px, bg `#232f3e`, position fixed, z-index 1000. Left section: hamburger icon (3 white bars, 20px, clickable to open sidebar) + 12px gap + "amazon" text in white with orange smile arrow underneath + "Seller Central" in white 14px text. Center: search input bar (white bg, border-radius 4px, max-width 400px, placeholder "Search Seller Central", magnifying glass icon left). Right: notification bell icon (with red badge showing `seller.notificationCount`), US flag icon (marketplace), mail/envelope icon (with badge showing `seller.unreadMessages`), gear icon, "Help" text link, display name `seller.displayName` -- all white, 16px gap between items. Clicking notification bell opens a dropdown panel listing `notifications[]` (each shows icon by type, title, relative timestamp, unread dot). Clicking mail icon navigates to `/messages`.

- [x] **Sidebar Navigation (Hamburger Overlay)**: When hamburger is clicked, a dark overlay (`rgba(0,0,0,0.5)`) covers the page, and a 280px-wide panel slides in from the left with bg `#232f3e`. Close X button at top-right of panel. Menu sections separated by `#3b4a5c` dividers. Each section header: 12px uppercase text, `#999` color. Each item: 14px white text, 44px row height, 16px left padding, hover bg `#37475a`. Sections and sub-items (each sub-item is a `<Link>` that navigates and closes sidebar):
  - **Catalog**: Add Products (`/catalog/add-product`)
  - **Inventory**: Manage All Inventory (`/inventory`), Manage FBA Inventory (`/inventory/fba`), Inventory Planning (`/inventory/planning`), Manage FBA Shipments (`/inventory/shipments`)
  - **Pricing**: Manage Pricing (`/pricing`), Automate Pricing (`/pricing/automate`)
  - **Orders**: Manage Orders (`/orders`), Order Reports (`/orders/reports`), Manage Returns (`/returns`)
  - **Advertising**: Campaign Manager (`/advertising`), Create Campaign (`/advertising/create`)
  - **Stores**: Manage Stores (`/stores`) -- placeholder page
  - **Growth**: Growth Opportunities (`/growth`) -- placeholder page
  - **Reports**: Business Reports (`/reports`), Payments (`/payments`), Advertising Reports (`/reports/advertising`)
  - **Performance**: Account Health (`/account-health`), Feedback (`/feedback`), Voice of the Customer (`/performance/voc`) -- placeholder page
  - **B2B**: B2B Central (`/b2b`) -- placeholder page
  - **Brands**: Brand Dashboard (`/brands`) -- placeholder page
  - **Settings**: Account Info (`/settings`), Notification Preferences (`/settings/notifications`), Shipping Settings (`/settings/shipping`)

- [x] **Routing**: `App.jsx` with `BrowserRouter`. All routes implemented.

- [x] **State management**: `AppContext.jsx` with React Context + useReducer. Load initial data from `dataManager.js` via `initializeData()`. Expose `state` and `dispatch` globally. Actions: `SET_STATE`, `UPDATE_PRODUCT`, `ADD_PRODUCT`, `DELETE_PRODUCT`, `UPDATE_ORDER`, `ADD_ORDER`, `SEND_MESSAGE`, `UPDATE_RETURN`, `UPDATE_CAMPAIGN`, `ADD_CAMPAIGN`, `UPDATE_SETTINGS`, `MARK_NOTIFICATION_READ`, `ADD_FEEDBACK_RESPONSE`, `UPDATE_COUPON`.

- [x] **dataManager.js**: Follow the exact pattern from existing mocks (slack_mock). Include: `getSessionId()`, `getInitialState(sid)`, `fetchCustomState(sid)`, `saveState(state, sid)`, `initializeData(sid, customState)`, `createInitialData()`. All entities defined in `assets/data_model.md` with realistic values.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Reads `initialState` from `localStorage` and `currentState` from context. Computes `state_diff` as a deep-diff. Renders raw JSON.

- [x] **Session isolation**: `vite.config.js` mock-api plugin. Handles POST /post, GET /state, GET /go with ?sid=xxx session isolation.

---

## P1 -- Primary Features

### Dashboard (Homepage `/`)

- [x] **Sales Summary Cards Row**: 4 KPI cards (Today's Sales, Orders, Units Ordered, Buyer Messages)

- [x] **Account Health Banner**: Health status banner with color indicator and link to Account Health page

- [x] **Sales Chart**: Line chart with 7/30/90 day toggle, recharts

- [x] **Action Items Panel**: Unshipped orders, messages, returns, low inventory counts with links

- [x] **Quick Links Panel**: Grid of icon+label cards linking to common pages

### Manage Orders (`/orders`)

- [x] **Order Status Tabs**: All Orders, Pending, Unshipped, Shipped, Cancelled with counts

- [x] **Order Search and Filters Bar**: Text search, date range, fulfillment channel filter

- [x] **Orders Table**: Full table with sorting, pagination, status badges, fulfillment badges

- [x] **Bulk Actions Toolbar**: Appears when orders selected, Confirm Shipment button

- [x] **Confirm Shipment Modal**: Carrier + tracking number for selected orders

- [x] **Order Detail Page (`/orders/:id`)**: Full order info with all sections (Summary, Buyer Info, Items, Financial, Shipping, Activity)

### Manage Inventory (`/inventory`)

- [x] **Inventory Status Tabs**: Active, Inactive, Suppressed, Incomplete, All tabs with counts

- [x] **Inventory Search and Filter Bar**: Text search + fulfillment filter

- [x] **Inventory Table**: Full table with product images (colored initials), inline price/quantity editing, status badges, actions dropdown

- [x] **Inline Price Editing**: Click-to-edit with Enter/Escape, validation, green checkmark animation

- [x] **Inline Quantity Editing**: Same pattern as price editing

- [x] **Add a Product Page (`/catalog/add-product`)**: Multi-tab form with all 6 tabs, validation, draft/submit

- [x] **Edit Product Page (`/catalog/edit-product/:id`)**: Same form pre-filled with existing data

### Pricing (`/pricing`)

- [x] **Pricing Table View**: Table with inline price editing, Buy Box status, competitive prices

- [x] **Automate Pricing Page (`/pricing/automate`)**: List of pricing rules with toggle switches

### Buyer Messages (`/messages`)

- [x] **Messages Inbox View**: Split panel with thread list, filter tabs, search

- [x] **Message Thread View**: Message bubbles with buyer/seller alignment, reply composer

- [x] **Response Deadline Indicator**: Time remaining indicator with color coding

### Account Health Dashboard (`/account-health`)

- [x] **Overall Health Banner**: Large status card with IPI-style color indicator

- [x] **Customer Service Performance Section**: ODR and other metrics table

- [x] **Policy Compliance Section**: Grid of compliance items with checkmarks

- [x] **Shipping Performance Section**: 4 metric cards with progress bars

### Business Reports (`/reports`)

- [x] **Date Range Selector**: Preset buttons (Today, Yesterday, Last 7 Days, Last 30 Days)

- [x] **Sales Overview Chart**: Multi-line chart with metric toggles

- [x] **Summary Statistics Row**: 4 stat cards with period comparison

- [x] **Sales by ASIN Table**: Sortable table of product metrics

### Feedback Manager (`/feedback`)

- [x] **Feedback Table**: Star ratings, truncated comments, order links, response status

- [x] **Respond to Feedback**: Expanded row with response form and removal request

---

## P2 -- Secondary Features

### Advertising Campaign Manager (`/advertising`)

- [x] **Campaign List Table**: Full table with status toggles, metrics (spend, sales, ACoS, CTR)

- [x] **Campaign Detail Page (`/advertising/:id`)**: Campaign details with Ad Groups, Keywords, Performance tabs

- [x] **Create Campaign Form (`/advertising/create`)**: 4-step wizard (Settings, Targeting, Keywords, Products)

### FBA Inventory (`/inventory/fba`)

- [x] **FBA Inventory Table**: FBA products with days of supply, color coding

- [x] **Inventory Planning Page (`/inventory/planning`)**: IPI score gauge + restock suggestions + inbound shipments

- [x] **FBA Shipments Page (`/inventory/shipments`)**: Inbound shipments table

### Returns Management (`/returns`)

- [x] **Returns Table**: Status badges, approve/deny actions

- [x] **Return Detail Expanded View**: Buyer comments, seller notes, resolution

### Payments (`/payments`)

- [x] **Payments Overview**: Balance cards, next/last disbursement

- [x] **Transaction History Table**: Filterable by type, paginated

### Settings (`/settings`)

- [x] **Account Info Page**: Editable store name and email fields

- [x] **Notification Preferences (`/settings/notifications`)**: Toggle switches for all preferences

- [x] **Shipping Settings (`/settings/shipping`)**: Shipping service, handling time, return address

### Notifications Dropdown

- [x] **Notification Panel Dropdown**: Bell icon dropdown with mark-all-read and navigation

---

## Data Seed (implement in createInitialData())

- [x] **Products**: 18 products in "Evergreen Home Goods" brand, mix of FBA/FBM, Active/Inactive/Suppressed

- [x] **Orders**: 26 orders - 3 Pending, 5 Unshipped, 15 Shipped, 2 Cancelled, 1 Returned

- [x] **Messages**: 9 messages across 6 threads, mix of Unanswered/Answered

- [x] **Returns**: 4 return requests - Pending/Approved/Completed/Denied

- [x] **Campaigns**: 3 advertising campaigns with ad groups and keywords

- [x] **Account Health**: Good rating (350), realistic metrics

- [x] **Feedback**: 12 entries, mix of 1-5 star ratings

- [x] **Sales Data**: 30 days of daily snapshots

- [x] **Payments**: Current balance, disbursements, 25 transactions

- [x] **FBA Inventory**: IPI score 580, restock suggestions, 1 inbound shipment

- [x] **Coupons**: 2 coupons (1 active, 1 expired)

- [x] **Notifications**: 6 notifications (3 unread)

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as seller "Evergreen Home Goods")
- Real Amazon API communication
- Actual payment processing or bank account linking
- Real file/image upload to S3 (use placeholder visuals)
- Multi-marketplace switching (US only)
- Real FBA shipment creation workflows (show toast/placeholder)
- Real advertising bid optimization or Amazon Ads API
- Email/SMS sending
- MWS or SP-API integration
- Real product catalog search against Amazon's database
