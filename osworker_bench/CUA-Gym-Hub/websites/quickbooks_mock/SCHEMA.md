# quickbooks_mock Schema

**Deploy order**: 39 (alphabetical among all *_mock dirs, BASE_PORT=8000 -> port 8039)
**Base URL**: `http://172.17.46.46:8039/`
**Go Endpoint**: `GET /go?sid=<sid>` -> `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) -> `{files: [{url, original_name, stored_name, size}]}`
**Serve files**: `GET /files/<sid>/<filename>` -> file content with Content-Type

## State Management

Uses **React Context** (`StoreContext`) in `src/lib/store.jsx`. State is a single `data` object persisted to localStorage under keys `qb_mock_data[_<sid>]` (current) and `qb_mock_initial[_<sid>]` (initial). Custom state is deep-merged with defaults via normalization functions so partial inject works.

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `company` | `Company` | Company profile singleton (name, address, tax info, accounting method) |
| `customers` | `Customer[]` | List of customers / clients (default: 10 records, IDs `c1`-`c10`) |
| `vendors` | `Vendor[]` | List of vendors / suppliers (default: 8 records, IDs `v1`-`v8`) |
| `products` | `Product[]` | Products and services catalog (default: 7 records, IDs `p1`-`p7`) |
| `invoices` | `Invoice[]` | Sales invoices (default: 8 records, IDs `inv1`-`inv8`) |
| `estimates` | `Estimate[]` | Estimates / quotes (default: 3 records, IDs `est1`-`est3`) |
| `expenses` | `Expense[]` | Expense transactions (default: 12 records, IDs `exp1`-`exp12`) |
| `bills` | `Bill[]` | Vendor bills / payables (default: 5 records, IDs `bill1`-`bill5`) |
| `accounts` | `Account[]` | Chart of Accounts (default: 20 records, IDs `acc1`-`acc20`) |
| `transactions` | `Transaction[]` | Bank feed transactions (default: 20 records, IDs `tx1`-`tx20`) |
| `employees` | `Employee[]` | Employee records (default: 5 records, IDs `emp1`-`emp5`) |
| `projects` | `Project[]` | Project tracking records (default: 4 records, IDs `proj1`-`proj4`) |
| `reportCategories` | `ReportCategory[]` | Report catalog grouped by category (4 categories, ~21 reports) |

### Company

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | `"Acme Corp"` | Company display name |
| `address` | `string` | `"123 Business Rd, San Francisco, CA 94105"` | Street address |
| `phone` | `string` | `"(555) 123-4567"` | Phone number |
| `email` | `string` | `"admin@acmecorp.com"` | Primary email |
| `website` | `string` | `"www.acmecorp.com"` | Website URL |
| `industry` | `string` | `"Technology Services"` | Industry classification |
| `taxId` | `string` | `"12-3456789"` | Tax identification number |
| `fiscalYearStart` | `string` | `"January"` | Fiscal year start month |
| `accountingMethod` | `string` | `"Accrual"` | Accounting method (Accrual/Cash) |

### Customer

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"c_custom_<i>"` | Unique ID (e.g., `c1`, `c2`, ...) |
| `name` | `string` | `"Unknown Customer"` | Display name |
| `company` | `string` | `""` | Company name (may be empty for individuals) |
| `email` | `string` | `""` | Email address |
| `phone` | `string` | `""` | Phone number |
| `address` | `string` | `""` | Mailing address |
| `balance` | `number` | `0` | Open balance (amount owed) |
| `notes` | `string` | `""` | Internal notes |
| `isActive` | `boolean` | `true` | Whether customer is active |
| `createdAt` | `string` | today's date | Creation date (`YYYY-MM-DD`) |

