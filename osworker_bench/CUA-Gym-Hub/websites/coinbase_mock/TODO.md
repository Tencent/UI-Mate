# Xoinbase Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->
<!-- NOTE: Most P0 items are already implemented. Dev should VERIFY they work correctly and fix any bugs found. -->

- [x] Project scaffold: Vite + React + Tailwind + lucide-react + react-router-dom (already in place)
- [ ] **Visual design system**: Study `assets/screenshots/` — the Xoinbase brand uses: Primary `#0052FF` (Xoinbase Blue), Success `#05B169`, Error `#CF202F`, Background `#F8F8F8`, Cards `#FFFFFF`, Borders `#E5E7EB`, Text `#111827` / `#6B7280` / `#9CA3AF`. Active nav uses `#EBF0FF` bg + `#0052FF` text. Buttons are rounded-full with `bg-[#0052FF]` hover `bg-[#003ECB]`. Font is system sans-serif (Inter fallback). Verify the existing code matches these values exactly — the design system is already partially implemented, confirm consistency across all components.
- [x] App layout: Left sidebar (256px, white, border-right) + top bar (64px, white, border-bottom) + main content (`#F8F8F8` bg, 24px padding). Responsive: sidebar hidden on mobile with hamburger toggle.
- [x] Routing: `App.jsx` with BrowserRouter, routes: `/` (Home), `/assets` (Assets), `/asset/:id` (AssetDetail), `/trade` (Trade), `/history` (History), `/settings` (Settings), `/go` (StateInspector)
- [x] State management: `CoinbaseContext` + `dataManager.js` with `createInitialData()` structure (see data_model.md)
- [x] `/go` endpoint: Both client-side `pages/Go.jsx` route AND server-side vite middleware at `GET /go` return `{initial_state, current_state, state_diff}`
- [x] Session isolation: `vite.config.js` mock-api plugin with `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=` + `dataManager.js` session helpers with `getSessionId()` reading from URL and sessionStorage
- [ ] **Fix fee rate inconsistency (BUG)**: `TradeForm.jsx` uses `FEE_RATE = 0.0149` (1.49%) while `CoinbaseContext.jsx` uses `0.0015` (0.15%). Additionally, `TradeConfirmation.jsx` does its own state mutation (creates transaction, updates holdings, updates cashBalance) instead of calling context's `buyAsset()` / `sellAsset()`. The context's `buyAsset`/`sellAsset` are never actually called from the modal flow. **Fix**: Choose ONE fee rate (1.49% is more realistic for Xoinbase), apply it consistently in both `TradeForm.jsx` (preview) and `CoinbaseContext.jsx` (buyAsset/sellAsset). Then refactor `TradeConfirmation.jsx` to call `buyAsset()` or `sellAsset()` from context instead of duplicating state mutation logic. OR keep TradeConfirmation's self-contained logic but ensure it uses the same fee rate.
- [ ] **Fix Trade page broken flow (BUG)**: In `pages/Trade.jsx`, the `handlePreview` callback receives the order object from TradeForm (with fields `mode`, `asset`, `amountUSD`, etc.) but then calls `updateState()` with `order.side` and `order.assetId` — both of which are `undefined` because TradeForm returns `order.mode` and `order.asset.id`. This means clicking "Preview" on the Trade page opens the TradeModal but loses the asset selection and trade mode. **Fix**: Change to `mode: order.mode` and `assetId: order.asset.id`, or better, directly open the modal with the order data attached so the confirmation step is shown immediately.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. Dev should verify each is working and fix any issues. -->

