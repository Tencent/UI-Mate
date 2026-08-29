# Xoinbase Mock - Architecture Design

## 1. Application Overview

**Real Application**: https://www.coinbase.com
**Core Purpose**: Cryptocurrency exchange platform for buying, selling, and managing digital assets with portfolio tracking, price charts, and transaction history.

## 2. Core Features (Priority Ordered)

1. **Portfolio dashboard** - View total balance, holdings breakdown, portfolio chart over time - **High priority**
2. **Buy/sell crypto** - Place market orders to buy or sell cryptocurrencies - **High priority**
3. **Asset browser** - Browse all available cryptocurrencies with prices, market caps, and 24h changes - **High priority**
4. **Asset detail page** - View individual crypto with price chart, stats, and about section - **High priority**
5. **Transaction history** - View all past buys, sells, sends, and receives - **High priority**
6. **Watchlist** - Star/favorite assets to track on dashboard - **Medium priority**
7. **Send/receive crypto** - Transfer crypto to/from wallet addresses - **Medium priority**
8. **Price alerts** - Set alerts for price thresholds - **Low priority (out of scope)**
9. **Staking/earn** - Stake crypto for rewards - **Low priority (out of scope)**
10. **Advanced trading** - Limit orders, stop-loss, order book - **Out of scope**

## 3. Pages and Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home/Dashboard | Portfolio overview, balance, holdings, watchlist, recent activity |
| `/assets` | Assets | Browse all available cryptocurrencies with prices and market data |
| `/asset/:id` | AssetDetail | Individual crypto page with chart, stats, buy/sell, about |
| `/trade` | Trade | Buy/sell/send/receive crypto with order form |
| `/history` | History | Full transaction history with filters |
| `/settings` | Settings | Account settings, payment methods, preferences |
| `/go` | StateInspector | Debug endpoint for RL state inspection |

## 4. Data Structure

```javascript
{
  // Current user
  "currentUser": {
    "id": "user_1",
    "name": "Demo User",
    "email": "demo@example.com",
    "avatar": "https://picsum.photos/100/100?random=coinbase_user",
    "cashBalance": 5000.00,
    "defaultCurrency": "USD"
  },

  // Available cryptocurrencies (normalized)
  "assets": [
    {
      "id": "btc",
      "name": "Bitcoin",
      "symbol": "BTC",
      "currentPrice": 43250.00,
      "priceChange24h": 2.34,
      "priceChange7d": -1.15,
      "marketCap": 845000000000,
      "volume24h": 28500000000,
      "circulatingSupply": 19500000,
      "maxSupply": 21000000,
      "about": "Bitcoin is the first and most widely recognized cryptocurrency...",
      "category": "Store of Value",
      "iconColor": "#F7931A",
      "priceHistory": [42100, 42500, 43000, 42800, 43250]
    }
  ],

  // User's holdings (portfolio)
  "holdings": [
    {
      "assetId": "btc",
      "quantity": 0.5,
      "avgBuyPrice": 41000.00
    }
  ],

  // Transaction history
  "transactions": [
    {
      "id": "tx_1",
      "type": "buy",
      "assetId": "btc",
      "quantity": 0.25,
      "pricePerUnit": 42000.00,
      "totalAmount": 10500.00,
      "fee": 14.99,
      "status": "completed",
      "timestamp": "2026-02-15T10:30:00Z"
    }
  ],

  // Watchlist (asset IDs)
  "watchlist": ["btc", "eth", "sol"],

  // Payment methods
  "paymentMethods": [
    {
      "id": "pm_1",
      "type": "bank",
      "name": "Chase Bank",
      "last4": "4422",
      "isDefault": true
    }
  ],

  // Notifications
  "notifications": [
    {
      "id": "notif_1",
      "type": "trade_completed",
      "message": "Your purchase of 0.25 BTC was completed",
      "timestamp": "2026-02-15T10:30:00Z",
      "read": false,
      "assetId": "btc"
    }
  ],

  // UI state
  "ui": {
    "currentView": "home",
    "selectedAsset": null,
    "searchQuery": "",
    "tradeModal": {
      "isOpen": false,
      "mode": "buy",
      "assetId": null
    },
    "sendReceiveModal": {
      "isOpen": false,
      "mode": "send",
      "assetId": null
    },
    "sortBy": "marketCap",
    "sortDirection": "desc",
    "historyFilter": "all"
  }
}
```

