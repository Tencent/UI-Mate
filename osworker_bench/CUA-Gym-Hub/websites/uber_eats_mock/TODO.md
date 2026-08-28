# Xber Eats Mock — TODO

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

- [x] **Project scaffold**: `npm create vite@latest uber_eats_mock -- --template react`, install deps: `react-router-dom`. Do NOT install Tailwind — use plain CSS (consistent with other mocks in this repo). Create standard directory structure: `src/components/`, `src/pages/`, `src/context/`, `src/utils/`.

- [x] **Visual design system**: Create `src/styles/variables.css` with CSS custom properties extracted from Xber Eats branding. Study `assets/screenshots/` — the look is clean, minimal, lots of white space, black text, green (#06C167) accents. Exact tokens:
  - `--color-primary: #06C167` (Xber Eats green — CTAs, "Eats" wordmark, active states, badges)
  - `--color-primary-dark: #048A46` (hover on green buttons)
  - `--color-black: #000000` (primary text, headings, "Uber" wordmark)
  - `--color-white: #FFFFFF` (backgrounds, text on dark/green buttons)
  - `--color-gray-100: #F6F6F6` (page background)
  - `--color-gray-200: #EEEEEE` (borders, dividers, card hover)
  - `--color-gray-300: #CCCCCC` (disabled, placeholders)
  - `--color-gray-500: #6B6B6B` (secondary text — descriptions, delivery info)
  - `--color-gray-700: #545454` (tertiary text)
  - `--color-gray-900: #1A1A1A` (dark elements)
  - `--color-error: #E54B4B` (errors, remove actions)
  - `--color-star: #FFD700` (star ratings)
  - `--font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif`
  - `--radius-card: 12px`, `--radius-button: 8px`, `--radius-pill: 24px`, `--radius-circle: 50%`
  - Font sizes: `--fs-xs: 12px`, `--fs-sm: 14px`, `--fs-md: 16px`, `--fs-lg: 18px`, `--fs-xl: 24px`, `--fs-xxl: 32px`

- [x] **App layout (App.jsx)**: Full viewport, white background. Structure:
  - Fixed header (64px height, white bg, bottom border `#EEEEEE`, z-index 100, full width)
  - Main content area below header (scrollable, `padding-top: 64px`)
  - NO sidebar — Xber Eats desktop web uses a full-width layout with centered content (max-width: 1200px, margin: 0 auto, padding: 0 24px)
  - Cart slide-out panel (right side, 400px wide, overlay with semi-transparent backdrop) that opens/closes

- [x] **Header component** (`src/components/Header.jsx` + `Header.css`):
  - **Left section**: Xber Eats logo — "Uber" in black bold + " Eats" in green (#06C167) bold, font-size 22px. Clicking navigates to `/`.
  - **Delivery/Pickup toggle**: Two pill buttons side by side with a gray pill background. Active pill is black bg with white text, inactive is transparent with gray text. Labels: "Delivery" and "Pickup".
  - **Address display**: Show delivery address as clickable text with a small down-arrow icon: "123 Main St ▾" + "• Now ▾" for delivery time. Clicking opens address dropdown (P1).
  - **Search bar**: Rounded input (40px height, gray-100 bg, radius-pill, left search icon, placeholder "Search Xber Eats"). On focus, expands or navigates to `/search`. See P1 Search for full behavior.
  - **Right section**: Cart button — shopping bag/cart icon with green badge showing item count (hidden if 0). Clicking opens cart slide-out panel. User avatar (32px circle, initials "AJ" on gray bg) as account dropdown trigger.

- [x] **Routing** (`App.jsx` with `BrowserRouter`):
  - `/` → Homepage (restaurant feed)
  - `/store/:storeId` → Restaurant detail page
  - `/search` → Search results page (query in URL params `?q=`)
  - `/checkout` → Checkout page
  - `/orders` → Past orders page
  - `/orders/:orderId` → Order detail / tracking page
  - `/favorites` → Saved restaurants page
  - `/account` → Account/settings page
  - `/go` → State inspector (debug JSON view)

- [x] **State management** (`src/context/AppContext.jsx` + `src/utils/dataManager.js`):
  - `AppContext` provides global state and updater functions to all components
  - `dataManager.js` exports `createInitialData()` per `assets/data_model.md` — must include all 10 restaurants with full menu items (6-10 per restaurant), 15 browse categories, 5 past orders, user profile, empty cart
  - State persists to `localStorage` under key `"uber_eats_state"`
  - On mount: check localStorage first, fall back to `createInitialData()`
  - Track `initialState` separately (deep clone at first load) for state diffing
  - Provide these context actions: `addToCart`, `removeFromCart`, `updateCartItemQuantity`, `clearCart`, `placeOrder`, `toggleFavorite`, `setDeliveryMode`, `updateFilters`, `setSearchQuery`, `rateOrder`, `updateAddress`, `setTip`, `applyPromoCode`

- [x] **`/go` endpoint** (`src/pages/Go.jsx` + route):
  - Renders `<pre>` with JSON containing `{ initial_state, current_state, state_diff }`
  - `state_diff` computed by deep-comparing `initial_state` vs `current_state`, showing only changed paths
  - Must include all stateful data: cart contents, orders, favorites, filters, delivery mode, ratings, search queries
  - White background, monospace font, no header/footer

- [x] **Session isolation** (`vite.config.js` mock-api plugin):
  - Implement Vite dev server middleware:
    - `POST /post?sid=<sid>` — accepts `{ action: "set" | "set_current" | "reset", state: {...} }`
      - `set`: replaces both initial + current state
      - `set_current`: updates only current state, preserves initial
      - `reset`: resets current state back to initial
    - `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }` as JSON
    - `GET /state?sid=<sid>` — alias for `/go?sid=`
  - When `sid` param present, use session-specific localStorage key: `"uber_eats_state_<sid>"`
  - Without `sid`, use default key `"uber_eats_state"`

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. -->

- [x] **Homepage — Restaurant feed** (`src/pages/Homepage.jsx` + `Homepage.css`):
  - **Category carousel**: Horizontally scrollable row of category chips at the top. Each chip is a rounded pill (~80px wide) with an emoji icon on top (32px) and category name below (12px). 15 categories from data_model.md §Categories. Left/right scroll arrows appear on hover at edges. Clicking a category navigates to `/search?category=<name>`.
  - **Promo banner section**: A horizontally scrollable row of 2-3 promotional cards (full-width, ~180px height, rounded-12px, green/dark gradient backgrounds with white text). Show promotions from state.
  - **Restaurant sections**: Multiple sections, each with:
    - Section heading (bold, 24px, e.g., "Popular near you", "Featured on Xber Eats", "New this week", "Top Rated")
    - "See All" link on the right of heading
    - Responsive grid of RestaurantCard components (3-4 columns on desktop, 2 on tablet, 1 on mobile). Grid gap: 16px.
  - Sections to display: "Featured" (sponsored + popular), "Popular near you" (sorted by rating), "Quick Delivery" (sorted by delivery time), all remaining restaurants in a general grid
  - Scroll behavior: vertical scroll for full page, horizontal scroll within category bar and promo section

- [x] **Restaurant card** (`src/components/RestaurantCard.jsx` + `RestaurantCard.css`):
  - Card dimensions: ~100% width of grid column, 12px border-radius, no border, subtle shadow on hover (`0 2px 8px rgba(0,0,0,0.08)`)
  - **Image area**: 16:10 aspect ratio hero image (use placeholder gradient + food emoji if no image). `object-fit: cover`. On top-right corner: heart icon button (white bg circle, 32px, gray heart outline; filled green heart if favorited). On top-left: "Sponsored" green pill badge if `isSponsored`.
  - **Info area** (16px padding):
    - Row 1: Restaurant name (bold, 16px, black, truncate with ellipsis) + rating in a gray circle (12px, `#E8E8E8` bg, bold number like "4.6") aligned right
    - Row 2: Delivery info in gray-500 text (14px): "$X.XX Delivery Fee • XX-XX min"
    - Row 3 (optional): Cuisine tags in light gray text
  - **Hover**: Slight scale transform (1.01) + shadow increase
  - **Click**: Navigates to `/store/<restaurantId>`

- [x] **Restaurant detail page** (`src/pages/StorePage.jsx` + `StorePage.css`):
  - **Hero banner**: Full-width image (300px height on desktop), restaurant photo or gradient placeholder
  - **Info section** (below banner, padded):
    - Restaurant name (h1, 32px bold)
    - Row: Rating stars (filled) + rating number + "(" + reviewCount + " ratings)" in gray + "•" + cuisine types joined by ", " + "•" + price range ($$)
    - Row: Delivery/Pickup info: "Delivery Fee: $X.XX" + "•" + "XX-XX min" delivery time. If currently viewing Pickup mode, show "Pickup: XX-XX min" instead.
    - "More info" link that opens a modal with hours, address, phone
  - **Promotion banner** (if restaurant has active promotions): Colored banner showing deal text, e.g. "$5 off orders $25+"
  - **Sticky category nav**: Horizontal tab bar that sticks to top below header on scroll. Lists the restaurant's menu categories. Active category highlighted with black underline. Clicking a tab scrolls to that section. As user scrolls, active tab updates.
  - **Menu sections**: For each category, render a section with:
    - Category heading (h2, 24px bold)
    - Grid of MenuItemCard components (2 columns on desktop)
  - **MenuItemCard** (`src/components/MenuItemCard.jsx`): Horizontal card layout:
    - Left side (flex: 1): Item name (bold, 16px), description (gray-500, 14px, max 2 lines with ellipsis), price ("$XX.XX", 14px), "Popular" badge if `isPopular` (small yellow-green pill)
    - Right side (optional): 120x120px square thumbnail image with rounded corners
    - If item is already in cart, show small green quantity badge on the card
    - **Click**: Opens item detail modal

- [x] **Item detail modal** (`src/components/ItemDetailModal.jsx` + `ItemDetailModal.css`):
  - **Overlay**: Semi-transparent black backdrop, click outside closes
  - **Modal**: Centered, max-width 560px, max-height 90vh, white bg, 12px radius, overflow-y scroll
  - **Top**: Large food image (full modal width, 250px height, object-fit cover). Close "X" button (top-right, white circle with black X)
  - **Body** (24px padding):
    - Item name (h2, 24px bold)
    - Description (gray-500, 14px, full text)
    - Base price (16px, bold)
    - For each CustomizationGroup:
      - Section heading: group name (bold, 16px) + "Required"/"Optional" badge (small pill, gray bg)
      - If `maxSelections === 1`: radio buttons for each option
      - If `maxSelections > 1`: checkboxes for each option
      - Each option shows: option name + price modifier if > 0 ("+$X.XX" in gray)
    - **Special instructions**: Textarea (100px height, placeholder "Add special instructions", gray border, 8px radius)
  - **Bottom sticky bar** (white bg, top border, 16px padding):
    - Left: Quantity selector — circle "-" button + number (18px bold) + circle "+" button. Min 1, max 99. Buttons are 36px circles, gray-200 border, black text.
    - Right: "Add to Cart" button — green bg (#06C167), white text, bold, 48px height, radius-8px, full remaining width. Shows total: "Add to Cart — $XX.XX" (computed: (base + selected modifiers) * quantity).
  - If editing an existing cart item, button text changes to "Update Cart — $XX.XX" and pre-populates all selections.

- [x] **Cart slide-out panel** (`src/components/CartPanel.jsx` + `CartPanel.css`):
  - **Trigger**: Cart icon in header. Shows green badge with item count when cart has items.
  - **Panel**: Fixed right, 400px wide, full height, white bg, z-index 200, slides in from right with animation (transform translateX). Semi-transparent dark overlay behind.
  - **Empty state**: Cart icon, "Your cart is empty" text, "Start browsing" link to homepage
  - **With items**:
    - Header: "Your cart" (bold, 20px) + close "X" button
    - Restaurant name: "From [restaurant name]" with small restaurant icon
    - Item list: Each item shows:
      - Item name (bold, 14px)
      - Selected customizations as comma-separated gray text below name
      - Special instructions in italic gray if present
      - Quantity controls (same circle -/+/number pattern from item modal)
      - Item total price aligned right
      - Remove button (trash icon or "Remove" text in red on hover)
    - Divider line
    - Subtotal row: "Subtotal" left + "$XX.XX" right (bold)
    - "Go to Checkout" button: Full-width green button, bold white text, 48px height
  - **Switching restaurants**: If user tries to add item from different restaurant, show confirmation dialog: "Start a new order? Items from [current restaurant] will be removed from your cart." with "Cancel" and "Start New" buttons.

- [x] **Checkout page** (`src/pages/CheckoutPage.jsx` + `CheckoutPage.css`):
  - Max-width 680px centered layout, no header search bar (simplified header with back arrow + "Checkout" title)
  - **Delivery address section**: Show current address with edit icon. Clicking opens address selector.
  - **Delivery time section**: "Delivery time" label. Two options as toggleable pills: "ASAP (XX-XX min)" or "Schedule". Selecting "Schedule" shows date/time picker (simplified: just a dropdown of time slots for today/tomorrow).
  - **Order summary section**: Collapsible. Shows each item: qty × name, customizations, price. Each item row is clickable to edit (re-opens item modal).
  - **Delivery instructions**: Text input, placeholder "Add delivery instructions (e.g., Leave at door)"
  - **Tip section**: "Delivery person tip" label. Row of tip preset buttons (15%, 18%, 20%, 25%) as pills — active one has black bg with white text. Custom "Other" button opens a dollar input. Calculated tip amount shown. Default: 18%.
  - **Promo code section**: "Add promo code" expandable row. Text input + "Apply" button. Shows applied discount or error.
  - **Price breakdown** (clear divider above):
    - Subtotal: $XX.XX
    - Service Fee: $XX.XX (calculated as ~15% of subtotal, min $0.99, max $9.99)
    - Delivery Fee: $XX.XX (from restaurant data; show crossed-out original if promo)
    - Tax: $XX.XX (calculated as ~9% of subtotal — approximate SF tax rate)
    - Tip: $XX.XX
    - **Total**: $XX.XX (bold, larger font)
  - **Payment method**: Show selected payment method with card icon + last 4 digits. Dropdown to switch (visual only, from user's paymentMethods).
  - **Place Order button**: Full-width, green, bold, 56px height, "Place Order — $XX.XX". On click:
    - Creates new Order object from cart data + computed fees
    - Sets order status to "placed"
    - Sets `activeOrderId` in state
    - Clears cart
    - Navigates to `/orders/<newOrderId>` (tracking page)
    - Simulates status progression: after 3s → "confirmed", after 8s → "preparing", after 15s → "out_for_delivery", after 25s → "delivered" (use setInterval)

- [x] **Search functionality** (`src/pages/SearchPage.jsx` + `SearchPage.css`):
  - **Search input**: Same as header search bar but larger (48px height) and auto-focused. Debounced input (300ms).
  - **Recent searches**: Show 3-5 recent search terms as chips below input (stored in state)
  - **Search results**: Filter restaurants where name, cuisineType, or menu item names match the query (case-insensitive substring match). Display matching restaurants as RestaurantCards in a grid. Below restaurants, show "Dishes" section with matching individual menu items as cards (item image, item name, restaurant name, price).
  - **No results state**: "No results for '[query]'" + "Try searching for a restaurant, cuisine, or dish"
  - URL updates to `/search?q=<query>` as user types

- [x] **Filter system** (`src/components/FilterBar.jsx` + `FilterBar.css`):
  - Appears on homepage and search results page, below the category carousel
  - Horizontal row of filter buttons/pills:
    - **Sort**: Dropdown — "Recommended" (default), "Most Popular", "Rating", "Delivery Time", "Price: Low to High", "Price: High to Low"
    - **Price**: Multi-select pills — "$", "$$", "$$$", "$$$$"
    - **Dietary**: Multi-select pills — "Vegetarian", "Vegan", "Gluten-free"
    - **Delivery Fee**: Dropdown — "Any", "Under $3", "Under $5", "Free Delivery"
    - **Deals**: Toggle pill — "Deals & Offers"
  - Active filters show as filled/dark pills; count badge on mobile
  - "Clear all" link when any filter is active
  - Filters update state and re-render restaurant list in real-time

- [x] **Order tracking page** (`src/pages/OrderTrackingPage.jsx` + `OrderTrackingPage.css`):
  - Accessed via `/orders/:orderId` when order status is not "delivered" or "cancelled"
  - **Progress stepper** (prominent, top of page):
    - 4 steps in a horizontal bar with connecting line: "Order Received" → "Preparing" → "Out for Delivery" → "Delivered"
    - Completed steps: green circle with checkmark + green connecting line
    - Current step: green pulsing circle + bold text
    - Future steps: gray circle + gray line
    - Below stepper: "Estimated arrival: X:XX – X:XX PM" in bold
  - **Map placeholder**: A gray rectangle (300px height) with a pin icon and "Live tracking map" text (we don't implement real maps)
  - **Delivery person card** (shown when status >= out_for_delivery):
    - Driver avatar (48px circle), name, vehicle type icon, driver rating
    - "Contact" button (non-functional, visual only)
  - **Order details** (collapsible):
    - Restaurant name + address
    - Ordered items list (qty × name)
    - Price breakdown
  - **Help section**: "Need help with your order?" link
  - For past delivered orders: Show receipt view instead of tracking (same layout as checkout price breakdown + rating section)

- [x] **Past orders page** (`src/pages/OrdersPage.jsx` + `OrdersPage.css`):
  - Route: `/orders`
  - List of past orders, most recent first. Each order card shows:
    - Restaurant image (small, 60px circle) + Restaurant name (bold)
    - Order date (relative: "2 days ago", "1 week ago")
    - Number of items + total price
    - Order status badge ("Delivered" green, "Cancelled" red)
    - Item names as comma-separated gray text (truncated)
    - **"View Receipt"** link → navigates to `/orders/:orderId`
    - **"Reorder"** button (green outline) → adds all order items to cart, navigates to `/store/:restaurantId` or directly to `/checkout`
  - **Star rating**: For delivered orders without a rating, show clickable star rating (1-5 stars). Clicking sets the rating in state.
  - Empty state: "No orders yet" + "Browse restaurants" link

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [x] **Favorites page** (`src/pages/FavoritesPage.jsx`): Route: `/favorites`. Grid of RestaurantCards filtered to only favorited restaurants. Empty state: "You haven't saved any favorites yet" + heart icon + "Tap the heart icon on a restaurant to save it here".

- [x] **Account page** (`src/pages/AccountPage.jsx`): Route: `/account`. Display user info (name, email, phone) in editable fields. Saved addresses list with ability to set default. Payment methods list (display only). Uber One membership status banner. All sections are card-based with white bg, subtle shadow, 16px padding.

- [x] **Address selector dropdown**: Dropdown from header address display. Shows saved addresses as selectable options. "Add new address" option at bottom. Selecting an address updates `ui.selectedAddressId` in state and may change available restaurants/delivery times.

- [ ] **Uber One promotion banner**: On homepage, a persistent banner card (green gradient bg) promoting Uber One: "$0 Delivery Fee and 5% off eligible orders with Uber One" + "Try free for 1 month" button (visual only, toggles `uberOneActive` in state which zeroes out delivery fees).

- [ ] **Restaurant info modal**: Triggered by "More info" link on store page. Shows: full address, phone number, hours of operation, detailed rating breakdown (5-star histogram), and reviews list (first 5 reviews with reviewer name, rating, date, comment text).

- [ ] **Group order feature**: Button on restaurant page header "Start Group Order". Creates a shareable link (mock, just copies a URL to clipboard with a toast notification). Shows a "Group Order" badge on cart. Visual only — actual multi-user functionality is out of scope.

- [ ] **Scheduled delivery UX**: When selecting "Schedule" in checkout, show a dropdown/picker with time slots for today and tomorrow in 30-minute increments. Selected time appears in the delivery time display. Stored in `cart.scheduledTime`.

- [ ] **Item quantity badges on menu**: On the restaurant page, for items that are already in the cart, show a small green circle badge with the quantity number overlaid on the item card's top-right corner. Updates reactively as cart changes.

- [ ] **Responsive layout**: Media queries for tablet (<1024px: 2-column restaurant grid, narrower cart panel) and mobile (<768px: 1-column grid, full-screen cart overlay, simplified header with hamburger menu).

- [ ] **Smooth transitions and animations**: Page transitions (fade), cart panel slide-in, modal fade+scale, category chip scroll, skeleton loading states for cards (gray pulsing rectangles before data loads).

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See assets/data_model.md for field definitions. -->

- [ ] **User**: Pre-logged-in as "Alex Johnson", email "alex.johnson@email.com", 2 addresses (Home: "123 Main St, Apt 4B, San Francisco, CA 94102" and Work: "456 Market St, Suite 800, San Francisco, CA 94105"), 2 payment methods (Visa •••• 4242 default, PayPal), no Uber One membership, 2 favorited restaurants.

- [ ] **Categories**: 15 browse categories with emoji icons: Pizza 🍕, Burgers 🍔, Sushi 🍣, Chinese 🥡, Mexican 🌮, Indian 🍛, Thai 🍜, Italian 🍝, Healthy 🥗, Dessert 🍰, Coffee ☕, Breakfast 🥞, Sandwich 🥪, Korean 🍱, Mediterranean 🥙.

- [ ] **Restaurants**: 10 restaurants with diverse cuisines, ratings between 4.0-4.9, varying delivery fees ($0-$5), delivery times (15-45 min), 1-2 with "Sponsored" flag, 1 with free delivery promotion, mix of $ to $$$ price ranges. Each restaurant has 2-4 menu categories. See `data_model.md` §Seed Data for the full list.

- [ ] **Menu items**: 6-10 items per restaurant (70+ total). Each item has name, description (1-2 sentences), price ($5-$30 range), 1-3 customization groups. Customization examples: pizza sizes (Small/Medium/Large), burger patty (Single/Double), spice level (Mild/Medium/Hot/Extra Hot), add-ons (Extra Cheese +$1.50, Bacon +$2.00), drink size, sides. Mark 2-3 items per restaurant as `isPopular: true`. Include dietary tags where appropriate.

- [ ] **Past orders**: 5 orders as described in `data_model.md` §Seed Data: 4 delivered (various dates, some rated/some not), 1 cancelled. Include full price breakdowns with realistic fee calculations. One active order set as `activeOrderId` in status "preparing" for immediate tracking demo.

- [ ] **Promotions**: 3-5 promotions — "$5 off orders $25+" (site-wide), "Free delivery" (Mediterranean Grill), "20% off first order" (site-wide), "$3 off Sushi" (Tokyo Express), Uber One banner promo.

- [ ] **Reviews**: 2-3 reviews per restaurant (20-30 total), realistic names and comments, ratings 3-5 stars, dates within last 30 days.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / signup (app starts pre-logged-in as "Alex Johnson")
- Real payment processing
- Real map integration / GPS tracking (use placeholder rectangle)
- Real address geocoding / autocomplete (use static address list)
- Backend API calls (all data from localStorage + dataManager)
- Real-time WebSocket updates (simulate with setInterval)
- Image uploads
- Push notifications
- Accessibility audit (basic ARIA labels are fine but no deep a11y work)
- Email/SMS functionality
- Multi-language support
