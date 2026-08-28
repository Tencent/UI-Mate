# XuickBooks Online Mock — Research Summary

> Last updated: 2025-03-09 by plan agent

## App Overview

**XuickBooks Online (QBO)** is Intuit's cloud-based accounting software for small businesses. It is the most widely-used small business accounting platform in the US, with ~80% market share. QBO enables business owners, bookkeepers, and accountants to manage income, expenses, invoicing, banking, payroll, taxes, and financial reporting from a single web application.

**Key differentiators from competitors:**
- Deep bank feed integration (auto-importing & categorizing transactions)
- Invoice-centric workflow with payment tracking
- Real-time Profit & Loss / Balance Sheet reporting
- Extensive chart of accounts (double-entry accounting)
- "+" Quick Create menu for rapid data entry
- Sales tax automation

## Target User Personas

1. **Small Business Owner** (primary) — Creates invoices, records expenses, reviews dashboard KPIs, runs P&L reports.
2. **Bookkeeper** — Categorizes bank transactions, reconciles accounts, manages chart of accounts, runs detailed reports.
3. **Accountant** — Reviews financial statements, adjusts journal entries, exports data for tax filing.

## UI Layout (from screenshots analysis)

### Color Palette
- **Background**: `#F4F5F7` (light gray page bg)
- **Sidebar bg**: `#FFFFFF` white, with dark header `#2CA01C` (XuickBooks green) or `#1E1E1E` (new dark sidebar)
- **Primary Green** (brand): `#2CA01C` — used for QB logo, main CTA
- **Primary Blue** (actions): `#0077C5` — used for buttons, active nav, links
- **Blue Hover**: `#006BB3`
- **Text Primary**: `#212121`
- **Text Secondary**: `#6B7280`
- **Overdue/Error**: `#D32F2F` (red)
- **Success/Paid**: `#108043` (green)
- **Warning**: `#F59E0B` (amber/orange)
- **Border**: `#E5E7EB`
- **Card bg**: `#FFFFFF`

### Typography
- **Font Family**: "Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif
- **Headings**: 24px bold (h1), 18px semibold (h2), 14px semibold (h3)
- **Body**: 14px regular
- **Small/Labels**: 12px medium uppercase (table headers)

### Global Layout Structure
```
┌──────────────────────────────────────────────────────────────────────┐
│  TOP BAR (56px height)                                               │
│  [☰ hamburger] [Company Name]     [My Experts] [Help] [Search] [⚙]  │
├────────────────┬─────────────────────────────────────────────────────┤
│ LEFT SIDEBAR   │  MAIN CONTENT AREA                                  │
│ (220px width)  │                                                     │
│                │  Page title + actions bar                           │
│ [+ New] button │                                                     │
│                │  Content cards / tables / forms                     │
│ Navigation:    │                                                     │
│ • Dashboard    │                                                     │
│ • Transactions │                                                     │
│ • Sales >      │                                                     │
│ • Cash Flow >  │                                                     │
│ • Expenses >   │                                                     │
│ • Customers &  │                                                     │
│   Leads >      │                                                     │
│ • Reports      │                                                     │
│ • Payroll >    │                                                     │
│ • Projects     │                                                     │
│ • Budgets      │                                                     │
│ • Taxes >      │                                                     │
│ • My Accountant│                                                     │
│ • Accounting > │                                                     │
│                │                                                     │
│ [Menu settings]│                                                     │
└────────────────┴─────────────────────────────────────────────────────┘
```

### Top Bar (Header)
- Left: Hamburger menu icon (toggles sidebar collapse), Company name
- Right: "My Experts" (person icon), Help (? icon), App grid (⋮⋮⋮), Search (magnifying glass), Notifications (bell), Settings (gear), User avatar (circle with initial)