## 5. Module Division

### Module A: Portfolio Dashboard (Implementer-1)

**Components**:
- `components/PortfolioChart.jsx` - Line chart showing portfolio value over time
- `components/PortfolioSummary.jsx` - Total balance, gain/loss percentage, cash balance
- `components/HoldingsList.jsx` - List of user's crypto holdings with current values
- `components/HoldingRow.jsx` - Individual holding row (asset icon, name, quantity, value, gain/loss)
- `components/WatchlistWidget.jsx` - Compact watchlist with prices and sparklines

**Responsibilities**:
- Display total portfolio value and cash balance
- Show portfolio allocation breakdown
- Render individual holdings with gain/loss calculations
- Display watchlist with quick price info
- Portfolio chart with time range selector (1D, 1W, 1M, 1Y, All)

**Dependencies**: None (reads `state.holdings`, `state.assets`, `state.currentUser`, `state.watchlist`)

**Data domain**: Reads `state.holdings`, `state.assets`, `state.watchlist`, `state.currentUser`

---

### Module B: Trading (Implementer-2)

**Components**:
- `components/TradeForm.jsx` - Buy/sell order form (amount input, asset selector, preview)
- `components/TradeModal.jsx` - Modal wrapper for buy/sell flow
- `components/TradeConfirmation.jsx` - Order confirmation/receipt after trade
- `components/SendReceiveModal.jsx` - Send/receive crypto modal with address input
- `components/TransactionList.jsx` - Transaction history list with filters
- `components/TransactionRow.jsx` - Individual transaction row

**Responsibilities**:
- Buy crypto flow: select asset, enter amount (USD or crypto), preview fee, confirm
- Sell crypto flow: select holding, enter quantity, preview proceeds, confirm
- Send crypto: enter address, amount, confirm
- Receive crypto: display wallet address
- Transaction history with filtering (all, buys, sells, sends, receives)
- Execute trades: update `state.holdings`, `state.transactions`, `state.currentUser.cashBalance`

**Dependencies**: None (reads/writes `state.transactions`, `state.holdings`, `state.currentUser`, `state.assets`)

**Data domain**: `state.transactions`, writes to `state.holdings` and `state.currentUser.cashBalance`

---

### Module C: Asset Browser (Implementer-3)

**Components**:
- `components/AssetTable.jsx` - Sortable table of all cryptocurrencies
- `components/AssetRow.jsx` - Individual asset row (icon, name, price, change, market cap, sparkline)
- `components/AssetDetail.jsx` - Full asset detail page (chart, stats, about, buy button)
- `components/PriceChart.jsx` - Price chart with time range selector
- `components/AssetStats.jsx` - Market cap, volume, supply, rank stats grid
- `components/SearchBar.jsx` - Asset search/filter input

**Responsibilities**:
- Display all available assets in a sortable, filterable table
- Search assets by name or symbol
- Sort by price, market cap, 24h change, volume
- Asset detail page with price chart and statistics
- Toggle watchlist (add/remove asset from watchlist)
- Simulate live price updates (small random fluctuations)

**Dependencies**: None (reads `state.assets`, `state.watchlist`)

**Data domain**: `state.assets`, `state.watchlist`, `state.ui.searchQuery`, `state.ui.sortBy`

---

### Module D: Integration + Data (Implementer-4)

**Components**:
- `App.jsx` - Main app with routing and layout
- `components/Layout.jsx` - Sidebar navigation + top bar + main content area
- `components/Sidebar.jsx` - Left sidebar with nav links (Home, Assets, Trade, History)
- `components/TopBar.jsx` - Top bar with search, notifications, user avatar
- `components/NotificationDropdown.jsx` - Notification bell dropdown
- `pages/Home.jsx` - Dashboard page (composes PortfolioSummary + HoldingsList + WatchlistWidget)
- `pages/Assets.jsx` - Assets page (composes SearchBar + AssetTable)
- `pages/AssetDetailPage.jsx` - Asset detail page (composes AssetDetail + TradeForm)
- `pages/Trade.jsx` - Trade page (composes TradeForm + TransactionList)
- `pages/History.jsx` - History page (composes TransactionList with full filters)
- `pages/Settings.jsx` - Account settings page
- `pages/Go.jsx` - State inspection endpoint
- `context/CoinbaseContext.jsx` - React Context for state management
- `utils/dataManager.js` - Initial data, localStorage persistence, session handling
- `utils/helpers.js` - Formatting helpers (currency, percentages, crypto amounts)

