# SAP_mock Schema

**Deploy order**: 43 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8043)
**Base URL**: `http://172.17.46.46:8043/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State inspect**: `GET /state?sid=<sid>` → `{has_custom_state, stored_state}`

## Application Overview

XAP S/4HANA Fiori-style mock application implementing:
- **My Home** — Launchpad with tile groups per module tab
- **Manage Purchase Orders** — List report with filter bar, detail page, create form
- **Manage Sales Orders** — List report with filter bar, detail page, create form
- **Manage Products (Material Master)** — List report, detail page
- **Journal Entries** — List report, detail page, create form
- `/go` — State inspection page (dark JSON output)

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Launchpad with navigation tabs and app tiles |
| `/app/manage-purchase-orders` | `ManagePurchaseOrders` | PO list report with filter bar |
| `/app/purchase-order/:id` | `PurchaseOrderDetail` | PO object page (view/edit/delete) |
| `/app/create-purchase-order` | `CreatePurchaseOrder` | PO creation form |
| `/app/manage-sales-orders` | `ManageSalesOrders` | SO list report with filter bar |
| `/app/sales-order/:id` | `SalesOrderDetail` | SO object page (view/edit) |
| `/app/create-sales-order` | `CreateSalesOrder` | SO creation form |
| `/app/manage-products` | `ManageProducts` | Material list report with filter bar |
| `/app/product/:id` | `ProductDetail` | Material object page (view/edit) |
| `/app/journal-entries` | `JournalEntries` | JE list report with filter bar |
| `/app/journal-entry/:id` | `JournalEntryDetail` | JE object page (view/edit/post/reverse) |
| `/app/create-journal-entry` | `CreateJournalEntry` | JE creation form with balance validation |
| `/go` | `Go` | State inspector — renders `{initial_state, current_state, state_diff}` as JSON |

All unrecognized paths redirect to `/`.

## State Schema

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `currentUser` | object | see below | Logged-in user profile |
| `companyInfo` | object | see below | Active company context |
| `navigationTabs` | array | 12 items | Module tab bar items |
| `tileGroups` | array | 10 items | Tile group containers per tab |
| `tiles` | array | 31 items | App launcher tiles |
| `purchaseOrders` | array | 15 items | Purchase order headers |
| `purchaseOrderItems` | array | 25 items | Purchase order line items |
| `salesOrders` | array | 12 items | Sales order headers |
| `salesOrderItems` | array | 21 items | Sales order line items |
| `materials` | array | 20 items | Material master records |
| `suppliers` | array | 10 items | Vendor/supplier records |
| `customers` | array | 10 items | Customer records |
| `journalEntries` | array | 15 items | FI journal entry headers |
| `journalEntryItems` | array | 20 items | FI journal entry line items |
| `notifications` | array | 8 items | Shell bar notification items |
| `plants` | array | 3 items | Plant master records |
| `activeTab` | string | `"my-home"` | Currently selected navigation tab key |
| `searchQuery` | string | `""` | Current shell bar search text |
| `notificationCount` | number | `5` | Unread notification badge count |
| `selectedVariant` | string | `"Standard"` | Selected list report variant name |
| `filterState` | object | `{}` | Per-list-page applied filter values |

### `currentUser` fields

| Field | Type | Default |
|-------|------|---------|
| `id` | string | `"user-001"` |
| `firstName` | string | `"Michael"` |
| `lastName` | string | `"Quinn"` |
| `initials` | string | `"MQ"` |
| `email` | string | `"michael.quinn@bestrun.com"` |
| `role` | string | `"Procurement Manager"` |
| `avatarColor` | string | `"#0A6ED1"` |
| `department` | string | `"Procurement"` |
| `plant` | string | `"1000"` |
| `companyCode` | string | `"1000"` |
| `language` | string | `"EN"` |
| `dateFormat` | string | `"MM/DD/YYYY"` |
| `timezone` | string | `"America/New_York"` |

### `companyInfo` fields

| Field | Type | Default |
|-------|------|---------|
| `companyCode` | string | `"1000"` |
| `companyName` | string | `"BestRun US"` |
| `currency` | string | `"USD"` |
| `country` | string | `"US"` |
| `fiscalYearVariant` | string | `"K4"` |
| `currentFiscalYear` | string | `"2024"` |

### `navigationTabs` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"tab-001"` |
| `label` | string | Display label |
| `key` | string | Identifier used by `activeTab` |
| `isDefault` | boolean | `true` for My Home tab |
| `order` | number | Display order |

