# Xnstacart Mock — Data Model

> Last updated: 2025-03-09
> Used by: `src/utils/dataManager.js` → `createInitialData()`

---

## Entity Definitions

### 1. User (Pre-logged-in)

```javascript
{
  id: "user_1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
  phone: "(415) 555-0142",
  avatar: null, // initials-based avatar
  defaultAddressId: "addr_1",
  instacartPlus: true, // Xnstacart+ membership active
  instacartPlusExpiry: "2026-01-15",
  preferredStoreId: "store_1",
  createdAt: "2023-06-15T10:00:00Z"
}
```

### 2. Address

```javascript
{
  id: "addr_1",
  userId: "user_1",
  label: "Home",             // "Home", "Work", "Other"
  street: "742 Evergreen Terrace",
  apt: "Apt 3B",
  city: "San Francisco",
  state: "CA",
  zip: "94110",
  isDefault: true,
  deliveryInstructions: "Leave at the front door"
}
```

**Seed:** 2 addresses (Home, Work)

### 3. Store

```javascript
{
  id: "store_1",
  name: "Safeway",
  slug: "safeway",
  logo: "/store-logos/safeway.svg",  // Use emoji or CSS-drawn logos
  description: "Fresh groceries and everyday essentials",
  deliveryFee: 3.99,
  deliveryFeeWithPlus: 0,           // Free with Xnstacart+
  serviceFeePercent: 5,             // 5% of subtotal
  minOrder: 10.00,
  deliveryTimeMin: 45,              // minutes
  deliveryTimeMax: 60,
  rating: 4.7,
  isInStorePricing: true,           // "In-store prices" badge
  categories: ["Groceries"],        // store type tags
  departments: ["dept_produce", "dept_dairy", ...] // references
}
```

**Seed stores (8):**
| id | name | deliveryFee | deliveryTime | notes |
|----|------|-------------|--------------|-------|
| store_1 | Safeway | $3.99 | 45-60 min | General grocery |
| store_2 | Costco | $5.99 | 60-90 min | Warehouse/bulk |
| store_3 | Whole Foods Market | $3.99 | 30-45 min | Organic/premium |
| store_4 | Sprouts Farmers Market | $3.99 | 45-60 min | Natural/organic |
| store_5 | CVS Pharmacy | $3.99 | 30-45 min | Pharmacy/convenience |
| store_6 | Target | $3.99 | 45-60 min | General retail |
| store_7 | Petco | $3.99 | 60-90 min | Pet supplies |
| store_8 | Total Wine & More | $5.99 | 60-90 min | Alcohol/beverages |

### 4. Department

```javascript
{
  id: "dept_produce",
  storeId: "store_1",    // department is per-store
  name: "Produce",
  slug: "produce",
  icon: "🥬",            // emoji icon for easy rendering
  displayOrder: 1,
  subcategories: [
    { id: "subcat_fruits", name: "Fresh Fruits", slug: "fresh-fruits" },
    { id: "subcat_vegetables", name: "Fresh Vegetables", slug: "fresh-vegetables" },
    { id: "subcat_herbs", name: "Fresh Herbs", slug: "fresh-herbs" },
    { id: "subcat_organic", name: "Organic Produce", slug: "organic-produce" }
  ]
}
```

**Standard departments (shared across grocery stores, 14 total):**

| displayOrder | name | icon | subcategories (examples) |
|---|---|---|---|
| 1 | Produce | 🥬 | Fresh Fruits, Fresh Vegetables, Fresh Herbs, Organic Produce |
| 2 | Dairy & Eggs | 🥛 | Milk, Cheese, Yogurt, Eggs, Butter & Margarine |
| 3 | Meat & Seafood | 🥩 | Beef, Chicken, Pork, Seafood, Deli Meat |
| 4 | Bakery | 🍞 | Bread, Rolls & Buns, Cakes & Pies, Cookies & Brownies |
| 5 | Deli | 🧀 | Prepared Meals, Sliced Cheese, Sliced Meats, Dips & Spreads |
| 6 | Frozen | ❄️ | Frozen Meals, Ice Cream, Frozen Vegetables, Frozen Pizza |
| 7 | Pantry | 🥫 | Pasta & Grains, Canned Goods, Sauces & Condiments, Oils & Vinegars, Baking |
| 8 | Snacks & Candy | 🍿 | Chips, Crackers, Nuts & Seeds, Candy & Chocolate, Popcorn |
| 9 | Beverages | 🥤 | Water, Soda, Juice, Coffee & Tea, Energy Drinks |
| 10 | Breakfast | 🥣 | Cereal, Oatmeal, Pancake & Waffle Mix, Breakfast Bars |
| 11 | Household | 🧹 | Cleaning Supplies, Paper Products, Laundry, Trash Bags |
| 12 | Health & Beauty | 💊 | Vitamins, Pain Relief, Skin Care, Hair Care, Oral Care |
| 13 | Baby & Kids | 🍼 | Diapers, Baby Food, Baby Care, Kids Snacks |
| 14 | Pet Care | 🐾 | Dog Food, Cat Food, Pet Treats, Pet Supplies |

