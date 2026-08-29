# instacart_mock Schema

**Deploy order**: 23 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8023)
**Base URL**: `http://172.17.46.46:8023/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}` — updates only current state, preserves initial
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Homepage with stores, categories, on-sale items, popular items |
| `/store/:storeId` | StoreFront | Store product listing with department filtering, sort, and search |
| `/store/:storeId/department/:deptId` | StoreFront | Store filtered to a specific department |
| `/cart` | Cart | Full cart page with item quantities and order summary |
| `/checkout` | Checkout | Delivery address, time slot, tip, payment, and place order |
| `/orders` | Orders | Order history with ratings |
| `/orders/:orderId` | OrderDetail | Detailed view of a single order |
| `/buy-it-again` | BuyItAgain | Products from past orders, sorted by purchase frequency |
| `/search` | Search | Product search results page |
| `/lists` | Lists | Shopping lists CRUD with checkable items |
| `/deals` | Deals | Deals and coupons with clip functionality |
| `/recipes` | Recipes | Recipe browser with add-to-cart for ingredients |
| `/account` | Account | User profile, Xnstacart+ status, addresses |
| `/favorites` | Favorites | Saved/hearted products ("Saved Items"); accessible from user dropdown |
| `/go` | Go | State inspection endpoint (JSON) |

## State Schema

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `user` | object | see below | Active user profile |
| `addresses` | array | 2 items | User delivery addresses |
| `stores` | array | 8 items | Available stores |
| `departments` | array | 37 items | Store departments (categories), shared across all stores |
| `products` | array | ~133 items | Product catalog across all stores |
| `cart` | array | 5 items | Current shopping cart items |
| `orders` | array | 5 items | Order history |
| `shoppingLists` | array | 3 items | User-created shopping lists |
| `recipes` | array | 6 items | Available recipes with ingredients |
| `deals` | array | 8 items | Deals and coupons |
| `deliverySlots` | array | 5 days | Available delivery time slots |
| `favorites` | array | `[]` | Array of product ID strings the user has hearted/saved |
| `selectedStoreId` | string | `"store_1"` | Currently selected store ID |
| `selectedDepartmentId` | string\|null | `null` | Currently selected department filter |
| `searchQuery` | string | `""` | Current search query text |
| `cartOpen` | boolean | `false` | Whether the cart flyout panel is open |
| `activeModal` | string\|null | `null` | Currently open modal type (e.g., `"product"`) |
| `activeModalData` | object\|null | `null` | Data passed to the active modal |
| `deliveryAddressId` | string | `"addr_1"` | Selected delivery address ID |
| `selectedDeliverySlot` | object\|null | `null` | Selected delivery slot `{id, date, window}` |
| `shopperTip` | number | `5.00` | Shopper tip amount in dollars |
| `sortBy` | string | `"best_match"` | Product sort order |
| `filters` | object | see below | Active product filters |
| `appliedPromo` | string\|null | `null` | Currently applied promo code string; `null` when none |

### `user` Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"user_1"` | User ID |
| `firstName` | string | `"Sarah"` | First name |
| `lastName` | string | `"Johnson"` | Last name |
| `email` | string | `"sarah.johnson@email.com"` | Email address |
| `phone` | string | `"(415) 555-0142"` | Phone number |
| `avatar` | string\|null | `null` | Avatar URL |
| `defaultAddressId` | string | `"addr_1"` | Default delivery address ID |
| `instacartPlus` | boolean | `true` | Whether user has Xnstacart+ membership |
| `instacartPlusExpiry` | string | `"2026-01-15"` | Membership expiry date |
| `preferredStoreId` | string | `"store_1"` | Preferred store ID |
| `createdAt` | string | `"2023-06-15T10:00:00Z"` | Account creation timestamp |

