# XuickBooks Online Mock — Data Model

> Last updated: 2025-03-09 by plan agent
> This file defines all entity types for `createInitialData()` in `src/lib/initialData.js`

---

## §Company (singleton)

The logged-in company context. Not stored as an array — just a single object.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | "Acme Corp" | Company display name shown in top bar |
| address | string | "123 Business Rd, San Francisco, CA 94105" | |
| phone | string | "(555) 123-4567" | |
| email | string | "admin@acmecorp.com" | |
| website | string | "www.acmecorp.com" | |
| industry | string | "Technology Services" | |
| taxId | string | "12-3456789" | EIN |
| fiscalYearStart | string | "January" | |
| accountingMethod | string | "Accrual" | "Cash" or "Accrual" |

---

## §Customers

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "c1" | Unique identifier |
| name | string | "Acme Corp" | Display name |
| company | string | "Acme Corporation" | Company/business name |
| email | string | "billing@acme.com" | Primary email |
| phone | string | "(555) 010-1234" | Primary phone |
| address | string | "456 Client Ave, Oakland, CA 94612" | Billing address |
| balance | number | 1200.00 | Open balance (computed from unpaid invoices) |
| notes | string | "Net 30 terms preferred" | Internal notes |
| isActive | boolean | true | Whether customer is active |
| createdAt | string | "2024-01-15" | ISO date string |

**Seed requirement**: 8-10 customers with varied names (mix of businesses: "Amy's Bird Sanctuary", "Bill's Windsurf Shop", "Cool Cars", "Diego Rodriguez", "Dukes Basketball Camp", "Freeman Sporting Goods", "Geeta Kalapatapu", "Jeff's Jalopies", "John Melton", "Kookies by Kathy"). Some with open balances, some with zero balance.

---

## §Vendors

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "v1" | Unique identifier |
| name | string | "Office Depot" | Vendor display name |
| company | string | "Office Depot Inc." | |
| email | string | "orders@officedepot.com" | |
| phone | string | "(800) 463-3768" | |
| address | string | "6600 North Military Trail, Boca Raton, FL 33496" | |
| balance | number | 250.00 | Amount owed to this vendor |
| isActive | boolean | true | |
| createdAt | string | "2024-01-10" | |

**Seed requirement**: 6-8 vendors (e.g., "Office Depot", "Google Cloud", "Amazon Web Services", "Uber", "Starbucks Corporate", "Adobe Systems", "Pacific Gas & Electric", "State Farm Insurance").

---

## §Products (Products & Services)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "p1" | Unique identifier |
| name | string | "Consulting Services" | Product/service name |
| description | string | "Hourly consulting" | |
| type | string | "Service" | "Service" or "Product" (inventory) |
| price | number | 150.00 | Default sales price/rate |
| cost | number | 0.00 | Purchase cost (for products) |
| category | string | "Services" | Income account category |
| sku | string | "" | SKU for inventory items |
| isActive | boolean | true | |
| isTaxable | boolean | false | Whether sales tax applies |
| quantityOnHand | number | null | null for services, number for products |

**Seed requirement**: 6-8 items (mix of services and products): "Consulting Services" ($150/hr), "Web Development" ($100/hr), "Software License" ($499), "Design Services" ($125/hr), "Premium Support" ($75/hr), "Laptop Computer" ($1,200, product, qty: 5), "Office Chair" ($350, product, qty: 12).

---

## §Invoices

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "inv1" | Unique identifier |
| number | string | "1001" | Sequential invoice number |
| customerId | string | "c1" | Reference to customer |
| date | string | "2024-02-15" | Invoice date (ISO) |
| dueDate | string | "2024-03-17" | Due date (ISO) |
| items | array | see below | Line items |
| subtotal | number | 1200.00 | Before tax |
| tax | number | 0.00 | Tax amount |
| total | number | 1200.00 | Final total |
| status | string | "Overdue" | "Draft", "Sent", "Viewed", "Paid", "Overdue", "Partial" |
| paidAmount | number | 0.00 | Amount paid so far |
| paidDate | string\|null | "2024-03-01" | Date payment received |
| terms | string | "Net 30" | Payment terms |
| message | string | "Thank you for your business!" | Message on invoice |
| createdAt | string | "2024-02-15T10:00:00Z" | |

### Invoice Line Item

| Field | Type | Example |
|-------|------|---------|
| id | string | "item1" |
| productId | string | "p1" |
| description | string | "Consulting - January" |
| qty | number | 8 |
| rate | number | 150.00 |
| amount | number | 1200.00 |