### Vendor

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"v_custom_<i>"` | Unique ID (e.g., `v1`, `v2`, ...) |
| `name` | `string` | `"Unknown Vendor"` | Display name |
| `company` | `string` | `""` | Company name |
| `email` | `string` | `""` | Email address |
| `phone` | `string` | `""` | Phone number |
| `address` | `string` | `""` | Mailing address |
| `balance` | `number` | `0` | Open balance (amount owed to vendor) |
| `isActive` | `boolean` | `true` | Whether vendor is active |
| `createdAt` | `string` | today's date | Creation date (`YYYY-MM-DD`) |

### Product

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"p_custom_<i>"` | Unique ID (e.g., `p1`, `p2`, ...) |
| `name` | `string` | `"Unknown Product"` | Product/service name |
| `description` | `string` | `""` | Description text |
| `type` | `string` | `"Service"` | `"Service"` or `"Product"` |
| `price` | `number` | `0` | Sales price |
| `cost` | `number` | `0` | Cost/purchase price |
| `category` | `string` | `"Services"` | Category (e.g., `"Services"`, `"Software"`, `"Hardware"`, `"Furniture"`) |
| `sku` | `string` | `""` | SKU code (empty for services) |
| `isActive` | `boolean` | `true` | Whether product is active |
| `isTaxable` | `boolean` | `false` | Whether product is taxable |
| `quantityOnHand` | `number\|null` | `null` | Inventory quantity (`null` for services) |

### Invoice

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"inv_custom_<i>"` | Unique ID (e.g., `inv1`, `inv2`, ...) |
| `number` | `string` | `"<1000+i>"` | Invoice number (e.g., `"1001"`) |
| `customerId` | `string` | `""` | Reference to customer ID |
| `date` | `string` | today's date | Invoice date (`YYYY-MM-DD`) |
| `dueDate` | `string` | today's date | Due date (`YYYY-MM-DD`) |
| `items` | `InvoiceItem[]` | `[]` | Line items |
| `subtotal` | `number` | `0` | Subtotal before tax |
| `tax` | `number` | `0` | Tax amount |
| `total` | `number` | `0` | Total amount (subtotal + tax) |
| `status` | `string` | `"Draft"` | `"Draft"`, `"Sent"`, `"Paid"`, `"Overdue"`, or `"Partial"` |
| `paidAmount` | `number` | `0` | Amount paid so far |
| `paidDate` | `string\|null` | `null` | Payment date (`YYYY-MM-DD` or null) |
| `terms` | `string` | `"Net 30"` | Payment terms |
| `message` | `string` | `""` | Message to customer |
| `createdAt` | `string` | ISO datetime | Creation timestamp |

### InvoiceItem (sub-type of Invoice.items)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Item line ID (e.g., `"item1"`) |
| `productId` | `string` | Reference to product ID |
| `description` | `string` | Line item description |
| `qty` | `number` | Quantity |
| `rate` | `number` | Unit rate/price |
| `amount` | `number` | Line total (qty * rate) |

### Estimate

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"est_custom_<i>"` | Unique ID (e.g., `est1`, `est2`, ...) |
| `number` | `string` | `"E-<1000+i>"` | Estimate number (e.g., `"E-1001"`) |
| `customerId` | `string` | `""` | Reference to customer ID |
| `date` | `string` | today's date | Estimate date (`YYYY-MM-DD`) |
| `expiryDate` | `string` | today's date | Expiry date (`YYYY-MM-DD`) |
| `items` | `EstimateItem[]` | `[]` | Line items (same shape as InvoiceItem) |
| `total` | `number` | `0` | Total estimate amount |
| `status` | `string` | `"Pending"` | `"Pending"`, `"Accepted"`, or `"Rejected"` |

