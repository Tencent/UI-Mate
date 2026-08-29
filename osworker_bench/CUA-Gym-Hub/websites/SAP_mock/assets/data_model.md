# XAP S/4HANA Mock — Data Model

This document defines all entity types, their fields, relationships, and example values for the `dataManager.js` `createInitialData()` function.

---

## Entity Overview

| Entity | Count | Purpose |
|--------|-------|---------|
| `currentUser` | 1 | The logged-in user |
| `companyInfo` | 1 | Company/org context |
| `navigationTabs` | ~12 | Module tab navigation items |
| `tileGroups` | ~8 | Groups of tiles on the launchpad |
| `tiles` | ~40 | Individual app tiles |
| `purchaseOrders` | 15 | PO list and detail |
| `purchaseOrderItems` | ~40 | Line items for POs |
| `salesOrders` | 12 | SO list and detail |
| `salesOrderItems` | ~35 | Line items for SOs |
| `materials` | 20 | Product/material master records |
| `suppliers` | 10 | Vendor/supplier master data |
| `customers` | 10 | Customer master data |
| `journalEntries` | 15 | FI journal entries |
| `journalEntryItems` | ~40 | Line items for JE |
| `notifications` | 8 | Notification center items |
| `plants` | 3 | Manufacturing plants |
| `companyCode` | 1 | Company code for FI |

---

## Entity Definitions

### currentUser
```javascript
{
  id: "user-001",
  firstName: "Michael",
  lastName: "Quinn",
  initials: "MQ",
  email: "michael.quinn@bestrun.com",
  role: "Procurement Manager",
  avatarColor: "#0A6ED1",  // blue circle
  department: "Procurement",
  plant: "1000",
  companyCode: "1000",
  language: "EN",
  dateFormat: "MM/DD/YYYY",
  timezone: "America/New_York"
}
```

### companyInfo
```javascript
{
  companyCode: "1000",
  companyName: "BestRun US",
  currency: "USD",
  country: "US",
  fiscalYearVariant: "K4",
  currentFiscalYear: "2024"
}
```

### navigationTabs
Array of module tabs for the horizontal navigation bar.
```javascript
{
  id: "tab-001",
  label: "My Home",
  key: "my-home",
  isDefault: true,
  order: 0
}
```
Tabs to include:
- My Home, Accounts Payable, Accounts Receivable, General Ledger, Cash Management, Procurement, Sales, Production, Warehouse Management, Quality Management, Master Data, Analytics

### tileGroups
Groups that organize tiles on the launchpad.
```javascript
{
  id: "group-001",
  title: "Purchase Order Processing",
  tabKey: "procurement",  // which tab this group appears under
  order: 0
}
```
Groups to include:
- **Procurement tab**: Purchase Order Processing, Source of Supply Management, Purchase Requisitions
- **Sales tab**: Sales Order Processing, Customer Returns, Billing
- **My Home tab**: Recently Added Apps, Favorites
- **Accounts Payable tab**: Accounts Payable, Invoice Processing
- **Accounts Receivable tab**: Accounts Receivable, Dispute Management
- **General Ledger tab**: Journal Entries, Closing Operations
- **Master Data tab**: Product Master, Business Partner, Customer Master

### tiles
Individual app tiles within groups.
```javascript
{
  id: "tile-001",
  groupId: "group-001",
  title: "Manage Purchase Orders",
  subtitle: "",
  icon: "shopping-cart",     // icon identifier
  type: "static",            // "static" | "numeric" | "kpi"
  numericValue: null,
  numericUnit: null,
  kpiData: null,
  appRoute: "/app/manage-purchase-orders",  // route when clicked
  order: 0,
  isActive: true
}
```

**Tile type examples:**

Static tile:
```javascript
{ title: "Procurement Overview", subtitle: "", icon: "document", type: "static" }
```

Numeric tile:
```javascript
{ title: "Monitor Purchase Order Items", subtitle: "", icon: "purchase-order",
  type: "numeric", numericValue: 318, numericUnit: "Overdue" }
```

KPI tile:
```javascript
{ title: "Cash Discount Utilization", subtitle: "Today", icon: null,
  type: "kpi", numericValue: 11.79, numericUnit: "%",
  kpiData: { trend: "down", status: "warning" } }
```

**Full tile inventory (organized by tab/group):**

