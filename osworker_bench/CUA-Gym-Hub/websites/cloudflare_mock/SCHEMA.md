# cloudflare_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `account` | object | `{id, name, email, type, created_on, settings: {enforce_twofactor}}` |
| `zones` | array | Each: `{id, name, account_id, status, paused, plan: {id, name, price, currency, frequency}, name_servers[], original_name_servers[], created_on, modified_on, activated_on, meta: {step, page_rule_quota, ssl_status}, stats: {total_requests_24h, threats_blocked_24h, bandwidth_saved_percent}}` — `status` is `"active"`, `"pending"`, or `"initializing"` |
| `dnsRecords` | object | Keyed by zoneId → array of records; each: `{id, zone_id, type, name, content, ttl, proxied, proxiable, priority\|null, locked, created_on, modified_on}` — `type` is `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `NS`, `CAA` |
| `sslSettings` | object | Keyed by zoneId → `{zone_id, mode, certificate_status, always_use_https, min_tls_version, automatic_https_rewrites, tls_1_3, edge_certificates[]}` — `mode` is `"off"`, `"flexible"`, `"full"`, `"strict"` |
| `securitySettings` | object | Keyed by zoneId → `{zone_id, security_level, challenge_ttl, browser_integrity_check, bot_fight_mode, waf_enabled, ip_access_rules[]}` — `security_level` is `"essentially_off"`, `"low"`, `"medium"`, `"high"`, `"under_attack"` |
| `firewallRules` | object | Keyed by zoneId → array; each: `{id, zone_id, action, description, filter: {id, expression, paused}, priority, paused, created_on, modified_on, activity_last_24h}` — `action` is `"block"`, `"allow"`, `"challenge"`, `"js_challenge"`, `"managed_challenge"`, `"log"` |
| `speedSettings` | object | Keyed by zoneId → `{zone_id, auto_minify: {javascript, css, html}, brotli, rocket_loader, polish, mirage, early_hints, http2_prioritization}` |
| `cachingSettings` | object | Keyed by zoneId → `{zone_id, caching_level, browser_cache_ttl, always_online, development_mode, development_mode_expires\|null, last_purge_on\|null, cache_rules[]}` — `caching_level` is `"basic"`, `"standard"`, `"aggressive"`; `last_purge_on` is set to ISO timestamp whenever cache is purged |
| `pageRules` | object | Keyed by zoneId → array; each: `{id, zone_id, targets: [{target, constraint: {operator, value}}], actions: [{id, value}], priority, status, created_on, modified_on}` — `status` is `"active"` or `"disabled"` |
| `networkSettings` | object | Keyed by zoneId → `{zone_id, http2, http3, websockets, grpc, onion_routing, ip_geolocation, pseudo_ipv4}` |
| `scrapeShieldSettings` | object | Keyed by zoneId → `{zone_id, email_obfuscation, server_side_excludes, hotlink_protection}` |
| `analytics` | object | Keyed by zoneId → `{zone_id, period, traffic: {total_requests, cached_requests, uncached_requests, unique_visitors, bandwidth, requests_by_country[], requests_by_status[], timeseries[]}, security: {threats_stopped, threats_by_type[], threats_by_country[]}, performance: {bandwidth_saved_percent, content_type_breakdown[]}}` |
| `kvNamespaces` | array | Each: `{id, title, created_on, keys_count}` |
| `workers` | array | Each: `{id, account_id, name, script, created_on, modified_on, routes: [{id, pattern, zone_id, zone_name}], usage: {requests_today, cpu_time_avg_ms}}` |
| `notifications` | array | Each: `{id, account_id, type, title, message, zone_name, read, created_on}` — `type` is `"info"`, `"warning"`, `"success"`, `"error"` |
| `selectedZoneId` | string\|null | Currently selected zone (not persisted in URL state) |
| `currentUser` | object | `{name, email, avatar\|null}` |

### Default IDs

**Account**: `acc_001` (John's Account, john@example.com)

**Zone IDs**:
- `zone_001` — example.com (Free, active)
- `zone_002` — myapp.io (Pro, active)
- `zone_003` — staging-site.dev (Free, pending)
- `zone_004` — oldsite.org (Free, active+paused)

**DNS Record IDs**: `dns_001`–`dns_018` (zone_001), `dns_101`–`dns_106` (zone_002), `dns_201`–`dns_203` (zone_003)

**Firewall Rule IDs**: `fw_001`–`fw_004` (zone_001), `fw_101`–`fw_102` (zone_002)

**Page Rule IDs**: `pr_001`–`pr_003` (zone_001), `pr_101` (zone_002)

**Worker IDs**: `worker_001` (api-handler), `worker_002` (redirect-worker)

**KV Namespace IDs**: `kv_001` (API_CACHE), `kv_002` (SESSION_STORE)

**Notification IDs**: `notif_001`–`notif_006`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "account": {
      "id": "acc_001",
      "name": "John's Account",
      "email": "john@example.com",
      "type": "standard",
      "created_on": "2023-01-15T10:30:00Z",
      "settings": { "enforce_twofactor": false }
    },
    "zones": [
      {
        "id": "zone_001",
        "name": "example.com",
        "account_id": "acc_001",
        "status": "active",
        "paused": false,
        "plan": { "id": "free", "name": "Free Website", "price": 0, "currency": "USD", "frequency": "monthly" },
        "name_servers": ["anna.ns.cloudflare.com", "greg.ns.cloudflare.com"],
        "original_name_servers": [],
        "created_on": "2023-06-15T08:00:00Z",
        "modified_on": "2024-12-01T14:30:00Z",
        "activated_on": "2023-06-15T12:00:00Z",
        "meta": { "step": 4, "page_rule_quota": 3, "ssl_status": "active" },
        "stats": { "total_requests_24h": 125430, "threats_blocked_24h": 47, "bandwidth_saved_percent": 68 }
      }
    ],
    "dnsRecords": {
      "zone_001": [
        { "id": "dns_001", "zone_id": "zone_001", "type": "A", "name": "example.com", "content": "192.0.2.1", "ttl": 1, "proxied": true, "proxiable": true, "priority": null, "locked": false, "created_on": "2023-06-15T08:05:00Z", "modified_on": "2024-11-20T09:00:00Z" }
      ]
    },
    "sslSettings": {
      "zone_001": { "zone_id": "zone_001", "mode": "full", "certificate_status": "active", "always_use_https": true, "min_tls_version": "1.2", "automatic_https_rewrites": true, "tls_1_3": "on", "edge_certificates": [] }
    },
    "securitySettings": {
      "zone_001": { "zone_id": "zone_001", "security_level": "medium", "challenge_ttl": 1800, "browser_integrity_check": true, "bot_fight_mode": true, "waf_enabled": true, "ip_access_rules": [] }
    },
    "firewallRules": { "zone_001": [] },
    "speedSettings": {
      "zone_001": { "zone_id": "zone_001", "auto_minify": { "javascript": false, "css": false, "html": false }, "brotli": false, "rocket_loader": "off", "polish": "off", "mirage": false, "early_hints": false, "http2_prioritization": false }
    },
    "cachingSettings": {
      "zone_001": { "zone_id": "zone_001", "caching_level": "standard", "browser_cache_ttl": 14400, "always_online": false, "development_mode": false, "development_mode_expires": null, "cache_rules": [] }
    },
    "pageRules": { "zone_001": [] },
    "networkSettings": {
      "zone_001": { "zone_id": "zone_001", "http2": true, "http3": true, "websockets": true, "grpc": false, "onion_routing": "off", "ip_geolocation": true, "pseudo_ipv4": "off" }
    },
    "scrapeShieldSettings": {
      "zone_001": { "zone_id": "zone_001", "email_obfuscation": false, "server_side_excludes": false, "hotlink_protection": false }
    },
    "analytics": {},
    "workers": [],
    "notifications": [],
    "selectedZoneId": null,
    "currentUser": { "name": "John Doe", "email": "john@example.com", "avatar": null }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Add a new site | `zones` array gains new entry |
| Pause / Unpause zone | `zones[i].paused` boolean |
| Add DNS record | `dnsRecords[zoneId]` array gains new entry |
| Edit DNS record | `dnsRecords[zoneId][i]` fields updated |
| Delete DNS record | `dnsRecords[zoneId]` array loses entry |
| Change SSL/TLS mode | `sslSettings[zoneId].mode` |
| Toggle Always Use HTTPS | `sslSettings[zoneId].always_use_https` |
| Toggle Automatic HTTPS Rewrites | `sslSettings[zoneId].automatic_https_rewrites` |
| Change Min TLS Version | `sslSettings[zoneId].min_tls_version` |
| Toggle TLS 1.3 | `sslSettings[zoneId].tls_1_3` |
| Change Security Level | `securitySettings[zoneId].security_level` |
| Change Challenge TTL | `securitySettings[zoneId].challenge_ttl` |
| Toggle Browser Integrity Check | `securitySettings[zoneId].browser_integrity_check` |
| Toggle Bot Fight Mode | `securitySettings[zoneId].bot_fight_mode` |
| Create firewall rule | `firewallRules[zoneId]` array gains new entry |
| Edit firewall rule | `firewallRules[zoneId][i]` fields updated |
| Toggle firewall rule enable/disable | `firewallRules[zoneId][i].paused` |
| Delete firewall rule | `firewallRules[zoneId]` array loses entry |
| Toggle Auto Minify (JS/CSS/HTML) | `speedSettings[zoneId].auto_minify.{javascript\|css\|html}` |
| Toggle Brotli | `speedSettings[zoneId].brotli` |
| Toggle Rocket Loader | `speedSettings[zoneId].rocket_loader` |
| Toggle Early Hints | `speedSettings[zoneId].early_hints` |
| Toggle HTTP/2 Prioritization | `speedSettings[zoneId].http2_prioritization` |
| Change Caching Level | `cachingSettings[zoneId].caching_level` |
| Change Browser Cache TTL | `cachingSettings[zoneId].browser_cache_ttl` |
| Toggle Always Online | `cachingSettings[zoneId].always_online` |
| Toggle Development Mode | `cachingSettings[zoneId].development_mode`, `cachingSettings[zoneId].development_mode_expires` |
| Create page rule | `pageRules[zoneId]` array gains new entry |
| Edit page rule | `pageRules[zoneId][i]` fields updated |
| Toggle page rule On/Off | `pageRules[zoneId][i].status` |
| Delete page rule | `pageRules[zoneId]` array loses entry |
| Toggle HTTP/2 | `networkSettings[zoneId].http2` |
| Toggle HTTP/3 | `networkSettings[zoneId].http3` |
| Toggle WebSockets | `networkSettings[zoneId].websockets` |
| Toggle gRPC | `networkSettings[zoneId].grpc` |
| Toggle Onion Routing | `networkSettings[zoneId].onion_routing` |
| Toggle IP Geolocation | `networkSettings[zoneId].ip_geolocation` |
| Toggle Email Obfuscation | `scrapeShieldSettings[zoneId].email_obfuscation` |
| Toggle Server-side Excludes | `scrapeShieldSettings[zoneId].server_side_excludes` |
| Toggle Hotlink Protection | `scrapeShieldSettings[zoneId].hotlink_protection` |
| Add worker route | `workers[i].routes` array gains new entry |
| Delete worker route | `workers[i].routes` array loses entry |
| Mark all notifications read | `notifications[*].read` set to `true` |
| Purge cache (Everything) | `cachingSettings[zoneId].last_purge_on` (ISO timestamp), `zones[i].stats.bandwidth_saved_percent` (reset to 0) |
| Remove zone | `zones` array loses the removed entry |