### `addresses[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Address ID (e.g., `"addr_1"`) |
| `userId` | string | Owner user ID |
| `label` | string | Display label (e.g., `"Home"`, `"Work"`) |
| `street` | string | Street address |
| `apt` | string | Apartment/suite number |
| `city` | string | City |
| `state` | string | State abbreviation |
| `zip` | string | ZIP code |
| `isDefault` | boolean | Whether this is the default address |
| `deliveryInstructions` | string | Special delivery instructions |

### `stores[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Store ID (e.g., `"store_1"`) |
| `name` | string | Store name (e.g., `"Safeway"`) |
| `slug` | string | URL slug |
| `color` | string | Brand hex color |
| `emoji` | string | Store icon emoji |
| `description` | string | Store description |
| `deliveryFee` | number | Standard delivery fee |
| `deliveryFeeWithPlus` | number | Delivery fee for Xnstacart+ members (always 0) |
| `serviceFeePercent` | number | Service fee percentage (always 5) |
| `minOrder` | number | Minimum order amount |
| `deliveryTimeMin` | number | Minimum delivery time in minutes |
| `deliveryTimeMax` | number | Maximum delivery time in minutes |
| `rating` | number | Store rating |
| `isInStorePricing` | boolean | Whether store uses in-store pricing |
| `categories` | array | Store category tags |

### `departments[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Department ID (e.g., `"dept_produce"`) |
| `storeId` | string | Parent store ID |
| `name` | string | Department name |
| `slug` | string | URL slug |
| `icon` | string | Department emoji icon |
| `displayOrder` | number | Sort order |
| `subcategories` | array | Sub-categories: `{id, name, slug}` |

### `products[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Product ID (e.g., `"prod_1"`) |
| `storeId` | string | Store ID |
| `departmentId` | string | Department ID |
| `subcategoryId` | string\|null | Subcategory ID (null for non-Safeway stores) |
| `name` | string | Product name |
| `brand` | string | Brand name |
| `description` | string | Product description |
| `emoji` | string | Product display emoji |
| `price` | number | Current price |
| `originalPrice` | number\|null | Original price (if on sale) |
| `priceUnit` | string | Price unit (e.g., `"each"`, `"lb"`, `"oz"`) |
| `unitSize` | string | Package size description |
| `unitPrice` | number | Price per unit |
| `unitPriceLabel` | string | Unit price label (e.g., `"/lb"`) |
| `isOrganic` | boolean | Whether product is organic |
| `isOnSale` | boolean | Whether product is currently on sale |
| `saleEndDate` | string\|null | Sale end date |
| `inStock` | boolean | Whether product is in stock |
| `rating` | number | Product rating (seeded pseudo-random 4.0–5.0) |
| `reviewCount` | number | Number of reviews (seeded pseudo-random) |
| `nutrition` | object\|null | Nutrition facts: `{servingSize, calories, totalFat, sodium, totalCarbs, fiber, sugars, protein}` |
| `ingredients` | string\|null | Ingredients text |
| `allergens` | array | Allergen strings (e.g., `["wheat", "milk"]`) |
| `tags` | array | Product tags (e.g., `["organic", "fruit", "fresh"]`) |

### `cart[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Cart item ID (e.g., `"cart_1"` for defaults; `"cart_<timestamp>"` for new additions) |
| `productId` | string | Product ID reference |
| `storeId` | string | Store ID |
| `quantity` | number | Item quantity |
| `replacementPreference` | string | `"best_match"` or `"refund"` |
| `specificReplacementId` | string\|null | Specific replacement product ID |
| `note` | string | Item-level note for shopper |
| `addedAt` | string | ISO timestamp when added |

