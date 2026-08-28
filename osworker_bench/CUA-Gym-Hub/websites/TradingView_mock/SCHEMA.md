# TradingView_mock Schema

**Deploy order**: 48 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8048)
**Base URL**: `http://172.17.46.46:8048/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | redirect | Redirects to `/chart` (preserves query params) |
| `/chart` | `ChartLayout` | Main charting interface |
| `/chart/:symbolId` | `ChartLayout` | Chart for specific symbol |
| `/go` | `Go` | State inspection endpoint (JSON) |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user profile and preferences. See **CurrentUser** below. |
| `symbols` | object | Map of symbol ID → symbol data. Keys are ticker strings. See **Symbol** below. |
| `candleData` | object | Map of symbol ID → timeframe → candle array. See **CandleData** below. |
| `watchlists` | array | User's watchlists. Each: see **Watchlist** below. |
| `alerts` | array | Price alerts. Each: see **Alert** below. |
| `indicators` | array | Active chart indicators. Each: see **Indicator** below. |
| `drawings` | array | Chart drawing objects. Each: see **Drawing** below. |
| `chartState` | object | Current chart configuration. See **ChartState** below. |
| `layouts` | array | Saved chart layouts. Each: see **Layout** below. |
| `screenerSymbols` | array | Array of symbol ID strings included in the stock screener. |
| `news` | array | Market news items. Each: see **NewsItem** below. |
| `economicEvents` | array | Economic calendar events. Each: see **EconomicEvent** below. |
| `uiState` | object | UI panel states and settings. See **UIState** below. |

---

### CurrentUser

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"user_1"` | User identifier |
| `username` | string | `"TraderJohn"` | Display username |
| `displayName` | string | `"John Mitchell"` | Full display name |
| `avatar` | string\|null | `null` | Avatar URL (null = no avatar) |
| `email` | string | `"john.mitchell@email.com"` | User email |
| `plan` | string | `"Premium"` | Subscription plan |
| `joinDate` | string | `"2021-03-15"` | ISO date when user joined |
| `preferences` | object | see below | User preferences. See **Preferences**. |

#### Preferences

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | string | `"dark"` | Color theme |
| `timezone` | string | `"America/New_York"` | User timezone. Valid values: `"UTC"`, `"America/New_York"`, `"America/Chicago"`, `"America/Los_Angeles"`, `"Europe/London"`, `"Europe/Berlin"`, `"Europe/Moscow"`, `"Asia/Dubai"`, `"Asia/Kolkata"`, `"Asia/Shanghai"`, `"Asia/Tokyo"`, `"Australia/Sydney"` |
| `defaultChartType` | string | `"Candles"` | Default chart type |
| `defaultTimeframe` | string | `"D"` | Default timeframe |
| `showVolume` | boolean | `true` | Show volume on chart |
| `logScale` | boolean | `false` | Logarithmic price scale |
| `autoScale` | boolean | `true` | Auto-fit price scale |
| `crosshairStyle` | string | `"cross"` | Crosshair style |
| `upCandleColor` | string | `"#26A69A"` | Up candle body color (editable in Chart Settings modal → Symbol tab) |
| `downCandleColor` | string | `"#EF5350"` | Down candle body color (editable in Chart Settings modal → Symbol tab) |
| `upWickColor` | string | `"#26A69A"` | Up candle wick color (editable in Chart Settings modal → Symbol tab) |
| `downWickColor` | string | `"#EF5350"` | Down candle wick color (editable in Chart Settings modal → Symbol tab) |
| `showOHLC` | boolean | `true` | Show OHLC values in status line |
| `showChange` | boolean | `true` | Show change % in status line |
| `percentageMode` | boolean | `false` | Percentage mode price scale. Toggled by clicking the `%` button in the status bar. Persists to state. |
| `chartBg` | string | `"#131722"` | Chart background color |
| `showGrid` | boolean | `true` | Show grid lines |

---

### Symbol