**Procurement tab:**
- Procurement Overview (static, icon: clipboard)
- Manage Purchase Orders (static, icon: shopping-cart) → `/app/manage-purchase-orders`
- Monitor Purchase Order Items (numeric: 318 Overdue)
- Create Purchase Order (static, icon: add-document) → `/app/create-purchase-order`
- Monitor Supplier Confirmations (numeric: 7 Pending Confirmations)
- Manage Sources Of Supply (static, icon: list)
- Manage Purchasing Info Records (static)
- Manage RFQs (static, icon: grid)
- Monitor RFQ Items (numeric: 0 Overdue)
- Manage Supplier Quotations (static, icon: grid)

**Sales tab:**
- Manage Sales Orders (numeric: 633) → `/app/manage-sales-orders`
- Create Sales Order (static) → `/app/create-sales-order`
- Maintain Business Partner (static, icon: person)
- Post Goods Movement (static, icon: truck)
- Display Stock Overview (static, icon: bar-chart)
- Create Material (static, icon: add-document)
- Create Inquiry (static)
- Display Inquiry (static)
- Manage Outbound Deliveries (numeric: 0)
- Create Billing Documents (numeric: 575)

**Accounts Payable tab:**
- Manage Payment Blocks (static, icon: document)
- Manage Supplier Line Items (static, icon: person-finance)
- Accounts Payable Overview (static, icon: chart)
- Overdue Payables (numeric, value loaded dynamically)
- Cash Discount Utilization (kpi: 11.79%)
- Cash Discount Forecast (kpi: 273.8K EUR)
- Aging Analysis (kpi: 52.81M EUR)

**Accounts Receivable tab:**
- Display Customer Balances (static, icon: customer)
- Manage Customer Line Items (static)
- Process Receivables (static, icon: document)
- Post Incoming Payments (static, icon: dollar)
- Manage Dispute Cases (numeric: 0 Open)
- Overdue Receivables (numeric, loading)
- Total Receivables (numeric, loading)

**Master Data tab:**
- Manage Product Master Data (static) → `/app/manage-products`
- Manage Business Partner Master Data (static, icon: person)
- Manage Customer Master Data (static, icon: customer)

---

### purchaseOrders
```javascript
{
  id: "po-001",
  poNumber: "4500001234",
  supplier: "sup-001",           // FK → suppliers
  supplierName: "Global Parts Inc.",
  poType: "NB",                  // NB = Standard PO
  poTypeName: "Standard PO",
  purchasingOrg: "1000",
  purchasingOrgName: "BestRun Purchasing Org",
  purchasingGroup: "Z01",
  purchasingGroupName: "General Purchasing",
  companyCode: "1000",
  createdDate: "2024-01-15",
  createdBy: "Michael Quinn",
  totalNetValue: 15420.00,
  currency: "USD",
  status: "Ordered",             // "Draft" | "Ordered" | "Partially Delivered" | "Fully Delivered" | "Closed"
  deliveryStatus: "Overdue",     // "On Time" | "Overdue" | "Partially Received" | "Received"
  plant: "1000",
  plantName: "US Plant Dallas",
  paymentTerms: "NET30",
  incoterms: "FOB",
  notes: "Urgent order for Q1 production",
  lastChanged: "2024-02-10",
  lastChangedBy: "Michael Quinn"
}
```

**Status distribution for 15 POs:**
- 3 Draft
- 5 Ordered
- 3 Partially Delivered
- 3 Fully Delivered
- 1 Closed

### purchaseOrderItems
```javascript
{
  id: "poi-001",
  poId: "po-001",               // FK → purchaseOrders
  itemNumber: 10,               // increments by 10: 10, 20, 30...
  materialId: "mat-001",        // FK → materials
  materialName: "Aluminum Sheet 2mm",
  materialNumber: "MAT-1001",
  quantity: 500,
  unit: "PC",                   // "PC" | "KG" | "EA" | "L" | "M"
  netPrice: 12.50,
  priceUnit: 1,
  netValue: 6250.00,
  currency: "USD",
  deliveryDate: "2024-02-15",
  plant: "1000",
  storageLocation: "SL01",
  taxCode: "V1",
  accountAssignment: "K",       // K=Cost Center
  costCenter: "CC1000",
  glAccount: "400000"
}
```