### `orders[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Order ID (e.g., `"order_1"`) |
| `userId` | string | User ID |
| `storeId` | string | Store ID |
| `storeName` | string | Store display name |
| `status` | string | `"placed"`, `"shopping"`, `"delivering"`, or `"delivered"` |
| `items` | array | Order items: `{productId, productName, quantity, price, wasReplaced, replacementProductName}` |
| `subtotal` | number | Items subtotal |
| `serviceFee` | number | Service fee |
| `deliveryFee` | number | Delivery fee |
| `tip` | number | Shopper tip |
| `tax` | number | Tax amount |
| `total` | number | Order total |
| `itemCount` | number | Total number of items |
| `deliveryAddress` | string | Formatted delivery address |
| `deliveryDate` | string | Delivery date (YYYY-MM-DD) |
| `deliveryWindow` | string | Delivery time window (e.g., `"2:00 PM - 3:00 PM"`) |
| `placedAt` | string | ISO timestamp when order was placed |
| `deliveredAt` | string\|null | ISO timestamp when delivered |
| `shopperName` | string\|null | Shopper name |
| `shopperRating` | number\|null | Rating given to shopper (1-5) |

### `shoppingLists[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | List ID (e.g., `"list_1"`) |
| `userId` | string | Owner user ID |
| `name` | string | List name |
| `items` | array | List items (see below) |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string | ISO timestamp |

#### `shoppingLists[].items[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | List item ID (e.g., `"li_1"`) |
| `productId` | string\|null | Linked product ID (null for freeform items) |
| `name` | string | Item display name |
| `checked` | boolean | Whether item is checked off |
| `quantity` | number | Item quantity |
| `addedAt` | string | ISO timestamp |

### `recipes[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Recipe ID (e.g., `"recipe_1"`) |
| `title` | string | Recipe title |
| `description` | string | Recipe description |
| `prepTime` | string | Prep time (e.g., `"15 min"`) |
| `cookTime` | string | Cook time |
| `totalTime` | string | Total time |
| `servings` | number | Number of servings |
| `difficulty` | string | `"Easy"` or `"Medium"` |
| `tags` | array | Recipe tags (e.g., `["dinner", "italian", "pasta"]`) |
| `ingredients` | array | Ingredients: `{name, quantity, productId}` (productId may be null) |
| `instructions` | array | Step-by-step instruction strings |
| `emoji` | string | Recipe emoji icon |

### `deals[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Deal ID (e.g., `"deal_1"`) |
| `storeId` | string\|null | Store ID (null for site-wide deals) |
| `type` | string | `"percent_off"`, `"dollar_off"`, `"bogo"`, or `"free_delivery"` |
| `title` | string | Deal title |
| `description` | string | Deal description |
| `discountValue` | number | Discount amount (percent or dollars) |
| `badge` | string | Display badge text (e.g., `"20% OFF"`, `"BOGO"`) |
| `minPurchase` | number | Minimum purchase amount (0 if none) |
| `applicableDepartmentId` | string\|null | Department restriction (null for all) |
| `startDate` | string | Start date (YYYY-MM-DD) |
| `endDate` | string | End date (YYYY-MM-DD) |
| `isClipped` | boolean | Whether user has clipped this deal |

### `deliverySlots[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Slot day ID (e.g., `"slot_0"`) |
| `date` | string | Date (YYYY-MM-DD) |
| `dayLabel` | string | Display label (`"Today"`, `"Tomorrow"`, or day name) |
| `windows` | array | Time windows (see below) |

#### `deliverySlots[].windows[]` Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Window ID (e.g., `"win_0_1"`) |
| `start` | string | Start time (e.g., `"9:00 AM"`) |
| `end` | string | End time (e.g., `"11:00 AM"`) |
| `available` | boolean | Whether this window is available |
| `priority` | boolean | Whether this is a priority window |
| `fee` | number | Extra fee for priority window |

### `selectedDeliverySlot` Object (when set)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Slot day ID |
| `date` | string | Date (YYYY-MM-DD) |
| `window` | object | Selected window object from `deliverySlots[].windows[]` |

### `favorites` Array

An array of product ID strings (`string[]`). Default value is `[]`. Each entry is a `productId` that the user has hearted. The `/favorites` page ("Saved Items") filters `products` by these IDs and renders them as a product grid. Favorites span all stores — a favorited product retains its `storeId`.

### `filters` Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `onSale` | boolean | `false` | Filter to on-sale products only |
| `organic` | boolean | `false` | Filter to organic products only |
| `buyItAgain` | boolean | `false` | Filter to previously purchased products |

