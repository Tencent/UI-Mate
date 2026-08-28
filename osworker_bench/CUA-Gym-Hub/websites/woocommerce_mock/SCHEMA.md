# woocommerce_mock Schema

**Base URL**: `http://localhost:5173/`
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
| `currentUser` | object | `{id, username, displayName, email, role, avatarUrl}` |
| `store` | object | Store settings: `{id, name, tagline, email, address{address1,address2,city,state,country,postcode}, currency, currencySymbol, currencyPosition, thousandSeparator, decimalSeparator, decimals, weightUnit, dimensionUnit, enableTax, enableCoupons, enableReviews, timezone, dateFormat, sellingLocation, shippingLocation, defaultCustomerLocation}` |
| `products` | array | Each: `{id, name, slug, type, status, featured, catalogVisibility, description, shortDescription, sku, price, regularPrice, salePrice, onSale, taxStatus, taxClass, manageStock, stockQuantity, stockStatus, weight, dimensions{length,width,height}, categories[{id,name}], tags[{id,name}], images[{id,src,alt}], attributes[], variations[], reviewCount, averageRating, totalSales, dateCreated, dateModified}` |
| `categories` | array | Each: `{id, name, slug, parent, description, count}` |
| `tags` | array | Each: `{id, name, slug, count}` |
| `orders` | array | Each: `{id, number, status, dateCreated, dateModified, datePaid, dateCompleted, customerId, billing{firstName,lastName,company,address1,address2,city,state,postcode,country,email,phone}, shipping{...}, lineItems[{id,productId,name,sku,price,quantity,total}], subtotal, discountTotal, shippingTotal, totalTax, total, paymentMethod, paymentMethodTitle, customerNote, shippingLines[], orderNotes[{id,content,dateCreated,isCustomerNote,addedBy}]}` |
| `customers` | array | Each: `{id, firstName, lastName, email, phone, avatarUrl, dateCreated, ordersCount, totalSpent, billing{...}, shipping{...}}` |
| `coupons` | array | Each: `{id, code, discountType, amount, dateExpires, usageCount, usageLimit, description}` |
| `reviews` | array | Each: `{id, productId, productName, reviewer, reviewerEmail, review, rating, status, dateCreated}` |
| `analytics` | object | `{dailyData[{date,ordersCount,grossRevenue,netRevenue,refunds,coupons,taxes,shipping,previousGrossRevenue,previousNetRevenue,previousOrdersCount}], revenueSummary{grossRevenue,refunds,coupons,taxes,shipping,netRevenue,ordersCount,previousPeriod{...}}, topProducts[{productId,name,itemsSold,netRevenue,ordersCount}]}` |
| `notifications` | array | Each: `{id, type, title, content, dateCreated, isRead, actions[{label,url}]}` |
| `shippingZones` | array | Each: `{id, name, regions[], methods[{id,title,cost,minAmount,enabled}]}` |
| `taxRates` | array | Each: `{id, country, state, postcode, city, rate, name, priority, compound, shipping, taxClass}` |
| `paymentGateways` | array | Each: `{id, title, description, enabled, order}` |

### Default IDs