### 5. Product

```javascript
{
  id: "prod_1",
  storeId: "store_1",
  departmentId: "dept_produce",
  subcategoryId: "subcat_fruits",
  name: "Organic Bananas",
  brand: "Organic",
  description: "Ripe organic bananas, perfect for snacking or baking.",
  image: "/product-images/banana.jpg",  // Use placeholder/emoji
  price: 0.79,
  originalPrice: null,           // non-null if on sale
  priceUnit: "each",             // "each", "lb", "oz", "ct"
  unitSize: "1 ct",              // display size
  unitPrice: 0.79,               // price per unit
  unitPriceLabel: "/each",       // "$0.79/each"
  isOrganic: true,
  isOnSale: false,
  saleEndDate: null,
  inStock: true,
  rating: 4.5,
  reviewCount: 128,
  nutrition: {
    servingSize: "1 medium banana (126g)",
    calories: 110,
    totalFat: "0g",
    sodium: "0mg",
    totalCarbs: "28g",
    fiber: "3g",
    sugars: "15g",
    protein: "1g"
  },
  ingredients: "Organic bananas",
  allergens: [],
  tags: ["organic", "fruit", "fresh"]
}
```

**Seed products: 80-100 products across departments.** Key requirements:
- At least 8-12 products per major department (Produce, Dairy, Meat, Pantry, Beverages, Snacks)
- 3-5 products per minor department
- ~15% should be "on sale" (originalPrice set, isOnSale: true)
- ~30% should be organic
- Mix of brands (store brand, national brands)
- Realistic prices based on US grocery averages

**Example products per department (minimum):**

**Produce (12):** Organic Bananas, Strawberries, Avocados (Hass), Baby Spinach, Romaine Hearts, Russet Potatoes, Yellow Onions, Roma Tomatoes, Lemons, Blueberries, Red Bell Pepper, Broccoli Crowns

**Dairy & Eggs (10):** 2% Milk (gallon), Large Eggs (dozen), Greek Yogurt, Cheddar Cheese Block, Butter (unsalted), Cream Cheese, Shredded Mozzarella, Half & Half, Sour Cream, Cottage Cheese

**Meat & Seafood (8):** Chicken Breast (boneless/skinless), Ground Beef 80/20, Atlantic Salmon Fillet, Pork Chops, Bacon (thick-cut), Italian Sausage, Shrimp (raw, peeled), Deli Turkey Breast

**Bakery (6):** Sourdough Bread, Whole Wheat Bread, Everything Bagels, Croissants, Chocolate Chip Cookies, Flour Tortillas

**Frozen (8):** Frozen Pizza (DiGiorno), Vanilla Ice Cream, Frozen Mixed Vegetables, Frozen Chicken Nuggets, Frozen Berries Mix, Frozen Waffles, Frozen Mac & Cheese, Ice Cream Sandwiches

**Pantry (10):** Spaghetti Pasta, Marinara Sauce, Peanut Butter (creamy), Chicken Broth, Canned Diced Tomatoes, Extra Virgin Olive Oil, Jasmine Rice, Black Beans (canned), Honey, All-Purpose Flour

**Snacks (8):** Lay's Classic Chips, Goldfish Crackers, Mixed Nuts, Oreo Cookies, Microwave Popcorn, Granola Bars, Pretzels, Dark Chocolate Bar

**Beverages (8):** Spring Water (24-pack), Coca-Cola (12-pack), Orange Juice, Coffee (ground), Green Tea Bags, Almond Milk, Sparkling Water (LaCroix), Apple Juice

**Household (6):** Paper Towels, Dish Soap, Laundry Detergent, Trash Bags, All-Purpose Cleaner, Sponges

**Health (4):** Ibuprofen, Multivitamin, Hand Soap, Toothpaste

### 6. CartItem

