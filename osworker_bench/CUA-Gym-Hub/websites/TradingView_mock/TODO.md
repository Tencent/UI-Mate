# XradingView Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-03-13
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest TradingView_mock -- --template react`, then `cd TradingView_mock && npm install`. Install core deps: `npm install react-router-dom lightweight-charts lucide-react date-fns`. The `lightweight-charts` package (by XradingView, open-source, ~40KB) provides professional candlestick rendering with built-in pan/zoom, crosshair, price/time scales — use it instead of building chart rendering from scratch.

- [x] **Visual design system**: XradingView uses a signature dark theme. The dev agent MUST study `assets/screenshots/` and replicate:
  - **Background**: `#131722` (page), `#1E222D` (panels/toolbars)
  - **Borders**: `#2A2E39` (1px solid between panels)
  - **Primary text**: `#D1D4DC`, **Secondary text**: `#787B86`
  - **Accent/Active**: `#2962FF` (blue — selected tabs, active buttons, links)
  - **Up/Positive**: `#26A69A` (green candles, positive change values)
  - **Down/Negative**: `#EF5350` (red candles, negative change values)
  - **Font stack**: `"Trebuchet MS", Roboto, Ubuntu, sans-serif`
  - **Base font size**: 13px for toolbars, 12px for data tables, 11px for axis labels
  - **Icon style**: Thin, monoline stroke icons (use `lucide-react` library)
  - **Button style**: No visible borders, hover bg `#2A2E39`, rounded 4px, text `#D1D4DC`
  - **Input/search style**: bg `#2A2E39`, border `#363A45`, text `#D1D4DC`, placeholder `#787B86`, rounded 4px

- [x] **App layout (src/App.jsx)**: Full-viewport layout with NO scroll on body. Use CSS Grid or absolute positioning:
  ```
  Grid: "topbar" 48px / "left content right" 1fr / "bottom" auto / "statusbar" 24px
  ```
  - **Top toolbar**: height 48px, bg `#1E222D`, border-bottom 1px `#2A2E39`, full width
  - **Left drawing toolbar**: width 48px, bg `#131722`, border-right 1px `#2A2E39`, full remaining height (between topbar and bottom panel)
  - **Main chart area**: fills remaining center space, bg `#131722`, no padding
  - **Right widget bar**: width 48px (collapsed, icons only) or 48px + 320px (expanded with panel), bg `#1E222D`, border-left 1px `#2A2E39`
  - **Bottom panel**: height 0 (collapsed) or 200px (expanded), bg `#1E222D`, border-top 1px `#2A2E39`, with tab bar ~32px at top edge
  - **Status bar**: height 24px, bg `#131722`, border-top 1px `#2A2E39`, full width at very bottom

- [x] **Routing (src/App.jsx)**: BrowserRouter with routes:
  - `/` → redirect to `/chart` (preserve `?sid=` query param)
  - `/chart` → main chart view (default)
  - `/chart/:symbolId` → chart view for specific symbol
  - `/screener` → full-page screener view (optional, bottom panel screener is primary)
  - `/go` → StateInspector component (JSON state output)
  Use a `RedirectWithQuery` helper component that preserves `?sid=` on redirects.

- [x] **State management (src/context/AppContext.jsx + src/utils/dataManager.js)**: React Context pattern. Follow the exact repo pattern from slack_mock:
  - `dataManager.js`: `getSessionId()`, `fetchCustomState()`, `storageKey()`, `initializeData()`, `createInitialData()`, `deepMergeWithDefaults()`, `calculateStateDiff()` — see `assets/data_model.md` for the full `createInitialData()` structure including symbols, candleData, watchlists, alerts, indicators, drawings, chartState, screenerSymbols, news, economicEvents, uiState.
  - `AppContext.jsx`: Provider wraps entire app, exposes `state`, `updateState()`, and specialized action functions (see P1 items).
  - State persists to localStorage with session-aware keys.
  - On mount: read `?sid=` → fetch custom state → merge with defaults → render.

- [x] **`/go` endpoint (src/pages/Go.jsx + route)**: StateInspector component that renders `{initial_state, current_state, state_diff}` as formatted JSON. Use `<pre>` with monospace font, bg `#1d1c1d`, text `#2BAC76`. Also implement server-side `/go` handler in vite.config.js.

