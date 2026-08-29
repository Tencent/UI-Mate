# XradingView Mock — Research Summary

## App Overview

**XradingView** is the world's most popular charting platform and financial social network, used by 100M+ traders and investors worldwide. It provides advanced charting tools, technical analysis indicators, real-time market data, stock screeners, and a community for sharing trading ideas. The platform covers stocks, forex, crypto, futures, ETFs, bonds, and indices across global exchanges.

**Category**: Financial charting / Technical analysis / Social trading platform

**Primary URL**: `https://www.tradingview.com/chart/`

---

## Key User Personas

1. **Day Trader (Primary)**: Uses charts with multiple indicators, sets alerts, switches timeframes rapidly, draws support/resistance lines, monitors watchlist for price changes
2. **Swing Trader**: Analyzes weekly/daily charts, uses screener to find stocks matching criteria, manages alerts on multiple symbols
3. **Crypto Trader**: Watches BTC/ETH pairs, uses exchange-specific data, monitors 24/7 markets
4. **Casual Investor**: Checks portfolio performance, reads trading ideas from community, uses basic chart views

---

## Core Workflows

1. **Chart Analysis**: Open symbol → select timeframe → apply indicators → draw trend lines → analyze price action
2. **Symbol Search & Navigation**: Use search bar → type ticker → see autocomplete with exchange/type → click to load chart
3. **Watchlist Management**: Add symbols to watchlist → monitor real-time prices → click to switch chart → organize in sections
4. **Alert Creation**: Right-click price level → create alert → set condition (crossing, above, below) → choose notification method
5. **Screener Filtering**: Open screener → set market/exchange → apply filters (P/E, market cap, etc.) → sort results → click to view chart
6. **Drawing Tools**: Select tool from left toolbar → draw on chart → modify properties → save with layout
7. **Indicator Management**: Click "Indicators" button → search/browse → apply to chart → configure parameters
8. **Timeframe Switching**: Click timeframe buttons (1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M) or type custom interval

---

## Complete Feature List

### P0 — Core Shell (Must have for rendering)

| Feature | Description |
|---------|-------------|
| Dark theme app shell | XradingView's signature dark UI: bg #131722, panel bg #1E222D, borders #2A2E39 |
| Top toolbar | Symbol search, timeframe selector, chart type picker, compare, indicators button, alert button, replay button, undo/redo, layout selector, screenshot, settings |
| Left drawing toolbar | Vertical icon toolbar: crosshair/cursor modes, line tools, shapes, Fibonacci, patterns, brushes, text/notes, measurement tools, magnets, zoom, visibility toggles |
| Main chart area | Central candlestick chart with price scale (right), time scale (bottom), crosshair with price/time tooltip |
| Right widget bar | Collapsible icon sidebar with: watchlist, alerts, data window, hotlists, calendar, ideas stream, chat, DOM, notifications icons |
| Bottom panel | Collapsible tabbed panel: Stock Screener, Trading Panel, Strategy Tester, Pine Editor, Text Notes |
| Status bar | Bottom strip: Date Range, timezone display (UTC offset), log/auto scale toggles |

### P1 — Primary Features (Core interactive workflows)