Keyed by symbol ID string (e.g. `"AAPL"`, `"BTCUSD"`, `"EURUSD"`, `"SPX"`, `"GC1!"`).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique symbol identifier / ticker (e.g. `"AAPL"`) |
| `name` | string | required | Full name (e.g. `"Apple Inc."`) |
| `exchange` | string | required | Exchange name: `"NASDAQ"`, `"NYSE"`, `"Crypto"`, `"Forex"`, `"INDEX"`, `"COMEX"`, `"NYMEX"` |
| `type` | string | required | Asset type: `"stock"`, `"crypto"`, `"forex"`, `"index"`, `"futures"` |
| `currency` | string | `"USD"` | Quote currency |
| `sector` | string\|null | varies | Sector (stocks only, null for crypto/forex/index/futures) |
| `industry` | string\|null | varies | Industry (stocks only) |
| `description` | string | `""` | Company/asset description |
| `price` | number | required | Current price |
| `open` | number | required | Day's opening price |
| `high` | number | required | Day's high price |
| `low` | number | required | Day's low price |
| `close` | number | required | Day's closing price |
| `previousClose` | number | required | Previous closing price |
| `change` | number | `0` | Price change from previous close |
| `changePercent` | number | `0` | Percentage change from previous close |
| `volume` | number | `0` | Trading volume (0 for forex/indices) |
| `marketCap` | number\|null | varies | Market capitalization (null for forex/futures) |
| `pe` | number\|null | varies | Price-to-earnings ratio |
| `eps` | number\|null | varies | Earnings per share |
| `dividend` | number\|null | varies | Annual dividend amount |
| `dividendYield` | number\|null | varies | Dividend yield percentage |
| `week52High` | number | required | 52-week high price |
| `week52Low` | number | required | 52-week low price |
| `avgVolume` | number | `0` | Average trading volume |
| `beta` | number\|null | varies | Beta coefficient |
| `weeklyPerf` | number | `0` | 1-week performance % |
| `monthlyPerf` | number | `0` | 1-month performance % |
| `threeMonthPerf` | number | `0` | 3-month performance % |
| `sixMonthPerf` | number | `0` | 6-month performance % |
| `ytdPerf` | number | `0` | Year-to-date performance % |
| `yearlyPerf` | number | `0` | 1-year performance % |
| `grossMargin` | number\|null | varies | Gross margin % |
| `operatingMargin` | number\|null | varies | Operating margin % |
| `debtToEquity` | number\|null | varies | Debt-to-equity ratio |
| `roe` | number\|null | varies | Return on equity % |
| `rsi14` | number\|null | varies | RSI (14-period) |
| `recommendation` | string\|null | varies | Analyst recommendation: `"Strong Buy"`, `"Buy"`, `"Neutral"` |

**Default symbols** (27 total):

| Category | Symbol IDs |
|----------|-----------|
| Stocks (15) | `AAPL`, `MSFT`, `GOOGL`, `AMZN`, `NVDA`, `TSLA`, `META`, `BRK.B`, `JPM`, `V`, `JNJ`, `WMT`, `PG`, `HD`, `DIS` |
| Crypto (4) | `BTCUSD`, `ETHUSD`, `SOLUSD`, `BNBUSD` |
| Forex (4) | `EURUSD`, `GBPUSD`, `USDJPY`, `AUDUSD` |
| Indices (3) | `SPX`, `DJI`, `IXIC` |
| Futures (2) | `GC1!` (Gold), `CL1!` (Crude Oil) |

---

### CandleData

Nested map: `{ [symbolId]: { [timeframe]: Candle[] } }`

Each **Candle** object:

| Field | Type | Description |
|-------|------|-------------|
| `time` | number | Unix timestamp in seconds |
| `open` | number | Opening price |
| `high` | number | High price |
| `low` | number | Low price |
| `close` | number | Closing price |
| `volume` | number | Volume |

Candle data is generated on-demand. Default initial data includes daily (`"D"`) candles (approximately 300 bars) for all symbols, plus hourly (`"60"`) candles for `AAPL` (500 bars). When a symbol/timeframe combination is requested that does not yet exist, it is generated via `generateCandles()` and added to state.

**Available timeframes**: `"1"` (1m), `"3"` (3m), `"5"` (5m), `"10"` (10m), `"15"` (15m), `"30"` (30m), `"60"` (1h), `"120"` (2h), `"240"` (4h), `"360"` (6h), `"720"` (12h), `"D"` (daily), `"W"` (weekly), `"M"` (monthly)

---

### Watchlist

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique ID (e.g. `"wl_1"`) |
| `name` | string | required | Display name (e.g. `"My Watchlist"`) |
| `isDefault` | boolean | `false` | Whether this is the default watchlist |
| `sections` | array | `[]` | Array of **WatchlistSection** objects |
| `columns` | array | `["last","chg","chgPercent"]` | Visible column keys |

#### WatchlistSection

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique section ID (e.g. `"sec_1"`) |
| `name` | string\|null | `null` | Section header name (null = unnamed/default section) |
| `symbolIds` | array | `[]` | Array of symbol ID strings in this section |

