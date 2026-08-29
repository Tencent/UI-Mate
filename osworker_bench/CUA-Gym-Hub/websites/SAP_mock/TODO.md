# XAP S/4HANA Fiori Launchpad Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-12
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [ ] **Project scaffold**: `npm create vite@latest SAP_mock -- --template react`, install deps: `react-router-dom`. Do NOT use TypeScript — use plain JSX. Do NOT install any UI library — implement all components from scratch using CSS.

- [ ] **Visual design system**: Study `assets/screenshots/` carefully — the XAP Fiori UI has a very specific look:
  - **Shell bar**: Dark blue-gray `#354A5F` background, 44px height, XAP logo in white (use bold text "XAP" with the distinctive XAP blue `#0A6ED1` or white text on dark background), white icons
  - **Primary accent**: `#0A6ED1` (XAP Blue) — used for links, active tab underlines, action buttons, numeric KPI values
  - **Page background**: `#F5F6F7` light gray
  - **Card/Tile surface**: `#FFFFFF` with subtle `1px solid #E5E5E5` border and `border-radius: 8px`
  - **Font**: `'72', '72full', Arial, Helvetica, sans-serif` — use the fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`
  - **Text colors**: Primary `#32363A`, Secondary `#6A6D70`, Placeholder `#ABABAB`
  - **Status colors**: Success `#2B7C2B`, Warning `#E78C07`, Error `#BB0000`, Info `#0A6ED1`
  - **Tab bar**: White `#FFFFFF` background, 40px height, selected tab has 2px bottom border in `#0A6ED1`
  - **Button styles**: Primary button: `#0A6ED1` bg, white text, `border-radius: 4px`, 32px height. Secondary: white bg, `#0A6ED1` text, `1px solid #0A6ED1` border. Transparent: no bg/border, `#0A6ED1` text.
  - **Table styling**: Header row `#F5F6F7` bg, `font-weight: 600`, `font-size: 13px`. Body rows white bg, `font-size: 13px`, row height ~44px, bottom border `#E5E5E5`. Hover: `#F5F6F7`. Selected: `#E8F0FE`.
  - **Filter bar**: White background, collapsible (toggle with chevron), field labels above inputs, `font-size: 12px` labels in `#6A6D70`

- [ ] **App layout**: Full-width layout, no sidebar. Structure from top to bottom:
  1. Shell Bar (44px, fixed top, dark `#354A5F`)
  2. Navigation Tab Bar (40px, sticky below shell, white bg)
  3. Main Content Area (fills remaining height, `#F5F6F7` bg, scrollable, 16px padding)
  - Shell Bar contains (left to right): XAP logo text ("XAP" in white, bold), 8px gap, Page title "Home" with dropdown chevron (white text), flexible spacer, Search icon (magnifying glass, white), Help icon (? in circle, white), Notification bell icon (white, with red badge showing count), User avatar circle (36px, `#0A6ED1` bg, white initials "MQ")
  - Reference: `assets/screenshots/launchpad/000002.jpg` and `assets/screenshots/material_master/000001.jpg`

- [ ] **Routing**: `App.jsx` with `BrowserRouter`, define these routes:
  - `/` → `Home` (Fiori Launchpad with tiles)
  - `/app/manage-purchase-orders` → `ManagePurchaseOrders` (list report)
  - `/app/purchase-order/:id` → `PurchaseOrderDetail` (object page)
  - `/app/create-purchase-order` → `CreatePurchaseOrder` (form)
  - `/app/manage-sales-orders` → `ManageSalesOrders` (list report)
  - `/app/sales-order/:id` → `SalesOrderDetail` (object page)
  - `/app/create-sales-order` → `CreateSalesOrder` (form)
  - `/app/manage-products` → `ManageProducts` (list report)
  - `/app/product/:id` → `ProductDetail` (object page)
  - `/app/journal-entries` → `JournalEntries` (list report)
  - `/go` → `Go` (state inspector)
  - When navigating to an app, the shell bar title changes from "Home" to the app name (e.g., "Manage Purchase Orders"), and a back arrow `←` appears before the XAP logo

