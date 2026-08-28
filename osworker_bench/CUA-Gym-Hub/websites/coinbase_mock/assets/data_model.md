# Xoinbase Mock — Data Model

## Entity Relationship Overview

```
currentUser ──┐
              ├── cashBalance (modified by buy/sell)
              └── defaultCurrency

assets[] ────────── Referenced by holdings, transactions, watchlist, notifications
  └── priceHistory[] (for sparklines/charts)

holdings[] ──────── assetId → assets[].id (portfolio positions)
  └── quantity, avgBuyPrice

transactions[] ──── assetId → assets[].id (trade/send history)
  └── type: buy|sell|send|receive

watchlist[] ─────── array of asset IDs

paymentMethods[] ── standalone (payment options)

notifications[] ─── assetId → assets[].id (optional)

ui ──────────────── modal states, sort prefs, filters
```

---

## Entity Definitions

### currentUser
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique user ID | `"user_1"` |
| name | string | Display name (editable) | `"Demo User"` |
| email | string | Email address (editable) | `"demo@example.com"` |
| avatar | string | Avatar URL | `"https://picsum.photos/100/100?random=coinbase_user"` |
| cashBalance | number | USD cash available for buying | `5000.00` |
| defaultCurrency | string | Display currency preference | `"USD"` |

**Mutated by**: buyAsset (decrease cashBalance), sellAsset (increase cashBalance), Settings page (name, email, defaultCurrency)

---

### assets[]
15 cryptocurrency records. This is the "catalog" — available assets regardless of user ownership.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Lowercase ticker ID | `"btc"` |
| name | string | Full cryptocurrency name | `"Bitcoin"` |
| symbol | string | Uppercase ticker symbol | `"BTC"` |
| currentPrice | number | Current price in USD | `43250.00` |
| priceChange24h | number | 24-hour price change % | `2.34` |
| priceChange7d | number | 7-day price change % | `-1.15` |
| marketCap | number | Market capitalization in USD | `845000000000` |
| volume24h | number | 24-hour trading volume in USD | `28500000000` |
| circulatingSupply | number | Coins in circulation | `19500000` |
| maxSupply | number\|null | Maximum supply (null = unlimited) | `21000000` |
| about | string | Description paragraph | `"Bitcoin is the first..."` |
| category | string | Asset category label | `"Store of Value"` |
| iconColor | string | Hex color for icon circle | `"#F7931A"` |
| priceHistory | number[] | Array of 7 historical prices (for sparklines) | `[41800, 42100, ...]` |

**Asset list** (15 total): BTC, ETH, SOL, DOGE, ADA, XRP, DOT, AVAX, MATIC, LINK, LTC, UNI, ATOM, XLM, ALGO

**Mutated by**: Live price simulation (currentPrice fluctuates every 5s by ±0.5%)

---

### holdings[]
User's portfolio positions. Each entry links to one asset.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| assetId | string | References `assets[].id` | `"btc"` |
| quantity | number | Amount of crypto held | `0.5` |
| avgBuyPrice | number | Average purchase price in USD | `41000.00` |

**Computed values** (not stored, calculated at render):
- `currentValue = quantity * asset.currentPrice`
- `gainLoss = currentValue - (quantity * avgBuyPrice)`
- `gainLossPercent = ((currentValue - costBasis) / costBasis) * 100`

**Initial holdings** (5 positions): BTC (0.5), ETH (3.2), SOL (25), LINK (50), DOGE (10000)

**Mutated by**: buyAsset (add/increase), sellAsset (decrease/remove), sendAsset (decrease/remove)

---

### transactions[]
Chronological history of all buy/sell/send/receive actions.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique transaction ID | `"tx_1"` |
| type | string | `"buy"` \| `"sell"` \| `"send"` \| `"receive"` | `"buy"` |
| assetId | string | References `assets[].id` | `"btc"` |
| quantity | number | Amount of crypto transacted | `0.25` |
| pricePerUnit | number | USD price at time of transaction | `42000.00` |
| totalAmount | number | Total USD value | `10500.00` |
| fee | number | Transaction fee in USD | `14.99` |
| status | string | `"completed"` \| `"pending"` | `"completed"` |
| timestamp | string | ISO 8601 datetime | `"2026-02-15T10:30:00Z"` |
| toAddress | string\|undefined | Wallet address (send only) | `"0x742d...3abc"` |