**Default watchlists** (2):

1. `wl_1` "My Watchlist" (default) with sections:
   - `sec_1` (unnamed): `AAPL`, `MSFT`, `GOOGL`, `AMZN`, `NVDA`, `TSLA`, `META`
   - `sec_2` "Crypto": `BTCUSD`, `ETHUSD`, `SOLUSD`
   - `sec_3` "Forex": `EURUSD`, `GBPUSD`, `USDJPY`
2. `wl_2` "Tech Watchlist": `AAPL`, `MSFT`, `GOOGL`, `NVDA`, `META`

**Watchlist panel interactions:**
- Clicking a symbol row switches `chartState.symbolId` to that symbol.
- The "More Options" (⋯) button opens a sort menu: sort by Ticker (A-Z), Ticker (Z-A), Last Price (High→Low), Last Price (Low→High), Change % (High→Low), Change % (Low→High). Sort is applied in the UI only (not persisted to state).
- Symbol right-click context menu: "Set as default" (switches chart symbol), "Add Alert" (switches to symbol and opens alerts panel), "Symbol Info" (switches to symbol and opens details panel), "Remove from watchlist" (removes symbol from watchlist section via `removeFromWatchlist`).
- The watchlist selector dropdown (showing current watchlist name) allows switching between watchlists.
- Symbol search bar: typing searches across all symbols; clicking a result adds the symbol via `addToWatchlist`.

---

### Alert

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | generated | Unique alert ID (e.g. `"alert_1"`, generated as `"alert_${Date.now()}"`) |
| `symbolId` | string | required | Symbol the alert is for |
| `name` | string | required | Display name (e.g. `"AAPL above 240"`) |
| `condition` | string | required | Condition type: `"crossing_up"`, `"crossing_down"`, `"greater_than"`, `"less_than"`, `"entering_channel"`, `"exiting_channel"` |
| `value` | number | required | Target price value |
| `value2` | number\|null | `null` | Second value (for channel conditions) |
| `source` | string | `"price"` | Alert source |
| `status` | string | `"active"` | Alert status: `"active"`, `"triggered"`, `"paused"` |
| `createdAt` | string | dynamic ISO timestamp | When the alert was created. Default alerts use relative timestamps (e.g. `Date.now() - N * 86400000`). |
| `triggeredAt` | string\|null | `null` | When the alert was triggered (null if not triggered) |
| `expiresAt` | string | dynamic ISO timestamp | When the alert expires. Default alerts use relative timestamps (e.g. `Date.now() + N * 86400000`). |
| `message` | string | `""` | Custom alert message |
| `notifications` | object | see below | Notification channels |
| `frequency` | string | `"once"` | Trigger frequency |

#### Alert Notifications

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `popup` | boolean | `true` | Show popup notification |
| `email` | boolean | `true` | Send email notification |
| `sound` | boolean | `true` | Play sound notification |
| `webhook` | boolean | `false` | Trigger webhook |

**Default alerts** (5): `alert_1` through `alert_5` for AAPL, BTCUSD, TSLA, NVDA, and EURUSD.

**Alert panel interactions:**
- **Create Alert** (+ button in panel header): Opens the `AlertFormModal` dialog with empty fields.
- **Edit Alert** (right-click context menu → "Edit"): Opens `AlertFormModal` pre-populated with the selected alert's data. Saving calls `updateState` to replace the alert in the `alerts` array.
- **Pause/Resume**: Toggles alert `status` between `"active"` and `"paused"` via `updateState`.
- **Delete alert**: Calls `removeAlert(id)` to remove a specific alert.
- **More options** (⋯ button): Menu with "Remove triggered alerts" (deletes all `status === "triggered"` alerts) and "Remove all alerts" (clears the entire `alerts` array).

#### AlertFormModal Fields

The create/edit modal form includes:
- Symbol selector (defaults to current `chartState.symbolId`)
- Condition dropdown: `"crossing_up"`, `"crossing_down"`, `"greater_than"`, `"less_than"`
- Value input (number)
- Alert name input (text)
- Message input (text)
- Expiration select: `"1 hour"`, `"4 hours"`, `"1 day"`, `"1 week"`, `"1 month"`, `"open-ended"`
- Notifications checkboxes: popup, email, sound, webhook

On submit, a new alert is added via `addAlert({ symbolId, condition, value, name, message, expiresAt, notifications })`.

---