### Expense

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"exp_custom_<i>"` | Unique ID (e.g., `exp1`, `exp2`, ...) |
| `date` | `string` | today's date | Expense date (`YYYY-MM-DD`) |
| `payee` | `string` | `""` | Payee name |
| `vendorId` | `string\|null` | `null` | Reference to vendor ID (or null) |
| `category` | `string` | `"Uncategorized"` | Category (e.g., `"Office Supplies"`, `"Travel"`, `"Meals & Entertainment"`, `"Software"`, `"Rent"`, `"Utilities"`, `"Insurance"`, `"Advertising"`) |
| `amount` | `number` | `0` | Expense amount |
| `description` | `string` | `""` | Description text |
| `accountId` | `string` | `""` | Payment account ID (e.g., `"acc1"` for Checking) |
| `receipt` | `string` | `""` | Receipt attachment URL (empty if none) |
| `isBillable` | `boolean` | `false` | Whether billable to a customer |
| `customerId` | `string\|null` | `null` | Customer to bill (if billable) |
| `status` | `string` | `"Cleared"` | `"Cleared"` or `"Pending"` |

### Bill

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"bill_custom_<i>"` | Unique ID (e.g., `bill1`, `bill2`, ...) |
| `vendorId` | `string` | `""` | Reference to vendor ID |
| `number` | `string` | `"B-<5000+i>"` | Bill number (e.g., `"B-5001"`) |
| `date` | `string` | today's date | Bill date (`YYYY-MM-DD`) |
| `dueDate` | `string` | today's date | Due date (`YYYY-MM-DD`) |
| `items` | `BillItem[]` | `[]` | Line items (with `id`, `description`, `qty`, `rate`, `amount`) |
| `total` | `number` | `0` | Total amount |
| `status` | `string` | `"Open"` | `"Open"`, `"Overdue"`, or `"Paid"` |
| `paidDate` | `string\|null` | `null` | Payment date (`YYYY-MM-DD` or null) |

### Account (Chart of Accounts)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"acc_custom_<i>"` | Unique ID (e.g., `acc1`, `acc2`, ...) |
| `number` | `string` | `""` | Account number (e.g., `"10100"`) |
| `name` | `string` | `"Unknown Account"` | Account name (e.g., `"Checking"`, `"Savings"`) |
| `type` | `string` | `"Bank"` | Account type: `"Bank"`, `"Accounts Receivable"`, `"Other Current Assets"`, `"Fixed Assets"`, `"Accounts Payable"`, `"Credit Card"`, `"Equity"`, `"Income"`, `"Cost of Goods Sold"`, `"Expenses"` |
| `detailType` | `string` | `""` | Sub-classification (e.g., `"Checking"`, `"Savings"`, `"Credit Card"`) |
| `balance` | `number` | `0` | Current balance in XuickBooks (negative for credit cards = amount owed) |
| `bankBalance` | `number` | same as `balance` | Bank-reported balance (may differ from QB balance) |
| `isActive` | `boolean` | `true` | Whether account is active |

### Transaction (Bank Feed)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"tx_custom_<i>"` | Unique ID (e.g., `tx1`, `tx2`, ...) |
| `accountId` | `string` | `""` | Reference to account ID (e.g., `"acc1"` for Checking) |
| `date` | `string` | today's date | Transaction date (`YYYY-MM-DD`) |
| `description` | `string` | `""` | Bank description text |
| `payee` | `string` | `""` | Payee/payer name |
| `amount` | `number` | `0` | Amount (positive = credit/deposit, negative = debit/payment) |
| `type` | `string` | `"debit"` | `"debit"` or `"credit"` |
| `category` | `string` | `"Uncategorized"` | Assigned category (e.g., `"Rent"`, `"Sales"`, `"Software"`) |
| `matchedTo` | `string\|null` | `null` | ID of matched invoice/expense (e.g., `"inv5"`, `"exp5"`) |
| `status` | `string` | `"pending"` | `"pending"` (for review), `"posted"` (categorized), or `"excluded"` |
| `isReconciled` | `boolean` | `false` | Whether transaction is reconciled |

### Employee

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"emp_custom_<i>"` | Unique ID (e.g., `emp1`, `emp2`, ...) |
| `name` | `string` | `"Unknown"` | Employee name |
| `email` | `string` | `""` | Email address |
| `role` | `string` | `""` | Job title/role |
| `department` | `string` | `""` | Department name |
| `salary` | `number` | `0` | Annual salary |
| `payFrequency` | `string` | `"Bi-weekly"` | Pay frequency |
| `startDate` | `string` | `""` | Start date (`YYYY-MM-DD`) |
| `isActive` | `boolean` | `true` | Whether employee is active |

### Project

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` | `"proj_custom_<i>"` | Unique ID (e.g., `proj1`, `proj2`, ...) |
| `name` | `string` | `"Untitled Project"` | Project name |
| `customerId` | `string` | `""` | Reference to customer ID |
| `status` | `string` | `"Planning"` | `"Planning"`, `"In Progress"`, or `"Completed"` |
| `budget` | `number` | `0` | Budget amount |
| `spent` | `number` | `0` | Amount spent so far |
| `startDate` | `string` | `""` | Start date (`YYYY-MM-DD`) |
| `endDate` | `string\|null` | `null` | End date (`YYYY-MM-DD` or null if ongoing) |
| `description` | `string` | `""` | Project description |