### `appliedPromo` Field

| Value | Description |
|-------|-------------|
| `null` | No promo code applied (default) |
| any string | The promo code string that is currently applied |

Set via `APPLY_PROMO` action; cleared via `REMOVE_PROMO` action. Stored on the root state object.

### `sortBy` Values

| Value | Description |
|-------|-------------|
| `"best_match"` | Default sorting (default) |
| `"price_low"` | Price: Low to High |
| `"price_high"` | Price: High to Low |
| `"name"` | Name: A to Z |

## Reducer Actions

All actions are dispatched as `{ type: ACTION_TYPE, payload: ... }` through the AppContext reducer.

| Action | Payload | Effect |
|--------|---------|--------|
| `SET_STATE` | `object` (full state) | Replaces entire state with payload |
| `SET_STORE` | `string` (storeId) | Sets `selectedStoreId`; resets `selectedDepartmentId` to `null` |
| `SET_DEPARTMENT` | `string\|null` (deptId) | Sets `selectedDepartmentId` |
| `SET_SEARCH` | `string` (query) | Sets `searchQuery` |
| `SET_SORT` | `string` (sortBy value) | Sets `sortBy` |
| `SET_FILTER` | `object` (partial filters) | Merges into `filters` (e.g., `{onSale: true}`) |
| `SET_DELIVERY_ADDRESS` | `string` (addressId) | Sets `deliveryAddressId` |
| `SET_DELIVERY_SLOT` | `object\|null` | Sets `selectedDeliverySlot` |
| `SET_TIP` | `number` | Sets `shopperTip` |
| `TOGGLE_CART` | `boolean\|undefined` | If payload provided, sets `cartOpen` to that boolean; otherwise toggles |
| `OPEN_MODAL` | `{type: string, data?: object}` | Sets `activeModal` to `type` and `activeModalData` to `data` |
| `CLOSE_MODAL` | — | Sets `activeModal` to `null`, `activeModalData` to `null` |
| `ADD_TO_CART` | `{productId, storeId?, quantity?, replacementPreference?, note?}` | If `productId` already in cart, increments `quantity`; otherwise appends new cart item with `id: "cart_<timestamp>"` |
| `REMOVE_FROM_CART` | `string` (productId) | Removes cart item with matching `productId` |
| `UPDATE_CART_ITEM` | `{productId, ...fields}` | Merges `fields` into the matching cart item (excluding `productId`) |
| `CLEAR_CART` | — | Sets `cart` to `[]` |
| `UPDATE_REPLACEMENT` | `{productId, replacementPreference, specificReplacementId?}` | Updates `replacementPreference` and `specificReplacementId` on matching cart item |
| `UPDATE_CART_NOTE` | `{productId, note}` | Updates `note` on matching cart item |
| `PLACE_ORDER` | full order object | Prepends order to `orders`; clears `cart`; resets `selectedDeliverySlot` to `null`, `shopperTip` to `5.00`, `cartOpen` to `false` |
| `RATE_ORDER` | `{orderId, rating}` | Sets `shopperRating` on matching order |
| `UPDATE_ORDER_STATUS` | `{orderId, status}` | Sets `status` on matching order |
| `CREATE_LIST` | `string` (list name) | Appends new shopping list with `id: "list_<timestamp>"`, empty `items`, and current timestamps |
| `DELETE_LIST` | `string` (listId) | Removes shopping list with matching `id` |
| `ADD_TO_LIST` | `{listId, productId?, name, quantity?}` | Appends item to matching list's `items`; updates `updatedAt` |
| `REMOVE_FROM_LIST` | `{listId, itemId}` | Removes item from matching list's `items`; updates `updatedAt` |
| `TOGGLE_LIST_ITEM` | `{listId, itemId}` | Toggles `checked` on matching list item; updates `updatedAt` |
| `CLIP_DEAL` | `string` (dealId) | Toggles `isClipped` on matching deal |
| `ADD_ADDRESS` | `object` (address fields, without `id`/`userId`/`isDefault`) | Appends new address with `id: "addr_<timestamp>"`; `isDefault` is always `false` for new entries |
| `DELETE_ADDRESS` | `string` (addressId) | Removes address with matching `id` |
| `UPDATE_USER` | `object` (partial user fields) | Merges fields into `user` |
| `APPLY_PROMO` | `string` (promo code) | Sets `appliedPromo` to the code string |
| `REMOVE_PROMO` | — | Sets `appliedPromo` to `null` |
| `ADD_FAVORITE` | `string` (productId) | Appends `productId` to `favorites` if not already present (idempotent) |
| `REMOVE_FAVORITE` | `string` (productId) | Removes `productId` from `favorites` |

