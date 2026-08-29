# Xber Eats Mock — Research Summary

> Last updated: 2025-03-09
> Research by: plan agent

## App Overview

**Xber Eats** is Uber's online food ordering and delivery platform. It connects users with local restaurants and allows them to browse menus, customize items, place orders, and track delivery in real time. The web app (ubereats.com) mirrors the mobile experience with a desktop-optimized layout.

**Core value prop**: "Browse restaurants → Order food → Track delivery" — a three-step flow that takes users from hunger to food-at-the-door.

**Key differentiators from competitors (DoorDash, Grubhub)**:
- Tight Uber ride integration (same account, same payment methods)
- Uber One membership (cross-platform subscription for rides + eats)
- Grocery & convenience store delivery (not just restaurants)
- Group ordering feature
- Scheduled delivery (order ahead)
- Real-time GPS tracking of delivery person

---

## Key User Personas

### Primary: Hungry Customer (our mock user)
- Browses restaurants by category, cuisine, or search
- Views restaurant pages with menus
- Customizes items (size, toppings, special instructions)
- Adds items to cart, checks out
- Tracks order status in real-time
- Reviews past orders, reorders favorites
- Rates restaurants and delivery

### Secondary (out of scope for mock):
- Restaurant owner managing menu/orders
- Delivery driver accepting/completing deliveries

---

## Complete Feature List

### P0 — Critical (App cannot function without these)
1. **App shell & header** — Xber Eats logo, delivery address selector, search bar, cart icon with badge count, user avatar/account dropdown
2. **Homepage / Feed** — Restaurant cards in a responsive grid, organized by sections ("Featured", "Popular near you", "New on Xber Eats", cuisine categories)
3. **Category browsing** — Horizontal scrollable category chips with icons: Pizza, Burgers, Sushi, Chinese, Mexican, Indian, Thai, Italian, Healthy, Dessert, Coffee, Grocery, Alcohol, etc.
4. **Restaurant card** — Hero image, favorite heart icon (top-right), restaurant name, rating (number in circle), delivery fee, estimated delivery time, "Sponsored" label for promoted listings
5. **Restaurant/Store page** — Banner image, restaurant info (name, rating, reviews count, cuisine type, price range $$, delivery fee, delivery time), menu organized by categories with sticky category nav
6. **Menu item card** — Item name, description (truncated), price, optional image thumbnail
7. **Item detail modal** — Large food image, item name, description, base price, customization sections (required/optional groups like size, toppings, extras, special instructions textarea), quantity selector (+/-), "Add to Cart" button showing total price
8. **Cart** — Slide-out panel or page showing: restaurant name, list of cart items (name, customizations, quantity, price), subtotal, "Go to Checkout" button; ability to edit quantity or remove items
9. **Checkout page** — Delivery address, delivery time (ASAP / Schedule), order summary, price breakdown (Subtotal, Service Fee, Delivery Fee, Tax, Tip), payment method selector, "Place Order" button
10. **Routing** — Homepage, restaurant page, checkout, order tracking, orders history, search results

### P1 — Important (Core interactive workflows)
1. **Search** — Search bar with autocomplete suggestions (restaurant names, cuisines, dish names); search results page showing matching restaurants and items
2. **Filters** — Filter bar: Sort (Recommended, Rating, Delivery Time, Price), Price range ($, $$, $$$, $$$$), Dietary (Vegetarian, Vegan, Gluten-free), Delivery fee, Deals/Promotions
3. **Order tracking page** — Progress stepper: "Order Received" → "Preparing" → "Out for Delivery" → "Delivered"; estimated arrival time, delivery person info (name, photo), restaurant info, order items summary
4. **Past orders** — List of previous orders with restaurant name, date, items, total, order status; "Reorder" button; "View Receipt" link
5. **Favorites** — Heart icon on restaurant cards to save to favorites; favorites page showing saved restaurants
6. **Delivery/Pickup toggle** — Switch between delivery and pickup modes (affects displayed restaurants, fees, times)
7. **Address management** — Delivery address input with suggestions, saved addresses, ability to change delivery location
8. **Ratings & reviews** — After delivery: rate restaurant (1-5 stars), rate delivery, leave text review; view ratings on restaurant page
9. **Promotions/Deals** — Promo banner carousel on homepage, restaurant-level deals ("$5 off $25+", "Free delivery"), promo code input at checkout

