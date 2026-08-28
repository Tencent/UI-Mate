# Amazon.com Mock — Research Summary

## App Overview

Amazon.com is the world's largest online e-commerce marketplace, originally started as an online bookstore and now selling virtually everything ("The Everything Store"). The desktop website serves over 2 billion monthly visitors and is characterized by its dense, information-rich UI that prioritizes product discovery, comparison, and frictionless purchasing.

**Category**: E-commerce / Online Marketplace
**Primary URL**: https://www.amazon.com

## Key User Personas & Workflows

### Persona 1: Casual Shopper (Primary)
- **Browse** homepage deals and recommendations
- **Search** for a specific product by keyword
- **Filter/sort** search results by price, rating, brand, Prime eligibility
- **View** product detail page (images, specs, reviews)
- **Add to cart** or **Buy Now**
- **Checkout** with saved address and payment
- **Track** past orders

### Persona 2: Deal Hunter
- Browse "Today's Deals" section
- Compare prices across similar products
- Use price filters aggressively
- Add items to wishlist for later
- Check order history for re-purchases ("Buy it again")

### Persona 3: Reviewer / Community Member
- Read customer reviews before buying
- Write product reviews after purchase
- Mark reviews as helpful
- Ask/answer product questions in Q&A

## Complete Feature List