**Products**: `prod_1` through `prod_15`
**Categories**: `cat_1` (Oils & Vinegars), `cat_2` (Snacks & Granola), `cat_3` (Teas & Beverages), `cat_4` (Skincare), `cat_5` (Supplements), `cat_6` (Essential Oils), `cat_7` (Green Teas)
**Tags**: `tag_1` through `tag_8`
**Orders**: `order_1` through `order_25`
**Customers**: `cust_1` through `cust_12`
**Coupons**: `coup_1` (SAVE10), `coup_2` (FREESHIP), `coup_3` (WELCOME15), `coup_4` (EXPIRED20)
**Tax Rates**: `tax_1` (CA 7.25%), `tax_2` (NY 8.00%), `tax_3` (TX 6.25%)
**Shipping Zones**: `zone_1` (US), `zone_2` (Canada), `zone_3` (International)
**Payment Gateways**: `stripe`, `paypal`, `bacs`, `cod`
**Notifications**: `notif_1` through `notif_8`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_1",
      "username": "admin",
      "displayName": "Alex Rivera",
      "email": "alex@greenleaforganics.com",
      "role": "administrator",
      "avatarUrl": "https://placehold.co/32x32/1d2327/fff?text=AR"
    },
    "store": {
      "id": "store_1",
      "name": "GreenLeaf Organics",
      "email": "admin@greenleaforganics.com",
      "address": {"address1": "456 Market Street", "city": "San Francisco", "state": "CA", "country": "US", "postcode": "94102"},
      "currency": "USD",
      "currencySymbol": "$",
      "enableTax": true,
      "enableCoupons": true,
      "enableReviews": true,
      "weightUnit": "lbs",
      "dimensionUnit": "in"
    },
    "products": [
      {
        "id": "prod_1", "name": "Organic Avocado Oil", "slug": "organic-avocado-oil",
        "type": "simple", "status": "publish", "sku": "GAO-001",
        "price": "24.99", "regularPrice": "29.99", "salePrice": "24.99", "onSale": true,
        "manageStock": true, "stockQuantity": 150, "stockStatus": "instock",
        "categories": [{"id": "cat_1", "name": "Oils & Vinegars"}],
        "tags": [], "images": [], "attributes": [], "variations": [],
        "reviewCount": 0, "averageRating": "0", "totalSales": 0,
        "dateCreated": "2025-10-13T12:00:00.000Z", "dateModified": "2026-04-01T12:00:00.000Z"
      }
    ],
    "categories": [{"id": "cat_1", "name": "Oils & Vinegars", "slug": "oils-vinegars", "parent": null, "count": 1}],
    "tags": [],
    "orders": [],
    "customers": [],
    "coupons": [],
    "reviews": [],
    "analytics": {
      "dailyData": [],
      "revenueSummary": {
        "grossRevenue": 0, "refunds": 0, "coupons": 0, "taxes": 0, "shipping": 0, "netRevenue": 0, "ordersCount": 0,
        "previousPeriod": {"grossRevenue": 0, "netRevenue": 0, "ordersCount": 0}
      },
      "topProducts": []
    },
    "notifications": [],
    "shippingZones": [],
    "taxRates": [],
    "paymentGateways": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Change order status (Save order) | `orders[i].status`, `orders[i].dateModified`, `orders[i].orderNotes` grows by 1 (system note) |
| Add order note | `orders[i].orderNotes` array grows by 1 |
| Create new product | `products` array grows by 1 |
| Update product (name/price/status/stock) | `products[i].name`, `products[i].price`, `products[i].status`, `products[i].stockQuantity`, `products[i].dateModified` |
| Trash product (list page row action) | `products[i].status` → `"trash"` |
| Bulk trash products | `products[i].status` → `"trash"` for selected IDs |
| Quick Edit product (title/price/status) | `products[i].name`, `products[i].regularPrice`, `products[i].salePrice`, `products[i].status`, `products[i].dateModified` |
| Bulk change order status | `orders[i].status` updated for selected IDs |
| Approve review (activity panel) | `reviews[i].status` → `"approved"` |
| Spam review (activity panel) | `reviews[i].status` → `"spam"` |
| Trash review (activity panel) | `reviews[i].status` → `"trash"` |
| Mark all notifications read | `notifications[i].isRead` → `true` for all |
| Toggle payment gateway enabled | `paymentGateways[i].enabled` toggled |
| Save General settings | `store.address`, `store.currency`, `store.enableTax`, `store.enableCoupons`, etc. updated |
| Save Products settings | `store.weightUnit`, `store.dimensionUnit`, `store.enableReviews` updated |
| Save Tax settings | `taxRates[i]` fields updated; rows added/removed |
| Delete coupon | `coupons` array shrinks by 1 |
| Add product category | `categories` array grows by 1 |
| Delete product category | `categories` array shrinks by 1 |
| Add product tag | `tags` array grows by 1 |
| Delete product tag | `tags` array shrinks by 1 |
