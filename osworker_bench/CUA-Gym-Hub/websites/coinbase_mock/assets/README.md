# Xoinbase Mock — Research Summary

## App Overview

**Xoinbase** (https://www.coinbase.com) is the largest US-based cryptocurrency exchange platform. It allows users to buy, sell, send, receive, and manage digital assets like Bitcoin, Ethereum, and 350+ other cryptocurrencies. The platform provides portfolio tracking, price charts, transaction history, and market data.

As of 2025, Xoinbase has 108M+ customers and handles $237B+ in quarterly trading volume. The consumer-facing web app (not Advanced Trade) targets beginner-to-intermediate crypto investors.

## Key User Personas

### Primary: Retail Crypto Investor
- Checks portfolio balance daily
- Buys/sells crypto with USD
- Monitors price changes for favorite assets
- Reviews transaction history
- Adjusts watchlist based on market trends

### Secondary: Crypto Sender/Receiver
- Sends crypto to external wallets
- Receives crypto deposits
- Monitors pending transactions

## Core Workflows (Priority Order)

1. **Check portfolio** — Open dashboard, see total balance, gain/loss, holdings breakdown
2. **Buy crypto** — Select asset → enter USD amount → preview fee → confirm purchase
3. **Sell crypto** — Select holding → enter quantity → preview proceeds → confirm sale
4. **Browse assets** — View all available cryptos sorted by market cap, search/filter, view price changes
5. **View asset detail** — Click individual asset → see price chart, stats, about section → buy/sell from there
6. **Review transactions** — View full history with filters (all, buys, sells, sends, receives)
7. **Manage watchlist** — Star/unstar assets to track on dashboard
8. **Send crypto** — Enter wallet address → enter amount → confirm send
9. **Adjust settings** — Edit profile, change currency, manage payment methods, notification preferences

## UI Layout & Design

### Color Palette
- **Primary (Xoinbase Blue)**: `#0052FF`
- **Active/Selected Background**: `#EBF0FF` (light blue tint)
- **Success/Positive (Green)**: `#05B169`
- **Error/Negative (Red)**: `#CF202F`
- **Background**: `#F8F8F8` (light gray)
- **Card Background**: `#FFFFFF`
- **Border**: `#E5E7EB` (gray-200)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6B7280` (gray-500)
- **Text Muted**: `#9CA3AF` (gray-400)

### Typography
- **Font**: System font stack (Inter/SF Pro/Segoe UI)
- **Headings**: Font-weight 700 (bold), sizes: 3xl (balance), xl (section titles), lg (page titles)
- **Body**: Font-weight 400-500, sizes: sm (14px) for most content, xs (12px) for labels
- **Monospace**: Used for addresses, JSON in debug views

### Layout Structure (Desktop)
- **Left sidebar**: 256px (w-64), white background, border-right
  - Logo + "Xoinbase" text at top
  - Navigation links: Home, Assets, Trade, History, Settings
  - Active link: blue text + light blue background
- **Top bar**: 64px height (h-16), white background, border-bottom
  - Left: Page title
  - Right: Notification bell (with unread badge count), user avatar
- **Main content**: Fills remaining space, `#F8F8F8` background, 24px padding
- **Responsive**: Sidebar hidden on mobile, shown via hamburger menu

### Navigation Structure
| Tab | Route | Description |
|-----|-------|-------------|
| Home | `/` | Portfolio dashboard — balance, chart, holdings, watchlist, recent activity |
| Assets | `/assets` | Browse all 15 cryptocurrencies — sortable table with search |
| Trade | `/trade` | Dedicated trading page with buy/sell form + recent transactions |
| History | `/history` | Full transaction history with type filter tabs |
| Settings | `/settings` | Profile, payment methods, currency, notifications |
| Asset Detail | `/asset/:id` | Individual crypto page — chart, stats, buy/sell, about |
| State Inspector | `/go` | Debug endpoint returning JSON state diff |

## Page-by-Page UI Description

### Home/Dashboard (`/`)
- **PortfolioSummary card**: Total balance (large, bold), gain/loss with green/red arrow, portfolio value + cash balance in two columns, allocation bar chart with legend
- **PortfolioChart**: SVG line chart showing portfolio value over time, time range buttons (1D/1W/1M/1Y/All)
- **HoldingsList**: Cards for each holding — colored crypto icon circle, name, symbol, quantity, USD value, gain/loss %, sparkline
- **WatchlistWidget**: Compact list of starred assets — icon, name, price, 24h change %, "View all" link
- **TransactionList (limit 3)**: Recent transactions — type icon, description, amount, timestamp

### Assets Page (`/assets`)
- **Search bar**: Right-aligned, filters assets by name/symbol in real-time
- **AssetTable**: Sortable columns — #, Name (icon + name + symbol), Price, 24h Change, 7d Change, Market Cap, Volume, Sparkline
- **Sorting**: Click column header to sort; arrow indicator shows direction
- **Row click**: Navigates to `/asset/:id`
- **Star icon**: Toggle watchlist membership inline

### Asset Detail (`/asset/:id`)
- **Header**: Large crypto icon, name, symbol, current price (big), 24h change with color
- **PriceChart**: SVG line chart with time range selector (1H, 1D, 1W, 1M, 1Y, All)
- **AssetStats**: Grid of stats — Market Cap, 24h Volume, Circulating Supply, Max Supply
- **Action buttons**: "Buy [SYMBOL]" (primary blue), "Sell [SYMBOL]" (outline) — open TradeModal
- **About section**: Description text, category badge
- **Watchlist toggle**: Star button in header

### Trade Page (`/trade`)
- **TradeForm**: Buy/sell tabs, asset dropdown, amount input (USD with crypto equivalent or vice versa), payment method selector, fee preview, "Preview Order" button
- **Recent transactions**: Below the form, showing last 5 trades

### Trade Modal (overlay)
- **Step 1 — Form**: Buy/Sell toggle, asset selector, amount input (can toggle between USD and crypto amount), payment method, fee display, "Preview Buy/Sell" button
- **Step 2 — Confirmation**: Order summary (asset, quantity, price, fee, total), "Confirm Buy/Sell" button, "Back" link
- **On confirm**: Updates holdings, cash balance, creates transaction, creates notification, closes modal

### Send/Receive Modal (overlay)
- **Send tab**: Asset dropdown (holdings only), wallet address input, amount input, fee note, "Send" button
- **Receive tab**: Display wallet address (mock), copy-to-clipboard button

### History Page (`/history`)
- **Filter tabs**: All, Buys, Sells, Sends, Receives
- **TransactionList**: Full list — type icon (color-coded), asset name + symbol, quantity, USD amount, fee, status badge, relative timestamp
- **Status badges**: "Completed" (green), "Pending" (yellow)

### Settings Page (`/settings`)
- **Profile section**: Name (editable inline), Email (editable inline)
- **Payment Methods**: List of bank/card with icon, name, last4, "Default" badge
- **Default Currency**: USD/EUR/GBP toggle buttons
- **Notifications**: Toggle switches for trade confirmations, price alerts, security alerts

## Feature List with Priority

### P0 — Core Shell (app cannot render without these)
- [x] Project scaffold (Vite + React + Tailwind)
- [x] App layout (sidebar + topbar + main content)
- [x] Routing (all routes defined)
- [x] State management (CoinbaseContext + dataManager.js)
- [x] `/go` endpoint (client-side + server-side)
- [x] Session isolation (vite.config.js mock-api plugin)

### P1 — Primary Features
- [x] Portfolio dashboard (balance, gain/loss, allocation bar)
- [x] Portfolio chart
- [x] Holdings list with navigation
- [x] Watchlist widget
- [x] Asset table with search and sorting
- [x] Asset detail page with chart and stats
- [x] Buy crypto flow (modal + form + confirmation)
- [x] Sell crypto flow
- [x] Send crypto flow
- [x] Transaction history with filters
- [x] Notification dropdown with unread badge
- [x] Live price simulation
- [x] Settings page (profile, payments, currency, notifications)

### P2 — Polish & Depth
- [ ] Convert crypto flow (swap one crypto for another)
- [ ] Receive crypto display (mock wallet address + QR)
- [ ] Notification toggle state persistence
- [ ] "Add payment method" button (add to list)
- [ ] "Remove payment method" with confirmation
- [ ] "Set as default" payment method toggle
- [ ] Price alerts UI (set threshold, receive notification)
- [ ] Keyboard shortcuts (/ for search, etc.)

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **currentUser** — Profile + cash balance
- **assets** (15 records) — All available cryptocurrencies with prices, market data
- **holdings** (5 records) — User's portfolio positions
- **transactions** (8 records) — Buy/sell/send history
- **watchlist** — Array of asset IDs
- **paymentMethods** — Bank and card payment options
- **notifications** — Trade confirmations, price alerts, security notices
- **ui** — Modal states, sort preferences, filters

## What to Skip
- **Authentication**: App starts pre-logged-in as "Demo User"
- **Real API calls**: All data is mock, persisted in localStorage
- **Advanced Trading**: Limit orders, stop-loss, order book (this is Xoinbase consumer, not Advanced Trade)
- **Staking/Earn**: Crypto rewards feature (out of scope)
- **Real wallet addresses**: Use mock addresses
- **NFTs/Collectibles**: Out of scope for consumer trading mock
- **News feed**: Crypto news integration not needed

## Screenshot Reference

Screenshots are in `assets/screenshots/`:
- `000001-000005.jpg` — Xoinbase dashboard/portfolio views
- `asset_detail/` — Asset detail and price chart views
- `trade/` — Buy/sell interface and trading views
- `explore/` — Asset list/explore page views

Key visual references:
- Dashboard shows horizontal asset price cards with sparklines at top, "Your Portfolio" list below left, "Recent Activity" below right
- Navigation: either horizontal top tabs (Dashboard, Buy/Sell, Accounts, Tools, Settings) or left sidebar
- Brand color is Xoinbase Blue (#0052FF)
- Clean white cards on light gray background
- Green for positive price changes, red for negative
