# Xloudflare Dashboard Mock — Data Model

## Entity Types

### Account
The top-level container. Only one account exists in the mock (pre-logged-in user).

```javascript
{
  id: "acc_001",
  name: "John's Account",
  email: "john@example.com",
  type: "standard",         // "standard" | "enterprise"
  created_on: "2023-01-15T10:30:00Z",
  settings: {
    enforce_twofactor: false
  }
}
```

### Zone (Domain)
A website/domain managed in Xloudflare. The core entity users interact with.

```javascript
{
  id: "zone_001",
  name: "example.com",                    // Domain name
  account_id: "acc_001",
  status: "active",                       // "active" | "pending" | "initializing" | "moved" | "deleted"
  paused: false,
  plan: {
    id: "free",                           // "free" | "pro" | "business" | "enterprise"
    name: "Free Website",
    price: 0,
    currency: "USD",
    frequency: "monthly"
  },
  name_servers: [
    "anna.ns.cloudflare.com",
    "greg.ns.cloudflare.com"
  ],
  original_name_servers: [
    "ns1.originaldns.com",
    "ns2.originaldns.com"
  ],
  created_on: "2023-06-15T08:00:00Z",
  modified_on: "2024-12-01T14:30:00Z",
  activated_on: "2023-06-15T12:00:00Z",
  meta: {
    step: 4,                              // Setup wizard step (4 = complete)
    page_rule_quota: 3,
    ssl_status: "active"
  },
  // Aggregated stats for zone card display
  stats: {
    total_requests_24h: 125430,
    threats_blocked_24h: 47,
    bandwidth_saved_percent: 68
  }
}
```

### DNS Record
Individual DNS records belonging to a zone.

```javascript
{
  id: "dns_001",
  zone_id: "zone_001",
  type: "A",                    // "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "NS" | "CAA"
  name: "example.com",          // Full record name
  content: "192.0.2.1",         // Record value (IP, hostname, text, etc.)
  ttl: 1,                       // 1 = Auto, otherwise seconds (120, 300, 600, 900, 1800, 3600, etc.)
  proxied: true,                // true = orange cloud (proxied), false = gray cloud (DNS only)
  proxiable: true,              // Whether this record type CAN be proxied
  priority: null,               // For MX records only (10, 20, etc.)
  locked: false,
  created_on: "2023-06-15T08:05:00Z",
  modified_on: "2024-11-20T09:00:00Z"
}
```

### SSL/TLS Settings
Per-zone SSL/TLS configuration.

```javascript
{
  zone_id: "zone_001",
  mode: "full",                 // "off" | "flexible" | "full" | "strict" (Full Strict)
  certificate_status: "active", // "active" | "pending_validation" | "expired"
  always_use_https: true,
  min_tls_version: "1.2",      // "1.0" | "1.1" | "1.2" | "1.3"
  automatic_https_rewrites: true,
  tls_1_3: "on",               // "on" | "off"
  edge_certificates: [
    {
      id: "cert_001",
      type: "universal",
      hosts: ["example.com", "*.example.com"],
      status: "active",
      issuer: "Xloudflare Inc ECC CA-3",
      expires_on: "2025-06-15T12:00:00Z",
      uploaded_on: null
    }
  ]
}
```

### Firewall Rule
Security rules for the zone.

```javascript
{
  id: "fw_001",
  zone_id: "zone_001",
  action: "block",              // "block" | "allow" | "challenge" | "js_challenge" | "managed_challenge" | "log"
  description: "Block Known Bots",
  filter: {
    id: "filter_001",
    expression: "(cf.client.bot)",  // Wirefilter expression
    paused: false
  },
  priority: 1,
  paused: false,
  created_on: "2024-01-10T10:00:00Z",
  modified_on: "2024-06-15T14:00:00Z",
  activity_last_24h: 23         // Mock metric
}
```

### Security Settings
Per-zone security configuration.