### salesOrders
```javascript
{
  id: "so-001",
  soNumber: "1000001234",
  customer: "cust-001",         // FK → customers
  customerName: "Norelem Iberica S.L.",
  orderType: "OR",              // OR = Standard Order
  orderTypeName: "Standard Order",
  salesOrg: "1000",
  salesOrgName: "BestRun Sales Org",
  distributionChannel: "Z1",
  division: "Z1",
  createdDate: "2024-01-20",
  createdBy: "Michael Quinn",
  totalNetValue: 24850.00,
  currency: "USD",
  status: "Open",               // "Open" | "In Process" | "Completed" | "Cancelled"
  overallDeliveryStatus: "Not Delivered",  // "Not Delivered" | "Partially Delivered" | "Fully Delivered"
  overallBillingStatus: "Not Billed",
  requestedDeliveryDate: "2024-02-28",
  customerReference: "PO-REF-4578",
  soldToParty: "cust-001",
  shipToParty: "cust-001",
  paymentTerms: "NET30",
  incoterms: "CIF",
  lastChanged: "2024-02-01",
  lastChangedBy: "Michael Quinn"
}
```

**Status distribution for 12 SOs:**
- 4 Open
- 4 In Process
- 3 Completed
- 1 Cancelled

### salesOrderItems
```javascript
{
  id: "soi-001",
  soId: "so-001",               // FK → salesOrders
  itemNumber: 10,
  materialId: "mat-003",
  materialName: "Industrial Valve A200",
  materialNumber: "MAT-1003",
  quantity: 100,
  unit: "PC",
  netPrice: 45.00,
  netValue: 4500.00,
  currency: "USD",
  plant: "1000",
  deliveryDate: "2024-02-28",
  deliveryStatus: "Not Delivered",
  billingStatus: "Not Billed",
  rejectionReason: null
}
```

### materials (Product Master)
```javascript
{
  id: "mat-001",
  materialNumber: "MAT-1001",
  description: "Aluminum Sheet 2mm",
  materialGroup: "L001",
  materialGroupName: "Trading Materials",
  materialType: "HAWA",         // HAWA=Trading Goods, ROH=Raw Material, FERT=Finished, HALB=Semi-Finished
  materialTypeName: "Trading Goods",
  baseUnit: "PC",
  grossWeight: 2.5,
  netWeight: 2.3,
  weightUnit: "KG",
  productCategory: "Product",
  division: "Z1",
  gtin: "",
  image: null,                  // thumbnail placeholder
  standardPrice: 12.50,
  currency: "USD",
  plantData: {
    plant: "1000",
    storageLocation: "SL01",
    mrpType: "PD",              // PD=MRP
    reorderPoint: 100,
    safetyStock: 50,
    lotSize: "EX",              // EX=Lot-for-Lot
    plannedDeliveryTime: 5       // days
  },
  stockQuantity: 1250,
  lastChanged: "2024-03-17",
  lastChangedBy: "Michael Quinn"
}
```

**20 materials covering different types:**
- 6 Trading Goods (HAWA): Aluminum Sheet, Steel Rod, Copper Wire, etc.
- 5 Raw Materials (ROH): PC, Printer, Software, etc.
- 5 Finished Products (FERT): Industrial Valve, Motor Assembly, etc.
- 4 Semi-Finished (HALB): Circuit Board, Pump Housing, etc.

### suppliers
```javascript
{
  id: "sup-001",
  supplierNumber: "17411730",
  name: "Global Parts Inc.",
  name2: "",
  country: "US",
  city: "Dallas",
  postalCode: "75201",
  street: "1234 Industrial Blvd",
  region: "TX",
  phone: "+1 214 555 1234",
  email: "orders@globalparts.com",
  taxNumber: "US123456789",
  paymentTerms: "NET30",
  currency: "USD",
  accountGroup: "Vendor",
  purchasingOrg: "1000",
  isBlocked: false
}
```

### customers
```javascript
{
  id: "cust-001",
  customerNumber: "1000260",
  name: "Norelem Iberica S.L.",
  name2: "",
  country: "ES",
  city: "Barcelona",
  postalCode: "08001",
  street: "Carrer de Valencia 123",
  region: "",
  phone: "+34 93 555 1234",
  email: "purchasing@norelem.es",
  salesOrg: "1000",
  distributionChannel: "Z1",
  division: "Z1",
  paymentTerms: "NET30",
  currency: "EUR",
  creditLimit: 500000.00,
  accountGroup: "Customer"
}
```

