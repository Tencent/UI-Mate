# XuickBooks Online Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing scaffold: Vite + React + Tailwind + react-router-dom + recharts + lucide-react + date-fns + uuid

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current State Assessment

The project already has basic scaffolding with:
- ✅ vite.config.js with mock-api plugin (POST /post, GET /state, GET /go, file upload)
- ✅ package.json with deps (react, react-router-dom, recharts, lucide-react, date-fns, tailwind)
- ✅ Basic Layout.jsx with sidebar + top bar
- ✅ Basic store.jsx with React Context
- ✅ Basic initialData.js with customers, products, invoices, expenses, accounts, transactions, employees, projects
- ✅ Basic pages: Dashboard, Sales, CreateInvoice, Expenses, Transactions, Reports, Go
- ❌ Sidebar does NOT match real QBO navigation (missing sub-menus, "+" New dropdown, bookmarks)
- ❌ Top bar is simplified (missing hamburger toggle, My Experts, grid icon, proper search)
- ❌ Dashboard is basic (missing Invoices status bar, Expenses donut, proper Bank accounts card)
- ❌ Data model is minimal (missing vendors, bills, estimates, chart of accounts detail, report categories)
- ❌ No "+" New quick-create dropdown
- ❌ Reports page is placeholder
- ❌ Many pages are placeholder stubs
- ❌ No customer/vendor/product create modals
- ❌ Banking page doesn't match real QBO bank feed UI
- ❌ No Chart of Accounts page

---

## P0 — Core Shell
<!-- Without these, the app cannot render correctly. Dev implements these first. -->

- [x] **Visual design system**: Study `assets/screenshots/` and replicate exact QBO visual style. Update `tailwind.config.js` with custom theme:
  - Colors: primary green `#2CA01C`, action blue `#0077C5`, blue-hover `#006BB3`, bg `#F4F5F7`, text-primary `#212121`, text-secondary `#6B7280`, overdue-red `#D32F2F`, success-green `#108043`, warning-amber `#F59E0B`, border `#E5E7EB`
  - Font: `"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif`
  - The existing config uses `qb-blue` and `qb-hover` — keep those but add `qb-green`, `qb-red`, `qb-amber`, `qb-bg`

- [x] **Sidebar overhaul** (see `assets/screenshots/navigation/000002.jpg` for reference): Replace current flat sidebar with proper QBO sidebar:
  - Dark green header area with Intuit XuickBooks logo (green circle "qb" icon + "INTUIT xuickbooks" text in white)
  - Large `+ New` green button (full sidebar width, rounded corners, white text)
  - `BOOKMARKS` section (collapsible, with pencil edit icon) — show 2-3 user bookmarks
  - `MENU` section (collapsible, with pencil edit icon) with items that have expand chevrons (>) for sub-menus:
    - Dashboards > (sub: Business overview)
    - Transactions > (sub: Banking, Bank rules, Receipts)
    - Sales > (sub: All Sales, Invoices, Customers, Products & Services)
    - Expenses > (sub: Expenses, Bills, Vendors)
    - Customers & leads >
    - Reports (no sub-menu)
    - Payroll > (sub: Overview, Employees, Contractors)
    - Projects (no sub-menu)
    - Budgets (no sub-menu)
    - Taxes > (sub: Sales tax)
    - My Accountant (no sub-menu)
    - Accounting > (sub: Chart of Accounts, Reconcile)
  - Bottom: `Menu settings` link
  - Active item styling: green left border + green text + light green bg

- [x] **Top bar overhaul**: Match real QBO header (56px height, white bg, bottom border):
  - Left side: Hamburger menu icon `☰` (toggles sidebar collapse) + Company name "Acme Corp"
  - Right side (icon buttons, left-to-right): "My Experts" (person icon), Help `?` (circle icon), App grid `⋮⋮⋮` (9-dot grid), Search `🔍`, Notifications `🔔` (with badge count), Settings `⚙`, User avatar (purple circle with initial "A")

