# Xhopify Admin Mock — Data Model

This document defines all entity types, their fields, relationships, and example data for `dataManager.js`.

---

## 1. Store (Singleton)

The store object represents the current Xhopify store. There is only one.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"store_1"` |
| `name` | string | `"Evergreen Goods"` |
| `email` | string | `"admin@evergreengoods.com"` |
| `phone` | string | `"+1 (555) 123-4567"` |
| `domain` | string | `"evergreengoods.myshopify.com"` |
| `customDomain` | string | `"www.evergreengoods.com"` |
| `address` | object | `{ address1: "123 Commerce St", city: "Portland", province: "Oregon", provinceCode: "OR", country: "United States", countryCode: "US", zip: "97201" }` |
| `currency` | string | `"USD"` |
| `timezone` | string | `"(GMT-08:00) Pacific Time"` |
| `weightUnit` | string | `"lb"` |
| `plan` | string | `"Basic Xhopify"` |
| `owner` | object | `{ firstName: "Alex", lastName: "Chen", email: "alex@evergreengoods.com" }` |
| `createdAt` | string (ISO) | `"2023-06-15T10:00:00Z"` |

---

## 2. Products

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique ID | `"prod_1"` |
| `title` | string | Product name | `"Classic Cotton T-Shirt"` |
| `bodyHtml` | string | HTML description | `"<p>Soft 100% cotton...</p>"` |
| `vendor` | string | Brand/manufacturer | `"Evergreen Basics"` |
| `productType` | string | Category | `"Shirts"` |
| `handle` | string | URL slug | `"classic-cotton-t-shirt"` |
| `status` | string | `"active"` / `"draft"` / `"archived"` | `"active"` |
| `tags` | string[] | Tag labels | `["cotton", "summer", "basics"]` |
| `images` | Image[] | Product images (see below) | |
| `variants` | Variant[] | Product variants (see below) | |
| `options` | Option[] | Variant option definitions | |
| `collections` | string[] | Collection IDs this product belongs to | `["coll_1", "coll_3"]` |
| `createdAt` | string (ISO) | | `"2024-01-15T10:00:00Z"` |
| `updatedAt` | string (ISO) | | `"2024-03-10T14:30:00Z"` |
| `publishedAt` | string (ISO) or null | | `"2024-01-15T10:00:00Z"` |

### Product Image

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"img_1"` |
| `src` | string | `"https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt"` |
| `alt` | string | `"Classic Cotton T-Shirt - White"` |
| `position` | number | `1` |
| `width` | number | `400` |
| `height` | number | `400` |

### Product Variant

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"var_1"` |
| `productId` | string | `"prod_1"` |
| `title` | string | `"Small / White"` |
| `price` | string | `"24.99"` |
| `compareAtPrice` | string or null | `"29.99"` |
| `sku` | string | `"CCTS-SM-WHT"` |
| `barcode` | string | `"1234567890123"` |
| `inventoryQuantity` | number | `150` |
| `inventoryPolicy` | string | `"deny"` (deny / continue) |
| `weight` | number | `0.3` |
| `weightUnit` | string | `"lb"` |
| `requiresShipping` | boolean | `true` |
| `taxable` | boolean | `true` |
| `option1` | string | `"Small"` |
| `option2` | string or null | `"White"` |
| `option3` | string or null | `null` |
| `imageId` | string or null | `"img_1"` |
| `position` | number | `1` |

### Product Option

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"opt_1"` |
| `name` | string | `"Size"` |
| `position` | number | `1` |
| `values` | string[] | `["Small", "Medium", "Large", "XL"]` |

---