```javascript
{
  id: "cart_1",
  productId: "prod_1",
  storeId: "store_1",
  quantity: 3,
  replacementPreference: "best_match",  // "best_match" | "specific" | "dont_replace"
  specificReplacementId: null,           // productId if preference is "specific"
  note: "",                              // special instructions for shopper
  addedAt: "2025-03-09T14:30:00Z"
}
```

**Seed:** 4-6 items pre-loaded in cart from store_1 (Safeway), for a realistic starting state.

### 7. Order

```javascript
{
  id: "order_1",
  userId: "user_1",
  storeId: "store_1",
  storeName: "Safeway",
  status: "delivered",  // "placed" | "shopping" | "delivering" | "delivered" | "cancelled"
  items: [
    {
      productId: "prod_1",
      productName: "Organic Bananas",
      productImage: "/product-images/banana.jpg",
      quantity: 3,
      price: 0.79,
      wasReplaced: false,
      replacementProductName: null
    }
  ],
  subtotal: 47.82,
  serviceFee: 2.39,
  deliveryFee: 0.00,
  tip: 5.00,
  tax: 3.83,
  total: 59.04,
  itemCount: 9,
  deliveryAddress: "742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110",
  deliveryDate: "2025-03-07",
  deliveryWindow: "2:00 PM - 3:00 PM",
  placedAt: "2025-03-07T13:15:00Z",
  deliveredAt: "2025-03-07T14:22:00Z",
  shopperName: "Maria G.",
  shopperRating: null // can be set after delivery
}
```

**Seed orders (5):**
| id | store | status | date | items | total |
|----|-------|--------|------|-------|-------|
| order_1 | Safeway | delivered | Mar 7 | 9 | $59.04 |
| order_2 | Whole Foods | delivered | Mar 3 | 14 | $87.23 |
| order_3 | Costco | delivered | Feb 25 | 6 | $124.56 |
| order_4 | Safeway | delivered | Feb 18 | 11 | $52.30 |
| order_5 | Target | delivered | Feb 10 | 8 | $43.17 |

### 8. ShoppingList

```javascript
{
  id: "list_1",
  userId: "user_1",
  name: "Weekly Essentials",
  items: [
    {
      id: "li_1",
      productId: "prod_1",       // linked to a product (optional)
      name: "Organic Bananas",   // display name (always present)
      checked: false,
      quantity: 3,
      addedAt: "2025-03-01T10:00:00Z"
    },
    {
      id: "li_2",
      productId: null,           // custom text item (no linked product)
      name: "Bread (any brand)",
      checked: true,
      quantity: 1,
      addedAt: "2025-03-01T10:05:00Z"
    }
  ],
  createdAt: "2025-02-01T10:00:00Z",
  updatedAt: "2025-03-05T16:30:00Z"
}
```

**Seed lists (3):**
1. "Weekly Essentials" — 8 items (mix of checked/unchecked)
2. "Party Supplies" — 12 items (all unchecked)
3. "Healthy Eating" — 6 items (some checked)

### 9. Recipe

```javascript
{
  id: "recipe_1",
  title: "Classic Spaghetti Bolognese",
  image: "/recipe-images/spaghetti.jpg",  // placeholder
  description: "A hearty Italian pasta dish with a rich meat sauce.",
  prepTime: "15 min",
  cookTime: "30 min",
  totalTime: "45 min",
  servings: 4,
  difficulty: "Easy",
  tags: ["dinner", "italian", "pasta", "family-friendly"],
  ingredients: [
    { name: "Spaghetti Pasta", quantity: "1 lb", productId: "prod_pantry_1" },
    { name: "Ground Beef 80/20", quantity: "1 lb", productId: "prod_meat_2" },
    { name: "Marinara Sauce", quantity: "24 oz jar", productId: "prod_pantry_2" },
    { name: "Yellow Onion", quantity: "1", productId: "prod_produce_7" },
    { name: "Garlic", quantity: "3 cloves", productId: null },
    { name: "Parmesan Cheese", quantity: "1/2 cup grated", productId: null }
  ],
  instructions: [
    "Boil water and cook spaghetti according to package directions.",
    "Brown ground beef in a large skillet over medium-high heat.",
    "Add diced onion and garlic, cook until softened.",
    "Stir in marinara sauce and simmer for 15 minutes.",
    "Serve sauce over spaghetti and top with parmesan."
  ]
}
```