- [x] **Session isolation (vite.config.js)**: Add the standard mock-api plugin handling:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — sets both current + initial state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — clears session state
  - `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
  - `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
  Copy the exact middleware pattern from slack_mock's vite.config.js, importing `createInitialData` from dataManager.

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These are the main interactive workflows for agent training.

### Chart Core

- [x] **Candlestick chart rendering (src/components/Chart/ChartContainer.jsx)**: Use `lightweight-charts` library. Create a chart container that:
  1. Creates a `createChart()` instance with dark theme options: `{ layout: { background: { color: '#131722' }, textColor: '#D1D4DC' }, grid: { vertLines: { color: '#2A2E39' }, horzLines: { color: '#2A2E39' } }, crosshair: { mode: 0 } }`
  2. Adds a candlestick series with `upColor: '#26A69A'`, `downColor: '#EF5350'`, `wickUpColor: '#26A69A'`, `wickDownColor: '#EF5350'`, `borderVisible: false`
  3. Sets data from `state.candleData[symbolId][timeframe]`
  4. Auto-resizes with `ResizeObserver` to fill parent container
  5. Handles `timeScale().fitContent()` on initial load to show all data

- [x] **Volume bars sub-pane**: Add a histogram series to the `lightweight-charts` instance below the candlestick series. Each bar colored green (`rgba(38,166,154,0.5)`) if close >= open, red (`rgba(239,83,80,0.5)`) if close < open. Use `priceFormat: { type: 'volume' }` and `priceScaleId: 'volume'` with `scaleMargins: { top: 0.8, bottom: 0 }` to position volume at the bottom 20% of chart.

- [x] **OHLC legend overlay (src/components/Chart/OHLCLegend.jsx)**: Positioned absolute top-left of chart area (padding 12px), z-index above chart canvas. Shows:
  - Line 1: Symbol name (bold, 14px, `#D1D4DC`) + exchange badge (smaller, `#787B86`) + timeframe
  - Line 2: `O` value `H` value `L` value `C` value — each labeled with gray letter, value colored green if >= previous close, red if < previous close. Format: `O 189.50 H 190.25 L 187.90 C 189.84`
  - Line 3: Change `+1.62 (+0.86%)` colored green/red
  - Update these values on crosshair move (show candle under cursor) or show latest candle when no crosshair.

- [x] **Price scale (Y-axis)**: Handled by `lightweight-charts` automatically. Configure: `rightPriceScale: { borderColor: '#2A2E39', textColor: '#787B86' }`. Current price shows as colored label badge (blue `#2962FF` bg with white text) on the right edge at the current price level.

- [x] **Time scale (X-axis)**: Handled by `lightweight-charts`. Configure: `timeScale: { borderColor: '#2A2E39', timeVisible: true, secondsVisible: false }`. For daily timeframe, show dates. For intraday, show times.

- [x] **Crosshair with tooltips**: `lightweight-charts` provides crosshair. Subscribe to `chart.subscribeCrosshairMove(param => ...)` to update the OHLC legend with hovered candle data. Crosshair color: `#9598A1`.

### Top Toolbar

- [x] **Symbol search (src/components/Toolbar/SymbolSearch.jsx)**: Left-most element in top toolbar. Shows current symbol ticker (e.g., "AAPL") in bold with a small down-arrow. Clicking opens a search modal/dropdown:
  - Search input field at top with placeholder "Search symbol or name..."
  - Category filter pills: All, Stocks, Crypto, Forex, Futures, Indices
  - Results list: each row shows [type icon] [ticker bold] [full name gray] [exchange badge]
  - Selecting a symbol: updates `chartState.symbolId`, loads candle data for that symbol, updates chart, updates OHLC legend, highlights in watchlist if present
  - Keyboard navigation: arrow keys to move through results, Enter to select, Escape to close

- [x] **Timeframe selector (src/components/Toolbar/TimeframeSelector.jsx)**: Horizontal row of buttons in top toolbar after symbol search. Show commonly used timeframes as clickable buttons:
  - Visible buttons: `1m` `5m` `15m` `1h` `4h` `D` `W` `M`
  - Active timeframe has blue text `#2962FF` and subtle blue underline
  - Clicking changes `chartState.timeframe`, loads/generates candle data for that timeframe, updates chart
  - A `▾` dropdown button at the end for less common timeframes (3m, 10m, 30m, 2h, 6h, 12h, 2D, 3D)

