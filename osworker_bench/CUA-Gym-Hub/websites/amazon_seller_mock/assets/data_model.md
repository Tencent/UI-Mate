# Xmazon Seller Central Mock -- Data Model

> This document defines all entity types, their fields, relationships, and realistic example values.
> The dev agent should use this to build `createInitialData()` in `src/utils/dataManager.js`.

---

## Seller Account (Top-Level)

The logged-in seller. Always pre-loaded -- no auth required.

```js
seller: {
  id: "SELLER_001",
  displayName: "Evergreen Home Goods",
  legalName: "Evergreen Home Goods LLC",
  email: "admin@evergreenhomegoods.com",
  marketplace: "Amazon.com (US)",
  planType: "Professional",            // "Professional" | "Individual"
  storeName: "Evergreen Home Goods",
  sellerId: "A2B7C9D1E3F5G7H9",
  registeredSince: "2021-06-15",
  accountHealthRating: 350,            // 0-1000, 200+ is "Healthy"
  notificationCount: 5,
  unreadMessages: 3
}
```

---

## Products

Each product listing. Products may be FBA or FBM. An ASIN is Amazon's unique product ID; a SKU is the seller's own identifier.

```js
products: [
  {
    id: "PROD_001",
    asin: "B09ABCDEF1",
    sku: "EHG-CANDLE-LAV-01",
    title: "Evergreen Lavender Scented Soy Candle, 8 oz - Hand-Poured, All Natural",
    brand: "Evergreen Home Goods",
    category: "Home & Kitchen > Candles & Holders > Candles",
    imageUrl: "",                       // placeholder or generated
    additionalImages: [],               // up to 6 additional image URLs
    price: 18.99,
    salePrice: null,                    // null if no sale active
    costOfGoods: 5.20,                  // for profit calculation
    fulfillmentChannel: "FBA",          // "FBA" | "FBM"
    status: "Active",                   // "Active" | "Inactive" | "Incomplete" | "Suppressed" | "Under Review"
    condition: "New",
    availableQuantity: 145,
    reservedQuantity: 12,               // FBA in-transit or processing
    inboundQuantity: 50,                // FBA inbound shipments
    totalQuantity: 207,                 // available + reserved + inbound
    buyBoxOwner: true,                  // whether this seller owns Buy Box
    buyBoxPrice: 18.99,
    rating: 4.5,
    reviewCount: 234,
    bulletPoints: [
      "100% natural soy wax, clean-burning",
      "Relaxing lavender essential oil scent",
      "Hand-poured in small batches",
      "8 oz jar with 50+ hour burn time",
      "Cotton wick, lead-free"
    ],
    description: "Experience the calming aroma of our hand-poured lavender soy candle...",
    keywords: "lavender candle, soy candle, scented candle, natural candle, aromatherapy",
    weight: "10.4 oz",
    dimensions: "3.5 x 3.5 x 3.8 inches",
    dateCreated: "2023-01-15T10:30:00Z",
    lastUpdated: "2026-04-08T14:22:00Z"
  }
  // ... 15-20 products total
]
```

**Product categories to cover (for variety):**
- Candles (3 variants: Lavender, Vanilla, Eucalyptus)
- Bamboo Cutting Boards (2 sizes)
- Ceramic Plant Pots (3 colors)
- Kitchen Towels set
- Essential Oil Diffuser
- Stainless Steel Water Bottle (2 sizes)
- Wooden Coasters set
- Reusable Storage Bags
- Wool Dryer Balls set
- Natural Cleaning Spray
- Beeswax Food Wraps
- Cork Yoga Mat
- Bamboo Utensil Set

---

## Orders

Each order contains one or more order items. Orders have lifecycle statuses.

```js
orders: [
  {
    id: "ORDER_001",
    amazonOrderId: "114-3941689-8772232",
    purchaseDate: "2026-04-10T09:15:00Z",
    lastUpdateDate: "2026-04-10T09:15:00Z",
    status: "Unshipped",               // "Pending" | "Unshipped" | "Shipped" | "Cancelled" | "Returned"
    fulfillmentChannel: "FBA",          // "FBA" | "FBM"
    salesChannel: "Amazon.com",
    buyerName: "John M.",               // Amazon truncates last name
    buyerEmail: "buyer-abc123@marketplace.amazon.com",
    shippingAddress: {
      name: "John Mitchell",
      line1: "123 Oak Street",
      line2: "Apt 4B",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "US"
    },
    items: [
      {
        orderItemId: "ITEM_001",
        productId: "PROD_001",
        asin: "B09ABCDEF1",
        sku: "EHG-CANDLE-LAV-01",
        title: "Evergreen Lavender Scented Soy Candle, 8 oz",
        quantity: 2,
        unitPrice: 18.99,
        itemTotal: 37.98,
        imageUrl: ""
      }
    ],
    orderTotal: 37.98,
    shippingFee: 0.00,                  // FBA = free Prime
    amazonFees: 8.36,                   // referral + FBA fulfillment
    netProceeds: 29.62,
    shipByDate: "2026-04-12T23:59:00Z",
    deliverByDate: "2026-04-15T23:59:00Z",
    trackingNumber: null,
    carrier: null,
    shippedDate: null,
    notes: ""
  }
  // ... 25-30 orders total
]
```