**Responsibilities**:
1. **State management**: Create CoinbaseContext with state, updateState, and action functions
2. **Persistence**: Load from localStorage on mount, save on every update
3. **Session support**: Handle `?sid=` query parameter for RL training sessions
4. **Routing**: Configure react-router-dom v6 routes
5. **Layout**: Sidebar navigation + top bar + main content with Outlet
6. **/go endpoint**: Implement state inspection route returning `{ initial_state, current_state, state_diff }`
7. **Integration**: Import and compose components from Implementers 1-3
8. **Initial data**: Seed app with 15+ cryptocurrencies, sample portfolio, transaction history
9. **Live price simulation**: Interval-based price fluctuations (following robinhood_mock pattern)
10. **Notifications**: Notification state and dropdown

**Dependencies**: Implementers 1-3 must finish their components first

**Data domain**: All (manages entire state tree)

---

## 6. API Endpoints

**Required**:
- `GET /go` - Returns `{ initial_state, current_state, state_diff }` for RL training

**Client-side actions** (all handled via Context):
- Buy crypto: updates `holdings`, `transactions`, `currentUser.cashBalance`
- Sell crypto: updates `holdings`, `transactions`, `currentUser.cashBalance`
- Send crypto: updates `holdings`, `transactions`
- Toggle watchlist: updates `watchlist`
- Mark notification read: updates `notifications`

**Note**: This is a pure frontend mock. All state changes are client-side via React Context. The `/go` endpoint is a client-side route, not a server API.

---

## 7. Tech Stack

- **Framework**: React 18
- **Build tool**: Vite
- **State management**: React Context (medium complexity, similar to robinhood_mock and paypal_mock patterns)
- **Styling**: Tailwind CSS
- **Routing**: react-router-dom v6
- **Persistence**: localStorage (with session ID support for RL training)
- **Icons**: lucide-react

**Rationale**:
- Context over Redux: App state is moderately complex but not deeply nested; Context with action functions (following robinhood_mock pattern) is sufficient
- Tailwind over CSS: Faster development, consistent dark-theme styling (Xoinbase uses a clean dark/light theme)
- No chart library: Price charts will use inline SVG polylines (keeping dependencies minimal, similar to robinhood_mock sparklines)
- lucide-react: Lightweight icon library already used across many mocks

---

## 8. File Structure