## Default IDs

### Store IDs
| ID | Name |
|----|------|
| `store_1` | Safeway |
| `store_2` | Costco |
| `store_3` | Whole Foods Market |
| `store_4` | Sprouts Farmers Market |
| `store_5` | CVS Pharmacy |
| `store_6` | Target |
| `store_7` | Petco |
| `store_8` | Total Wine & More |

### Department IDs (Safeway — store_1)
| ID | Name | Icon |
|----|------|------|
| `dept_produce` | Produce | `🥬` |
| `dept_dairy` | Dairy & Eggs | `🥛` |
| `dept_meat` | Meat & Seafood | `🥩` |
| `dept_bakery` | Bakery | `🍞` |
| `dept_deli` | Deli | `🧀` |
| `dept_frozen` | Frozen | `❄️` |
| `dept_pantry` | Pantry | `🥫` |
| `dept_snacks` | Snacks & Candy | `🍿` |
| `dept_beverages` | Beverages | `🥤` |
| `dept_breakfast` | Breakfast | `🥣` |
| `dept_household` | Household | `🧹` |
| `dept_health` | Health & Beauty | `💊` |
| `dept_baby` | Baby & Kids | `🍼` |
| `dept_pet` | Pet Care | `🐾` |

### Department IDs (Other Stores)
| ID | Store | Name |
|----|-------|------|
| `dept_s2_bulk` | Costco | Bulk Items |
| `dept_s2_pantry` | Costco | Pantry |
| `dept_s2_beverages` | Costco | Beverages |
| `dept_s2_household` | Costco | Household |
| `dept_s2_frozen` | Costco | Frozen |
| `dept_s3_produce` | Whole Foods | Organic Produce |
| `dept_s3_dairy` | Whole Foods | Dairy & Eggs |
| `dept_s3_meat` | Whole Foods | Meat & Seafood |
| `dept_s3_bakery` | Whole Foods | Bakery |
| `dept_s3_pantry` | Whole Foods | Pantry |
| `dept_s4_produce` | Sprouts | Fresh Produce |
| `dept_s4_bulk` | Sprouts | Bulk Foods |
| `dept_s4_vitamins` | Sprouts | Vitamins & Supplements |
| `dept_s4_dairy` | Sprouts | Dairy |
| `dept_s5_pharmacy` | CVS | Pharmacy |
| `dept_s5_health` | CVS | Health & Wellness |
| `dept_s5_beauty` | CVS | Beauty |
| `dept_s5_snacks` | CVS | Snacks & Drinks |
| `dept_s6_grocery` | Target | Grocery |
| `dept_s6_household` | Target | Household |
| `dept_s6_health` | Target | Health & Beauty |
| `dept_s6_snacks` | Target | Snacks |
| `dept_s7_dog` | Petco | Dog |
| `dept_s7_cat` | Petco | Cat |
| `dept_s7_treats` | Petco | Treats |
| `dept_s7_supplies` | Petco | Supplies |
| `dept_s8_wine` | Total Wine | Wine |
| `dept_s8_beer` | Total Wine | Beer |
| `dept_s8_spirits` | Total Wine | Spirits |
| `dept_s8_mixers` | Total Wine | Mixers & More |

