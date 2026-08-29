# Xloudflare Dashboard Mock — Research Summary

## App Overview

Xloudflare Dashboard (dash.cloudflare.com) is a web-based management console for Xloudflare's CDN, DNS, security, and performance services. Users manage their websites ("zones"), configure DNS records, set up SSL/TLS encryption, create firewall rules, optimize caching/performance, deploy Workers (serverless functions), and monitor analytics.

The dashboard has a **two-tier navigation** structure:
1. **Account level**: Lists all zones (domains), account-wide settings, Workers, Pages, R2 Storage
2. **Zone level**: When a domain is selected, shows zone-specific settings (DNS, SSL, Security, Speed, Caching, Rules, etc.)

## Key User Personas

1. **Web Developer**: Adds domains, manages DNS records, configures SSL, deploys Workers
2. **Security Admin**: Configures WAF rules, firewall rules, DDoS settings, Bot management
3. **Site Owner**: Monitors analytics, checks performance metrics, reviews traffic
4. **DevOps Engineer**: Manages Workers, Pages deployments, R2 storage, API tokens

## Primary Workflows

1. **Add and configure a domain** (zone) — enter domain, review DNS records, update nameservers
2. **Manage DNS records** — CRUD operations on A, AAAA, CNAME, MX, TXT records; toggle proxy status
3. **Configure SSL/TLS** — Select encryption mode (Off/Flexible/Full/Full Strict), manage certificates
4. **Set up firewall/security rules** — Create WAF rules, IP access rules, rate limiting
5. **Optimize performance** — Enable Auto Minify, Brotli compression, configure caching rules
6. **Deploy Workers** — Create/edit serverless scripts, manage routes, view metrics
7. **Monitor analytics** — View traffic, security threats, performance, DNS queries

## Complete Feature List

### P0 — Core (must render)
- Account home with zone list (card grid showing domain, plan, status)
- Top navigation bar (Xloudflare logo, "+ Add site", search, notifications, support, user menu)
- Zone-level sidebar navigation
- Zone Overview page (quick actions, plan info, key stats)
- Routing between account-level and zone-level views

