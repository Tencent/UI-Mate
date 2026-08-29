# Xnstacart Mock — Research Summary

> Last updated: 2025-03-09
> Author: plan agent

## App Overview

**Xnstacart** is the leading online grocery delivery and pickup platform in North America. Founded in 2012 by Apoorva Mehta, it connects customers with personal shoppers who pick and deliver groceries from local retail stores. The platform partners with nearly 1,500 national, regional, and local retail banners, operating across more than 80,000 stores in over 14,000 cities across the US and Canada.

**Core value proposition:** "Groceries delivered in as fast as 1 hour" — users browse products from their favorite local stores, add items to a cart, choose delivery or pickup, and a personal shopper fulfills the order.

**Business model:** Marketplace connecting customers, retail partners, and gig-economy shoppers. Revenue from delivery fees, service fees, Xnstacart+ memberships, and advertising (sponsored product placements).

---

## Key User Personas

### 1. Regular Grocery Shopper (Primary)
- Browses stores weekly, adds items to cart, schedules delivery
- Uses "Buy It Again" to quickly reorder staples
- Manages shopping lists for recurring needs
- Compares prices across stores

### 2. Meal Planner
- Browses recipes, adds recipe ingredients to cart
- Filters by dietary preferences (organic, gluten-free, vegan)
- Uses the "Deals" section for budget shopping

