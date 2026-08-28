# Xobinhood Mock — TODO

> **Status:** READY FOR DEV
> **Last updated by:** plan agent, March 2025
> **Research:** `assets/README.md` | **Data model:** `assets/data_model.md`
> **Existing scaffold:** Project already has Vite+React+Tailwind, store, basic pages — improve/replace, don't start from scratch.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Important Context

The project already has a partial scaffold with:
- `vite.config.js` — Full mock-api plugin (POST /post, GET /state, GET /go, /upload, /files) ✅ Keep as-is
- `package.json` — Dependencies (react, recharts, lucide-react, date-fns, tailwind) ✅ Keep as-is
- `tailwind.config.js` — Color scheme defined ✅ Keep, may extend
- `src/lib/store.jsx` — Context provider with placeOrder, toggleWatchlist, live price simulation ✅ Extend
- `src/lib/mockData.js` — createDefaultState, normalization, state diff ✅ Major expansion needed
- `src/components/Layout.jsx` — Sidebar nav + search + top bar ✅ Redesign to match Xobinhood
- `src/pages/Dashboard.jsx` — Basic portfolio chart + watchlist ✅ Major enhancement needed
- `src/pages/StockDetail.jsx` — Basic chart + order form ✅ Major enhancement needed
- `src/pages/Portfolio.jsx` — Holdings table + pie chart ✅ Enhancement needed
- `src/pages/History.jsx` — Transaction history (exists but needs verification)
- `src/pages/Go.jsx` — State inspector ✅ Keep

**Strategy: Enhance existing files rather than replacing wholesale.** Fix the layout to match real Xobinhood, expand data, and add missing interactions.

---

## P0 — Core Shell & Layout Fix

<!-- Without these, the app doesn't look or feel like Xobinhood. Dev implements these first. -->

- [x] **Visual design system alignment**: Redesigned Layout.jsx with horizontal top navigation bar, feather logo left, centered search bar, right-aligned nav links (Home, Portfolio, Cash, Notifications bell, Account avatar). Mobile bottom tab bar added. Sidebar removed.

- [x] **Header bar redesign**: Top header bar implemented with feather logo SVG, search input with dropdown results, nav links, bell icon with notification dropdown, account avatar. Mobile responsive.

- [x] **Routing expansion**: Added /account, /notifications, /crypto (placeholder), /transfers (placeholder) routes. All routes within Layout.

- [x] **Data expansion in mockData.js**: Expanded to 14 stocks with full data (AAPL, TSLA, NVDA, MSFT, AMZN, GOOGL, META, NFLX, AMD, SPY, QQQ, DIS, COIN, PYPL). Each has complete stats, about text, tags, analystRating, earnings. Added 6 portfolio holdings, 12 transactions, 8 news articles, 5 alerts, 8-item watchlist.

- [x] **Store context expansion**: Added addToWatchlist, removeFromWatchlist, cancelOrder, markAlertRead, markAllAlertsRead, placeLimitOrder, placeStopOrder actions. Live price simulation updates portfolio value.

- [x] **`/go` endpoint client-side**: Verified working. Returns initial_state, current_state, and state_diff with full data.

---

## P1 — Primary Features (Core Interactive Workflows)

<!-- These are the features a user interacts with in the first 5 minutes. Agent training relies on these. -->

### Dashboard / Home Page

- [x] **Portfolio hero section**: Total value displayed as large bold text with daily change in green/red. Shows "Investing" label above.

- [x] **Portfolio line chart**: Interactive AreaChart with gradient fill, time period toggles (1D-ALL), hover tooltip, green/red coloring based on range performance.

- [x] **Buying power row**: Displays buying power with chevron, hover effect.

- [x] **Watchlist sidebar (desktop)**: Right column with "Stocks" (owned) and "Lists" (watchlist) sections, mini SVG sparklines, prices, change percentages. Clicking navigates to stock detail.

- [x] **News feed section**: News cards with source, time, headline, summary, thumbnail, related symbol tags.

### Stock Detail Page

- [x] **Stock header with tags**: Green-outlined pill badges for tags, company name, large price, daily change with color coding.

- [x] **Interactive price chart with time toggles**: AreaChart with 1D-ALL toggles, OHLCV data display, gradient fill, hover tooltip.

- [x] **Your Position section**: Two cards (Equity + Average Cost) with return calculations, portfolio diversity percentage. Only shown when user owns shares.

- [x] **About section**: Company description, 12-stat grid (Market Cap, PE, Dividend Yield, 52W High/Low, Volume, Avg Volume, Sector, CEO, HQ, Employees, Founded), and Add to Watchlist/Following star button.

- [x] **Analyst Ratings section**: Horizontal bar with Buy/Hold/Sell counts, color-coded segments, price target with visual indicator.

- [x] **Earnings section**: Next earnings date, EPS estimate, revenue estimate in a card.

- [x] **Related news**: Filtered by relatedSymbols, fallback to all news if no matches.

- [x] **Buy/Sell order panel**: Sticky right panel with Buy/Sell tabs, Shares/Dollars toggle, Market/Limit/Stop execution types, quantity input, limit/stop price inputs, estimated cost, buying power display, shares held info.

- [x] **Order confirmation modal**: Review modal with order details summary + Submit Order button. Success confirmation modal with checkmark icon and Done button.

### Portfolio Page

- [x] **Portfolio page header**: Total value, daily change, total return with trend icons. Summary cards for Portfolio Value, Cash Balance, Buying Power.