**Seed requirement**: 6-8 invoices across different statuses:
- 2 Overdue (past due date, unpaid)
- 2 Sent/Open (not yet due)
- 2 Paid (with paidDate set)
- 1 Draft
- 1 Partial (partially paid)

---

## §Estimates

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "est1" | Unique identifier |
| number | string | "E-1001" | Estimate number |
| customerId | string | "c1" | |
| date | string | "2024-02-10" | |
| expiryDate | string | "2024-03-10" | |
| items | array | same as invoice items | |
| total | number | 5000.00 | |
| status | string | "Pending" | "Draft", "Pending", "Accepted", "Rejected", "Converted" |

**Seed requirement**: 3 estimates in different statuses.

---

## §Expenses

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "exp1" | Unique identifier |
| date | string | "2024-03-01" | |
| payee | string | "Office Depot" | Payee/vendor name |
| vendorId | string\|null | "v1" | Optional link to vendor |
| category | string | "Office Supplies" | Expense account category |
| amount | number | 45.20 | |
| description | string | "Paper and pens" | |
| accountId | string | "acc1" | Payment account (bank/cc) |
| receipt | string | "" | Receipt URL/reference |
| isBillable | boolean | false | Billable to a customer? |
| customerId | string\|null | null | If billable, which customer |
| status | string | "Cleared" | "Pending", "Cleared" |

**Seed requirement**: 10-12 expenses across different categories: Office Supplies, Travel, Meals & Entertainment, Software/Subscriptions, Rent, Utilities, Insurance, Professional Services, Advertising. Spread across the last 60 days.

---

## §Bills

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "bill1" | |
| vendorId | string | "v1" | |
| number | string | "B-5001" | Vendor's bill/reference number |
| date | string | "2024-02-20" | Bill date |
| dueDate | string | "2024-03-20" | Due date |
| items | array | see invoice line items | Line items |
| total | number | 1500.00 | |
| status | string | "Open" | "Draft", "Open", "Overdue", "Paid" |
| paidDate | string\|null | null | |

**Seed requirement**: 4-5 bills (some open, some paid, one overdue).

---

## §Accounts (Chart of Accounts)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "acc1" | Unique identifier |
| number | string | "10100" | Account number |
| name | string | "Checking" | Account name |
| type | string | "Bank" | Account type (see below) |
| detailType | string | "Checking" | Sub-type |
| balance | number | 12450.00 | Current balance |
| bankBalance | number | 12500.00 | Bank-reported balance (may differ) |
| isActive | boolean | true | |

**Account types**: Bank, Accounts Receivable, Other Current Assets, Fixed Assets, Accounts Payable, Other Current Liabilities, Long Term Liabilities, Equity, Income, Cost of Goods Sold, Expenses, Other Income, Other Expenses.

**Seed requirement**: 15-20 accounts covering standard chart of accounts:
- Bank: Checking (10100), Savings (10200)
- AR: Accounts Receivable (11000)
- Other Current: Inventory Asset (12000), Prepaid Insurance (13000)
- Fixed: Furniture & Equipment (15000), Computers (15100)
- AP: Accounts Payable (20000)
- Credit Card: Visa (21000), Mastercard (21100)
- Income: Sales (40000), Service Revenue (40100), Consulting (40200)
- COGS: Cost of Goods Sold (50000)
- Expenses: Rent (60100), Utilities (60200), Office Supplies (60300), Travel (60400), Insurance (60500), Professional Services (60600), Advertising (60700), Software (60800), Meals & Entertainment (60900)
- Equity: Owner's Equity (30000), Retained Earnings (30100)

---

## §Transactions (Bank Feed)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "tx1" | |
| accountId | string | "acc1" | Which bank account |
| date | string | "2024-03-05" | |
| description | string | "ACH Deposit - Acme Corp" | Bank description |
| payee | string | "Acme Corp" | Recognized payee |
| amount | number | 1200.00 | Positive = deposit, negative = withdrawal |
| type | string | "credit" | "credit" or "debit" |
| category | string | "Sales" | Assigned expense/income category |
| matchedTo | string\|null | "inv1" | Matched invoice/expense ID |
| status | string | "pending" | "pending" (For Review), "posted" (Reviewed), "excluded" |
| isReconciled | boolean | false | |

**Seed requirement**: 15-20 transactions over the last 30 days. Mix of:
- 5-6 "pending" (For Review) — uncategorized, need agent to categorize
- 8-10 "posted" (Reviewed) — already categorized
- 2-3 matched to invoices or expenses
- Mix of credits (deposits) and debits (expenses)

