# coinbase_mock Schema

**Deploy order**: 8 (BASE_PORT=8000 -> port 8008)
**Base URL**: `http://172.17.46.46:8008/`
**Go Endpoint**: `GET /go?sid=<sid>` -> `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` -> `{stored_state, has_custom_state, sid}`

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Portfolio dashboard with balance, holdings, quick-action buttons (Buy/Sell/Send/Receive), watchlist, recent transactions, "View all" link |
| `/assets` | Assets | Browse all cryptocurrencies with sortable table; clicking any row navigates to asset detail |
| `/asset/:id` | AssetDetail | Individual crypto page with chart, stats, buy/sell, about |
| `/trade` | Trade | Buy/sell crypto with order form and recent transactions |
| `/history` | History | Full transaction history with type filters |
| `/settings` | Settings | Profile editing, payment methods (add/remove/set-default), currency, notification preferences |
| `/go` | Go | State inspection endpoint for RL training |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user profile and account balance |
| `assets` | array | All available cryptocurrencies with prices and market data (15 assets) |
| `holdings` | array | User's crypto portfolio positions; each references an asset by `assetId` |
| `transactions` | array | Full buy/sell/send transaction history |
| `watchlist` | array | Asset IDs (strings) that the user has starred for tracking |
| `paymentMethods` | array | Bank accounts and cards linked to the account |
| `notifications` | array | Trade confirmations, price alerts, security alerts |
| `ui` | object | UI state: current view, search query, sort settings, modal states, history filter |

### currentUser

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"user_1"` | User ID |
| `name` | string | `"Demo User"` | Full name (editable in Settings) |
| `email` | string | `"demo@example.com"` | Email address (editable in Settings) |
| `avatar` | string | `"https://picsum.photos/100/100?random=coinbase_user"` | Avatar URL |
| `cashBalance` | number | `5000.00` | USD cash balance available for purchases |
| `defaultCurrency` | string | `"USD"` | Display currency (`"USD"`, `"EUR"`, or `"GBP"`) |
| `notificationPreferences` | object | `{trade_notifications: true, price_alerts: true, security_alerts: true}` | Per-type notification on/off preferences |
| `notificationPreferences.trade_notifications` | boolean | `true` | Whether trade confirmation notifications are enabled |
| `notificationPreferences.price_alerts` | boolean | `true` | Whether price alert notifications are enabled |
| `notificationPreferences.security_alerts` | boolean | `true` | Whether security alert notifications are enabled |

### assets[] (Asset)

Each element represents a tradeable cryptocurrency. 15 assets in the default dataset.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"btc"` | Unique asset identifier (lowercase ticker) |
| `name` | string | `"Bitcoin"` | Full name |
| `symbol` | string | `"BTC"` | Ticker symbol (uppercase) |
| `currentPrice` | number | `43250.00` | Current price in USD (fluctuates via live simulation every 5s) |
| `priceChange24h` | number | `2.34` | 24-hour price change percentage |
| `priceChange7d` | number | `-1.15` | 7-day price change percentage |
| `marketCap` | number | `845000000000` | Market capitalization in USD |
| `volume24h` | number | `28500000000` | 24-hour trading volume in USD |
| `circulatingSupply` | number | `19500000` | Circulating token supply |
| `maxSupply` | number\|null | `21000000` | Max supply (null if unlimited) |
| `about` | string | `"Bitcoin is the first..."` | Description text |
| `category` | string | `"Store of Value"` | Asset category label |
| `iconColor` | string | `"#F7931A"` | Hex color for the asset icon circle |
| `priceHistory` | array\<number\> | `[38200, 38900, ...]` | Array of 30 historical daily prices for sparkline chart |

**Default asset IDs**: `btc`, `eth`, `sol`, `doge`, `ada`, `xrp`, `dot`, `avax`, `matic`, `link`, `ltc`, `uni`, `atom`, `xlm`, `algo`

**Note**: `currentPrice` fluctuates automatically via a 5-second interval simulation (+/- 0.5% random change). This means the `assets` key in `state_diff` will almost always show changes even if no user action occurred.

**Note**: `priceHistory` now contains 30 data points (one per day, oldest to newest). Time range buttons on the PriceChart slice this: `1D` = last 2 points, `1W` = last 3, `1M` = last 5, `1Y` = last 6, `All` = all 30.

### holdings[] (Holding)

Each element represents the user's position in a specific cryptocurrency. Holdings reference assets by `assetId`.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `assetId` | string | `"btc"` | Foreign key to `assets[].id` |
| `quantity` | number | `0.5` | Amount of the asset held |
| `avgBuyPrice` | number | `41000.00` | Average purchase price in USD |