- [x] **"+ New" quick-create dropdown**: When clicking the `+ New` button in sidebar, show a dropdown/popover with organized sections:
  - **Customers**: Invoice, Receive payment, Estimate, Sales receipt, Refund receipt, Credit memo
  - **Vendors**: Expense, Bill, Pay bills, Purchase order, Vendor credit
  - **Employees**: Payroll (disabled/grayed text)
  - **Other**: Bank deposit, Transfer, Journal entry
  - Each item is a clickable link that navigates to the appropriate create form or opens a modal

- [x] **Expand data model** (`src/lib/initialData.js`): Add all entities from `assets/data_model.md`:
  - Add `company` singleton object
  - Add `vendors` array (6-8 records)
  - Add `estimates` array (3 records)
  - Add `bills` array (4-5 records)
  - Expand `accounts` to full chart of accounts (15-20 entries with number, name, type, detailType, balance, bankBalance)
  - Expand `transactions` to 15-20 records (mix of pending/posted/excluded)
  - Add `reportCategories` array (report template definitions)
  - Expand `customers` to 8-10 with full fields (add company, address, notes, isActive, createdAt)
  - Expand `products` to 6-8 with full fields (add description, cost, category, sku, isTaxable, quantityOnHand)
  - Expand `invoices` to 6-8 with full fields (add subtotal, tax, paidAmount, terms, message)
  - Expand `expenses` to 10-12 with full fields (add vendorId, accountId, isBillable, status)
  - Add normalizer functions for all new entity types (bills, vendors, estimates, etc.)

- [x] **Expand store.jsx**: Add mutation functions for all new entities:
  - `addVendor`, `updateVendor`, `deleteVendor`
  - `addBill`, `updateBill`
  - `addEstimate`, `updateEstimate`
  - `updateCustomer`, `deleteCustomer`
  - `addProduct`, `updateProduct`, `deleteProduct`
  - `addTransaction`, `updateTransaction`, `deleteExpense`, `updateExpense`
  - `addAccount`, `updateAccount`
  - `deleteInvoice`
  - `toggleReportStar` (toggle starred status in reportCategories)

- [x] **Routing update** (`App.jsx`): Add routes for all pages:
  - `/` — Dashboard
  - `/transactions` — Banking/Transactions (rename from generic)
  - `/transactions/rules` — Bank rules
  - `/sales` — All Sales
  - `/sales/invoices` — Invoices list
  - `/sales/new-invoice` — Create invoice (existing)
  - `/sales/customers` — Customers list
  - `/sales/products` — Products & Services
  - `/expenses` — Expenses list
  - `/expenses/bills` — Bills
  - `/expenses/vendors` — Vendors
  - `/customers` — Customers & Leads (separate page)
  - `/reports` — Reports list
  - `/reports/:reportId` — Individual report view
  - `/payroll` — Payroll placeholder
  - `/projects` — Projects
  - `/taxes` — Taxes
  - `/accounting` — Chart of Accounts
  - `/accounting/reconcile` — Reconcile
  - `/go` — State inspection (existing)

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. These are the interactive workflows for agent training. -->

- [x] **Dashboard — Business overview** (see `assets/screenshots/000001.jpg` and `000003.jpg`): Complete overhaul of Dashboard page:
  - **Invoices card** (top-left): "Invoices" heading with "$X UNPAID LAST 365 DAYS" subtitle. Horizontal stacked bar showing Overdue amount (orange/red) vs Not Due Yet (gray). Below: "$X PAID LAST 30 DAYS" with Not Deposited (red text) vs Deposited (green text) stacked bar. Amounts calculated dynamically from `data.invoices`.
  - **Expenses card** (top-center): "Expenses" heading + "Last month ▼" dropdown. Total amount in large text. Donut/pie chart (using Recharts PieChart) showing expense breakdown by category (different colors: teal for Miscellaneous, dark teal for Job Expenses, green for Rent/Lease, light green for Everything else). Legend items next to chart with amounts.
  - **Bank accounts card** (top-right): Heading with pencil edit icon. List of accounts from `data.accounts` where type is "Bank" or "Credit Card". Each row: Account name, "X to review" link (green/orange, count of pending transactions for that account), "Updated moments ago" text. Two balance columns: "Bank balance $X" and "In XuickBooks $X".
  - **Profit and Loss card** (bottom-left): "Profit and Loss" heading + "Last month ▼" dropdown. Large net income number. "NET INCOME FOR [MONTH]" subtitle. Income bar (green) and Expenses bar (teal) with amounts, and "X TO REVIEW" badges (orange text links) next to each.
  - **Sales card** (bottom-right): "Sales" heading + "Last month ▼" dropdown. Large total sales number + "LAST MONTH" subtitle. Line chart (using Recharts LineChart) with green line, x-axis = days of month, y-axis = dollar amounts.
  - Bottom link: "See all activity" link