- [ ] **State management**: `AppContext` + `dataManager.js`:
  - `createInitialData()` returns all entities as defined in `assets/data_model.md`
  - AppContext provides: `state`, `dispatch`, plus convenience methods: `updatePurchaseOrder(id, changes)`, `addPurchaseOrder(po)`, `deletePurchaseOrder(id)`, etc. for each entity type
  - State changes persist to `localStorage` under key `sap_mock_state`
  - On mount, check localStorage first; if empty, use `createInitialData()`

- [ ] **`/go` endpoint**: `src/pages/Go.jsx` + route, returns JSON with `{initial_state, current_state, state_diff}`. The `state_diff` should be a deep diff showing only changed fields.

- [ ] **Session isolation**: `vite.config.js` mock-api plugin:
  - `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` — sets both current + initial state for that session
  - `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}` — updates only current state
  - `POST /post?sid=<sid>` with body `{"action":"reset"}` — resets to initial state
  - `GET /go?sid=<sid>` → returns `{initial_state, current_state, state_diff}`
  - `GET /state?sid=<sid>` → returns current state
  - When `sid` is present, state is keyed by session ID in a server-side Map; when absent, uses default localStorage behavior

---

## P1 — Primary Features

Core interactive workflows for agent training. These are the apps and interactions a computer-use agent needs to practice.

### Fiori Launchpad Home

- [ ] **Navigation tab bar**: Horizontal scrollable tab list below shell bar. Tabs from data model `navigationTabs` array. Active tab has blue `#0A6ED1` 2px bottom border. Clicking a tab filters the tile grid to show only `tileGroups` matching that tab's `tabKey`. If tabs overflow the viewport width, show left/right scroll chevron buttons (`>` / `<`). Reference: `assets/screenshots/launchpad/000002.jpg` (see the tab bar: "Accounts Receivable | General Ledger | Cash Management | Procurement | Sales | Production | Warehouse Management | Quality Management | Extensibility")

- [ ] **Tile groups and grid**: Each `tileGroup` renders as a section with a gray section header (16px semi-bold, `#32363A` text) and a responsive grid of tiles below it. Grid should use CSS grid with `auto-fill, minmax(176px, 1fr)`, gap 12px. Group title examples: "Purchase Order Processing", "Source of Supply Management". Reference: `assets/screenshots/material_master/000001.jpg`

- [ ] **Tile component**: Render three tile types from the `tiles` data:
  1. **Static tile**: White card, 176px min-width, ~175px height, `border-radius: 8px`, `1px solid #E5E5E5`. Content: Title text (14px, `#32363A`, max 2 lines, top-left), Subtitle (12px, `#6A6D70`, below title), Icon (24px, `#0A6ED1`, bottom-left corner). On hover: subtle shadow `0 0 0 1px #0A6ED1` or slight elevation increase. Cursor pointer.
  2. **Numeric tile**: Same card as static, but adds a large number (36px, light weight, `#0A6ED1`) in the center-bottom area, with a unit label (14px, `#6A6D70`) below it. Icon to the left of the number. Example: "318 Overdue" or "633" with document icon.
  3. **KPI tile**: Same card, shows numeric value + comparison data. Shows colored micro-bars or comparison labels (e.g., "No. of Rejected Lots 18" in red, "Mean Quality Score 87.74" in green). Reference: `assets/screenshots/shell_bar/000001.jpg` (the QM Analytics tiles with colored comparison values)
  - Clicking any tile navigates to its `appRoute` (e.g., clicking "Manage Purchase Orders" tile → `/app/manage-purchase-orders`)

- [ ] **Link tiles**: Some groups show flat text links below the tile grid (e.g., "Mass Changes to Purchase Orders", "My Purchasing Document Items Professional"). Render as blue `#0A6ED1` underlined links in a row. Reference: `assets/screenshots/material_master/000001.jpg` (bottom of Purchase Order Processing group)

### Manage Purchase Orders (List Report)

- [ ] **App shell for list reports**: When navigating to any list report app (e.g., `/app/manage-purchase-orders`), the shell bar title changes to the app name with a dropdown chevron (e.g., "Manage Purchase Orders ▾"). A back arrow button `←` appears at the far left of the shell bar. Clicking back returns to `/` (home). The navigation tab bar is hidden — replaced by the app content. Reference: `assets/screenshots/purchase_orders/000001.jpg`