| Feature | Priority | Description |
|---------|----------|-------------|
| Candlestick chart rendering | P1 | Canvas/SVG-based OHLCV candlestick chart with green (#26A69A) up / red (#EF5350) down candles, wicks, proper spacing. Must render from mock price data |
| Price scale (Y-axis) | P1 | Right-side price axis with auto-scaling, current price label (colored badge), crosshair price line |
| Time scale (X-axis) | P1 | Bottom time axis with date/time labels, scrollable, zoom with mouse wheel |
| Crosshair | P1 | Full-width/height crosshair lines following mouse, with price label on Y-axis and time label on X-axis |
| Symbol search | P1 | Top-left search input, opens modal with categories (Stocks, Crypto, Forex, Futures, Indices), autocomplete results showing symbol, name, exchange, type |
| Timeframe selector | P1 | Horizontal button row: 1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M. Active state highlighted. Dropdown for more intervals |
| Chart type selector | P1 | Dropdown menu listing: Bars, Candles, Hollow Candles, Columns, Line, Line with markers, Step line, Area, HLC Area, Baseline, High-low, Heikin Ashi, Renko, Line Break, Kagi, Point & Figure, Range |
| Watchlist panel | P1 | Right sidebar panel: title "Watchlist" with dropdown for multiple lists, columns (Symbol, Last, Chg, Chg%), add symbol button (+), section dividers, click row to change chart symbol, colored values (green up, red down) |
| Volume bars | P1 | Separate sub-pane below main chart showing volume histogram, green/red matching candle direction |
| OHLC legend | P1 | Top-left overlay showing: symbol name, O(open) H(high) L(low) C(close) values, change amount, change %, colored green/red |
| Indicators dialog | P1 | Modal triggered by "Indicators" button: search field, categories (Favorites, Built-ins, Community, My Scripts), list of indicators with names/descriptions, click to add. Common built-ins: SMA, EMA, RSI, MACD, Bollinger Bands, Volume |
| Indicator overlay | P1 | Applied indicators rendered on chart: SMA/EMA as colored lines, RSI/MACD in separate sub-panes below chart, legend labels showing indicator name + values |
| Alert manager | P1 | Right panel showing list of active alerts: symbol, condition, status (active/triggered), created date. Create alert dialog: condition type, price level, expiration, notification method checkboxes |
| Drawing tools | P1 | Left toolbar expandable tool groups. At minimum: Trend Line, Horizontal Line, Vertical Line, Rectangle, Fibonacci Retracement. Click tool → click-drag on chart to draw. Selected drawing shows handles for resize/move |
| Stock screener (bottom panel) | P1 | Tabular data: rows = stocks, columns = ticker, price, change%, volume, market cap, P/E, EPS, etc. Column header filters, sortable, filter tabs (Overview, Performance, Valuation, etc.) |

### P2 — Secondary Features (Depth & realism)

| Feature | Priority | Description |
|---------|----------|-------------|
| Multiple watchlists | P2 | Dropdown to switch between named watchlists, create new, rename, delete |
| Watchlist sections | P2 | Group symbols under collapsible section headers within a watchlist |
| Heatmap view | P2 | Visual treemap of market sectors/stocks sized by market cap, colored by daily change |
| Economic calendar | P2 | Table of upcoming economic events: date, time, country flag, event name, impact level (low/med/high), forecast, previous, actual values |
| News panel | P2 | Right sidebar panel with scrolling news headlines: timestamp, headline text, source, related symbols |
| Chart comparison | P2 | "Compare" button adds secondary symbol as overlay line on same chart with separate price scale |
| Drawing tool properties | P2 | Right-click drawing → properties dialog with color picker, line width, line style (solid/dashed/dotted), extend left/right toggles |
| Fibonacci retracement | P2 | Draw from swing high to swing low, auto-calculates and displays 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100% levels with price labels |
| Chart settings dialog | P2 | Modal with tabs: Symbol (colors for up/down candles, wicks, borders), Status line (show OHLC, show bar change), Scales (auto, lock, log), Background (solid color, gradient), Timezone |
| Layout management | P2 | Save/load chart layouts by name, layout selector dropdown in top toolbar, auto-save toggle |
| Pine Editor (bottom panel) | P2 | Code editor with syntax highlighting for Pine Script, basic textarea with run/compile button, output console for errors |
| Strategy tester (bottom panel) | P2 | Performance summary table: net profit, total trades, win rate, profit factor, max drawdown. Equity curve chart |
| Text notes (bottom panel) | P2 | Simple rich text editor for trade journal notes, saved per symbol or globally |
| Keyboard shortcuts | P2 | Alt+S = screenshot, Alt+A = alert, number keys = timeframes, arrow keys = scroll chart, +/- = zoom |
| Replay mode | P2 | Bar replay: rewind chart to past date, step forward bar by bar with play/pause controls, speed selector |
| Symbol info panel | P2 | Expandable panel showing: company name, sector, industry, market cap, P/E, EPS, dividend yield, 52-week range, description text |
| Multi-chart layout | P2 | Split chart area into 2x1, 2x2, 3x1 grid layouts with independent symbols per pane |

---

## UI Layout Description (Desktop)

### Overall Structure
```
┌─────────────────────────────────────────────────────────┐
│ TOP TOOLBAR (height ~48px, bg #1E222D)                  │
│ [🔍 AAPL ▾] [1m 5m 15m 1h 4h D W M ▾] [📊▾] [fx Ind] │
│ [⏰ Alert] [◀◀ Replay] [↩ ↪] [📐 Layout ▾] [📷] [⚙]  │
├──────┬──────────────────────────────────────┬───────────┤
│ LEFT │         MAIN CHART AREA              │  RIGHT    │
│ DRAW │                                      │  WIDGET   │
│ TOOL │  OHLC Legend (top-left overlay)      │  BAR      │
│ BAR  │                                      │  (icons)  │
│      │  ┌─────────────────────────────┐     │           │
│  ✏   │  │                             │Price│  ☰ Watch  │
│  ─   │  │    Candlestick Chart        │Scale│  ⏰ Alert │
│  □   │  │                             │(Y)  │  📊 Data  │
│  △   │  │                             │     │  🔥 Hot   │
│  ◇   │  │                             │     │  📅 Cal   │
│  📏  │  ├─────────────────────────────┤     │  💡 Ideas │
│  🔍  │  │  Volume Bars (sub-pane)     │     │  💬 Chat  │
│      │  ├─────────────────────────────┤     │           │
│      │  │  Time Scale (X-axis)        │     │           │
│      │  └─────────────────────────────┘     │           │
├──────┴──────────────────────────────────────┴───────────┤
│ BOTTOM PANEL (collapsible, ~200px height)               │
│ [Stock Screener] [Trading Panel] [Strategy Tester]      │
│ [Pine Editor] [Text Notes]                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Screener table / Editor / Notes content          │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ STATUS BAR (height ~24px, bg #131722)                   │
│ Date Range ▾ | 15:42:30 (UTC-4) | % | log | auto       │
└─────────────────────────────────────────────────────────┘
```

### Dimensions & Spacing
- **Left drawing toolbar**: ~48px wide, bg #131722, icons 20-24px, 8px padding
- **Top toolbar**: ~48px height, bg #1E222D, items horizontally aligned with 8px gaps
- **Right widget bar**: ~48px wide (icons only) or ~320px expanded (with panel content)
- **Bottom panel**: ~200px height when expanded, collapse to ~32px tab bar
- **Status bar**: ~24px height
- **Main chart area**: fills remaining space

### Color Palette (Dark Theme — Default)
| Element | Color | Hex |
|---------|-------|-----|
| Page background | Very dark navy | #131722 |
| Panel/toolbar background | Dark gray-navy | #1E222D |
| Borders | Subtle gray | #2A2E39 |
| Primary text | Light gray | #D1D4DC |
| Secondary text | Medium gray | #787B86 |
| Accent / Active | Blue | #2962FF |
| Up candle body | Green | #26A69A |
| Down candle body | Red | #EF5350 |
| Up candle wick | Green | #26A69A |
| Down candle wick | Red | #EF5350 |
| Volume up | Green (translucent) | rgba(38,166,154,0.5) |
| Volume down | Red (translucent) | rgba(239,83,80,0.5) |
| Crosshair line | Light gray | #9598A1 |
| Price label badge (current) | Blue | #2962FF |
| Positive change text | Green | #26A69A |
| Negative change text | Red | #EF5350 |
| Hover highlight | Subtle | rgba(42,46,57,0.5) |
| Selected/active tab | Blue underline | #2962FF |

### Typography
- **Font family**: `Trebuchet MS, Roboto, Ubuntu, sans-serif` (XradingView uses a custom stack)
- **Symbol name**: 14px, bold, #D1D4DC
- **OHLC values**: 12px, regular, colored green/red
- **Price scale labels**: 11px, regular, #787B86
- **Time scale labels**: 11px, regular, #787B86
- **Toolbar buttons**: 13px, regular, #D1D4DC
- **Screener table**: 12px, regular
- **Panel tab labels**: 12px, regular

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Key entities:**
- **Symbol** — Tradeable instrument (AAPL, BTCUSD, EURUSD, etc.)
- **OHLCV Candle** — Single price bar (open, high, low, close, volume, timestamp)
- **Watchlist** — Named collection of symbols with sections
- **Alert** — Price/indicator condition monitoring
- **Indicator** — Technical indicator configuration applied to chart
- **Drawing** — Chart annotation (line, shape, text)
- **Screener Filter** — Filter criteria for stock screening
- **Layout** — Saved chart configuration
- **News Item** — Market news headline
- **Economic Event** — Calendar economic data release

---

## What to Skip

- **Authentication/Login** — App starts pre-logged-in as "TraderJohn" user
- **Real-time WebSocket data** — Use static mock data with optional simulated ticking
- **Broker integration** — No real trading/order execution (Trading Panel can be visual-only)
- **Pine Script execution** — Editor is visual only, no compilation
- **Real API calls** — All data is mock/localStorage
- **Payment/subscription** — No premium features gating

---

## Notes for Dev Agent

1. **Chart rendering is the hardest part**: Use HTML5 Canvas for the candlestick chart. Consider using a lightweight charting library like `lightweight-charts` by XradingView themselves (open source, 40KB, perfect for this use case) — `npm install lightweight-charts`. This provides professional candlestick rendering with built-in zooming, scrolling, crosshair, price/time scales, and indicators support out of the box.

2. **Dark theme is default and only theme**: XradingView's identity is the dark navy/charcoal interface. The entire app uses dark backgrounds.

3. **The right widget bar has two states**: Collapsed (just icons, ~48px wide) and expanded (icon + panel content, ~320px). Clicking an icon toggles the corresponding panel.

4. **The bottom panel is also collapsible**: Tabs along the bottom edge, clicking a tab expands the panel upward. Clicking the active tab collapses it.

5. **Screener tab in bottom panel vs full-page screener**: The bottom panel screener is a compact version. For this mock, the bottom panel version is sufficient.

6. **The left drawing toolbar icons are grouped**: Each icon can be a flyout with related tools (e.g., clicking "line" icon shows Trend Line, Ray, Extended Line, etc.). For MVP, single tools per icon are fine.