## 3. Collections

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"coll_1"` |
| `title` | string | | `"Summer Collection"` |
| `bodyHtml` | string | HTML description | `"<p>Our best summer picks</p>"` |
| `handle` | string | URL slug | `"summer-collection"` |
| `image` | object or null | `{ src, alt }` | |
| `sortOrder` | string | `"best-selling"` / `"alpha-asc"` / `"alpha-desc"` / `"price-asc"` / `"price-desc"` / `"created-desc"` / `"manual"` | `"best-selling"` |
| `collectionType` | string | `"custom"` / `"smart"` | `"custom"` |
| `productIds` | string[] | For custom collections | `["prod_1", "prod_3"]` |
| `conditions` | Condition[] | For smart collections | |
| `productsCount` | number | | `12` |
| `publishedAt` | string or null | | `"2024-01-01T00:00:00Z"` |
| `updatedAt` | string | | `"2024-03-01T00:00:00Z"` |

---

## 4. Orders

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"order_1"` |
| `name` | string | Display order number | `"#1001"` |
| `orderNumber` | number | Numeric order number | `1001` |
| `email` | string | Customer email | `"john@example.com"` |
| `phone` | string or null | | `"+1 555-0101"` |
| `financialStatus` | string | `"paid"` / `"pending"` / `"partially_paid"` / `"refunded"` / `"partially_refunded"` / `"voided"` / `"authorized"` | `"paid"` |
| `fulfillmentStatus` | string or null | `null` (unfulfilled) / `"fulfilled"` / `"partial"` / `"restocked"` | `null` |
| `currency` | string | | `"USD"` |
| `subtotalPrice` | string | | `"74.97"` |
| `totalShippingPrice` | string | | `"5.99"` |
| `totalTax` | string | | `"6.00"` |
| `totalDiscounts` | string | | `"0.00"` |
| `totalPrice` | string | | `"86.96"` |
| `lineItems` | LineItem[] | Ordered products | |
| `shippingAddress` | Address | Delivery address | |
| `billingAddress` | Address | Payment address | |
| `customer` | object | `{ id, firstName, lastName, email }` | |
| `note` | string | Internal note | `"Please gift wrap"` |
| `tags` | string[] | | `["rush", "gift"]` |
| `discountCodes` | object[] | Applied discounts | `[{ code: "SUMMER10", amount: "10.00", type: "percentage" }]` |
| `cancelReason` | string or null | | `null` |
| `cancelledAt` | string or null | | `null` |
| `closedAt` | string or null | | `null` |
| `processedAt` | string | | `"2024-03-10T14:30:00Z"` |
| `createdAt` | string | | `"2024-03-10T14:30:00Z"` |
| `updatedAt` | string | | `"2024-03-10T14:30:00Z"` |
| `timeline` | TimelineEvent[] | Activity log | |

### Line Item

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"li_1"` |
| `productId` | string | `"prod_1"` |
| `variantId` | string | `"var_1"` |
| `title` | string | `"Classic Cotton T-Shirt"` |
| `variantTitle` | string | `"Small / White"` |
| `quantity` | number | `2` |
| `price` | string | `"24.99"` |
| `totalDiscount` | string | `"0.00"` |
| `sku` | string | `"CCTS-SM-WHT"` |
| `imageSrc` | string | Product image URL |
| `requiresShipping` | boolean | `true` |
| `fulfillableQuantity` | number | `2` |
| `fulfillmentStatus` | string or null | `null` |

### Address (used for shipping/billing)

| Field | Type | Example |
|-------|------|---------|
| `firstName` | string | `"John"` |
| `lastName` | string | `"Doe"` |
| `company` | string or null | `null` |
| `address1` | string | `"456 Elm Street"` |
| `address2` | string or null | `"Apt 7B"` |
| `city` | string | `"Seattle"` |
| `province` | string | `"Washington"` |
| `provinceCode` | string | `"WA"` |
| `country` | string | `"United States"` |
| `countryCode` | string | `"US"` |
| `zip` | string | `"98101"` |
| `phone` | string | `"+1 555-0101"` |

### Timeline Event

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"evt_1"` |
| `type` | string | `"created"` / `"paid"` / `"fulfilled"` / `"note"` / `"edited"` / `"refunded"` / `"cancelled"` |
| `message` | string | `"Order #1001 was placed"` |
| `createdAt` | string (ISO) | `"2024-03-10T14:30:00Z"` |
| `user` | string or null | Staff who performed action | `"Alex Chen"` |

---

