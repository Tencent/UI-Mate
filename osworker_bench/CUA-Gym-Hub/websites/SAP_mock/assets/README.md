# XAP S/4HANA Fiori Launchpad — Research Summary

## App Overview & Purpose

**XAP S/4HANA** is the world's leading enterprise resource planning (ERP) system. Its modern web-based UI layer is called **XAP Fiori**, which replaced the legacy XAP GUI with a responsive, tile-based launchpad experience. The **Fiori Launchpad** is the single entry point — a role-based home page where users see categorized app tiles for every module they have access to.

This mock replicates the **XAP Fiori Launchpad** and its most common transactional/analytical apps across Finance, Procurement, Sales, and Material Management modules — the four core areas of any XAP S/4HANA system.

## Key User Personas & Workflows

### 1. Procurement Specialist (Primary Persona for Mock)
- Views purchase order list, filters by status/date/supplier
- Creates new purchase orders with line items
- Approves purchase requisitions
- Monitors overdue deliveries & supplier confirmations
- Manages supplier master data

### 2. Sales Manager
- Creates and manages sales orders
- Views sales order fulfillment pipeline
- Manages customer master data
- Creates billing documents
- Monitors revenue analytics

### 3. Finance Controller
- Posts journal entries
- Manages accounts payable / receivable
- Views general ledger line items
- Monitors cash discount utilization & aging analysis
- Reviews financial statements

### 4. Material Manager
- Maintains product master data (materials)
- Monitors stock overview & inventory levels
- Manages goods receipts/issues
- Views material price variance analytics

---

## Complete Feature List

