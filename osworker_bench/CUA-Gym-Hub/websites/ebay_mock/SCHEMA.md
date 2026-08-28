# ebay_mock Schema

**Deploy order**: 11 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8011)
**Base URL**: `http://172.17.46.46:8011/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` (optionally add `"merge":true`)
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State inspect**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## Tech Stack

- React 18 + Vite 5
- React Router v6 (BrowserRouter)
- React Context + useReducer for state management
- Tailwind CSS 3 with custom xBay brand colors
- lucide-react for icons
- date-fns for date formatting
- State persisted to localStorage per session

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage with hero banner, category grid, featured active listings |
| `/search` | Search | Search results with sidebar filters; query params `q` (text), `c` (category), `seller` (seller userId) |
| `/item/:id` | ProductDetails | Individual listing detail: images (clickable gallery), bid form, buy-it-now modal, contact seller modal, bid history panel, seller info, watchlist toggle |
| `/dashboard` | Dashboard | My xBay: tabs for Buying (active bids + purchase history), Selling (active + sold listings with edit/end controls), Watchlist, Messages (inbox + detail + reply); tab selectable via `?tab=` param |
| `/sell` | CreateListing | Create new listing form with real photo upload, full validation, auction or fixed price |
| `/go` | Go | State inspection endpoint (JSON view of initial_state, current_state, state_diff) |

### Route Query Parameters

| Route | Param | Values | Effect |
|-------|-------|--------|--------|
| `/search` | `q` | any string | Full-text search on listing title |
| `/search` | `c` | category string (e.g. `"Electronics"`) | Filter by category |
| `/search` | `seller` | user ID string (e.g. `"user_2"`) | Filter listings by seller; shows "Items by {username}" heading |
| `/dashboard` | `tab` | `"buying"`, `"selling"`, `"watchlist"`, `"messages"` | Opens a specific dashboard tab directly |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Logged-in user profile |
| `users` | array | All user profiles |
| `listings` | array | All product listings (auction and fixed-price) |
| `orders` | array | Completed purchase orders |
| `messages` | array | User-to-user messages about listings |
| `notifications` | array | System notifications (e.g., outbid alerts) |
| `feedbacks` | array | Feedback left on orders |
| `cart` | string[] | Array of listing IDs currently in the shopping cart |

### `currentUser` object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | `"user_1"` | Unique user identifier |
| `username` | string | `"admin"` | Display username |
| `email` | string | `"admin@example.com"` | User email |
| `avatar` | string | `"https://picsum.photos/100/100?random=user1"` | Avatar image URL |
| `feedbackScore` | number | `154` | Cumulative feedback score (positive +1, negative -1) |
| `feedbackRating` | number | `98.5` | Feedback percentage rating |

### `users[]` array items

Same shape as `currentUser`. Default data contains 3 users:

| id | username | feedbackScore | feedbackRating |
|----|----------|---------------|----------------|
| `user_1` | `admin` | 154 | 98.5 |
| `user_2` | `RetroGamer99` | 42 | 100 |
| `user_3` | `CameraPro` | 890 | 99.2 |

### `listings[]` array items

| Field | Type | Default/Notes | Description |
|-------|------|---------------|-------------|
| `id` | string | `"item_1"`, `"item_2"`, etc. | Unique listing identifier |
| `sellerId` | string | User ID reference | ID of the user who created the listing |
| `title` | string | | Listing title (3–80 characters when created via UI) |
| `description` | string | | Detailed item description (minimum 10 characters when created via UI) |
| `images` | string[] | URLs to item photos | Array of image URLs; may contain base64 data URLs when uploaded via the create listing form |
| `type` | string | `"auction"` or `"fixed"` | Listing format |
| `startingBid` | number\|null | | Starting bid for auctions; null for fixed |
| `currentBid` | number\|null | | Current highest bid for auctions; null for fixed |
| `price` | number\|null | | Fixed price for buy-it-now only listings |
| `buyItNowPrice` | number\|null | | Optional buy-it-now price (auctions may also have this) |
| `bids` | array | `[]` | Array of bid objects (see below) |
| `watchers` | string[] | `[]` | Array of user IDs watching this listing |
| `views` | number | `0` | View count (auto-incremented when `/item/:id` page loads) |
| `endTime` | number | Unix timestamp (ms) | When the listing ends |
| `condition` | string | `"Used"` | Item condition: `"New"`, `"Open Box"`, `"Used"`, `"Refurbished"`, `"For Parts"` |
| `shipping` | number | `0` | Shipping cost in dollars (0 = free shipping) |
| `category` | string | `"Electronics"` | Category: `"Electronics"`, `"Cameras"`, `"Books"`, `"Fashion"`, `"Motors"`, `"Collectibles"`, `"Sports"`, `"Home"`, `"Other"` |
| `status` | string | `"active"` | Listing status: `"active"`, `"sold"`, `"ended"` |