### journalEntries
```javascript
{
  id: "je-001",
  documentNumber: "1000000001",
  companyCode: "1000",
  fiscalYear: "2024",
  fiscalPeriod: "01",
  documentType: "SA",           // SA=GL Account, KR=Vendor Invoice, DR=Customer Invoice
  documentTypeName: "G/L Account Document",
  postingDate: "2024-01-15",
  documentDate: "2024-01-15",
  entryDate: "2024-01-15",
  reference: "INV-2024-001",
  headerText: "Monthly accrual January",
  totalDebit: 15000.00,
  totalCredit: 15000.00,
  currency: "USD",
  status: "Posted",             // "Posted" | "Parked" | "Reversed"
  createdBy: "Michael Quinn",
  ledgerGroup: "0L"             // Leading Ledger
}
```

### journalEntryItems
```javascript
{
  id: "jei-001",
  journalEntryId: "je-001",     // FK → journalEntries
  itemNumber: 1,
  glAccount: "400000",
  glAccountName: "Cost of Goods Sold",
  debitAmount: 15000.00,
  creditAmount: 0,
  currency: "USD",
  costCenter: "CC1000",
  costCenterName: "Production Center",
  profitCenter: "PC1000",
  taxCode: "",
  assignment: "JAN-2024",
  text: "Monthly COGS accrual"
}
```

### notifications
```javascript
{
  id: "notif-001",
  title: "Purchase Order 4500001234 approved",
  description: "Your purchase order for Global Parts Inc. has been approved by John Smith.",
  timestamp: "2024-03-10T14:30:00Z",
  type: "success",              // "success" | "warning" | "error" | "info"
  priority: "medium",           // "high" | "medium" | "low"
  isRead: false,
  category: "Procurement",
  actionUrl: "/app/manage-purchase-orders",
  icon: "shopping-cart"
}
```

**8 notifications covering:**
- 2 PO approval notifications
- 1 Overdue delivery warning
- 1 Invoice posted info
- 1 Sales order created success
- 1 Material stock below safety level warning
- 1 Payment block error
- 1 System maintenance info

### plants
```javascript
{
  id: "plant-1000",
  plantCode: "1000",
  name: "US Plant Dallas",
  city: "Dallas",
  country: "US"
}
```

Plants: 1000 (US Plant Dallas), 1100 (US Plant Chicago), 2000 (EU Plant Frankfurt)

---

## Relationships Diagram

```
currentUser ─── owns ──→ purchaseOrders, salesOrders, journalEntries
                          (createdBy field)

purchaseOrders ──→ purchaseOrderItems (1:many, via poId)
               ──→ suppliers (many:1, via supplier FK)

salesOrders    ──→ salesOrderItems (1:many, via soId)
               ──→ customers (many:1, via customer FK)

journalEntries ──→ journalEntryItems (1:many, via journalEntryId)

materials      ←── purchaseOrderItems (via materialId)
               ←── salesOrderItems (via materialId)

tiles          ──→ tileGroups (many:1, via groupId)
tileGroups     ──→ navigationTabs (many:1, via tabKey)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* single user object */ },
    companyInfo: { /* single company object */ },
    navigationTabs: [ /* 12 tab objects */ ],
    tileGroups: [ /* ~8 group objects */ ],
    tiles: [ /* ~40 tile objects */ ],
    purchaseOrders: [ /* 15 PO objects */ ],
    purchaseOrderItems: [ /* ~40 item objects */ ],
    salesOrders: [ /* 12 SO objects */ ],
    salesOrderItems: [ /* ~35 item objects */ ],
    materials: [ /* 20 material objects */ ],
    suppliers: [ /* 10 supplier objects */ ],
    customers: [ /* 10 customer objects */ ],
    journalEntries: [ /* 15 JE objects */ ],
    journalEntryItems: [ /* ~40 item objects */ ],
    notifications: [ /* 8 notification objects */ ],
    plants: [ /* 3 plant objects */ ],
    // UI state
    activeTab: "my-home",
    searchQuery: "",
    notificationCount: 5,       // unread count
    selectedVariant: "Standard",
    filterState: {}              // per-app filter values
  };
}
```