### Left Sidebar
- **Logo area**: Intuit XuickBooks logo (green circle with "qb" + "INTUIT xuickbooks" text) on dark green/black background
- **"+ New" button**: Large green button at top — opens a quick-create dropdown/modal with options: Invoice, Payment link, Estimate, Sales receipt, Expense, Bill, Check, etc.
- **Bookmarks section**: User-customizable shortcuts
- **Menu section**: Navigation items with expand arrows (>) for sub-menus:
  - Dashboards > (Business overview)
  - Transactions > (Banking, Bank rules, Receipts)
  - Sales > (All Sales, Invoices, Customers, Products & Services)
  - Expenses > (Bills, Vendors, Expenses)
  - Customers & leads >
  - Reports
  - Payroll > (Employees, Contractors)
  - Projects
  - Budgets
  - Taxes > (Sales tax, Payroll tax)
  - My Accountant
  - Accounting > (Chart of Accounts, Reconcile)

### Dashboard Page ("Business overview")
- **Tab bar**: "Get things done" | "Business overview" | "Cash flow" | "Planner"
- **Invoices card**: Shows total unpaid (last 365 days), bar chart with Overdue (orange/red) vs Not Due Yet (gray), amounts paid last 30 days with Not Deposited vs Deposited bars
- **Expenses card**: Donut chart showing expense categories (Miscellaneous, Job Expenses, Rent/Lease, Everything else) with total for the period and "Last quarter" selector
- **Bank accounts card**: List of connected accounts (Checking, Savings, Visa, etc.) each showing Bank balance, In XuickBooks balance, "X to review" link, "Updated moments ago"
- **Profit and Loss card**: Net income figure, Income vs Expenses comparison bars, "X TO REVIEW" links for uncategorized items
- **Sales card**: Line chart showing sales over the month with total amount

### Sales > Invoices Page
- **Sub-nav tabs**: All Sales | Invoices | Customers | Products and Services
- **Status cards row**: colored cards showing pipeline counts: $0 ESTIMATE | $750 UNBILLED ACTIVITY | $1,526 OVERDUE (red) | $5,282 OPEN INVOICES | $3,136 PAID (green)
- **Action bar**: Batch actions dropdown, Search box, Print/Export icons
- **Table columns**: Checkbox | Customer name + company | Phone | Pending Invoices (with overdue indicators) | Overdue Balance | Action (Send reminder dropdown)

### Invoice Creation Form
- **Header**: "Invoice" title
- **Customer section**: Customer dropdown, Customer email, Cc/Bcc, "Send later" checkbox
- **Details row**: Billing address textarea | Terms dropdown | Invoice date | Due date
- **Tags**: Tag field
- **Line items table**: # | PRODUCT/SERVICE | DESCRIPTION | QTY | RATE | AMOUNT
- **Line item actions**: "Add lines" | "Clear all lines" | "Add subtotal"
- **Footer fields**: Message on invoice textarea, Message on statement textarea
- **Bottom bar**: Subtotal, Tax dropdown, Discount, Total
- **Action buttons**: Cancel, Save, Save and Send, Save and New

### Banking / Transactions Page
- **Sub-tabs**: Banking | Rules | Receipts (NEW badge)
- **Bank account cards**: Horizontal scrollable cards for each connected account showing: Account name, Bank Balance (blue/colored card), In XuickBooks balance, "X" count of items to review
- **Transaction tabs**: For Review | Reviewed | Excluded
- **Action bar**: Batch actions dropdown, Filter (funnel icon), All | Recognized tabs, Print/Export/Settings icons
- **Table columns**: Checkbox | DATE | DESCRIPTION | PAYEE | CATEGORY OR MATCH | SPENT | RECEIVED | ACTION
- **Action column**: "Add" button (green text) to add transaction, "View" for matched, "Match" for potential matches

### Expenses Page
- **Sub-tabs**: Vendors | Expenses | Bills
- Table with expense details: Date, Payee, Category, Description, Amount, Receipt attachment

### Reports Page
- **Sub-tabs**: Standard | Custom reports | Management reports
- **Report categories** (collapsible sections):
  - Business overview: Audit Log, Balance Sheet Comparison, Balance Sheet Detail, Balance Sheet Summary, Balance Sheet, Budget Overview, Budget vs. Actuals, Business Snapshot, Profit and Loss as % of total income, Profit and Loss Detail, Profit and Loss year-to-date comparison, Profit and Loss by Class, Profit and Loss by Customer, Profit and Loss by Location, Profit and Loss by Month, Profit and Loss, Quarterly Profit and Loss Summary, Statement of Cash Flows
  - (More categories: Sales, Expenses, Payroll, etc.)
