# XradingView Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity Definitions

### 1. CurrentUser

The pre-logged-in user.

```javascript
{
  id: "user_1",
  username: "TraderJohn",
  displayName: "John Mitchell",
  avatar: null, // Use initials "JM" with blue bg
  email: "john.mitchell@email.com",
  plan: "Premium", // Visual only, no gating
  joinDate: "2021-03-15",
  preferences: {
    theme: "dark",
    timezone: "America/New_York",
    defaultChartType: "Candles",
    defaultTimeframe: "1D",
    showVolume: true,
    logScale: false,
    autoScale: true,
    crosshairStyle: "cross" // "cross" | "dot" | "line"
  }
}
```

### 2. Symbol

A tradeable financial instrument. Includes metadata and current price snapshot.

```javascript
{
  id: "AAPL",                    // String — ticker symbol
  name: "Apple Inc.",            // String — full company/instrument name
  exchange: "NASDAQ",            // String — exchange name
  type: "stock",                 // "stock" | "crypto" | "forex" | "futures" | "index" | "etf" | "bond"
  currency: "USD",               // String — price currency
  logo: null,                    // String | null — URL or emoji/icon identifier
  sector: "Technology",          // String | null — GICS sector
  industry: "Consumer Electronics", // String | null
  description: "Apple Inc. designs, manufactures, and markets smartphones...",  // String
  // Current snapshot (updated by simulated ticking or static)
  price: 189.84,                 // Number — last price
  open: 188.50,                  // Number — today's open
  high: 190.25,                  // Number — today's high
  low: 187.90,                   // Number — today's low
  close: 189.84,                 // Number — previous close (for change calc)
  previousClose: 188.22,         // Number — yesterday's close
  change: 1.62,                  // Number — price change from previous close
  changePercent: 0.86,           // Number — % change
  volume: 54_200_000,            // Number — today's volume
  marketCap: 2_950_000_000_000,  // Number — market capitalization
  pe: 31.2,                      // Number | null — P/E ratio
  eps: 6.08,                     // Number | null — EPS
  dividend: 0.96,                // Number | null — annual dividend per share
  dividendYield: 0.51,           // Number | null — dividend yield %
  week52High: 199.62,            // Number — 52-week high
  week52Low: 143.90,             // Number — 52-week low
  avgVolume: 48_500_000,         // Number — average volume
  beta: 1.29                     // Number | null
}
```

### 3. OHLCV Candle

Individual price bar data for charting. Stored as arrays per symbol per timeframe.

```javascript
{
  time: 1709251200,    // Number — Unix timestamp (seconds)
  open: 188.50,        // Number
  high: 190.25,        // Number
  low: 187.90,         // Number
  close: 189.84,       // Number
  volume: 54200000     // Number
}
```

**Storage pattern**: `candleData[symbolId][timeframe]` = array of candles (sorted by time ascending).

Timeframes: `"1"` (1min), `"5"` (5min), `"15"` (15min), `"60"` (1hour), `"240"` (4hour), `"D"` (daily), `"W"` (weekly), `"M"` (monthly).

### 4. Watchlist

Named collection of symbols organized into optional sections.

```javascript
{
  id: "wl_1",
  name: "My Watchlist",
  isDefault: true,
  sections: [
    {
      id: "sec_1",
      name: null,          // null = default/unsectioned
      symbolIds: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]
    },
    {
      id: "sec_2",
      name: "Crypto",
      symbolIds: ["BTCUSD", "ETHUSD", "SOLUSD"]
    },
    {
      id: "sec_3",
      name: "Forex",
      symbolIds: ["EURUSD", "GBPUSD", "USDJPY"]
    }
  ],
  columns: ["last", "chg", "chgPercent"]  // Visible columns in watchlist
}
```

### 5. Alert

Price/condition alert on a symbol.

