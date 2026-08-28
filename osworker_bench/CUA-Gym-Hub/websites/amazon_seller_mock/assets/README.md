# Xmazon Seller Central Mock -- Research Summary

## App Overview

Xmazon Seller Central is Amazon's web-based platform where third-party marketplace sellers manage every aspect of their e-commerce business. It serves as the central hub for product listing, inventory management, order fulfillment, advertising, pricing, customer communication, business analytics, and account health monitoring. The platform supports both FBA (Fulfillment by Amazon) and FBM (Fulfilled by Merchant) sellers.

## Key User Personas

1. **Small Business Owner** (primary): Manages 10-100 SKUs, checks dashboard daily for orders, monitors account health, adjusts pricing, responds to buyer messages.
2. **Brand Manager**: Uses Brand Analytics, A+ Content, Stores, and advertising tools to grow brand presence.
3. **Operations Manager**: Focuses on inventory levels, FBA shipments, order fulfillment, and shipping performance.

### Primary Daily Workflows
- Check dashboard for new orders, sales metrics, and alerts
- Process and manage orders (confirm shipments, handle returns)
- Monitor and update inventory levels
- Adjust product pricing
- Respond to buyer messages
- Review account health and resolve issues
- Create/manage advertising campaigns
- Review business reports and analytics

## Complete Feature List

### P0 -- Core (app cannot render without these)
1. Top navigation bar with logo, search, notifications, messages, settings, help
2. Hamburger menu sidebar navigation with all major sections
3. Dashboard/homepage with sales summary widgets, order counts, account health status
4. Routing between all major views
5. State management and data seeding
6. `/go` endpoint for state inspection
7. Session isolation

### P1 -- Primary Features (core interactive workflows)
1. **Manage Orders page**: Table of orders with status tabs (All, Pending, Unshipped, Shipped, Cancelled), search/filter, order details view, confirm shipment action, cancel order
2. **Manage Inventory page**: Table of all product listings with columns (image, name, SKU, ASIN, price, FBA/FBM, status, quantity), search/filter, edit price inline, edit quantity inline, actions dropdown per row
3. **Add/Edit Product page**: Multi-tab form (Vital Info, Description, Images, Keywords, Variations, Price), required field validation
4. **Pricing page**: Manage Pricing table with inline price editing, Pricing Health view, Automate Pricing rules
5. **Account Health dashboard**: Summary cards for Customer Service Performance, Policy Compliance, Shipping Performance with red/yellow/green indicators
6. **Business Reports**: Sales dashboard with date range picker, line chart, comparison toggles, summary stats table
7. **Buyer Messages**: Inbox view with conversation threads, reply composer, message status filters

### P2 -- Secondary Features (depth and realism)
1. **Advertising Campaign Manager**: Campaign list table, create campaign form, budget/bid settings, performance metrics
2. **FBA Inventory management**: Inbound shipments, inventory age, restock suggestions
3. **Feedback Manager**: Buyer feedback list with ratings, response capability
4. **Returns management**: Return requests table with approve/deny actions
5. **Coupons and Promotions**: Create/manage discount coupons
6. **A-to-Z Guarantee Claims**: Claims list with details and response form
7. **Settings page**: Account info display, notification preferences, shipping settings
8. **Growth Opportunities**: Recommendations panel with program enrollment
9. **Payments/Disbursements**: Payment summary, transaction history, statement view
10. **Inventory Performance Index (IPI)**: Score display with improvement recommendations

## UI Layout Descriptions