### P2 — Nice to Have (Depth and polish)
1. **Uber One membership banner** — Promotional section showing membership benefits ($0 delivery fee, 5% off)
2. **Group ordering** — Share cart link, multiple people add items, single checkout
3. **Scheduled delivery** — Pick date/time for future delivery
4. **Item quantity badges** — If item already in cart, show quantity badge on the item card in menu
5. **Restaurant info modal** — Hours, address, phone, more detailed ratings breakdown
6. **Reorder flow** — One-click reorder from past orders, pre-fills cart
7. **Tip customization** — Tip selector with preset percentages (15%, 18%, 20%, 25%) or custom amount
8. **Delivery instructions** — Text field for special delivery notes ("Leave at door", "Ring bell", etc.)
9. **Multiple payment methods** — Card, Apple Pay, Uber Cash, PayPal display (visual only)
10. **Responsive design** — Mobile-friendly layout at smaller breakpoints

---

## UI Layout Description

### Desktop Web Layout (ubereats.com)

#### Header (fixed, ~64px height)
- **Left**: Xber Eats logo (black "Uber" + green "Eats")
- **Center-left**: Delivery/Pickup toggle pills
- **Center**: Delivery address with dropdown icon + estimated delivery time
- **Center-right**: Search bar (icon + "Search Xber Eats" placeholder)
- **Right**: Cart icon with item count badge, user avatar/account menu

#### Homepage Body
- **Category row**: Horizontally scrollable category pills with circular food icons + labels (Pizza, Sushi, Burgers, etc.)
- **Promo carousel**: Full-width promotional banners (deals, Uber One, seasonal offers)
- **Restaurant sections**: Each section has a heading ("Popular near you", "Featured on Xber Eats", "New on Xber Eats") with a horizontal scrollable row or grid of restaurant cards
- **Restaurant card**: ~280px wide card with:
  - Hero image (16:10 aspect ratio) with favorite heart icon overlay (top-right)
  - Restaurant name (bold, 16px)
  - Rating in gray circle (e.g., "4.6")
  - Delivery info: "$2.49 Delivery Fee • 20-30 min"
  - Optional "Sponsored" green text label

#### Restaurant Page
- **Banner**: Full-width restaurant hero image
- **Info bar**: Restaurant name (h1), rating + reviews count, cuisine tags, price range ($$), delivery fee, delivery time estimate
- **Sticky category nav**: Horizontal tabs for menu sections (e.g., "Featured Items", "Appetizers", "Entrees", "Drinks", "Desserts")
- **Menu grid**: 2-3 column grid of item cards per category section
  - Item card: Name (bold), description (gray, 2-line truncated), price, optional thumbnail image (right side, ~100px square)

#### Item Detail Modal
- **Top**: Large food image (full modal width)
- **Body**: Item name (h2), description, base price
- **Customization sections**: Each section has a heading ("Choose your size", "Add toppings"), required vs optional label, radio buttons or checkboxes with option names and +$price
- **Special instructions**: Textarea
- **Bottom sticky bar**: Quantity selector (- / count / +), "Add to Cart — $XX.XX" green button

#### Cart (Slide-out Panel)
- Restaurant name header
- Item list: each item shows name, customization summary, quantity controls, price
- Subtotal
- "Go to Checkout" button

#### Checkout Page
- Delivery address section
- Delivery time: "ASAP (20-30 min)" or "Schedule"
- Order summary: collapsible item list
- Price breakdown: Subtotal, Service Fee, Delivery Fee, Tax, Tip (with preset buttons)
- Payment method section
- "Place Order" large green button

#### Order Tracking
- Progress stepper with 4 stages: Order Received → Preparing → Out for Delivery → Delivered
- Estimated time display
- Delivery person card (name, photo, vehicle type)
- Map placeholder area
- Order items summary
- "Need help?" support link