### Indicator

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | generated | Unique ID (e.g. `"ind_1"`, generated as `"ind_${Date.now()}"`) |
| `type` | string | required | Indicator type. Built-in: `"SMA"`, `"EMA"`, `"BB"`, `"RSI"`, `"MACD"`, `"VOL"`, `"VWAP"`, `"ATR"`, `"STOCH"`. Community: `"COMMUNITY_MACD_ADV"`, `"COMMUNITY_SUPERTREND"`, `"COMMUNITY_PIVOTS"` |
| `name` | string | required | Display name (e.g. `"SMA (20)"`, `"Volume"`) |
| `visible` | boolean | `true` | Whether indicator is visible |
| `paneIndex` | number | `0` | Pane: `0` = overlay on main chart, `1` = separate sub-pane |
| `inputs` | object | varies | Indicator parameters. See below. |
| `style` | object | see below | Visual style. See **IndicatorStyle**. |
| `category` | string\|undefined | `undefined` | Category for community indicators: `"community"`. Absent for built-in indicators. |

#### Indicator Inputs (by type)

| Type | Inputs | Calculation |
|------|--------|-------------|
| `SMA` | `{length: 20, source: "close"}` | Simple moving average |
| `EMA` | `{length: 50, source: "close"}` | Exponential moving average |
| `BB` | `{length: 20, stdDev: 2}` | Bollinger Bands (upper/middle/lower lines, real SMA + std dev calculation) |
| `RSI` | `{length: 14, source: "close"}` | Relative Strength Index (Wilder smoothing) |
| `MACD` | `{fast: 12, slow: 26, signal: 9}` | MACD (real EMA-based: EMA(fast) − EMA(slow), with signal EMA) |
| `VOL` | `{}` | Volume histogram |
| `VWAP` | `{}` | VWAP (real: cumulative (typical price × volume) / cumulative volume) |
| `ATR` | `{length: 14}` | Average True Range (Wilder smoothing on true range) |
| `STOCH` | `{kLength: 14, dSmooth: 3}` | Stochastic Oscillator (real %K = (close − lowest low) / (highest high − lowest low) × 100) |

**Note on BB rendering**: Bollinger Bands render as three separate line series: upper band, middle band (SMA), and lower band. Each receives the series ID `{ind.id}_upper`, `{ind.id}_middle`, `{ind.id}_lower` respectively.

#### IndicatorStyle

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | string | varies | Line color hex (e.g. `"#2962FF"`) |
| `lineWidth` | number | `2` | Line width in pixels |
| `lineStyle` | string | `"solid"` | Line style: `"solid"` or `"dashed"` |

**Default indicators** (3):
1. `ind_1` SMA (20) - blue `#2962FF`, paneIndex 0
2. `ind_2` EMA (50) - orange `#FF6D00`, paneIndex 0
3. `ind_3` Volume - green `#26A69A`, paneIndex 1

**Indicator categories** (in Indicators modal):
- `"All"` — all built-in + community indicators
- `"Moving Averages"` — SMA, EMA
- `"Oscillators"` — RSI, MACD, STOCH
- `"Volume"` — Volume, VWAP
- `"Volatility"` — BB, ATR
- `"Favorites"` — indicators whose `type` string is in `uiState.favoriteIndicators`
- `"Community Scripts"` — indicators with `category === "community"` (MACD Advanced, Supertrend, Pivot Points)

**Favorite indicators**: Clicking the star (☆/★) icon next to any indicator in the modal toggles it in `uiState.favoriteIndicators`. The Favorites category shows only starred indicators.

---

### Drawing

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | generated | Unique ID (e.g. `"draw_1"`, generated as `"draw_${Date.now()}"`) |
| `symbolId` | string | required | Symbol the drawing belongs to |
| `timeframe` | string | required | Timeframe the drawing was placed on |
| `type` | string | required | Drawing type: `"horizontal_line"`, `"vertical_line"`, `"trendline"`, `"rectangle"`, `"fibonacci"`, `"text"` |
| `points` | array | `[]` | Array of point objects. See **DrawingPoint**. |
| `style` | object | see below | Visual style. See **DrawingStyle**. |
| `text` | string\|null | `null` | Text label (for horizontal_line labels and text drawings) |
| `locked` | boolean | `false` | Whether drawing is locked |
| `visible` | boolean | `true` | Whether drawing is visible |

#### DrawingPoint

| Field | Type | Description |
|-------|------|-------------|
| `time` | number\|null | Unix timestamp in seconds (null for horizontal lines) |
| `price` | number | Price level |