### P0 — Core Shell (Must have for app to render)
1. **Header bar** — Dark navy (#232F3E) top bar with: Xmazon logo, delivery location, search bar with category dropdown, Account & Lists, Returns & Orders, Cart with badge count
2. **Sub-navigation bar** — Darker navy (#37475A) bar with: "All" hamburger menu, Today's Deals, Customer Service, Registry, Gift Cards, Sell
3. **Footer** — "Back to top" button, link columns, copyright
4. **Routing** — Home `/`, Search `/search`, Product Detail `/product/:id`, Cart `/cart`, Checkout `/checkout`, Orders `/orders`, Wishlist `/wishlist`, State Inspector `/go`
5. **State management** — React Context with dataManager.js, localStorage persistence, session isolation
6. **Mock data** — 60 products across 6 categories, 1 default user, seed reviews and orders

### P1 — Primary Features (Core shopping workflows)
7. **Homepage** — Hero banner carousel, category cards grid (4 cards overlapping hero), "Recommended for you" product row, "Today's Deals" row, "Recently viewed" row
8. **Search** — Real-time autocomplete dropdown showing product and category matches, recent search terms, category-scoped search
9. **Search Results / Product Listing** — Left sidebar filters (Department, Rating, Brand checkboxes, Price range slider, Prime toggle), sort dropdown (Featured, Price Low-High, Price High-Low, Rating), grid/list view toggle, pagination
10. **Product Detail Page** — Three-column layout: image gallery with hover-to-zoom (left), product info with title/rating/price/bullet points (center), buy box with price/delivery/stock/quantity/Add to Cart/Buy Now (right)
11. **Product Reviews** — Star rating distribution, individual review cards (avatar, username, star rating, headline, date, body text, helpful count), write-a-review form
12. **Shopping Cart** — Item list with product image/title/price, quantity selector, Delete/Save for later links, subtotal calculation, "Saved for later" section, checkout sidebar with subtotal and "Proceed to checkout" button
13. **Checkout** — 3-step flow: Shipping Address → Payment Method → Review Order; order summary sidebar with items/shipping/tax/total; "Place your order" button
14. **Order History** — Order cards with header (date, total, ship-to, order #), status badge, item list with "Buy it again" button
15. **Wishlist** — Grid of saved products with remove button, rating, price, "Add to Cart" button

### P2 — Secondary Features (Depth & realism)
16. **"Frequently Bought Together"** section on product detail page — shows 2-3 related products with combined price and "Add all to Cart" button
17. **Product Q&A section** — Questions and answers below reviews with search
18. **Product specifications table** — Tabular display of specs (Brand, Model, Weight, Dimensions, Color)
19. **Breadcrumb navigation** — Category > Subcategory > Product on detail pages
20. **Deals badge** — "Deal" or "Limited time deal" badge on discounted products
21. **"Customers who viewed this also viewed"** horizontal scroll row
22. **Order search/filter** — Search orders, filter by time period dropdown
23. **Tab navigation on product page** — Details / Reviews / Questions / Suggestions tabs
24. **Coupon/promo code** input on cart page
25. **Delivery date estimation** — "FREE delivery Tomorrow" or specific date display

## UI Layout Description

### Header (60px height)
- **Background**: #232F3E (dark navy)
- **Left**: Xmazon logo in white with ".mock" in orange (#FF9900)
- **Left-center**: "Deliver to [Name]" with MapPin icon, city + zip in bold
- **Center**: Search bar — category dropdown (gray bg #F3F3F3), text input, orange search button (#FEBD69 bg)
- **Right**: "Hello, [Name] / Account & Lists", "Returns / & Orders", Cart icon with orange (#FF9900) count badge

### Sub-nav bar (36px height)
- **Background**: #37475A (lighter navy)
- **Content**: "☰ All" button (bold), then text links: Today's Deals, Customer Service, Registry, Gift Cards, Sell

### Homepage
- **Background**: #EAEDED (light gray)
- **Hero**: Full-width image banner (~400px height) with gradient fade at bottom
- **Category cards**: 4-column grid, white bg, overlapping hero by ~250px, each card has: bold title, category image (280px tall), "See more" link
- **Product rows**: White bg sections, bold h2 title, 4-column product grid

### Search Results Page
- **Layout**: 260px left sidebar + flexible main content
- **Sidebar**: Department list, Star rating filter (clickable star rows), Brand checkboxes, Price range slider, Prime checkbox toggle
- **Main**: Sort dropdown + grid/list toggle in top bar, then product grid (4 columns) or list view, pagination at bottom

### Product Detail Page
- **Layout**: 3 columns — Image (~33%), Info (~40%), Buy Box (~260px)
- **Image**: Sticky, with hover-to-zoom (cursor crosshair, 1.5x scale on hover following mouse position)
- **Info**: Product title (24px medium), rating stars + review count, price with dollar sign superscript, Prime badge, "About this item" bullet list
- **Buy Box**: Bordered rounded card with: red price, "FREE delivery" in teal, delivery location, "In Stock" green text, quantity dropdown, yellow "Add to Cart" rounded button, orange "Buy Now" rounded button, Ships from/Sold by info, "Add to List" link

### Cart Page
- **Layout**: Flexible main area + 320px right sidebar
- **Main**: "Shopping Cart" h1, item rows with 128px product image, title link, "In Stock", Prime badge, quantity dropdown, Delete | Save for later links, right-aligned price
- **Sidebar**: Sticky card with subtotal + "Proceed to checkout" button

### Checkout Page
- **Layout**: Flexible main + 288px order summary sidebar
- **Steps**: Numbered accordion (1. Shipping Address, 2. Payment Method, 3. Review items), active step has orange border
- **Sidebar**: "Place your order" button, then Items/Shipping/Tax/Order Total breakdown

### Orders Page
- **Layout**: Centered max-width 1000px
- **Order cards**: Gray header bar (#F0F2F2) with ORDER PLACED date, Total, Ship To, Order # columns; white body with status heading, item rows with image + title + sold by + "Buy it again" button

## Color Palette (from tailwind.config.js + research)
| Token | Hex | Usage |
|-------|-----|-------|
| xmazon (DEFAULT) | #232F3E | Top header background |
| xmazon-light | #37475A | Sub-nav, footer background |
| xmazon-blue | #007185 | Links, teal text |
| xmazon-orange | #FF9900 | Accent, star ratings, active states |
| xmazon-yellow | #FEBD69 | Primary button bg (Add to Cart) |
| xmazon-darkYellow | #F08804 | Button hover, Buy Now bg |
| xmazon-bg | #EAEDED | Page background |
| Text primary | #0F1111 | Body text |
| Green stock | #007600 | "In Stock" text |
| Red price | #B12704 | Price text |
| Prime blue | #00A8E1 | Prime badge |

## Typography
- **Font family**: "Xmazon Ember", Arial, sans-serif
- **Body text**: #0F1111, 14px base
- **Product titles**: 16-24px, font-weight 500
- **Prices**: Large digits (28-32px), superscript dollar sign and cents (12px)
- **Section headings**: 20px, font-weight 700

## Data Model Overview
See `data_model.md` for full entity definitions. Key entities:
- **Product** (60 records): id, title, price, rating, reviewCount, image, description, specs, category, brand, prime
- **User** (1 record): id, name, email, address, paymentMethod
- **Cart** (array of {productId, quantity})
- **Wishlist** (array of productIds)
- **Order**: id, date, status, total, items, shippingAddress, paymentMethod
- **Review**: id, productId, userId, userName, rating, title, content, date, helpful

## What to Skip (Out of Scope)
- **Authentication**: App starts pre-logged-in as "Demo User" in Seattle, WA
- **Real payment processing**: Mock payment method (Visa ending 4242)
- **Real product images**: Use picsum.photos placeholders
- **Email notifications**: No order confirmation emails
- **Real-time inventory**: All items always "In Stock"
- **Seller accounts / marketplace management**: Consumer side only
- **Xmazon Prime subscription management**: Just show Prime badge

## Screenshots Reference
- `homepage_*.jpg` — Xmazon homepage with hero banner, category cards, product rows
- `product_detail_*.jpg` — Product detail page showing 3-column layout, buy box, bullet points, reviews
- `cart_*.jpg` — Shopping cart with item list, quantity controls, order summary sidebar
- `search_*.jpg` — Search results with filters sidebar
- `orders_*.jpg` — Your Orders page with order cards, tabs, time filter
- `checkout_*.jpg` — Checkout flow reference

## Key Sources
- [Xmazon (company) - Wikipedia](https://en.wikipedia.org/wiki/Amazon_(company))
- [Xmazon UI Design | Figma](https://www.figma.com/community/file/1018779693941475219/amazon-ui-design)
- [Xmazon User Interface Design - Richestsoft](https://richestsoft.com/blog/amazon-user-interface-design/)
- [Xmazon's A-to-Z of E-commerce UI/UX Design | UXPin](https://www.uxpin.com/studio/blog/amazons-z-e-commerce-uiux-design/)
- [Xmazon Colors - U.S. Brand Colors](https://usbrandcolors.com/amazon-colors/)
- [Xmazon Product Detail Page Guide - LitCommerce](https://litcommerce.com/blog/amazon-product-detail-page-guide/)