### Product IDs (Safeway — sequential, store_1)
| Range | Department | Count | Notable Products |
|-------|-----------|-------|------------------|
| `prod_1` - `prod_12` | Produce | 12 | `prod_1`=Organic Bananas, `prod_3`=Avocados, `prod_4`=Baby Spinach |
| `prod_13` - `prod_22` | Dairy & Eggs | 10 | `prod_13`=2% Milk, `prod_14`=Large Eggs, `prod_15`=Greek Yogurt |
| `prod_23` - `prod_30` | Meat & Seafood | 8 | `prod_25`=Chicken Breast, `prod_27`=Atlantic Salmon Fillet |
| `prod_31` - `prod_36` | Bakery | 6 | `prod_31`=Sourdough Bread, `prod_33`=Everything Bagels |
| `prod_37` - `prod_44` | Frozen | 8 | `prod_37`=DiGiorno Frozen Pizza, `prod_38`=Vanilla Ice Cream |
| `prod_45` - `prod_54` | Pantry | 10 | `prod_45`=Spaghetti Pasta, `prod_46`=Marinara Sauce |
| `prod_55` - `prod_62` | Snacks | 8 | `prod_55`=Lay's Classic Chips, `prod_58`=Oreo Cookies |
| `prod_63` - `prod_70` | Beverages | 8 | `prod_63`=Spring Water 24-Pack, `prod_64`=Coca-Cola 12-Pack |
| `prod_71` - `prod_76` | Household | 6 | `prod_71`=Paper Towels, `prod_73`=Laundry Detergent |
| `prod_77` - `prod_80` | Health & Beauty | 4 | `prod_77`=Ibuprofen, `prod_80`=Toothpaste |

### Product IDs (Other Stores)
| Range | Store | Count |
|-------|-------|-------|
| `prod_81` - `prod_90` | Costco (store_2) | 10 |
| `prod_91` - `prod_100` | Whole Foods (store_3) | 10 |
| `prod_101` - `prod_108` | Sprouts (store_4) | 8 |
| `prod_109` - `prod_116` | CVS (store_5) | 8 |
| `prod_117` - `prod_126` | Target (store_6) | 10 |
| `prod_127` - `prod_134` | Petco (store_7) | 8 |
| `prod_135` - `prod_143` | Total Wine (store_8) | 9 |

**Note**: Product IDs are sequentially generated from `prod_1` upward as the `createProducts()` function iterates through store/department groupings. The `id` counter increments once per product push but the `seededRating`/`seededReviewCount` functions receive the post-increment value of `id`, so ratings are deterministic per product. The default cart hardcodes `productId` references to Safeway products. Order history references product IDs from multiple stores.

**Note on order data**: The default order items include a `productName` string that was written manually and may not match the actual generated product name for that ID (e.g., the cart item for `prod_37` lists it as "Sourdough Bread" in the order history, but `prod_37` is DiGiorno Frozen Pizza in the generated catalog). The UI resolves display names at runtime via `products.find(p => p.id === item.productId)`, so the rendered name always matches the product catalog, not the stored `productName` field.

### Default Address IDs
| ID | Label |
|----|-------|
| `addr_1` | Home (742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110) — default |
| `addr_2` | Work (200 Market Street, Suite 400, San Francisco, CA 94105) |

### Default Order IDs
| ID | Store | Status | Shopper | Rating |
|----|-------|--------|---------|--------|
| `order_1` | Safeway | delivered | Maria G. | unrated |
| `order_2` | Whole Foods Market | delivered | David L. | 5 |
| `order_3` | Costco | delivered | Sarah K. | 4 |
| `order_4` | Safeway | delivered | James R. | 5 |
| `order_5` | Target | delivered | Emily T. | unrated |

### Default Shopping List IDs
| ID | Name | Items |
|----|------|-------|
| `list_1` | Weekly Essentials | 8 items (2 checked) |
| `list_2` | Party Supplies | 12 items (0 checked) |
| `list_3` | Healthy Eating | 6 items (2 checked) |