- [x] **Chart type selector (src/components/Toolbar/ChartTypeSelector.jsx)**: Button with current chart type icon (candles icon by default). Clicking opens a dropdown list:
  - Items: Bars, Candles (default, highlighted), Hollow Candles, Columns, Line, Line with markers, Step line, Area, HLC Area, Baseline, High-low, Heikin Ashi, Renko, Line Break, Kagi, Point & Figure, Range
  - Each item has a small icon + name
  - For the mock: implement Candles (default), Line, and Area chart types using `lightweight-charts` series types (`addCandlestickSeries`, `addLineSeries`, `addAreaSeries`). Other types can update `chartState.chartType` in state but render as Candles (visual-only switch for non-implemented types is OK).

- [x] **Indicators button (src/components/Toolbar/IndicatorsButton.jsx)**: Button labeled "Indicators" (or `fx` icon) in top toolbar. Clicking opens a modal dialog:
  - **Search field** at top
  - **Left sidebar categories**: Favorites, Built-ins, Volume, Community Scripts
  - **Main list**: Scrollable list of indicator names. Built-in indicators to include: SMA (Simple Moving Average), EMA (Exponential Moving Average), Bollinger Bands, RSI (Relative Strength Index), MACD, Volume, VWAP, ATR (Average True Range), Stochastic
  - **Clicking an indicator**: adds it to `state.indicators[]` array and renders on chart. SMA/EMA → line on main pane. RSI/MACD → new sub-pane below chart.
  - **Applied indicators** show with ✓ checkmark or highlighted state
  - For the mock, implement visual rendering of SMA and EMA (calculate from candle data as simple line series), and show RSI/MACD as separate pane placeholders with simulated line data.

- [x] **Alert button (src/components/Toolbar/AlertButton.jsx)**: Bell icon `🔔` in top toolbar. Clicking opens the Create Alert dialog:
  - **Symbol**: auto-filled with current chart symbol
  - **Condition dropdown**: Crossing Up, Crossing Down, Greater Than, Less Than, Entering Channel, Exiting Channel
  - **Value input**: numeric input for target price, auto-filled with current price
  - **Expiration**: dropdown (1 hour, 4 hours, 24 hours, 1 week, 1 month, 2 months)
  - **Alert name**: auto-generated text field, editable
  - **Message**: textarea for custom message
  - **Notifications checkboxes**: Popup, Email, Sound, Webhook
  - **Create button** (blue `#2962FF`): adds alert to `state.alerts[]`
  - Also accessible via keyboard shortcut Alt+A

- [x] **Undo/Redo buttons**: Two icon buttons (↩ ↪) in top toolbar. Wire to undo/redo stack for drawing operations. Clicking undo removes last drawing, redo restores it. Can use a simple array stack: `undoStack[]`, `redoStack[]`.

- [ ] **Compare button**: `+` or "Compare" icon in top toolbar. Clicking opens a small symbol search (same as symbol search but adds as overlay). Selected symbol renders as a line series on the same chart with a different color. Updates `chartState` to track comparison symbols.

- [x] **Screenshot button**: Camera icon `📷` in top toolbar. Clicking captures the chart area as an image (use `chart.takeScreenshot()` from `lightweight-charts`) and opens a save/download dialog. In mock: trigger browser download of canvas screenshot.

- [x] **Settings gear button**: `⚙` icon at right end of top toolbar. Opens a Chart Settings modal with tabs:
  - **Symbol tab**: Color pickers for up/down candle body, wick, border colors
  - **Status line tab**: Toggle checkboxes for showing OHLC values, volume, change %
  - **Scales tab**: Radio buttons for auto/lock scale, log scale toggle
  - **Background tab**: Color picker for chart bg color
  - **Timezone tab**: Dropdown to select timezone (UTC, UTC-5 EST, UTC+0 London, UTC+8 Shanghai, etc.)
  - Changes update `state.currentUser.preferences` and re-render chart

### Left Drawing Toolbar

- [x] **Drawing toolbar layout (src/components/DrawingToolbar/DrawingToolbar.jsx)**: Vertical toolbar, 48px wide, bg `#131722`, positioned left of chart. Each tool is a 36x36 icon button, centered, with 4px vertical gap. Hover shows tooltip with tool name. Active tool has blue highlight bg.

- [x] **Cursor/crosshair mode group** (top of toolbar): Three mutually exclusive modes:
  - **Crosshair** (default): `+` icon, full crosshair following mouse on chart
  - **Pointer/Arrow**: Arrow cursor icon, for selecting/moving drawings
  - **Dot**: Small dot follows mouse
  Clicking sets `uiState.cursorMode` and `uiState.selectedDrawingTool = null`.