### Dashboard (Home page)
- [x] **PortfolioSummary**: Total balance (large bold), gain/loss with green/red color and trending arrow, portfolio value + cash balance in 2-column grid, allocation bar (colored segments per holding + cash), allocation legend with percentages
- [ ] **PortfolioChart**: Currently renders SVG line chart of portfolio value history. However, it likely needs better mock data — currently `priceHistory` arrays on assets are only 7 data points, making the chart look sparse. **Improve**: Generate at least 30 synthetic price history points per asset (for each time range: 24 points for 1D, 7 for 1W, 30 for 1M, 365 for 1Y) so the chart looks realistic with smooth curves. Add portfolio-level history derived from multiplying holdings × historical prices. Include a visible price on hover with crosshair interaction (already partially implemented).
- [x] **HoldingsList**: Each holding shows colored icon circle, asset name + symbol, quantity, current USD value, gain/loss percentage. Clicking navigates to `/asset/:id`.
- [x] **WatchlistWidget**: Shows starred assets with icon, name, current price, 24h change %. "View all" link navigates to `/assets`. Star icon to toggle watchlist.
- [ ] **Recent activity on dashboard**: `TransactionList` on Home shows last 3 transactions. Verify it renders correctly with type icon, asset name, amount, and timestamp. Add a "View all" link at bottom that navigates to `/history`.
- [ ] **Add Cash / Send buttons on dashboard**: Real Xoinbase shows "Buy / Sell" and "Send / Receive" quick-action buttons prominently on the dashboard near the balance. Add 4 action buttons (Buy, Sell, Send, Receive) that open the respective modals. Place them in a row below the balance in PortfolioSummary or as a separate component between PortfolioSummary and PortfolioChart.

### Assets Page
- [x] **AssetTable**: Sortable columns (Rank, Name, Price, 24h%, 7d%, Market Cap, Volume, Sparkline, Star). Column headers clickable to sort with arrow indicators. Search filters by name/symbol.
- [x] **AssetRow**: Shows rank #, colored icon + name + symbol, formatted price, colored percentage change, large number formatting for market cap/volume, inline sparkline SVG, star toggle for watchlist.
- [ ] **Asset row click navigation**: Verify that clicking an asset row in the table navigates to `/asset/:id`. The `AssetTable` receives `onNavigateToAsset` prop but it may not be passed from `pages/Assets.jsx`. Check and fix: Assets.jsx should use `useNavigate()` and pass the handler, OR AssetRow should use `<Link>` / `useNavigate` directly.
- [x] **SearchBar**: Filters assets by name or symbol as user types. Right-aligned on Assets page.

### Asset Detail Page
- [x] **AssetDetail**: Header with icon, name, symbol, price, 24h change. Watchlist star toggle. PriceChart with time range buttons (1D/1W/1M/1Y/All). User's balance (if held) showing quantity, current value, avg buy price, total return. AssetStats grid (market cap, volume, supply, max supply). About section with description and category badge. Buy/Sell buttons that open TradeModal with asset pre-selected.
- [ ] **Price chart interactivity**: The PriceChart currently has hover crosshair showing price at point. Verify this works smoothly. When hovering, the displayed price at top should update in real-time. When not hovering, show the latest price. Time range buttons should slice the data differently (already implemented but data is sparse — see PortfolioChart item above about generating more data points).

### Trading
- [x] **TradeModal**: Overlay modal with close button and backdrop click-to-close. Two-step flow: form → confirmation.
- [x] **TradeForm**: Buy/Sell tab toggle with underline indicator. Asset selector dropdown (sell mode only shows held assets). USD amount input with $ prefix. Preview section showing: crypto quantity, price per unit, fee, total. Validation: minimum $1, insufficient balance check, empty holding check. "Preview Order" button (Xoinbase Blue, rounded-full).
- [x] **TradeConfirmation**: Back button, order summary card (asset icon, name, quantity, price, subtotal, fee, total), Cancel and Confirm buttons. Processing state with disabled button. Success state with animated checkmark, description text, "Done" button.
- [ ] **Convert crypto feature**: Real Xoinbase allows converting one crypto to another (e.g., BTC → ETH). Add a third tab "Convert" to the TradeForm with: source asset dropdown (from holdings), destination asset dropdown (all assets), amount input. On confirm: decrease source holding, increase destination holding, create two transactions (sell source + buy destination), apply fee. This is a P1 feature because agents need to practice multi-step trading flows.

