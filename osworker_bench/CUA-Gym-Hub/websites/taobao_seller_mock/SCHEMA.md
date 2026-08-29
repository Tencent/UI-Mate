# taobao_seller_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `store` | object | `{name, rating, owner, description, announcement, category, location, logo, phone, returnAddress}` |
| `products` | array | 15 products; each: `{id, title, category, subcategory, price, originalPrice, mainImage, images[], description, status, stock, sales, views, favoriteCount, rating, reviewCount, shippingFee, weight, skus[], createdAt, updatedAt}` — `status`: `"on_sale"` \| `"in_warehouse"` \| `"removed"` |
| `orders` | array | 25 orders; each: `{id, orderNo, status, buyerId, buyerName, buyerNote, shippingAddress, items[], totalAmount, shippingFee, discountAmount, actualAmount, paymentMethod, createdAt, paidAt, shippedAt, completedAt, logistics, sellerNote, sellerNoteColor}` — `status`: `"pending_payment"` \| `"pending_shipment"` \| `"shipped"` \| `"completed"` \| `"refunding"` \| `"closed"` |
| `refunds` | array | 8 refunds; each: `{id, refundNo, orderId, orderNo, productId, productTitle, productSku, buyerId, buyerName, amount, type, reason, reasonText, evidenceImages[], status, deadline, appliedAt, processedAt, sellerResponse}` — `type`: `"refund_only"` \| `"return_refund"` — `status`: `"pending"` \| `"approved"` \| `"completed"` \| `"rejected"` |
| `customers` | array | 15 customers; each: `{id, name, phone, province, city, orderCount, totalSpent, vipLevel, tags[], lastOrderAt}` — `vipLevel`: `"normal"` \| `"silver"` \| `"gold"` |
| `conversations` | array | 8 message threads; each: `{id, buyerId, buyerName, messages[], lastMessage, lastMessageTime, unreadCount}` — messages: `{id, senderId, senderType, content, time}` — `senderType`: `"seller"` \| `"buyer"` |
| `coupons` | array | 6 coupons; each: `{id, name, type, discountAmount, threshold, discountRate, startDate, endDate, totalQuantity, usedQuantity, claimedQuantity, status, scope, scopeValue?}` — `type`: `"threshold"` \| `"percentage"` \| `"fixed"` — `status`: `"active"` \| `"expired"` \| `"draft"` |
| `reviews` | array | 20 reviews; each: `{id, productId, productTitle, orderId, buyerName, rating, content, sellerReply, sellerReplyTime, createdAt, skuInfo}` — `rating`: 1–5 |
| `notifications` | array | 12 notifications; each: `{id, type, title, content, relatedId, read, createdAt}` — `type`: `"order"` \| `"refund"` \| `"review"` \| `"system"` |
| `quickReplies` | array | 6 quick reply phrases; each: `{id, label, content}` |
| `logisticsTemplates` | array | 3 templates; each: `{id, name, freeShippingThreshold, baseFee, description}` |
| `logisticsProviders` | array | 5 strings: `["中通快递","圆通速递","韵达快递","顺丰速运","申通快递"]` |
| `promotions` | array | 3 seed promotions; each: `{id, name, type, discountType, discountValue?, startDate, endDate, status, productIds, description}` — `type`: `"discount"` \| `"threshold"` \| `"coupon"` — `status`: `"active"` \| `"completed"` \| `"scheduled"` |
| `dashboardMetrics` | object | `{today: {sales, orderCount, pendingShipment, pendingRefund, visitors}, yesterday: {same shape}, salesTrend: [{date, sales, orders}]×7}` |

### Default IDs

