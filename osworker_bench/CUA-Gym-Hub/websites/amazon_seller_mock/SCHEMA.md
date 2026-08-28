# amazon_seller_mock Schema

**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `seller` | object | Seller account info |
| `products` | array | Product catalog (35 items default) |
| `orders` | array | Customer orders (27 items default) |
| `messages` | array | Buyer-seller messages (9 items default) |
| `returns` | array | Return requests (5 items default) |
| `campaigns` | array | Advertising campaigns (4 items default) |
| `accountHealth` | object | Account health metrics |
| `feedback` | array | Buyer feedback/reviews (12 items default) |
| `salesData` | object | Sales analytics (daily snapshots + summary) |
| `payments` | object | Payment balance, disbursements, fees |
| `fbaInventory` | object | FBA inventory performance and shipments |
| `coupons` | array | Active/scheduled coupons (3 items default) |
| `pricingRules` | array | Automated pricing rules (3 items default) |
| `notifications` | array | Seller notifications (8 items default) |
| `settings` | object | Notification, shipping, and listing preferences |

### seller

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Seller ID (e.g., `"seller_001"`) |
| `displayName` | string | Display name |
| `legalName` | string | Legal business name |
| `email` | string | Seller email |
| `marketplace` | string | Marketplace (e.g., `"Amazon.com"`) |
| `planType` | string | `"Professional"` or `"Individual"` |
| `storeName` | string | Amazon storefront name |
| `sellerId` | string | Xmazon Seller ID |
| `registeredSince` | string | ISO date |
| `accountHealthRating` | number | 0-1000 score |
| `notificationCount` | number | Unread notification count |
| `unreadMessages` | number | Unread message count |

### products[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID (e.g., `"PROD_001"`) |
| `asin` | string | Amazon ASIN |
| `sku` | string | Seller SKU |
| `title` | string | Product title |
| `brand` | string | Brand name |
| `category` | string | Category path |
| `price` | number | List price |
| `salePrice` | number\|null | Sale price if active |
| `costOfGoods` | number | COGS for profit calculation |
| `fulfillmentChannel` | string | `"FBA"` or `"FBM"` |
| `status` | string | `"Active"`, `"Inactive"`, `"Suppressed"`, `"Incomplete"` |
| `condition` | string | Item condition |
| `availableQuantity` | number | Available inventory |
| `reservedQuantity` | number | Reserved for pending orders |
| `inboundQuantity` | number | In-transit to FBA |
| `buyBoxOwner` | boolean | Whether seller owns Buy Box |
| `buyBoxPrice` | number | Current Buy Box price |
| `lowestPrice` | number | Lowest competitor price |
| `rating` | number | Average star rating |
| `reviewCount` | number | Number of reviews |
| `bulletPoints` | array | Product bullet points |
| `description` | string | Product description |
| `keywords` | string | Backend search keywords |
| `weight` | string | Product weight |
| `dimensions` | string | Product dimensions |
| `dateCreated` | string | ISO date created |
| `lastUpdated` | string | ISO date last updated |

### orders[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Internal order ID |
| `amazonOrderId` | string | Amazon order number (e.g., `"114-..."`) |
| `purchaseDate` | string | ISO purchase date |
| `lastUpdateDate` | string | ISO last update |
| `status` | string | `"Pending"`, `"Unshipped"`, `"Shipped"`, `"Delivered"`, `"Cancelled"` |
| `fulfillmentChannel` | string | `"FBA"` or `"FBM"` |
| `salesChannel` | string | Sales channel |
| `buyerName` | string | Buyer display name |
| `buyerEmail` | string | Buyer email |
| `shippingAddress` | object | `{name, line1, line2, city, state, postalCode}` |
| `items` | array | Order line items with `productId`, `sku`, `title`, `quantity`, `itemPrice`, `itemTotal` |
| `orderTotal` | number | Order total |
| `shippingFee` | number | Shipping charge |
| `amazonFees` | number | Amazon referral/fulfillment fees |
| `netProceeds` | number | Net amount after fees |
| `carrier` | string\|null | Shipping carrier |
| `trackingNumber` | string\|null | Tracking number |
| `shipByDate` | string | Ship-by deadline |
| `deliverByDate` | string | Delivery deadline |
| `shippedDate` | string\|null | Actual ship date |

### messages[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Message ID |
| `threadId` | string | Thread ID for grouping |
| `orderId` | string | Related order ID |
| `buyerName` | string | Buyer name |
| `subject` | string | Message subject |
| `body` | string | Message body |
| `sender` | string | `"buyer"` or `"seller"` |
| `timestamp` | string | ISO timestamp |
| `isRead` | boolean | Read status |
| `status` | string | `"open"`, `"pending"`, `"closed"` |
| `responseDeadline` | string | ISO deadline for response |
| `attachments` | array | File attachments |