```javascript
{
  id: "alert_1",
  symbolId: "AAPL",
  name: "AAPL above 195",         // String — auto-generated or custom name
  condition: "crossing_up",        // "crossing_up" | "crossing_down" | "greater_than" | "less_than" | "entering_channel" | "exiting_channel"
  value: 195.00,                   // Number — target price
  value2: null,                    // Number | null — second value for channel conditions
  source: "price",                 // "price" | indicator name
  status: "active",                // "active" | "triggered" | "paused" | "expired"
  createdAt: "2024-12-01T10:30:00Z",
  triggeredAt: null,               // String | null — ISO date when triggered
  expiresAt: "2025-02-01T10:30:00Z", // String | null
  message: "AAPL reached $195!",   // String — custom alert message
  notifications: {
    popup: true,
    email: true,
    sound: true,
    webhook: false
  },
  frequency: "once"               // "once" | "once_per_bar" | "every_time"
}
```

### 6. Indicator

Technical indicator applied to the chart.

```javascript
{
  id: "ind_1",
  type: "SMA",                    // String — indicator type identifier
  name: "SMA (20)",               // String — display name
  visible: true,
  paneIndex: 0,                   // Number — 0 = main chart pane, 1+ = sub-panes
  inputs: {
    length: 20,                   // Varies by indicator type
    source: "close"               // "close" | "open" | "high" | "low" | "hl2" | "hlc3"
  },
  style: {
    color: "#2962FF",             // String — line color
    lineWidth: 2,                 // Number — 1, 2, 3, 4
    lineStyle: "solid"            // "solid" | "dashed" | "dotted"
  }
}
```

**Common indicator types and their inputs:**

| Type | Name | Inputs | Pane |
|------|------|--------|------|
| SMA | Simple Moving Avg | length, source | main (0) |
| EMA | Exponential Moving Avg | length, source | main (0) |
| BB | Bollinger Bands | length, stdDev, source | main (0) |
| RSI | Relative Strength Index | length, source | sub (1) |
| MACD | MACD | fastLength, slowLength, signalLength, source | sub (2) |
| VOL | Volume | — | sub (special) |
| VWAP | Volume Weighted Avg Price | — | main (0) |
| ATR | Average True Range | length | sub |
| STOCH | Stochastic | kLength, dLength, smooth | sub |

### 7. Drawing

Chart annotation/drawing object.

```javascript
{
  id: "draw_1",
  symbolId: "AAPL",
  timeframe: "D",
  type: "trendline",              // "trendline" | "horizontal_line" | "vertical_line" | "rectangle" | "fibonacci_retracement" | "text" | "arrow"
  points: [
    { time: 1709164800, price: 182.50 },  // Start point
    { time: 1709510400, price: 189.84 }   // End point
  ],
  style: {
    color: "#2962FF",
    lineWidth: 2,
    lineStyle: "solid",           // "solid" | "dashed" | "dotted"
    fillColor: "rgba(41,98,255,0.1)", // For shapes like rectangles
    extendLeft: false,
    extendRight: false,
    showLabel: true
  },
  text: null,                     // String | null — for text annotations
  locked: false,
  visible: true
}
```

### 8. ChartState

Current state of the chart view (per layout).

```javascript
{
  symbolId: "AAPL",
  timeframe: "D",                  // Active timeframe
  chartType: "Candles",            // Active chart type
  indicators: ["ind_1", "ind_2"],  // Array of indicator IDs currently applied
  drawings: ["draw_1", "draw_2"],  // Array of drawing IDs on this chart
  priceScaleMode: "auto",          // "auto" | "lock" | "percentage" | "indexedTo100"
  logScale: false,
  visibleRange: {                  // Current visible time range
    from: 1704067200,              // Unix timestamp
    to: 1709510400
  }
}
```

### 9. ScreenerData

Row data for the stock screener table.