**Default holdings**: `btc` (0.5), `eth` (3.2), `sol` (25.0), `link` (50.0), `doge` (10000)

**Computed values** (not stored, derived at render time):
- Portfolio value = sum of (holding.quantity * asset.currentPrice) for each holding
- Gain/loss per holding = (quantity * currentPrice) - (quantity * avgBuyPrice)

### transactions[] (Transaction)

Each element represents a completed buy, sell, or send operation. Newest transactions are prepended to the array.

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"tx_1"` | Unique transaction ID (auto-generated as `tx_<timestamp>`) |
| `type` | string | `"buy"` | Transaction type: `"buy"`, `"sell"`, or `"send"` |
| `assetId` | string | `"btc"` | Foreign key to `assets[].id` |
| `quantity` | number | `0.25` | Amount of asset transacted |
| `pricePerUnit` | number | `42000.00` | Price per unit at time of transaction |
| `totalAmount` | number | `10500.00` | Total USD value of the transaction |
| `fee` | number | `14.99` | Transaction fee in USD |
| `status` | string | `"completed"` | Transaction status (always `"completed"` in this mock) |
| `timestamp` | string | `"2026-02-15T10:30:00Z"` | ISO 8601 timestamp |
| `toAddress` | string\|undefined | `"0x742d...3abc"` | Recipient wallet address (only present for `type: "send"`) |

**Fee calculation** (unified across all flows):
- Buy/Sell: `usdAmount * 0.0149` (1.49% of transaction amount)
- Send: `quantity * asset.currentPrice * 0.0149` (1.49% of USD value)

All three operations (`buyAsset`, `sellAsset`, `sendAsset`) now go through the context functions which apply the consistent 1.49% fee rate.

**Default transactions**: 8 transactions (`tx_1` through `tx_8`) covering buys, a sell, and a send.

### watchlist

Array of asset ID strings. Default: `["btc", "eth", "sol", "avax", "dot"]`

### paymentMethods[] (PaymentMethod)

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"pm_1"` | Unique payment method ID |
| `type` | string | `"bank"` | Payment type: `"bank"` or `"card"` |
| `name` | string\|undefined | `"Chase Bank"` | Bank name (present when `type: "bank"`) |
| `brand` | string\|undefined | `"Visa"` | Card brand (present when `type: "card"`) |
| `last4` | string | `"4422"` | Last 4 digits |
| `isDefault` | boolean | `true` | Whether this is the default payment method |

**Default payment methods**:
- `pm_1`: Chase Bank ****4422 (bank, default)
- `pm_2`: Visa ****8899 (card)

**Payment method actions** (all update `paymentMethods` in state):
- **Set default**: Clicking "Set default" on a non-default method sets `isDefault: true` for that method and `false` for all others
- **Remove**: Clicking "Remove" deletes the method; if the removed method was default, the first remaining method becomes default
- **Add**: Clicking "+ Add payment method" appends a new bank account entry with a random `last4`

### notifications[] (Notification)

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"notif_1"` | Unique notification ID (auto-generated as `notif_<timestamp>`) |
| `type` | string | `"trade_completed"` | Notification type: `"trade_completed"`, `"price_alert"`, or `"security"` |
| `message` | string | `"Your purchase of 0.25 BTC was completed"` | Human-readable message |
| `timestamp` | string | `"2026-02-15T10:30:00Z"` | ISO 8601 timestamp |
| `read` | boolean | `false` | Whether the notification has been read |
| `assetId` | string\|null | `"btc"` | Related asset ID (null for security notifications) |

**Default notifications**: 3 (`notif_1` unread trade, `notif_2` read price alert, `notif_3` read security alert)

### ui

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentView` | string | `"home"` | Current active view name |
| `selectedAsset` | string\|null | `null` | Currently selected asset ID |
| `searchQuery` | string | `""` | Asset search query text |
| `tradeModal` | object | `{isOpen: false, mode: "buy", assetId: null}` | Trade modal state |
| `tradeModal.isOpen` | boolean | `false` | Whether the buy/sell modal is open |
| `tradeModal.mode` | string | `"buy"` | `"buy"` or `"sell"` |
| `tradeModal.assetId` | string\|null | `null` | Pre-selected asset for the trade |
| `sendReceiveModal` | object | `{isOpen: false, mode: "send", assetId: null}` | Send/receive modal state |
| `sendReceiveModal.isOpen` | boolean | `false` | Whether the send/receive modal is open |
| `sendReceiveModal.mode` | string | `"send"` | `"send"` or `"receive"` |
| `sendReceiveModal.assetId` | string\|null | `null` | Pre-selected asset for send |
| `sortBy` | string | `"marketCap"` | Asset table sort column: `"rank"`, `"name"`, `"currentPrice"`, `"priceChange24h"`, `"priceChange7d"`, `"marketCap"`, `"volume24h"` |
| `sortDirection` | string | `"desc"` | Sort direction: `"asc"` or `"desc"` |
| `historyFilter` | string | `"all"` | Transaction history filter: `"all"`, `"buy"`, `"sell"`, `"send"`, `"receive"` — now connected to global state and observable via `/go` |

