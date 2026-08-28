# Xaobao Seller Center — Data Model

All entities below should be implemented in `src/utils/dataManager.js` inside a `createInitialData()` function that returns the full initial state object.

---

## §Store (店铺信息)

The currently logged-in seller's store. Singleton object.

```js
store: {
  id: "store_001",
  name: "李明的潮流小店",              // Store name
  ownerName: "李明",                   // Owner display name
  ownerId: "user_seller_001",
  avatarUrl: "",                       // Placeholder or initials-based
  rating: 4.8,                         // Store rating (out of 5)
  ratingLevel: "四钻",                 // 一心→五心→一钻→五钻→一冠→五冠
  totalSales: 12680,                   // Lifetime sales count
  followers: 3256,                     // Store followers/fans
  description: "专注时尚潮流服饰，正品保障，7天无理由退换",
  category: "服饰鞋包",                // Store primary category
  createdAt: "2021-03-15T00:00:00Z",
  location: "浙江省 杭州市",
  phone: "138****6789",
  announcement: "双11大促火热进行中！全场满200减30，满500减80！",
  settings: {
    autoReply: true,
    autoReplyMessage: "亲，您好！欢迎光临本店，有什么可以帮您的吗？",
    shippingAddress: "浙江省杭州市余杭区文一西路969号",
    returnAddress: "浙江省杭州市余杭区文一西路969号",
    defaultLogistics: "中通快递",
  }
}
```

---

## §Products (商品)

Products listed in the store. Each product can have multiple SKU variants.

```js
// Single product
{
  id: "prod_001",
  title: "2024秋冬新款男士加绒卫衣连帽外套",
  category: "男装",
  subcategory: "卫衣",
  price: 159.00,                    // Display price (lowest SKU)
  originalPrice: 299.00,            // Crossed-out original price
  images: [                         // Product image URLs (use placeholders)
    "/placeholder/hoodie_1.jpg",
    "/placeholder/hoodie_2.jpg"
  ],
  mainImage: "/placeholder/hoodie_1.jpg",
  description: "优质面料，加绒保暖，时尚百搭",
  status: "on_sale",                // "on_sale" | "in_warehouse" | "removed" | "draft"
  stock: 356,                       // Total stock across all SKUs
  sales: 1247,                      // Total sales count
  views: 8932,                      // Product page views
  favoriteCount: 562,               // Number of favorites/bookmarks
  skus: [
    { id: "sku_001_1", color: "黑色", size: "M", price: 159.00, stock: 89, sales: 312 },
    { id: "sku_001_2", color: "黑色", size: "L", price: 159.00, stock: 102, sales: 445 },
    { id: "sku_001_3", color: "灰色", size: "M", price: 159.00, stock: 78, sales: 203 },
    { id: "sku_001_4", color: "灰色", size: "L", price: 159.00, stock: 87, sales: 287 }
  ],
  shippingFee: 0,                   // 0 = free shipping (包邮)
  weight: 0.6,                      // kg
  createdAt: "2024-09-15T10:30:00Z",
  updatedAt: "2024-11-20T14:22:00Z",
  rating: 4.7,
  reviewCount: 328
}
```

