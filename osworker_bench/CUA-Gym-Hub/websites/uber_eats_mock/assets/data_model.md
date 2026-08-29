# Xber Eats Mock — Data Model

> For use in `src/utils/dataManager.js`
> All IDs use string format: `"<type>_<number>"` (e.g., `"rest_1"`, `"item_14"`)

---

## Entity Types

### 1. User (Current Logged-in User)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"user_1"` |
| `name` | string | `"Alex Johnson"` |
| `email` | string | `"alex.johnson@email.com"` |
| `phone` | string | `"(415) 555-0123"` |
| `avatarUrl` | string | `"/avatars/alex.jpg"` |
| `addresses` | Address[] | See Address entity |
| `defaultAddressId` | string | `"addr_1"` |
| `paymentMethods` | PaymentMethod[] | See below |
| `defaultPaymentId` | string | `"pay_1"` |
| `uberOneActive` | boolean | `false` |
| `favoriteRestaurantIds` | string[] | `["rest_1", "rest_5"]` |

### 2. Address

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"addr_1"` |
| `label` | string | `"Home"` |
| `street` | string | `"123 Main St"` |
| `apt` | string | `"Apt 4B"` |
| `city` | string | `"San Francisco"` |
| `state` | string | `"CA"` |
| `zip` | string | `"94102"` |
| `instructions` | string | `"Ring bell, 2nd floor"` |
| `isDefault` | boolean | `true` |

### 3. PaymentMethod

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"pay_1"` |
| `type` | string | `"visa"` \| `"mastercard"` \| `"amex"` \| `"paypal"` \| `"uber_cash"` |
| `label` | string | `"Visa •••• 4242"` |
| `last4` | string | `"4242"` |
| `isDefault` | boolean | `true` |

### 4. Restaurant

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"rest_1"` |
| `name` | string | `"Bella Italia"` |
| `imageUrl` | string | `"/images/restaurants/bella-italia.jpg"` |
| `cuisineType` | string[] | `["Italian", "Pizza", "Pasta"]` |
| `rating` | number | `4.6` |
| `reviewCount` | number | `234` |
| `priceRange` | string | `"$$"` (one of `"$"`, `"$$"`, `"$$$"`, `"$$$$"`) |
| `deliveryFee` | number | `2.49` |
| `deliveryTimeMin` | number | `20` |
| `deliveryTimeMax` | number | `35` |
| `distance` | number | `1.2` (miles) |
| `isOpen` | boolean | `true` |
| `hours` | string | `"10:00 AM - 11:00 PM"` |
| `address` | string | `"456 Market St, San Francisco, CA"` |
| `phone` | string | `"(415) 555-0456"` |
| `isSponsored` | boolean | `false` |
| `promotions` | Promotion[] | See below |
| `categories` | string[] | `["Featured Items", "Appetizers", "Pasta", "Pizza", "Desserts", "Drinks"]` |
| `tags` | string[] | `["Popular", "Top Rated", "New"]` |
| `supportsPickup` | boolean | `true` |
| `pickupTimeMin` | number | `10` |
| `pickupTimeMax` | number | `20` |

### 5. MenuItem

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"item_1"` |
| `restaurantId` | string | `"rest_1"` |
| `category` | string | `"Pizza"` |
| `name` | string | `"Margherita Pizza"` |
| `description` | string | `"Fresh mozzarella, tomato sauce, basil on hand-tossed dough"` |
| `price` | number | `14.99` |
| `imageUrl` | string | `"/images/items/margherita.jpg"` |
| `isPopular` | boolean | `true` |
| `isAvailable` | boolean | `true` |
| `customizationGroups` | CustomizationGroup[] | See below |
| `dietaryTags` | string[] | `["Vegetarian"]` |

### 6. CustomizationGroup

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"cg_1"` |
| `name` | string | `"Choose your size"` |
| `required` | boolean | `true` |
| `maxSelections` | number | `1` (1 for radio, n for checkbox) |
| `minSelections` | number | `1` |
| `options` | CustomizationOption[] | See below |

### 7. CustomizationOption

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"co_1"` |
| `name` | string | `"Large (14\")"` |
| `priceModifier` | number | `3.00` (added to base price; 0 for default) |
| `isDefault` | boolean | `false` |
| `isAvailable` | boolean | `true` |

### 8. CartItem

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ci_1"` (unique cart item instance) |
| `menuItemId` | string | `"item_1"` |
| `restaurantId` | string | `"rest_1"` |
| `name` | string | `"Margherita Pizza"` |
| `quantity` | number | `2` |
| `basePrice` | number | `14.99` |
| `selectedOptions` | SelectedOption[] | `[{groupName: "Size", optionName: "Large", priceModifier: 3.00}]` |
| `specialInstructions` | string | `"Extra crispy"` |
| `totalPrice` | number | `35.98` (computed: (basePrice + sum of modifiers) * quantity) |

### 9. SelectedOption