- [x] **Banking / Transactions page** (see `assets/screenshots/expenses/000004.jpg` — the real QBO banking page): Complete overhaul:
  - **Sub-tab navigation**: "Banking" | "Rules" | "Receipts" (with "NEW" badge on Receipts)
  - **Bank account cards row**: Horizontal scrollable row of cards, one per bank/credit card account. Each card: colored background (blue for checking, other colors for others), account name, Bank Balance (large), "Updated moments ago", In XuickBooks balance, count badge of items "to review". Clicking a card filters transactions below.
  - **Collapse toggle**: Chevron to collapse/expand bank cards section
  - **Transaction filter tabs**: "For Review" | "Reviewed" | "Excluded" — filter `data.transactions` by status (pending/posted/excluded)
  - **Action bar**: "Batch actions ▼" dropdown (left), Filter funnel icon, "All (N)" | "Recognized (N)" segment buttons, Print/Export/Settings icons (right)
  - **Transaction table columns**: Checkbox | DATE ▼ (sortable) | DESCRIPTION | PAYEE | CATEGORY OR MATCH | SPENT | RECEIVED | ACTION
  - **CATEGORY OR MATCH column**: Shows current category. For pending items, shows "Uncategorized Income/Expense" in gray. For matched items, shows green badge "1 record found" or "2 records found". Clicking opens category dropdown or match panel.
  - **ACTION column**:
    - For pending uncategorized: "Add" button (green text, bordered) — clicking it categorizes the transaction (sets status to "posted")
    - For pending with match: "Match" button — clicking matches to existing invoice/expense
    - For pending with multiple matches: "View" link
  - **Row interaction**: Clicking a row expands it inline to show categorization form: Category dropdown, Payee input, Tags, and Confirm/Exclude buttons

- [x] **Sales > Invoices page** (see `assets/screenshots/customers/000002.jpg`): Overhaul current Sales page:
  - **Top sub-navigation tabs**: "All Sales" | "Invoices" | "Customers" | "Products and Services"
  - **Status pipeline cards** (horizontal colored bar): 5 colored segments side by side:
    - Green: "$0 / 0 ESTIMATE"
    - Teal: "$750 / 3 UNBILLED ACTIVITY"
    - Red: "$1,526 / 10 OVERDUE" (red background)
    - Blue: "$5,282 / 20 OPEN INVOICES"
    - Green (bright): "$3,136 / 12 PAID LAST 30 DAYS"
  - Values computed dynamically from `data.invoices` and `data.estimates`
  - Clicking a card filters the table below
  - **Action bar**: Batch actions dropdown, Search input ("Find a customer or company"), Print/Export/Settings icons, "New customer" button (green, top-right with dropdown arrow)
  - **Invoice table**: Checkbox | Customer name (bold) + company (gray sub-text) + email icon | Phone | Pending Invoices (with red circle "!" for overdue) | Overdue Balance | Action ("Send reminder ▼" dropdown)