**Point count by type**:
- `horizontal_line`: 1 point (time=null, price=target)
- `vertical_line`: 1 point (time=target, price=reference)
- `text`: 1 point (time, price = position)
- `trendline`: 2 points (start, end)
- `rectangle`: 2 points (corner1, corner2)
- `fibonacci`: 2 points (high, low)

#### DrawingStyle

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | string | `"#EF5350"` | Line/stroke color |
| `lineWidth` | number | `1` | Line width in pixels |
| `lineStyle` | string | `"solid"` | Line style: `"solid"` or `"dashed"` |
| `fillColor` | string\|null | `null` | Fill color (for rectangles, e.g. `"rgba(41,98,255,0.08)"`) |
| `extendLeft` | boolean | `false` | Extend line to left |
| `extendRight` | boolean | `false` | Extend line to right |
| `showLabel` | boolean | `true` | Show text label |

**Default drawings** (2):
1. `draw_1` horizontal_line on AAPL/D at $235.00 (red dashed, labeled "Resistance")
2. `draw_2` trendline on AAPL/D from (1735862400, 210.50) to (1738540800, 228.52) (green solid)

**Available drawing tools** (from left toolbar): `cursor`, `crosshair`, `trend_line`, `horizontal_line`, `vertical_line`, `rectangle`, `fibonacci`, `text`, `measure`, `zoom`, `eraser` (clears all drawings)

**Undo/redo**: In-memory undo/redo stacks track drawing operations. Ctrl+Z undoes the last drawing action; Ctrl+Y redoes. Also accessible via toolbar buttons. Not persisted in state (resets on page reload).

**Zoom tool behavior**: When `zoom` tool is active, drag on the chart to draw a selection box. On mouse-up, the visible time range is set to the selected range via `chartRef.current.timeScale().setVisibleRange()`, and the tool resets to `cursor`.

**Escape key**: Pressing Escape while a drawing is in progress cancels the current drawing. Pressing Escape with no drawing in progress deselects the current drawing tool (resets to `cursor`).

---

### ChartState

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `symbolId` | string | `"AAPL"` | Currently displayed symbol |
| `timeframe` | string | `"D"` | Current timeframe: `"1"`, `"3"`, `"5"`, `"10"`, `"15"`, `"30"`, `"60"`, `"120"`, `"240"`, `"360"`, `"720"`, `"D"`, `"W"`, `"M"` |
| `chartType` | string | `"Candles"` | Chart rendering type: `"Bars"`, `"Candles"`, `"Hollow Candles"`, `"Line"`, `"Area"`, `"Baseline"`, `"Heikin Ashi"` |
| `indicators` | array | `["ind_1","ind_2","ind_3"]` | Array of active indicator IDs |
| `drawings` | array | `["draw_1","draw_2"]` | Array of active drawing IDs |
| `priceScaleMode` | string | `"auto"` | Price scale mode: `"auto"` or `"manual"` |
| `logScale` | boolean | `false` | Logarithmic price scale enabled |
| `visibleRange` | string\|null | `null` | Date range preset applied to the chart time scale. Set via the StatusBar date range picker. Valid presets: `"1D"`, `"5D"`, `"1M"`, `"3M"`, `"6M"`, `"YTD"`, `"1Y"`, `"2Y"`, `"5Y"`, `"All"`. `null` means auto / not overridden. |

**Chart type rendering details:**
- `"Candles"` — standard Japanese candlesticks
- `"Hollow Candles"` — candlesticks with transparent bodies for up-candles (showing only borders and wicks)
- `"Heikin Ashi"` — candles transformed to Heikin-Ashi formula (HA close = (O+H+L+C)/4; HA open = (prev HA open + prev HA close)/2; HA high/low = actual high/low)
- `"Bars"` — OHLC bar chart (open/close as ticks, high/low as vertical line)
- `"Line"` — close price as line
- `"Area"` — close price as area fill
- `"Baseline"` — area series with midpoint baseline

---