### Default Recipe IDs
| ID | Title |
|----|-------|
| `recipe_1` | Classic Spaghetti Bolognese |
| `recipe_2` | Chicken Stir-Fry |
| `recipe_3` | Greek Salad |
| `recipe_4` | Breakfast Scramble |
| `recipe_5` | Grilled Salmon with Vegetables |
| `recipe_6` | Chocolate Chip Pancakes |

### Default Deal IDs
| ID | Type | Store |
|----|------|-------|
| `deal_1` | percent_off (20%) | Safeway — Organic Produce |
| `deal_2` | bogo | Safeway — Ice Cream (Frozen) |
| `deal_3` | dollar_off ($3) | Whole Foods — $35+ orders |
| `deal_4` | dollar_off ($5) | Site-wide — First order |
| `deal_5` | free_delivery | Site-wide — Weekend |
| `deal_6` | percent_off (15%) | Safeway — Breakfast |
| `deal_7` | bogo | Target — Chips & Snacks |
| `deal_8` | percent_off (10%) | Costco — Household |

### Default Cart (5 items from Safeway)
| Cart ID | Product | Quantity |
|---------|---------|----------|
| `cart_1` | `prod_1` (Organic Bananas) | 3 |
| `cart_2` | `prod_13` (2% Milk) | 1 |
| `cart_3` | `prod_25` (Chicken Breast) | 2 |
| `cart_4` | `prod_37` (DiGiorno Frozen Pizza) | 1 |
| `cart_5` | `prod_15` (Greek Yogurt) | 2 |