| Field | Type | Example |
|-------|------|---------|
| `groupId` | string | `"cg_1"` |
| `groupName` | string | `"Choose your size"` |
| `optionId` | string | `"co_1"` |
| `optionName` | string | `"Large (14\")"` |
| `priceModifier` | number | `3.00` |

### 10. Cart

| Field | Type | Example |
|-------|------|---------|
| `restaurantId` | string \| null | `"rest_1"` |
| `restaurantName` | string \| null | `"Bella Italia"` |
| `items` | CartItem[] | Array of cart items |
| `deliveryMode` | string | `"delivery"` \| `"pickup"` |
| `scheduledTime` | string \| null | `null` (ASAP) or ISO datetime string |
| `promoCode` | string \| null | `null` |
| `promoDiscount` | number | `0` |
| `tipAmount` | number | `3.00` |
| `tipPercentage` | number \| null | `18` (one of 15, 18, 20, 25, or null for custom) |
| `deliveryInstructions` | string | `""` |

### 11. Order

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"ord_1"` |
| `restaurantId` | string | `"rest_1"` |
| `restaurantName` | string | `"Bella Italia"` |
| `restaurantImageUrl` | string | `"/images/restaurants/bella-italia.jpg"` |
| `items` | OrderItem[] | See below |
| `status` | string | `"delivered"` — see Order Status Flow |
| `placedAt` | string (ISO) | `"2025-03-08T18:30:00Z"` |
| `estimatedDeliveryMin` | string (ISO) | `"2025-03-08T19:00:00Z"` |
| `estimatedDeliveryMax` | string (ISO) | `"2025-03-08T19:15:00Z"` |
| `deliveredAt` | string (ISO) \| null | `"2025-03-08T19:08:00Z"` |
| `deliveryAddress` | Address | Snapshot of address at order time |
| `deliveryMode` | string | `"delivery"` |
| `subtotal` | number | `35.98` |
| `serviceFee` | number | `3.54` |
| `deliveryFee` | number | `2.49` |
| `tax` | number | `3.24` |
| `tip` | number | `5.40` |
| `promoDiscount` | number | `0` |
| `total` | number | `50.65` |
| `paymentMethod` | string | `"Visa •••• 4242"` |
| `deliveryPerson` | DeliveryPerson \| null | See below |
| `rating` | number \| null | `null` (unrated) or 1-5 |
| `review` | string \| null | `null` |

### 12. OrderItem

| Field | Type | Example |
|-------|------|---------|
| `menuItemId` | string | `"item_1"` |
| `name` | string | `"Margherita Pizza"` |
| `quantity` | number | `2` |
| `unitPrice` | number | `17.99` (base + modifiers) |
| `totalPrice` | number | `35.98` |
| `selectedOptions` | string[] | `["Large (14\")"]` |
| `specialInstructions` | string | `"Extra crispy"` |

### 13. DeliveryPerson

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"dp_1"` |
| `name` | string | `"Marcus R."` |
| `photoUrl` | string | `"/images/drivers/marcus.jpg"` |
| `vehicleType` | string | `"car"` \| `"bike"` \| `"scooter"` |
| `rating` | number | `4.9` |

### 14. Promotion

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"promo_1"` |
| `type` | string | `"discount"` \| `"free_delivery"` \| `"percentage"` |
| `title` | string | `"$5 off $25+"` |
| `description` | string | `"Save $5 on orders over $25"` |
| `code` | string \| null | `"SAVE5"` |
| `minOrder` | number | `25.00` |
| `discountAmount` | number | `5.00` |
| `discountPercent` | number \| null | `null` |
| `expiresAt` | string | `"2025-04-01"` |
| `restaurantId` | string \| null | `"rest_1"` (null = site-wide) |

### 15. Category (Cuisine/Browse)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"cat_1"` |
| `name` | string | `"Pizza"` |
| `icon` | string | `"🍕"` (emoji used as category icon) |
| `imageUrl` | string \| null | `null` |

### 16. Review

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"rev_1"` |
| `restaurantId` | string | `"rest_1"` |
| `userId` | string | `"user_1"` |
| `userName` | string | `"Alex J."` |
| `rating` | number | `5` |
| `comment` | string | `"Best pizza in the city!"` |
| `createdAt` | string | `"2025-03-01T12:00:00Z"` |
| `orderId` | string | `"ord_1"` |

---

## Order Status Flow

```
placed → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered
                                                                      ↘ cancelled