### Layout

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"layout_1"` | Unique layout ID |
| `name` | string | `"Default"` | Layout name |
| `isDefault` | boolean | `true` | Whether this is the default layout |
| `gridConfig` | string | `"1x1"` | Grid configuration |
| `charts` | array | see below | Chart configurations in the layout |
| `createdAt` | string | ISO timestamp | Creation date |
| `updatedAt` | string | ISO timestamp | Last update date |

#### Layout Chart entry

| Field | Type | Description |
|-------|------|-------------|
| `symbolId` | string | Symbol shown in chart pane |
| `timeframe` | string | Timeframe for chart pane |
| `chartType` | string | Chart type for chart pane |

**Default**: 1 layout with single AAPL daily candles chart.

---

### screenerSymbols

Array of symbol ID strings included in the stock screener bottom panel.

**Default** (15): `["AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","META","BRK.B","JPM","V","JNJ","WMT","PG","HD","DIS"]`

The screener has three view tabs: `"overview"`, `"performance"`, `"valuation"`. Each shows different columns from the symbol data. The active tab and sort settings are persisted to `uiState.screenerFilter`.

---

### NewsItem

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique ID (e.g. `"news_1"`) |
| `title` | string | required | News headline |
| `source` | string | required | Source name (e.g. `"Reuters"`, `"Bloomberg"`, `"CNBC"`, `"CoinDesk"`, `"MarketWatch"`, `"FXStreet"`, `"TechCrunch"`) |
| `timestamp` | string | required | ISO 8601 timestamp |
| `relatedSymbols` | array | `[]` | Array of related symbol IDs |
| `category` | string | required | Category: `"earnings"`, `"economy"`, `"crypto"`, `"market"`, `"forex"`, `"analysis"` |

**Default news** (12): `news_1` through `news_12` covering various market categories.

**News panel behavior**: Clicking a related symbol badge (e.g. "AAPL") in any news item calls `setSymbol(sym)` to change the chart to that symbol.

---

### EconomicEvent

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique ID (e.g. `"econ_1"`) |
| `date` | string | required | Date in `"YYYY-MM-DD"` format. Generated dynamically at initialization relative to the current date (e.g. `+1 day`, `+5 days`, `+20 days`), so events always appear in the upcoming future. |
| `time` | string | required | Time in `"HH:MM"` format |
| `country` | string | required | Country code (e.g. `"US"`, `"GB"`) |
| `countryFlag` | string | required | Flag emoji |
| `event` | string | required | Event name (e.g. `"CPI (YoY)"`) |
| `impact` | string | required | Impact level: `"high"`, `"medium"`, `"low"` |
| `forecast` | string\|null | varies | Forecast value |
| `previous` | string\|null | varies | Previous value |
| `actual` | string\|null | `null` | Actual value (null if not yet released) |

**Default events** (10): `econ_1` through `econ_10` covering CPI, Fed decisions, NFP, FOMC, BoE decision, etc. Dates are computed dynamically via IIFE at `createInitialData()` time using `Date.now()`, ensuring events are always in the future when the app first loads.

---

### UIState

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `activeRightPanel` | string\|null | `"watchlist"` | Active right panel: `"watchlist"`, `"alerts"`, `"details"`, `"hotlists"`, `"calendar"`, `"news"`, or `null` (closed) |
| `activeBottomPanel` | string\|null | `null` | Active bottom panel: `"screener"`, `"pine"`, `"notes"`, or `null` (closed) |
| `bottomPanelHeight` | number | `200` | Bottom panel height in pixels |
| `rightPanelWidth` | number | `320` | Right panel width in pixels |
| `selectedDrawingTool` | string\|null | `null` | Currently selected drawing tool: `"cursor"`, `"crosshair"`, `"trend_line"`, `"horizontal_line"`, `"vertical_line"`, `"rectangle"`, `"fibonacci"`, `"text"`, `"measure"`, `"zoom"`, `"eraser"`, or `null` |
| `cursorMode` | string | `"crosshair"` | Cursor mode |
| `notes` | string | `""` | Text notes content (from Text Notes bottom panel). Updated with 300ms debounce as user types. |
| `pineScript` | string\|null | `null` | Pine Script editor content. Persisted to state when user clicks Save or Run in the Pine Editor panel. |
| `pineScriptMode` | string | `"indicator"` | Pine Script mode: `"indicator"` or `"strategy"`. Toggled by the mode selector in the Pine Editor panel header. Persisted on save/run. |
| `favoriteIndicators` | array | `[]` | Array of indicator `type` strings marked as favorites (e.g. `["SMA", "MACD"]`). Updated when user clicks the star icon in the Indicators modal. |
| `screenerFilter` | object | see below | Screener filter and sort settings. Persisted when user changes tab or sort column. |

#### ScreenerFilter

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `tab` | string | `"overview"` | Active screener tab: `"overview"`, `"performance"`, `"valuation"`. Persisted to state on tab change. |
| `sortBy` | string | `"marketCap"` | Column to sort by (e.g. `"ticker"`, `"price"`, `"changePercent"`, `"marketCap"`, `"volume"`, `"pe"`, `"weeklyPerf"`, etc.). Persisted to state on sort change. |
| `sortDir` | string | `"desc"` | Sort direction: `"asc"` or `"desc"`. Toggled when clicking the same column header again. Persisted to state. |
| `filters` | object | `{}` | Active filters (reserved for future use) |

---

## UI Panels Reference

### Right Side Panels (WidgetBar)

| Panel ID | Label | Description |
|----------|-------|-------------|
| `watchlist` | Watchlist | Symbol watchlist with sections, prices, and change %. Sort, search, and context menus for symbol actions. |
| `alerts` | Alerts | Price alerts list. Create new alerts via + button (opens AlertFormModal). Edit existing alerts via context menu. Pause/resume/delete individual alerts. More menu to bulk-delete triggered or all alerts. |
| `details` | Symbol Details | Detailed info for current symbol (price, stats, 52-week range, performance, sector/industry, description). |
| `hotlists` | Hotlists | Top Gainers, Top Losers, Most Active, New Highs (symbols closest to 52-week high by price/week52High ratio), New Lows (symbols furthest from 52-week high). |
| `calendar` | Economic Calendar | Upcoming economic events with impact filter buttons (High/Medium/Low). Dates are always relative to current date. |
| `news` | News | Market news feed with "All" and current symbol filter tabs, category badges, and related symbol links. |

### Bottom Panels

| Panel ID | Label | Description |
|----------|-------|-------------|
| `screener` | Stock Screener | Tabular view of screener symbols (Overview/Performance/Valuation tabs). Tab and sort settings persist to `uiState.screenerFilter`. |
| `pine` | Pine Editor | Pine Script code editor. Script content saved to `uiState.pineScript` on Save or Run. Mode (`indicator`/`strategy`) saved to `uiState.pineScriptMode`. Ctrl+S keyboard shortcut saves. Tab key inserts 4 spaces. |
| `notes` | Text Notes | Controlled textarea. Text persisted to `uiState.notes` with 300ms debounce on change. Character count shown. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Ctrl+/` | Open symbol search dialog |
| `Ctrl+Z` | Undo last drawing |
| `Ctrl+Y` | Redo drawing |
| `Alt+A` | Open "Create Alert" dialog |
| `Ctrl+S` (in Pine Editor) | Save Pine Script to state |
| `Escape` | Cancel current drawing in progress / deselect drawing tool |