### `listings[].bids[]` array items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique bid identifier (e.g., `"bid_1"`, `"bid_<timestamp>"`) |
| `userId` | string | ID of the bidding user |
| `amount` | number | Displayed bid amount |
| `autoBidMax` | number | Maximum auto-bid amount (proxy bidding) |
| `timestamp` | number | Unix timestamp (ms) when bid was placed |

Bids are stored newest-first (index 0 = highest/latest bid).

### `orders[]` array items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique order identifier (e.g., `"order_<timestamp>"`) |
| `listingId` | string | Reference to the purchased listing |
| `buyerId` | string | User ID of the buyer |
| `sellerId` | string | User ID of the seller |
| `amount` | number | Purchase amount in dollars |
| `date` | number | Unix timestamp (ms) of purchase |
| `status` | string | Order status (e.g., `"paid"`) |

### `messages[]` array items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique message identifier (e.g., `"msg_1"`, `"msg_<timestamp>"`) |
| `fromId` | string | Sender user ID |
| `toId` | string | Recipient user ID |
| `listingId` | string | Related listing ID |
| `subject` | string | Message subject line |
| `content` | string | Message body text |
| `read` | boolean | Whether message has been read by the recipient; set to `true` via `MARK_MESSAGE_READ` when message is opened in Dashboard Messages tab |
| `timestamp` | number | Unix timestamp (ms) |

### `notifications[]` array items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique notification identifier (e.g., `"notif_<timestamp>"`) |
| `userId` | string | User ID this notification is for |
| `message` | string | Notification text |
| `read` | boolean | Whether notification has been read; set via `MARK_NOTIFICATION_READ` (single) or `MARK_ALL_NOTIFICATIONS_READ` (all) from the navbar notification dropdown |

### `feedbacks[]` array items

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique feedback identifier (e.g., `"fb_<timestamp>"`) |
| `orderId` | string | Reference to the order |
| `fromUserId` | string | User who left the feedback |
| `toUserId` | string | User who received the feedback |
| `rating` | string | `"positive"`, `"neutral"`, or `"negative"` |
| `comment` | string | Feedback comment text |
| `created` | number | Unix timestamp (ms) |

### `cart` array

A flat array of listing IDs (`string[]`) representing items in the current user's shopping cart. Default: `[]`.

- Items are added via `addToCart(listingId)` — duplicates are ignored.
- Items are removed via `removeFromCart(listingId)`.
- Cart is cleared via `clearCart()`.
- The Navbar shopping cart icon badge reflects `state.cart.length`.
- The Navbar displays a mini-cart dropdown listing cart items with remove buttons and a "View Cart" link.

## Default Data Summary

- **3 users**: `user_1` (admin/current), `user_2` (RetroGamer99), `user_3` (CameraPro)
- **4 listings**:
  - `item_1`: Vintage Nintendo Game Boy Color (auction, seller=user_2, 2 bids, currentBid=$55, BIN=$120, watched by user_1)
  - `item_2`: Canon EOS R5 Camera (fixed-price, seller=user_3, $3200, no bids)
  - `item_3`: Sony WH-1000XM5 Headphones (auction, seller=user_2, startingBid=$150, BIN=$280, watched by user_3)
  - `item_4`: Rare First Edition The Hobbit (auction, seller=user_1, startingBid=$500, no BIN, watched by user_2)
- **0 orders** (empty array)
- **1 message**: from user_2 to user_1 about item_4 ("Can you ship this internationally?"), `read: false`
- **0 notifications** (empty array)
- **0 feedbacks** (empty array)
- **0 cart items** (empty array)