**Order distribution (for realistic dashboard):**
- 3 Pending (payment processing)
- 5 Unshipped (ready to fulfill)
- 15 Shipped (in last 30 days)
- 2 Cancelled
- 1 Returned

---

## Messages (Buyer-Seller Communication)

Threaded conversations between seller and buyers.

```js
messages: [
  {
    id: "MSG_001",
    threadId: "THREAD_001",
    orderId: "ORDER_005",              // may be null for general inquiry
    buyerName: "Sarah K.",
    subject: "Question about Candle Size",
    body: "Hi, I was wondering if you offer a larger size for the lavender candle? My mom loves it and I'd like to get her a bigger one as a gift.",
    sender: "buyer",                    // "buyer" | "seller"
    timestamp: "2026-04-09T14:30:00Z",
    isRead: false,
    status: "Unanswered",              // "Unanswered" | "Answered" | "No response needed"
    responseDeadline: "2026-04-11T14:30:00Z",  // 24-hour SLA
    attachments: []
  }
  // ... 8-12 messages total across 5-6 threads
]
```

---

## Returns

Return requests from buyers.

```js
returns: [
  {
    id: "RETURN_001",
    orderId: "ORDER_008",
    amazonOrderId: "114-7823456-1234567",
    returnRequestDate: "2026-04-07T11:00:00Z",
    status: "Pending",                  // "Pending" | "Approved" | "Completed" | "Denied"
    reason: "Item defective or doesn't work",
    buyerComments: "The candle wick was off-center and the glass cracked when burning.",
    items: [
      {
        asin: "B09ABCDEF1",
        sku: "EHG-CANDLE-LAV-01",
        title: "Evergreen Lavender Scented Soy Candle, 8 oz",
        quantity: 1,
        refundAmount: 18.99
      }
    ],
    resolution: null,                   // "Refund" | "Replacement" | "Denied"
    sellerNotes: ""
  }
  // ... 3-4 returns
]
```

---

## Advertising Campaigns

Sponsored Products campaigns with ad groups and keywords.

```js
campaigns: [
  {
    id: "CAMP_001",
    name: "Candle Collection - Sponsored Products",
    type: "Sponsored Products",         // "Sponsored Products" | "Sponsored Brands" | "Sponsored Display"
    status: "Enabled",                  // "Enabled" | "Paused" | "Archived"
    dailyBudget: 25.00,
    startDate: "2026-03-01",
    endDate: null,                      // null = no end date
    targetingType: "Manual",            // "Manual" | "Automatic"
    bidStrategy: "Dynamic bids - down only",  // "Dynamic bids - down only" | "Dynamic bids - up and down" | "Fixed bids"
    metrics: {
      impressions: 45230,
      clicks: 892,
      ctr: 1.97,                        // click-through rate %
      spend: 312.50,
      sales: 1845.20,
      acos: 16.93,                      // ACoS % (advertising cost of sales)
      roas: 5.90,                       // return on ad spend
      orders: 97,
      cpc: 0.35                         // cost per click
    },
    adGroups: [
      {
        id: "AG_001",
        name: "Lavender Candle - Exact Match",
        status: "Enabled",
        defaultBid: 0.75,
        keywords: [
          { keyword: "lavender candle", matchType: "Exact", bid: 0.85, status: "Enabled" },
          { keyword: "soy candle lavender", matchType: "Exact", bid: 0.70, status: "Enabled" },
          { keyword: "scented candle", matchType: "Broad", bid: 0.55, status: "Enabled" },
          { keyword: "aromatherapy candle", matchType: "Phrase", bid: 0.65, status: "Paused" }
        ],
        products: ["PROD_001"]
      }
    ]
  }
  // ... 3-4 campaigns total
]
```

---

## Account Health

Metrics for the Account Health Dashboard. Three main sections.