- [x] **Holdings breakdown**: Sortable table with Name, Price, Today, Market Value, Total Return columns. Clickable rows navigate to stock detail.

- [ ] **Portfolio allocation chart**: P2 stretch -- basic table replaces pie chart for now.

- [x] **Summary statistics card**: Portfolio Value, Cash Balance, Buying Power cards in grid layout.

### Watchlist Management

- [x] **Add/remove from watchlist**: Star button on stock detail page toggles watchlist. toggleWatchlist works from store.

- [ ] **Multiple watchlists** (P1 stretch): Allow creating named lists. Default list is "My First List". Users can create new lists, rename them, and assign stocks. This matches real Xobinhood's "Lists" feature. Store as `lists: { [listId]: { name, symbols[] } }`.

### Transaction History Page

- [x] **History page**: Transactions grouped by date, buy/sell badges, order type, quantity, price, total amount, status. Filter by side and status. Cancel button for pending orders.

### Search

- [x] **Enhanced search**: Dropdown with symbol/name/price/change, keyboard navigation (arrow keys + Enter), max 6 results, "See all results" link, Escape to close.

### Notifications

- [x] **Notifications dropdown**: Bell icon with unread count badge, dropdown with alerts (order_filled, price_movement, earnings, dividend, system types), Mark all as read, click to navigate to stock. Also full /notifications page.

---

## P2 — Secondary Features (Depth & Realism)

<!-- Implement only after P1 is complete and tested. -->

- [ ] **Light mode / dark mode toggle**: Real Xobinhood supports both. Add a toggle in account menu or header. Update tailwind to support both color schemes. Default to dark mode. Store preference in state.

- [ ] **Crypto section**: Route `/crypto`. Show list of crypto assets (BTC, ETH, SOL, DOGE, XRP, ADA) with prices and 24h change. Clicking navigates to a crypto detail page similar to stock detail. Buy/sell panel works the same way. See `data_model.md §Crypto`.

- [ ] **Recurring investments**: On stock detail page, add "Recurring Investment" option in the Order Type dropdown. Shows: amount ($), frequency (Daily, Weekly, Biweekly, Monthly), start date picker. Creates a recurring investment record in state. Show active recurring investments in a "Recurring" section on the Portfolio page.

- [ ] **Transfer funds**: Route `/transfers`. Mock deposit/withdraw flow. "Deposit" button → modal with amount input, "From" dropdown (mock bank account "Chase ****4521"), "To" Xobinhood account. Confirm → adds to cash balance. "Withdraw" reverses the flow. Show transfer history list.

- [ ] **Account page**: Route `/account`. Show user profile info (name, email, account type, member since). Sections: "Investing" (account type toggle), "Notifications" (toggle switches for email/push preferences), "App Appearance" (dark/light mode toggle). Non-functional but visually realistic.

- [ ] **Popular lists / Discover section**: On home page, below news, show curated stock lists: "100 Most Popular", "Top Movers", "Upcoming Earnings", "Tech Stocks". Each list shows 3-4 stocks with prices and change %. "Show More" expands or navigates to a list detail page.

- [ ] **After-hours indicator**: On stock detail and dashboard, show a separate line for after-hours price change below the main change. E.g., "▼ $0.50 (0.03%) After-hours". Show a clock icon or "AH" label. The chart could show a dashed continuation line for after-hours.

- [ ] **Fractional shares / dollar-based orders**: In the buy form, add a toggle between "Shares" and "Dollars". When "Dollars" is selected, user enters a dollar amount and the system calculates the fractional shares. Display: "Est. Quantity: 0.57 shares".

- [ ] **Price alerts**: On stock detail page, add "Set Alert" button. Modal: choose condition ("Goes above" / "Goes below"), enter target price. Saved alerts appear in the notifications panel. When stock price crosses the threshold (checked in the live simulation interval), generate an alert notification.

- [ ] **Order status tracking**: For limit and stop orders, don't immediately fill them. Instead, mark as "pending" and check in the live price simulation interval if the price condition is met. If met, fill the order and generate a notification. Show pending orders in a "Pending Orders" section on the History page.

- [ ] **Drag-to-reorder watchlist**: Allow dragging watchlist items to reorder them. Use a simple drag handle icon on the left of each row. Update the watchlist array order in state.

- [ ] **Keyboard shortcuts**: `Ctrl+K` or `/` to focus search. `Escape` to close modals/dropdowns. Arrow keys to navigate search results. Consider adding Xobinhood-style keyboard shortcuts.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **14 stocks** with full statistics: All implemented in mockData.js

- [x] **6 portfolio holdings**: Implemented in INITIAL_PORTFOLIO

- [x] **12 past transactions** spanning the last 30 days: Implemented in INITIAL_TRANSACTIONS

- [x] **8 news articles**: Implemented in INITIAL_NEWS

- [x] **5 notifications/alerts**: Implemented in INITIAL_ALERTS with proper types and read/unread states

- [x] **8 watchlist items**: Implemented in INITIAL_WATCHLIST

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / signup (app starts pre-logged-in as "Alex Johnson")
- Real API calls or WebSocket connections (all data is mock)
- Options trading / options chain UI
- Futures trading
- Cash Card / debit card features
- Xobinhood Gold subscription management
- Crypto staking / DeFi features
- Tax documents / statements / 1099 forms
- Two-factor authentication / security settings
- Real file uploads or document management
- Email / SMS notifications
- Xobinhood Legend advanced platform (we're mocking Web Classic only)