### Default Favorites
| Value | Description |
|-------|-------------|
| `[]` | Empty array — no products are favorited in the default state |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8023/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "id": "user_1",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "email": "sarah.johnson@email.com",
          "phone": "(415) 555-0142",
          "avatar": null,
          "defaultAddressId": "addr_1",
          "instacartPlus": true,
          "instacartPlusExpiry": "2026-01-15",
          "preferredStoreId": "store_1",
          "createdAt": "2023-06-15T10:00:00Z"
        },
        "addresses": [
          {"id": "addr_1", "userId": "user_1", "label": "Home", "street": "742 Evergreen Terrace", "apt": "Apt 3B", "city": "San Francisco", "state": "CA", "zip": "94110", "isDefault": true, "deliveryInstructions": "Leave at the front door"}
        ],
        "stores": [
          {"id": "store_1", "name": "Safeway", "slug": "safeway", "color": "#E8372C", "emoji": "\ud83d\uded2", "description": "Fresh groceries", "deliveryFee": 3.99, "deliveryFeeWithPlus": 0, "serviceFeePercent": 5, "minOrder": 10, "deliveryTimeMin": 45, "deliveryTimeMax": 60, "rating": 4.7, "isInStorePricing": true, "categories": ["Groceries"]}
        ],
        "departments": [
          {"id": "dept_produce", "storeId": "store_1", "name": "Produce", "slug": "produce", "icon": "\ud83e\udd2c", "displayOrder": 1, "subcategories": [{"id": "subcat_fruits", "name": "Fresh Fruits", "slug": "fresh-fruits"}]}
        ],
        "products": [
          {"id": "prod_1", "storeId": "store_1", "departmentId": "dept_produce", "subcategoryId": "subcat_fruits", "name": "Organic Bananas", "brand": "Organic", "description": "Ripe organic bananas", "emoji": "\ud83c\udf4c", "price": 0.79, "originalPrice": null, "priceUnit": "each", "unitSize": "1 ct", "unitPrice": 0.79, "unitPriceLabel": "/each", "isOrganic": true, "isOnSale": false, "saleEndDate": null, "inStock": true, "rating": 4.5, "reviewCount": 150, "nutrition": {"servingSize": "1 medium", "calories": 110, "totalFat": "0g", "sodium": "0mg", "totalCarbs": "28g", "fiber": "3g", "sugars": "15g", "protein": "1g"}, "ingredients": "Organic bananas", "allergens": [], "tags": ["organic", "fruit", "fresh"]}
        ],
        "cart": [],
        "orders": [],
        "shoppingLists": [],
        "recipes": [],
        "deals": [],
        "deliverySlots": [],
        "favorites": [],
        "selectedStoreId": "store_1",
        "selectedDepartmentId": null,
        "searchQuery": "",
        "cartOpen": false,
        "activeModal": null,
        "activeModalData": null,
        "deliveryAddressId": "addr_1",
        "selectedDeliverySlot": null,
        "shopperTip": 5.00,
        "sortBy": "best_match",
        "filters": {"onSale": false, "organic": false, "buyItAgain": false},
        "appliedPromo": null
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Select a store | `selectedStoreId` changes to the store ID; `selectedDepartmentId` resets to `null` |
| Browse department | `selectedDepartmentId` changes |
| Search for products | `searchQuery` updated |
| Change sort order | `sortBy` updated |
| Toggle on-sale filter | `filters.onSale` toggled |
| Toggle organic filter | `filters.organic` toggled |
| Toggle buy-it-again filter | `filters.buyItAgain` toggled |
| Add product to cart | `cart` array grows by 1 (new item with `id: "cart_<timestamp>"`) or existing item `quantity` incremented |
| Remove product from cart | `cart` array shrinks by 1 |
| Update cart item quantity | `cart[i].quantity` updated |
| Change replacement preference | `cart[i].replacementPreference` updated to `"best_match"` or `"refund"` |
| Update cart item note | `cart[i].note` updated |
| Clear cart | `cart` becomes `[]` |
| Open cart flyout | `cartOpen` becomes `true` |
| Close cart flyout | `cartOpen` becomes `false` |
| Open product modal | `activeModal` becomes `"product"`; `activeModalData` set to product object |
| Close product modal | `activeModal` becomes `null`; `activeModalData` becomes `null` |
| Select delivery address | `deliveryAddressId` changes |
| Select delivery time slot | `selectedDeliverySlot` set to `{id, date, window}` |
| Set shopper tip | `shopperTip` changes (0, 2, 5, 10, or 15) |
| Place order | `orders` array grows by 1 (prepended); `cart` becomes `[]`; `selectedDeliverySlot` becomes `null`; `shopperTip` resets to `5.00`; `cartOpen` becomes `false` |
| Rate order shopper | `orders[i].shopperRating` set to 1-5 |
| Update order status | `orders[i].status` set to `"placed"`, `"shopping"`, `"delivering"`, or `"delivered"` |
| Heart/save a product | `favorites` array grows by 1 (product ID appended); no change if already favorited |
| Unheart/remove a favorite | `favorites` array shrinks by 1 (product ID removed) |
| Add all favorites to cart | `cart` grows by N items (one per favorite product not already in cart) |
| Clear all favorites | `favorites` becomes `[]` |
| Create shopping list | `shoppingLists` array grows by 1 (new list with `id: "list_<timestamp>"`) |
| Delete shopping list | `shoppingLists` array shrinks by 1 |
| Add item to shopping list | `shoppingLists[i].items` array grows by 1; `updatedAt` updated |
| Remove item from shopping list | `shoppingLists[i].items` array shrinks by 1; `updatedAt` updated |
| Toggle shopping list item | `shoppingLists[i].items[j].checked` toggled; `updatedAt` updated |
| Clip deal | `deals[i].isClipped` becomes `true` |
| Unclip deal | `deals[i].isClipped` becomes `false` |
| Add address | `addresses` array grows by 1 (new address with `id: "addr_<timestamp>"`, `isDefault: false`) |
| Delete address | `addresses` array shrinks by 1 |
| Update user profile | `user` fields (firstName, lastName, email, phone) updated |
| Apply promo code | `appliedPromo` set to the promo code string |
| Remove promo code | `appliedPromo` becomes `null` |
| Add recipe ingredients to cart | `cart` grows (one entry per ingredient that has a `productId` and is not already in cart) |
