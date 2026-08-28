# Xloudflare Dashboard Mock — TODO

> Status: COMPLETE
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest cloudflare_mock -- --template react`, install deps: `react-router-dom`, `recharts` (for analytics charts). No Tailwind — use plain CSS to match Xloudflare's custom design system.

- [x] **Visual design system**: Create `src/styles/variables.css` with CSS custom properties. Study `assets/screenshots/` carefully. Xloudflare dashboard uses a **clean white** design:
  - `--cf-orange`: `#F6821F` (brand logo, some CTAs)
  - `--cf-blue`: `#0051C3` (primary buttons, links, active states)
  - `--cf-blue-hover`: `#003A8C`
  - `--cf-blue-light`: `#EBF5FF` (hover backgrounds, selected states)
  - `--cf-bg-primary`: `#FFFFFF` (main background)
  - `--cf-bg-secondary`: `#F8F8F8` (subtle background for page body behind content cards)
  - `--cf-bg-sidebar`: `#FFFFFF`
  - `--cf-text-primary`: `#1A1A1A`
  - `--cf-text-secondary`: `#6B7280`
  - `--cf-text-muted`: `#9CA3AF`
  - `--cf-border`: `#E5E7EB`
  - `--cf-border-light`: `#F3F4F6`
  - `--cf-success`: `#068D45`
  - `--cf-error`: `#D63B23`
  - `--cf-warning`: `#FBAD41`
  - `--cf-shadow`: `0 1px 3px rgba(0,0,0,0.08)`
  - Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif`
  - Body text: 14px, weight 400. H1: 24px/600. H2: 20px/600. H3: 16px/600. Small: 12px.
  - Border radius: 4px (inputs, small elements), 8px (cards, modals)
  - Primary button: bg `--cf-blue`, text white, border-radius 4px, padding 8px 16px, font-weight 500
  - Secondary button: bg white, border 1px solid `--cf-border`, text `--cf-text-primary`, hover bg `--cf-bg-secondary`
  - Danger button: bg white, border 1px solid `--cf-error`, text `--cf-error`

- [x] **App layout — Account level** (`/`): Top bar (56px height, white bg, bottom border `--cf-border`) + main content area (full width, `--cf-bg-secondary` background). Top bar contains: Left — Xloudflare logo (orange cloud SVG + "Xloudflare" text in dark gray), Right — "+ Add site" button (blue primary), magnifying glass search icon, bell notification icon (with red unread badge count), "Support" dropdown, "English (US)" dropdown with globe icon, user avatar circle (initials "JD" on gray bg)

- [x] **App layout — Zone level** (`/:zoneId/*`): Same top bar + left sidebar (240px wide, white bg, right border) + main content area. Sidebar top shows domain name as a clickable breadcrumb (← back arrow + "example.com"). Below that, sidebar nav items as a vertical list:
  - **Overview** (home icon)
  - **Analytics & Logs** (chart icon) — expandable: Traffic, Security, Performance, DNS
  - **DNS** (globe icon) — expandable: Records, Settings
  - **Email** (mail icon)
  - **SSL/TLS** (lock icon) — expandable: Overview, Edge Certificates
  - **Security** (shield icon) — expandable: Overview, WAF, Bots, DDoS, Settings
  - **Speed** (zap/lightning icon) — expandable: Overview, Optimization
  - **Caching** (database icon) — expandable: Overview, Configuration, Cache Rules
  - **Workers Routes** (code icon)
  - **Rules** (list icon) — expandable: Page Rules, Redirect Rules, Transform Rules
  - **Network** (wifi icon)
  - **Scrape Shield** (eye icon)

  Active item: left 3px blue border (`--cf-blue`), text `--cf-blue`, bg `--cf-blue-light`. Hover: bg `#F3F4F6`. Submenu items indented 16px, font-size 13px.

- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes:
  - `/` — Account Home (zone list)
  - `/go` — State inspector
  - `/:zoneId` — Zone Overview (redirect to `/:zoneId/overview`)
  - `/:zoneId/overview` — Zone Overview
  - `/:zoneId/analytics` — Analytics (default: traffic)
  - `/:zoneId/analytics/:tab` — Analytics tab (traffic, security, performance, dns)
  - `/:zoneId/dns` — DNS Records
  - `/:zoneId/ssl-tls` — SSL/TLS Overview
  - `/:zoneId/ssl-tls/edge-certificates` — Edge Certificates
  - `/:zoneId/security` — Security Overview
  - `/:zoneId/security/waf` — WAF Rules
  - `/:zoneId/security/bots` — Bot Management
  - `/:zoneId/speed` — Speed Overview
  - `/:zoneId/speed/optimization` — Optimization Settings
  - `/:zoneId/caching` — Caching Overview
  - `/:zoneId/caching/configuration` — Caching Configuration
  - `/:zoneId/rules/page-rules` — Page Rules
  - `/:zoneId/workers` — Workers Routes
  - `/:zoneId/network` — Network Settings
  - `/:zoneId/scrape-shield` — Scrape Shield

- [x] **State management**: `src/context/AppContext.jsx` providing global state + `src/utils/dataManager.js` with `createInitialData()`, `getState()`, `setState()`, `resetState()`, `getStateDiff()`. See `data_model.md` for complete data structure. Persist to localStorage under key `cloudflare_mock_state`. On mount: check localStorage first, fall back to `createInitialData()`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Returns JSON `{ initial_state, current_state, state_diff }` displayed as formatted JSON in a `<pre>` block. The state diff computes added/removed/changed fields between initial and current state.

- [x] **Session isolation**: `vite.config.js` mock-api plugin handling:
  - `POST /post?sid=<sid>` — set/reset state per session
  - `GET /go?sid=<sid>` — get state for session
  - `GET /state?sid=<sid>` — alias for /go
  Store per-session state in a server-side Map. Support actions: `set` (sets both initial + current), `set_current` (updates current only), `reset` (restores current to initial).

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes.

### Account Home

- [x] **Zone list page** (`/`): Page title "Websites" with subtitle showing zone count. Below: search input ("Search by domain name...") with magnifying glass icon. Then a list/card view of zones. Each zone row/card shows: domain name (bold, 16px, clickable link to `/:zoneId/overview`), plan badge (colored pill — Free=gray, Pro=blue, Business=orange, Enterprise=red), status indicator (green dot "Active", yellow dot "Pending", gray dot "Paused"), and a "..." overflow menu (with "Remove" option). Clicking domain name navigates to zone overview.

- [x] **Add site modal**: Clicking "+ Add site" in top bar opens a modal dialog (centered, 500px wide, white bg, shadow, overlay backdrop). Content: "Add a site" title, text input for domain name with placeholder "Enter your site (example.com)", "Add site" primary button and "Cancel" link. On submit: validate domain format (must contain dot), create new zone with status "pending" and plan "free", add to zones array, close modal and navigate to new zone.

### Zone Overview

- [x] **Zone Overview page** (`/:zoneId/overview`): Top section: zone domain name as h1, plan badge, status badge, "Pause" / "Unpause" toggle button. Quick Actions card row (4 cards in a 2x2 grid):
  - **Purge Cache** card: cache icon, "Purge Cache" title, "Remove cached files to force Xloudflare to fetch latest" description, "Purge Everything" button (danger style)
  - **Development Mode** card: code icon, title, description, toggle switch (on/off)
  - **Under Attack Mode** card: shield icon, title, description, toggle switch
  - **Always Use HTTPS** card: lock icon, title, description, toggle switch

  Below quick actions: "Domain Summary" card showing: Nameservers (show assigned NS values), SSL/TLS mode (show current mode with link to SSL page), Security Level (show current level). At the bottom: "Quick Stats (Last 24 hours)" with 3 stat boxes — Total Requests (formatted number), Threats Blocked, Bandwidth Saved (percentage).

### DNS Management

- [x] **DNS Records page** (`/:zoneId/dns`): Title "DNS management for {domain}". Below title: row with "+ Add record" button (blue primary), search input "Search DNS Records" (filters records by name/content as you type), "Advanced" button (secondary).

- [x] **DNS records table**: Columns — Type (bold, 60px), Name (200px), Content (flex), TTL (80px, show "Auto" when ttl=1, else formatted duration), Proxy status (120px, show orange cloud icon + "Proxied" text or gray cloud + "DNS only"), Actions (60px, "Edit" link in blue). Table has alternating row hover (light gray bg). Records sorted by type (A first, then AAAA, CNAME, MX, TXT). See `assets/screenshots/dns_records_table.jpg` and `dns_records_edit.jpg` for exact layout.

- [x] **Add/Edit DNS record form**: When "+ Add record" is clicked or "Edit" is clicked on a row, show an inline form row at the top of the table (or replace the row being edited). Form fields in a horizontal row: Type dropdown (options: A, AAAA, CNAME, MX, TXT, SRV, NS, CAA — default A), Name input (placeholder "Use @ for root"), Content input (placeholder changes based on type: "IPv4 address" for A, "IPv6 address" for AAAA, "Target" for CNAME, etc.), TTL dropdown (Auto, 1 min, 2 min, 5 min, 15 min, 30 min, 1 hr, 2 hr, 5 hr, 12 hr, 1 day), Proxy status toggle (orange cloud icon, only enabled for A/AAAA/CNAME), Save button (blue) + Cancel button. See `assets/screenshots/dns_add_record_form.png` for reference. For MX type, show additional Priority field. Validate: name required, content required, content format based on type (IPv4 for A, IPv6 for AAAA, domain for CNAME/MX).

- [x] **Delete DNS record**: Each record row has a delete icon (X or trash) visible on hover. Clicking opens a confirmation modal: "Delete record for {domain}" title, shows record details (Type, Name, Content, TTL, Proxy status) in a summary table, "Delete" button (red/danger) and "Close" button. See `assets/screenshots/dns_delete_confirm.jpg`.

### SSL/TLS

- [x] **SSL/TLS Overview** (`/:zoneId/ssl-tls`): Page title "SSL/TLS". "Your SSL/TLS encryption mode" heading. Four radio cards in a row, each ~200px wide:
  - **Off**: Gray icon, "Off (not secure)" label, "No encryption applied" description
  - **Flexible**: Yellow/partial icon, "Flexible" label, "Encrypts traffic between the browser and Xloudflare" description
  - **Full**: Green partial icon, "Full" label, "Encrypts end-to-end, using a self-signed certificate on the server" description
  - **Full (strict)**: Green full icon, "Full (strict)" label, "Encrypts end-to-end, but requires a trusted CA or Xloudflare Origin CA certificate" description

  Each card has a radio button, selected card has blue border. Changing selection updates `sslSettings[zoneId].mode`. Below the cards: visual diagram showing Browser ↔ Xloudflare ↔ Origin with lock icons indicating encryption. Below diagram: "Edge Certificates" link card.

- [x] **Edge Certificates page** (`/:zoneId/ssl-tls/edge-certificates`): Table of certificates. Columns: Hosts (comma-separated list), Type (Universal/Custom), Status (badge — Active green, Pending yellow), Expires (date), Actions. Below table: toggle settings — "Always Use HTTPS" (toggle + description), "Automatic HTTPS Rewrites" (toggle + description), "Minimum TLS Version" (dropdown: 1.0, 1.1, 1.2, 1.3), "TLS 1.3" (toggle).

### Security

- [x] **Security Overview** (`/:zoneId/security`): "Security Level" card with dropdown selector (Essentially Off, Low, Medium, High, I'm Under Attack!). Description text for each level. "Challenge Passage" TTL dropdown. "Browser Integrity Check" toggle. "Bot Fight Mode" toggle with description.

- [x] **WAF/Firewall Rules** (`/:zoneId/security/waf`): Title "Firewall rules". Filter bar: search input "Search description...", Status dropdown (All, Active, Paused), Action dropdown (All, Block, Allow, Challenge, JS Challenge), "Search" button (blue), "Ordering" button (secondary, right-aligned). Rules table: columns — # (priority number), Action (badge — Block=red, Allow=green, Challenge=yellow, JS Challenge=blue), Description (bold title + muted subtitle showing filter type), CSR, Activity last 24hr (number), Enabled toggle (green on/off), Edit icon (pencil), Delete icon (X). See `assets/screenshots/firewall_rules.png`. "+ Create a Firewall Rule" button above table.

- [x] **Create/Edit Firewall Rule modal**: Modal dialog. Title "Create a Firewall Rule" (or "Edit..."). Fields: Rule name input, "When incoming requests match..." section with expression builder: Field dropdown (IP Source Address, Country, URI Path, User Agent, etc.) + Operator dropdown (equals, contains, does not equal, etc.) + Value input. "And" / "Or" buttons to add conditions. "Then..." section with Action dropdown (Block, Allow, Challenge, JS Challenge, Managed Challenge). "Deploy" button (blue primary), "Cancel". On save: add/update rule in `firewallRules[zoneId]`.

### Speed / Performance

- [x] **Speed Optimization page** (`/:zoneId/speed/optimization`): Series of toggle cards (module pattern — each has title, description, and control on the right):
  - **Auto Minify**: Three checkboxes in a row — JavaScript, CSS, HTML. Description: "Reduce the file size of source code on your website."
  - **Brotli**: Toggle switch. Description: "Speed up page load times for your visitor's HTTPS traffic by applying Brotli compression."
  - **Rocket Loader**: Toggle switch (off/on). Description: "Improves the paint time for pages which include JavaScript."
  - **Early Hints**: Toggle switch. Description: "Allow the browser to begin loading resources while waiting for the origin server."
  - **HTTP/2 Prioritization**: Toggle switch. Description: "Improves page load by sending resources in an optimal order."

  Each card: white bg, border `--cf-border`, border-radius 8px, padding 20px. Title left (16px bold), description below (14px muted), control right-aligned.

### Caching

- [x] **Caching Configuration page** (`/:zoneId/caching/configuration`): Module cards:
  - **Caching Level**: Radio group — Basic ("No query string"), Standard ("Delivers different resource when query string changes"), Aggressive ("Delivers same resource to everyone regardless of query string"). Default: Standard.
  - **Browser Cache TTL**: Dropdown with values: "Respect Existing Headers", "30 minutes", "1 hour", "2 hours", "4 hours", "8 hours", "16 hours", "1 day", "2 days", "3 days", "8 days", "16 days", "1 month", "2 months", "6 months", "1 year". Default: "4 hours".
  - **Always Online**: Toggle. Description: "If your server goes down, Xloudflare will serve limited copies of your site from our cache."
  - **Development Mode**: Toggle. Description: "Temporarily bypass cache for 3 hours. Changes take effect immediately." When enabled, show countdown timer.

- [x] **Purge Cache**: "Purge Cache" card at top of caching page. "Purge Everything" button (danger red) opens confirmation modal: "Are you sure you want to purge ALL cached files?" with "Purge Everything" (red) and "Cancel" buttons. Also "Custom Purge" button that shows a textarea to enter URLs (one per line) + "Purge" button.

### Page Rules

- [x] **Page Rules page** (`/:zoneId/rules/page-rules`): "Page Rules" title + subtitle showing "{n} of 3 page rules" (free plan limit). "+ Create Page Rule" button (blue). Rules list — each rule is a row with: drag handle (⋮⋮) for reordering priority, # priority number, URL pattern (bold, monospace), "/" description of actions applied (muted), "On"/"Off" toggle (green pill), settings gear icon, edit pencil icon, delete X icon. See `assets/screenshots/page_rules.png`.

- [x] **Create/Edit Page Rule modal**: "Create a Page Rule for {domain}" title. "If the URL matches:" — input field with placeholder "example.com/*" and helper text. "Then the settings are:" — dropdown to select setting (Always Use HTTPS, Cache Level, Browser Cache TTL, Forwarding URL, Security Level, etc.) + value control matching the setting type. "+ Add a Setting" link to add more actions. "Save and Deploy" (blue primary), "Save as Draft", "Cancel". On save: add rule to `pageRules[zoneId]`, enforce 3-rule limit for free plan.

### Analytics

- [x] **Analytics Traffic tab** (`/:zoneId/analytics/traffic` or default `/:zoneId/analytics`): Time range selector at top-right (dropdown: "Last 24 hours", "Last 7 days", "Last 30 days"). Main area:
  - **Requests line chart**: X-axis = time, Y-axis = request count. Blue line for total, lighter line for cached. Use `recharts` LineChart. Chart height ~250px.
  - **Summary stat cards** below chart (horizontal row): Total Requests (large number), Cached Requests (number + percent), Uncached Requests (number + percent), Unique Visitors (number).
  - **Bandwidth bar/area chart**: Total vs Cached bandwidth over time.
  - **Requests by Country**: Table showing Country flag emoji + name, Request count, Percentage bar. Show top 5 countries.
  - **Status Codes**: Horizontal bar chart or table showing 2xx, 3xx, 4xx, 5xx breakdown.

  Generate timeseries data in `createInitialData()` — 24 hourly points for "24h" view with realistic daily traffic patterns (low at night, peaks at midday).

- [x] **Analytics Security tab** (`/:zoneId/analytics/security`): "Threats Stopped" large number stat. Pie chart of threat types (Bad browser, Hot linker, Human challenged, Bad IP). "Threats by Country" table similar to traffic by country.

- [x] **Analytics Performance tab** (`/:zoneId/analytics/performance`): "Bandwidth Saved" percentage circle/donut chart. "Content Type Breakdown" pie chart showing JS, Images, CSS, HTML, Other.

### Workers

- [x] **Workers Routes page** (`/:zoneId/workers`): Title "Workers Routes". Table: Route Pattern (monospace, e.g. "example.com/api/*"), Worker (name link), Environment. "+ Add route" button opens modal: Route input ("example.com/*"), Worker dropdown (select from existing workers), "Save" button.

### Network

- [x] **Network page** (`/:zoneId/network`): Series of toggle module cards (same pattern as Speed):
  - **HTTP/2**: Toggle (default on). Description text.
  - **HTTP/3 (with QUIC)**: Toggle (default on). Description text.
  - **WebSockets**: Toggle (default on).
  - **gRPC**: Toggle (default off).
  - **Onion Routing**: Toggle (default off).
  - **IP Geolocation**: Toggle (default on).

  Each card is a white bordered card with title, description, and toggle right-aligned.

### Notifications

- [x] **Notification bell panel**: Clicking bell icon in top bar opens a dropdown panel (320px wide, max-height 400px, scrollable). Header: "Notifications" title + "Mark all as read" link. List of notification items: each has colored left border (blue=info, yellow=warning, red=error, green=success), title (bold 14px), message (13px muted), zone name tag, timestamp ("2 hours ago"). Unread items have subtle blue background. Clicking "Mark all as read" marks all as read and clears badge count.

---

## P2 — Secondary Features

Depth and realism, implement after P1 is complete.

- [x] **Scrape Shield page** (`/:zoneId/scrape-shield`): Toggle cards for "Email Address Obfuscation" (on/off), "Server-side Excludes" (on/off), "Hotlink Protection" (on/off).

- [x] **Zone pause/unpause**: On Overview page, "Pause"/"Unpause" button toggles `zone.paused`. When paused, show yellow banner "This zone is paused. Xloudflare is not active for this domain."

- [x] **Domain search on account home**: Search input filters zone list in real-time as user types, matching against domain name.

- [x] **User profile dropdown**: Clicking user avatar in top bar opens dropdown with: user name, email, divider, "My Profile" link, "Account Home" link, divider, "Log Out" (non-functional, grayed out). Links navigate to appropriate routes.

- [x] **Support dropdown**: Clicking "Support" in top bar opens dropdown with links: "Help Center" (external, non-functional), "Community" (external), "System Status", "Contact Support". All non-functional (just display).

- [ ] **Responsive sidebar collapse**: On viewports < 1024px, sidebar collapses to icon-only mode (48px wide, icons only, tooltip on hover). Hamburger menu in top bar toggles full sidebar as overlay.

- [ ] **Development mode countdown**: When development mode is enabled, show a countdown timer (3 hours) that ticks down. When expired, auto-disable development mode.

- [ ] **DNS record import/export**: "Advanced" button on DNS page opens dropdown with "Import DNS File" and "Export DNS File" options. Export generates a text file with BIND format. Import opens a file picker (mock — just shows a textarea to paste records).

- [ ] **Bulk DNS record actions**: Checkbox column in DNS table. When records selected, show "Delete selected" button above table.

- [ ] **SSL/TLS visual diagrams**: For each SSL mode (Off, Flexible, Full, Strict), show a simple SVG diagram illustrating Browser ↔ Xloudflare ↔ Origin with lock/unlock icons on each connection segment.

- [ ] **Redirect Rules page** (`/:zoneId/rules/redirect-rules`): Similar to page rules but specifically for URL redirects. Table with Source URL, Target URL, Status Code (301/302), Status toggle.

- [ ] **Transform Rules page** (`/:zoneId/rules/transform-rules`): URL Rewrite rules and HTTP Header Modification rules. Table of rules with expression, action, and status.

- [ ] **Keyboard shortcuts**: `?` opens shortcuts help panel. `/` focuses search. `g h` goes to account home.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `data_model.md` for field definitions.

- [x] **Account**: 1 account — "John's Account", john@example.com
- [x] **Zones**: 4 zones:
  - `example.com` — Free plan, active, primary demo zone with full data
  - `myapp.io` — Pro plan, active, secondary zone
  - `staging-site.dev` — Free plan, pending (nameservers not updated yet)
  - `oldsite.org` — Free plan, active but paused
- [x] **DNS Records for example.com**: 12 records covering:
  - A record: `@` → `192.0.2.1` (proxied)
  - A record: `www` → `192.0.2.1` (proxied)
  - A record: `api` → `192.0.2.2` (proxied)
  - A record: `mail` → `192.0.2.3` (DNS only)
  - A record: `ftp` → `192.0.2.4` (DNS only)
  - AAAA record: `@` → `2001:db8::1` (proxied)
  - CNAME record: `blog` → `blog.example.com` (proxied)
  - CNAME record: `shop` → `myshop.shopify.com` (proxied)
  - MX record: `@` → `mail.example.com`, priority 10 (DNS only)
  - MX record: `@` → `mail2.example.com`, priority 20 (DNS only)
  - TXT record: `@` → `v=spf1 include:_spf.google.com ~all`
  - TXT record: `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com`
- [x] **DNS Records for myapp.io**: 6 records (A @, A www, CNAME api, MX, 2x TXT)
- [x] **DNS Records for staging-site.dev**: 3 records (A @, A www, TXT verification)
- [x] **SSL/TLS settings**: example.com=full, myapp.io=strict, staging-site.dev=flexible
- [x] **Firewall rules for example.com**: 4 rules — Block Known Bots, Block specific country, Allow office IP, Rate limit login page
- [x] **Firewall rules for myapp.io**: 2 rules — Block bad user agents, Challenge suspicious IPs
- [x] **Speed/Caching/Network settings**: Realistic defaults per zone (see data_model.md)
- [x] **Page Rules for example.com**: 3 rules — "Always Use HTTPS" for http://*.example.com/*, "Cache Level: Bypass" for example.com/admin/*, "Forwarding URL 301" for old.example.com/* → example.com/*
- [x] **Workers**: 2 scripts — "api-handler" (routes to example.com/api/*), "redirect-worker" (routes to example.com/old/*)
- [x] **Analytics timeseries**: Generate 24 data points (hourly) for example.com with realistic daily traffic pattern: low (1000-2000 req/hr) at night (0-6am), ramp up (3000-5000) morning, peak (6000-8000) midday, taper (4000-2000) evening. Total ~125K requests/day. Bandwidth ~2GB. Unique visitors ~8.7K. Generate security threats (47 total) and performance metrics.
- [x] **Notifications**: 6 items — SSL cert renewed (info, read), unusual traffic spike (warning, unread), new firewall rule triggered (info, unread), zone activated (success, read), DDoS attack mitigated (warning, read), cache purge completed (info, unread)

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as `John Doe`, john@example.com)
- Real DNS resolution or nameserver updates
- Real API calls to Xloudflare
- Payment / billing / plan upgrades (show plan badges but no purchase flow)
- Real Workers execution (code editor is text-only display)
- Real email routing
- Real file uploads
- Two-factor authentication setup
- Account deletion
- Real-time WebSocket analytics streaming