Default tabs (tab-001 through tab-012): My Home, Accounts Payable, Accounts Receivable, General Ledger, Cash Management, Procurement, Sales, Production, Warehouse Management, Quality Management, Master Data, Analytics.

### `tileGroups` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"group-001"` |
| `title` | string | Group heading text |
| `tabKey` | string | Which navigation tab this group belongs to |
| `order` | number | Display order within the tab |

### `tiles` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"tile-001"` |
| `groupId` | string | Parent tileGroup id |
| `title` | string | Tile title |
| `subtitle` | string | Tile subtitle (optional) |
| `icon` | string or null | Icon name |
| `type` | string | `"static"`, `"numeric"`, or `"kpi"` |
| `numericValue` | number or null | KPI/numeric value |
| `numericUnit` | string or null | Unit label for numeric/kpi tiles |
| `kpiData` | object or null | `{trend, status}` for kpi tiles |
| `appRoute` | string | Client-side route to navigate to on click |
| `order` | number | Display order within the group |
| `isActive` | boolean | Whether the tile is visible |

### `purchaseOrders` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"po-001"` |
| `poNumber` | string | e.g. `"4500001234"` |
| `supplier` | string | Supplier ID reference |
| `supplierName` | string | Denormalized supplier name |
| `poType` | string | e.g. `"NB"`, `"FO"` |
| `poTypeName` | string | e.g. `"Standard PO"`, `"Framework Order"` |
| `purchasingOrg` | string | |
| `purchasingOrgName` | string | |
| `purchasingGroup` | string | |
| `purchasingGroupName` | string | |
| `companyCode` | string | `"1000"` or `"2000"` |
| `createdDate` | string | ISO date |
| `createdBy` | string | User full name |
| `totalNetValue` | number | Sum of line item net values |
| `currency` | string | ISO currency code |
| `status` | string | See PO statuses below |
| `deliveryStatus` | string | See PO delivery statuses below |
| `plant` | string | Plant code |
| `plantName` | string | Denormalized plant name |
| `paymentTerms` | string | e.g. `"NET30"` |
| `incoterms` | string | e.g. `"FOB"`, `"CIF"` |
| `notes` | string | Free-text notes |
| `lastChanged` | string | ISO date, auto-updated on edit |
| `lastChangedBy` | string | User full name, auto-set on edit |

### `purchaseOrderItems` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"poi-001"` |
| `poId` | string | Parent PO id |
| `itemNumber` | number | 10, 20, 30... |
| `materialId` | string | Material id reference |
| `materialName` | string | Denormalized |
| `materialNumber` | string | e.g. `"MAT-1001"` |
| `quantity` | number | |
| `unit` | string | e.g. `"PC"`, `"KG"`, `"EA"`, `"M"` |
| `netPrice` | number | Price per unit |
| `priceUnit` | number | Usually 1 |
| `netValue` | number | quantity * netPrice |
| `currency` | string | |
| `deliveryDate` | string | ISO date |
| `plant` | string | |
| `storageLocation` | string | |
| `taxCode` | string | |
| `accountAssignment` | string | |
| `costCenter` | string | |
| `glAccount` | string | |

### `salesOrders` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"so-001"` |
| `soNumber` | string | e.g. `"1000001234"` |
| `customer` | string | Customer id reference |
| `customerName` | string | Denormalized |
| `orderType` | string | e.g. `"OR"` |
| `orderTypeName` | string | e.g. `"Standard Order"` |
| `salesOrg` | string | |
| `salesOrgName` | string | |
| `distributionChannel` | string | |
| `division` | string | |
| `createdDate` | string | ISO date |
| `createdBy` | string | User full name |
| `totalNetValue` | number | Sum of line item net values |
| `currency` | string | |
| `status` | string | See SO statuses below |
| `overallDeliveryStatus` | string | `"Not Delivered"`, `"Partially Delivered"`, `"Fully Delivered"` |
| `overallBillingStatus` | string | `"Not Billed"`, `"Partially Billed"`, `"Fully Billed"` |
| `requestedDeliveryDate` | string | ISO date |
| `customerReference` | string | Customer PO reference number |
| `soldToParty` | string | Customer id |
| `shipToParty` | string | Customer id |
| `paymentTerms` | string | |
| `incoterms` | string | |
| `lastChanged` | string | ISO date, auto-updated on edit |
| `lastChangedBy` | string | Auto-set on edit |