### returns[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Return ID |
| `orderId` | string | Related order ID |
| `amazonOrderId` | string | Amazon order number |
| `returnRequestDate` | string | ISO date |
| `status` | string | `"Requested"`, `"Authorized"`, `"Received"`, `"Refunded"`, `"Closed"` |
| `reason` | string | Return reason |
| `buyerComments` | string | Buyer comments |
| `items` | array | Returned items |
| `sellerNotes` | string | Seller notes |
| `resolution` | string\|null | Resolution type |

### campaigns[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Campaign ID |
| `name` | string | Campaign name |
| `type` | string | `"Sponsored Products"`, `"Sponsored Brands"` |
| `status` | string | `"Active"`, `"Paused"`, `"Ended"` |
| `dailyBudget` | number | Daily budget |
| `startDate` | string | ISO start date |
| `endDate` | string\|null | ISO end date |
| `targetingType` | string | `"automatic"` or `"manual"` |
| `bidStrategy` | string | Bid strategy type |
| `metrics` | object | `{impressions, clicks, spend, sales, acos, roas, orders, ctr, cpc}` |
| `adGroups` | array | Ad groups with targeting and bids |

### accountHealth

| Field | Type | Description |
|-------|------|-------------|
| `overallRating` | string | `"Good"`, `"At Risk"`, `"Critical"` |
| `accountHealthRating` | number | 0-1000 score |
| `customerServicePerformance` | object | ODR, late shipment, cancellation rates |
| `policyCompliance` | object | IP complaints, policy violations |
| `shippingPerformance` | object | On-time delivery, tracking rates |

### feedback[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Feedback ID |
| `orderId` | string | Related order ID |
| `buyerName` | string | Buyer name |
| `rating` | number | 1-5 star rating |
| `comment` | string | Feedback text |
| `date` | string | ISO date |
| `hasResponse` | boolean | Whether seller has responded |
| `sellerResponse` | string\|null | Seller response text |
| `removalRequested` | boolean | Whether removal was requested |

### salesData

| Field | Type | Description |
|-------|------|-------------|
| `dailySnapshots` | array | Daily revenue/orders/units data points |
| `summary` | object | `{last7Days, last30Days, previousPeriod}` with revenue, orders, units, avgOrderValue |

### payments

| Field | Type | Description |
|-------|------|-------------|
| `currentBalance` | number | Available balance |
| `nextDisbursementDate` | string | ISO date of next payout |
| `nextDisbursementEstimate` | number | Estimated payout amount |
| `recentDisbursements` | array | Past disbursements |
| `feeBreakdown` | object | Fee categories and amounts |
| `transactions` | array | Individual transaction records |

### fbaInventory

| Field | Type | Description |
|-------|------|-------------|
| `inventoryPerformanceIndex` | number | IPI score (0-1000) |
| `storageLimits` | object | Storage type limits and usage |
| `inventoryAge` | array | Inventory age distribution |
| `restockSuggestions` | array | Restock recommendations |
| `inboundShipments` | array | In-transit FBA shipments |

### notifications[]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Notification ID |
| `type` | string | Notification type |
| `title` | string | Notification title |
| `message` | string | Notification body |
| `timestamp` | string | ISO timestamp |
| `isRead` | boolean | Read status |
| `actionUrl` | string | Action link |
| `category` | string | `"account"`, `"inventory"`, `"orders"`, `"advertising"`, `"policy"` |

### settings

| Field | Type | Description |
|-------|------|-------------|
| `notificationPreferences` | object | Email/push notification toggles |
| `shippingSettings` | object | Default shipping templates |
| `listingDefaults` | object | Default listing configuration |

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "seller": {
      "id": "seller_001",
      "displayName": "Evergreen Home Goods",
      "storeName": "Evergreen Home Goods",
      "marketplace": "Amazon.com",
      "planType": "Professional"
    },
    "products": [],
    "orders": [],
    "messages": [],
    "returns": [],
    "campaigns": [],
    "accountHealth": {
      "overallRating": "Good",
      "accountHealthRating": 850
    },
    "feedback": [],
    "salesData": { "dailySnapshots": [], "summary": {} },
    "payments": { "currentBalance": 0 },
    "fbaInventory": { "inventoryPerformanceIndex": 500 },
    "coupons": [],
    "pricingRules": [],
    "notifications": [],
    "settings": {}
  }
}
```