---

## §Employees

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "emp1" | |
| name | string | "John Doe" | |
| email | string | "john@acmecorp.com" | |
| role | string | "Senior Developer" | Job title |
| department | string | "Engineering" | |
| salary | number | 80000 | Annual salary |
| payFrequency | string | "Bi-weekly" | |
| startDate | string | "2023-01-15" | |
| isActive | boolean | true | |

**Seed requirement**: 4-5 employees.

---

## §Projects

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "proj1" | |
| name | string | "Website Redesign" | |
| customerId | string | "c1" | |
| status | string | "In Progress" | "Planning", "In Progress", "Completed", "On Hold" |
| budget | number | 5000 | |
| spent | number | 2340 | Total expenses + time logged against this project |
| startDate | string | "2024-01-15" | |
| endDate | string\|null | null | |
| description | string | "Complete redesign of client website" | |

**Seed requirement**: 3-4 projects with different statuses.

---

## §Reports (pre-configured report definitions)

Reports are NOT stored as data — they are computed from the entities above. However, we define a list of report templates for the Reports page:

```javascript
reportCategories: [
  {
    name: "Business overview",
    reports: [
      { id: "profit-loss", name: "Profit and Loss", starred: true },
      { id: "balance-sheet", name: "Balance Sheet", starred: true },
      { id: "balance-sheet-detail", name: "Balance Sheet Detail", starred: false },
      { id: "cash-flow", name: "Statement of Cash Flows", starred: false },
      { id: "budget-overview", name: "Budget Overview", starred: false },
      { id: "budget-vs-actuals", name: "Budget vs. Actuals", starred: false },
      { id: "audit-log", name: "Audit Log", starred: false },
    ]
  },
  {
    name: "Sales and customers",
    reports: [
      { id: "invoice-list", name: "Invoice List", starred: false },
      { id: "sales-by-customer", name: "Sales by Customer Summary", starred: true },
      { id: "sales-by-product", name: "Sales by Product/Service Summary", starred: false },
      { id: "customer-balance", name: "Customer Balance Summary", starred: false },
      { id: "collections", name: "Collections Report", starred: false },
      { id: "estimates-by-customer", name: "Estimates by Customer", starred: false },
    ]
  },
  {
    name: "Expenses and vendors",
    reports: [
      { id: "expenses-by-vendor", name: "Expenses by Vendor Summary", starred: false },
      { id: "unpaid-bills", name: "Unpaid Bills", starred: true },
      { id: "vendor-balance", name: "Vendor Balance Summary", starred: false },
      { id: "ap-aging", name: "A/P Aging Summary", starred: false },
    ]
  },
  {
    name: "Employees",
    reports: [
      { id: "payroll-summary", name: "Payroll Summary", starred: false },
      { id: "employee-details", name: "Employee Details", starred: false },
    ]
  }
]
```

---

## createInitialData() Structure

```javascript
export const generateInitialData = () => {
  return {
    company: { /* §Company fields */ },
    customers: [ /* §Customers - 8-10 records */ ],
    vendors: [ /* §Vendors - 6-8 records */ ],
    products: [ /* §Products - 6-8 records */ ],
    invoices: [ /* §Invoices - 6-8 records with items */ ],
    estimates: [ /* §Estimates - 3 records */ ],
    expenses: [ /* §Expenses - 10-12 records */ ],
    bills: [ /* §Bills - 4-5 records */ ],
    accounts: [ /* §Accounts - 15-20 chart of accounts */ ],
    transactions: [ /* §Transactions - 15-20 bank feed items */ ],
    employees: [ /* §Employees - 4-5 records */ ],
    projects: [ /* §Projects - 3-4 records */ ],
    reportCategories: [ /* Report template definitions */ ],
  };
};
```

### Entity Relationships Diagram

```
Company (singleton)
  ├── Customers ──┬── Invoices (customerId → customer.id)
  │               ├── Estimates (customerId → customer.id)
  │               └── Projects (customerId → customer.id)
  ├── Vendors ────┬── Bills (vendorId → vendor.id)
  │               └── Expenses (vendorId → vendor.id, optional)
  ├── Products ───┬── Invoice.items[].productId → product.id
  │               └── Estimate.items[].productId → product.id
  ├── Accounts ───┬── Transactions (accountId → account.id)
  │               └── Expenses (accountId → account.id)
  ├── Employees
  └── Projects ──── Expenses can be linked to projects (optional)
```