### Top Navigation Bar
- Fixed at top, full width, 50px height, dark navy (#232f3e)
- Left: hamburger icon + "xmazon seller central" logo (white text, orange smile)
- Center: search input bar (white bg, rounded, magnifier icon)
- Right: notification bell, marketplace flag, messages icon, settings gear, "Help" link, user name

### Sidebar (Hamburger Menu)
- Slides from left, 280px wide, dark bg (#232f3e), full viewport height
- Close X button at top right of panel
- Sections: Catalog, Inventory, Pricing, Orders, Advertising, Stores, Growth, Reports, Performance, B2B, Brands, Apps & Services
- Each section has sub-items that expand on click

### Dashboard/Homepage
- Account health summary bar at top (green/yellow/red indicator)
- Sales snapshot cards: Today's Sales, Orders (Pending/Unshipped/Shipped), Units Ordered, Buyer Messages
- Sales comparison chart (today vs yesterday/last week/last year)
- Action items / alerts panel
- Quick link cards to common tasks

### Manage Orders
- Tab bar: All Orders | Pending | Unshipped | Shipped | Cancelled
- Search bar with date range filters
- Table columns: Order Date, Order ID, Product Name, Quantity, Price, Status, Fulfillment, Actions
- Each row expandable or clickable to see order details
- Bulk action toolbar: Confirm Shipment, Print Packing Slip

### Manage Inventory
- Tab bar: Active | Inactive | Out of Stock | All
- Search bar with category filter dropdown
- Table columns: Thumbnail, Product Name, SKU, ASIN, Price, Available Qty, FBA/FBM, Status, Actions
- Inline editing for price and quantity cells
- Actions dropdown: Edit, Manage Images, Close Listing, Delete

### Add Product Form
- Multi-step tabbed form: Product Identity, Vital Info, Description, Images, Keywords, More Details
- Product ID field (UPC/EAN), Title, Brand, Manufacturer, Category selector
- Rich text description, bullet points for key features
- Image upload slots (main + 6 additional)
- Save as Draft / Submit buttons

### Business Reports
- Date range selector with preset options (Today, Yesterday, Last 7 days, Last 30 days, Custom)
- Sales chart (line graph) with toggleable metrics
- Summary stats row: Ordered Product Sales, Units Ordered, Total Order Items
- Breakdown table by ASIN/SKU

## Complete Sidebar Navigation Structure

The hamburger menu sidebar contains these sections and sub-items (based on research of the actual Seller Central as of 2025-2026):

1. **Catalog**: Add Products
2. **Inventory**: Manage All Inventory, Manage FBA Inventory, Inventory Planning, Manage FBA Shipments
3. **Pricing**: Manage Pricing, Automate Pricing
4. **Orders**: Manage Orders, Order Reports, Manage Returns
5. **Advertising**: Campaign Manager, Create Campaign
6. **Stores**: Manage Stores
7. **Growth**: Growth Opportunities
8. **Reports**: Business Reports, Payments, Advertising Reports
9. **Performance**: Account Health, Feedback, Voice of the Customer
10. **B2B**: B2B Central
11. **Brands**: Brand Dashboard
12. **Apps & Services**: (placeholder)
13. **Learn**: Seller University (placeholder)
14. **Settings**: Account Info, Notification Preferences, Shipping Settings

## Screenshots

Reference screenshots are located in `screenshots/reference/`. Note: these are primarily promotional images from Amazon's Sell page, not actual Seller Central UI captures. The dev agent should refer to DESIGN.md for exact colors, spacing, and component specifications derived from thorough research of the actual Seller Central interface.

Screenshots in `screenshots/dashboard/` show indirect views of the dashboard interface on laptop screens, confirming the general layout: dark top bar, left sidebar, white content area with charts and data tables.

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Products** (listings with ASIN, SKU, title, price, quantity, images, status)
- **Orders** (order ID, items, buyer info, status, fulfillment type, dates)
- **Inventory** (quantity tracking, FBA/FBM split, restock alerts)
- **Messages** (buyer-seller communications)
- **Returns** (return requests with status)
- **Advertising Campaigns** (campaigns, ad groups, keywords, bids)
- **Account Health** (metrics for customer service, policy, shipping)
- **Reports** (daily sales snapshots, traffic data)
- **Feedback** (buyer ratings and comments)
- **Payments** (disbursements, fees, transactions)

## Notes on Scope

### Out of Scope
- Authentication / login (app starts pre-logged-in as seller "Evergreen Home Goods")
- Real API communication to Amazon services
- Actual payment processing
- Real file upload to S3
- Multi-marketplace switching (show US only)
- Actual FBA shipment creation workflows
- Real advertising bid optimization

### Key Design Decisions
- Use localStorage for state persistence
- All data is seeded with realistic mock data
- Tables should be sortable and filterable
- Inline editing should feel responsive (no full-page reloads)
- Account health should show a mix of green (good) and yellow (needs attention) states to make the dashboard feel realistic