```js
accountHealth: {
  overallRating: "Good",               // "Good" | "At Risk" | "Critical" | "Deactivated"
  accountHealthRating: 350,            // numeric 0-1000
  customerServicePerformance: {
    orderDefectRate: {
      current: 0.28,                    // percentage (target: < 1%)
      target: 1.0,
      status: "Good",                   // "Good" | "Fair" | "Poor"
      orders: 3,
      totalOrders: 1072
    },
    negativeFeedbackRate: {
      current: 0.56,
      target: null,
      count: 6
    },
    aToZClaimRate: {
      current: 0.09,
      target: null,
      count: 1
    },
    chargebackRate: {
      current: 0.0,
      count: 0
    }
  },
  policyCompliance: {
    status: "Good",
    intellectualPropertyComplaints: 0,
    productAuthenticityComplaints: 0,
    productConditionComplaints: 1,
    listingPolicyViolations: 0,
    restrictedProductViolations: 0,
    foodSafetyIssues: 0,
    customerProductReviews: "No issues"
  },
  shippingPerformance: {
    lateShipmentRate: {
      current: 1.23,                    // percentage (target: < 4%)
      target: 4.0,
      status: "Good"
    },
    preFulfillmentCancelRate: {
      current: 0.85,                    // percentage (target: < 2.5%)
      target: 2.5,
      status: "Good"
    },
    validTrackingRate: {
      current: 97.5,                    // percentage (target: > 95%)
      target: 95.0,
      status: "Good"
    },
    onTimeDeliveryRate: {
      current: 96.8,
      target: 97.0,
      status: "Fair"                    // slightly below target
    }
  }
}
```

---

## Feedback

Buyer feedback (seller-level ratings, not product reviews).

```js
feedback: [
  {
    id: "FB_001",
    orderId: "ORDER_012",
    buyerName: "Alex T.",
    rating: 5,                          // 1-5 stars
    comment: "Fast shipping, well-packaged. Great seller!",
    date: "2026-04-05T08:00:00Z",
    hasResponse: false,
    sellerResponse: null
  }
  // ... 10-12 feedback entries (mostly 4-5 star, 1-2 negative)
]
```

---

## Sales Reports (Daily Snapshots)

Pre-computed daily sales data for charting on the dashboard and Business Reports page.

```js
salesData: {
  dailySnapshots: [
    {
      date: "2026-04-10",
      orderedProductSales: 1245.67,
      unitsOrdered: 47,
      totalOrderItems: 52,
      averageSellingPrice: 26.50,
      sessionsTotal: 1823,
      pageViews: 3241,
      conversionRate: 2.58,             // percentage
      refunds: 1,
      refundAmount: 18.99
    }
    // ... 30 days of data
  ],
  summary: {
    last7Days: {
      orderedProductSales: 8234.50,
      unitsOrdered: 312,
      totalOrderItems: 345,
      averageSellingPrice: 26.40
    },
    last30Days: {
      orderedProductSales: 34567.89,
      unitsOrdered: 1305,
      totalOrderItems: 1450,
      averageSellingPrice: 26.48
    },
    previousPeriod: {
      orderedProductSales: 31245.67,
      unitsOrdered: 1180
    }
  }
}
```

---

## Payments / Disbursements

Payment summaries and transaction records.

```js
payments: {
  currentBalance: 2847.35,
  nextDisbursementDate: "2026-04-14",
  nextDisbursementEstimate: 2847.35,
  recentDisbursements: [
    {
      id: "DISB_001",
      date: "2026-04-07",
      amount: 3124.50,
      status: "Completed"               // "Completed" | "Processing" | "Scheduled"
    },
    {
      id: "DISB_002",
      date: "2026-03-31",
      amount: 2987.20,
      status: "Completed"
    }
  ],
  feeBreakdown: {
    referralFees: 4567.89,
    fbaFulfillmentFees: 3456.78,
    fbaStorageFees: 234.56,
    subscriptionFee: 39.99,
    otherFees: 12.50
  },
  transactions: [
    {
      id: "TXN_001",
      date: "2026-04-10T09:15:00Z",
      type: "Order",                    // "Order" | "Refund" | "Fee" | "Adjustment" | "Disbursement"
      description: "Order #114-3941689-8772232",
      amount: 37.98,
      orderId: "ORDER_001"
    }
    // ... 20-30 recent transactions
  ]
}
```

---

## FBA Inventory

FBA-specific inventory tracking data.