```
coinbase_mock/
├── public/
├── src/
│   ├── App.jsx                          # Main app with routing (Implementer-4)
│   ├── main.jsx                         # React entry point
│   ├── index.css                        # Global styles + Tailwind
│   ├── components/
│   │   ├── Layout.jsx                   # Sidebar + TopBar + Outlet (Implementer-4)
│   │   ├── Sidebar.jsx                  # Left navigation (Implementer-4)
│   │   ├── TopBar.jsx                   # Top bar with search/notifications (Implementer-4)
│   │   ├── NotificationDropdown.jsx     # Notification bell dropdown (Implementer-4)
│   │   ├── PortfolioChart.jsx           # Portfolio value line chart (Implementer-1)
│   │   ├── PortfolioSummary.jsx         # Balance + gain/loss summary (Implementer-1)
│   │   ├── HoldingsList.jsx             # Holdings list container (Implementer-1)
│   │   ├── HoldingRow.jsx              # Individual holding row (Implementer-1)
│   │   ├── WatchlistWidget.jsx          # Compact watchlist widget (Implementer-1)
│   │   ├── TradeForm.jsx                # Buy/sell order form (Implementer-2)
│   │   ├── TradeModal.jsx               # Trade modal wrapper (Implementer-2)
│   │   ├── TradeConfirmation.jsx        # Order receipt (Implementer-2)
│   │   ├── SendReceiveModal.jsx         # Send/receive crypto modal (Implementer-2)
│   │   ├── TransactionList.jsx          # Transaction history list (Implementer-2)
│   │   ├── TransactionRow.jsx           # Individual transaction row (Implementer-2)
│   │   ├── AssetTable.jsx               # Sortable asset table (Implementer-3)
│   │   ├── AssetRow.jsx                 # Individual asset row (Implementer-3)
│   │   ├── AssetDetail.jsx              # Asset detail view (Implementer-3)
│   │   ├── PriceChart.jsx               # Price chart with time selector (Implementer-3)
│   │   ├── AssetStats.jsx               # Market stats grid (Implementer-3)
│   │   └── SearchBar.jsx                # Asset search input (Implementer-3)
│   ├── pages/
│   │   ├── Home.jsx                     # Dashboard page (Implementer-4)
│   │   ├── Assets.jsx                   # Asset browser page (Implementer-4)
│   │   ├── AssetDetailPage.jsx          # Asset detail page (Implementer-4)
│   │   ├── Trade.jsx                    # Trade page (Implementer-4)
│   │   ├── History.jsx                  # Transaction history page (Implementer-4)
│   │   ├── Settings.jsx                 # Settings page (Implementer-4)
│   │   └── Go.jsx                       # State inspection endpoint (Implementer-4)
│   ├── context/
│   │   └── CoinbaseContext.jsx          # React Context provider (Implementer-4)
│   └── utils/
│       ├── dataManager.js               # Initial data, persistence, sessions (Implementer-4)
│       └── helpers.js                   # Formatting helpers (Implementer-4)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## 9. Initial Data Sample

```javascript
const initialData = {
  currentUser: {
    id: 'user_1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://picsum.photos/100/100?random=coinbase_user',
    cashBalance: 5000.00,
    defaultCurrency: 'USD'
  },

  assets: [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 43250.00,
      priceChange24h: 2.34,
      priceChange7d: -1.15,
      marketCap: 845000000000,
      volume24h: 28500000000,
      circulatingSupply: 19500000,
      maxSupply: 21000000,
      about: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by an anonymous entity known as Satoshi Nakamoto. It operates on a peer-to-peer network using blockchain technology.',
      category: 'Store of Value',
      iconColor: '#F7931A',
      priceHistory: [41800, 42100, 42500, 43000, 42800, 43100, 43250]
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      currentPrice: 2280.00,
      priceChange24h: 1.87,
      priceChange7d: 3.42,
      marketCap: 274000000000,
      volume24h: 15200000000,
      circulatingSupply: 120000000,
      maxSupply: null,
      about: 'Ethereum is a decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime, fraud, or interference.',
      category: 'Smart Contract Platform',
      iconColor: '#627EEA',
      priceHistory: [2200, 2220, 2250, 2240, 2270, 2260, 2280]
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      currentPrice: 98.50,
      priceChange24h: -0.85,
      priceChange7d: 5.12,
      marketCap: 42000000000,
      volume24h: 3200000000,
      circulatingSupply: 430000000,
      maxSupply: null,
      about: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.',
      category: 'Smart Contract Platform',
      iconColor: '#9945FF',
      priceHistory: [95.00, 96.20, 97.50, 99.00, 98.00, 97.80, 98.50]
    },
    {
      id: 'doge',
      name: 'Dogecoin',
      symbol: 'DOGE',
      currentPrice: 0.0825,
      priceChange24h: 4.21,
      priceChange7d: -2.30,
      marketCap: 11700000000,
      volume24h: 890000000,
      circulatingSupply: 142000000000,
      maxSupply: null,
      about: 'Dogecoin is a cryptocurrency featuring a likeness of the Shiba Inu dog from the "Doge" meme as its logo.',
      category: 'Meme',
      iconColor: '#C2A633',
      priceHistory: [0.078, 0.080, 0.079, 0.081, 0.083, 0.084, 0.0825]
    },
    {
      id: 'ada',
      name: 'Cardano',
      symbol: 'ADA',
      currentPrice: 0.52,
      priceChange24h: -1.22,
      priceChange7d: 0.85,
      marketCap: 18200000000,
      volume24h: 520000000,
      circulatingSupply: 35000000000,
      maxSupply: 45000000000,
      about: 'Cardano is a proof-of-stake blockchain platform that aims to allow changemakers, innovators, and visionaries to bring about positive global change.',
      category: 'Smart Contract Platform',
      iconColor: '#0033AD',
      priceHistory: [0.51, 0.52, 0.53, 0.525, 0.52, 0.515, 0.52]
    },
    {
      id: 'xrp',
      name: 'XRP',
      symbol: 'XRP',
      currentPrice: 0.62,
      priceChange24h: 0.95,
      priceChange7d: -0.42,
      marketCap: 33500000000,
      volume24h: 1100000000,
      circulatingSupply: 54000000000,
      maxSupply: 100000000000,
      about: 'XRP is the native cryptocurrency of the XRP Ledger, designed for fast, low-cost international payments.',
      category: 'Payments',
      iconColor: '#23292F',
      priceHistory: [0.60, 0.61, 0.615, 0.62, 0.618, 0.625, 0.62]
    },
    {
      id: 'dot',
      name: 'Polkadot',
      symbol: 'DOT',
      currentPrice: 7.15,
      priceChange24h: -0.45,
      priceChange7d: 2.10,
      marketCap: 9800000000,
      volume24h: 340000000,
      circulatingSupply: 1370000000,
      maxSupply: null,
      about: 'Polkadot enables cross-blockchain transfers of any type of data or asset, not just tokens, making a wide range of blockchains interoperable.',
      category: 'Infrastructure',
      iconColor: '#E6007A',
      priceHistory: [6.90, 7.00, 7.10, 7.05, 7.12, 7.20, 7.15]
    },
    {
      id: 'avax',
      name: 'Avalanche',
      symbol: 'AVAX',
      currentPrice: 35.20,
      priceChange24h: 3.15,
      priceChange7d: 1.88,
      marketCap: 12800000000,
      volume24h: 680000000,
      circulatingSupply: 365000000,
      maxSupply: 720000000,
      about: 'Avalanche is an open-source platform for launching decentralized applications and enterprise blockchain deployments.',
      category: 'Smart Contract Platform',
      iconColor: '#E84142',
      priceHistory: [33.50, 34.00, 34.50, 35.00, 34.80, 35.10, 35.20]
    },
    {
      id: 'matic',
      name: 'Polygon',
      symbol: 'MATIC',
      currentPrice: 0.89,
      priceChange24h: 1.42,
      priceChange7d: -0.65,
      marketCap: 8200000000,
      volume24h: 420000000,
      circulatingSupply: 9200000000,
      maxSupply: 10000000000,
      about: 'Polygon is a scaling solution for Ethereum that provides faster and cheaper transactions using Layer 2 sidechains.',
      category: 'Layer 2',
      iconColor: '#8247E5',
      priceHistory: [0.87, 0.88, 0.89, 0.885, 0.89, 0.895, 0.89]
    },
    {
      id: 'link',
      name: 'Chainlink',
      symbol: 'LINK',
      currentPrice: 14.50,
      priceChange24h: -0.72,
      priceChange7d: 1.95,
      marketCap: 8500000000,
      volume24h: 560000000,
      circulatingSupply: 587000000,
      maxSupply: 1000000000,
      about: 'Chainlink is a decentralized oracle network that provides real-world data to smart contracts on the blockchain.',
      category: 'Oracle',
      iconColor: '#2A5ADA',
      priceHistory: [14.20, 14.30, 14.45, 14.50, 14.40, 14.55, 14.50]
    },
    {
      id: 'ltc',
      name: 'Litecoin',
      symbol: 'LTC',
      currentPrice: 68.40,
      priceChange24h: 0.55,
      priceChange7d: -1.20,
      marketCap: 5100000000,
      volume24h: 380000000,
      circulatingSupply: 74000000,
      maxSupply: 84000000,
      about: 'Litecoin is a peer-to-peer cryptocurrency created as a "lighter" version of Bitcoin with faster transaction times.',
      category: 'Payments',
      iconColor: '#BFBBBB',
      priceHistory: [67.50, 68.00, 68.20, 68.10, 68.30, 68.50, 68.40]
    },
    {
      id: 'uni',
      name: 'Uniswap',
      symbol: 'UNI',
      currentPrice: 6.25,
      priceChange24h: 2.08,
      priceChange7d: 4.50,
      marketCap: 4700000000,
      volume24h: 210000000,
      circulatingSupply: 753000000,
      maxSupply: 1000000000,
      about: 'Uniswap is a decentralized exchange (DEX) protocol on Ethereum that allows users to swap ERC-20 tokens without intermediaries.',
      category: 'DeFi',
      iconColor: '#FF007A',
      priceHistory: [5.90, 6.00, 6.10, 6.15, 6.20, 6.22, 6.25]
    },
    {
      id: 'atom',
      name: 'Cosmos',
      symbol: 'ATOM',
      currentPrice: 9.80,
      priceChange24h: -1.55,
      priceChange7d: 0.32,
      marketCap: 3800000000,
      volume24h: 190000000,
      circulatingSupply: 390000000,
      maxSupply: null,
      about: 'Cosmos is a decentralized network of independent parallel blockchains, each powered by classical BFT consensus algorithms.',
      category: 'Infrastructure',
      iconColor: '#2E3148',
      priceHistory: [9.90, 9.85, 9.80, 9.75, 9.82, 9.78, 9.80]
    },
    {
      id: 'xlm',
      name: 'Stellar',
      symbol: 'XLM',
      currentPrice: 0.125,
      priceChange24h: 0.80,
      priceChange7d: -0.95,
      marketCap: 3500000000,
      volume24h: 150000000,
      circulatingSupply: 28000000000,
      maxSupply: 50000000000,
      about: 'Stellar is an open network for storing and moving money, making it possible to create, send, and trade digital representations of all forms of currency.',
      category: 'Payments',
      iconColor: '#000000',
      priceHistory: [0.122, 0.123, 0.124, 0.125, 0.124, 0.126, 0.125]
    },
    {
      id: 'algo',
      name: 'Algorand',
      symbol: 'ALGO',
      currentPrice: 0.185,
      priceChange24h: 1.10,
      priceChange7d: 2.75,
      marketCap: 1500000000,
      volume24h: 85000000,
      circulatingSupply: 8100000000,
      maxSupply: 10000000000,
      about: 'Algorand is a self-sustaining, decentralized, blockchain-based network that supports a wide range of applications.',
      category: 'Smart Contract Platform',
      iconColor: '#000000',
      priceHistory: [0.178, 0.180, 0.182, 0.184, 0.183, 0.185, 0.185]
    }
  ],

  holdings: [
    { assetId: 'btc', quantity: 0.5, avgBuyPrice: 41000.00 },
    { assetId: 'eth', quantity: 3.2, avgBuyPrice: 2150.00 },
    { assetId: 'sol', quantity: 25.0, avgBuyPrice: 85.00 },
    { assetId: 'link', quantity: 50.0, avgBuyPrice: 13.00 },
    { assetId: 'doge', quantity: 10000, avgBuyPrice: 0.075 }
  ],

  transactions: [
    {
      id: 'tx_1',
      type: 'buy',
      assetId: 'btc',
      quantity: 0.25,
      pricePerUnit: 42000.00,
      totalAmount: 10500.00,
      fee: 14.99,
      status: 'completed',
      timestamp: '2026-02-15T10:30:00Z'
    },
    {
      id: 'tx_2',
      type: 'buy',
      assetId: 'btc',
      quantity: 0.25,
      pricePerUnit: 40000.00,
      totalAmount: 10000.00,
      fee: 14.99,
      status: 'completed',
      timestamp: '2026-01-20T14:15:00Z'
    },
    {
      id: 'tx_3',
      type: 'buy',
      assetId: 'eth',
      quantity: 3.2,
      pricePerUnit: 2150.00,
      totalAmount: 6880.00,
      fee: 9.99,
      status: 'completed',
      timestamp: '2026-01-10T09:00:00Z'
    },
    {
      id: 'tx_4',
      type: 'buy',
      assetId: 'sol',
      quantity: 25.0,
      pricePerUnit: 85.00,
      totalAmount: 2125.00,
      fee: 4.99,
      status: 'completed',
      timestamp: '2025-12-28T16:45:00Z'
    },
    {
      id: 'tx_5',
      type: 'buy',
      assetId: 'link',
      quantity: 50.0,
      pricePerUnit: 13.00,
      totalAmount: 650.00,
      fee: 2.99,
      status: 'completed',
      timestamp: '2025-12-15T11:20:00Z'
    },
    {
      id: 'tx_6',
      type: 'buy',
      assetId: 'doge',
      quantity: 10000,
      pricePerUnit: 0.075,
      totalAmount: 750.00,
      fee: 1.99,
      status: 'completed',
      timestamp: '2025-11-30T08:30:00Z'
    },
    {
      id: 'tx_7',
      type: 'sell',
      assetId: 'ada',
      quantity: 500,
      pricePerUnit: 0.48,
      totalAmount: 240.00,
      fee: 1.49,
      status: 'completed',
      timestamp: '2025-11-15T13:00:00Z'
    },
    {
      id: 'tx_8',
      type: 'send',
      assetId: 'eth',
      quantity: 0.5,
      pricePerUnit: 2100.00,
      totalAmount: 1050.00,
      fee: 5.00,
      toAddress: '0x742d...3abc',
      status: 'completed',
      timestamp: '2025-10-20T10:15:00Z'
    }
  ],

  watchlist: ['btc', 'eth', 'sol', 'avax', 'dot'],

  paymentMethods: [
    { id: 'pm_1', type: 'bank', name: 'Chase Bank', last4: '4422', isDefault: true },
    { id: 'pm_2', type: 'card', brand: 'Visa', last4: '8899', isDefault: false }
  ],

  notifications: [
    {
      id: 'notif_1',
      type: 'trade_completed',
      message: 'Your purchase of 0.25 BTC was completed',
      timestamp: '2026-02-15T10:30:00Z',
      read: false,
      assetId: 'btc'
    },
    {
      id: 'notif_2',
      type: 'price_alert',
      message: 'Bitcoin is up 5% in the last 24 hours',
      timestamp: '2026-02-14T08:00:00Z',
      read: true,
      assetId: 'btc'
    },
    {
      id: 'notif_3',
      type: 'security',
      message: 'New login detected from Chrome on macOS',
      timestamp: '2026-02-13T15:30:00Z',
      read: true,
      assetId: null
    }
  ],

  ui: {
    currentView: 'home',
    selectedAsset: null,
    searchQuery: '',
    tradeModal: { isOpen: false, mode: 'buy', assetId: null },
    sendReceiveModal: { isOpen: false, mode: 'send', assetId: null },
    sortBy: 'marketCap',
    sortDirection: 'desc',
    historyFilter: 'all'
  }
};
```

---

## 10. References

**Similar mocks studied**:
- `robinhood_mock` - Financial trading app with stock charts, order forms, portfolio tracking, live price simulation. Used React Context via `lib/store.jsx`. Closest existing pattern to Xoinbase.
- `paypal_mock` - Financial app with balance, transactions, send/receive money. Used React Context via `context/StoreContext.jsx` with session-aware persistence.
- `slack_mock` - React Context state management pattern with action functions, session ID support, and `/go` state inspection.
- `amazon_mock` - E-commerce patterns (product listing, cart) for reference on asset browsing.

**Real app research**:
- https://www.coinbase.com - Main web app interface
- Xoinbase Design System (cds.coinbase.com) - Sidebar, TopNavBar navigation patterns
- Xoinbase Help Center - Portfolio tracking, watchlist, trading features

**Key design decisions**:
- **Flat data structure** with ID references (holdings reference assetId, not nested asset objects) for easier state diff tracking
- **Separate UI state** from data state (modals, search, sort are UI state; holdings, transactions are data)
- **Live price simulation** via setInterval (following robinhood_mock pattern) to make the app feel dynamic
- **Session-aware persistence** (`?sid=` parameter) for RL training compatibility
- **No external chart library** - use inline SVG polylines for price charts and sparklines to minimize dependencies
- **Holdings as separate array** from assets (not embedded in asset objects) to keep asset data pure/static and holdings user-specific
- **Portfolio value calculated on-the-fly** from holdings + current asset prices rather than stored as a separate field
