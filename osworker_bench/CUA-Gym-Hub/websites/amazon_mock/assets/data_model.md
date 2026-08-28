# Xmazon Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Types

### Product
The core entity. 60 products across 6 categories.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | `"p1"` |
| `title` | string | Full product title | `"Samsung Galaxy Buds Pro - Wireless Bluetooth Headphones"` |
| `price` | number | Current price in USD | `149.99` |
| `originalPrice` | number \| null | Strikethrough price (if on deal) | `199.99` |
| `rating` | number | Average rating 0-5 (1 decimal) | `4.3` |
| `reviewCount` | number | Total number of reviews | `2847` |
| `image` | string | Product image URL | `"https://picsum.photos/seed/p1/400/400"` |
| `images` | string[] | Array of image URLs (gallery) | `["url1", "url2", "url3"]` |
| `description` | string | Full product description | `"Experience premium sound..."` |
| `bulletPoints` | string[] | Feature bullet points (5-7) | `["Active Noise Cancellation", ...]` |
| `specs` | object | Key-value specification pairs | `{ "Brand": "Samsung", "Model": "SM-R190", ... }` |
| `category` | string | Primary category | `"Electronics"` |
| `brand` | string | Brand name | `"Samsung"` |
| `prime` | boolean | Prime eligible | `true` |
| `inStock` | boolean | Availability | `true` |
| `stockCount` | number | Remaining stock (if low) | `15` |
| `seller` | string | Seller name | `"Amazon.com"` |
| `badges` | string[] | Special badges | `["Best Seller", "Xmazon's Choice"]` |
| `createdAt` | string | ISO date | `"2024-01-15T00:00:00.000Z"` |

### User
Single pre-authenticated user.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | User ID | `"u1"` |
| `name` | string | Full name | `"Demo User"` |
| `email` | string | Email | `"demo@example.com"` |
| `address` | Address | Default shipping address | *(see Address)* |
| `addresses` | Address[] | Saved addresses | *(array of Address)* |
| `paymentMethod` | PaymentMethod | Default payment | *(see PaymentMethod)* |
| `paymentMethods` | PaymentMethod[] | Saved payment methods | *(array)* |

### Address (sub-object of User)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"addr1"` |
| `fullName` | string | `"Demo User"` |
| `street` | string | `"123 Mock Lane"` |
| `city` | string | `"Seattle"` |
| `state` | string | `"WA"` |
| `zip` | string | `"98109"` |
| `country` | string | `"United States"` |
| `phone` | string | `"555-0123"` |
| `isDefault` | boolean | `true` |

### PaymentMethod (sub-object of User)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"pm1"` |
| `last4` | string | `"4242"` |
| `brand` | string | `"Visa"` |
| `expiry` | string | `"12/26"` |
| `isDefault` | boolean | `true` |

### CartItem (in `cart` array)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `productId` | string | FK → Product.id | `"p1"` |
| `quantity` | number | Item count (1-10) | `2` |

### SavedForLaterItem (in `savedForLater` array)
Same structure as CartItem.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `productId` | string | FK → Product.id | `"p5"` |
| `quantity` | number | Saved quantity | `1` |

### Wishlist
Array of product IDs: `string[]`
Example: `["p3", "p7", "p12"]`

### Order

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Order ID | `"ord-1709234567890"` |
| `date` | string | ISO date placed | `"2024-11-15T10:30:00.000Z"` |
| `status` | string | Order status | `"Delivered"` |
| `total` | number | Order total with tax | `162.57` |
| `items` | CartItem[] | Ordered items | `[{ productId: "p1", quantity: 1 }]` |
| `shippingAddress` | Address | Shipping address used | *(Address object)* |
| `paymentMethod` | PaymentMethod | Payment used | *(PaymentMethod object)* |
| `trackingNumber` | string \| null | Tracking ID | `"1Z999AA10123456784"` |
| `estimatedDelivery` | string \| null | Estimated delivery date | `"2024-11-18"` |

**Valid status values**: `"Processing"`, `"Shipped"`, `"Out for Delivery"`, `"Delivered"`, `"Cancelled"`, `"Returned"`

### Review

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Review ID | `"rev-1"` |
| `productId` | string | FK → Product.id | `"p1"` |
| `userId` | string | FK → User.id | `"u1"` |
| `userName` | string | Display name | `"John D."` |
| `rating` | number | 1-5 stars | `4` |
| `title` | string | Review headline | `"Great sound quality!"` |
| `content` | string | Review body | `"These headphones exceeded..."` |
| `date` | string | ISO date | `"2024-10-20T00:00:00.000Z"` |
| `helpful` | number | Helpful vote count | `23` |
| `verifiedPurchase` | boolean | Verified purchase badge | `true` |

---

## Relationships

```
Product ──< CartItem (via productId)
Product ──< SavedForLaterItem (via productId)
Product ──< Review (via productId)
Product ──< Wishlist entry (product ID in array)
Product ──< Order.items (via CartItem.productId)
User ──< Order (user is implicit, single-user app)
User ──< Review (via userId)
User ── Address (1:many, but default used)
User ── PaymentMethod (1:many, but default used)
```

---

## Realistic Seed Data Specifications

### Products (60 total, 10 per category)

**Categories & product examples:**

1. **Electronics** (10): Samsung Galaxy Buds Pro ($149.99), Apple MacBook Air M2 ($999.00), Sony WH-1000XM5 Headphones ($348.00), Anker PowerCore Battery ($29.99), Logitech MX Master 3S Mouse ($89.99), Samsung 4K Monitor 27" ($279.99), Apple iPad 10th Gen ($349.00), Bose SoundLink Speaker ($129.00), Fire TV Stick 4K ($39.99), Ring Video Doorbell ($99.99)