## 5. Customers

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"cust_1"` |
| `firstName` | string | | `"John"` |
| `lastName` | string | | `"Doe"` |
| `email` | string | | `"john.doe@example.com"` |
| `phone` | string or null | | `"+1 555-0101"` |
| `state` | string | `"enabled"` / `"disabled"` / `"invited"` | `"enabled"` |
| `ordersCount` | number | | `5` |
| `totalSpent` | string | | `"324.95"` |
| `note` | string | Internal notes | `"VIP customer"` |
| `tags` | string[] | | `["vip", "wholesale"]` |
| `taxExempt` | boolean | | `false` |
| `verifiedEmail` | boolean | | `true` |
| `acceptsMarketing` | boolean | | `true` |
| `defaultAddress` | Address | Primary address | |
| `addresses` | Address[] | All addresses | |
| `lastOrderId` | string or null | | `"order_5"` |
| `lastOrderName` | string or null | | `"#1005"` |
| `createdAt` | string | | `"2023-09-15T10:00:00Z"` |
| `updatedAt` | string | | `"2024-03-10T14:30:00Z"` |

---

## 6. Discounts

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"disc_1"` |
| `title` | string | Display name | `"Summer Sale 10%"` |
| `code` | string or null | null = automatic | `"SUMMER10"` |
| `type` | string | `"percentage"` / `"fixed_amount"` / `"free_shipping"` / `"buy_x_get_y"` | `"percentage"` |
| `value` | string | Discount value | `"10"` (= 10%) |
| `valueSuffix` | string | `"%"` or `"$"` | `"%"` |
| `status` | string | `"active"` / `"scheduled"` / `"expired"` | `"active"` |
| `appliesTo` | string | `"all"` / `"specific_collections"` / `"specific_products"` | `"all"` |
| `appliesToIds` | string[] | Collection or product IDs | `[]` |
| `minimumRequirement` | string | `"none"` / `"min_purchase"` / `"min_quantity"` | `"min_purchase"` |
| `minimumValue` | string | | `"50.00"` |
| `customerEligibility` | string | `"all"` / `"specific_segments"` / `"specific_customers"` | `"all"` |
| `usageLimit` | number or null | Total uses allowed | `100` |
| `usageCount` | number | Times used | `23` |
| `oncePerCustomer` | boolean | | `true` |
| `startsAt` | string (ISO) | | `"2024-06-01T00:00:00Z"` |
| `endsAt` | string (ISO) or null | | `"2024-08-31T23:59:59Z"` |
| `createdAt` | string | | `"2024-05-20T10:00:00Z"` |

---

## 7. Draft Orders

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"draft_1"` |
| `name` | string | Display number | `"#D1"` |
| `status` | string | `"open"` / `"invoice_sent"` / `"completed"` | `"open"` |
| `lineItems` | LineItem[] | Items in draft | |
| `customer` | object or null | Assigned customer | |
| `shippingAddress` | Address or null | | |
| `billingAddress` | Address or null | | |
| `note` | string | | `"Wholesale order for review"` |
| `subtotalPrice` | string | | `"199.96"` |
| `totalTax` | string | | `"16.00"` |
| `totalPrice` | string | | `"215.96"` |
| `tags` | string[] | | `["wholesale"]` |
| `createdAt` | string | | `"2024-03-08T09:00:00Z"` |
| `updatedAt` | string | | `"2024-03-08T09:00:00Z"` |

---

## 8. Gift Cards

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | | `"gc_1"` |
| `code` | string | Last 4 visible | `"•••• •••• •••• 7g4x"` |
| `initialValue` | string | | `"50.00"` |
| `balance` | string | Remaining | `"35.50"` |
| `currency` | string | | `"USD"` |
| `status` | string | `"enabled"` / `"disabled"` | `"enabled"` |
| `customerId` | string or null | Assigned customer | `"cust_2"` |
| `note` | string | | `"Birthday gift"` |
| `expiresOn` | string or null | | `null` |
| `createdAt` | string | | `"2024-02-14T10:00:00Z"` |

---

## 9. Analytics Data (Pre-computed Mock)

Analytics are not entity-based but pre-computed summary objects.

```javascript
analytics: {
  // Date-indexed daily metrics
  dailyMetrics: [
    {
      date: "2024-03-10",
      totalSales: 1245.67,
      ordersCount: 18,
      onlineStoreSessions: 342,
      returningCustomerRate: 0.24,
      conversionRate: 0.0526,
      averageOrderValue: 69.20,
      topProducts: [
        { productId: "prod_1", title: "Classic Cotton T-Shirt", quantity: 12, revenue: 299.88 },
        ...
      ],
      topReferrers: [
        { source: "google.com", sessions: 120 },
        { source: "instagram.com", sessions: 85 },
        { source: "direct", sessions: 67 },
        ...
      ],
      sessionsByLocation: [
        { country: "United States", sessions: 180 },
        { country: "Canada", sessions: 45 },
        { country: "United Kingdom", sessions: 32 },
        ...
      ]
    },
    // ... 30 days of data
  ],
  // Summary totals (computed from dailyMetrics)
  totalSalesThisMonth: 28456.89,
  totalOrdersThisMonth: 412,
  totalSessionsThisMonth: 8934
}
```

---

## 10. Navigation Menus (for Online Store section)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"menu_1"` |
| `title` | string | `"Main menu"` |
| `handle` | string | `"main-menu"` |
| `items` | MenuItem[] | |