- [x] **Invoice creation form overhaul** (see `assets/screenshots/invoices/000001.jpg`): Upgrade existing CreateInvoice.jsx:
  - **Title**: "Invoice" with settings gear icon
  - **Top row**: Customer dropdown (with search, "Select a customer") | Customer email (with Cc/Bcc link) | "Online payments" toggles (Cards checkbox, Bank transfer checkbox) | "Send later" checkbox
  - **Details row**: Billing address textarea (auto-filled from customer) | Terms dropdown (Net 30, Net 15, Due on receipt, etc.) | Invoice date picker | Due date picker (auto-calculated from terms)
  - **"Create recurring invoice" link** below date fields
  - **Tags field**: Tag input with dropdown
  - **Line items table**: Drag handle (⋮⋮) | # | PRODUCT/SERVICE (dropdown with search) | DESCRIPTION | QTY | RATE | AMOUNT | Trash icon
  - **Line item actions**: "Add lines" button | "Clear all lines" button | "Add subtotal" button
  - **Message on invoice**: Textarea with placeholder "This will show up on the invoice."
  - **Message on statement**: Textarea
  - **Footer totals**: Subtotal | Discount (expandable, percentage or flat) | Tax | Total
  - **Bottom action bar**: "Cancel" | "Print or Preview" | spacer | "Save and new" | "Save and send" (primary green) | "Save and close"

- [x] **Sales > Customers tab**: Full customer list view:
  - Table columns: Checkbox | Customer name (bold, clickable) + company (gray sub-text) + email icon | Phone | Pending Invoices (with overdue count/icon) | Overdue Balance | Action dropdown
  - Search box: "Find a customer or company"
  - "New customer" button (green)
  - Batch actions: Create statements, Email
  - Clicking a customer name opens a customer detail panel/page

- [x] **New Customer modal/form**: Modal dialog for creating a new customer:
  - Fields: Title (Mr/Mrs/etc), First name, Middle name, Last name, Suffix, Company, Display name as, Email, Phone, Mobile, Fax, Website, Billing address (Street, City, State, ZIP, Country), Shipping address, Notes, Payment terms dropdown, Tax exempt checkbox
  - Save/Cancel buttons
  - Adds to `data.customers` via `addCustomer()`

- [x] **Sales > Products & Services tab**: Product/service list:
  - Table columns: Checkbox | Name (bold) | SKU | Type (Service/Product) | Sales Description | Sales Price | Cost | Qty on Hand | Action
  - "New" button — opens product/service creation form
  - Search/filter by name
  - Toggle: Active/Inactive items

- [x] **New Product/Service modal**: Modal for creating:
  - Type selector: "Service" or "Product" (toggles which fields show)
  - Fields: Name, SKU (product only), Category dropdown, Description, Sales price/rate, Cost (product), Income account dropdown, Expense account dropdown (product), Quantity on hand (product), As of date, Reorder point, Is taxable checkbox
  - Save/Cancel

- [x] **Expenses page overhaul**: Match real QBO expenses UI:
  - **Sub-tabs**: "Expenses" | "Bills" | "Vendors"
  - **Expense list table**: Checkbox | Date | Type | No. | Payee | Category | Total | Action (dropdown: Edit, Delete, Duplicate)
  - **"New transaction" button** with dropdown (Expense, Check, Bill, Purchase Order, Vendor Credit)
  - Filter by: Date range, Type, Status
  - Sort by column headers
  - Expense detail modal: when clicking an expense row, show details form with all fields

- [x] **Expenses > Vendors tab**: Vendor list:
  - Table columns: Checkbox | Vendor name (bold) | Phone | Email | Open Balance | Action
  - "New vendor" button
  - Clicking opens vendor detail

- [x] **New Vendor modal**: Form for creating vendor:
  - Fields: First name, Last name, Company, Display name, Email, Phone, Address, Terms, Account no., Tax ID, Notes
  - Save/Cancel

- [x] **Reports page** (see `assets/screenshots/reports/000003.jpg` and `000004.jpg`): Complete reports list:
  - **Sub-tabs**: "Standard" | "Custom reports" | "Management reports"
  - **Search bar**: "Find report by name"
  - **Report categories** (collapsible sections with ▼ chevrons):
    - "Business overview" — list reports from `data.reportCategories[0]`
    - "Sales and customers"
    - "Expenses and vendors"
    - "Employees"
  - Each report row: Report name (clickable link) | Star/favorite toggle (☆/★) | Three-dot menu (⋮)
  - Starred reports show ★ in green
  - Two-column layout (report names arranged in 2 columns within each category)