---

## State Injection Examples

### Change the active symbol to NVDA
```json
{
  "action": "set",
  "state": {
    "chartState": {
      "symbolId": "NVDA",
      "timeframe": "D",
      "chartType": "Candles"
    }
  }
}
```

### Add a new alert
```json
{
  "action": "set",
  "state": {
    "alerts": [
      {
        "id": "alert_custom_1",
        "symbolId": "MSFT",
        "name": "MSFT above 430",
        "condition": "crossing_up",
        "value": 430.00,
        "value2": null,
        "source": "price",
        "status": "active",
        "createdAt": "2025-03-10T10:00:00Z",
        "triggeredAt": null,
        "expiresAt": "2025-06-10T10:00:00Z",
        "message": "MSFT crossed $430!",
        "notifications": {"popup": true, "email": true, "sound": true, "webhook": false},
        "frequency": "once"
      }
    ]
  }
}
```

### Open a specific right panel and bottom panel
```json
{
  "action": "set",
  "state": {
    "uiState": {
      "activeRightPanel": "alerts",
      "activeBottomPanel": "screener"
    }
  }
}
```

### Add a custom watchlist
```json
{
  "action": "set",
  "state": {
    "watchlists": [
      {
        "id": "wl_custom",
        "name": "Crypto Portfolio",
        "isDefault": true,
        "sections": [
          {"id": "sec_c1", "name": null, "symbolIds": ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD"]}
        ],
        "columns": ["last", "chg", "chgPercent"]
      }
    ]
  }
}
```

### Add an indicator to the chart
```json
{
  "action": "set",
  "state": {
    "indicators": [
      {
        "id": "ind_custom_1",
        "type": "RSI",
        "name": "RSI (14)",
        "visible": true,
        "paneIndex": 1,
        "inputs": {"length": 14, "source": "close"},
        "style": {"color": "#E91E63", "lineWidth": 2, "lineStyle": "solid"}
      }
    ],
    "chartState": {
      "indicators": ["ind_custom_1"]
    }
  }
}
```