### MenuItem

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"mi_1"` |
| `title` | string | `"Home"` |
| `url` | string | `"/"` |
| `position` | number | `1` |
| `children` | MenuItem[] | Nested items |

---

## 11. Pages (for Online Store)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"page_1"` |
| `title` | string | `"About Us"` |
| `handle` | string | `"about-us"` |
| `bodyHtml` | string | `"<p>We are Evergreen Goods...</p>"` |
| `published` | boolean | `true` |
| `createdAt` | string | `"2023-06-15T10:00:00Z"` |
| `updatedAt` | string | `"2024-01-10T08:00:00Z"` |

---

## 12. Blog Posts (for Online Store)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"blog_1"` |
| `title` | string | `"5 Summer Fashion Trends"` |
| `author` | string | `"Alex Chen"` |
| `bodyHtml` | string | HTML content |
| `handle` | string | `"5-summer-fashion-trends"` |
| `tags` | string[] | `["fashion", "summer"]` |
| `published` | boolean | `true` |
| `publishedAt` | string | `"2024-03-01T09:00:00Z"` |
| `createdAt` | string | `"2024-02-28T15:00:00Z"` |

---

## Relationships

```
Store (1) ──────── (*) Products
Store (1) ──────── (*) Collections
Store (1) ──────── (*) Orders
Store (1) ──────── (*) Customers
Store (1) ──────── (*) Discounts
Store (1) ──────── (*) Draft Orders
Store (1) ──────── (*) Gift Cards

Product (1) ────── (*) Variants
Product (1) ────── (*) Images
Product (*) ────── (*) Collections (many-to-many via collection.productIds / product.collections)

Order (1) ─────── (*) Line Items
Order (*) ─────── (1) Customer
Order (1) ─────── (*) Timeline Events

Customer (1) ──── (*) Orders (via ordersCount, lastOrderId)
Customer (1) ──── (*) Addresses

Discount (*) ──── (*) Products/Collections (via appliesToIds)

Draft Order (*) ── (1) Customer
Draft Order (1) ── (*) Line Items

Gift Card (*) ──── (1) Customer
```

---

## Suggested `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    store: { /* singleton store object */ },
    products: [ /* 12-15 products with diverse statuses, types, variants */ ],
    collections: [ /* 5-6 collections */ ],
    orders: [ /* 15-20 orders with various financial/fulfillment statuses */ ],
    customers: [ /* 10-12 customers with varying order histories */ ],
    discounts: [ /* 5-6 discounts: active, scheduled, expired */ ],
    draftOrders: [ /* 2-3 draft orders */ ],
    giftCards: [ /* 3-4 gift cards */ ],
    analytics: { dailyMetrics: [ /* 30 days of data */ ] },
    pages: [ /* 3-4 store pages */ ],
    blogPosts: [ /* 4-5 blog posts */ ],
    navigationMenus: [ /* 2 menus: main, footer */ ],
    // UI state
    settings: {
      storeName: "Evergreen Goods",
      storeEmail: "admin@evergreengoods.com",
      currency: "USD",
      timezone: "(GMT-08:00) Pacific Time",
      weightUnit: "lb",
    }
  };
}
```

### Seed Data Guidelines

- **Products (12-15):** Mix of statuses (8 active, 3 draft, 2 archived). Various product types (Shirts, Pants, Accessories, Shoes, Home Goods). Some with variants (size/color), some single-variant. Price range $9.99 - $149.99. Use placeholder images via `placehold.co`.
- **Collections (5-6):** "Summer Collection", "Best Sellers", "New Arrivals", "Sale", "Accessories", "Men's". Mix of custom and smart.
- **Orders (15-20):** Mix of: 5 paid+fulfilled, 4 paid+unfulfilled, 2 pending payment, 2 partially fulfilled, 1 refunded, 1 cancelled. Order numbers #1001 through #1020. Dates spread across last 30 days.
- **Customers (10-12):** Diverse names. Order counts from 1 to 8. Total spent $24.99 to $1,250.00. Some with notes and tags. Mix of US and international addresses.
- **Discounts (5-6):** "SUMMER10" (10% off, active), "WELCOME15" (15% off first order, active), "FREESHIP" (free shipping over $50, active), "FLASH25" (25% off, expired), "HOLIDAY20" (scheduled for future), "BOGO" (buy-x-get-y, active).
- **Analytics:** 30 days of daily data with realistic trends (weekdays higher than weekends, slight upward trend).