```javascript
{
  // Each row is a Symbol object (see §2) with these additional screener fields:
  weeklyPerf: 2.15,               // Number — weekly % performance
  monthlyPerf: -1.30,             // Number — monthly % performance
  threeMonthPerf: 8.45,           // Number — 3-month % performance
  sixMonthPerf: 15.20,            // Number — 6-month % performance
  ytdPerf: 12.80,                 // Number — year-to-date % performance
  yearlyPerf: 35.60,              // Number — 1-year % performance
  revenueGrowth: 8.1,             // Number — revenue growth %
  epsGrowth: 12.5,                // Number — EPS growth %
  grossMargin: 45.6,              // Number — gross margin %
  operatingMargin: 30.2,          // Number — operating margin %
  debtToEquity: 1.87,             // Number — D/E ratio
  roe: 171.0,                     // Number — return on equity %
  rsi14: 58.3,                    // Number — 14-period RSI
  sma20: 188.50,                  // Number — 20-day SMA
  sma50: 185.20,                  // Number — 50-day SMA
  sma200: 178.30,                 // Number — 200-day SMA
  recommendation: "Buy"           // "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell"
}
```

### 10. NewsItem

Market news headline.

```javascript
{
  id: "news_1",
  title: "Apple Reports Record Q4 Revenue",
  source: "Reuters",
  timestamp: "2024-12-15T14:30:00Z",
  relatedSymbols: ["AAPL"],
  url: "#",                       // Non-functional link
  category: "earnings"            // "earnings" | "market" | "economy" | "crypto" | "forex" | "analysis"
}
```

### 11. EconomicEvent

Calendar economic data release.

```javascript
{
  id: "econ_1",
  date: "2024-12-18",
  time: "14:00",
  country: "US",                  // ISO 2-letter country code
  countryFlag: "🇺🇸",
  event: "Fed Interest Rate Decision",
  impact: "high",                 // "low" | "medium" | "high"
  forecast: "4.50%",              // String — formatted
  previous: "4.75%",
  actual: null                    // String | null — null if not yet released
}
```

### 12. Layout

Saved chart configuration.

```javascript
{
  id: "layout_1",
  name: "Default",
  isDefault: true,
  gridConfig: "1x1",             // "1x1" | "2x1" | "1x2" | "2x2" | "3x1"
  charts: [
    {
      symbolId: "AAPL",
      timeframe: "D",
      chartType: "Candles",
      indicators: ["ind_1"],
      drawings: ["draw_1"]
    }
  ],
  createdAt: "2024-06-01T00:00:00Z",
  updatedAt: "2024-12-15T10:00:00Z"
}
```

---

## Relationships

```
CurrentUser
  └── has many Watchlists
  └── has many Alerts
  └── has many Layouts
  └── has preferences

Watchlist
  └── has many Sections
      └── each Section references many Symbols (by ID)

Symbol
  └── has OHLCV candle data (per timeframe)
  └── has screener metrics

ChartState (per layout pane)
  └── references one Symbol
  └── references many Indicators
  └── references many Drawings

Alert
  └── references one Symbol

Drawing
  └── belongs to one Symbol + timeframe

NewsItem
  └── references many Symbols

EconomicEvent
  └── standalone (no symbol reference)
```

---

## createInitialData() Structure