- **Star/favorite** reports for quick access
- **Report view**: Back to report list link, Report period dropdown + date range, Customize/Save customization buttons, Report content with collapsible rows, column headers

### Profit & Loss Report (example)
- **Header**: Company name, "Profit and Loss" title, date range
- **Controls**: Collapse/Sort/Add notes/Edit titles buttons, Email/Print/Export/Settings icons
- **Report body**: Hierarchical tree view
  - Income > sub-categories > amounts
  - Cost of Goods Sold > sub-categories
  - Gross Profit
  - Expenses > sub-categories
  - Net Income

### Chart of Accounts (Accounting section)
- **Sub-tabs**: Chart of Accounts | Reconcile
- **Table columns**: NUMBER | NAME | TYPE | DETAIL TYPE | XUICKBOOKS BALANCE | BANK BALANCE
- **Account types**: Bank, Accounts Receivable, Other Current Assets, Fixed Assets, Accounts Payable, Other Current Liabilities, Income, Cost of Goods Sold, Expenses

### Settings (Account and Settings modal)
- **Left tabs**: Company | Usage | Sales | Expenses | Payments | Time | Advanced
- **Advanced section groups**: Accounting, Company type, Chart of accounts, Categories, Automation

## Feature Inventory

### P0 — Core (must have for app to render)
1. Project scaffold (Vite + React + Tailwind) — ✅ EXISTS
2. Visual design system matching QBO colors/typography
3. App layout: sidebar (220px) + top bar (56px) + main content
4. Left sidebar navigation with expandable sub-menus
5. Top bar with company name, search, settings gear, help, notifications, user avatar
6. "+" New quick-create button and dropdown
7. React Router routing for all pages
8. State management (Context + dataManager) — ✅ EXISTS (needs expansion)
9. /go endpoint for state inspection — ✅ EXISTS
10. Session isolation via vite.config.js — ✅ EXISTS

### P1 — Primary Features (core interactive workflows)
1. Dashboard with Invoices card, Expenses donut, P&L card, Sales chart, Bank accounts
2. Sales > Invoices list with status pipeline cards and table
3. Invoice creation form with customer picker, line items, totals, save
4. Invoice preview/PDF modal
5. Sales > Customers tab with customer list, search, batch actions
6. Sales > Products & Services tab
7. Expenses page with expense table + add expense form
8. Banking/Transactions page with bank account cards, For Review/Reviewed/Excluded tabs, categorization
9. Reports page with report list (Standard/Custom), expandable categories, search
10. Profit & Loss report view with hierarchical data
11. Balance Sheet report view
12. Customers & Leads page (separate from Sales tab)
13. New Customer form modal
14. New Product/Service form modal
15. Chart of Accounts (Accounting section)

### P2 — Secondary Features (depth and polish)
1. Estimates/Quotes creation
2. Bills management (Expenses > Bills)
3. Vendors list and management
4. Bank reconciliation
5. Sales tax tracking
6. Projects page with project list
7. Settings modal (Account and Settings)
8. Search functionality (global search in top bar)
9. Notification bell with dropdown
10. Mileage tracking
11. "Get things done" tab on dashboard
12. Dashboard Cash Flow tab
13. Batch actions on customer/invoice lists
14. Export/Print functionality on reports and lists
15. Journal entries

## What to Skip
- Authentication / login / logout — app starts pre-logged-in as admin of "Acme Corp"
- Real bank connectivity / Plaid integration
- Real payment processing (Stripe, PayPal)
- Email sending (invoice emails)
- File upload to real servers (mock with localStorage or picsum)
- Payroll calculations / tax filing
- Real-time bank feed syncing
- Multi-user / permissions

## Screenshots Reference

| Directory | Contents |
|-----------|----------|
| `screenshots/` | Dashboard home views (5 images) |
| `screenshots/invoices/` | Invoice creation form UI (5 images) |
| `screenshots/expenses/` | Banking/transaction categorization views (5 images) |
| `screenshots/reports/` | P&L and report list views (5 images) |
| `screenshots/navigation/` | Sidebar navigation layouts (5 images) |
| `screenshots/customers/` | Customer list and management (5 images) |
| `screenshots/settings/` | Chart of accounts, settings pages (5 images) |