- [ ] **Variant selector**: Below the shell bar, a row showing "Standard* ▾" text — a clickable dropdown that shows saved view variants. The asterisk `*` indicates unsaved changes. On click, show a dropdown with: "Standard (Default)", "My Custom View", "Save As...", "Manage...". Changing variant is visual only (does not need to actually save/load different filter configs). Reference: `assets/screenshots/purchase_orders/000004.jpg` top-left

- [ ] **Filter bar**: A white bar with multiple filter fields arranged horizontally in a responsive grid. Each filter field has: a label (12px, `#6A6D70`) above an input. Inputs can be: text input, dropdown/select, date picker (native `<input type="date">`), or value-help input (text input + small browse icon button).
  - For Manage Purchase Orders, filter fields: Purchase Order (text), Supplier (text + value help), Purchasing Organization (dropdown), Purchase Order Date From (date), Purchase Order Date To (date), Status (dropdown: All/Draft/Ordered/Partially Delivered/Fully Delivered/Closed), Plant (dropdown), Delivery Status (dropdown)
  - Right-aligned: Blue "Go" button (primary, `#0A6ED1`, white text, 32px height) and "Adapt Filters (N)" link text
  - Filter bar is collapsible: a small chevron `^` button in the center below the filters toggles it. A pin icon next to the chevron keeps it open. When collapsed, only show "Go" and "Adapt Filters"
  - Reference: `assets/screenshots/purchase_orders/000001.jpg` and `assets/screenshots/purchase_orders/000004.jpg`

- [ ] **Results table**: A data table below the filter bar showing filtered `purchaseOrders` data.
  - Table header: "Purchase Orders (N)" count label on the left, action buttons on the right: [Create] (link text, `#0A6ED1`), [Copy], [Delete], then a separator `|`, then [Settings] (gear icon), [Export] (download icon), [View toggle] (list/grid icon buttons)
  - Columns: `[ ]` checkbox, Status (colored icon: green circle ✓ for Delivered, yellow clock for In Process, red ! for Overdue), PO Number (blue link text, clickable → navigates to `/app/purchase-order/:id`), Supplier, PO Date, Total Net Value (right-aligned, formatted with commas and 2 decimals), Currency, Delivery Status (text badge), Plant
  - Row height ~44px, bottom border `#E5E5E5`, hover highlight `#F5F6F7`
  - Header row: `#F5F6F7` bg, `font-weight: 600`, sticky
  - Select all checkbox in header
  - Clicking a PO number link navigates to the PO detail page
  - Reference: `assets/screenshots/purchase_orders/000001.jpg`

- [ ] **Table filtering**: When user changes filter fields and clicks "Go", filter the `purchaseOrders` array by matching criteria. Text filters should do case-insensitive contains matching. Dropdown filters match exact value. Date filters match range (from ≤ date ≤ to). Update the count in the table header "(N)".

- [ ] **Table sorting**: Clicking a column header sorts the table by that column. First click = ascending, second click = descending, third click = reset. Show a small up/down arrow indicator on the sorted column header.

### Purchase Order Detail (Object Page)

- [ ] **Object page header**: When navigating to `/app/purchase-order/:id`, show the object page layout. Shell bar title changes to "Purchase Order ▾". Below shell bar: breadcrumb-style text "Purchase Order /" (small blue link text), then PO number in large text (20px, bold). Right side: collapse/expand chevrons `∧` `∨`. Reference: `assets/screenshots/create_form/000002.jpg`

- [ ] **Tab navigation (horizontal)**: A row of horizontal tabs within the object page, scrollable if overflow. Tabs: General Information, Items, Delivery Details, Pricing, Notes, Attachments, Process Flow. Selected tab has blue underline. Clicking tab scrolls to/shows that section.

- [ ] **General Information section**: A form layout in 2-3 columns showing PO header fields. Each field: label (12px, `#6A6D70`) above value (14px, `#32363A`). Fields: Purchase Order Number, Purchase Order Type, Supplier (blue link), Purchasing Organization, Purchasing Group, Company Code, Created Date, Created By, Payment Terms, Incoterms, Status (colored badge), Plant. Layout uses a CSS grid with 3 columns on desktop, 2 on tablet, 1 on mobile.