---

## Color Palette & Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary (Uber Green) | `#06C167` | CTAs, "Eats" text, active states, badges |
| Primary Dark | `#048A46` | Hover states on green buttons |
| Black | `#000000` | Primary text, "Uber" wordmark |
| White | `#FFFFFF` | Backgrounds, button text on dark bg |
| Gray 100 | `#F6F6F6` | Page background, card backgrounds |
| Gray 200 | `#EEEEEE` | Borders, dividers |
| Gray 300 | `#CCCCCC` | Disabled states |
| Gray 500 | `#6B6B6B` | Secondary text, descriptions |
| Gray 700 | `#545454` | Tertiary text |
| Gray 900 | `#1A1A1A` | Dark backgrounds (header, footer) |
| Rating | `#E8E8E8` (bg) | Rating circle background |
| Error/Red | `#E54B4B` | Error states, remove icon |
| Star Yellow | `#FFD700` | Star ratings |

### Typography
- **Font family**: "UberMove", "UberMoveText", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **For mock**: Use `"Inter", "Segoe UI", system-ui, sans-serif` (visually similar, freely available)
- **Heading sizes**: h1: 32px/700, h2: 24px/700, h3: 18px/600, h4: 16px/600
- **Body**: 14px/400 (regular text), 14px/600 (emphasis)
- **Small**: 12px/400 (captions, labels)

### Spacing Scale
- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Card padding: 16px
- Grid gap: 16px
- Section margin: 32px

### Border Radius
- Cards: 12px
- Buttons: 8px (standard), 24px (pill buttons)
- Category chips: 20px (fully rounded)
- Avatar: 50% (circle)

---

## Navigation Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Restaurant feed, categories, promos |
| `/store/:storeId` | Restaurant page | Menu, info, reviews |
| `/search` | Search results | Filtered restaurant/item results |
| `/checkout` | Checkout | Order summary, payment, place order |
| `/orders` | Order history | Past orders with reorder |
| `/orders/:orderId` | Order tracking | Live tracking for active order; receipt for past |
| `/account` | Account settings | Profile, addresses, payment methods |
| `/favorites` | Saved restaurants | Favorited restaurant list |
| `/go` | State inspector | Debug: initial_state, current_state, state_diff |

---

## Screenshots Reference

| Screenshot | Location | Shows |
|------------|----------|-------|
| `screenshots/000005.jpg` | Homepage (mobile) | Restaurant list with cards showing delivery time, restaurant name, cuisine type |
| `screenshots/web_interface/000004.jpg` | Restaurant card | Card with hero image, heart favorite, name "The Slice Spot", "Sponsored", rating 4.6 |
| `screenshots/search/000002.jpg` | Filter UI | Sort/Price/Dietary filter tabs, Vegetarian/Vegan/Gluten-free options |
| `screenshots/orders/000004.jpg` | Receipt | Order receipt with line items, subtotal, tax, fees, tip, total; bottom nav bar |
| `screenshots/checkout/000003.jpg` | Order tracking | "Order received" status with estimated arrival time |
| `screenshots/search/000001.jpg` | Alexa tracking | Order status timeline: Preparing → Out for Delivery → Delivered |
| `screenshots/store_page/000005.jpg` | Store page (design) | Category chips with icons, food item grid with images, names, prices |
| `screenshots/item_modal/000005.jpg` | Checkout (mobile) | Checkout total, payment method selection |
| `screenshots/restaurant/000003.jpg` | Restaurant tablet login | Xber Eats branding, green accent color |

---

## Key Technical Notes

- **No authentication**: App starts pre-logged-in as "Alex Johnson" with preset address "123 Main St, San Francisco, CA"
- **No real API calls**: All data from `dataManager.js` with localStorage persistence
- **State tracking via `/go`**: All cart changes, order placements, favorites, and filter selections must be observable
- **Food images**: Use placeholder food images from Unsplash or generated colored rectangles with food emojis