```javascript
{
  zone_id: "zone_001",
  security_level: "medium",     // "essentially_off" | "low" | "medium" | "high" | "under_attack"
  challenge_ttl: 1800,          // seconds
  browser_integrity_check: true,
  bot_fight_mode: true,
  waf_enabled: true,
  ip_access_rules: [
    {
      id: "ip_001",
      mode: "block",            // "block" | "whitelist" | "challenge" | "js_challenge"
      value: "198.51.100.0/24",
      notes: "Blocked suspicious range",
      created_on: "2024-03-01T10:00:00Z"
    }
  ]
}
```

### Speed Settings
Per-zone performance optimization.

```javascript
{
  zone_id: "zone_001",
  auto_minify: {
    javascript: true,
    css: true,
    html: false
  },
  brotli: true,
  rocket_loader: "off",         // "off" | "on" | "automatic"
  polish: "off",                // "off" | "lossless" | "lossy"
  mirage: false,                // Pro+ only
  early_hints: true,
  http2_prioritization: true
}
```

### Caching Settings
Per-zone caching configuration.

```javascript
{
  zone_id: "zone_001",
  caching_level: "standard",    // "basic" | "standard" | "aggressive"
  browser_cache_ttl: 14400,     // seconds (4 hours). Options: 0=Respect Existing, 1800, 3600, 7200, 14400, 28800, 86400, etc.
  always_online: true,
  development_mode: false,      // Bypasses cache for 3 hours
  development_mode_expires: null,
  cache_rules: []               // Advanced cache rules (P2)
}
```

### Page Rule
URL pattern-based configuration rules.

```javascript
{
  id: "pr_001",
  zone_id: "zone_001",
  targets: [
    {
      target: "url",
      constraint: {
        operator: "matches",
        value: "http://example.com/*"
      }
    }
  ],
  actions: [
    {
      id: "always_use_https",
      value: "on"
    }
  ],
  priority: 1,
  status: "active",             // "active" | "disabled"
  created_on: "2024-02-15T10:00:00Z",
  modified_on: "2024-02-15T10:00:00Z"
}
```

### Worker Script (Account-level)
Serverless scripts deployed on Xloudflare's edge.

```javascript
{
  id: "worker_001",
  account_id: "acc_001",
  name: "my-worker",
  script: "addEventListener('fetch', event => { event.respondWith(new Response('Hello World')) })",
  created_on: "2024-05-01T10:00:00Z",
  modified_on: "2024-11-15T09:00:00Z",
  routes: [
    {
      id: "route_001",
      pattern: "example.com/api/*",
      zone_id: "zone_001",
      zone_name: "example.com"
    }
  ],
  usage: {
    requests_today: 4521,
    cpu_time_avg_ms: 2.3
  }
}
```

### Analytics Data
Time-series mock data for charts.

```javascript
{
  zone_id: "zone_001",
  period: "24h",                // "24h" | "7d" | "30d"
  traffic: {
    total_requests: 125430,
    cached_requests: 85292,
    uncached_requests: 40138,
    unique_visitors: 8734,
    bandwidth: {
      total: 2147483648,       // bytes (2 GB)
      cached: 1503238553,
      uncached: 644245095
    },
    requests_by_country: [
      { country: "US", requests: 45230, percent: 36 },
      { country: "GB", requests: 18760, percent: 15 },
      { country: "DE", requests: 12540, percent: 10 },
      { country: "FR", requests: 8900, percent: 7 },
      { country: "JP", requests: 7500, percent: 6 }
    ],
    requests_by_status: [
      { status: 200, count: 98500 },
      { status: 301, count: 8700 },
      { status: 304, count: 12400 },
      { status: 404, count: 4830 },
      { status: 500, count: 1000 }
    ],
    // Time series for line chart (hourly for 24h, daily for 7d/30d)
    timeseries: [
      // Generated: array of { timestamp, requests, bandwidth, visitors }
    ]
  },
  security: {
    threats_stopped: 47,
    threats_by_type: [
      { type: "Bad browser", count: 18 },
      { type: "Hot linker", count: 12 },
      { type: "Human challenged", count: 9 },
      { type: "Bad IP", count: 8 }
    ],
    threats_by_country: [
      { country: "CN", count: 15 },
      { country: "RU", count: 12 },
      { country: "BR", count: 8 }
    ]
  },
  performance: {
    bandwidth_saved_percent: 68,
    content_type_breakdown: [
      { type: "JavaScript", percent: 35 },
      { type: "Images", percent: 28 },
      { type: "CSS", percent: 15 },
      { type: "HTML", percent: 12 },
      { type: "Other", percent: 10 }
    ]
  }
}
```