- [x] **Profit & Loss report view** (see `assets/screenshots/reports/000001.jpg`): When clicking "Profit and Loss" from reports list, navigate to `/reports/profit-loss`:
  - **Header**: "Profit and Loss Report" title, "< Back to report list" link, "Run report" button
  - **Controls row**: Report period dropdown ("This Year" / "This Quarter" / "This Month" / custom), Date range inputs (from/to), "Customize" button, "Save customization" green button
  - **Report toolbar**: Collapse | Sort ▼ | Add notes | Edit titles | Email icon | Print icon | Export icon | Settings icon
  - **Report body**: Company name centered, "Profit and Loss" title centered, date range centered. Hierarchical indented table:
    - Income section (collapsible): sub-categories with amounts in TOTAL column
    - Cost of Goods Sold section
    - **Gross Profit** (bold, computed)
    - Expenses section: sub-categories
    - **Net Operating Income** (bold, computed)
    - Other Income / Other Expenses
    - **Net Income** (bold, final line)
  - All values computed from `data.invoices` (income), `data.expenses` (expenses), and `data.accounts`

- [x] **Balance Sheet report view**: Navigate to `/reports/balance-sheet`:
  - Similar layout to P&L but with: Assets, Liabilities, Equity sections
  - Computed from `data.accounts` balances grouped by type

- [x] **Chart of Accounts page** (see `assets/screenshots/expenses/000001.jpg` bank register and `assets/screenshots/settings/000001.jpg`): Route `/accounting`:
  - **Sub-tabs**: "Chart of Accounts" | "Reconcile"
  - **Table columns**: NUMBER | NAME | TYPE ▼ (sortable) | DETAIL TYPE | XUICKBOOKS BALANCE | BANK BALANCE
  - **Action bar**: "New" button (to add account), Search, Filter by type, Print/Export
  - Clicking an account row navigates to its **Bank Register** view
  - **Bank Register view** (when clicking an account): "< Back to Chart of Accounts" link, Account name + dropdown selector, "ENDING BALANCE $X" display, "Reconcile" green button, table with columns: DATE ▼ | REF NO. / TYPE | PAYEE / ACCOUNT | PAYMENT | DEPOSIT | ✓ (reconciled status) | BALANCE. "Add check ▼" dropdown to add new transactions. Pagination.

---

## P2 — Secondary Features
<!-- Depth features; implement only after P1 is solid. -->

- [ ] **Estimates page**: Estimates list and create form (similar to invoice but with Estimate fields). Route: `/sales/estimates`. Status pipeline for estimates.

- [ ] **Bills management** (Expenses > Bills tab): Bills list with status (Open/Overdue/Paid). Bill creation form (similar to invoice form but from vendor perspective). "Pay bills" workflow — select multiple bills and record payment.

- [ ] **Global search**: Clicking the search icon in top bar opens a full-width search dropdown. Search across customers, vendors, invoices, transactions, reports by name/number. Show grouped results (Customers, Transactions, Reports sections). Navigate to result on click.

- [ ] **Notifications bell**: Click notification bell to show dropdown with mock notifications: "Invoice #1001 is overdue", "New bank transaction imported", "Bill from Office Depot due in 3 days". Badge count on bell icon.

- [ ] **Settings modal** (Account and Settings): Gear icon in top bar opens a modal/drawer with tabs:
  - Company: Company name, Address, Industry
  - Sales: Default payment terms, Invoice customization
  - Expenses: Default expense categories, Bill payment settings
  - Advanced: Accounting method, First month of fiscal year, Chart of accounts options, Automation toggles
  - Each section shows current values and has "Edit" pencil icon to toggle editing

- [ ] **Projects page**: Route `/projects`. Project cards or list view showing: Project name, Customer, Status badge, Budget vs Spent progress bar. Click to view project detail with linked invoices, expenses, and time entries.

- [ ] **Sidebar collapse/toggle**: Hamburger menu icon in top bar toggles sidebar between full (220px) and collapsed (60px, icons only) states. Smooth CSS transition animation.

- [ ] **Dashboard "Get things done" tab**: Alternative dashboard view with quick-action cards organized by category:
  - VENDORS: "Enter bills", "Pay bills", "Manage sales tax", "Items & Services"
  - CUSTOMERS: "Estimates", "Create invoices", "Receive payments", "Create sales receipts"
  - EMPLOYEES: "Enter time" (if applicable)