- [ ] **Items table within object page**: Below General Information, show "Items" section with a table of `purchaseOrderItems` for this PO. Columns: Item #, Material (link), Material Number, Quantity, Unit, Net Price, Net Value, Delivery Date, Plant, Storage Location. Table has "Add Item" and "Delete" buttons in toolbar.

- [ ] **Edit mode toggle**: Object page starts in display mode (read-only). An "Edit" button in the header area or shell bar enables edit mode — fields become editable inputs. "Save" and "Cancel" buttons appear in a sticky footer bar (`#FFFFFF` bg, border-top `#E5E5E5`). Saving updates the state and shows a success message toast. "Cancel" reverts changes and returns to display mode.

### Create Purchase Order

- [ ] **Create PO form**: Route `/app/create-purchase-order`. Shell bar title: "Create Purchase Order" (or from within list report, show "Process Purchase Requisitions" with tabs for multiple POs). Shows "New Purchase Order" title (20px, bold).
  - Tabs: General Information, Items
  - General Information tab: form fields in 2-column layout: Supplier (text input + value help browse button, clicking opens value help dialog), Purchase Order Type (dropdown: NB - Standard PO, FO - Framework Order), Purchasing Group (dropdown from data), Purchasing Organization (dropdown from data)
  - Items tab: editable table with columns: Material (text + value help), Quantity (number input), Unit (dropdown: PC/KG/EA/L), Purchase Requisition Item (text), Net Price (number input), [X delete] button per row. "Add Item" button above table.
  - Footer bar: "Save" (blue primary button) and "Cancel" (transparent button) — sticky to bottom
  - Saving creates a new PO in state with status "Draft" and navigates to the PO detail page
  - Reference: `assets/screenshots/create_form/000001.jpg`

### Value Help Dialog (Reusable Component)

- [ ] **Value help dialog**: A modal dialog component used for selecting master data entries. Layout:
  - Title bar: "Select: <Entity>" (e.g., "Select: Sold-to Party", "Select: Supplier")
  - Search field below title
  - Filter fields row (e.g., Customer, Name, Sales Organization, Distribution Channel) — each as text inputs with browse icons
  - "Go" button (blue) and "Hide Filters" link
  - Results table with checkbox/radio selection
  - "Cancel" button
  - Selecting a row and confirming fills the parent form field
  - Reference: `assets/screenshots/create_form/000003.jpg`

### Manage Sales Orders (List Report)

- [ ] **Sales order list**: Same list report pattern as Manage Purchase Orders but for `salesOrders` data.
  - Filter fields: Sales Order (text), Customer (text + value help), Sales Organization (dropdown), Order Date From/To (date), Status (dropdown: All/Open/In Process/Completed/Cancelled), Delivery Status (dropdown), Billing Status (dropdown)
  - Table columns: [ ] checkbox, Status icon, SO Number (link → `/app/sales-order/:id`), Customer, Order Date, Total Net Value, Currency, Overall Delivery Status, Overall Billing Status
  - Same table toolbar: Create (→ `/app/create-sales-order`), Copy, Delete, Settings, Export, View toggle

### Sales Order Detail (Object Page)

- [ ] **Sales order object page**: Same object page pattern as PO detail. Header shows SO number with order type badge ("Standard Order (OR)") and status. Image placeholder circle (like product image area, shown as gray with magnifying glass icon). Partners section in header: Sold-to Party, Ship-to Party with statuses. Tabs: General Information, Items, Partners, Prices, Attachments.
  - General Info fields: Sold-to Party (link), Customer Reference, Document Date, Order Reason, Requested Delivery Date, Payment Terms, Incoterms
  - Items table: Item #, Material (link), Description, Quantity, Unit, Net Price, Net Value, Delivery Status, Billing Status, Rejection Reason
  - Edit mode with Save/Cancel footer
  - Reference: `assets/screenshots/create_form/000003.jpg` (background shows SO object page)

### Create Sales Order