### Network Settings
Per-zone network toggles.

```javascript
{
  zone_id: "zone_001",
  http2: true,
  http3: true,
  websockets: true,
  grpc: false,
  onion_routing: "off",         // "off" | "on"
  ip_geolocation: true,
  pseudo_ipv4: "off"            // "off" | "add_header" | "overwrite_header"
}
```

### Notification
Account-level notification items.

```javascript
{
  id: "notif_001",
  account_id: "acc_001",
  type: "info",                 // "info" | "warning" | "error" | "success"
  title: "SSL certificate renewed",
  message: "The universal SSL certificate for example.com has been renewed.",
  zone_name: "example.com",
  read: false,
  created_on: "2024-12-10T15:30:00Z"
}
```

---

## Relationships

```
Account 1──N Zone
Zone 1──N DNS Record
Zone 1──1 SSL/TLS Settings
Zone 1──1 Security Settings
Zone 1──N Firewall Rule
Zone 1──1 Speed Settings
Zone 1──1 Caching Settings
Zone 1──N Page Rule
Zone 1──1 Network Settings
Zone 1──1 Analytics Data
Account 1──N Worker Script
Worker Script 1──N Route (linked to Zone)
Account 1──N Notification
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    account: { /* single account object */ },
    zones: [
      // 3-4 zones with different plans and statuses
      // zone_001: "example.com" (Free, active) — primary zone with full data
      // zone_002: "myapp.io" (Pro, active)
      // zone_003: "staging-site.dev" (Free, pending)
      // zone_004: "oldsite.org" (Free, active, paused)
    ],
    dnsRecords: {
      // Keyed by zone_id
      "zone_001": [
        // 10-15 records: mix of A, AAAA, CNAME, MX, TXT
        // Include both proxied and DNS-only records
      ],
      "zone_002": [ /* 5-8 records */ ],
      "zone_003": [ /* 2-3 records */ ]
    },
    sslSettings: {
      // Keyed by zone_id
      "zone_001": { mode: "full", always_use_https: true, ... },
      "zone_002": { mode: "strict", ... },
      "zone_003": { mode: "flexible", ... }
    },
    securitySettings: { /* keyed by zone_id */ },
    firewallRules: {
      "zone_001": [ /* 3-5 rules */ ],
      "zone_002": [ /* 1-2 rules */ ]
    },
    speedSettings: { /* keyed by zone_id */ },
    cachingSettings: { /* keyed by zone_id */ },
    pageRules: {
      "zone_001": [ /* 2-3 rules */ ],
      "zone_002": [ /* 1 rule */ ]
    },
    networkSettings: { /* keyed by zone_id */ },
    analytics: {
      // Keyed by zone_id, generate timeseries data programmatically
      "zone_001": { /* full analytics object */ },
      "zone_002": { /* analytics object */ }
    },
    workers: [
      // 2-3 worker scripts
    ],
    notifications: [
      // 5-8 notifications, mix of read/unread
    ],
    // UI state
    selectedZoneId: null,       // Set when navigating into a zone
    currentUser: {
      name: "John Doe",
      email: "john@example.com",
      avatar: null              // Use initials fallback "JD"
    }
  };
}
```