```javascript
export const createInitialData = () => ({
  // User
  currentUser: { /* see §1 */ },

  // Market data
  symbols: {
    "AAPL": { /* Symbol object */ },
    "MSFT": { /* ... */ },
    "GOOGL": { /* ... */ },
    "AMZN": { /* ... */ },
    "NVDA": { /* ... */ },
    "TSLA": { /* ... */ },
    "META": { /* ... */ },
    "BTCUSD": { /* ... */ },
    "ETHUSD": { /* ... */ },
    "SOLUSD": { /* ... */ },
    "EURUSD": { /* ... */ },
    "GBPUSD": { /* ... */ },
    "USDJPY": { /* ... */ },
    "SPX": { /* S&P 500 Index */ },
    "DJI": { /* Dow Jones */ },
    "IXIC": { /* NASDAQ Composite */ },
    "GC1!": { /* Gold Futures */ },
    "CL1!": { /* Crude Oil Futures */ },
    // ~20-30 symbols total
  },

  // OHLCV data — pre-generated candle arrays
  // Only generate daily ("D") and maybe 1h ("60") for the default symbol
  candleData: {
    "AAPL": {
      "D": [ /* ~250 daily candles = ~1 year */ ],
      "60": [ /* ~500 hourly candles = ~3 weeks */ ]
    },
    // Other symbols: generate on-demand or provide ~100 daily candles each
  },

  // Watchlists
  watchlists: [
    {
      id: "wl_1",
      name: "My Watchlist",
      isDefault: true,
      sections: [
        { id: "sec_1", name: null, symbolIds: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"] },
        { id: "sec_2", name: "Crypto", symbolIds: ["BTCUSD", "ETHUSD", "SOLUSD"] },
        { id: "sec_3", name: "Forex", symbolIds: ["EURUSD", "GBPUSD", "USDJPY"] }
      ],
      columns: ["last", "chg", "chgPercent"]
    },
    {
      id: "wl_2",
      name: "Tech Watchlist",
      isDefault: false,
      sections: [
        { id: "sec_4", name: null, symbolIds: ["AAPL", "MSFT", "GOOGL", "NVDA", "AMD", "INTC"] }
      ],
      columns: ["last", "chg", "chgPercent"]
    }
  ],

  // Alerts
  alerts: [
    { id: "alert_1", symbolId: "AAPL", name: "AAPL above 195", condition: "crossing_up", value: 195, status: "active", /* ... */ },
    { id: "alert_2", symbolId: "BTCUSD", name: "BTC below 60000", condition: "crossing_down", value: 60000, status: "active", /* ... */ },
    { id: "alert_3", symbolId: "TSLA", name: "TSLA reached 250", condition: "crossing_up", value: 250, status: "triggered", triggeredAt: "2024-12-10T15:30:00Z", /* ... */ }
  ],

  // Indicators currently applied to chart
  indicators: [
    { id: "ind_1", type: "SMA", name: "SMA (20)", paneIndex: 0, inputs: { length: 20, source: "close" }, style: { color: "#2962FF", lineWidth: 2, lineStyle: "solid" }, visible: true },
    { id: "ind_2", type: "EMA", name: "EMA (50)", paneIndex: 0, inputs: { length: 50, source: "close" }, style: { color: "#FF6D00", lineWidth: 2, lineStyle: "solid" }, visible: true },
    { id: "ind_3", type: "VOL", name: "Volume", paneIndex: 1, inputs: {}, style: { color: "#26A69A", lineWidth: 1, lineStyle: "solid" }, visible: true }
  ],

  // Drawings on chart
  drawings: [
    { id: "draw_1", symbolId: "AAPL", timeframe: "D", type: "horizontal_line", points: [{ time: null, price: 195.00 }], style: { color: "#EF5350", lineWidth: 1, lineStyle: "dashed" }, visible: true, text: "Resistance" },
    { id: "draw_2", symbolId: "AAPL", timeframe: "D", type: "trendline", points: [{ time: 1707264000, price: 182.50 }, { time: 1709510400, price: 189.84 }], style: { color: "#26A69A", lineWidth: 2, lineStyle: "solid" }, visible: true }
  ],

  // Chart state
  chartState: {
    symbolId: "AAPL",
    timeframe: "D",
    chartType: "Candles",
    indicators: ["ind_1", "ind_2", "ind_3"],
    drawings: ["draw_1", "draw_2"],
    priceScaleMode: "auto",
    logScale: false,
    visibleRange: null  // null = show latest data
  },

  // Layouts
  layouts: [
    { id: "layout_1", name: "Default", isDefault: true, gridConfig: "1x1", charts: [{ symbolId: "AAPL", timeframe: "D", chartType: "Candles" }] }
  ],

  // Screener data — array of symbol IDs to show in screener (references symbols object)
  screenerSymbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK.B", "JPM", "V", "JNJ", "WMT", "PG", "MA", "HD", "DIS", "BAC", "XOM", "PFE", "KO"],

  // News
  news: [
    { id: "news_1", title: "Apple Reports Record Q4 Revenue, Stock Jumps 3%", source: "Reuters", timestamp: "2024-12-15T14:30:00Z", relatedSymbols: ["AAPL"], category: "earnings" },
    { id: "news_2", title: "Fed Holds Rates Steady, Signals Cuts Coming in 2025", source: "Bloomberg", timestamp: "2024-12-15T19:00:00Z", relatedSymbols: ["SPX", "DJI"], category: "economy" },
    { id: "news_3", title: "Bitcoin Surges Past $100K as Institutional Demand Grows", source: "CoinDesk", timestamp: "2024-12-15T08:45:00Z", relatedSymbols: ["BTCUSD"], category: "crypto" },
    { id: "news_4", title: "NVIDIA Unveils Next-Gen AI Chips at Annual Conference", source: "CNBC", timestamp: "2024-12-14T16:00:00Z", relatedSymbols: ["NVDA"], category: "market" },
    { id: "news_5", title: "Tesla Cybertruck Deliveries Exceed Expectations", source: "MarketWatch", timestamp: "2024-12-14T12:15:00Z", relatedSymbols: ["TSLA"], category: "market" },
    // 10-15 total news items
  ],

  // Economic Calendar
  economicEvents: [
    { id: "econ_1", date: "2024-12-18", time: "14:00", country: "US", countryFlag: "🇺🇸", event: "Fed Interest Rate Decision", impact: "high", forecast: "4.50%", previous: "4.75%", actual: null },
    { id: "econ_2", date: "2024-12-19", time: "07:00", country: "GB", countryFlag: "🇬🇧", event: "BoE Interest Rate Decision", impact: "high", forecast: "4.75%", previous: "4.75%", actual: null },
    { id: "econ_3", date: "2024-12-20", time: "08:30", country: "US", countryFlag: "🇺🇸", event: "GDP (QoQ) Q3 Final", impact: "medium", forecast: "2.8%", previous: "3.0%", actual: null },
    { id: "econ_4", date: "2024-12-20", time: "08:30", country: "US", countryFlag: "🇺🇸", event: "Core PCE Price Index (MoM)", impact: "high", forecast: "0.2%", previous: "0.3%", actual: null },
    { id: "econ_5", date: "2024-12-23", time: "10:00", country: "US", countryFlag: "🇺🇸", event: "Consumer Confidence", impact: "medium", forecast: "113.0", previous: "111.7", actual: null },
    // 10-15 total events spanning ~2 weeks
  ],

  // UI State
  uiState: {
    activeRightPanel: null,         // null | "watchlist" | "alerts" | "details" | "news" | "calendar" | "hotlists"
    activeBottomPanel: null,        // null | "screener" | "pine_editor" | "strategy_tester" | "text_notes"
    bottomPanelHeight: 200,
    rightPanelWidth: 320,
    selectedDrawingTool: null,      // null | "cursor" | "crosshair" | "trendline" | "horizontal_line" | "vertical_line" | "rectangle" | "fibonacci" | "text"
    cursorMode: "crosshair",       // "crosshair" | "pointer" | "dot"
    screenerFilter: {
      tab: "overview",              // "overview" | "performance" | "valuation" | "dividends" | "margins" | "income_statement" | "balance_sheet" | "oscillators"
      sortBy: "marketCap",
      sortDir: "desc",
      filters: {}                  // Object of active filter conditions
    }
  }
});
```

---

## Mock Data Generation Notes

### Candle Data Generation

For generating realistic OHLCV candle data, use a simple random walk with volatility:

```javascript
function generateCandles(basePrice, count, timeframe) {
  const candles = [];
  let price = basePrice;
  const volatility = basePrice * 0.02; // 2% daily volatility
  let time = Date.now() / 1000 - count * timeframeToSeconds(timeframe);

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * volatility; // Slight upward bias
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(30_000_000 + Math.random() * 40_000_000);

    candles.push({
      time: Math.floor(time),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      volume
    });

    price = close;
    time += timeframeToSeconds(timeframe);
  }
  return candles;
}
```

### Symbol Count Targets
- **Stocks**: 15-20 (major US tech + blue chips)
- **Crypto**: 3-5 (BTC, ETH, SOL, BNB, ADA)
- **Forex**: 3-5 (EUR/USD, GBP/USD, USD/JPY, AUD/USD)
- **Indices**: 3 (S&P 500, Dow Jones, NASDAQ)
- **Futures**: 2 (Gold, Crude Oil)
- **Total**: ~25-30 symbols