## Reducer Actions (State Mutations)

### Original Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `PLACE_BID` | `{listingId, amount, userId}` | Implements xBay-style proxy bidding. Adds bid(s) to `listings[i].bids`, updates `listings[i].currentBid`. May add outbid notifications. Seller cannot bid on own listing (guard in UI). |
| `BUY_NOW` | `{listingId, userId}` | Sets `listings[i].status` to `"sold"`, `listings[i].endTime` to now. Creates new order in `orders[]`. Triggered from Buy Now confirmation modal (no native `confirm()`). |
| `ADD_WATCHLIST` | `{listingId, userId}` | Appends userId to `listings[i].watchers[]` |
| `REMOVE_WATCHLIST` | `{listingId, userId}` | Removes userId from `listings[i].watchers[]` |
| `SEND_MESSAGE` | `{toId, listingId, subject, content}` | Appends new message to `messages[]` with `fromId` = currentUser. Called from: (1) Contact Seller modal on ProductDetails, (2) reply form in Dashboard Messages tab. |
| `CREATE_LISTING` | `{listing}` | Appends new listing to `listings[]` with auto-generated id, sellerId=currentUser, empty bids/watchers, views=0, status="active". Images may be base64 data URLs from file upload. |
| `END_LISTING` | `{listingId, userId}` | Sets `listings[i].status` to `"ended"`, `endTime` to now. Only works if userId matches sellerId. Triggered from End Listing confirmation modal (no native `confirm()`). |
| `LEAVE_FEEDBACK` | `{orderId, fromUserId, toUserId, rating, comment}` | Appends feedback to `feedbacks[]`. Updates `users[i].feedbackScore` (+1 positive, -1 negative, 0 neutral). Also updates `currentUser.feedbackScore` if applicable. |
| `INCREMENT_VIEWS` | `{listingId}` | Increments `listings[i].views` by 1. Called automatically on ProductDetails mount via `useEffect`. |
| `SET_STATE` | `{...partial state}` | Merges payload into current state |
| `RESET` | none | Resets state to `INITIAL_STATE` |

### New Actions (added in current revision)

| Action | Payload | Effect |
|--------|---------|--------|
| `EDIT_LISTING` | `{listingId, updates, userId}` | Merges `updates` onto the matching listing. Only executes if `listing.sellerId === userId`. Used by the Edit Listing modal in Dashboard Selling tab. Protected: starting bid cannot be changed if bids already exist (enforced in UI). |
| `ADD_TO_CART` | `{listingId}` | Appends `listingId` to `state.cart[]`. No-op if already present (duplicate guard). |
| `REMOVE_FROM_CART` | `{listingId}` | Removes `listingId` from `state.cart[]`. |
| `CLEAR_CART` | none | Resets `state.cart` to `[]`. |
| `MARK_MESSAGE_READ` | `{messageId}` | Sets `messages[i].read = true` for the matching message. Called when a message is opened in the Dashboard Messages tab. |
| `MARK_NOTIFICATION_READ` | `{notifId}` | Sets `notifications[i].read = true` for the matching notification. Called when a notification is clicked in the navbar dropdown. |
| `MARK_ALL_NOTIFICATIONS_READ` | none | Sets `read = true` on all notifications. Called from "Mark all as read" in the navbar notification dropdown. |

## Context API Functions

All functions are exposed via `useStore()` (React Context):