**Fee calculation**: `max(0.99, amount * 0.0015)` — 0.15% of trade value, minimum $0.99

**Initial transactions** (8 records): 6 buys, 1 sell, 1 send — spanning Nov 2025 to Feb 2026

**Mutated by**: buyAsset, sellAsset, sendAsset (new transaction prepended to array)

---

### watchlist
Simple array of asset IDs the user has starred.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| (array item) | string | References `assets[].id` | `"btc"` |

**Initial**: `["btc", "eth", "sol", "avax", "dot"]`

**Mutated by**: toggleWatchlist (add/remove asset ID)

---

### paymentMethods[]
User's linked payment methods for buying crypto.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique payment method ID | `"pm_1"` |
| type | string | `"bank"` \| `"card"` | `"bank"` |
| name | string | Bank name (for bank type) | `"Chase Bank"` |
| brand | string\|undefined | Card brand (for card type) | `"Visa"` |
| last4 | string | Last 4 digits | `"4422"` |
| isDefault | boolean | Whether this is the default | `true` |

**Initial**: Chase Bank (default), Visa card

---

### notifications[]
In-app notifications for trades, price alerts, and security events.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique notification ID | `"notif_1"` |
| type | string | `"trade_completed"` \| `"price_alert"` \| `"security"` | `"trade_completed"` |
| message | string | Human-readable notification text | `"Your purchase of 0.25 BTC was completed"` |
| timestamp | string | ISO 8601 datetime | `"2026-02-15T10:30:00Z"` |
| read | boolean | Whether user has seen this | `false` |
| assetId | string\|null | Related asset (null for security) | `"btc"` |

**Initial**: 3 notifications (1 unread trade, 1 read price alert, 1 read security alert)

**Mutated by**: markNotificationRead, markAllNotificationsRead, buyAsset/sellAsset/sendAsset (creates new notification)

---

### ui
UI state tracking for modals, sort preferences, and filters.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| currentView | string | Current page name | `"home"` |
| selectedAsset | string\|null | Currently selected asset ID | `null` |
| searchQuery | string | Search input text | `""` |
| tradeModal.isOpen | boolean | Whether trade modal is visible | `false` |
| tradeModal.mode | string | `"buy"` \| `"sell"` | `"buy"` |
| tradeModal.assetId | string\|null | Pre-selected asset in modal | `null` |
| sendReceiveModal.isOpen | boolean | Whether send/receive modal is visible | `false` |
| sendReceiveModal.mode | string | `"send"` \| `"receive"` | `"send"` |
| sendReceiveModal.assetId | string\|null | Pre-selected asset | `null` |
| sortBy | string | Asset table sort column | `"marketCap"` |
| sortDirection | string | `"asc"` \| `"desc"` | `"desc"` |
| historyFilter | string | Transaction filter | `"all"` |

---

## createInitialData() Structure

The `getInitialData()` function in `utils/dataManager.js` returns a deep-cloned copy of the `initialData` object defined at module scope. The structure is:

```javascript
{
  currentUser: { /* see above */ },
  assets: [ /* 15 cryptocurrency objects */ ],
  holdings: [ /* 5 portfolio positions */ ],
  transactions: [ /* 8 historical transactions */ ],
  watchlist: [ /* 5 asset IDs */ ],
  paymentMethods: [ /* 2 payment methods */ ],
  notifications: [ /* 3 notifications */ ],
  ui: { /* UI state defaults */ }
}
```

This is already fully implemented in `src/utils/dataManager.js`. See ARCHITECTURE.md §9 for complete initial data sample.

---

## State Mutation Summary

| Action | Mutates |
|--------|---------|
| buyAsset(assetId, usdAmount) | currentUser.cashBalance ↓, holdings ↑, transactions ↑, notifications ↑, ui.tradeModal → closed |
| sellAsset(assetId, quantity) | currentUser.cashBalance ↑, holdings ↓, transactions ↑, notifications ↑, ui.tradeModal → closed |
| sendAsset(assetId, quantity, address) | holdings ↓, transactions ↑, notifications ↑, ui.sendReceiveModal → closed |
| toggleWatchlist(assetId) | watchlist (add/remove) |
| markNotificationRead(id) | notifications[i].read = true |
| markAllNotificationsRead() | all notifications.read = true |
| updateState(partial) | Shallow merge into root state |
| Live price simulation | assets[*].currentPrice (every 5s) |