### Entity Relationships

- `holdings[].assetId` -> `assets[].id`
- `transactions[].assetId` -> `assets[].id`
- `watchlist[]` values -> `assets[].id`
- `notifications[].assetId` -> `assets[].id` (nullable)
- `ui.tradeModal.assetId` -> `assets[].id` (nullable)
- `ui.sendReceiveModal.assetId` -> `assets[].id` (nullable)

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8008/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "currentUser": {
          "id": "user_1",
          "name": "Demo User",
          "email": "demo@example.com",
          "avatar": "https://picsum.photos/100/100?random=coinbase_user",
          "cashBalance": 5000.00,
          "defaultCurrency": "USD",
          "notificationPreferences": {
            "trade_notifications": true,
            "price_alerts": true,
            "security_alerts": true
          }
        },
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
            "about": "Bitcoin is the first decentralized cryptocurrency.",
            "category": "Store of Value",
            "iconColor": "#F7931A",
            "priceHistory": [38200, 38900, 39400, 40100, 39800, 40500, 41200, 40900, 41500, 42000, 41600, 42200, 43000, 42500, 41800, 42100, 42500, 43000, 42800, 43100, 43500, 42900, 43200, 43800, 44100, 43600, 43300, 43700, 43100, 43250]
          },
          {
            "id": "eth",
            "name": "Ethereum",
            "symbol": "ETH",
            "currentPrice": 2280.00,
            "priceChange24h": 1.87,
            "priceChange7d": 3.42,
            "marketCap": 274000000000,
            "volume24h": 15200000000,
            "circulatingSupply": 120000000,
            "maxSupply": null,
            "about": "Ethereum is a decentralized smart contract platform.",
            "category": "Smart Contract Platform",
            "iconColor": "#627EEA",
            "priceHistory": [2050, 2080, 2110, 2090, 2140, 2160, 2120, 2175, 2200, 2185, 2210, 2230, 2220, 2245, 2260, 2200, 2220, 2250, 2240, 2270, 2285, 2260, 2275, 2290, 2310, 2295, 2280, 2300, 2265, 2280]
          }
        ],
        "holdings": [
          {"assetId": "btc", "quantity": 0.5, "avgBuyPrice": 41000.00},
          {"assetId": "eth", "quantity": 3.2, "avgBuyPrice": 2150.00}
        ],
        "transactions": [
          {
            "id": "tx_1",
            "type": "buy",
            "assetId": "btc",
            "quantity": 0.25,
            "pricePerUnit": 42000.00,
            "totalAmount": 10500.00,
            "fee": 156.45,
            "status": "completed",
            "timestamp": "2026-02-15T10:30:00Z"
          }
        ],
        "watchlist": ["btc", "eth"],
        "paymentMethods": [
          {"id": "pm_1", "type": "bank", "name": "Chase Bank", "last4": "4422", "isDefault": true}
        ],
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
        "ui": {
          "currentView": "home",
          "selectedAsset": null,
          "searchQuery": "",
          "tradeModal": {"isOpen": false, "mode": "buy", "assetId": null},
          "sendReceiveModal": {"isOpen": false, "mode": "send", "assetId": null},
          "sortBy": "marketCap",
          "sortDirection": "desc",
          "historyFilter": "all"
        }
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Buy crypto (via TradeModal → TradeConfirmation) | `currentUser.cashBalance` decreases; `holdings` updated (new entry or increased quantity + updated avgBuyPrice); `transactions` grows by 1 (type `"buy"`); `notifications` grows by 1; `ui.tradeModal.isOpen` -> `false` |
| Sell crypto (via TradeModal → TradeConfirmation) | `currentUser.cashBalance` increases; `holdings` updated (decreased quantity or removed if ~0); `transactions` grows by 1 (type `"sell"`); `notifications` grows by 1; `ui.tradeModal.isOpen` -> `false` |
| Send crypto (via SendReceiveModal) | `holdings` updated (decreased quantity or removed); `transactions` grows by 1 (type `"send"`, includes `toAddress`); `notifications` grows by 1; `ui.sendReceiveModal.isOpen` -> `false` |
| Open trade modal (Buy) — from Home, AssetDetail, or Trade page | `ui.tradeModal` -> `{isOpen: true, mode: "buy", assetId: "<id>"}` |
| Open trade modal (Sell) — from Home, AssetDetail, or Trade page | `ui.tradeModal` -> `{isOpen: true, mode: "sell", assetId: "<id>"}` |
| Close trade modal | `ui.tradeModal` -> `{isOpen: false, mode: "buy", assetId: null}` |
| Open send/receive modal — from Home quick-actions or AssetDetail | `ui.sendReceiveModal` -> `{isOpen: true, mode: "send"\|"receive", assetId: "<id>"\|null}` |
| Close send/receive modal | `ui.sendReceiveModal` -> `{isOpen: false, mode: "send", assetId: null}` |
| Add asset to watchlist | `watchlist` array gains asset ID |
| Remove asset from watchlist | `watchlist` array loses asset ID |
| Mark notification as read | `notifications[i].read` -> `true` |
| Mark all notifications read | All `notifications[].read` -> `true` |
| Search assets | `ui.searchQuery` updated |
| Sort asset table | `ui.sortBy` and/or `ui.sortDirection` updated |
| Change transaction history filter | `ui.historyFilter` updated to `"all"`, `"buy"`, `"sell"`, `"send"`, or `"receive"` |
| Edit user name (Settings) | `currentUser.name` updated |
| Edit user email (Settings) | `currentUser.email` updated |
| Change default currency (Settings) | `currentUser.defaultCurrency` updated to `"USD"`, `"EUR"`, or `"GBP"` |
| Toggle notification preference (Settings) | `currentUser.notificationPreferences.<key>` toggled between `true` and `false` |
| Set default payment method (Settings) | `paymentMethods`: the selected method `isDefault` -> `true`; all others -> `false` |
| Remove payment method (Settings) | `paymentMethods` loses the entry; if it was default, next entry becomes default |
| Add payment method (Settings) | `paymentMethods` gains a new entry |
| Navigate to asset detail | `ui.selectedAsset` updated; `ui.currentView` -> `"asset"` |
| Navigate to assets page | `ui.currentView` -> `"assets"` |
| Navigate to history page (from Home "View all") | `ui.currentView` -> `"history"` |
| Price simulation (automatic, every 5s) | `assets[].currentPrice` fluctuates for all assets |