- [ ] **Create SO form**: Route `/app/create-sales-order`. Shell bar title: "Sales Order ▾". Shows "New: Sales Order" title with subtitle "Standard Order (OR)".
  - Header area with image placeholder, Partners section (Sold-to Party — click opens value help, Ship-to Party), Status display
  - Tabs: General Information, Items, Partners, Prices
  - General Info: Sold-to Party (value help), Document Date (date picker), Customer Reference (text), Order Reason (dropdown), Requested Delivery Date (date picker)
  - Items tab: editable table to add line items (Material value help, Quantity, Unit, Net Price)
  - Footer: "Create" (blue) and "Cancel"
  - Saving creates new SO in state with "Open" status
  - Reference: `assets/screenshots/create_form/000003.jpg`

### Manage Product Master Data

- [ ] **Product list report**: Route `/app/manage-products`. Shell bar title: "Manage Product Master Data ▾" with search field integrated into shell bar (see `assets/screenshots/material_master/000002.jpg` — the shell bar has: back arrow, XAP logo, "Manage Product Master Data" dropdown, then [All ▾] category dropdown + search input field + search icon, right side: notification bell + user avatar).
  - Filter bar fields: Editing Status (dropdown+search), Product (text + value help), Product Description (text), GTIN (text + value help), Product Group (text + value help), Product Category (text + value help), Division (dropdown, e.g., "XAP (Z1) x" as removable chip)
  - "Go" button + "Adapt Filters (1)" link
  - Table toolbar: count "Products (98)" label, then [Create] [Copy] [Mass Processing] [Delete] buttons, separator, [Settings] [Export] [Fullscreen] [View toggle] icons, [···] overflow menu
  - Table columns: [ ] checkbox, Image (40px thumbnail square, gray placeholder with icon), Description/ID (two-line: blue link name + gray ID number below), Group/Type (two-line), GTIN, Product Category, Last Changed (date + time + user name below)
  - Row click → navigate to `/app/product/:id`
  - Reference: `assets/screenshots/material_master/000002.jpg`

### Notification Center

- [ ] **Notification popover**: Clicking the bell icon in the shell bar opens a popover/dropdown panel (320px wide, max-height 400px, scrollable). Shows list of `notifications` sorted by timestamp desc. Each notification: icon (colored circle based on type), title (bold), description (gray, truncated to 2 lines), relative timestamp ("2 hours ago"). Unread notifications have a light blue left border or bold title. Header: "Notifications" title + "Mark All as Read" link. Clicking a notification marks it as read, updates the bell badge count, and optionally navigates to `actionUrl`.

### Enterprise Search

- [ ] **Search overlay**: Clicking the search icon in the shell bar shows a search input field (either replacing the center of the shell bar or as a dropdown). Shows a category dropdown ("All ▾") to the left of the search input. As user types, show autocomplete suggestions in a dropdown below:
  - Transaction code matches: show "TCode" + "Transaction text" (e.g., "VA03 — Display Sales Orders" highlighted in yellow)
  - Entity matches: show matching PO numbers, SO numbers, material names, supplier names, customer names
  - Category headers in results: "Purchase Orders", "Sales Orders", "Materials", etc.
  - Pressing Enter or clicking a result navigates to the relevant detail page
  - Reference: `assets/screenshots/shell_bar/000002.jpg`

---

## P2 — Secondary Features

Depth and realism — implement after P1 is solid.

- [ ] **User menu popover**: Clicking the user avatar circle in the shell bar opens a popover. Shows: user name ("Michael Quinn"), role ("Procurement Manager"), email. Links: "Settings", "Theme" (with sub-options: Light/Dark/High Contrast), "About", "Sign Out" (non-functional). Reference typical XAP user menu.

- [ ] **Journal Entries list**: Route `/app/journal-entries`. List report pattern with filter bar (Document Number, Company Code, Fiscal Year, Document Type, Posting Date From/To, Status dropdown). Table columns: Document Number (link), Company Code, Fiscal Year, Period, Document Type, Posting Date, Document Date, Reference, Header Text, Total Debit, Total Credit, Currency, Status. Click → detail page.