- [x] **Line tools group**: Icon showing a diagonal line. Implements:
  - **Trend Line**: Click point A on chart → drag to point B → creates line between two price/time coordinates. Store as drawing object with two points.
  - **Horizontal Line**: Click a price level → creates horizontal line spanning full chart width at that price. Store with one point (price only).
  - **Vertical Line**: Click a time point → creates vertical line at that timestamp.
  When a line tool is active, cursor changes to crosshair, click on chart captures point coordinates relative to price/time scales (use `chart.timeScale().coordinateToTime()` and `series.coordinateToPrice()`). Drawing is added to `state.drawings[]`.

- [x] **Shape tools group**: Icon showing a rectangle. Implements:
  - **Rectangle**: Click-drag from corner A to corner B, creates filled rectangle zone between two price/time points. Fill color with low opacity (`rgba(41,98,255,0.1)`) and solid border.
  Only rectangle needed for MVP. Store as drawing with two points (top-left and bottom-right in price/time space).

- [x] **Fibonacci retracement tool**: Icon showing fib levels. Click swing high point → drag to swing low point → auto-draws horizontal levels at 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100% between the two price levels. Each level labeled with percentage and price value. Semi-transparent fill between levels.

- [x] **Text/note tool**: Icon showing "T" or speech bubble. Click on chart → places editable text annotation at that price/time coordinate. Double-click text to edit. Store text content, position, font size, color in drawing object.

- [x] **Measure tool**: Ruler icon. Click-drag between two points on chart → shows floating label with: price difference, % change, number of bars between points. Temporary (not saved to drawings state).

- [ ] **Zoom tool**: Magnifying glass icon. Click to zoom in (scroll wheel also works). `lightweight-charts` handles zoom natively; this button can toggle a zoom-in mode where clicking the chart zooms to that area.

- [ ] **Drawing deletion**: When a drawing is selected (clicked), show a small floating toolbar near the drawing with: color swatch, line width options, delete (trash icon) button. Pressing Delete key also removes selected drawing. Remove from `state.drawings[]`.

### Right Widget Bar

- [x] **Right widget bar layout (src/components/WidgetBar/WidgetBar.jsx)**: Vertical icon bar, 48px wide, bg `#1E222D`, positioned at far right edge. Icons stacked vertically with 4px gaps:
  1. `☰` Watchlist (list icon)
  2. `⏰` Alerts (bell icon)
  3. `📊` Symbol details (info icon)
  4. `🔥` Hotlists (fire icon)
  5. `📅` Calendar (calendar icon)
  6. `💡` Ideas (lightbulb icon)
  7. `📰` News (newspaper icon)
  - Clicking an icon: if that panel is already open, close it (set `uiState.activeRightPanel = null`). If another panel is open, switch to clicked panel. Opening a panel expands the right area to 48px + 320px showing the panel content alongside the icon bar.
  - Active icon has blue `#2962FF` left border indicator (3px wide).

- [x] **Watchlist panel (src/components/WidgetBar/WatchlistPanel.jsx)**: 320px wide panel, bg `#1E222D`:
  - **Header**: "Watchlist" title with dropdown arrow (to switch between watchlists), `+` button to add symbol, `⋯` overflow menu (Copy, Rename, Clear list, Add section, Table view toggle)
  - **Column headers**: `Symbol` | `Last` | `Chg` | `Chg%` — sortable on click
  - **Rows**: Each row shows: [colored logo circle 24px] [ticker bold] [full name small gray below ticker] | [price right-aligned] | [change colored] | [change% colored]
  - Row background: hover `#2A2E39`; selected/active row (matching chart symbol) has subtle blue-left-border
  - **Click row**: changes chart symbol to that symbol (`chartState.symbolId`), loads its candle data
  - **Right-click row**: context menu with: Remove from watchlist, Add alert, Symbol info
  - **Section headers**: Collapsible gray headers (e.g., "Crypto", "Forex") with chevron toggle
  - **Add symbol**: `+` button opens small search input at top of list, type to search, Enter to add to current section
  - Data comes from `state.watchlists` + `state.symbols` for live prices