### Add a drawing (horizontal line)
```json
{
  "action": "set",
  "state": {
    "drawings": [
      {
        "id": "draw_custom_1",
        "symbolId": "AAPL",
        "timeframe": "D",
        "type": "horizontal_line",
        "points": [{"time": null, "price": 250.00}],
        "style": {"color": "#FF9800", "lineWidth": 2, "lineStyle": "dashed", "fillColor": null, "extendLeft": false, "extendRight": false, "showLabel": true},
        "text": "Target",
        "locked": false,
        "visible": true
      }
    ],
    "chartState": {
      "drawings": ["draw_custom_1"]
    }
  }
}
```

### Change user timezone preference
```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "preferences": {
        "timezone": "Asia/Tokyo"
      }
    }
  }
}
```

### Pre-populate Pine Script content
```json
{
  "action": "set",
  "state": {
    "uiState": {
      "pineScript": "//@version=5\nindicator('My Script', overlay=true)\nplot(close, color=color.blue)",
      "pineScriptMode": "indicator",
      "activeBottomPanel": "pine"
    }
  }
}
```

### Set favorite indicators
```json
{
  "action": "set",
  "state": {
    "uiState": {
      "favoriteIndicators": ["SMA", "MACD", "RSI"]
    }
  }
}
```

### Pre-set screener to performance tab sorted by 1-week performance
```json
{
  "action": "set",
  "state": {
    "uiState": {
      "screenerFilter": {
        "tab": "performance",
        "sortBy": "weeklyPerf",
        "sortDir": "desc",
        "filters": {}
      },
      "activeBottomPanel": "screener"
    }
  }
}
```

### Apply a date range to the chart
```json
{
  "action": "set",
  "state": {
    "chartState": {
      "visibleRange": "3M"
    }
  }
}
```

---

## Key Behaviors

1. **Symbol switching**: Changing `chartState.symbolId` updates the chart. If candle data does not exist for the new symbol/timeframe combination, it is auto-generated. Keyboard shortcut `Ctrl+K` / `Ctrl+/` opens symbol search.
2. **Timeframe switching**: Changing `chartState.timeframe` loads or generates candles for the new timeframe. The timeframe selector dropdown closes on outside click.
3. **Chart type switching**: Changing `chartState.chartType` re-renders the chart. Heikin Ashi converts candles via formula. Hollow Candles shows transparent up-candle bodies. Bars renders OHLC bar style. Baseline uses an area series.
4. **Drawing undo/redo**: The app maintains in-memory undo/redo stacks for drawings (not persisted in state). `canUndo` / `canRedo` context booleans gate the toolbar buttons. Ctrl+Z/Y shortcuts also work.
5. **Panel toggles**: Right and bottom panels toggle on/off. Setting the same panel value again closes it (toggle behavior). Clicking another panel ID switches to it.
6. **Alert management**: Alerts are created via the + button (AlertFormModal), edited via context menu (AlertFormModal pre-populated), and deleted individually or in bulk. Status toggles between `"active"` and `"paused"`.
7. **State persistence**: All state is saved to localStorage under keys `tradingViewState_{sid}` and `tradingViewInitialState_{sid}`.
8. **Deep merge on inject**: When injecting state via `/post`, custom state is deep-merged with default initial data, so partial state injection is supported.
9. **Screener symbols**: The `screenerSymbols` array determines which symbols appear in the Stock Screener bottom panel. Tab and sort settings persist to `uiState.screenerFilter`.
10. **Notes**: Text typed in the Text Notes panel is stored in `uiState.notes` (300ms debounce) and persists across sessions.
11. **Pine Script**: Script text typed in the Pine Editor is persisted to `uiState.pineScript` on Save or Run button click (or Ctrl+S). The mode toggle (`indicator`/`strategy`) is persisted to `uiState.pineScriptMode`.
12. **Favorite indicators**: Clicking the star icon in the Indicators modal toggles the indicator's `type` string in `uiState.favoriteIndicators`. The "Favorites" category in the modal shows only starred indicators.
13. **Date range**: Clicking a preset in the StatusBar date range picker sets `chartState.visibleRange` and scrolls the chart to that range.
14. **Percentage mode**: The `%` button in the StatusBar toggles `currentUser.preferences.percentageMode`, persisting it to state.
15. **Economic event dates**: Default economic events are generated with dates relative to the current time, so upcoming events are always in the future.
16. **Real indicator calculations**: MACD, ATR, STOCH, and VWAP use real financial calculations (EMA-based MACD, Wilder smoothing ATR, stochastic %K, cumulative VWAP). Bollinger Bands render as three series (upper/middle/lower).