## Important Notes

1. **Live price simulation**: Asset prices auto-fluctuate every 5 seconds (+/- 0.5%). This means `assets` will almost always appear in `state_diff` even without user interaction. When evaluating agent actions, focus on changes to `holdings`, `transactions`, `watchlist`, `notifications`, and `currentUser.cashBalance` rather than `assets`.

2. **Portfolio value is computed, not stored**: Total portfolio value is calculated on-the-fly from `holdings` and `assets.currentPrice`. There is no stored `portfolioValue` field.

3. **Transaction IDs are timestamp-based**: New transactions get IDs like `tx_1709012345678` (prefix + `Date.now()`), and new notifications get IDs like `notif_1709012345678`.

4. **Holdings are removed when quantity reaches ~0**: If a sell or send reduces a holding's quantity to <= 0.000001, the holding entry is removed from the array entirely.

5. **State merge behavior**: When injecting state via POST, custom state is deep-merged with defaults using `deepMergeWithDefaults()`. Arrays are replaced wholesale (not merged element-by-element). Objects are recursively merged.

6. **Unified fee rate**: All buy, sell, and send operations use 1.49% of the USD transaction value as the fee. There is no longer a discrepancy between the preview/confirmation UI and the actual fee applied to state.

7. **Send/Receive modal access**: The `SendReceiveModal` can be opened from the Home dashboard quick-action buttons (Buy/Sell/Send/Receive) or from the AssetDetail page. The modal uses the context's `sendAsset()` function to update state consistently.

8. **historyFilter is global**: The transaction list filter (All/Buys/Sells/Sends/Receives) is stored in `ui.historyFilter` global state, making filter changes observable via the `/go` endpoint.

9. **notificationPreferences persist**: Notification toggle states are stored in `currentUser.notificationPreferences` and persist across page refreshes.