**Seed data**: 15 products covering these categories:
1. 男装 (Men's clothing): 4 products — hoodie, jacket, jeans, t-shirt
2. 女装 (Women's clothing): 4 products — dress, sweater, coat, skirt
3. 鞋靴 (Shoes): 3 products — sneakers, boots, casual shoes
4. 配饰 (Accessories): 2 products — backpack, watch
5. 数码 (Electronics): 2 products — phone case, bluetooth earbuds

Status distribution: 10 on_sale, 3 in_warehouse, 2 removed

---

## §Orders (订单)

Purchase orders from buyers.

```js
// Single order
{
  id: "order_20241120001",
  orderNumber: "TB2024112056789012",    // Taobao-style order number
  status: "pending_shipment",           // See status enum below
  buyerId: "buyer_001",
  buyerName: "张小花",
  buyerPhone: "139****5678",
  shippingAddress: {
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    street: "科技园路8号创新大厦A座1203",
    zipCode: "518000",
    receiverName: "张小花",
    receiverPhone: "13912345678"
  },
  items: [
    {
      productId: "prod_001",
      productTitle: "2024秋冬新款男士加绒卫衣连帽外套",
      skuId: "sku_001_2",
      skuDesc: "黑色 / L",
      mainImage: "/placeholder/hoodie_1.jpg",
      price: 159.00,
      quantity: 1
    }
  ],
  totalAmount: 159.00,                  // Sum of item prices * quantities
  shippingFee: 0,
  discountAmount: 30.00,               // Coupon/promotion discount
  actualAmount: 129.00,                // Total - discount
  paymentMethod: "支付宝",
  paidAt: "2024-11-20T09:15:30Z",
  shippedAt: null,
  completedAt: null,
  logistics: {
    company: "",
    trackingNumber: "",
    status: ""
  },
  buyerNote: "请尽快发货，谢谢",         // Buyer's order note
  sellerNote: "",                       // Seller's internal note
  createdAt: "2024-11-20T09:10:00Z",
  updatedAt: "2024-11-20T09:15:30Z"
}
```

**Order Status Enum**:
- `"pending_payment"` — 待付款 (Awaiting payment)
- `"pending_shipment"` — 待发货 (Paid, awaiting shipment)
- `"shipped"` — 已发货 (Shipped, in transit)
- `"completed"` — 已完成 (Buyer confirmed receipt)
- `"refunding"` — 退款中 (Refund in progress)
- `"closed"` — 已关闭 (Order cancelled/expired)

**Seed data**: 25 orders with this distribution:
- 3 pending_payment
- 5 pending_shipment (most actionable for agent training)
- 6 shipped (with tracking numbers)
- 8 completed (for historical data)
- 2 refunding
- 1 closed

---

## §Refunds (退款)

Refund/return requests linked to orders.

```js
{
  id: "refund_001",
  orderId: "order_20241115003",
  orderNumber: "TB2024111534567890",
  productTitle: "时尚女士羊毛大衣",
  skuDesc: "驼色 / M",
  mainImage: "/placeholder/coat_1.jpg",
  buyerId: "buyer_003",
  buyerName: "王丽丽",
  refundAmount: 459.00,
  reason: "size_issue",                 // Enum: size_issue, quality_issue, wrong_item, not_as_described, no_longer_needed, other
  reasonText: "尺码偏大，穿着不合适",
  description: "收到商品后发现尺码偏大，M码穿起来像L码，希望退款退货",
  evidenceImages: ["/placeholder/evidence_1.jpg"],
  status: "pending",                    // "pending" | "approved" | "rejected" | "completed"
  type: "refund_return",               // "refund_only" | "refund_return"
  returnLogistics: {
    company: "",
    trackingNumber: ""
  },
  sellerResponse: "",
  createdAt: "2024-11-19T16:30:00Z",
  updatedAt: "2024-11-19T16:30:00Z",
  deadline: "2024-11-22T16:30:00Z"     // Seller must respond before deadline
}
```

**Seed data**: 8 refunds:
- 3 pending (urgent action needed)
- 2 approved (awaiting return)
- 2 completed
- 1 rejected

---

## §Customers (客户)

Buyers who have interacted with the store.

```js
{
  id: "buyer_001",
  name: "张小花",
  nickname: "花花爱购物",
  avatarUrl: "",
  phone: "139****5678",
  location: "广东省 深圳市",
  orderCount: 5,
  totalSpent: 1280.00,
  lastOrderDate: "2024-11-20T09:10:00Z",
  vipLevel: "gold",                    // "normal" | "silver" | "gold" | "diamond"
  tags: ["回头客", "大码"],             // Custom seller tags
  createdAt: "2024-03-10T00:00:00Z"
}
```

**Seed data**: 15 customers with varied purchase histories. Names should be realistic Chinese names (张小花, 李强, 王丽丽, 陈大伟, etc.)

---

## §Conversations (消息会话)

Chat threads between seller and buyers (旺旺 messaging).

```js
{
  id: "conv_001",
  buyerId: "buyer_001",
  buyerName: "张小花",
  buyerAvatar: "",
  lastMessage: "好的，我看一下尺码表",
  lastMessageTime: "2024-11-20T10:30:00Z",
  unreadCount: 2,
  messages: [
    {
      id: "msg_001_1",
      senderId: "buyer_001",
      senderType: "buyer",              // "buyer" | "seller"
      content: "您好，请问这件卫衣M码身高170能穿吗？",
      timestamp: "2024-11-20T10:25:00Z",
      type: "text"                      // "text" | "image" | "system"
    },
    {
      id: "msg_001_2",
      senderId: "user_seller_001",
      senderType: "seller",
      content: "亲，170身高穿M码刚好合适哦，建议参考详情页尺码表～",
      timestamp: "2024-11-20T10:26:30Z",
      type: "text"
    },
    {
      id: "msg_001_3",
      senderId: "buyer_001",
      senderType: "buyer",
      content: "好的，我看一下尺码表",
      timestamp: "2024-11-20T10:30:00Z",
      type: "text"
    }
  ]
}
```

**Seed data**: 8 conversations, 3 with unread messages. Conversations should cover:
- Size/fit inquiries
- Shipping status questions
- Return/refund discussions
- Product availability questions
- Bulk order negotiations

---

## §Coupons (优惠券)

Store discount coupons.

```js
{
  id: "coupon_001",
  name: "满200减30",
  type: "threshold",                   // "threshold" (满减), "percentage" (折扣), "fixed" (无门槛)
  discountAmount: 30,                  // For threshold/fixed: amount in ¥
  discountPercent: null,               // For percentage: e.g. 0.85 for 85折
  minimumSpend: 200,                   // Minimum order amount (0 for no minimum)
  applicableProducts: "all",           // "all" | "category:{name}" | "specific:{id1,id2}"
  totalCount: 1000,                    // Total issued
  usedCount: 356,                      // Times used
  claimedCount: 580,                   // Times claimed by buyers
  startDate: "2024-11-01T00:00:00Z",
  endDate: "2024-11-30T23:59:59Z",
  status: "active",                    // "active" | "expired" | "draft" | "disabled"
  createdAt: "2024-10-28T10:00:00Z"
}
```

**Seed data**: 6 coupons:
- 2 active threshold coupons (满200减30, 满500减80)
- 1 active percentage coupon (全场9折)
- 1 expired coupon
- 1 draft coupon (not yet published)
- 1 fixed amount coupon (10元无门槛)

---

## §Reviews (评价)

Buyer reviews on purchased products.

```js
{
  id: "review_001",
  orderId: "order_20241110002",
  productId: "prod_001",
  productTitle: "2024秋冬新款男士加绒卫衣连帽外套",
  buyerId: "buyer_005",
  buyerName: "赵大志",
  buyerAvatar: "",
  rating: 5,                           // 1-5 stars
  content: "质量很好，穿着很舒服，加绒很暖和，推荐！",
  images: [],                          // Review images
  skuDesc: "黑色 / L",
  sellerReply: "感谢您的好评！欢迎再次光临～",
  sellerReplyTime: "2024-11-11T09:00:00Z",
  isAnonymous: false,
  createdAt: "2024-11-10T15:30:00Z",
  hasAdditionalReview: false           // 追评
}
```

**Seed data**: 20 reviews across products:
- 12 five-star, 4 four-star, 2 three-star, 1 two-star, 1 one-star
- 10 with seller replies, 10 without (action needed)
- 3 with review images

---

## §Notifications (通知)

System and platform notifications.

```js
{
  id: "notif_001",
  type: "order",                       // "order" | "refund" | "review" | "system" | "promotion" | "violation"
  title: "新订单提醒",
  message: "您有3笔新订单待发货，请及时处理",
  isRead: false,
  link: "/orders?status=pending_shipment",  // Internal navigation target
  createdAt: "2024-11-20T09:20:00Z"
}
```

**Seed data**: 12 notifications:
- 4 unread (2 order, 1 refund, 1 review)
- 8 read (mix of all types)

---

## §Dashboard Metrics (数据概览)

Aggregated metrics for the dashboard. Computed from orders/products data but stored for quick display.

```js
dashboardMetrics: {
  today: {
    sales: 3580.00,
    orders: 23,
    visitors: 1256,
    conversionRate: 1.83,            // percentage
    avgOrderValue: 155.65,
    pendingShipments: 5,
    pendingRefunds: 3,
    pendingReviews: 10
  },
  yesterday: {
    sales: 4120.00,
    orders: 28,
    visitors: 1432,
    conversionRate: 1.96
  },
  salesTrend: [
    // Last 7 days, array of { date: "11-14", sales: 3200, orders: 20 }
    { date: "11-14", sales: 3200.00, orders: 20 },
    { date: "11-15", sales: 4500.00, orders: 32 },
    { date: "11-16", sales: 2800.00, orders: 18 },
    { date: "11-17", sales: 5200.00, orders: 38 },
    { date: "11-18", sales: 3900.00, orders: 25 },
    { date: "11-19", sales: 4120.00, orders: 28 },
    { date: "11-20", sales: 3580.00, orders: 23 }
  ],
  topProducts: [
    // Top 5 products by sales, array of { productId, title, sales, revenue }
  ],
  trafficSources: {
    search: 45,       // percentage
    direct: 20,
    promotion: 25,
    social: 10
  }
}
```

---

## §Quick Reply Phrases (快捷回复)

Predefined reply templates for customer messaging.

```js
quickReplies: [
  { id: "qr_001", label: "欢迎语", content: "亲，您好！欢迎光临本店，有什么可以帮您的吗？" },
  { id: "qr_002", label: "发货时间", content: "亲，我们一般在付款后48小时内发货哦～" },
  { id: "qr_003", label: "尺码建议", content: "亲，建议您参考详情页的尺码表选择，如果平时穿X码，建议选X码～" },
  { id: "qr_004", label: "售后说明", content: "亲，我们支持7天无理由退换货，收到商品如有问题请及时联系我们～" },
  { id: "qr_005", label: "物流查询", content: "亲，已为您查询，您的快递已发出，预计X天内送达～" },
  { id: "qr_006", label: "感谢好评", content: "感谢您的好评和支持！欢迎再次光临～" }
]
```

---

## §Logistics Templates (物流模板)

```js
logisticsTemplates: [
  { id: "log_001", name: "默认运费模板", isDefault: true, freeShippingThreshold: 99, baseShippingFee: 8 },
  { id: "log_002", name: "偏远地区模板", isDefault: false, freeShippingThreshold: 199, baseShippingFee: 15 }
],
logisticsProviders: [
  { id: "lp_001", name: "中通快递", code: "ZTO" },
  { id: "lp_002", name: "圆通速递", code: "YTO" },
  { id: "lp_003", name: "韵达快递", code: "YD" },
  { id: "lp_004", name: "顺丰速运", code: "SF" },
  { id: "lp_005", name: "申通快递", code: "STO" }
]
```

---

## Full createInitialData() Structure

```js
export function createInitialData() {
  return {
    store: { /* §Store */ },
    products: [ /* §Products — 15 items */ ],
    orders: [ /* §Orders — 25 items */ ],
    refunds: [ /* §Refunds — 8 items */ ],
    customers: [ /* §Customers — 15 items */ ],
    conversations: [ /* §Conversations — 8 items */ ],
    coupons: [ /* §Coupons — 6 items */ ],
    reviews: [ /* §Reviews — 20 items */ ],
    notifications: [ /* §Notifications — 12 items */ ],
    dashboardMetrics: { /* §Dashboard Metrics */ },
    quickReplies: [ /* §Quick Reply Phrases — 6 items */ ],
    logisticsTemplates: [ /* §Logistics Templates */ ],
    logisticsProviders: [ /* §Logistics Providers */ ],
    currentUser: {
      id: "user_seller_001",
      name: "李明",
      role: "owner",
      storeId: "store_001"
    }
  };
}
```
