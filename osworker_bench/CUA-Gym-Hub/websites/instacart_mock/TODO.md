# Xnstacart Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest instacart_mock -- --template react`, install deps: `react-router-dom`, no CSS framework (use plain CSS for pixel-accurate control). Project directory already exists at `instacart_mock/`.

- [x] **Visual design system**: Study `assets/screenshots/` — the Xnstacart brand uses a clean, modern grocery aesthetic. Implement these exact values as CSS custom properties in `src/index.css`:
  - Primary green: `#0AAD0A` (CTA buttons, links, active states, "Add" buttons)
  - Dark green: `#003D29` (header background for logged-in state, footer)
  - White: `#FFFFFF` (card backgrounds, modals, main content bg)
  - Page background: `#F6F7F8` (light gray behind content)
  - Primary text: `#343538` (dark, near-black)
  - Secondary text: `#72767E` (muted gray for prices-per-unit, timestamps, descriptions)
  - Border: `#E8E9EB` (card borders, dividers, input borders)
  - Orange accent: `#FF7009` (Xnstacart carrot logo element, sale badges)
  - Red/Sale: `#DF1B41` (sale prices, error states, out-of-stock)
  - Font: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Border radius for cards: `12px`, for buttons/pills: `24px`, for inputs: `8px`
  - Base spacing unit: `4px` (all spacing in multiples: 8, 12, 16, 24, 32)
  - Max content width: `1280px`, centered with `margin: 0 auto`

- [x] **App layout**: Full-width header (fixed, 64px height, dark green `#003D29` background). Below header: main content area, full width, light gray background. No persistent sidebar — navigation is via header and in-page links. Cart is a right-side flyout panel (400px wide) triggered by cart icon click.
  ```
  ┌─────────────────────────────────────────────────┐
  │  [🥕 xnstacart]  [📍 Address ▾]  [🔍 Search...     ]  [🛒 3]  [👤]  │  ← Header 64px
  ├─────────────────────────────────────────────────┤
  │                                           │     │
  │         Main Content Area                 │Cart │  ← Cart flyout
  │         (routes render here)              │Panel│     (conditional)
  │         max-width: 1280px                 │400px│
  │         centered                          │     │
  │                                           │     │
  └─────────────────────────────────────────────────┘
  ```

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Define these routes:
  - `/` → Homepage (store grid, promotions, buy-it-again, deals)
  - `/store/:storeSlug` → Store storefront (departments, featured products)
  - `/store/:storeSlug/department/:deptSlug` → Department product listing
  - `/store/:storeSlug/search?q=` → Search results within store
  - `/product/:productId` → Product detail page (alternatively use modal overlay)
  - `/checkout` → Checkout page
  - `/orders` → Order history list
  - `/orders/:orderId` → Order detail
  - `/lists` → Shopping lists
  - `/lists/:listId` → Individual list detail
  - `/recipes` → Recipe browser
  - `/recipes/:recipeId` → Recipe detail
  - `/deals` → Deals & coupons page
  - `/buy-it-again` → Buy It Again page
  - `/account` → Account settings
  - `/account/addresses` → Address management
  - `/go` → State inspection endpoint (JSON)

- [x] **State management**: Create `src/context/AppContext.jsx` as the global provider wrapping the app. Create `src/utils/dataManager.js` with `createInitialData()` function that returns all seed data (see `data_model.md` for complete structure). Use `useReducer` inside AppContext for all state mutations. Persist to `localStorage` under key `instacart_mock_state`. Load from localStorage on init, fallback to `createInitialData()`.

- [x] **`/go` endpoint**: Create `src/pages/Go.jsx` mapped to route `/go`. On mount, compute and return JSON: `{ initial_state, current_state, state_diff }`. `initial_state` is the value from `createInitialData()`. `current_state` is the live state from AppContext. `state_diff` is a deep diff showing only changed fields. Render the JSON in a `<pre>` block with `JSON.stringify(data, null, 2)`.

- [x] **Session isolation**: In `vite.config.js`, add a plugin providing mock API middleware:
  - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`. `"set"` replaces both initial and current state. `"set_current"` updates only current state. `"reset"` restores current state to initial state.
  - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }` as JSON
  - `GET /state?sid=<sid>` — alias for `/go?sid=<sid>`
  - Session state stored in a `Map<sid, { initial, current }>` in the server plugin.
  - When the app loads with `?sid=X` query param, it fetches state from the server instead of localStorage.

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. Implement in order. -->