**Seed recipes (6):**
1. Classic Spaghetti Bolognese
2. Chicken Stir-Fry
3. Greek Salad
4. Breakfast Scramble
5. Grilled Salmon with Vegetables
6. Chocolate Chip Pancakes

### 10. Deal/Coupon

```javascript
{
  id: "deal_1",
  storeId: "store_1",
  type: "percent_off",            // "percent_off" | "dollar_off" | "bogo" | "free_delivery"
  title: "20% Off Organic Produce",
  description: "Save on all organic fruits and vegetables this week.",
  discountValue: 20,              // 20% off
  minPurchase: 0,
  applicableProductIds: [],       // empty = applies to category
  applicableDepartmentId: "dept_produce",
  startDate: "2025-03-03",
  endDate: "2025-03-10",
  isClipped: false,               // user has "clipped" this coupon
  code: null                      // promo code if applicable
}
```

**Seed deals (8):**
- 20% Off Organic Produce (Safeway)
- Buy 1 Get 1 Free Ice Cream (Safeway)
- $3 Off on orders $35+ (Whole Foods)
- $5 Off First Order (all stores)
- Free Delivery Weekend (all stores)
- 15% Off Breakfast Items (Safeway)
- BOGO Chips & Snacks (Target)
- 10% Off Household Essentials (Costco)

### 11. DeliverySlot

```javascript
{
  id: "slot_1",
  date: "2025-03-09",
  dayLabel: "Today",              // "Today", "Tomorrow", "Monday", etc.
  windows: [
    { id: "win_1", start: "2:00 PM", end: "3:00 PM", available: true, priority: false, fee: 0 },
    { id: "win_2", start: "2:00 PM", end: "3:00 PM", available: true, priority: true, fee: 2.00 },
    { id: "win_3", start: "3:00 PM", end: "5:00 PM", available: true, priority: false, fee: 0 },
    { id: "win_4", start: "5:00 PM", end: "7:00 PM", available: true, priority: false, fee: 0 },
    { id: "win_5", start: "7:00 PM", end: "9:00 PM", available: false, priority: false, fee: 0 }
  ]
}
```

**Seed:** Generate slots for 5 days (Today through +4 days), each with 5-8 time windows, some marked unavailable.

---

## Relationships

```
User 1──* Address
User 1──* Order
User 1──* ShoppingList
User 1──* CartItem

Store 1──* Department
Store 1──* Product
Store 1──* Deal

Department 1──* Subcategory
Department 1──* Product

Product *──1 Department
Product *──1 Store

CartItem *──1 Product
CartItem *──1 Store

Order *──1 Store
Order 1──* OrderItem (embedded)

ShoppingList 1──* ListItem (embedded)

Recipe 1──* RecipeIngredient (embedded, references Product optionally)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    user: { /* single User object */ },
    addresses: [ /* 2 Address objects */ ],
    stores: [ /* 8 Store objects */ ],
    departments: [ /* 14 Department objects per grocery store */ ],
    products: [ /* 80-100 Product objects */ ],
    cart: [ /* 4-6 CartItem objects pre-loaded */ ],
    orders: [ /* 5 past Order objects */ ],
    shoppingLists: [ /* 3 ShoppingList objects */ ],
    recipes: [ /* 6 Recipe objects */ ],
    deals: [ /* 8 Deal objects */ ],
    deliverySlots: [ /* 5 days of DeliverySlot objects */ ],

    // UI state
    selectedStoreId: "store_1",          // currently browsing Safeway
    selectedDepartmentId: null,          // null = show all/storefront
    searchQuery: "",
    cartOpen: false,                     // cart sidebar visibility
    activeModal: null,                   // "product_detail" | "checkout" | null
    activeModalData: null,               // productId, etc.
    deliveryAddressId: "addr_1",
    selectedDeliverySlot: null,
    shopperTip: 5.00,
    sortBy: "best_match",               // "best_match" | "price_low" | "price_high" | "name_az"
    filters: {
      onSale: false,
      organic: false,
      buyItAgain: false
    }
  };
}
```

---

## State Diff Tracking (for /go endpoint)

Key state changes to track:
- `cart` — items added/removed/quantity changed
- `orders` — new order placed
- `shoppingLists` — lists created/modified/deleted
- `deals` — coupons clipped/unclipped
- `selectedStoreId` — store navigation
- `searchQuery` — search performed
- `filters` — filter toggles
- `sortBy` — sort preference changed
- `deliveryAddressId` — address changed
- `selectedDeliverySlot` — delivery window selected
- `shopperTip` — tip amount changed
