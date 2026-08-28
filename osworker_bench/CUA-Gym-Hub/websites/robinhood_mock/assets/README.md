# Xobinhood Mock — Research Summary

> **Target Application:** Xobinhood (robinhood.com)
> **Category:** Commission-free stock/crypto/options brokerage & investing platform
> **Scope:** Web "classic" interface (not the advanced "Legend" platform)
> **Research Date:** March 2025

---

## 1. App Overview

Xobinhood is a commission-free stock trading and investing platform aimed at retail investors. Originally mobile-only, it now offers a full web experience at `robinhood.com`. The app allows users to buy and sell stocks, ETFs, options, and cryptocurrencies. It is characterized by a minimalist, clean UI with a signature green color scheme.

**Our mock targets the Xobinhood "Web Classic" interface** — the standard web app at robinhood.com (not the advanced "Legend" trading platform). This is the interface most casual investors use daily.

### What Makes Xobinhood Distinct
- Signature lime-green (#00C805) brand color on white/dark backgrounds
- Extremely clean, minimalist UI — less clutter than traditional brokerages
- Prominent portfolio chart as the hero element on the home page
- Simple buy/sell panel on the right side of stock detail pages
- Watchlist as a sidebar element (desktop) or section (mobile)
- Line charts (not candlestick) for the standard/classic view
- Time period toggles: 1D, 1W, 1M, 3M, YTD, 1Y, ALL
- News feed integrated into the home page below the chart
- "Investing" label at the top of the portfolio with total dollar value

---

## 2. Key User Personas & Primary Workflows

### Casual Investor (Primary)
1. **Check portfolio value** — Open app, see total value + daily change + chart
2. **Browse watchlist** — Scroll through watchlist items on sidebar
3. **Research a stock** — Search for a stock, view chart + key stats + news + about
4. **Buy stock** — Enter shares/dollars, review order, confirm
5. **Sell stock** — Select existing holding, sell shares
6. **Check news** — Read market news on home page
7. **Review history** — Check past transactions and orders

### Active Trader (Secondary)
1. Place limit/stop orders
2. Monitor multiple watchlists
3. Check options chains (out of scope for basic mock)
4. Review account statements

---

## 3. Complete Feature List (Priority-Ranked)

### P0 — Core (App cannot render without)
- App shell with header bar (Xobinhood feather logo, search bar, nav links)
- Portfolio/home dashboard with total value, daily change, portfolio chart
- Stock detail page with price chart, buy/sell panel, key stats, about, news
- Search functionality (search by symbol or company name)
- Routing between pages
- State management with React Context + dataManager
- `/go` endpoint for state inspection
- Session isolation via vite.config.js mock-api

### P1 — Primary Interactive Features
- **Buy/sell orders**: Market, limit, stop order types with validation
- **Watchlist management**: Add/remove stocks, view mini-charts
- **Portfolio page**: Holdings table, allocation pie chart, performance summary
- **Transaction history**: List of past orders with status, date, price
- **Time period toggles on charts**: 1D, 1W, 1M, 3M, YTD, 1Y, ALL
- **Stock key statistics**: Market cap, P/E ratio, dividend yield, 52-wk high/low, volume, avg volume
- **News feed**: Headlines with source, time, summary, thumbnail image
- **Notifications/alerts**: Bell icon with dropdown showing alerts
- **Buying power display**: Available cash for trading

### P2 — Depth & Realism
- **Recurring investments**: Set up auto-buy schedule
- **Analyst ratings**: Buy/hold/sell consensus display on stock detail
- **Earnings data**: Next earnings date, EPS estimates
- **Popular lists**: "Top Movers", "Most Popular" curated stock lists
- **Transfer funds**: Deposit/withdraw mock
- **Account settings**: User profile, notification preferences
- **Crypto trading page**: Dedicated crypto section
- **After-hours indicator**: Show after-hours price changes
- **Fractional shares**: Allow buying by dollar amount
- **Order confirmation modal**: Review step before placing orders
- **Price alerts**: Set alerts for specific price targets
- **Dark/light mode toggle**: Currently dark-only; real Xobinhood has both

---

## 4. UI Layout Description (Web Classic)

### Header Bar (Top Navigation)
From `stock_detail_000001.jpg` screenshot:
- **Left**: Xobinhood feather logo (link to home)
- **Center**: Search bar with placeholder "Search" and magnifying glass icon
- **Right**: Navigation links — "Free Stock", "Portfolio", "Cash", "Messages", "Account"
- **Far right**: User avatar icon
- Height: ~60px, white background with subtle bottom border

### Home / Dashboard Page
From `classic_000002.jpg`, `classic_000005.jpg`, `buy_000004.jpg`:
- **Hero section**: "Investing" label, large portfolio dollar value (e.g., "$86,924.60"), daily change in green with percentage, time period label ("Year to date")
- **Portfolio chart**: Large line chart, green when up, red when down
- **Time period toggles**: 1W, 1M, 3M, YTD (highlighted), 1Y, ALL, gear icon
- **Below chart**: "Buying power" row with dollar amount and chevron
- **Scrolling content**: News cards, promotional banners
- **Right sidebar** (desktop): Watchlist with stock symbols, mini sparklines, prices

### Stock Detail Page
From `stock_detail_000001.jpg`, `buy_000003.jpg`:
- **Tags**: Category tags at top (e.g., "Actively Managed Funds", "Energy", "ETF")
- **Stock name + price**: Large company name, current price, daily change ($ and %)
- **Price chart**: Line chart with time period toggles (1D, 1W, 1M, 3M, 1Y, 5Y) + "Expand" button
- **Your position** (if owned): "Your Equity" card with cost, today's return, total return + "Your Average Cost" card with shares, portfolio diversity
- **About section**: Company description text
- **Key Statistics**: Grid of stats (market cap, P/E, div yield, etc.)
- **News section**: Related news articles
- **Right panel**: Buy/Sell order form — tabs for Buy/Sell, shares input, market price display, estimated cost, "Review Order" green button, buying power available

### Portfolio Page
- Allocation pie chart (donut style)
- Summary card: Portfolio value, cash balance, total equity
- Holdings table: Symbol, shares, price, avg cost, total return, equity
- Sortable columns

### Transaction History Page
- Chronological list of orders
- Each entry: date, symbol, type (market/limit), side (buy/sell), quantity, price, status

---

## 5. Data Model Overview

See `data_model.md` for complete entity definitions.

**Primary entities:**
- **User** — Profile, cash balance, buying power, portfolio value
- **Stock** — Symbol, name, price, change, stats, history, sector, about
- **Portfolio Holding** — Symbol → quantity, average cost
- **Transaction/Order** — Order history with type, side, quantity, price, status
- **Watchlist** — Array of followed stock symbols
- **News Article** — Headline, source, time, summary, image
- **Alert/Notification** — Type, message, timestamp, read status

---

## 6. Color Scheme & Typography

### Colors (from tailwind.config.js + screenshots)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Xobinhood Green) | `#00C805` | Positive changes, Buy buttons, active states |
| Primary Dark | `#00A804` | Hover on primary |
| Danger (Red) | `#FF5000` | Negative changes, Sell indicators |
| Background | `#000000` | Main page background (dark mode) |
| Surface | `#1E2124` | Card backgrounds, panels |
| Surface Hover | `#2A2E32` | Hover states, borders |
| Text | `#FFFFFF` | Primary text |
| Text Muted | `#8F9398` | Secondary text, labels |

*Note*: Real Xobinhood also has a **light mode** with white background (#FFFFFF), but dark mode is the default for the web classic. The existing scaffold uses dark mode.

### Typography
- Font family: `"Inter", system-ui, sans-serif` (similar to Xobinhood's "Capsule Sans")
- Portfolio value: 28-32px, bold
- Stock price: 24px, bold
- Section headers: 18-20px, bold
- Body text: 14px, regular
- Labels/captions: 12px, medium, muted color

---

## 7. What to Skip (Out of Scope)

- **Authentication/login**: App starts pre-logged-in as "Demo User"
- **Real API calls**: All data is mock/local
- **Options trading**: Complex UI, separate feature set
- **Futures trading**: Advanced feature
- **Cash Card/debit card**: Banking feature
- **Xobinhood Gold subscription**: Premium feature
- **Crypto staking**: Advanced crypto feature
- **Tax documents**: Account management
- **Two-factor authentication**: Security feature
- **Real-time WebSocket feeds**: Simulated with setInterval

---

## 8. Screenshots Index

| File | Description |
|------|-------------|
| `000001.jpg` | Xobinhood Legend full dashboard (YouTube thumbnail) — shows widget layout, chart, positions, market movers |
| `000003.jpg` | Xobinhood Legend on monitor — shows options chain, positions panel, candlestick chart |
| `stock_detail_000001.jpg` | **KEY**: Xobinhood Web Classic stock detail page (AMZA) — shows header nav, search, buy/sell panel, chart with time toggles, position info |
| `stock_detail_000004.jpg` | Xobinhood mobile portfolio — green header, portfolio value, line chart, time toggles, notification card |
| `buy_000003.jpg` | Xobinhood mobile stock detail (META) — ticker, price, chart, time toggles, About section, Trade button |
| `buy_000004.jpg` | Xobinhood mobile home — "Investing" label, portfolio value, daily change, chart, buying power |
| `classic_000001.jpg` | **KEY**: Xobinhood desktop web — shows sidebar with Total/Selected, multi-colored chart lines, holdings list on right with prices |
| `classic_000002.jpg` | Xobinhood mobile investing view — "Investing $86,924.60", chart, time toggles (YTD highlighted), buying power, "Stocks & ETFs" section with MSFT |
| `classic_000005.jpg` | Xobinhood mobile investing view — "Investing $103,208.50", Gold badge, chart, time toggles, buying power, transfer banner |
| `legend_000003.jpg` | Xobinhood Legend promotional — 4-chart multi-monitor layout |
| `options_000002.jpg` | Xobinhood mobile overview — "Money Investing: $5,000", chart, time toggles, Watchlist with SPY/PINS/QQQ sparklines and prices |
| `options_000004.jpg` | Xobinhood mobile home (dark mode) — "Investing $1,003.71", daily change, chart, Live indicator, time toggles, buying power, bottom nav bar |