- [x] **Alerts panel (src/components/WidgetBar/AlertsPanel.jsx)**: 320px wide panel:
  - **Header**: "Alerts" title with `+` button to create new alert (opens Create Alert dialog)
  - **Alert list**: Each alert row shows: [status icon: green dot=active, yellow=triggered, gray=paused] [symbol ticker] [condition text, e.g., "Crossing Up 195.00"] [timestamp gray small]
  - **Click alert**: highlights it, shows alert details inline or in a tooltip
  - **Right-click alert**: context menu with Edit, Pause/Resume, Delete
  - **Delete alert**: removes from `state.alerts[]`
  - **Triggered alerts**: show with different styling (yellow/orange icon, strikethrough or dimmed)

- [x] **Symbol details panel (src/components/WidgetBar/SymbolDetailsPanel.jsx)**: 320px wide panel showing detailed info for the current chart symbol:
  - **Header section**: Large symbol name, exchange, type badge
  - **Price section**: Current price (large, bold), change amount + %, colored green/red
  - **Key stats grid** (2-column layout):
    - Previous Close | Open
    - Day Range (low — high) | 52 Week Range
    - Volume | Avg Volume
    - Market Cap | P/E Ratio
    - EPS | Dividend Yield
    - Beta | Sector
  - **Description**: Scrollable text paragraph about the company
  - Data from `state.symbols[currentSymbolId]`

- [x] **Calendar panel (src/components/WidgetBar/CalendarPanel.jsx)**: 320px wide panel:
  - **Header**: "Economic Calendar" title with date range display
  - **Event list**: Grouped by date. Each event row shows:
    - [country flag emoji] [time HH:MM] [impact dot: 🔴 high, 🟡 medium, 🟢 low]
    - [event name]
    - [forecast | previous | actual] values in columns
  - Data from `state.economicEvents`

- [x] **News panel (src/components/WidgetBar/NewsPanel.jsx)**: 320px wide panel:
  - **Header**: "News" title
  - **News list**: Scrollable list of news headlines. Each row:
    - [relative timestamp, e.g., "2h ago"] [source name in bold]
    - [headline text, 2-line max with ellipsis]
    - [related symbol badges: small pills showing ticker names]
  - Clicking a news item: no-op (or could expand to show more text)
  - Data from `state.news`

### Bottom Panel

- [x] **Bottom panel layout (src/components/BottomPanel/BottomPanel.jsx)**: Collapsible panel at bottom of app:
  - **Tab bar** (32px height): horizontally arranged tabs: `Stock Screener` | `Pine Editor` | `Strategy Tester` | `Text Notes`. Each tab: 12px text, `#787B86` inactive, `#D1D4DC` active with blue underline `#2962FF`.
  - Clicking active tab → collapses panel (height 0, only tab bar visible as strip). Clicking inactive tab → expands panel to 200px and shows that tab's content.
  - Panel has a drag handle at top edge for resizing height (optional for MVP — fixed 200px is fine).
  - State: `uiState.activeBottomPanel`

- [x] **Stock screener tab (src/components/BottomPanel/StockScreener.jsx)**: Compact data table:
  - **Filter bar** at top: tab pills for `Overview` | `Performance` | `Valuation` | `Dividends` | `Margins` | `Income Statement` | `Balance Sheet` | `Oscillators`
  - **Table**: Scrollable, with columns based on active filter tab:
    - **Overview** (default): Ticker, Name, Last, Chg%, Volume, Market Cap, P/E, EPS, Sector
    - **Performance**: Ticker, Weekly Perf, Monthly Perf, 3M Perf, 6M Perf, YTD Perf, Yearly Perf
    - **Valuation**: Ticker, Market Cap, P/E, EPS, Price/Sales, Price/Book
  - **Column headers**: Clickable to sort (asc/desc toggle, small arrow indicator)
  - **Rows**: ~20 rows from `state.screenerSymbols` referencing `state.symbols` data
  - **Click row**: Changes chart symbol to that ticker
  - **Colored values**: Positive % green `#26A69A`, negative % red `#EF5350`
  - Table styling: 12px font, row height ~32px, alternating row bg `#1E222D` / `#1A1E2B`, hover bg `#2A2E39`