### P0 — Core Shell (Must Have)
1. **Fiori Shell Bar** — Dark navy/black top bar (#354A5F or #1B2D3E) with:
   - XAP logo (left corner, white text)
   - App title with dropdown (center-left): "Home" with chevron
   - Search icon (magnifying glass)
   - Help icon (question mark circle)
   - Notification bell icon (with optional badge count)
   - User avatar (circle with initials, colored e.g. blue/purple/orange)
2. **Navigation Tab Bar** — Horizontal scrollable tabs below shell bar:
   - Module categories as tabs: "My Home", "Accounts Receivable", "General Ledger", "Cash Management", "Procurement", "Sales", "Production", "Warehouse Management", "Quality Management", etc.
   - Selected tab has underline indicator (blue)
   - Left/right scroll chevrons when tabs overflow
   - "More" dropdown for overflow tabs
3. **Tile Grid Layout** — Main content area:
   - Light gray background (#F5F6F7 or #EDEFF0)
   - Tiles organized in groups with group headers (section titles)
   - Tile grid: responsive, ~175px wide tiles with ~12px gap
   - Each tile is a white card with rounded corners, subtle shadow
4. **Tile Types**:
   - **Static tile**: Title + subtitle + icon (bottom-left)
   - **Numeric tile**: Title + subtitle + large number + unit + icon
   - **KPI tile**: Title + comparison values, colored indicators
   - **Link tile**: Flat text links below tile groups
5. **Routing** — SPA with routes: `/`, `/app/:appId`, `/go`
6. **State Management** — AppContext with dataManager.js

### P1 — Primary Features (Core Interactive)
7. **Manage Purchase Orders** — List Report app:
   - Filter bar at top with multiple filter fields (dropdowns, date pickers, text inputs)
   - "Go" button (blue) to execute search
   - "Adapt Filters" link to customize visible filters
   - Variant selector ("Standard*" with dropdown)
   - Results table with columns: Status icons, PO Number (link), Supplier, PO Date, Total Net Value, Currency, Delivery Status
   - Table toolbar: Create, Copy, Delete, Settings (gear), Export, View toggle (list/grid)
   - Row selection checkboxes
   - Pagination / "More" loading
   - Click PO number → navigate to PO Object Page detail
8. **Purchase Order Object Page** (Detail View):
   - Shell bar shows "Purchase Order Item" title
   - Breadcrumb: "Purchase Order / <number>"
   - Tab navigation: General Information, Delivery Address, Process Control, Delivery Details, Incoterms, Source of Supply, Tax, Pricing, Schedule Lines, Account Assignment, Notes, Attachments, Process Flow
   - Form fields in 2-3 column layout with labels
   - Items table within tabs
   - Action buttons: Save, Cancel (footer bar)
9. **Create Purchase Order** form:
   - "New Purchase Order" title
   - Tabs: General Information, Items
   - General Info: Supplier (value help link), Purchase Order Type (dropdown: NB - Standard PO), Purchasing Group, Purchasing Organization
   - Items table: Material, Quantity, Purchase Requisition Item, Net Price, Delete (X) button per row
   - Footer: Save (blue), Cancel
10. **Manage Sales Orders** — List Report app:
    - Similar filter bar pattern to PO list
    - Table columns: Sales Order #, Customer, Order Date, Net Value, Status, Delivery Status
    - Create / Edit / Delete actions
11. **Create Sales Order** form:
    - Object page pattern with header showing image placeholder, Partners section (Sold-to Party, Ship-to Party), Status, Overall Block Status
    - Tabs: General Information, Items, Partners, Prices
    - Value help dialogs (modal with search + filter + table of results) for selecting Customer/Sold-to Party
    - "Create" and "Cancel" buttons
12. **Manage Product Master Data** (Materials):
    - List with filter bar: Editing Status, Product, Product Description, Product Group, Product Category, Division
    - Table columns: Image thumbnail, Description/ID (link), Group/Type, GTIN, Product Category, Last Changed
    - Toolbar: Create, Copy, Mass Processing, Delete
    - Click row → navigate to material detail
13. **Notification Center**:
    - Click bell icon → dropdown/popover panel
    - List of notifications with title, description, timestamp
    - Mark as read, mark all as read, priority indicators
14. **Enterprise Search**:
    - Click search icon → search bar appears in shell bar or search overlay
    - Category filter dropdown ("All")
    - Search results with transaction code suggestions (autocomplete like "VA03 → Display Sales Orders")
    - Result list grouped by category

### P2 — Secondary Features (Depth & Realism)
15. **User Menu / User Actions**:
    - Click user avatar → popover with user name, role, settings link, theme selector
16. **Accounts Payable Overview** (Finance tab group):
    - Tiles: Manage Payment Blocks, Manage Supplier Line Items, AP Overview, Overdue Payables, Cash Discount Utilization (11.79%), Aging Analysis (52.81M)
17. **Accounts Receivable Overview**:
    - Tiles: Display Customer Balances, Manage Customer Line Items, Process Receivables, Post Incoming Payments, Overdue Receivables, Total Receivables
18. **General Ledger Journal Entries**:
    - List of journal entries with filter bar
    - Table: Document Number, Company Code, Fiscal Year, Posting Date, Document Type, Reference, Status
19. **Analytical Charts** (within apps):
    - Bar charts for Material Price Variance (PO vs Invoice amounts by month)
    - Chart/table toggle view
    - Drill-down capability
20. **Value Help Dialogs** (reusable):
    - Modal dialog with search field
    - Filter fields at top
    - Results table with selection
    - "Go" and "Hide Filters" buttons
21. **Message Strip / Toast Notifications**:
    - Bottom-left message indicator showing error/warning count
    - Success message toast after save operations
22. **Table Personalization**:
    - Column visibility toggle
    - Sort, Group, Filter within table
    - View settings gear icon
23. **Variant Management**:
    - "Standard*" dropdown with saved views
    - Save as new variant, manage variants

---

## UI Layout Description (Per Major View)

### Fiori Launchpad Home
```
+------------------------------------------------------------------+
| [XAP logo] Home v           [Search] [?] [Bell] [Avatar:MQ]      |  ← Shell Bar (~48px, dark #354A5F)
+------------------------------------------------------------------+
| My Home | Accts Payable | General Ledger | Procurement | Sales  > |  ← Tab Bar (~40px, white bg, blue underline)
+------------------------------------------------------------------+
|                                                                    |
|  Purchase Order Processing              (Section header, gray)     |
|  +--------+ +--------+ +--------+ +--------+ +--------+           |
|  |Procure-| |Manage  | |Monitor | |Create  | |Monitor |           |
|  |ment    | |Purchase| |PO Items| |Purchase| |Supplier|           |
|  |Overview| |Orders  | |        | |Order   | |Confirm.|           |
|  |        | |  [icon]| |[icon]  | |Advanced| | [7]    |           |  ← Tile Grid
|  |  [icon]| |        | | 318   | |  [icon]| |Pending |           |
|  |        | |        | |Overdue | |        | |        |           |
|  +--------+ +--------+ +--------+ +--------+ +--------+           |
|                                                                    |
|  Source of Supply Management            (Section header)           |
|  +--------+ +--------+ +--------+ +--------+                      |
|  |Manage  | |Manage  | |Manage  | |Manage  |                      |
|  |Sources | |Purchas.| |Source  | |RFQs    |                      |
|  |Of Sup. | |Info Rec| |Lists   | |        |                      |
|  |  [icon]| |        | |  [icon]| |  [icon]|                      |
|  +--------+ +--------+ +--------+ +--------+                      |
+------------------------------------------------------------------+
```

### List Report App (e.g., Manage Purchase Orders)
```
+------------------------------------------------------------------+
| [<] [XAP] Monitor Production Orders v     [Q] [?] [Bell] [Avatar]|  ← Shell Bar
+------------------------------------------------------------------+
| Standard* v                                         [Share icon]  |  ← Variant Selector
+------------------------------------------------------------------+
| Shortage Def: | Order Status: | Material Delay: | Component Del: ||
| [MRP Standard]| [dropdown v ] | [dropdown v   ] | [dropdown v  ]||  ← Filter Bar
|               |               |                  |               ||
|                    [^] [pin]                   [Go] Adapt Filters||
+------------------------------------------------------------------+
|  Production Orders (108)        [Manage Orders] [Settings] [Grid]|  ← Table Toolbar
+------------------------------------------------------------------+
| [ ] Status | Material   | Start      | End       | Open Qty |Sta||
| [v] icons  | 300000001  | 16.07.2020 | 17.07.2020| 3 EA     |Rel||  ← Table Rows
| [ ] icons  | 300000000  | 24.07.2020 | 27.07.2020| 19 EA    |Cre||
| [ ] icons  | 310506949  | 10.08.2020 | 10.08.2020| 2 EA     |Rel||
+------------------------------------------------------------------+
```

### Object Page (e.g., Purchase Order Detail)
```
+------------------------------------------------------------------+
| [<] [XAP] Purchase Order Item v          [Q] [?] [Bell] [Avatar] |
+------------------------------------------------------------------+
| Purchase Order /                                          [^ v]  |
| 10                                                                |
+------------------------------------------------------------------+
| General Info | Delivery Addr | Process Ctrl | Pricing | Notes |...|
+------------------------------------------------------------------+
|  Material: IMP Lexmark Laser   |  334.00 EUR  | Trading Mat(L001)|
|  Plant: FIDUCIAL (1032)        |  Price Unit:  | Product Type:    |
|                                |  1 PC         | Material (1)     |
+------------------------------------------------------------------+
|  Delivery Address                                                 |
|  Full Name: [________] House Number: [____] Postal Code: [____]  |
|  Street:    [________] City:         [____] Country/Region: [__] |
+------------------------------------------------------------------+
|                                                  [Apply] [Cancel] |
+------------------------------------------------------------------+
```

---

## Color Palette (XAP Fiori / Horizon Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| Shell Background | `#354A5F` | Shell bar background (dark blue-gray) |
| Shell Text | `#FFFFFF` | Shell bar text and icons |
| Brand/Accent Blue | `#0A6ED1` | Links, selected tab underline, action buttons |
| Tab Bar BG | `#FFFFFF` | Navigation tab background |
| Page Background | `#F5F6F7` | Main content area behind tiles |
| Tile Background | `#FFFFFF` | Tile/card surface |
| Tile Border | `#E5E5E5` | Subtle tile border |
| Section Header | `#32363A` | Group/section title text |
| Body Text | `#32363A` | Primary text color |
| Secondary Text | `#6A6D70` | Subtitles, descriptions |
| Positive/Success | `#2B7C2B` | Green indicators |
| Critical/Warning | `#E78C07` | Orange/amber indicators |
| Negative/Error | `#BB0000` | Red error indicators |
| Information | `#0A6ED1` | Blue info indicators |
| Numeric KPI | `#0A6ED1` | Large numbers on tiles |
| Footer Bar | `#FFFFFF` | Action footer with border-top |
| Filter Bar BG | `#FFFFFF` | Filter bar background |

## Typography
- Font family: `'72', '72full', Arial, Helvetica, sans-serif` (XAP's proprietary "72" font — use system sans-serif as fallback)
- Shell title: 14px, semi-bold
- Tab text: 14px, normal (selected: semi-bold)
- Section header: 16px, semi-bold
- Tile title: 14px, normal weight
- Tile subtitle: 12px, #6A6D70
- Tile numeric: 36px, light weight, #0A6ED1
- Tile unit: 14px, #6A6D70
- Table header: 13px, semi-bold
- Table body: 13px, normal
- Form label: 12px, #6A6D70
- Form value: 14px, #32363A

## Spacing & Sizing
- Shell bar height: 44px
- Tab bar height: 40px
- Tile size: ~175px x ~175px (standard), flexible grid
- Tile gap: 12px
- Page padding: 16px horizontal
- Section header margin: 16px top, 8px bottom
- Table row height: ~44px
- Filter bar fields: ~200px wide
- Border radius (tiles): 8px
- Border radius (buttons): 4px

---

## What to Skip (Out of Scope)

- **Authentication / Login** — App starts pre-logged-in as user "Michael Quinn" (initials MQ)
- **Real XAP backend / OData services** — All data is mock localStorage
- **Complex XAP transaction codes** — Simplified version
- **XAP GUI transactions** — Only Fiori apps
- **Real-time data refresh / WebSocket** — Static mock data
- **File uploads to server** — Simulated only
- **Complex authorization / role management**
- **Multi-company code / multi-plant complexity** — Single company mock

---

## Screenshots Inventory

| Directory | Content | Key Observations |
|-----------|---------|------------------|
| `launchpad/` | 5 images | Fiori home page with tiles grouped by category, shell bar, tab navigation |
| `purchase_orders/` | 5 images | Monitor production orders list with filter bar, Create PO form, Material Price Variance analytical view |
| `sales_orders/` | 5 images | Launchpad with SD tiles (Create Sales Order, Manage Sales Orders), product order list |
| `shell_bar/` | 5 images | Shell bar with QM tabs, transaction code search dropdown, work order list-detail pattern, settlement form |
| `material_master/` | 5 images | Purchase Order Processing tile group, Manage Product Master Data list with filter bar |
| `finance/` | 5 images | Finance Fiori Launchpad with AP/AR tile groups, journal entry template, finance role apps |
| `list_detail/` | 5 images | QM analytics tile dashboard, analytical list report with bar chart |
| `object_page/` | 5 images | Launchpad analytics, annotation model |
| `create_form/` | 5 images | New Purchase Order form with tabs/items, PO Item object page with many tabs, Create Sales Order with value help dialog |

## Key Insights from Screenshots

1. **Shell bar is consistent across all views** — dark background, XAP logo left, title center, action icons right (search, help, bell, avatar)
2. **Tab bar provides module navigation** — scrollable horizontal tabs, active tab has blue underline
3. **Tiles have 3 main variants**: static (icon + title), numeric (number + unit), and KPI (comparison values with colored bars)
4. **List report pattern is dominant** — filter bar (collapsible) + data table is the standard app layout
5. **Object page pattern for detail** — header area + horizontal tab sections with form layouts
6. **Value help dialogs are ubiquitous** — modal windows for selecting master data (customers, materials, suppliers)
7. **The "Go" button pattern** — filter bars always have a blue "Go" button to execute the search
8. **Variant management** — "Standard*" dropdown allows saving filter/view configurations