2. **Books** (10): "Atomic Habits" by James Clear ($16.99), "Project Hail Mary" by Andy Weir ($14.99), "The Midnight Library" by Matt Haig ($13.99), "Educated" by Tara Westover ($15.99), "Dune" by Frank Herbert ($10.99), "JavaScript: The Good Parts" ($29.99), "Sapiens" by Yuval Noah Harari ($17.99), "Where the Crawdads Sing" ($12.99), "The Alchemist" by Paulo Coelho ($11.99), "Clean Code" by Robert Martin ($39.99)

3. **Home & Kitchen** (10): Ninja Air Fryer ($89.99), Keurig K-Classic Coffee Maker ($79.99), Instant Pot Duo 7-in-1 ($69.99), iRobot Roomba 694 ($179.99), Crock-Pot Slow Cooker ($39.99), Egyptian Cotton Bed Sheet Set ($49.99), KitchenAid Stand Mixer ($329.99), Vitamix Blender ($349.99), Lodge Cast Iron Skillet ($34.99), Dyson V15 Vacuum ($649.99)

4. **Fashion** (10): Nike Air Force 1 ($110.00), Levi's 501 Original Jeans ($69.50), Ray-Ban Aviator Sunglasses ($161.00), Champion Hoodie ($45.00), Adidas Ultraboost Shoes ($190.00), Calvin Klein T-Shirt Pack ($39.99), Herschel Supply Backpack ($74.99), Timex Weekender Watch ($35.00), North Face Puffer Jacket ($199.00), New Balance 574 Sneakers ($79.99)

5. **Toys & Games** (10): LEGO Star Wars Millennium Falcon ($159.99), Monopoly Board Game ($19.99), Nintendo Switch Joy-Con Set ($79.99), Barbie Dreamhouse ($179.99), Rubik's Cube ($9.99), Nerf Elite Blaster ($24.99), Play-Doh 36-Pack ($19.99), Hot Wheels Track Builder ($29.99), Catan Board Game ($44.99), Melissa & Doug Wooden Puzzle ($12.99)

6. **Beauty** (10): CeraVe Moisturizing Cream ($16.99), Maybelline Lash Sensational Mascara ($11.99), Olaplex No.3 Hair Perfector ($30.00), Neutrogena Sunscreen SPF 70 ($12.99), Revlon One-Step Hair Dryer ($34.99), The Ordinary Niacinamide Serum ($12.50), NYX Lip Lingerie ($9.99), Dove Body Wash Pack ($14.99), Bioderma Sensibio Micellar Water ($14.99), OPI Nail Lacquer Set ($24.99)

### Seed Reviews (20 total, spread across popular products)
- Mix of 5-star, 4-star, 3-star ratings (weighted toward positive)
- Each review: realistic headline, 2-3 sentence body, random helpful count (0-150)
- Include `verifiedPurchase: true` for most

### Seed Orders (3 pre-existing orders)
1. **Delivered** order from 2 weeks ago: 2 items, total ~$180, status "Delivered"
2. **Shipped** order from 3 days ago: 1 item, total ~$50, status "Shipped"
3. **Processing** order from today: 3 items, total ~$320, status "Processing"

### Seed Cart (2 items pre-loaded)
- 1 Electronics item, qty 1
- 1 Home & Kitchen item, qty 2

### Seed Wishlist (3 product IDs)

### Seed Recently Viewed (5 product IDs)

### Seed Recent Searches
`["wireless headphones", "coffee maker", "running shoes", "laptop stand", "kindle"]`

---

## createInitialData() Structure

```javascript
export const INITIAL_DATA = {
  products: generateProducts(),     // 60 Product objects
  user: INITIAL_USER,               // Single User object
  cart: [                           // Pre-loaded cart
    { productId: "p1", quantity: 1 },
    { productId: "p23", quantity: 2 }
  ],
  wishlist: ["p5", "p12", "p37"],   // Product IDs
  savedForLater: [],                // CartItem[]
  orders: [                         // 3 seed orders
    {
      id: "ord-seed-1",
      date: "<2 weeks ago ISO>",
      status: "Delivered",
      total: 179.98,
      items: [{ productId: "p1", quantity: 1 }, { productId: "p34", quantity: 1 }],
      shippingAddress: { ...INITIAL_USER.address },
      paymentMethod: { ...INITIAL_USER.paymentMethod },
      trackingNumber: "1Z999AA10123456784",
      estimatedDelivery: null
    },
    // ... 2 more orders
  ],
  reviews: [
    // 20 Review objects spread across products
  ],
  recentSearches: ["wireless headphones", "coffee maker", "running shoes", "laptop stand", "kindle"],
  recentlyViewed: ["p3", "p7", "p15", "p22", "p41"]
};
```

---

## Normalization Notes (for POST API)

The existing `deepMergeWithDefaults` and normalizer functions in `mockData.js` handle malformed POST data. Key normalizers already implemented:
- `normalizeProduct()` — ensures all required fields with defaults
- `normalizeCartItem()` — maps `product_id` → `productId`, ensures quantity ≥ 1
- `normalizeWishlistItem()` — handles both string IDs and objects
- `normalizeOrder()` — maps nested address/payment fields
- `normalizeReview()` — maps `user_name` → `userName`, clamps rating 0-5
- `normalizeRecentSearch()` — handles string or object input
- `normalizeRecentlyViewedItem()` — handles string or object input

Any new fields added to the data model should have corresponding normalizer updates.