### 3. Bulk/Party Shopper
- Orders from warehouse stores (Costco, Sam's Club)
- Places large orders with scheduled delivery windows
- Uses multiple store carts simultaneously

---

## Complete Feature List

### P0 — Critical (App Cannot Function Without)
1. **Homepage / Store Selection** — Grid of available stores with logos, delivery time estimates, promotional banners
2. **Global Header** — Xnstacart logo, delivery address selector, search bar, cart icon with item count, user menu
3. **Store Storefront Page** — Department/category navigation, featured items, promotional banners per store
4. **Product Grid/Listing** — Product cards in a responsive grid showing image, name, price, unit size, "Add to Cart" button
5. **Product Detail Modal/Page** — Large product image, full name, price, unit info, quantity selector, nutrition facts, "Add to Cart"
6. **Shopping Cart (Sidebar/Flyout)** — List of items grouped by store, quantity adjusters (+/-), item subtotal, running total, "Go to Checkout" button
7. **Search** — Global product search across stores with autocomplete suggestions, search results page with filters
8. **Basic Routing** — Navigate between homepage, store page, product detail, cart, checkout, orders, account

### P1 — Core Interactive Features
9. **Department/Category Browsing** — Hierarchical departments (Produce, Dairy & Eggs, Meat & Seafood, etc.) with subcategories
10. **Product Filtering & Sorting** — Filter by: On Sale, Organic, Buy It Again; Sort by: Best Match, Price Low→High, Price High→Low, Name A-Z
11. **Delivery Scheduling** — Calendar with available time slots (Today/Tomorrow/Future dates), priority vs standard delivery options
12. **Checkout Flow** — Delivery address, delivery instructions, tip for shopper, payment summary, place order button
13. **Order History** — List of past orders with store name, date, item count, total, order status, item thumbnails; ability to reorder
14. **Buy It Again** — Section showing previously purchased items for quick re-add to cart
15. **Shopping Lists** — Create, rename, delete lists; add/remove items; share lists; add list items to cart
16. **Deals & Coupons** — Store-specific deals, coupon clipping, "BOGO" and percentage-off promotions
17. **Replacement Preferences** — Per-item: "Pick Specific Replacement", "Find Best Match", or "Don't Replace"
18. **Store Selector Dropdown** — Switch between stores, see delivery fees and minimum order for each
19. **Delivery Address Management** — View/add/edit delivery addresses, set default

### P2 — Depth & Realism
20. **Recipes** — Browse recipe cards, view ingredients, add all recipe ingredients to cart with one click
21. **Xnstacart+ Membership Banner** — Promotional banner showing membership benefits (free delivery, reduced service fees)
22. **Order Tracking** — Real-time order status (Placed → Shopping → Delivering → Delivered), shopper info, delivery map placeholder
23. **Product Reviews/Ratings** — Star ratings on product cards, review section on product detail
24. **Nutritional Information** — Detailed nutrition label, ingredients list, allergen warnings on product detail
25. **Favorites/Saved Items** — Heart icon to save favorite products, favorites list page
26. **Notification Preferences** — Settings for order updates, deals, delivery notifications
27. **Account Settings** — Profile info, payment methods, addresses, Xnstacart+ status, notification preferences
28. **Express/Priority Delivery** — "Priority" option for faster delivery (extra fee), shown in checkout
29. **Gift Cards** — Purchase/redeem Xnstacart gift cards section
30. **Loyalty Cards** — Link store loyalty cards (e.g., CVS ExtraCare, Kroger Plus)

---

## UI Layout Description (Desktop Web)

### Global Header (Fixed, ~64px height)
- **Left:** Xnstacart carrot logo + wordmark (green text)
- **Center-left:** Hamburger menu (≡) for navigation on smaller screens, "Stores" dropdown
- **Center:** Large search bar — placeholder "Search products...", search icon, spans ~50% of header width
- **Right:** Delivery address pill ("Deliver to 94105"), Cart icon with green badge showing item count, User avatar/menu dropdown

### Homepage (Logged-in State)
- **Hero Section:** Full-width promotional banner (seasonal, e.g., "Free delivery on your first order")
- **Store Grid:** Cards arranged 3-4 per row, each card shows:
  - Store logo (circular or rectangular)
  - Store name (bold)
  - "Delivery by [time]" or "In-store prices"
  - "Free delivery" badge if applicable
  - "$X.XX delivery fee" or "Free" with Xnstacart+
- **Category Quick Links:** Horizontal scrollable row of circular icons (Groceries, Alcohol, Electronics, Pharmacy, Pets, Beauty, etc.)
- **"Buy It Again" Section:** Horizontal scrollable row of previously purchased product cards
- **"Deals" Section:** Promotional product cards showing discounted prices

### Store Storefront Page
- **Store Header:** Store logo, store name, delivery fee, delivery time estimate, "Start Shopping" button
- **Department Navigation (Left Sidebar or Horizontal Tabs):**
  - Produce, Dairy & Eggs, Meat & Seafood, Bakery, Deli, Frozen, Pantry, Beverages, Snacks, Household, Health & Beauty, Baby, Pets, Alcohol
  - Each department has subcategories
- **Main Content Area:** Product grid (3-5 columns), section headers for featured/promoted items
- **"On Sale" Banner:** Highlighted deals within the store

### Product Card (in Grid)
- **Image:** Square product photo (~160x160px)
- **Price:** Bold, green — e.g., "$4.99"
- **Unit price:** Muted text — "($0.31/oz)"
- **Product name:** 2 lines max, truncated with ellipsis
- **Size/weight:** Muted — "16 oz"
- **"Add" Button:** Green pill button, transforms to quantity selector (- [qty] +) after first add
- **Sale badge:** Red/orange "SALE" or "$X off" overlay on image corner

### Product Detail (Modal or Page)
- **Left:** Large product image (with zoom on hover)
- **Right:**
  - Product name (large, bold)
  - Price + unit price
  - Size/weight selector (if applicable)
  - Quantity selector (- [1] +)
  - "Add to Cart" large green button
  - "Add to List" link
  - Replacement preference dropdown
  - "Details" section: Description, Ingredients, Nutrition Facts
  - "Customers also bought" row

### Shopping Cart (Right Sidebar Flyout, ~400px wide)
- **Header:** "Your Cart" title, store name
- **Item List:** Each item shows:
  - Small thumbnail (48x48)
  - Product name
  - Price
  - Quantity adjuster (- [qty] +)
  - Remove (X) button
  - Replacement preference link
- **Summary Section:**
  - Subtotal
  - Estimated tax
  - Service fee
  - Delivery fee (or "Free" with Xnstacart+)
  - Total
- **"Go to Checkout" green button**

### Checkout Page
- **Left Column (Main):**
  - Delivery address (with edit)
  - Delivery time window selector (grid of time slots)
  - Delivery instructions textarea
  - "Leave at my door" toggle
  - Shopper tip slider ($0-$10+ custom)
  - Payment method selector
- **Right Column (Summary):**
  - Order summary with item count
  - Subtotal, fees breakdown
  - Total
  - "Place Order" green button

### Account Menu (Dropdown or Sidebar)
- Your Orders
- Buy It Again
- Shopping Lists
- Xnstacart+ (membership)
- Credits & Promo Codes
- Gift Cards
- Shop with Friends
- Help
- Your Account Settings
- Addresses
- Payment Methods
- Notifications
- Loyalty Cards
- Log Out

---

## Color Palette & Design System

### Colors
- **Primary Green:** `#0AAD0A` (Xnstacart brand green — buttons, links, active states)
- **Dark Green:** `#003D29` (header background when logged in, dark mode elements)
- **White:** `#FFFFFF` (main background, card backgrounds)
- **Light Gray:** `#F6F7F8` (page background, section backgrounds)
- **Medium Gray:** `#72767E` (secondary text, muted text)
- **Dark Text:** `#343538` (primary text color)
- **Orange/Carrot:** `#FF7009` (Xnstacart carrot logo accent, sale badges)
- **Red:** `#DF1B41` (error states, out-of-stock, sale price)
- **Border Gray:** `#E8E9EB` (card borders, dividers)

### Typography
- **Font Family:** "Inter", -apple-system, BlinkMacSystemFont, sans-serif (or similar clean sans-serif)
- **Headings:** 600-700 weight
- **Body:** 400 weight
- **Size Scale:** 12px (caption), 14px (body small), 16px (body), 18px (subheading), 24px (heading), 32px (hero)

### Spacing
- **Base unit:** 4px
- **Card padding:** 16px
- **Grid gap:** 16px
- **Section gap:** 32px
- **Page max-width:** 1280px, centered

### Component Patterns
- **Buttons:** Rounded pill shape (border-radius: 24px), green fill for primary, white/outlined for secondary
- **Cards:** White background, subtle border (1px solid #E8E9EB), border-radius: 12px, hover shadow
- **Badges:** Small rounded rectangles for delivery info, store features
- **Modals:** Centered, white background, rounded corners, backdrop overlay
- **Quantity Selector:** Green bordered pill with minus/plus buttons flanking number

---

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Store** — Retail partners (Costco, Whole Foods, Safeway, etc.)
- **Department** — Product categories within stores
- **Product** — Individual grocery items with pricing, images, nutrition
- **CartItem** — Items in the user's shopping cart
- **Order** — Placed orders with items, status, delivery details
- **ShoppingList** — User-created reusable lists
- **Recipe** — Meal recipes with linked ingredients
- **User** — Pre-logged-in user profile
- **Address** — Delivery addresses
- **Deal/Coupon** — Store-specific promotional pricing

---

## What to Skip (Out of Scope)

- **Authentication/Login flows** — App starts pre-logged-in as "Sarah Johnson"
- **Real payment processing** — Checkout is simulated
- **Actual geolocation** — Hardcoded to a default address
- **Real-time shopper communication** — Chat is visual-only
- **Push notifications** — Settings page exists but no real notifications
- **Real store inventory/availability** — All mock products always available
- **File uploads** — No real receipt scanning
- **Email/SMS sending** — Order confirmation is UI-only

---

## Screenshots Reference

| Directory | Contents |
|-----------|----------|
| `screenshots/` | General Xnstacart homepage and branding images |
| `screenshots/store/` | Store browsing, account menu, order history UI |
| `screenshots/cart/` | Cart and checkout related images |
| `screenshots/product/` | Product detail and listing images |
| `screenshots/orders/` | Order tracking and history images |
| `screenshots/search/` | Search results and filter images |
| `screenshots/web_ui/` | Desktop web interface, storefront, branding |

Key reference screenshots:
- `store/000001.jpg` — Shows actual Xnstacart web UI with header (logo, "Stores" dropdown, search bar), account sidebar menu (Your Orders, Xnstacart+/Express, Credits & Promo Codes, Gift Cards, Shop with Friends, Help, Account Settings, Addresses, Payment Methods, Notifications, Loyalty Cards, Log Out), and order history with store names and item thumbnails
- `web_ui/000003.jpg` — Mobile interface showing hamburger menu, search bar, feature highlights (Fast delivery, It's all local, Direct chat), and Food Delivery/Pickup section
- `000004.jpg` — Mobile app showing store selector tabs (Whole Foods, Popular), "Dessert Recipes" banner, and produce product grid with images, names, and pricing