### `salesOrderItems` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"soi-001"` |
| `soId` | string | Parent SO id |
| `itemNumber` | number | 10, 20, 30... |
| `materialId` | string | |
| `materialName` | string | Denormalized |
| `materialNumber` | string | |
| `quantity` | number | |
| `unit` | string | |
| `netPrice` | number | |
| `netValue` | number | |
| `currency` | string | |
| `plant` | string | |
| `deliveryDate` | string | ISO date |
| `deliveryStatus` | string | `"Not Delivered"`, `"Partially Delivered"`, `"Fully Delivered"` |
| `billingStatus` | string | `"Not Billed"`, `"Partially Billed"`, `"Fully Billed"` |
| `rejectionReason` | string or null | Reason for rejection if applicable |

### `materials` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"mat-001"` |
| `materialNumber` | string | e.g. `"MAT-1001"` |
| `description` | string | Material description |
| `materialGroup` | string | e.g. `"L001"` |
| `materialGroupName` | string | e.g. `"Sheet Metal"` |
| `materialType` | string | `"HAWA"`, `"ROH"`, `"FERT"`, or `"HALB"` |
| `materialTypeName` | string | Human-readable type |
| `baseUnit` | string | e.g. `"PC"`, `"KG"`, `"EA"`, `"M"`, `"L"` |
| `grossWeight` | number | |
| `netWeight` | number | |
| `weightUnit` | string | e.g. `"KG"` |
| `productCategory` | string | |
| `division` | string | |
| `gtin` | string | Global Trade Item Number |
| `image` | null | Always null in seed data |
| `standardPrice` | number | |
| `currency` | string | |
| `plantData` | object | `{plant, storageLocation, mrpType, reorderPoint, safetyStock, lotSize, plannedDeliveryTime}` |
| `stockQuantity` | number | Current stock level |
| `lastChanged` | string | ISO date, auto-updated on edit |
| `lastChangedBy` | string | Auto-set on edit |

### `suppliers` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"sup-001"` |
| `supplierNumber` | string | e.g. `"17411730"` |
| `name` | string | Primary name |
| `name2` | string | Secondary name |
| `country` | string | ISO 2-letter country |
| `city` | string | |
| `postalCode` | string | |
| `street` | string | |
| `region` | string | |
| `phone` | string | |
| `email` | string | |
| `taxNumber` | string | |
| `paymentTerms` | string | |
| `currency` | string | |
| `accountGroup` | string | |
| `purchasingOrg` | string | |
| `isBlocked` | boolean | |

### `customers` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"cust-001"` |
| `customerNumber` | string | e.g. `"1000260"` |
| `name` | string | |
| `name2` | string | |
| `country` | string | |
| `city` | string | |
| `postalCode` | string | |
| `street` | string | |
| `region` | string | |
| `phone` | string | |
| `email` | string | |
| `salesOrg` | string | |
| `distributionChannel` | string | |
| `division` | string | |
| `paymentTerms` | string | |
| `currency` | string | |
| `creditLimit` | number | |
| `accountGroup` | string | |

### `journalEntries` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"je-001"` or `"je-<timestamp>"` for new entries |
| `documentNumber` | string | e.g. `"1000000001"`. New entries: max+1 |
| `companyCode` | string | `"1000"` or `"2000"` |
| `fiscalYear` | string | e.g. `"2024"` |
| `fiscalPeriod` | string | e.g. `"01"` (seed data) / `postingPeriod` (new entries) |
| `documentType` | string | `"SA"`, `"DR"`, `"KR"`, or `"AB"` |
| `documentTypeName` | string | Seed: full name. New entries: not present |
| `postingDate` | string | ISO date |
| `documentDate` | string | ISO date |
| `entryDate` | string | ISO date (seed data only) |
| `reference` | string | Reference document number |
| `headerText` | string | Description |
| `totalDebit` | number | Total debit amount (seed data field) |
| `totalCredit` | number | Total credit amount (seed data field) |
| `totalAmount` | number | Sum of debit lines (new entries created via UI) |
| `currency` | string | |
| `status` | string | `"Posted"`, `"Parked"`, or `"Reversed"` |
| `createdBy` | string | User full name |
| `ledgerGroup` | string | `"0L"` (seed data only) |
| `postingPeriod` | string | e.g. `"03"` (new entries created via UI) |
| `notes` | string | Optional notes (editable in Parked state) |

