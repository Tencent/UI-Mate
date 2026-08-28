# Xoogle Ads Mock — TODO

> Status: IN PROGRESS (dev agent 2026-04-10)
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] **Project scaffold**: Vite + React scaffold created with react-router-dom, recharts, lucide-react. vite.config.js with mock-api plugin.

- [x] **Visual design system**: All Xoogle Ads colors/typography tokens implemented in index.css and inline styles throughout components.

- [x] **App layout**: Three-zone layout: primary sidebar (56px dark), secondary sidebar (240px white with nav tree), top bar (56px with logo/search/icons), scrollable main content area.

- [x] **Routing**: All routes implemented in App.jsx including /go state inspector.

- [x] **State management**: AppContext.jsx with useReducer + all dispatch actions. dataManager.js with createInitialData() and session storage utilities.

- [x] **`/go` endpoint**: Go.jsx page reads from /go API endpoint with localStorage fallback. Returns initial_state, current_state, state_diff.

- [x] **Session isolation**: vite.config.js mock-api plugin with /post, /go, /state, /upload, /files endpoints with session isolation via ?sid= parameter.

---

## P1 — Primary Features

### Overview Page

- [x] **Overview hero metrics**: 6 metric cards (Clicks, Impressions, CTR, Avg CPC, Cost, Conversions) computed from dailyMetrics.

- [x] **Overview performance chart**: recharts LineChart/AreaChart with metric toggles, dual Y-axis, chart type toggle (Line/Area).

- [x] **Overview campaigns summary table**: Sortable table with all columns, status toggles, totals row.

### Campaigns Management

- [x] **Campaigns list page**: Full table with filters (name, status, type), status toggle, navigation to campaign detail.

- [x] **Campaign detail page**: Breadcrumb, KPI cards, tab bar (Ad groups / Ads & assets / Keywords / Settings).

- [x] **Campaign creation wizard**: 5-step wizard (type selection, settings, ad group, ad, review & launch).

### Ad Groups

- [x] **All ad groups page**: Table with campaign filter, status toggle, navigation to ad group detail.

- [x] **Ad group detail page**: Breadcrumb, KPI cards, tabs (Keywords / Ads / Negative keywords / Settings).

- [x] **Create ad group dialog**: Modal with campaign selector, name, bid fields.

### Keywords

- [x] **All keywords page**: Full table with filters (campaign, ad group, match type, status), keyword/negative toggle.

- [x] **Add keywords dialog**: CreateModal with keywords textarea, match type selector, campaign/ad group selectors.

- [x] **Keyword inline actions**: Kebab menu with Edit bid (inline input), Pause/Enable, Remove.

- [x] **Negative keywords**: Toggle on keywords page to view negative keywords; add negative keywords via CreateModal.

### Ads & Assets

- [x] **All ads page**: Card grid view with status badge, headline preview, campaign/ad group labels.

- [x] **Ad preview panel**: Right-side panel with live Google ad preview, editable headlines/descriptions, Save button.

- [x] **Create ad form**: CreateModal with target campaign/ad group selectors, live preview.

### Recommendations

- [x] **Recommendations page**: Circular optimization score gauge (SVG), score value, comparison stats.

- [x] **Recommendation cards**: Cards with category icon, impact badge, estimated impact, Apply/Dismiss buttons.

### Create Button & Global Navigation

- [x] **"+ Create" floating action button**: Blue button opening CreateModal for campaign/ad group/keyword/ad creation.

- [x] **Secondary sidebar navigation tree**: Full nav tree with expandable groups, active state, badge on Recommendations.

---

## P2 — Secondary Features

- [ ] **Date range picker**: Not implemented (shows label only)
- [ ] **Campaign settings panel**: Basic read-only settings tab implemented; editable form not yet done
- [ ] **Bulk actions**: Not implemented
- [ ] **Column customization**: Not implemented
- [x] **Global search**: Search bar with typeahead for campaigns/keywords/pages
- [x] **Notification center**: Bell with badge count, dropdown with mark-read functionality
- [ ] **Table pagination**: Not implemented
- [ ] **Performance chart interactivity**: Basic chart implemented; click-to-filter not implemented
- [ ] **Ad strength indicator**: Not implemented

---

## Data Seed (implement in createInitialData())

- [x] **Account**: Acme Corp, ID 123-456-7890, USD, optimization score 72
- [x] **Campaigns**: 6 campaigns (3 SEARCH, 1 DISPLAY, 1 VIDEO, 1 SHOPPING)
- [x] **Ad Groups**: 14 ad groups across campaigns
- [x] **Ads**: 9 responsive search ads
- [x] **Keywords**: ~25 keywords + 5 negative keywords (with match types, quality scores, bids)
- [x] **Recommendations**: 10 recommendations as specified
- [x] **Daily Metrics**: 30 days of data (March 1-30, 2025) per campaign
- [x] **Notifications**: 6 notifications (2 unread)
- [x] **Search Terms**: 25 search terms

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as "Acme Corp" account, ID 123-456-7890)
- Real Google OAuth or account linking
- Actual ad serving, bidding auctions, or ad placement
- Payment processing / billing charges
- Google Analytics / conversion tracking pixel integration
- Real-time data refresh or API polling
- Google Merchant Center or product feed integration