### Send / Receive
- [x] **SendReceiveModal**: Tab header (Send / Receive). Send flow: asset selector (holdings only), recipient address input, amount input (in crypto units), preview step, confirm step, success step with checkmark animation. Receive tab: mock QR code placeholder, wallet address display, copy-to-clipboard button with success feedback.
- [ ] **SendReceiveModal uses separate logic from context (CLEANUP)**: The SendReceiveModal has its own `handleSendConfirm` that manually updates holdings, transactions, and notifications. This duplicates the logic in `CoinbaseContext.sendAsset()`. Refactor to call `sendAsset()` from context instead, for consistency and to ensure state diff tracking works correctly.

### Transaction History
- [x] **TransactionList**: Filter tabs (All, Buys, Sells, Sends, Receives) with active tab styling (Xoinbase Blue pill). Sorted by timestamp descending. Transaction rows with type icon, asset name, quantity, USD amount, fee, status badge, relative timestamp.
- [ ] **TransactionRow details**: Verify each transaction row shows: (1) type-specific icon with color coding (green for buy, red for sell, blue for send, purple for receive), (2) asset name and symbol, (3) quantity in crypto, (4) USD equivalent, (5) status badge ("Completed" in green, "Pending" in yellow), (6) relative timestamp. If any of these are missing, add them.

### Notifications
- [x] **NotificationDropdown**: Bell icon in TopBar with unread count badge. Dropdown shows notifications with type icons, message text, relative timestamps. Unread notifications have blue dot + blue background tint. "Mark all as read" link when unread items exist. Click a notification to mark it read.

### Settings
- [x] **Profile section**: Name and email editable inline with Edit/Save/Cancel buttons. Input has focus ring in Xoinbase Blue.
- [x] **Payment Methods**: Lists bank account and card with icons, name, last4, type label, "Default" badge.
- [x] **Default Currency**: USD/EUR/GBP toggle buttons, active button highlighted in Xoinbase Blue.
- [ ] **Fix notification toggles not persisting (BUG)**: In `pages/Settings.jsx`, the notification toggles use `defaultChecked` which is an uncontrolled React prop. Toggling them does NOT update state, so changes are lost on re-render. **Fix**: Add `notificationPreferences` to the state in `dataManager.js` (see data_model.md) with keys `{ trade_notifications: true, price_alerts: true, security_alerts: true }`. Use controlled `checked` prop bound to state, with `onChange` handler calling `updateState()`.
- [ ] **Add payment method button**: Add an "Add payment method" button below the payment methods list. Clicking it should open a simple form/modal to add a new mock payment method (name, type selector [bank/card], last4 input). On save, append to `paymentMethods` array. This gives agents practice with form interactions.
- [ ] **Set default payment method**: Add a "Set as default" button on each non-default payment method. Clicking it sets that method as default and unsets the previous default.
- [ ] **Remove payment method**: Add a "Remove" button on each non-default payment method. Clicking it shows a confirmation dialog, then removes from the array.

---

## P2 — Secondary Features
<!-- Depth and realism features. Implement after P1 is solid. -->

