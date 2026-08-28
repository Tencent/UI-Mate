# Xobinhood Mock — Data Model

> This document defines all entity types for `dataManager.js` / `mockData.js`.
> The dev agent should use this as the canonical reference for `createInitialData()`.

---

## Entity: User

The logged-in user. App starts pre-authenticated as this user.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"user_1"` | Unique user identifier |
| `name` | string | `"Alex Johnson"` | Display name |
| `email` | string | `"alex.johnson@email.com"` | Email address |
| `cashBalance` | number | `25000.00` | Cash available in account |
| `buyingPower` | number | `25000.00` | Available buying power (may differ from cash if margin) |
| `portfolioValue` | number | `47832.50` | Current total market value of all holdings |
| `accountType` | string | `"Individual"` | Account type label |
| `joinDate` | string | `"2021-03-15"` | Account creation date |
| `goldMember` | boolean | `false` | Whether user has Xobinhood Gold |

---

## Entity: Stock

A tradeable security (stock or ETF). Each stock has price data, key stats, and historical data for charts.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"AAPL"` | Unique ID (same as symbol) |
| `symbol` | string | `"AAPL"` | Ticker symbol |
| `name` | string | `"Apple Inc."` | Full company name |
| `currentPrice` | number | `178.72` | Current/last price |
| `prevClose` | number | `175.50` | Previous day close price |
| `change` | number | `3.22` | Dollar change from prevClose |
| `changePercent` | number | `1.83` | Percentage change from prevClose |
| `open` | number | `176.00` | Today's opening price |
| `high` | number | `179.50` | Today's high |
| `low` | number | `175.20` | Today's low |
| `volume` | number | `54000000` | Today's trading volume |
| `avgVolume` | number | `62000000` | Average daily volume (30-day) |
| `marketCap` | number | `2800000000000` | Market capitalization |
| `peRatio` | number | `29.5` | Price-to-earnings ratio |
| `dividendYield` | number | `0.55` | Dividend yield (%) — 0 if none |
| `week52High` | number | `199.62` | 52-week high price |
| `week52Low` | number | `143.90` | 52-week low price |
| `about` | string | `"Apple Inc. designs..."` | Company description paragraph |
| `sector` | string | `"Technology"` | Sector classification |
| `employees` | number | `164000` | Number of employees |
| `headquarters` | string | `"Cupertino, CA"` | HQ location |
| `founded` | number | `1976` | Year founded |
| `ceo` | string | `"Tim Cook"` | CEO name |
| `tags` | string[] | `["Technology", "Consumer Electronics"]` | Category tags displayed on stock detail |
| `analystRating` | object | see below | Analyst consensus |
| `earnings` | object | see below | Earnings data |
| `history` | object[] | see below | Price history for charts |

### Sub-object: `analystRating`

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `buy` | number | `28` | Number of buy ratings |
| `hold` | number | `8` | Number of hold ratings |
| `sell` | number | `2` | Number of sell ratings |
| `priceTarget` | number | `195.00` | Consensus price target |

### Sub-object: `earnings`

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `nextDate` | string | `"2025-04-24"` | Next earnings report date |
| `epsEstimate` | number | `1.62` | Estimated EPS |
| `revenueEstimate` | string | `"$94.2B"` | Estimated revenue |

### Sub-object: `history` (array of price points)

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `date` | string | `"2025-03-10"` | Date of data point |
| `price` | number | `175.43` | Closing price at date |
| `volume` | number | `52000000` | Volume on that date |

History arrays should be generated for multiple time periods. The `generateHistoricalData()` function in `utils.js` creates these.

---

## Entity: Portfolio Holding

Map of `symbol` → holding data. Stored as `portfolio: { [symbol]: HoldingData }`.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `quantity` | number | `15.5` | Number of shares owned (can be fractional) |
| `avgPrice` | number | `165.30` | Average cost basis per share |

Derived values (computed in components, not stored):
- `currentValue = quantity * stock.currentPrice`
- `totalReturn = currentValue - (quantity * avgPrice)`
- `todayReturn = quantity * stock.change`
- `returnPercent = (totalReturn / (quantity * avgPrice)) * 100`

---