| Function | Signature | Dispatches |
|----------|-----------|------------|
| `placeBid` | `(listingId, amount)` | `PLACE_BID` with `userId = currentUser.id` |
| `buyNow` | `(listingId)` | `BUY_NOW` with `userId = currentUser.id` |
| `toggleWatchlist` | `(listingId)` | `ADD_WATCHLIST` or `REMOVE_WATCHLIST` depending on current watcher state |
| `sendMessage` | `(toId, listingId, subject, content)` | `SEND_MESSAGE` |
| `markMessageRead` | `(messageId)` | `MARK_MESSAGE_READ` |
| `createListing` | `(listing)` | `CREATE_LISTING` |
| `editListing` | `(listingId, updates)` | `EDIT_LISTING` with `userId = currentUser.id` |
| `endListing` | `(listingId)` | `END_LISTING` with `userId = currentUser.id` |
| `leaveFeedback` | `(orderId, toUserId, rating, comment)` | `LEAVE_FEEDBACK` with `fromUserId = currentUser.id` |
| `incrementViews` | `(listingId)` | `INCREMENT_VIEWS` |
| `addToCart` | `(listingId)` | `ADD_TO_CART` |
| `removeFromCart` | `(listingId)` | `REMOVE_FROM_CART` |
| `clearCart` | `()` | `CLEAR_CART` |
| `markNotificationRead` | `(notifId)` | `MARK_NOTIFICATION_READ` |
| `markAllNotificationsRead` | `()` | `MARK_ALL_NOTIFICATIONS_READ` |

## Proxy Bidding Logic

The `PLACE_BID` action implements xBay-style automatic bidding:

1. **No previous bids**: New bid placed at `startingBid`, `autoBidMax` = submitted amount
2. **Bid lower than current leader's max**: Current leader auto-outbids; new bidder gets outbid notification
3. **Bid higher than current leader's max**: New bidder wins; previous leader gets outbid notification; displayed price = previous max + $1 increment
4. **Updating own max bid**: If the current leader raises their max, only `autoBidMax` is updated

Note: The bid form in ProductDetails shows a yellow warning banner and disables bidding when the current user is the listing's seller (self-bid guard).

## UI Behaviors (Non-State)

### Search Filters (Search.jsx)

Filters are applied client-side via `useMemo` over `state.listings`. No state change on filter.

| Filter | Type | Description |
|--------|------|-------------|
| Condition | Checkboxes | Filters by `listing.condition`; options: New, Open Box, Used, Refurbished, For Parts |
| Buying Format | Checkboxes | "Auction" = `type === 'auction'`; "Buy It Now" = `type === 'fixed'` OR `buyItNowPrice != null` |
| Price Range | Number inputs + Apply button | Filters by effective price (currentBid for auction, price/buyItNowPrice for fixed); applied only on "Apply" click |
| Sort | Dropdown | Best Match (default), Price: Low to High, Price: High to Low, Time: Ending Soonest, Most Bids |
| Active chips | Dismissible tags | Each active filter shown as a chip above results; individual dismissal or "Clear all" |
| Seller filter | URL param `?seller=` | Filters by `listing.sellerId`; shows "Items by {username}" heading |

### Product Details (ProductDetails.jsx)

| Feature | Behavior |
|---------|----------|
| View increment | `incrementViews(id)` called on mount via `useEffect([id])` |
| Image gallery | Clicking thumbnails switches the main displayed image (local state, no store change) |
| Share button | Copies current URL to clipboard via `navigator.clipboard.writeText`; shows "Copied!" feedback for 2 seconds |
| Contact Seller | Opens modal with subject pre-filled as "Question about: {title}"; on submit calls `sendMessage(listing.sellerId, listing.id, subject, content)` |
| See other items | Navigates to `/search?seller={listing.sellerId}` |
| Seller star rating | Derived from `state.feedbacks` filtered by `toUserId === listing.sellerId`; positive ratio shown as 1–5 stars |
| Bid history | Expandable panel below bid form; shows all bids with bidder username, timestamp, amount |
| Self-bid guard | If `currentUser.id === listing.sellerId`, bid form and Buy It Now are hidden; yellow warning shown instead |
| Buy Now confirmation | Modal dialog (no native `confirm()`); shows item title and price; warns if this ends an active auction |

### Dashboard (Dashboard.jsx)

| Feature | Behavior |
|---------|----------|
| Tab via URL | `?tab=buying\|selling\|watchlist\|messages` navigates directly to that tab on load |
| Unread badge | Messages tab label shows count of unread messages addressed to currentUser |
| Message detail | Clicking a message row opens detail view; calls `markMessageRead(msg.id)` |
| Reply form | In message detail view; subject pre-filled as `"Re: {original subject}"`; calls `sendMessage(msg.fromId, msg.listingId, subject, content)` |
| Sent messages | "Sent" sub-tab shows messages where `fromId === currentUser.id` |
| Edit listing modal | Full form modal with all listing fields pre-populated; validates; calls `editListing(id, updates)`; disables starting bid change if bids exist |
| End listing modal | Confirmation modal (no native `confirm()`); warns if bids exist on the listing |
| Feedback modal | Radio buttons (positive/neutral/negative) with comment field; calls `leaveFeedback` |