- [ ] **Journal Entry Detail**: Object page for a journal entry. Header: Document Number, Document Type Name, Posting Date, Status badge. Tabs: General Information (header fields in form layout), Line Items (table of `journalEntryItems`: Item #, GL Account, GL Account Name, Debit, Credit, Cost Center, Profit Center, Assignment, Text).

- [ ] **Accounts Payable tile group on launchpad**: Under the "Accounts Payable" tab, show tile groups matching `assets/screenshots/launchpad/000002.jpg`: "Accounts Payable" group with tiles: Manage Payment Blocks, Manage Supplier Line Items, Accounts Payable Overview, Overdue Payables (numeric, shows "Critical Ov... 14.54M EUR" / "Uncritical O... 5.42M EUR"), Cash Discount Utilization (KPI: 11.79%), Cash Discount Forecast (KPI: 273.8K EUR), Aging Analysis (KPI: 52.81M EUR). Tiles that don't have dedicated app routes just show a "Coming Soon" placeholder when clicked.

- [ ] **Accounts Receivable tile group**: Under "Accounts Receivable" tab: Display Customer Balances, Manage Customer Line Items, Process Receivables, Post Incoming Payments, Manage Dispute Cases (numeric: 0 Open), Overdue Receivables (numeric, loading dots), Total Receivables (numeric, loading dots). Plus second row: Dunning Level Distribution, Future Receivables, Reprocessing Rate, Days Sales Outstanding, Days Beyond Terms, Supervise Collections Worklist.

- [ ] **Analytical chart views**: Within list report apps, add a chart/table toggle. When chart view is selected, show a bar chart (using HTML canvas or SVG) above or instead of the table. For Manage Purchase Orders: bar chart of PO value by month. For Material Price Variance: dual-bar chart (PO price vs Invoice price by month) as in `assets/screenshots/purchase_orders/000004.jpg`. Toggle between chart and table using icon buttons in toolbar.

- [ ] **Table personalization dialog**: Clicking the settings gear icon in any table toolbar opens a dialog with tabs: Columns (checkboxes to show/hide columns, drag to reorder), Sort (select column + asc/desc), Group (select column to group by), Filter (column-level filters). Apply/Cancel buttons.

- [ ] **Message strip & toast**: After successful save operations, show a green success toast message at the bottom of the page ("Purchase Order 4500001234 saved" with dismiss X button, auto-dismiss after 5 seconds). For validation errors, show a message strip below the page header (red bar with error icon and message text). Bottom-left corner: message indicator button showing count of errors/warnings (e.g., red circle with "1").

- [ ] **Adapt Filters dialog**: Clicking "Adapt Filters" link opens a dialog showing all available filter fields with checkboxes. User can add/remove visible filters. Search field at top to find filters. Group filters by category. Apply/Cancel/Reset buttons.

- [ ] **Inline editing in tables**: In the Items table within PO/SO detail pages, allow inline editing — clicking a cell value turns it into an input field. Quantity, Price, and Date cells should be editable inline when in edit mode. Tab key moves to next editable cell.

- [ ] **Deletion confirmation**: When clicking "Delete" button on a selected row in any list table, show a confirmation dialog: "Delete Purchase Order 4500001234?" with "Delete" (red, destructive) and "Cancel" buttons. Confirming removes the entity from state.

- [ ] **Responsive behavior**: The layout should work at these breakpoints:
  - Desktop (≥1280px): Full layout, 3-column forms, wide filter bar
  - Tablet (768-1279px): 2-column forms, collapsible filter bar
  - Mobile (<768px): 1-column forms, filter bar as full-screen dialog, tiles in single column

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs (see `assets/data_model.md` for complete field definitions):

- [ ] **currentUser**: Single user "Michael Quinn" (initials MQ), Procurement Manager role, company BestRun US (company code 1000), avatar color `#0A6ED1`

- [ ] **navigationTabs**: 12 tabs: My Home, Accounts Payable, Accounts Receivable, General Ledger, Cash Management, Procurement, Sales, Production, Warehouse Management, Quality Management, Master Data, Analytics

- [ ] **tileGroups**: 8-10 groups distributed across tabs: Purchase Order Processing (Procurement), Source of Supply Management (Procurement), Sales Order Processing (Sales), Customer Returns (Sales), Accounts Payable (AP tab), Accounts Receivable (AR tab), Journal Entries (GL tab), Product Master (Master Data tab), Recently Added Apps (My Home), Favorites (My Home)

- [ ] **tiles**: ~40 tiles distributed across groups. Mix of static, numeric, and KPI types. Ensure tiles match the screenshots — e.g., "Manage Purchase Orders" with shopping-cart icon, "Monitor Purchase Order Items" showing "318 Overdue", "Create Purchase Order" with add icon, "Manage Sales Orders" showing "633", "Cash Discount Utilization" showing "11.79%", "Aging Analysis" showing "52.81M EUR"

- [ ] **purchaseOrders**: 15 records with realistic data. PO numbers starting at 4500001234, incrementing. Mix of suppliers. Dates spanning Jan 2024 — Mar 2024. Net values ranging $500 — $150,000. Status distribution: 3 Draft, 5 Ordered, 3 Partially Delivered, 3 Fully Delivered, 1 Closed. Include some overdue deliveries.

- [ ] **purchaseOrderItems**: ~40 items across the 15 POs (2-4 items per PO). Reference realistic materials. Quantities 1-1000, prices $0.50 — $5000. Units: PC, KG, EA, L, M.

- [ ] **salesOrders**: 12 records. SO numbers starting at 1000001234. Mix of customers. Dates spanning Jan-Mar 2024. Net values $1,000 — $250,000. Status: 4 Open, 4 In Process, 3 Completed, 1 Cancelled.

- [ ] **salesOrderItems**: ~35 items across the 12 SOs (2-4 items per SO). Reference materials. Include different delivery/billing statuses.

- [ ] **materials**: 20 records with realistic industrial materials. Material numbers MAT-1001 to MAT-1020. Types: 6 HAWA (Trading Goods), 5 ROH (Raw Materials), 5 FERT (Finished Products), 4 HALB (Semi-Finished). Include realistic names: "Aluminum Sheet 2mm", "Steel Rod 10mm", "Industrial Valve A200", "Motor Assembly 5HP", "Circuit Board PCB-100", "Copper Wire 1.5mm", etc. Stock quantities 0-5000.

- [ ] **suppliers**: 10 records with realistic company names and addresses. Mix of US and international (DE, CN, JP, MX). Examples: "Global Parts Inc." (US), "Deutsche Industrieteile GmbH" (DE), "Shanghai Components Ltd." (CN), "Precision Metals Corp." (US), "Tokyo Electronics Co." (JP).

- [ ] **customers**: 10 records. Mix of countries. Examples: "Norelem Iberica S.L." (ES), "LVMH MOET HEN..." (FR), "Domestic FR Cust..." (FR), "TM Road Carrier..." (US), "MBDA France" (FR). Include customer numbers like 1000260, 12100001, etc. as seen in screenshots.

- [ ] **journalEntries**: 15 records with realistic accounting data. Document types: SA (GL), KR (Vendor Invoice), DR (Customer Invoice). Mix of posted/parked/reversed. Fiscal periods 01-03 for 2024. Total debits/credits balanced. Reference numbers like "INV-2024-001".

- [ ] **journalEntryItems**: ~40 items with GL accounts: 400000 (COGS), 500000 (Revenue), 100000 (Cash), 110000 (AR), 200000 (AP), 300000 (Inventory). Cost centers CC1000-CC1003. Debits and credits balanced per journal entry.

- [ ] **notifications**: 8 items covering: PO approval (success), overdue delivery (warning), invoice posted (info), SO created (success), low stock alert (warning), payment block (error), system maintenance (info), price change alert (warning). Mix of read/unread. Timestamps within last 7 days.

- [ ] **plants**: 3 records: 1000 "US Plant Dallas", 1100 "US Plant Chicago", 2000 "EU Plant Frankfurt"

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as `Michael Quinn`)
- Real XAP backend / OData API calls
- XAP GUI / transaction code execution
- Complex authorization roles
- Multi-company code switching
- Real file upload processing
- Email/notification sending
- Print layout generation
- Drag-and-drop tile reordering on launchpad
- XAP Fiori theme editor / customization engine
- ABAP/CDS development tools