```js
fbaInventory: {
  inventoryPerformanceIndex: 580,       // IPI score, 0-1000 (target: 400+)
  storageLimits: {
    standardSize: { used: 1250, limit: 5000, unit: "cubic feet" },
    oversize: { used: 0, limit: 500, unit: "cubic feet" }
  },
  inventoryAge: [
    {
      productId: "PROD_001",
      asin: "B09ABCDEF1",
      title: "Evergreen Lavender Scented Soy Candle...",
      daysInInventory: 45,
      quantity: 145,
      estimatedFee: 0.00,               // long-term storage fee
      ageCategory: "0-90 days"          // "0-90 days" | "91-180 days" | "181-270 days" | "271-365 days" | "365+ days"
    }
  ],
  restockSuggestions: [
    {
      productId: "PROD_003",
      asin: "B09ABCDEF3",
      title: "Ceramic Plant Pot, Medium - White",
      currentStock: 8,
      recommendedQuantity: 50,
      daysOfSupply: 5,
      alert: "Low stock"
    }
  ],
  inboundShipments: [
    {
      id: "SHIP_001",
      shipmentName: "Spring Restock - Candles",
      status: "In Transit",             // "Working" | "Shipped" | "In Transit" | "Delivered" | "Checked In" | "Receiving" | "Closed"
      destination: "FBA Warehouse - PHX7",
      createdDate: "2026-04-05",
      itemCount: 200,
      items: [
        { asin: "B09ABCDEF1", sku: "EHG-CANDLE-LAV-01", quantity: 100, received: 0 },
        { asin: "B09ABCDEF2", sku: "EHG-CANDLE-VAN-01", quantity: 100, received: 0 }
      ]
    }
  ]
}
```

---

## Coupons / Promotions

```js
coupons: [
  {
    id: "COUPON_001",
    name: "Spring Sale - 15% Off Candles",
    type: "Percentage Off",             // "Percentage Off" | "Money Off"
    discount: 15,                       // percentage or dollar amount
    budget: 500.00,
    budgetUsed: 123.45,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "Active",                   // "Active" | "Scheduled" | "Expired" | "Cancelled"
    targetProducts: ["PROD_001", "PROD_002", "PROD_003"],
    redemptions: 42,
    clipCount: 187                      // how many shoppers clipped coupon
  }
  // ... 2-3 coupons
]
```

---

## Notifications / Alerts

Top-bar notification items and action items on the dashboard.

```js
notifications: [
  {
    id: "NOTIF_001",
    type: "warning",                    // "info" | "warning" | "error" | "success"
    title: "Low Inventory Alert",
    message: "Ceramic Plant Pot, Medium - White has only 8 units remaining.",
    timestamp: "2026-04-10T08:00:00Z",
    isRead: false,
    actionUrl: "/inventory",
    category: "inventory"               // "inventory" | "orders" | "account" | "advertising" | "policy"
  }
  // ... 5-8 notifications
]
```

---

## Settings

User preferences and account settings (display-only or togglable).

```js
settings: {
  notificationPreferences: {
    emailOrderConfirmation: true,
    emailReturnRequest: true,
    emailBuyerMessage: true,
    emailInventoryAlert: true,
    emailPromotions: false,
    emailReports: true
  },
  shippingSettings: {
    defaultShippingService: "USPS Priority Mail",
    handlingTime: 2,                    // days
    returnAddress: {
      name: "Evergreen Home Goods",
      line1: "456 Warehouse Blvd",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US"
    }
  },
  listingDefaults: {
    defaultCondition: "New",
    defaultFulfillment: "FBA"
  }
}
```

---

## Relationships Summary

| Parent | Child | Relationship |
|--------|-------|-------------|
| Product | Order Item | product.id = order.items[].productId |
| Order | Message | order.id = message.orderId |
| Order | Return | order.id = return.orderId |
| Order | Feedback | order.id = feedback.orderId |
| Campaign | Ad Group | campaign.adGroups[] |
| Ad Group | Product | adGroup.products[] references product.id |
| Product | FBA Inventory Age | product.id = fbaInventory.inventoryAge[].productId |
| Product | Restock Suggestion | product.id = fbaInventory.restockSuggestions[].productId |
| Product | Coupon | coupon.targetProducts[] references product.id |
| Order | Transaction | order.id = transaction.orderId |

---

## `createInitialData()` Shape

```js
export function createInitialData() {
  return {
    seller: { ... },
    products: [ ... ],           // 15-20 products
    orders: [ ... ],             // 25-30 orders
    messages: [ ... ],           // 8-12 messages across 5-6 threads
    returns: [ ... ],            // 3-4 returns
    campaigns: [ ... ],          // 3-4 campaigns
    accountHealth: { ... },
    feedback: [ ... ],           // 10-12 feedback entries
    salesData: { ... },          // 30 days of daily snapshots
    payments: { ... },
    fbaInventory: { ... },
    coupons: [ ... ],            // 2-3 coupons
    notifications: [ ... ],      // 5-8 notifications
    settings: { ... }
  };
}
```