**Products**: `prod_001` – `prod_015`
**Orders**: `order_001` – `order_025`
**Refunds**: `refund_001` – `refund_008`
**Customers**: `cust_001` – `cust_015`
**Conversations**: `conv_001` – `conv_008`
**Coupons**: `coupon_001` – `coupon_006`
**Reviews**: `review_001` – `review_020`
**Notifications**: `notif_001` – `notif_012`
**Quick Replies**: `qr_001` – `qr_006`
**Logistics Templates**: `lt_001` – `lt_003`
**Promotions**: `promo_001` – `promo_003`
**Store owner**: 李明 / 李明的潮流小店 / rating: 四钻

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "store": {
      "name": "李明的潮流小店",
      "rating": "四钻",
      "owner": "李明",
      "description": "专注潮流男女装及配饰",
      "announcement": "",
      "category": "服装/运动/户外",
      "location": "浙江省杭州市",
      "logo": "",
      "phone": "0571-88888888",
      "returnAddress": "浙江省杭州市西湖区文三路138号 李明 13888888888"
    },
    "products": [],
    "orders": [
      {
        "id": "order_001",
        "orderNo": "TB202411200001",
        "status": "pending_shipment",
        "buyerId": "cust_001",
        "buyerName": "张小花",
        "buyerNote": "",
        "shippingAddress": {
          "province": "广东省", "city": "深圳市", "district": "南山区",
          "street": "科技园南路12号", "recipient": "张小花", "phone": "13800138001"
        },
        "items": [{"productId": "prod_001", "title": "男士加绒卫衣", "sku": "黑色/M", "price": 159, "quantity": 1}],
        "totalAmount": 159,
        "shippingFee": 0,
        "discountAmount": 0,
        "actualAmount": 159,
        "paymentMethod": "支付宝",
        "createdAt": "2024-11-20T09:00:00Z",
        "paidAt": "2024-11-20T09:05:00Z",
        "shippedAt": null,
        "completedAt": null,
        "logistics": null,
        "sellerNote": "",
        "sellerNoteColor": ""
      }
    ],
    "refunds": [],
    "customers": [],
    "conversations": [],
    "coupons": [],
    "reviews": [],
    "notifications": [],
    "quickReplies": [],
    "logisticsTemplates": [
      {"id": "lt_003", "name": "全国包邮模板", "freeShippingThreshold": 0, "baseFee": 0, "description": "全国包邮"}
    ],
    "logisticsProviders": ["中通快递", "圆通速递", "韵达快递", "顺丰速运", "申通快递"],
    "promotions": [],
    "dashboardMetrics": {
      "today": {"sales": 3580, "orderCount": 12, "pendingShipment": 1, "pendingRefund": 0, "visitors": 1256},
      "yesterday": {"sales": 3180, "orderCount": 10, "pendingShipment": 3, "pendingRefund": 2, "visitors": 1102},
      "salesTrend": [
        {"date": "2024-11-14", "sales": 2890, "orders": 9},
        {"date": "2024-11-20", "sales": 3580, "orders": 12}
      ]
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Click 发货 on pending_shipment order → enter provider + tracking number → 确认发货 | `orders[id].status`: `"pending_shipment"` → `"shipped"` |
| (same) | `orders[id].shippedAt`: `null` → ISO timestamp |
| (same) | `orders[id].logistics`: `null` → `{provider, trackingNo}` |
| Click 同意 on pending refund → 确认同意 | `refunds[id].status`: `"pending"` → `"approved"` |
| (same) | `refunds[id].processedAt`: `null` → ISO timestamp |
| (same) | `orders[refund.orderId].status` → `"refunding"` |
| Click 拒绝 on pending refund → enter reason → 确认拒绝 | `refunds[id].status`: `"pending"` → `"rejected"` |
| (same) | `refunds[id].sellerResponse`: `""` → rejection reason text |
| Type message in chat → press Enter or 发送 | `conversations[id].messages`: new message appended |
| (same) | `conversations[id].lastMessage`, `lastMessageTime` updated |
| Click conversation in list | `conversations[id].unreadCount`: N → `0` |
| Click 回复 on unreplied review → enter text → 提交回复 | `reviews[id].sellerReply`: `""` → reply text |
| (same) | `reviews[id].sellerReplyTime`: `null` → ISO timestamp |
| Product form → 发布 (new) | `products`: new product object appended |
| Product form → 保存 (edit) | `products[id].*`: updated fields |
| ProductList → 批量上架/下架/删除 | `products[id].status`: updated for each selected ID |
| ProductList → single 删除 | `products[id].status` → `"removed"` |
| Coupon form → 创建优惠券 | `coupons`: new coupon appended |
| Coupon form → 保存修改 | `coupons[id].*`: updated fields |
| CouponList → 删除 coupon → confirm | `coupons`: coupon removed from array |
| CouponList → 复制 coupon | `coupons`: copy appended with `status:"draft"` |
| StoreSettings basic tab → 保存设置 | `store.name`, `store.description`, `store.announcement`, `store.phone`, `store.returnAddress`, `store.location` |
| StoreSettings quick reply tab → 保存全部 | `quickReplies`: replaced with edited array |
| StoreSettings logistics tab → add template → 保存 | `logisticsTemplates`: new template appended |
| StoreSettings logistics tab → delete template | `logisticsTemplates`: template removed |
| OrderDetail → save seller note | `orders[id].sellerNote`, `orders[id].sellerNoteColor` |
| PromotionList → 创建活动 → save | `promotions`: new promotion appended |
| PromotionList → 编辑 → save | `promotions[id].*`: updated fields |
| PromotionList → 删除 → confirm | `promotions`: promotion removed |
| Click notification in notification panel | `notifications[id].read`: `false` → `true` |
| Click 全部已读 in notification panel | `notifications[*].read`: all → `true` |

---

## Data Pipeline

1. User action in UI dispatches a reducer action to AppContext (`useReducer`)
2. `useReducer` produces new state
3. `useEffect` on state change calls `saveStateLocal(state)` (localStorage key `taobao_seller_state`) and `saveStateToServer(state)` (POST `/post?sid=<sid>` with `action:"set_current"`)
4. Vite plugin stores current state in `.mock-states/<sid>.json`
5. `GET /go?sid=<sid>` reads `.mock-states/<sid>.initial.json` (set during `action:"set"`) and `.mock-states/<sid>.json`, returns `{initial_state, current_state, state_diff}`
6. Browser route `/go` renders inline JSON from React context (note: uses localStorage initial, not server initial — see AUDIT-002)

---

## Session API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /post?sid=<sid>` | POST | Body `{"action":"set","state":{...}}` — sets current + initial state (initial written once) |
| `POST /post?sid=<sid>` | POST | Body `{"action":"set_current","state":{...}}` — sets current state only; preserves initial |
| `POST /post?sid=<sid>` | POST | Body `{"action":"reset"}` — deletes both `.json` and `.initial.json` |
| `GET /go?sid=<sid>` | GET | Returns `{initial_state, current_state, state_diff}` |
| `GET /state?sid=<sid>` | GET | Returns `{stored_state, has_custom_state, sid}` |
| `POST /upload?sid=<sid>` | POST | multipart/form-data — stores files, returns `{files: [{url, original_name, stored_name, size}]}` |
| `GET /files/<sid>/<filename>` | GET | Serves uploaded file with correct Content-Type |
| `GET /go` (browser route) | — | React page showing `{initial_state, current_state, state_diff}` from context |

---

## Seed Data Counts

| Collection | Count | Notable distribution |
|------------|-------|---------------------|
| products | 15 | 10 on_sale, 3 in_warehouse, 2 removed |
| orders | 25 | 5 pending_shipment, 9 shipped, 5 completed, 3 refunding, 2 pending_payment, 1 closed |
| refunds | 8 | 3 pending, 2 approved, 2 completed, 1 rejected |
| customers | 15 | VIP mix: 5 gold, 5 silver, 5 normal |
| conversations | 8 | 3 with unreadCount > 0 |
| coupons | 6 | 3 active, 1 expired, 1 draft, 1 active (9折) |
| reviews | 20 | 12×5★, 4×4★, 2×3★, 1×2★, 1×1★; 10 with sellerReply |
| notifications | 12 | 8 unread |
| quickReplies | 6 | — |
| logisticsTemplates | 3 | lt_001 (满99免邮), lt_002 (顺丰满299免邮), lt_003 (全国包邮) |
| logisticsProviders | 5 | 中通/圆通/韵达/顺丰/申通 |
| promotions | 3 | 1 completed, 2 active |