### Navbar (Navbar.jsx)

| Feature | Behavior |
|---------|----------|
| Cart badge | Reads `state.cart.length`; shows red badge count on ShoppingCart icon |
| Cart mini-dropdown | Click cart icon → dropdown with each cart item (thumbnail, title, price, remove button) + "View Cart" link |
| Shop by category dropdown | Click trigger → dropdown listing all categories as links to `/search?c={category}` |
| All Categories selector | Click → dropdown to select a category prefix for the search bar; selected category prepended to query as `{Category}: {query}` or passed as `?c=` param |
| Notification dropdown | Click bell → dropdown listing `state.notifications` for currentUser; unread count badge; click notification → `markNotificationRead`; "Mark all as read" button → `markAllNotificationsRead` |
| Outside-click close | All dropdowns close when clicking outside via `useRef` + document `mousedown` event listener |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8011/?sid=task001",
    "inject_state": true,
    "state_content": {"action": "set", "state": {
      "currentUser": {"id": "user_1", "username": "testbuyer", "email": "test@example.com", "avatar": "https://picsum.photos/100/100?random=1", "feedbackScore": 10, "feedbackRating": 100},
      "users": [
        {"id": "user_1", "username": "testbuyer", "email": "test@example.com", "avatar": "https://picsum.photos/100/100?random=1", "feedbackScore": 10, "feedbackRating": 100},
        {"id": "user_2", "username": "seller1", "email": "seller@example.com", "avatar": "https://picsum.photos/100/100?random=2", "feedbackScore": 50, "feedbackRating": 99}
      ],
      "listings": [
        {
          "id": "item_1",
          "sellerId": "user_2",
          "title": "Test Auction Item",
          "description": "A test item for auction",
          "images": ["https://picsum.photos/400/400?random=item1"],
          "type": "auction",
          "startingBid": 10.00,
          "currentBid": 10.00,
          "buyItNowPrice": 50.00,
          "bids": [],
          "watchers": [],
          "views": 0,
          "endTime": 1999999999999,
          "condition": "New",
          "shipping": 5.00,
          "category": "Electronics",
          "status": "active"
        }
      ],
      "orders": [],
      "messages": [],
      "notifications": [],
      "feedbacks": [],
      "cart": []
    }}
  }
}
```

## Listing Normalization (Custom State Injection)

When injecting custom state, listings are normalized with these defaults:

| Field | Fallback |
|-------|----------|
| `id` | `"listing_custom_<index>"` |
| `sellerId` | `"user_1"` |
| `title` | `"(No Title)"` |
| `description` | `""` |
| `images` | `[]` |
| `type` | `"auction"` |
| `startingBid` | `0` |
| `currentBid` | `startingBid` or `0` |
| `buyItNowPrice` | `price` or `null` |
| `price` | `buyItNowPrice` or `null` |
| `bids` | `[]` |
| `watchers` | `[]` |
| `views` | `0` |
| `endTime` | 7 days from now |
| `condition` | `"Used"` |
| `shipping` | `0` (also accepts `{cost: N}` object) |
| `category` | `"Other"` |
| `status` | `"active"` |

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Place bid on auction | `listings[i].currentBid` updated, `listings[i].bids[]` gains new entry(ies); possibly `notifications[]` gains outbid alert for displaced bidder |
| Buy it now (confirm in modal) | `listings[i].status` → `"sold"`, `listings[i].endTime` set to now, `orders[]` gains new entry |
| Add to watchlist (heart button) | `listings[i].watchers[]` gains currentUser.id |
| Remove from watchlist (heart button) | `listings[i].watchers[]` loses currentUser.id |
| Contact seller (modal submit) | `messages[]` gains new entry with `fromId`=currentUser, `toId`=sellerId, `listingId`, `subject`, `content` |
| Reply to message (Dashboard) | `messages[]` gains new entry with `fromId`=currentUser, `toId`=original sender, `subject`="Re: ...", `content` |
| Open message in Dashboard | `messages[i].read` → `true` (via `MARK_MESSAGE_READ`) |
| Click notification in navbar | `notifications[i].read` → `true` (via `MARK_NOTIFICATION_READ`) |
| Mark all notifications read | all `notifications[i].read` → `true` |
| Create new listing | `listings[]` gains new entry with `sellerId`=currentUser, `status:"active"`, auto-generated `id`; `images` may be base64 data URLs |
| Edit listing (Dashboard modal) | `listings[i]` fields updated in-place (title, description, price, condition, shipping, category, duration, buyItNowPrice) |
| End listing early (seller, confirm in modal) | `listings[i].status` → `"ended"`, `listings[i].endTime` set to now |
| Leave feedback on order | `feedbacks[]` gains new entry; `users[i].feedbackScore` adjusted by rating; `currentUser.feedbackScore` updated if feedback is for current user |
| View product details page | `listings[i].views` incremented by 1 (auto on mount via `incrementViews`) |
| Add item to cart | `cart[]` gains listingId (no-op if already present) |
| Remove item from cart | `cart[]` loses listingId |
| Clear cart | `cart` → `[]` |
| Search / filter / sort | No state change (read-only client-side filtering on `listings[]`) |
| Share listing (copy URL) | No state change (clipboard write only) |
| Navigate to seller's other items | No state change (navigates to `/search?seller={id}`) |

## Fixed Functional Issues (Revision Notes)

The following issues from the pre-delivery audit were resolved in this revision:

| Issue ID | Description | Resolution |
|----------|-------------|------------|
| F-001 | Share button had no handler | `navigator.clipboard.writeText(url)` with 2s "Copied!" feedback |
| F-002 | Contact Seller button had no handler | Modal with subject/content fields; wired to `sendMessage` |
| F-003 | "See other items" had no handler | Navigates to `/search?seller={sellerId}` |
| F-004/F-026 | Edit listing button had no handler / no action | Full edit modal + `EDIT_LISTING` reducer action |
| F-006/F-023 | Cart count hardcoded to 0 / no cart feature | `cart: []` state, `ADD_TO_CART`/`REMOVE_FROM_CART`/`CLEAR_CART` actions, navbar mini-cart |
| F-007 | Condition filter checkboxes non-functional | Wired to `selectedConditions` state; filters `listings` via `useMemo` |
| F-008 | Buying Format filter non-functional | Wired to `selectedFormats` state; filters by `type` and `buyItNowPrice` presence |
| F-009 | Price range filter non-functional | `priceMin`/`priceMax` inputs; applied on "Apply" button click |
| F-010 | "Shop by category" dropdown non-functional | Click-toggled dropdown with category links |
| F-011 | "All Categories" search bar selector non-functional | Click-toggled dropdown for category prefix selection |
| F-015 | `sendMessage` action never called from UI | Called from Contact Seller modal and Dashboard reply form |
| F-016 | `incrementViews` never called from UI | Called on ProductDetails mount via `useEffect([id])` |
| F-017/F-018 | Photo upload was decorative / used placeholder images | `<input type="file" multiple>` with `FileReader.readAsDataURL`; previews shown; data URLs stored in listing |
| F-019 | Image thumbnails non-interactive (gallery) | Clicking thumbnail sets `selectedImage` local state; main image updates |
| F-020 | Create listing form had no JS validation | `validate()` function: title (3–80 chars), description (min 10), price (>0), BIN (> starting bid), shipping (≥0) |
| F-021 | Empty catch block in `fetchCustomState` | Changed to `console.warn('[ebay_mock] fetchCustomState error:', e)` |
| F-022 | Messages tab had no reply/detail UI | Clickable rows open message detail view with reply form; `markMessageRead` on open |
| F-024 | Notification bell had no dropdown | Full notification dropdown with mark-read, mark-all-read, unread count badge |
| F-027 | No sort on search results | Sort dropdown: Best Match, Price Low/High, Ending Soonest, Most Bids |
| F-032 | No bid history on product page | Expandable bid history panel with bidder, timestamp, amount |
| F-033 | No self-bid guard | Seller sees warning banner; bid form and BIN hidden for own listings |