```

| Status | Display Text | Description |
|--------|-------------|-------------|
| `placed` | "Order Placed" | User submitted order, awaiting restaurant confirmation |
| `confirmed` | "Order Confirmed" | Restaurant accepted the order |
| `preparing` | "Preparing" | Restaurant is making the food |
| `ready_for_pickup` | "Ready for Pickup" | Food ready, waiting for driver |
| `out_for_delivery` | "Out for Delivery" | Driver picked up, en route |
| `delivered` | "Delivered" | Order completed |
| `cancelled` | "Cancelled" | Order was cancelled |

For the tracking progress bar, we display 4 simplified steps:
1. ✅ Order Received (= placed or confirmed)
2. 🍳 Preparing (= preparing or ready_for_pickup)
3. 🚗 Out for Delivery (= out_for_delivery)
4. 📦 Delivered (= delivered)

---

## Relationships

```
User
 ├── has many Addresses
 ├── has many PaymentMethods
 ├── has many Orders
 ├── has one Cart
 └── favorites many Restaurants

Restaurant
 ├── has many MenuItems
 ├── has many Categories (menu sections)
 ├── has many Reviews
 └── has many Promotions

MenuItem
 ├── belongs to Restaurant
 └── has many CustomizationGroups
      └── has many CustomizationOptions

Cart
 ├── belongs to one Restaurant (or null)
 └── has many CartItems
      └── each has SelectedOptions

Order
 ├── belongs to User
 ├── belongs to Restaurant
 ├── has many OrderItems
 ├── has one DeliveryPerson (if delivery)
 └── has one Review (optional)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    // Current user
    user: { /* User object */ },

    // Browse categories
    categories: [ /* 15+ Category objects */ ],

    // Restaurants (8-12 for realistic browsing)
    restaurants: [ /* Restaurant objects */ ],

    // Menu items organized by restaurant
    menuItems: [ /* 60-80+ MenuItem objects across all restaurants */ ],

    // Shopping cart (starts empty)
    cart: {
      restaurantId: null,
      restaurantName: null,
      items: [],
      deliveryMode: "delivery",
      scheduledTime: null,
      promoCode: null,
      promoDiscount: 0,
      tipAmount: 0,
      tipPercentage: 18,
      deliveryInstructions: ""
    },

    // Past orders (3-5 for history)
    orders: [ /* Order objects with various statuses */ ],

    // Active order being tracked (1 active order or null)
    activeOrderId: null,

    // Promotions
    promotions: [ /* 3-5 Promotion objects */ ],

    // Reviews
    reviews: [ /* 10-20 Review objects across restaurants */ ],

    // UI state
    ui: {
      selectedAddressId: "addr_1",
      deliveryMode: "delivery",  // "delivery" | "pickup"
      searchQuery: "",
      activeFilters: {
        sort: "recommended",  // "recommended" | "rating" | "delivery_time" | "price"
        priceRange: [],       // subset of ["$", "$$", "$$$", "$$$$"]
        dietary: [],          // subset of ["vegetarian", "vegan", "gluten_free"]
        maxDeliveryFee: null, // number or null
        deals: false
      }
    }
  };
}
```

---

## Seed Data Requirements

### Restaurants (10 total, diverse cuisines)
1. **Bella Italia** — Italian, Pizza, $$, 4.6 rating, $2.49 delivery
2. **Tokyo Express** — Japanese, Sushi, $$, 4.8 rating, $3.99 delivery
3. **Burger Barn** — American, Burgers, $, 4.3 rating, $0.99 delivery, Sponsored
4. **Taco Fiesta** — Mexican, Tacos, $, 4.5 rating, $1.49 delivery
5. **Golden Dragon** — Chinese, Asian, $$, 4.4 rating, $2.99 delivery
6. **Spice Route** — Indian, Curry, $$, 4.7 rating, $3.49 delivery
7. **The Green Bowl** — Healthy, Salads, $$, 4.6 rating, $2.99 delivery, Vegetarian-friendly
8. **Sweet Treats Bakery** — Dessert, Bakery, $, 4.9 rating, $1.99 delivery
9. **Pho King Good** — Vietnamese, Pho, $, 4.5 rating, $2.49 delivery
10. **Mediterranean Grill** — Mediterranean, Kebabs, $$, 4.4 rating, Free delivery (promo)

### Menu Items per Restaurant: 6-10 items each
- Each restaurant should have 2-4 menu categories
- Each item should have 1-3 customization groups
- Include popular items flagged with `isPopular: true`
- Mix of items with and without images

### Past Orders: 5 orders
1. Delivered (2 days ago) — Bella Italia, 2 items, $32.50, rated 5 stars
2. Delivered (5 days ago) — Burger Barn, 3 items, $28.99, unrated
3. Delivered (1 week ago) — Tokyo Express, 1 item, $18.50, rated 4 stars
4. Delivered (2 weeks ago) — Taco Fiesta, 4 items, $42.00, rated 5 stars
5. Cancelled (3 days ago) — Golden Dragon, 2 items, $25.00

### Categories for Browsing: 15 categories
Pizza 🍕, Burgers 🍔, Sushi 🍣, Chinese 🥡, Mexican 🌮, Indian 🍛, Thai 🍜, Italian 🍝, Healthy 🥗, Dessert 🍰, Coffee ☕, Breakfast 🥞, Sandwich 🥪, Korean 🍱, Mediterranean 🥙