> **Note**: Seed data entries use `totalDebit`/`totalCredit` and `fiscalPeriod`/`ledgerGroup`. New entries created via the UI use `totalAmount` and `postingPeriod` instead. Both are valid; the detail page computes debit/credit totals from `journalEntryItems`.

### `journalEntryItems` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"jei-001"` |
| `journalEntryId` | string | Parent JE id |
| `itemNumber` | number | Seed: 1, 2... New: line number × 10 (10, 20...) |
| `lineNumber` | number | New entries only: 10, 20, 30... |
| `glAccount` | string | e.g. `"400000"` |
| `glAccountName` | string | Seed data: full name. New entries: `accountDescription` |
| `accountDescription` | string | New entries only: auto-filled from GL_ACCOUNTS lookup |
| `debitAmount` | number | 0 if credit line |
| `creditAmount` | number | 0 if debit line |
| `debitCreditIndicator` | string | `"D"` or `"C"` (new entries only) |
| `currency` | string | |
| `costCenter` | string | |
| `costCenterName` | string | Seed data only |
| `profitCenter` | string | Seed data only |
| `taxCode` | string | |
| `assignment` | string | Seed data only |
| `itemText` | string | New entries; equivalent to `text` in seed data |
| `text` | string | Seed data only |

### `notifications` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | e.g. `"notif-001"` |
| `title` | string | Notification title |
| `description` | string | Full description text |
| `timestamp` | string | ISO 8601 datetime |
| `type` | string | `"success"`, `"warning"`, `"error"`, or `"info"` |
| `priority` | string | `"high"`, `"medium"`, or `"low"` |
| `isRead` | boolean | `false` = unread (contributes to badge count) |
| `category` | string | e.g. `"Procurement"`, `"Finance"`, `"Sales"`, `"System"` |
| `actionUrl` | string or null | Client-side route for the notification action |
| `icon` | string | Icon name |

### `plants` item fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `"plant-1000"`, `"plant-1100"`, `"plant-2000"` |
| `plantCode` | string | `"1000"`, `"1100"`, `"2000"` |
| `name` | string | e.g. `"US Plant Dallas"` |
| `city` | string | |
| `country` | string | ISO 2-letter |

### `filterState` structure

The `filterState` object holds applied filter values per list page:

```json
{
  "po":  { "poNumber": "", "supplierName": "", "dateFrom": "", "dateTo": "", "status": "", "plant": "" },
  "so":  { "soNumber": "", "customerName": "", "dateFrom": "", "dateTo": "", "status": "" },
  "mat": { "materialNumber": "", "description": "", "materialType": "", "status": "" },
  "je":  { "documentNumber": "", "documentType": "", "dateFrom": "", "dateTo": "", "status": "", "companyCode": "" }
}
```

## Status Enumerations

### Purchase Order `status`
`"Draft"` | `"Ordered"` | `"Partially Delivered"` | `"Fully Delivered"` | `"Closed"`

### Purchase Order `deliveryStatus`
`"On Time"` | `"Overdue"` | `"Partially Received"` | `"Received"`

### Sales Order `status`
`"Open"` | `"In Process"` | `"Completed"` | `"Cancelled"`

### Sales Order `overallDeliveryStatus`
`"Not Delivered"` | `"Partially Delivered"` | `"Fully Delivered"`

### Sales Order `overallBillingStatus`
`"Not Billed"` | `"Partially Billed"` | `"Fully Billed"`

### Journal Entry `status`
`"Posted"` | `"Parked"` | `"Reversed"`

### Notification `type`
`"success"` | `"warning"` | `"error"` | `"info"`

### Material `materialType`
`"HAWA"` (Trading Goods) | `"ROH"` (Raw Material) | `"FERT"` (Finished Product) | `"HALB"` (Semi-Finished)

### Tile `type`
`"static"` — simple launcher with icon
`"numeric"` — shows `numericValue` + `numericUnit`
`"kpi"` — shows `numericValue` + `numericUnit` + `kpiData.trend` + `kpiData.status`

## Reducer Actions