## Entity: Transaction (Order History)

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"txn_1710234567890"` | Unique transaction ID |
| `date` | string (ISO) | `"2025-03-10T14:30:00Z"` | Order execution timestamp |
| `symbol` | string | `"AAPL"` | Stock symbol |
| `name` | string | `"Apple Inc."` | Company name (denormalized for display) |
| `type` | string | `"market"` | Order type: `"market"`, `"limit"`, `"stop"`, `"stop_limit"` |
| `side` | string | `"buy"` | Order side: `"buy"` or `"sell"` |
| `quantity` | number | `10` | Number of shares |
| `price` | number | `175.43` | Execution price per share |
| `totalAmount` | number | `1754.30` | Total order value |
| `status` | string | `"filled"` | Order status: `"filled"`, `"pending"`, `"cancelled"`, `"rejected"` |
| `limitPrice` | number\|null | `180.00` | Limit price (for limit/stop_limit orders) |
| `stopPrice` | number\|null | `170.00` | Stop price (for stop/stop_limit orders) |

---

## Entity: Watchlist

Simple array of stock symbols the user follows.

```js
watchlist: ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"]
```

Future enhancement: multiple named watchlists.

---

## Entity: News Article

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | number | `1` | Unique article ID |
| `headline` | string | `"Tech Stocks Rally..."` | Article headline |
| `source` | string | `"MarketWatch"` | Publisher name |
| `time` | string | `"2h ago"` | Relative time string |
| `summary` | string | `"Major technology..."` | 1-2 sentence summary |
| `imageUrl` | string | `"https://picsum.photos/..."` | Thumbnail image URL |
| `relatedSymbols` | string[] | `["AAPL", "MSFT"]` | Stocks mentioned in article |
| `url` | string | `"#"` | Article link (non-functional in mock) |

---

## Entity: Alert / Notification

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"alert_1"` | Unique alert ID |
| `type` | string | `"price_movement"` | Alert type: `"price_movement"`, `"order_filled"`, `"earnings"`, `"dividend"`, `"system"` |
| `title` | string | `"AAPL is up 3.2%"` | Alert title |
| `message` | string | `"Apple Inc. is up..."` | Full alert message |
| `timestamp` | string (ISO) | `"2025-03-10T14:30:00Z"` | When the alert was generated |
| `read` | boolean | `false` | Whether the user has seen it |
| `symbol` | string\|null | `"AAPL"` | Related stock symbol (if any) |

---

## Entity: Crypto (P2 stretch)

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"BTC"` | Crypto symbol |
| `symbol` | string | `"BTC"` | Ticker |
| `name` | string | `"Bitcoin"` | Full name |
| `currentPrice` | number | `67500.00` | Current price |
| `change` | number | `1250.00` | 24h change |
| `changePercent` | number | `1.88` | 24h change % |
| `marketCap` | number | `1320000000000` | Market cap |
| `history` | object[] | (same as stock) | Price history |

---

## `createInitialData()` — Suggested Structure

```js
function createDefaultState() {
  return {
    user: {
      id: 'user_1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      cashBalance: 12450.00,
      buyingPower: 12450.00,
      portfolioValue: 0, // Calculated from holdings
      accountType: 'Individual',
      joinDate: '2021-03-15',
      goldMember: false,
    },

    stocks: [
      // 10-15 realistic stocks with full data (see §Stock)
      // Must include: AAPL, TSLA, NVDA, MSFT, AMZN, GOOGL, META, NFLX, AMD, SPY, QQQ, DIS, COIN, PYPL
    ],

    portfolio: {
      // Pre-existing holdings for the demo user
      'AAPL': { quantity: 15, avgPrice: 165.30 },
      'NVDA': { quantity: 8, avgPrice: 720.50 },
      'MSFT': { quantity: 12, avgPrice: 380.25 },
      'AMZN': { quantity: 20, avgPrice: 155.00 },
      'TSLA': { quantity: 5, avgPrice: 195.80 },
      'SPY': { quantity: 10, avgPrice: 480.00 },
    },

    watchlist: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'NFLX'],

    transactions: [
      // 8-12 realistic past transactions spanning the last 30 days
      // Mix of buys and sells, market and limit orders, all "filled"
    ],

    news: [
      // 6-8 realistic market news articles
      // Mix of market-wide and stock-specific news
    ],

    alerts: [
      // 3-5 recent alerts/notifications
    ],

    lists: {
      // Curated lists for discovery
      topMovers: ['NVDA', 'TSLA', 'AMD', 'COIN'],
      mostPopular: ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA'],
      techStocks: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD'],
    },
  };
}
```

---

## State Diff Tracking

The `calculateStateDiff()` function should compare `initial_state` and `current_state` for the `/go` endpoint. Key fields to track changes on:

1. **user** — cashBalance, buyingPower, portfolioValue changes indicate trading activity
2. **portfolio** — Added/removed/modified holdings
3. **watchlist** — Added/removed symbols
4. **transactions** — New orders placed
5. **alerts** — Read/unread changes

The diff format should be:
```json
{
  "user": { "from": {...}, "to": {...} },
  "portfolio": { "from": {...}, "to": {...} },
  "watchlist": { "from": [...], "to": [...] },
  "transactions": { "new_count": 3 }
}
```