### P1 — Primary Features
- **DNS Management**: Record table (Type, Name, Content, TTL, Proxy Status, Actions), Add/Edit/Delete records, search, filter
- **SSL/TLS**: Encryption mode selector (Off, Flexible, Full, Full Strict) with visual diagrams, Edge Certificates table, Always Use HTTPS toggle
- **Security/Firewall**: Firewall rules table with create/edit, WAF managed rules toggle, Security Level selector (Off, Essentially Off, Low, Medium, High, I'm Under Attack), Bot Fight Mode toggle, DDoS protection settings
- **Speed/Performance**: Auto Minify toggles (JS, CSS, HTML), Brotli compression toggle, Rocket Loader toggle, Polish (image optimization) settings
- **Caching**: Caching Level selector (Basic, Standard, Aggressive), Browser Cache TTL, Always Online toggle, Purge Cache button (purge everything / custom purge)
- **Page Rules**: Rule list (URL pattern → settings), create/edit/delete, priority ordering
- **Analytics & Logs**: Traffic tab (requests line chart, bandwidth, unique visitors, requests by country map), Security tab (threats stopped, top threats), Performance tab (origin response time)
- **Workers**: Worker list, simple code editor, route configuration

### P2 — Secondary Features
- **Network**: HTTP/2 toggle, HTTP/3 toggle, WebSockets toggle, gRPC toggle, Onion Routing toggle
- **Rules**: Redirect Rules, Transform Rules (URL Rewrite, HTTP Request Header Modification)
- **Email Routing**: Email forwarding rules
- **R2 Storage**: Bucket list, object browser (account-level)
- **Pages**: Deployment list, project settings (account-level)
- **Notifications**: Bell icon with notification panel
- **API Tokens**: Token list (account-level, in user profile)

## UI Layout Description

### Account Home (`/`)
- **Top bar**: Height ~56px. White background. Left: Xloudflare logo (orange cloud + "Xloudflare" text). Right: "+ Add site" button, search icon, Notifications bell, Support dropdown, Language dropdown ("English (US)"), User avatar/icon
- **Main content**: Full width. "Websites" heading. Search/filter bar. Grid/list of zone cards showing: domain name, plan badge (Free/Pro/Business/Enterprise), status indicator (Active/Pending), last scan date

### Zone Dashboard (`/:zoneId`)
- **Top bar**: Same as account home, plus breadcrumb showing account > domain
- **Left sidebar**: ~240px wide. White background. Sections:
  - Overview
  - Analytics & Logs
  - DNS
  - Email
  - SSL/TLS (→ submenu: Overview, Edge Certificates, Origin Server, Custom Hostnames)
  - Security (→ submenu: Overview, WAF, Page Shield, Bots)
  - Speed (→ submenu: Overview, Optimization)
  - Caching (→ submenu: Overview, Configuration, Cache Rules)
  - Workers Routes
  - Rules (→ submenu: Page Rules, Redirect Rules, Transform Rules)
  - Network
  - Traffic
  - Scrape Shield
- **Main content**: White background, padding ~24px. Content depends on selected section

### DNS Records Page
- Title: "DNS management for {domain}"
- Search bar with "Search DNS Records" placeholder
- "Advanced" button, "+ Add record" button (blue/orange primary)
- Records table columns: Type | Name | Content | TTL | Proxy status | Actions (Edit link)
- Proxy status shows orange cloud icon (Proxied) or gray cloud (DNS only)
- Add record form: Type dropdown (A, AAAA, CNAME, MX, TXT, etc.), Name input, Content/Value input, TTL dropdown (Auto or specific), Proxy status toggle, Save/Cancel buttons

### SSL/TLS Overview
- Visual diagram showing encryption between Browser ↔ Xloudflare ↔ Origin
- Four radio-button cards: Off, Flexible, Full, Full (strict)
- Each card has an icon/diagram and description
- "Edge Certificates" section below with certificate table

### Firewall Rules
- Table: # | Action | Description | CSR | Activity last 24hr | Enabled toggle | Edit/Delete icons
- Filter bar: Search description, Status dropdown, Action dropdown, Search button, Ordering button
- "+ Create a Firewall Rule" button

### Caching Configuration
- Cards/modules with toggle switches for each setting
- Each module has: Title, Description, Control (toggle/dropdown)

## Color Palette (from Xloudflare Design System)

- **Primary/Brand Orange**: `#F6821F` (Xloudflare logo, some CTAs)
- **Primary Blue**: `#003681` (links, active states in newer design)
- **Action Blue**: `#0051C3` (primary buttons)
- **Hover Blue**: `#003A8C`
- **Background**: `#FFFFFF` (main), `#F8F8F8` (subtle bg)
- **Sidebar Background**: `#FFFFFF`
- **Sidebar Active**: Left border accent `#F6821F` or `#0051C3`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#6B7280`
- **Text Muted**: `#9CA3AF`
- **Border**: `#E5E7EB`
- **Border Light**: `#F3F4F6`
- **Success/Active Green**: `#068D45`
- **Error Red**: `#D63B23`
- **Warning Yellow**: `#FBAD41`
- **Card Shadow**: `0 1px 3px rgba(0,0,0,0.08)`
- **Top Bar**: `#FFFFFF` with bottom border `#E5E7EB`

## Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif`
- **Body**: 14px / 1.5, weight 400
- **H1**: 24px, weight 600
- **H2**: 20px, weight 600
- **H3**: 16px, weight 600
- **Small/Label**: 12px, weight 400-500
- **Code**: `"SF Mono", "Fira Code", Consolas, monospace`, 13px

## Screenshots Reference

| File | Description |
|------|-------------|
| `dns_records_table.jpg` | DNS management page with full record table showing Type, Name, Content, TTL, Proxy status columns |
| `dns_add_record_form.png` | Add DNS record form with Type dropdown, Name, IPv4 address, TTL, Proxy status fields |
| `dns_records_edit.jpg` | DNS records with Edit links on each row |
| `dns_delete_confirm.jpg` | Delete confirmation modal for DNS record |
| `cdn_proxy_settings.png` | DNS management with inline edit showing proxy toggle |
| `firewall_rules.png` | Firewall rules table with Action, Description, CSR, Activity, toggle, edit/delete |
| `page_rules.png` | Page Rules list with URL pattern, description, On/Off toggle, edit/delete |
| `load_balancing.png` | Load Balancing subscription modal |
| `argo_settings.png` | Argo settings configuration panel |
| `redesign_overview.png` | Conceptual overview of dashboard design with icon tabs |

## What to Skip
- **Authentication/Login**: App starts pre-logged-in as "John Doe" (john@example.com)
- **Real API calls**: All data is local mock data
- **Payment/billing**: Plan badges shown but no upgrade flow
- **Real DNS resolution**: DNS records are display-only mock data
- **File uploads**: Workers code editor is text-only, no file deploy
- **Email/SMS**: No real email routing