All state mutations happen via the `useReducer` dispatch. Helper functions are exposed via `useApp()`.

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `SET_STATE` | full state object | Replaces entire state (used by server injection) |
| `SET_ACTIVE_TAB` | tab key string | Updates `activeTab` |
| `SET_SEARCH_QUERY` | query string | Updates `searchQuery` |
| `SET_SELECTED_VARIANT` | variant name string | Updates `selectedVariant` |
| `SET_FILTER_STATE` | partial filterState object | Merges into `filterState` |
| `READ_NOTIFICATION` | notification id | Sets `notifications[i].isRead = true`, decrements `notificationCount` |
| `MARK_ALL_NOTIFICATIONS_READ` | — | Sets all `isRead = true`, sets `notificationCount = 0` |
| `ADD_PURCHASE_ORDER` | PO object + items array | Appends to `purchaseOrders` and `purchaseOrderItems`, sets `lastChanged` |
| `UPDATE_PURCHASE_ORDER` | `{id, changes}` | Merges `changes` into matching PO, auto-sets `lastChanged` and `lastChangedBy` |
| `DELETE_PURCHASE_ORDER` | PO id | Removes PO and all its `purchaseOrderItems` |
| `ADD_PO_ITEM` | PO item object | Appends to `purchaseOrderItems`, recalculates parent PO `totalNetValue` |
| `DELETE_PO_ITEM` | PO item id | Removes item, recalculates parent PO `totalNetValue` |
| `ADD_SALES_ORDER` | SO object + items array | Appends to `salesOrders` and `salesOrderItems`, sets `lastChanged` |
| `UPDATE_SALES_ORDER` | `{id, changes}` | Merges `changes` into matching SO, auto-sets `lastChanged` and `lastChangedBy` |
| `DELETE_SALES_ORDER` | SO id | Removes SO and all its `salesOrderItems` |
| `UPDATE_MATERIAL` | `{id, changes}` | Merges `changes` into matching material, auto-sets `lastChanged` and `lastChangedBy` |
| `ADD_JOURNAL_ENTRY` | JE object + items array | Appends to `journalEntries` and `journalEntryItems` |
| `UPDATE_JOURNAL_ENTRY` | `{id, changes}` | Merges `changes` into matching JE |

### `useApp()` helper functions

