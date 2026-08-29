# Xmazon Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: **Partially implemented** — scaffold, routing, basic pages exist. Focus on gaps and polish.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Current State Assessment

The amazon_mock already has a working scaffold with:
- ✅ Vite + React + Tailwind + react-router-dom
- ✅ Basic routing (/, /search, /product/:id, /cart, /checkout, /orders, /wishlist, /go)
- ✅ StoreContext with cart/wishlist/order/review actions
- ✅ Session isolation (vite.config.js mock-api plugin, dataManager.js with sid support)
- ✅ Data normalization for POST API
- ✅ Header with search autocomplete
- ✅ Product cards (grid + list view)
- ✅ Product detail page with zoom, buy box, reviews
- ✅ Cart with save-for-later
- ✅ Checkout 3-step flow
- ✅ Orders page
- ✅ Wishlist page

**Key gaps to address:**

---

## P0 — Core Shell Improvements
<!-- Critical fixes to make the app render correctly and match Xmazon's real design -->

- [x] **Visual design polish**: Study `assets/screenshots/` carefully. The current mock is functional but needs visual fidelity improvements. Key fixes: (a) Footer should have TWO sections — a slim "Back to top" bar (#37475A, centered text "Back to top", clickable scrolls to top) ABOVE a multi-column link footer (#232F3E) with 4 columns of links (Get to Know Us, Make Money with Us, Xmazon Payment Products, Let Us Help You) and a bottom bar with logo + copyright. (b) The page background is `#EAEDED` — ensure ALL content sections have white `bg-white` cards on this gray background. (c) Add a thin bottom border line under the sub-nav bar.

- [x] **Realistic product data**: Replace the `generateProducts()` random generator with **hand-crafted realistic products** (see `data_model.md` §Products for the 60 product specifications). Each product must have: a realistic brand-name title (e.g., "Samsung Galaxy Buds Pro - True Wireless Bluetooth Noise Cancelling Earbuds"), a price that makes sense for the product category, 5-7 `bulletPoints` (string array) for feature highlights, an `images` array with 3-4 picsum URLs (different seeds for gallery), `originalPrice` (set ~20-40% higher on ~30% of products to show deal pricing), `seller` field (either "Amazon.com" or the brand name), `badges` array (add "Best Seller" to top 2 per category, "Xmazon's Choice" to 1 per category), `inStock: true`, and `stockCount` (set to low numbers like 3-8 on ~15% of products to show "Only X left in stock" urgency text). Products should NOT use randomized titles — each should read like a real Xmazon listing.

- [x] **Seed orders, reviews, cart, wishlist**: Populate `createInitialData()` with realistic seed data per `data_model.md`: 3 pre-existing orders (Delivered/Shipped/Processing), 20 reviews spread across popular products with realistic headlines and body text, 2 items pre-loaded in cart, 3 items in wishlist, 5 items in recentlyViewed. This makes the app feel lived-in for agent training rather than an empty fresh account.

- [x] **Add `originalPrice`, `bulletPoints`, `images`, `seller`, `badges`, `inStock`, `stockCount` fields to product data model**: Update `mockData.js` product generation to include these new fields. Update `normalizeProduct()` to handle them. Update `INITIAL_DATA` structure.

---

## P1 — Primary Feature Improvements
<!-- Core interactive workflows that need to match Xmazon's real behavior -->

- [x] **Homepage hero carousel**: Replace the static hero banner image with a rotating carousel (auto-advances every 5s, left/right chevron arrows at edges, dot indicators at bottom). Show 4-5 slides with different promotional content (e.g., "Shop Holiday Deals", "New Electronics", "Books Best Sellers"). Each slide: full-width image (`https://picsum.photos/1500/600?random=N`), overlaid text headline in white, "Shop now" link. Implement with CSS transitions (translateX), not a library.

- [x] **Product detail page — bullet points section**: Display the product's `bulletPoints` array as a proper "About this item" section with bullet list (`<ul>` with disc markers, each bullet on its own line with 14px text, left-padded). Currently the code uses `description` as a single bullet — replace with the array. Show the `description` field separately below as a paragraph.

- [x] **Product detail page — image gallery with thumbnails**: Currently shows a single image with hover-to-zoom. Add a vertical strip of 3-4 thumbnail images on the LEFT side of the main image (each 44x44px, bordered, on hover the main image swaps to show that thumbnail's full-size image). The thumbnail strip is a common Xmazon pattern — see `assets/screenshots/product_detail_*.jpg`. Keep the hover-to-zoom on the main image.

- [x] **Product detail page — "Frequently Bought Together" section**: Below the main product info (after the 3-column section), add a "Frequently Bought Together" horizontal row showing: the current product + 2 related products from the same category, connected by "+" symbols, with a combined "Price for all three: $X.XX" total and an "Add all three to Cart" yellow button. Each item shows: small image (80x80), clickable title (truncated to 2 lines), individual price. Clicking the button adds all 3 products to cart.

- [x] **Product detail page — product specifications table**: Below the "About this item" bullets section, add a "Product Information" or "Technical Details" section displayed as a striped table (alternating `bg-gray-50` and `bg-white` rows). Each row shows spec key (bold, left column ~200px) and spec value (right column). Display all entries from `product.specs` object. Include the product's ASIN (use the product ID), dimensions, and weight.

- [x] **Product detail page — "Customers who viewed this also viewed" row**: Add a horizontal scrollable row of 6-8 product cards below "Frequently Bought Together". Each card: 150x150 image, truncated title (2 lines), star rating, price. Products selected from same category or random other popular products. Scroll with left/right arrow buttons at row edges.

- [x] **Product detail page — deal pricing display**: When a product has `originalPrice`, show: strikethrough original price in gray above the current price, a red "−XX% off" percentage badge next to the price, and a "Limited time deal" red badge. Format: `<span className="line-through text-gray-500 text-sm">$199.99</span>` then `<span className="text-red-600 text-sm font-bold">-25%</span>` then the large price.

- [x] **Product detail page — stock urgency**: When `stockCount` is set and ≤ 10, show orange text "Only {stockCount} left in stock - order soon" below the "In Stock" text in the buy box.

- [x] **Product detail page — verified purchase badge**: In review cards, when `review.verifiedPurchase` is true, show an orange "Verified Purchase" text badge next to the review date.

- [x] **Product detail page — helpful vote button**: Each review card should have a "Helpful" button at the bottom. Clicking it increments the `helpful` count and changes the button text to "You found this helpful" (disabled state). Show current count: "X people found this helpful". Store the voted state in the component (doesn't need to persist across refresh).

- [x] **Product detail page — rating histogram**: In the customer reviews left column, below the overall rating, add a rating breakdown bar chart showing 5 rows (5 star → 1 star). Each row: star label, horizontal progress bar (% fill with `bg-xmazon-yellow`), percentage text. Calculate distribution from the product's reviews array. If no reviews, show all bars at 0%.

- [x] **Search results — result count header**: Above the product grid, add a line like Xmazon's: `"1-16 of over 200 results for "headphones""` — showing the range of items on the current page and total filtered count. Gray text, 14px.

- [x] **Search results — "Results" breadcrumb**: Add a breadcrumb above the results count: "Xmazon.mock > [Category name]" when filtering by category, or "Xmazon.mock > Search results" when searching by keyword.

- [x] **Cart page — "Frequently bought together" or "Customers who bought items in your cart also bought"**: Below the "Saved for later" section, add a horizontal row of 4-6 recommended products (selected from categories of items currently in cart). Each shows: small product card with image, title (truncated), price, "Add to Cart" button.

- [x] **Cart page — coupon/promo code input**: In the checkout sidebar (right side), add a text input with "Enter promo code" placeholder and an "Apply" button. On apply, if the code is "SAVE10" show a green success message "Promo code applied: 10% off" and reduce the displayed subtotal by 10%. Any other code shows a red error "Invalid promo code". Store applied promo in state.

- [x] **Orders page — tabs and filters**: Add tab navigation above the orders list with tabs: "Orders" (active, bold underline), "Buy Again", "Not Yet Shipped", "Cancelled Orders". The "Orders" tab shows all orders. "Not Yet Shipped" filters to status "Processing" or "Shipped". "Cancelled Orders" filters to status "Cancelled". "Buy Again" shows unique products from all past orders as a product grid with "Add to Cart" buttons. Also add a "Search all orders" input + "Search Orders" button (#232F3E bg, white text) in the top-right.

- [x] **Orders page — time period filter**: Below the tabs, add text "N orders placed in" followed by a dropdown to filter by time period: "last 30 days", "past 3 months", "2025", "2024", "2023". Default to "past 3 months". Filter orders by their date matching the selected period.

- [x] **Orders page — order action buttons**: For each order item, add action buttons on the right side: "Buy it again" (yellow button, already exists), "View your item" (white bordered button → navigates to product detail), "Write a product review" (white bordered button → navigates to product detail and scrolls to review section via hash or opens review form). For the order card itself, add "View order details" and "Invoice" links in the order header.

- [x] **Header — "All" mega menu dropdown**: When clicking the "☰ All" button in the sub-nav, show a slide-in side panel (280px wide) from the left edge with categories list. Each category is a clickable row that navigates to `/search?category=CategoryName`. Panel has an overlay backdrop that closes on click. Header shows "Hello, [Name]" at top with dark bg (#232F3E), then "Digital Content & Devices", "Shop by Department", etc. as section headers with expandable category lists under each.

- [x] **Header — Account & Lists dropdown**: On hover over "Hello, [Name] / Account & Lists" in the header, show a dropdown popover with two columns: "Your Lists" (left) with "Create a List", "Find a List or Registry"; "Your Account" (right) with links: "Account", "Orders", "Recommendations", "Browsing History", "Watchlist", "Wish List". Links navigate to their respective routes. Dropdown closes on mouse leave.

- [x] **Wishlist page — sort/filter options**: Add a sort dropdown at the top-right of the wishlist: "Date added (newest)", "Date added (oldest)", "Price: Low to High", "Price: High to Low". The wishlist items should respect this sort order. Also add a "Move all to Cart" button.

---

## P2 — Secondary Features
<!-- Depth features for enhanced realism. Implement after P1 is solid. -->

- [ ] **Product detail page — Q&A section**: Below the reviews section, add "Customer Questions & Answers" with: a search input ("Have a question? Search for answers"), 3-5 hardcoded Q&A pairs per product (generated from product specs, e.g., "Q: Is this item waterproof? A: This product has an IPX4 water resistance rating."). Each Q&A shows: question in bold, answer below with "By [brand name]" attribution, upvote/downvote buttons.

- [ ] **Product detail page — share buttons**: In the top-right of the product info column, add share icons (link copy, Facebook, Twitter/X, Pinterest) as small icon buttons. Clicking "copy link" copies the current URL to clipboard and shows a brief "Link copied!" tooltip.

- [ ] **Product detail page — product comparison**: Add a "Compare with similar items" section showing a comparison table with the current product and 2-3 similar products (same category). Columns: product image + title + price + rating + Prime badge + key specs.

- [ ] **Homepage — "Inspired by your browsing history" row**: Below "Recently viewed", add a row showing products related to recently viewed items (same categories). Title: "Inspired by your browsing history". Show 6 products in a horizontal scroll row.

- [ ] **Homepage — "Keep shopping for" section**: Add category-specific rows based on the user's recently viewed items. For each category that has recently viewed products, show a row: "Keep shopping for [Category]" with 4-6 products from that category.

- [ ] **Search autocomplete — recent searches section**: When the search input is focused but empty, show a dropdown with "Recent Searches" (up to 5 recent search terms, each clickable to re-search) and "Trending" section with hardcoded trending terms.

- [ ] **Cart page — gift option checkbox**: For each cart item, add a "This is a gift" checkbox. When checked, show "Gift message (optional)" textarea below. Visual-only feature, stored in local component state.

- [ ] **Checkout page — editable address/payment forms**: When clicking "Change" on Step 1 (Shipping), show an editable address form (fullName, street, city, state, zip, phone inputs). When clicking "Change" on Step 2 (Payment), show a form to enter new card details (or select from saved). Changes should update the state and be used for the order.

- [ ] **Checkout page — delivery speed selection**: In Step 1 (after selecting address), add delivery speed radio options: "FREE Delivery (5-7 business days)" (default, selected), "Standard Shipping $5.99 (3-5 business days)", "One-Day Delivery $14.99 (next business day)". Selected shipping cost adds to order total.

- [ ] **Checkout page — order confirmation page**: After placing an order, instead of navigating directly to /orders, show a confirmation page at `/order-confirmation/:orderId` with: green checkmark icon, "Order placed, thank you!", order number, estimated delivery date, order summary, and "Continue shopping" button.

- [ ] **Breadcrumb navigation on all pages**: Add a breadcrumb bar below the header on: Product Detail ("Xmazon.mock > [Category] > [Product Title]"), Search Results ("Xmazon.mock > [Category or 'Search']"), Cart ("Xmazon.mock > Shopping Cart"), Orders ("Xmazon.mock > Your Account > Your Orders"), Wishlist ("Xmazon.mock > Your Lists > Shopping List").

- [ ] **"Back to top" smooth scroll**: The footer "Back to top" bar should smooth-scroll to the top of the page when clicked. Currently the footer is a simple copyright section — add the "Back to top" bar above it (full-width, #37475A bg, white centered text "Back to top", hover lightens).

- [ ] **Loading skeleton states**: When navigating between pages, show placeholder skeleton animations (gray pulsing rectangles) for 300-500ms before content renders. Apply to: product listing grid, product detail page, cart items, order cards. Use CSS `@keyframes pulse` with `bg-gray-200` / `bg-gray-300` alternation.

- [ ] **Empty state illustrations**: Improve empty states for Cart ("Your Xmazon Cart is empty" + illustration + "Shop today's deals" CTA), Orders ("Looking for an order?" + "View all orders" link), Wishlist ("Your list is empty" + "Add items" suggestion). Use SVG or emoji-based illustrations.

- [ ] **"Customers also bought" on cart page**: After the cart items and before the footer, show a "Customers who bought items in your cart also bought" section with a horizontal scroll of 6-8 product mini-cards.

---

## Data Seed (implement in createInitialData())
<!-- Dev must create realistic seed data matching these specs. See data_model.md for full details. -->

- [ ] **Products**: 60 hand-crafted products (10 per category: Electronics, Books, Home & Kitchen, Fashion, Toys & Games, Beauty). Each with realistic brand names, titles, prices, 5-7 bullet points, 3-4 gallery images, specs object, seller, badges. See `data_model.md §Realistic Seed Data` for exact product names and prices.

- [ ] **Reviews**: 20 seed reviews spread across 8-10 popular products. Mix of 5/4/3 star ratings. Realistic review headlines ("Great value for the price!", "Exactly what I needed", "Good but could be better") and 2-4 sentence body text. Include `verifiedPurchase: true` on 80%, `helpful` counts ranging 0-150.

- [ ] **Orders**: 3 seed orders with varied statuses (Delivered 2 weeks ago with 2 items totaling ~$180, Shipped 3 days ago with 1 item totaling ~$50, Processing from today with 3 items totaling ~$320). Include tracking numbers for shipped/delivered.

- [ ] **Cart**: Pre-load 2 items (e.g., Samsung Galaxy Buds qty 1, Keurig Coffee Maker qty 2).

- [ ] **Wishlist**: 3 product IDs from different categories.

- [ ] **Recently Viewed**: 5 product IDs.

- [ ] **Recent Searches**: `["wireless headphones", "coffee maker", "running shoes", "laptop stand", "kindle"]`

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / signup (app starts pre-logged-in as `Demo User` in Seattle, WA 98109)
- Real payment processing (mock Visa ending in 4242)
- Real product images (use picsum.photos with seed URLs)
- Email/SMS notifications
- Seller dashboard or marketplace management
- Xmazon Prime subscription management
- Real-time inventory or stock management
- File uploads or real image handling
- Xmazon Alexa integration
- Xmazon Fresh / Grocery specific features
- Xmazon Music / Video streaming features