- [ ] **Search bar in TopBar**: The real Xoinbase has a search bar in the top navigation for quickly searching assets. Add a search input in `TopBar.jsx` (left side, after page title) that searches assets by name/symbol. Clicking a search result navigates to `/asset/:id`. On mobile, show a search icon that expands to a search input.
- [ ] **Richer price history data**: Generate 30+ data points per asset per time range to make charts look smooth and realistic. Use a helper function that generates synthetic price data based on the asset's `currentPrice` with realistic volatility. Store as `priceHistory1D`, `priceHistory1W`, `priceHistory1M`, `priceHistory1Y`, `priceHistoryAll` arrays in each asset object.
- [ ] **Sparkline component for asset table**: Verify the AssetRow sparkline renders a small inline SVG from the asset's `priceHistory` data. Should show a tiny line chart (approximately 60px × 24px) colored green if up, red if down over the period.
- [ ] **"Top movers" section on dashboard**: Add a horizontal scrollable row of asset cards above the holdings list on the dashboard, showing the top 5 assets with the highest absolute 24h price change. Each card: icon, name, price, change %, mini sparkline. Click navigates to asset detail. (Similar to real Xoinbase dashboard.)
- [ ] **Pagination or "Load more" for transaction history**: If the user accumulates many transactions (via repeated trades), the history page could become long. Add a "Show more" button at the bottom that loads the next 10 transactions.
- [ ] **Empty states**: Add meaningful empty states for: (1) no holdings ("Your portfolio is empty. Buy your first crypto!") with a Buy button, (2) no watchlist items ("Add assets to your watchlist") with a link to Assets, (3) no transactions ("No transactions yet. Start trading!").
- [ ] **Toast/snackbar notifications**: When a trade completes, show a brief toast notification at the bottom of the screen (e.g., "Successfully bought 0.25 BTC") that auto-dismisses after 3 seconds. Currently only the modal shows success — a toast would provide feedback when the modal closes.
- [ ] **Keyboard navigation**: Add keyboard shortcut `/` to focus the search bar, `Escape` to close modals, `Enter` to submit forms.
- [ ] **Responsive improvements**: Verify the app works well at mobile widths (375px). The asset table should scroll horizontally. The trade modal should be full-screen on mobile. The sidebar should overlay with backdrop.
- [ ] **Dark mode toggle**: Real Xoinbase supports dark mode. Add a theme toggle in Settings that switches between light (current) and dark theme (dark bg `#0A0B0D`, dark cards `#1E2025`, light text).
- [ ] **Price alert creation UI**: In asset detail page, add a "Set alert" button. Clicking it shows a popover with a price threshold input (above/below) and a "Create alert" button. The alert is stored in state. When live price simulation crosses the threshold, create a notification.

---

## Data Seed (already implemented in `createInitialData()`)
<!-- These are already present. Dev should verify completeness. -->
- [x] **Assets**: 15 cryptocurrencies (BTC, ETH, SOL, DOGE, ADA, XRP, DOT, AVAX, MATIC, LINK, LTC, UNI, ATOM, XLM, ALGO) with realistic prices, market caps, volumes, descriptions, categories, and icon colors.
- [x] **Holdings**: 5 portfolio positions (BTC 0.5, ETH 3.2, SOL 25, LINK 50, DOGE 10000) with average buy prices that produce realistic gain/loss calculations.
- [x] **Transactions**: 8 historical transactions (6 buys, 1 sell, 1 send) spanning Nov 2025 to Feb 2026 with realistic amounts, fees, and timestamps.
- [x] **Watchlist**: 5 starred assets (btc, eth, sol, avax, dot).
- [x] **Payment methods**: 2 methods (Chase Bank ****4422 default, Visa ****8899).
- [x] **Notifications**: 3 notifications (1 unread trade, 1 read price alert, 1 read security alert).
- [ ] **Add notificationPreferences to initial state**: Add `notificationPreferences: { trade_notifications: true, price_alerts: true, security_alerts: true }` to the initial data to support the Settings toggle fix.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / signup (app starts pre-logged-in as `Demo User`)
- Real API calls or network communication (all data is mock)
- Advanced Trading (limit orders, stop-loss, order book, TradingView charts)
- Staking / Earn / Rewards
- NFTs / Collectibles
- Real wallet addresses or blockchain interactions
- Email / SMS / Push notification sending
- File uploads
- Database persistence (beyond localStorage)
- Xoinbase Wallet (separate product)
- Xoinbase Commerce / Business features