```js
setActiveTab(tabKey)                     // SET_ACTIVE_TAB
setSearchQuery(query)                    // SET_SEARCH_QUERY
setSelectedVariant(variantName)          // SET_SELECTED_VARIANT
setFilterState({ po: {...} })            // SET_FILTER_STATE — partial merge
readNotification(notifId)               // READ_NOTIFICATION
markAllNotificationsRead()              // MARK_ALL_NOTIFICATIONS_READ
addPurchaseOrder(po, items)             // ADD_PURCHASE_ORDER
updatePurchaseOrder(id, changes)        // UPDATE_PURCHASE_ORDER
deletePurchaseOrder(id)                 // DELETE_PURCHASE_ORDER
addPOItem(item)                         // ADD_PO_ITEM
deletePOItem(id)                        // DELETE_PO_ITEM
addSalesOrder(so, items)               // ADD_SALES_ORDER
updateSalesOrder(id, changes)          // UPDATE_SALES_ORDER
deleteSalesOrder(id)                   // DELETE_SALES_ORDER
updateMaterial(id, changes)            // UPDATE_MATERIAL
addJournalEntry(je, items)             // ADD_JOURNAL_ENTRY
updateJournalEntry(id, changes)        // UPDATE_JOURNAL_ENTRY
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Click navigation tab | `activeTab` changes to the tab key |
| Search in shell bar and press Enter | `searchQuery` updated |
| Click tile to open app | Route navigation (no state change) |
| Click notification item | `notifications[i].isRead → true`; `notificationCount` decremented |
| Click "Mark all as read" | All `notifications[].isRead → true`; `notificationCount → 0` |
| Apply list filter (click Go button) | `filterState.po` / `filterState.so` / `filterState.mat` / `filterState.je` updated |
| Change list variant | `selectedVariant` updated |
| Create purchase order | `purchaseOrders` grows by 1; `purchaseOrderItems` grows by N |
| Edit purchase order (Save) | `purchaseOrders[i]` fields updated; `lastChanged`, `lastChangedBy` set |
| Delete purchase order | `purchaseOrders` shrinks by 1; all related `purchaseOrderItems` removed |
| Add PO line item | `purchaseOrderItems` grows by 1; parent `purchaseOrders[i].totalNetValue` recalculated |
| Delete PO line item | `purchaseOrderItems` shrinks by 1; parent `purchaseOrders[i].totalNetValue` recalculated |
| Create sales order | `salesOrders` grows by 1; `salesOrderItems` grows by N |
| Edit sales order (Save) | `salesOrders[i]` fields updated; `lastChanged`, `lastChangedBy` set |
| Edit material master (Save) | `materials[i]` fields updated; `lastChanged`, `lastChangedBy` set |
| Create journal entry (Park) | `journalEntries` grows by 1 with `status: "Parked"`; `journalEntryItems` grows by N |
| Create journal entry (Post) | `journalEntries` grows by 1 with `status: "Posted"`; `journalEntryItems` grows by N |
| Post parked journal entry | `journalEntries[i].status → "Posted"` |
| Reverse posted journal entry | `journalEntries[i].status → "Reversed"` |
| Edit parked journal entry (Save) | `journalEntries[i]` fields updated |

## Seed Data Summary

| Entity | Count | ID Range |
|--------|-------|----------|
| Navigation Tabs | 12 | `tab-001` – `tab-012` |
| Tile Groups | 10 | `group-001` – `group-010` |
| Tiles | 31 | `tile-h01` – `tile-h06`, `tile-001` – `tile-031` |
| Purchase Orders | 15 | `po-001` – `po-015` |
| Purchase Order Items | 25 | `poi-001` – `poi-025` |
| Sales Orders | 12 | `so-001` – `so-012` |
| Sales Order Items | 21 | `soi-001` – `soi-021` |
| Materials | 20 | `mat-001` – `mat-020` |
| Suppliers | 10 | `sup-001` – `sup-010` |
| Customers | 10 | `cust-001` – `cust-010` |
| Journal Entries | 15 | `je-001` – `je-015` |
| Journal Entry Items | 20 | `jei-001` – `jei-020` |
| Notifications | 8 | `notif-001` – `notif-008` (5 unread) |
| Plants | 3 | `plant-1000`, `plant-1100`, `plant-2000` |

## GL Accounts (used in Journal Entry creation)

| Account | Description |
|---------|-------------|
| `100000` | Bank Account |
| `110000` | Accounts Receivable |
| `200000` | Accounts Payable |
| `300000` | Inventory |
| `400000` | Cost of Goods Sold |
| `500000` | Revenue |
| `600000` | Salary Expense |
| `700000` | Office Expense |

## Journal Entry Number Generation

New journal entries get `documentNumber = max(existing documentNumbers) + 1`. The highest seed data document number is `"1000000015"` (je-015), so the first user-created entry gets `"1000000016"`.

## Sales Order Number Generation

New sales orders get `soNumber = max(existing soNumbers as int) + 1`. The highest seed data SO number is `"1000001245"` (so-012), so the first user-created SO gets `"1000001246"`.

## Purchase Order Number Generation

New purchase orders get `poNumber = max(existing poNumbers as int) + 1`. The highest seed data PO number is `"4500001248"` (po-015), so the first user-created PO gets `"4500001249"`.

## API Endpoints

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| `POST` | `/post?sid=<sid>` | `{"action":"set","state":{...}}` | Inject state — sets both current and initial state |
| `POST` | `/post?sid=<sid>` | `{"action":"set_current","state":{...}}` | Update current state only, preserve initial |
| `POST` | `/post?sid=<sid>` | `{"action":"reset"}` | Reset to default seed state |
| `GET` | `/go?sid=<sid>` | — | Returns `{initial_state, current_state, state_diff}` as JSON |
| `GET` | `/state?sid=<sid>` | — | Returns `{has_custom_state, stored_state}` |
| `POST` | `/upload?sid=<sid>` | multipart/form-data | Upload files — returns `{files: [{url, original_name, stored_name, size}]}` |
| `GET` | `/files/<sid>/<filename>` | — | Serve uploaded file with Content-Type |

The `sid` parameter isolates session state. Without `sid`, a shared default state is used. State is persisted server-side in `.mock-states/<sid>.json`.

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-001",
      "firstName": "Michael",
      "lastName": "Quinn",
      "initials": "MQ",
      "email": "michael.quinn@bestrun.com",
      "role": "Procurement Manager",
      "avatarColor": "#0A6ED1",
      "department": "Procurement",
      "plant": "1000",
      "companyCode": "1000",
      "language": "EN",
      "dateFormat": "MM/DD/YYYY",
      "timezone": "America/New_York"
    },
    "companyInfo": {
      "companyCode": "1000",
      "companyName": "BestRun US",
      "currency": "USD",
      "country": "US",
      "fiscalYearVariant": "K4",
      "currentFiscalYear": "2024"
    },
    "navigationTabs": [
      {"id": "tab-001", "label": "My Home", "key": "my-home", "isDefault": true, "order": 0},
      {"id": "tab-006", "label": "Procurement", "key": "procurement", "isDefault": false, "order": 5}
    ],
    "tileGroups": [
      {"id": "group-001", "title": "Purchase Order Processing", "tabKey": "procurement", "order": 0}
    ],
    "tiles": [
      {"id": "tile-002", "groupId": "group-001", "title": "Manage Purchase Orders", "subtitle": "", "icon": "shopping-cart", "type": "static", "numericValue": null, "numericUnit": null, "kpiData": null, "appRoute": "/app/manage-purchase-orders", "order": 0, "isActive": true}
    ],
    "purchaseOrders": [
      {
        "id": "po-001",
        "poNumber": "4500001234",
        "supplier": "sup-001",
        "supplierName": "Global Parts Inc.",
        "poType": "NB",
        "poTypeName": "Standard PO",
        "purchasingOrg": "1000",
        "purchasingOrgName": "BestRun Purchasing Org",
        "purchasingGroup": "Z01",
        "purchasingGroupName": "General Purchasing",
        "companyCode": "1000",
        "createdDate": "2024-01-15",
        "createdBy": "Michael Quinn",
        "totalNetValue": 15420.00,
        "currency": "USD",
        "status": "Ordered",
        "deliveryStatus": "Overdue",
        "plant": "1000",
        "plantName": "US Plant Dallas",
        "paymentTerms": "NET30",
        "incoterms": "FOB",
        "notes": "",
        "lastChanged": "2024-02-10",
        "lastChangedBy": "Michael Quinn"
      }
    ],
    "purchaseOrderItems": [
      {"id": "poi-001", "poId": "po-001", "itemNumber": 10, "materialId": "mat-001", "materialName": "Aluminum Sheet 2mm", "materialNumber": "MAT-1001", "quantity": 500, "unit": "PC", "netPrice": 12.50, "priceUnit": 1, "netValue": 6250.00, "currency": "USD", "deliveryDate": "2024-02-15", "plant": "1000", "storageLocation": "SL01", "taxCode": "V1", "accountAssignment": "K", "costCenter": "CC1000", "glAccount": "400000"},
      {"id": "poi-002", "poId": "po-001", "itemNumber": 20, "materialId": "mat-002", "materialName": "Steel Rod 10mm", "materialNumber": "MAT-1002", "quantity": 300, "unit": "KG", "netPrice": 30.57, "priceUnit": 1, "netValue": 9170.00, "currency": "USD", "deliveryDate": "2024-02-15", "plant": "1000", "storageLocation": "SL01", "taxCode": "V1", "accountAssignment": "K", "costCenter": "CC1000", "glAccount": "400000"}
    ],
    "salesOrders": [],
    "salesOrderItems": [],
    "materials": [
      {"id": "mat-001", "materialNumber": "MAT-1001", "description": "Aluminum Sheet 2mm", "materialType": "HAWA", "materialTypeName": "Trading Goods", "baseUnit": "PC", "standardPrice": 12.50, "currency": "USD", "stockQuantity": 1250, "plantData": {"plant": "1000", "storageLocation": "SL01", "mrpType": "PD", "reorderPoint": 100, "safetyStock": 50, "lotSize": "EX", "plannedDeliveryTime": 5}}
    ],
    "suppliers": [
      {"id": "sup-001", "supplierNumber": "17411730", "name": "Global Parts Inc.", "country": "US", "city": "Dallas", "isBlocked": false}
    ],
    "customers": [],
    "journalEntries": [],
    "journalEntryItems": [],
    "notifications": [],
    "plants": [
      {"id": "plant-1000", "plantCode": "1000", "name": "US Plant Dallas", "city": "Dallas", "country": "US"}
    ],
    "activeTab": "my-home",
    "searchQuery": "",
    "notificationCount": 0,
    "selectedVariant": "Standard",
    "filterState": {}
  }
}
```