- [x] **Global header component** (`src/components/Header.jsx`): Fixed to top, 64px height, dark green (#003D29) background, flex layout.
  - Left: Xnstacart logo — render as styled text "🥕 xnstacart" using the carrot emoji + green wordmark on dark bg. The carrot is orange (#FF7009), text is white. Clicking navigates to `/`.
  - Center-left: Delivery address pill — white rounded pill showing "📍 Deliver to [street]", truncated. Click opens address selector dropdown.
  - Center: Search bar — white rounded input (border-radius: 24px), placeholder "Search products...", search icon (🔍) on the left inside the input, full-width flex-grow between address and cart. On enter/submit, navigates to `/store/:currentStore/search?q=query`.
  - Right: Cart icon — green cart icon "🛒" with a small green badge showing total item count (sum of all cart quantities). Click toggles cart flyout sidebar. If count is 0, no badge shown.
  - Far right: User menu — circular avatar showing initials "SJ" (Sarah Johnson) in green. Click opens dropdown with links: Your Orders, Buy It Again, Shopping Lists, Deals & Coupons, Recipes, ─── (divider), Account Settings, Addresses, ─── (divider), Xnstacart+ badge ("Xnstacart+ Member" in green).

- [x] **Homepage** (`src/pages/Home.jsx`): The landing page after login. White/light-gray background.
  - **Hero banner**: Full-width rounded card (border-radius: 12px) with green gradient background, text "Free delivery on orders $35+" and "with Xnstacart+" sub-text, decorative grocery illustration on right side. Height ~200px.
  - **Category quick-links row**: Horizontal scrollable row of circular category bubbles (64px diameter circle, light-green/teal background, emoji icon, label below). Categories: "Groceries" 🛒, "Alcohol" 🍷, "Electronics" 📱, "Pharmacy" 💊, "Pets" 🐾, "Beauty" 💄, "Household" 🏠, "Baby" 🍼. Clicking filters stores.
  - **"Your Stores" section**: Header text "Your Stores" with "See all" link. Grid of store cards (4 per row on desktop, responsive), each card is a white rounded rectangle (border-radius: 12px, border: 1px solid #E8E9EB, padding: 16px) containing: store logo area (centered, 80px placeholder with first letter + brand color), store name (bold, 16px), delivery info line ("Delivery by 2:00 PM" in muted text), delivery fee ("$3.99 delivery fee" or "Free delivery" in green if Xnstacart+), hover: subtle shadow elevation. Clicking navigates to `/store/:storeSlug`.
  - **"Buy It Again" section**: Header "Buy It Again" with "See all →" link. Horizontal scrollable row of product cards (compact variant, 160px wide): product image placeholder (colored square with emoji), product name (2 lines, truncated), price in bold green, green "Add" pill button. Products sourced from items in past orders.
  - **"Deals" section**: Header "Deals" with "See all →" link. Grid of deal cards showing: deal badge (e.g., "20% OFF"), deal title, store name, "Clip Coupon" button (green outline, toggles to "Clipped ✓" green filled on click).

- [x] **Store storefront page** (`src/pages/StoreFront.jsx`): Renders when navigating to `/store/:storeSlug`.
  - **Store header bar**: Full-width white bar below global header. Shows store logo (large, 48px), store name (24px bold), delivery time ("45-60 min"), delivery fee info, "In-store prices" badge if applicable. Thin bottom border.
  - **Department navigation**: Horizontal scrollable tab bar below store header. Each tab is a rounded pill: department emoji icon + name (e.g., "🥬 Produce"). Active tab has green background with white text. Inactive tabs are gray outline. Clicking a tab filters to that department. "All" tab is first (default active). Scrollable with left/right arrow buttons if tabs overflow.
  - **Product grid area**: Below department tabs. When "All" is selected, show multiple sections — one per department that has products. Each section has a header (department name, "See all →" link) and a horizontal scrollable row of 6-8 product cards. When a specific department is selected, show all products for that department in a responsive grid (4-5 columns).
  - **Product card** (reusable component `src/components/ProductCard.jsx`): White card (border-radius: 12px, border: 1px solid #E8E9EB, padding: 12px, width: ~180px in grid). Contains:
    - Product image area (square, 140x140, light gray background, centered emoji or first-letter placeholder)
    - Sale badge overlay (top-left corner, small red/orange rounded rect "SALE" or "20% OFF")
    - Price line: bold green `$X.XX`, if on sale show original price with strikethrough in gray next to the green sale price
    - Unit price: small muted text `($0.XX/oz)`
    - Product name: 14px, 2 lines max, `text-overflow: ellipsis`, `line-clamp: 2`
    - Unit size: muted 12px `"16 oz"` or `"1 ct"`
    - "Add" button: Green rounded pill (border-radius: 24px, bg: #0AAD0A, color: white, padding: 8px 24px). After clicking, transforms into a quantity selector: `[−] [qty] [+]` — minus button, number in center, plus button, all in a green-bordered pill. Minus at qty=1 removes the item from cart entirely.
    - Clicking the product image/name area opens product detail (navigates to `/product/:id` or opens a modal).

- [x] **Product detail page/modal** (`src/pages/ProductDetail.jsx` or `src/components/ProductDetailModal.jsx`): Can be either a full page or a modal overlay (modal preferred for UX — renders over current page with backdrop). Layout:
  - **Left column (50%)**: Large product image (300x300 placeholder with emoji/initial). Below image: "Customers also bought" horizontal row of 4 small product cards.
  - **Right column (50%)**:
    - Product name: 24px bold
    - Brand name: muted 14px
    - Price: large 20px bold green, with unit price muted below. If on sale, show original price struck through.
    - Size/weight: muted text
    - Quantity selector: `[−] [1] [+]` green pill (same as product card but larger)
    - "Add to Cart" button: Full-width green pill button, 48px height, bold white text. If item already in cart, show "Update Cart" instead.
    - "Add to List" link: small text link below button, click opens dropdown of user's shopping lists to add to
    - **Replacement preference**: Dropdown with 3 options — "Find Best Match" (default), "Pick Specific Replacement" (opens product search), "Don't Replace"
    - **Details section** (collapsible accordion):
      - "Description" — product description text
      - "Ingredients" — ingredients list
      - "Nutrition Facts" — styled nutrition label (serving size, calories, fat, sodium, carbs, fiber, sugar, protein in a bordered table matching FDA label format)
    - Close button (X) in top-right if modal

- [x] **Shopping cart flyout** (`src/components/Cart.jsx`): Right-side panel, 400px wide, slides in from right with animation (transform: translateX). White background, full viewport height below header.
  - **Header**: "Your Cart" title, store name below, close (X) button on right
  - **Empty state**: If cart is empty, show illustration/icon, "Your cart is empty" text, "Start Shopping" green button linking to homepage
  - **Item list** (scrollable): Each cart item row shows:
    - Small product image (48x48 placeholder)
    - Product name (14px, 2 lines max)
    - Unit size (muted 12px)
    - Price (bold, right-aligned)
    - Quantity selector: `[−] [qty] [+]` compact green pill
    - Remove button: small "✕" icon button (removes item entirely)
    - Note/replacement link: small text "Add note" → expands to textarea; "Replacement: Best Match ▾" → dropdown
  - **Summary section** (bottom, sticky):
    - Subtotal: right-aligned dollar amount
    - Estimated taxes: right-aligned
    - Service fee: right-aligned (with info tooltip "ℹ️")
    - Delivery fee: right-aligned ("Free" in green if Xnstacart+ member, otherwise "$X.XX")
    - Divider line
    - **Total**: bold, right-aligned
    - "Go to Checkout" button: full-width green pill, 48px height, bold white text. Navigates to `/checkout`.
    - Minimum order notice: if subtotal < store's minOrder, show yellow warning "Add $X.XX more to meet the $10.00 minimum"

- [x] **Search functionality** (`src/pages/SearchResults.jsx` + header search integration): When user types in the header search bar and hits Enter:
  - Navigate to `/store/:currentStoreSlug/search?q=query`
  - Filter products in the current store by name, brand, or tags matching the query (case-insensitive substring match)
  - Show results in a product grid (same layout as department view)
  - Show "X results for 'query'" header text
  - If no results: "No results found for 'query'. Try a different search." with illustration
  - **Autocomplete dropdown** (bonus): As user types, show top 5 matching product names in a dropdown below the search input. Clicking a suggestion navigates directly to that product.

- [x] **Department/category browsing** (`src/pages/Department.jsx`): When clicking a department tab on store page or navigating to `/store/:storeSlug/department/:deptSlug`:
  - Show department name as page title (24px bold)
  - Show subcategory tabs below department name (horizontal pills, similar to department tabs but smaller). Clicking filters products to that subcategory. "All" subcategory is default.
  - Product grid: responsive grid (4 columns on large screens, 3 on medium, 2 on small) of product cards
  - **Sidebar filters** (left side, 240px):
    - "On Sale" toggle checkbox
    - "Organic" toggle checkbox
    - "Buy It Again" toggle checkbox (only shows products user has ordered before)
  - **Sort dropdown** (top-right of grid): "Sort by: Best Match ▾" dropdown with options: Best Match, Price: Low to High, Price: High to Low, Name A-Z

---

## P1 — Secondary Interactive Features

- [x] **Checkout page** (`src/pages/Checkout.jsx`): Full page layout (no cart flyout on this page). Two-column layout:
  - **Left column (60%)**:
    - **Delivery address section**: Shows current address in a card, "Change" link opens address dropdown. Address shows full street, apt, city, state, zip.
    - **Delivery time section**: Grid of available time slots organized by date. Each date is a column header ("Today", "Tomorrow", "Monday 3/10", etc.). Time windows are rows ("2:00 PM - 3:00 PM"). Each slot is a clickable card that highlights green when selected. Unavailable slots are grayed out with strikethrough. Priority slots have a lightning bolt icon "⚡ Priority" and show +$2.00 fee.
    - **Delivery instructions**: Textarea (3 rows) with placeholder "Add delivery instructions...". Below: "Leave at my door" checkbox toggle.
    - **Shopper tip section**: Title "Shopper Tip". Row of preset amounts as rounded pill buttons: "$2", "$3", "$5" (default selected, green), "$7", "Custom". Clicking "Custom" shows a text input. Selected amount highlights in green fill. Text below: "100% of your tip goes to your shopper."
    - **Payment section**: Card showing "Visa •••• 4242" with card brand icon, "Change" link (non-functional, just visual)
  - **Right column (40%)**: Sticky summary card:
    - "Order Summary" title
    - Item count: "X items"
    - Collapsible item list (each item: name, qty × price)
    - Subtotal, Service fee, Delivery fee, Tip, Estimated tax
    - Divider
    - **Total** (bold, large)
    - "Place Order" button: Full-width green pill, 52px height, bold. On click: creates new order object in state with status "placed", clears cart, navigates to `/orders/:newOrderId` showing order confirmation.

- [x] **Order history page** (`src/pages/Orders.jsx`): List of past orders, most recent first.
  - Each order card (white, rounded, border) shows:
    - Store name + logo (left)
    - Order status badge: green "Delivered ✓", blue "Shopping 🛒", yellow "Delivering 🚗", gray "Placed ⏳"
    - Date placed: "Mar 7, 2025 at 1:15 PM"
    - Item count: "9 items"
    - Total: "$59.04"
    - Row of item thumbnail images (first 4-5 items, small 40x40 squares)
    - "View Order" button (outline green) → navigates to `/orders/:orderId`
    - "Reorder" button (filled green) → adds all items from that order back to cart, shows toast notification "X items added to cart"

- [ ] **Order detail page** (`src/pages/OrderDetail.jsx`): Shows full details of a single order:
  - Order status banner at top (colored based on status)
  - Store name and order date
  - Full item list with: product image, name, quantity, price, replacement info if applicable
  - Price breakdown: subtotal, service fee, delivery fee, tip, tax, total
  - Delivery address
  - Delivery window
  - Shopper name
  - "Rate your order" section (if status is "delivered" and not yet rated): 5-star rating selector, optional text feedback, "Submit" button
  - "Reorder" button at bottom

- [x] **Shopping lists page** (`src/pages/Lists.jsx` + `src/pages/ListDetail.jsx`):
  - **Lists overview** (`/lists`): Grid of list cards. Each card shows: list name (bold), item count, last updated date, first 3-4 item names as preview text. Click navigates to `/lists/:listId`. "Create New List" card with "+" icon at the beginning. Card has a "⋮" menu button with options: Rename, Delete.
  - **List detail** (`/lists/:listId`): List name as editable header (click to edit, shows input field). Below: "Add an item..." text input at top — user can type product name, autocomplete shows matching products, pressing enter adds custom text item if no match selected.
  - Item rows: checkbox (green when checked, strikethrough text when checked), item name, quantity badge, "✕" remove button. Checked items move to bottom "Completed" section.
  - "Add All to Cart" button (full-width green pill) — adds all unchecked items that have linked productIds to the cart.

- [ ] **Buy It Again page** (`src/pages/BuyItAgain.jsx`): Route `/buy-it-again`. Aggregates all unique products from past orders. Shows in a product grid with the standard product card component. Each card also shows "Last purchased [date]" muted text below the product name. Product cards have the same "Add" → quantity selector behavior as on store pages. Sort options: Recent (default), Name A-Z, Price Low-High.

- [x] **Deals page** (`src/pages/Deals.jsx`): Route `/deals`. Shows all available deals grouped by store.
  - Each deal card: deal type badge ("20% OFF", "BOGO", "$3 OFF"), deal title (bold), description text, store name with logo, expiry date, "Clip Coupon" / "Clipped ✓" toggle button (green outline → green fill on click). Clicking "Clip Coupon" sets `isClipped: true` in state.
  - Filter tabs at top: "All Deals", store-specific filters (one per store).

---

## P2 — Depth Features

<!-- Implement only after P1 is solid. These add realism and depth. -->

- [x] **Recipes page** (`src/pages/Recipes.jsx` + `src/pages/RecipeDetail.jsx`):
  - **Recipe list** (`/recipes`): Grid of recipe cards (3 per row). Each card: recipe image placeholder (colored gradient + emoji), title (bold 16px), prep time + cook time, difficulty badge, "View Recipe" link.
  - **Recipe detail** (`/recipes/:recipeId`): Hero section with recipe image, title (28px bold), description, time badges (prep/cook/total), servings, difficulty. Below: two columns — left "Ingredients" list (each ingredient shows name, quantity, and "Add" button if linked to a product), right "Instructions" numbered list. "Add All Ingredients to Cart" green button at top of ingredients — adds all ingredients with linked productIds to cart, shows toast "X items added to cart".

- [ ] **Product reviews & ratings**: On product detail, below the details accordion:
  - Star rating display: filled/empty stars (⭐), average rating number, review count
  - 3-5 seed reviews per product (username, date, star rating, review text)
  - "Write a Review" button opens inline form: star selector (1-5), textarea, "Submit" button. New review appears at top of list.

- [ ] **Favorites/saved items**: Heart icon (♡/♥) on each product card (top-right corner). Click toggles favorite status (outline → filled red). Dedicated `/favorites` route showing all favorited products in a grid. Add favorites array to state.

- [ ] **Order tracking simulation** (`src/pages/OrderTracking.jsx`): For the most recent order (or a seed order with status "delivering"):
  - Progress stepper: Placed → Shopping → On the Way → Delivered. Active step is green with animation.
  - Shopper info card: "Maria G. is shopping your order" with avatar placeholder
  - Estimated delivery time countdown
  - Map placeholder: gray box with "Map" text and a pin icon (no real map needed)
  - Item list showing what's been found/replaced

- [ ] **Xnstacart+ membership banner**: On homepage and throughout the app, show a promotional banner:
  - "Xnstacart+ Member" badge in account menu (green checkmark)
  - On checkout, show "Free delivery" where fee would be, with "Xnstacart+" badge
  - On store cards, show "Free delivery" in green text for Xnstacart+ stores
  - Non-functional "Manage Membership" link in account settings

- [x] **Account settings page** (`src/pages/Account.jsx`): Route `/account`. Card-based layout with sections:
  - **Profile**: Name, email, phone — each with "Edit" button that toggles to inline input + Save/Cancel
  - **Xnstacart+ Status**: Green badge "Active Member", renewal date, "Manage" link (non-functional)
  - **Notification Preferences**: Toggle switches for: Order updates, Deals & promotions, Weekly recommendations, Delivery notifications. Toggles update state.
  - **Payment Methods**: Card showing "Visa •••• 4242" with brand icon, "Add Payment Method" button (non-functional)

- [ ] **Address management page** (`src/pages/Addresses.jsx`): Route `/account/addresses`.
  - List of address cards, each showing: label ("Home"/"Work"), full address, "Default" badge on the default address, "Edit" and "Delete" buttons.
  - "Add New Address" button opens inline form: Label dropdown (Home/Work/Other), Street, Apt, City, State dropdown, Zip. "Save" button adds address to state.
  - "Edit" opens same form pre-filled. "Delete" shows confirmation dialog.

- [ ] **Toast notification system** (`src/components/Toast.jsx`): Global toast/snackbar for action confirmations. Appears bottom-center, auto-dismisses after 3 seconds. Green background for success, red for errors. Used for: "Added to cart", "Removed from cart", "X items added to cart", "Order placed!", "Coupon clipped", "List created", etc.

- [ ] **Responsive design**: Ensure the layout works at:
  - Desktop (>1024px): Full layout, 4-5 col product grids, side-by-side checkout columns
  - Tablet (768-1024px): 3 col grids, cart flyout narrows to 320px
  - Mobile (<768px): Single column, cart becomes full-screen overlay, hamburger menu in header, stacked checkout sections

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for field definitions. -->

- [x] **User**: 1 pre-logged-in user — "Sarah Johnson", email: sarah.johnson@email.com, Xnstacart+ member, default address in San Francisco, CA
- [x] **Addresses**: 2 — "Home" (742 Evergreen Terrace, SF) and "Work" (200 Market Street, SF)
- [x] **Stores**: 8 stores with realistic names, logos (use emoji + colored initial), delivery fees, delivery times. See data_model.md §Store for full list: Safeway, Costco, Whole Foods Market, Sprouts Farmers Market, CVS Pharmacy, Target, Petco, Total Wine & More
- [x] **Departments**: 14 standard departments per grocery store (Produce, Dairy & Eggs, Meat & Seafood, Bakery, Deli, Frozen, Pantry, Snacks & Candy, Beverages, Breakfast, Household, Health & Beauty, Baby & Kids, Pet Care) each with 3-4 subcategories. See data_model.md §Department for full list.
- [x] **Products**: 80-100 products distributed across departments. At minimum: 12 Produce, 10 Dairy, 8 Meat, 6 Bakery, 8 Frozen, 10 Pantry, 8 Snacks, 8 Beverages, 6 Household, 4 Health. ~15% on sale, ~30% organic. Use realistic US grocery prices. Each product needs: name, brand, description (1 sentence), price, unit size, unit price, nutrition facts (at least calories + macros), and 2-3 tags. For product images, use a colored placeholder square with a relevant emoji centered (e.g., 🍌 for bananas, 🥛 for milk). See data_model.md §Product for field definitions and example product list.
- [x] **Cart**: Pre-load 4-6 items from Safeway (store_1) in the cart to show a realistic starting state. Include: Organic Bananas (qty 3), 2% Milk (qty 1), Chicken Breast (qty 2), Sourdough Bread (qty 1), Greek Yogurt (qty 2).
- [x] **Orders**: 5 past orders, all "delivered" status, spanning the past month. Each with 6-14 items, realistic totals ($43-$125). See data_model.md §Order for structure.
- [x] **Shopping Lists**: 3 lists — "Weekly Essentials" (8 items, mix checked/unchecked), "Party Supplies" (12 items, all unchecked), "Healthy Eating" (6 items, some checked). See data_model.md §ShoppingList.
- [x] **Recipes**: 6 recipes with linked product IDs. See data_model.md §Recipe for list.
- [x] **Deals**: 8 deals across stores. See data_model.md §Deal for full list.
- [x] **Delivery Slots**: Generate for 5 days (today through +4), each day with 5-8 time windows, some unavailable. See data_model.md §DeliverySlot.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / signup (app starts pre-logged-in as `Sarah Johnson`)
- Real payment processing or Stripe/PayPal integration
- Real geolocation or map APIs (use hardcoded SF address)
- Real-time shopper communication / chat
- Push notifications or email/SMS sending
- Real store inventory management or availability checking
- File uploads (receipt scanning, etc.)
- Real product image assets (use emoji + colored placeholder squares)
- Server-side rendering or SEO optimization
- Accessibility (ARIA) beyond basic semantic HTML (not a priority for agent training)
- Dark mode (Xnstacart doesn't have one on web)
- Mobile app simulation (web only)