- [x] **Pine Editor tab (src/components/BottomPanel/PineEditor.jsx)**: Visual-only code editor:
  - **Toolbar**: Run button (play icon, blue), Save button, indicator/strategy toggle
  - **Editor area**: `<textarea>` or `<pre contenteditable>` with monospace font (`Consolas, Monaco, monospace`), bg `#131722`, with sample Pine Script code pre-filled:
    ```
    //@version=5
    indicator("My Script")
    plot(close)
    ```
  - **Output console** below editor: small area showing "Compiled successfully" or error messages
  - No actual compilation needed — just visual representation. Clicking Run can add a simple line series to the chart.

- [x] **Text Notes tab (src/components/BottomPanel/TextNotes.jsx)**: Simple note-taking area:
  - `<textarea>` filling the panel, bg `#131722`, text `#D1D4DC`, placeholder "Type your notes here..."
  - Notes saved to `state.uiState.notes` (add field to uiState)
  - Per-symbol option: small toggle to associate notes with current symbol or keep global

### Status Bar

- [x] **Status bar (src/components/StatusBar/StatusBar.jsx)**: 24px height strip at very bottom:
  - **Left section**: "Date Range ▾" clickable label (opens date range picker — can be non-functional or simple for MVP)
  - **Center**: Current time display updating every second: `15:42:30 (UTC-4)` based on user's timezone preference
  - **Right section**: Three toggle buttons:
    - `%` — toggle percentage mode on price scale
    - `log` — toggle logarithmic scale (`chartState.logScale`)
    - `auto` — toggle auto-fit scale (`chartState.priceScaleMode`)
  - Each toggle: 11px text, `#787B86` when off, `#2962FF` when active

---

## P2 — Secondary Features

Depth and realism. Implement only after P1 is solid.

- [ ] **Multiple watchlists**: Watchlist header dropdown lists all watchlists from `state.watchlists[]`. Click to switch. "Create new watchlist" option at bottom. Rename and delete via context menu.

- [ ] **Watchlist table view toggle**: Toggle in watchlist header switches from compact list view to a wider table view with more columns (Last, Chg, Chg%, Volume, Market Cap). Stored in watchlist `columns` property.

- [ ] **Heatmap view (src/pages/Heatmap.jsx)**: Separate route `/heatmap`. Visual treemap grid where each rectangle = a stock, sized proportionally by market cap, colored by daily change (green gradient for positive, red gradient for negative). Hovering shows tooltip with ticker + price + change. Sector grouping. Build with basic divs + CSS Grid or flexbox, no need for D3.

- [ ] **Chart comparison overlay**: When "Compare" button adds a symbol, render it as a `addLineSeries()` on the same chart with a distinct color (e.g., orange `#FF6D00`). Show a second legend entry for the comparison symbol. Right-click to remove comparison. Support up to 3 comparison symbols.

- [ ] **Drawing tool properties popover**: When a drawing is selected, show a floating popover near it with:
  - Color picker (row of 8 preset colors + custom hex input)
  - Line width selector (1px, 2px, 3px, 4px icons)
  - Line style selector (solid, dashed, dotted)
  - Extend left/right toggles
  - Delete button
  Updates the drawing's `style` properties in `state.drawings[]`.

- [ ] **Chart settings dialog (src/components/Modals/ChartSettingsModal.jsx)**: Full modal with tabbed sections:
  - **Symbol**: Color pickers for up body, down body, up wick, down wick, up border, down border
  - **Status line**: Checkbox toggles for OHLC display, bar change, volume on status
  - **Scales**: Auto/manual scale radio, log scale checkbox, percentage checkbox
  - **Background**: Color picker for chart background, grid line visibility toggle, grid color
  - **Timezone**: Dropdown select from common timezones
  Changes persist to `state.currentUser.preferences`.

- [ ] **Layout management**: Top toolbar layout selector dropdown showing saved layouts. "Save layout" button saves current `chartState` as a named layout in `state.layouts[]`. "Load layout" switches to that configuration. "Rename" and "Delete" in dropdown menu.

- [ ] **Strategy tester tab (src/components/BottomPanel/StrategyTester.jsx)**: Visual-only performance summary:
  - **Summary row**: Net Profit, Total Trades, Win Rate %, Profit Factor, Max Drawdown — all static mock values
  - **Equity curve**: Small line chart (use lightweight-charts mini instance) showing a hypothetical equity curve (upward trending mock data)
  - No actual strategy execution — just visual presentation.

- [ ] **Replay mode**: Top toolbar "Replay" button (◀◀ icon). Clicking enters replay mode:
  - Shows a date picker to select starting date
  - Play/pause/step-forward controls appear in toolbar
  - Speed selector (1x, 2x, 5x, 10x)
  - Chart shows data up to selected date, step-forward adds one candle at a time
  - Implemented by slicing `candleData` array and progressively showing more bars.