- [ ] **Batch actions on lists**: All list views (Invoices, Customers, Vendors, Expenses) support:
  - Checkbox selection (header checkbox selects all)
  - "Batch actions" dropdown appears when items selected
  - Actions: Delete, Email, Print, Export selected

- [ ] **Inline row expansion on banking page**: Clicking a transaction row in Banking page expands it inline (accordion style) to show:
  - Category dropdown (select from chart of accounts categories)
  - Payee input (text field)
  - Tags input
  - Split transaction toggle (split one transaction into multiple categories)
  - Confirm (categorize) and Exclude buttons

- [ ] **Export/Print buttons**: Print and Export icons on report views and list views. Print opens browser print dialog. Export generates mock CSV download.

- [ ] **Date range filtering**: All reports and list views have date range selectors: "This Month", "This Quarter", "This Year", "Last Month", "Last Year", "Custom" with date pickers.

- [ ] **Customer detail page**: Route `/customers/:id`. Shows customer info, open invoices, payment history, notes. Edit button to modify customer details. "Create invoice" quick action.

- [ ] **Sales tax page**: Route `/taxes`. Simple view showing sales tax liability summary. Table with tax jurisdiction, taxable amount, tax amount, filing status.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. Reference data_model.md for field definitions. -->

- [x] **Company**: "Acme Corp", 123 Business Rd, San Francisco CA 94105, Technology Services industry, Accrual accounting
- [x] **Customers**: 8-10 records — "Amy's Bird Sanctuary" (balance $239), "Bill's Windsurf Shop" (balance $85), "Cool Cars" (balance $0), "Diego Rodriguez" (balance $450), "Dukes Basketball Camp" (balance $0), "Freeman Sporting Goods" (balance $85, sub-customer: "55 Twin Lane"), "Geeta Kalapatapu" (balance $0), "Jeff's Jalopies" (balance $1,200), "Kookies by Kathy" (balance $0), "Pye's Cakes" (balance $340)
- [x] **Vendors**: 6-8 records — "Office Depot", "Google Cloud", "Pacific Gas & Electric", "State Farm Insurance", "Adobe Systems", "Amazon Web Services", "Uber for Business", "Starbucks Corporate"
- [x] **Products**: 6-8 records — mix of services (Consulting $150/hr, Web Dev $100/hr, Design $125/hr, Support $75/hr) and products (Software License $499, Laptop $1200 qty:5, Office Chair $350 qty:12)
- [x] **Invoices**: 8 records spanning Draft, Sent, Viewed, Paid, Overdue, Partial statuses with realistic line items
- [x] **Estimates**: 3 records — Pending, Accepted, Rejected
- [x] **Expenses**: 12 records across last 60 days, covering Office Supplies, Travel, Meals, Software, Rent, Utilities, Insurance, Advertising categories
- [x] **Bills**: 5 records — 2 Open, 1 Overdue, 2 Paid
- [x] **Accounts**: 20 chart of accounts entries (see data_model.md §Accounts for complete list with numbers)
- [x] **Transactions**: 20 bank feed items — 6 pending (For Review), 10 posted (Reviewed), 2 excluded, 2 matched to invoices. Mix of credits/debits over last 30 days. Checking account should show checking balance with 25 items to review; Savings with 1; Credit card with 7.
- [x] **Employees**: 5 records with different departments and salary ranges
- [x] **Projects**: 4 records in different statuses with budget/spent tracking

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / logout (app starts pre-logged-in as admin of "Acme Corp")
- Real bank connectivity / Plaid integration / bank syncing
- Real payment processing (Stripe, PayPal, ACH)
- Email sending (invoice emails, reminders)
- Real file upload to cloud servers (mock with localStorage / picsum URLs)
- Payroll calculations / W-2 / tax filing
- Real PDF generation (use mock preview modal)
- Mobile/responsive layout (desktop only)
- Real-time notifications / WebSockets
- Multi-user / role permissions
- Actual accounting math validation (debits = credits)