### ReportCategory

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Category name (e.g., `"Business overview"`, `"Sales and customers"`, `"Expenses and vendors"`, `"Employees"`) |
| `reports` | `Report[]` | Array of report definitions |

### Report (sub-type of ReportCategory.reports)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Report slug ID (e.g., `"profit-loss"`, `"balance-sheet"`, `"invoice-list"`) |
| `name` | `string` | Display name (e.g., `"Profit and Loss"`) |
| `starred` | `boolean` | Whether report is starred/favorited |

## Default Report IDs

**Business overview**: `profit-loss` (starred), `balance-sheet` (starred), `balance-sheet-detail`, `cash-flow`, `budget-overview`, `budget-vs-actuals`, `audit-log`

**Sales and customers**: `invoice-list`, `sales-by-customer` (starred), `sales-by-product`, `customer-balance`, `collections`, `estimates-by-customer`

**Expenses and vendors**: `expenses-by-vendor`, `unpaid-bills` (starred), `vendor-balance`, `ap-aging`

**Employees**: `payroll-summary`, `employee-details`

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Business overview with KPI cards, charts, bank accounts, recent invoices, bills |
| `/transactions` | Transactions | Bank feed with account cards, per-account selection, categorization dropdown, controlled checkboxes for bulk select, filter by status tabs |
| `/transactions/rules` | Transactions | Bank rules (uses Transactions with rules view) |
| `/transactions/receipts` | Transactions | Receipts (uses Transactions with receipts view) |
| `/sales` | Sales | All sales tab (invoices table, click invoice # to open detail modal) |
| `/sales/invoices` | Sales | Invoices tab with print/email actions on each row |
| `/sales/customers` | Sales | Customers tab with "New customer" modal to create/edit customers |
| `/sales/products` | Sales | Products & Services tab with "New product/service" modal to create/edit products |
| `/sales/new-invoice` | CreateInvoice | Invoice creation form with line items, terms, message, tax calculation, PDF preview modal, "Save and close" and "Save and send" (opens mailto:) |
| `/expenses` | Expenses | Expenses tab with "New transaction" inline form (vendor, payee, category, amount, date, description, receipt file upload) |
| `/expenses/bills` | Expenses | Bills tab with "New bill" inline form; click bill number to open detail modal; "Pay bill" quick-action button |
| `/expenses/vendors` | Expenses | Vendors tab with "New vendor" modal to create/edit vendors |
| `/customers` | Sales | Redirects to customers tab |
| `/reports` | Reports | Report catalog with search bar, starred favorites section, collapsible category accordion |
| `/reports/profit-loss` | Reports | Profit and Loss detail view (income vs expenses breakdown, net income) |
| `/reports/balance-sheet` | Reports | Balance Sheet detail view (assets, liabilities, equity) |
| `/reports/invoice-list` | Reports | Invoice List report (all invoices table) |
| `/reports/sales-by-customer` | Reports | Sales by Customer report (customer name, invoice count, total) |
| `/reports/customer-balance` | Reports | Customer Balance report (customers with outstanding A/R) |
| `/reports/expenses-by-vendor` | Reports | Expenses by Vendor report (vendor totals and transaction counts) |
| `/reports/unpaid-bills` | Reports | Unpaid Bills report (open and overdue bills) |
| `/reports/payroll-summary` | Reports | Payroll Summary report (employee list with salary totals) |
| `/reports/:reportId` | Reports | Any unknown reportId falls back to the report list |
| `/payroll` | Payroll | Payroll overview: summary cards (active employees, bi-weekly + annual payroll) + employee table |
| `/payroll/employees` | Payroll | Employees tab: full employee list with status badges |
| `/payroll/contractors` | Payroll | Contractors tab: empty state message |
| `/projects` | Projects | Projects table with budget/spent/remaining, progress bars |
| `/budgets` | Budgets | Budget vs. Actuals table by expense category with variance and progress bars |
| `/taxes` | Taxes | Tax summary cards, company tax info, taxable invoices table |
| `/accounting` | Accounting | Chart of Accounts tab: accounts grouped by type |
| `/accounting/reconcile` | Accounting | Reconcile tab: bank/credit card accounts with QB vs bank balance and transaction counts |
| `/accountant` | Accounting | My Accountant tab: company profile + quick links to reports |
| `/go` | Go | State inspection endpoint (rendered outside layout) |

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "company": {
      "name": "Test Company LLC"
    },
    "customers": [
      {
        "id": "c1",
        "name": "Alice Johnson",
        "company": "Alice Corp",
        "email": "alice@example.com",
        "phone": "(555) 000-1111",
        "balance": 500.00
      }
    ],
    "invoices": [
      {
        "id": "inv1",
        "number": "2001",
        "customerId": "c1",
        "date": "2025-01-15",
        "dueDate": "2025-02-15",
        "items": [
          {
            "id": "li1",
            "productId": "p1",
            "description": "Consulting",
            "qty": 5,
            "rate": 100.00,
            "amount": 500.00
          }
        ],
        "subtotal": 500.00,
        "tax": 0,
        "total": 500.00,
        "status": "Sent",
        "paidAmount": 0,
        "paidDate": null,
        "terms": "Net 30",
        "message": ""
      }
    ],
    "expenses": [
      {
        "id": "exp1",
        "date": "2025-01-10",
        "payee": "Office Supply Co",
        "category": "Office Supplies",
        "amount": 75.50,
        "description": "Printer paper",
        "status": "Cleared"
      }
    ],
    "transactions": [
      {
        "id": "tx1",
        "accountId": "acc1",
        "date": "2025-01-12",
        "description": "DEBIT CARD PURCHASE",
        "payee": "Starbucks",
        "amount": -15.00,
        "type": "debit",
        "category": "Uncategorized",
        "status": "pending"
      }
    ]
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create a new invoice via `/sales/new-invoice` form | `invoices` (new entry prepended with status `"Sent"`) |
| Click "Receive payment" on an invoice (from invoice detail modal) | `invoices[i].status` -> `"Paid"`, `invoices[i].paidAmount` -> total, `invoices[i].paidDate` -> today |
| Add a new customer via Sales → Customers → "New customer" button | `customers` (new entry appended) |
| Edit a customer via Sales → Customers → Edit button | `customers[i]` fields updated |
| Add a new product via Sales → Products → "New product/service" button | `products` (new entry appended) |
| Edit a product via Sales → Products → Edit button | `products[i]` fields updated |
| Add a new expense via Expenses form | `expenses` (new entry prepended with status `"Cleared"`) |
| Create a new bill via Expenses → Bills → "New bill" form | `bills` (new entry appended with status `"Open"`) |
| Click "Pay bill" on a bill (inline or in detail modal) | `bills[i].status` -> `"Paid"`, `bills[i].paidDate` -> today |
| Add a new vendor via Expenses → Vendors → "New vendor" button | `vendors` (new entry appended) |
| Edit a vendor via Expenses → Vendors → Edit button | `vendors[i]` fields updated |
| Categorize a pending bank transaction (change dropdown + click "Add") | `transactions[i].category` -> selected category, `transactions[i].status` -> `"posted"` |
| Exclude a pending bank transaction (click X button) | `transactions[i].status` -> `"excluded"` |
| Star/unstar a report | `reportCategories[cat].reports[j].starred` toggled |
| Navigate to different Sales tab | No state change (URL changes, UI-only tab switching) |
| Navigate to different Expenses tab | No state change (URL changes, UI-only tab switching) |
| Filter transactions by account or status | No state change (UI-only filtering) |
| Search reports | No state change (UI-only filtering) |
| Toggle sidebar collapse | No state change (UI-only) |
| Open/close Quick Create dropdown | No state change (UI-only) |
| Open/close invoice detail modal | No state change (UI-only) |
| Open/close bill detail modal | No state change (UI-only) |
| Select/deselect transaction checkbox | No state change (UI-only local selection) |

## Store Mutation Functions

The React Context provides these mutation functions:

| Function | Signature | Effect |
|----------|-----------|--------|
| `addInvoice` | `(invoice) => void` | Prepends invoice to `invoices` array |
| `updateInvoice` | `(updatedInvoice) => void` | Replaces invoice matching `id` |
| `deleteInvoice` | `(invoiceId) => void` | Removes invoice by `id` |
| `addCustomer` | `(customer) => void` | Appends customer to `customers` array |
| `updateCustomer` | `(updatedCustomer) => void` | Replaces customer matching `id` |
| `deleteCustomer` | `(customerId) => void` | Removes customer by `id` |
| `addVendor` | `(vendor) => void` | Appends vendor to `vendors` array |
| `updateVendor` | `(updatedVendor) => void` | Replaces vendor matching `id` |
| `deleteVendor` | `(vendorId) => void` | Removes vendor by `id` |
| `addProduct` | `(product) => void` | Appends product to `products` array |
| `updateProduct` | `(updatedProduct) => void` | Replaces product matching `id` |
| `deleteProduct` | `(productId) => void` | Removes product by `id` |
| `addExpense` | `(expense) => void` | Prepends expense to `expenses` array |
| `updateExpense` | `(updatedExpense) => void` | Replaces expense matching `id` |
| `deleteExpense` | `(expenseId) => void` | Removes expense by `id` |
| `addBill` | `(bill) => void` | Appends bill to `bills` array |
| `updateBill` | `(updatedBill) => void` | Replaces bill matching `id` |
| `addEstimate` | `(estimate) => void` | Appends estimate to `estimates` array |
| `updateEstimate` | `(updatedEstimate) => void` | Replaces estimate matching `id` |
| `addTransaction` | `(transaction) => void` | Prepends transaction to `transactions` array |
| `updateTransaction` | `(updatedTransaction) => void` | Replaces transaction matching `id` |
| `categorizeTransaction` | `(txId, category) => void` | Sets `category` and changes `status` to `"posted"` |
| `addAccount` | `(account) => void` | Appends account to `accounts` array |
| `updateAccount` | `(updatedAccount) => void` | Replaces account matching `id` |
| `toggleReportStar` | `(reportId) => void` | Toggles `starred` boolean on matching report |

## Key ID Cross-References

- `Invoice.customerId` -> `Customer.id`
- `Estimate.customerId` -> `Customer.id`
- `Expense.vendorId` -> `Vendor.id` (nullable)
- `Expense.customerId` -> `Customer.id` (nullable, for billable expenses)
- `Expense.accountId` -> `Account.id`
- `Bill.vendorId` -> `Vendor.id`
- `Transaction.accountId` -> `Account.id`
- `Transaction.matchedTo` -> `Invoice.id` or `Expense.id` (nullable)
- `InvoiceItem.productId` -> `Product.id`
- `Project.customerId` -> `Customer.id`

## Default Account IDs Quick Reference

| ID | Number | Name | Type |
|----|--------|------|------|
| `acc1` | 10100 | Checking | Bank |
| `acc2` | 10200 | Savings | Bank |
| `acc3` | 11000 | Accounts Receivable | Accounts Receivable |
| `acc4` | 12000 | Inventory Asset | Other Current Assets |
| `acc5` | 13000 | Prepaid Insurance | Other Current Assets |
| `acc6` | 15000 | Furniture & Equipment | Fixed Assets |
| `acc7` | 15100 | Computers | Fixed Assets |
| `acc8` | 20000 | Accounts Payable | Accounts Payable |
| `acc9` | 30000 | Owner's Equity | Equity |
| `acc10` | 21000 | Visa | Credit Card |
| `acc11` | 21100 | Mastercard | Credit Card |
| `acc12` | 30100 | Retained Earnings | Equity |
| `acc13`-`acc15` | 40000-40200 | Sales / Service Revenue / Consulting | Income |
| `acc16` | 50000 | Cost of Goods Sold | Cost of Goods Sold |
| `acc17`-`acc20` | 60100-60400 | Rent / Utilities / Office Supplies / Travel | Expenses |