- [x] **Hotlists panel (src/components/WidgetBar/HotlistsPanel.jsx)**: Pre-built filtered lists:
  - Tabs: Top Gainers, Top Losers, Most Active (by volume), New Highs, New Lows
  - Each list shows ranked rows: [rank #] [ticker] [price] [change%] colored
  - Data derived from `state.symbols` sorted by relevant metric

- [ ] **Keyboard shortcuts**: Global keydown listeners:
  - `Alt+A` → Open Create Alert dialog
  - `Alt+S` → Screenshot
  - `1-9` number keys → switch timeframes (1=1m, 2=5m, 3=15m, 4=1h, 5=4h, 6=D, 7=W, 8=M)
  - `Arrow Left/Right` → scroll chart horizontally
  - `+/-` → zoom in/out chart
  - `Escape` → cancel current drawing / close modal
  - `Delete` → remove selected drawing

- [ ] **Multi-chart layout (src/components/Chart/MultiChartLayout.jsx)**: Layout selector in top toolbar with grid options:
  - `1×1` (default single chart)
  - `2×1` (two charts side by side)
  - `1×2` (two charts stacked)
  - `2×2` (four chart grid)
  Each pane is an independent ChartContainer with its own symbol, timeframe, indicators. Selecting a pane makes it "active" (blue border highlight). Toolbar controls apply to active pane. Requires extending `chartState` to support multiple panes.

- [ ] **Symbol flags and logos**: In watchlist and search results, show small colored circles with initials or emoji icons for each symbol type:
  - Stocks: Company-specific color circle with first letter (e.g., red circle "A" for AAPL)
  - Crypto: Orange/gold circle for BTC, purple for ETH
  - Forex: Flag emojis (🇪🇺 for EUR, 🇺🇸 for USD, 🇬🇧 for GBP)
  - Indices: Blue circle with number (e.g., "500" for SPX)

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for full field definitions and `createInitialData()` template.

- [x] **Symbols**: ~25-30 symbols total:
  - **US Stocks (15)**: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, BRK.B, JPM, V, JNJ, WMT, PG, HD, DIS — with realistic current prices, market caps, P/E ratios, sectors
  - **Crypto (4)**: BTCUSD (~100,000), ETHUSD (~3,500), SOLUSD (~200), BNBUSD (~600) — with exchange "Crypto"
  - **Forex (4)**: EURUSD (~1.08), GBPUSD (~1.27), USDJPY (~150), AUDUSD (~0.66) — with exchange "Forex"
  - **Indices (3)**: SPX (~5,900), DJI (~43,000), IXIC (~19,000) — type "index"
  - **Futures (2)**: GC1! (Gold ~2,700), CL1! (Crude Oil ~72) — type "futures"

- [x] **Candle data generation**: Implement `generateCandles(basePrice, count, volatilityPercent)` in dataManager.js. Generate:
  - Default symbol (AAPL): 250 daily candles + 500 hourly candles (pre-generated)
  - All other symbols: 200 daily candles each (generated on first load or pre-generated)
  - Use random walk algorithm: each candle's close = previous close ± (random * volatility). Open = previous close. High = max(open,close) + random*vol*0.5. Low = min(open,close) - random*vol*0.5. Volume = base volume ± random 30%.

- [x] **Watchlists**: 2 watchlists pre-created (see data_model.md §4):

- [x] **Alerts**: 5 pre-created alerts (mix of active, triggered, paused statuses)

- [x] **Indicators**: 3 pre-applied: SMA(20) blue, EMA(50) orange, Volume

- [x] **Drawings**: 2 pre-existing: one horizontal resistance line at ~195, one trendline

- [x] **News**: 10-15 realistic headlines spanning last 2 days

- [x] **Economic events**: 8-10 events spanning next 2 weeks, mix of high/medium/low impact

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as `TraderJohn`)
- Real-time WebSocket data feeds (use static mock data; simulated ticking optional)
- Broker integration / real order execution (Trading Panel tab can be omitted or visual-only)
- Pine Script actual compilation/execution (editor is visual-only)
- Real API calls to any external service
- Payment / subscription gating
- Social features (publishing ideas, following users, chat)
- Mobile responsive design (desktop-only is fine)
