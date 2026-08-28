# Xatadog Mock — Data Model

> For use by `src/utils/dataManager.js` → `createInitialData()`

---

## Entity Types

### 1. CurrentUser

The logged-in user. App starts pre-logged-in.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user-1"` |
| name | string | `"Sarah Chen"` |
| email | string | `"sarah.chen@acme-corp.io"` |
| avatar | string (initials) | `"SC"` |
| org | string | `"Acme Corp"` |
| role | string | `"Admin"` |

---

### 2. Host

Infrastructure hosts reporting metrics.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"host-1"` |
| hostname | string | `"web-prod-us-east-1a"` |
| aliases | string[] | `["i-0abc123def456", "ip-10-0-1-42"]` |
| status | `"active"` \| `"inactive"` | `"active"` |
| os | string | `"Ubuntu 22.04"` |
| cloudProvider | string | `"AWS"` |
| region | string | `"us-east-1"` |
| instanceType | string | `"c5.2xlarge"` |
| agentVersion | string | `"7.52.1"` |
| cpu | number (0-100) | `42.7` |
| memory | number (0-100) | `68.3` |
| ioWait | number (0-100) | `3.2` |
| load15 | number | `1.85` |
| apps | string[] | `["nginx", "docker", "system"]` |
| tags | string[] | `["env:production", "service:web-frontend", "team:platform"]` |
| metrics | HostMetrics | see below |
| createdAt | string (ISO) | `"2024-11-15T08:00:00Z"` |

#### HostMetrics (embedded)

| Field | Type | Description |
|-------|------|-------------|
| cpuHistory | number[] | 60 data points (1 per minute, last hour) |
| memoryHistory | number[] | 60 data points |
| networkInHistory | number[] | 60 data points (bytes/sec) |
| networkOutHistory | number[] | 60 data points (bytes/sec) |

---

### 3. Service

APM services.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"svc-1"` |
| name | string | `"web-store"` |
| type | `"web"` \| `"db"` \| `"cache"` \| `"worker"` \| `"custom"` | `"web"` |
| language | string | `"python"` |
| framework | string | `"django"` |
| env | string | `"production"` |
| team | string | `"checkout-team"` |
| status | `"ok"` \| `"warning"` \| `"critical"` | `"ok"` |
| requestsPerSec | number | `245.8` |
| avgLatencyMs | number | `42.3` |
| p50LatencyMs | number | `28.1` |
| p95LatencyMs | number | `89.7` |
| p99LatencyMs | number | `245.0` |
| errorRate | number (0-100) | `0.34` |
| apdex | number (0-1) | `0.95` |
| dependencies | string[] (service IDs) | `["svc-2", "svc-5"]` |
| resources | Resource[] | see below |
| latencyHistory | number[] | 60 data points |
| requestHistory | number[] | 60 data points |
| errorHistory | number[] | 60 data points |

#### Resource (embedded in Service)

| Field | Type | Example |
|-------|------|---------|
| name | string | `"GET /api/products"` |
| type | `"http"` \| `"sql"` \| `"grpc"` \| `"custom"` | `"http"` |
| requestsPerSec | number | `85.2` |
| avgLatencyMs | number | `35.7` |
| p95LatencyMs | number | `78.4` |
| errorRate | number (0-100) | `0.12` |

---

### 4. Trace

APM distributed traces.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"trace-1"` |
| traceId | string | `"abc123def456"` |
| service | string | `"web-store"` |
| resource | string | `"GET /api/products"` |
| env | string | `"production"` |
| status | `"ok"` \| `"error"` | `"ok"` |
| durationMs | number | `142.5` |
| timestamp | string (ISO) | `"2026-04-10T14:23:45Z"` |
| httpMethod | string | `"GET"` |
| httpStatusCode | number | `200` |
| spans | Span[] | see below |

#### Span (embedded in Trace)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"span-1"` |
| name | string | `"django.request"` |
| service | string | `"web-store"` |
| resource | string | `"GET /api/products"` |
| type | string | `"web"` |
| startMs | number | `0` |
| durationMs | number | `142.5` |
| error | boolean | `false` |
| meta | object | `{"http.url": "/api/products", "http.method": "GET"}` |
| children | string[] (span IDs) | `["span-2", "span-3"]` |

---

### 5. LogEntry

Log lines in the Log Explorer.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"log-1"` |
| timestamp | string (ISO) | `"2026-04-10T14:23:45.123Z"` |
| service | string | `"web-store"` |
| source | string | `"python"` |
| host | string | `"web-prod-us-east-1a"` |
| status | `"info"` \| `"warn"` \| `"error"` \| `"debug"` \| `"critical"` | `"info"` |
| message | string | `"GET /api/products 200 42ms"` |
| tags | string[] | `["env:production", "version:2.4.1"]` |
| attributes | object | `{"http.status_code": 200, "duration": 42, "usr.id": "u-123"}` |

---

### 6. Monitor

Alert monitors.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"mon-1"` |
| name | string | `"High CPU on web-prod hosts"` |
| type | `"metric"` \| `"apm"` \| `"log"` \| `"process"` \| `"host"` \| `"composite"` | `"metric"` |
| status | `"OK"` \| `"Alert"` \| `"Warn"` \| `"No Data"` \| `"Muted"` | `"OK"` |
| query | string | `"avg(last_5m):avg:system.cpu.user{env:production} > 90"` |
| message | string | `"CPU usage is above 90% on {{host.name}}. @slack-ops-alerts"` |
| tags | string[] | `["env:production", "team:platform"]` |
| priority | number (1-5) | `2` |
| creator | string | `"sarah.chen@acme-corp.io"` |
| created | string (ISO) | `"2026-01-15T10:30:00Z"` |
| modified | string (ISO) | `"2026-03-20T14:15:00Z"` |
| muted | boolean | `false` |
| groups | MonitorGroup[] | see below |
| overallState | `"OK"` \| `"Alert"` \| `"Warn"` \| `"No Data"` | `"OK"` |

#### MonitorGroup (embedded)

| Field | Type | Example |
|-------|------|---------|
| name | string | `"host:web-prod-us-east-1a"` |
| status | `"OK"` \| `"Alert"` \| `"Warn"` \| `"No Data"` | `"Alert"` |
| lastTriggeredAt | string (ISO) | `"2026-04-10T13:00:00Z"` |

---

### 7. Dashboard

User-created dashboards.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"dash-1"` |
| title | string | `"MySQL - Overview"` |
| description | string | `"Monitor MySQL performance metrics"` |
| author | string | `"sarah.chen@acme-corp.io"` |
| created | string (ISO) | `"2026-02-10T09:00:00Z"` |
| modified | string (ISO) | `"2026-04-05T11:00:00Z"` |
| isStarred | boolean | `true` |
| isReadOnly | boolean | `false` |
| tags | string[] | `["team:database", "service:mysql"]` |
| widgets | Widget[] | see below |
| templateVariables | TemplateVariable[] | see below |

#### Widget (embedded)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"widget-1"` |
| type | `"timeseries"` \| `"query_value"` \| `"toplist"` \| `"table"` \| `"heatmap"` \| `"hostmap"` \| `"event_stream"` \| `"note"` \| `"group"` | `"timeseries"` |
| title | string | `"CPU Usage (%)"` |
| x | number | `0` |
| y | number | `0` |
| width | number (grid units) | `4` |
| height | number (grid units) | `2` |
| definition | object | widget-type-specific config |

For timeseries widgets, `definition`:
```json
{
  "requests": [
    {
      "query": "avg:system.cpu.user{*} by {host}",
      "displayType": "line",
      "color": "#7B68EE"
    }
  ],
  "yaxis": { "min": 0, "max": 100 }
}
```

For query_value widgets, `definition`:
```json
{
  "query": "avg:system.cpu.user{*}",
  "precision": 1,
  "unit": "%",
  "conditionalFormats": [
    { "comparator": ">", "value": 80, "color": "#e74c3c" },
    { "comparator": ">", "value": 50, "color": "#f39c12" },
    { "comparator": "<=", "value": 50, "color": "#2ecc71" }
  ]
}
```

#### TemplateVariable (embedded)

| Field | Type | Example |
|-------|------|---------|
| name | string | `"env"` |
| tag | string | `"env"` |
| default | string | `"production"` |
| availableValues | string[] | `["production", "staging", "dev"]` |

---

### 8. Event

Events timeline.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"evt-1"` |
| title | string | `"Deploy web-store v2.4.1 to production"` |
| text | string | `"Deployed by sarah.chen via CI/CD pipeline"` |
| type | `"deployment"` \| `"alert"` \| `"error"` \| `"info"` \| `"warning"` | `"deployment"` |
| source | string | `"github"` |
| timestamp | string (ISO) | `"2026-04-10T12:00:00Z"` |
| tags | string[] | `["env:production", "service:web-store"]` |
| priority | `"normal"` \| `"low"` | `"normal"` |

---

### 9. SLO (Service Level Objective)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"slo-1"` |
| name | string | `"Web Store Availability"` |
| description | string | `"99.9% of requests return 2xx within 500ms"` |
| type | `"metric"` \| `"monitor"` | `"metric"` |
| targetSli | number | `99.9` |
| currentSli | number | `99.95` |
| timeframe | `"7d"` \| `"30d"` \| `"90d"` | `"30d"` |
| status | `"ok"` \| `"warning"` \| `"breached"` | `"ok"` |
| errorBudgetRemaining | number (percentage) | `85.2` |
| tags | string[] | `["service:web-store", "team:checkout"]` |
| monitorIds | string[] | `["mon-1", "mon-3"]` |

---

## Relationships

```
Host ←── many-to-many (via tags) ──→ Service
Service ──→ has many ──→ Resource
Service ──→ has many ──→ Trace
Trace ──→ has many ──→ Span (tree structure via children[])
Service ←── many-to-many (dependencies) ──→ Service
LogEntry ──→ belongs to ──→ Host (via hostname)
LogEntry ──→ belongs to ──→ Service (via service)
Monitor ──→ monitors ──→ Host/Service (via query + tags)
Dashboard ──→ has many ──→ Widget
SLO ──→ tracks ──→ Monitor (via monitorIds)
```

---

## Seed Data Specification

### createInitialData() structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* 1 user */ },
    hosts: [ /* 12 hosts */ ],
    services: [ /* 8 services with resources */ ],
    traces: [ /* 30 traces with spans */ ],
    logs: [ /* 100 log entries */ ],
    monitors: [ /* 15 monitors */ ],
    dashboards: [ /* 5 dashboards with widgets */ ],
    events: [ /* 20 events */ ],
    slos: [ /* 4 SLOs */ ],

    // UI state
    selectedTimeRange: "Past 1 Hour",
    selectedEnv: "production",
    sidebarCollapsed: false,
    activeDashboardId: "dash-1",
  };
}
```

### Host Seed (12 hosts)

| Hostname Pattern | Cloud | Status | CPU Range | Purpose |
|---|---|---|---|---|
| `web-prod-us-east-{1a,1b,1c}` | AWS | active | 30-70% | Frontend web servers |
| `api-prod-us-east-{1a,1b}` | AWS | active | 50-85% | API servers (one high CPU for alert scenario) |
| `db-prod-us-east-1a` | AWS | active | 25-40% | Primary database |
| `db-replica-us-east-1b` | AWS | active | 15-25% | Read replica |
| `cache-prod-us-east-{1a,1b}` | AWS | active | 10-20% | Redis cache |
| `worker-prod-us-east-1a` | AWS | active | 60-90% | Background job worker |
| `staging-web-1` | GCP | active | 5-15% | Staging server |
| `legacy-app-1` | On-prem | inactive | 0% | Decommissioned server (shows inactive) |

### Service Seed (8 services, forming a service map)

```
[browser] → web-store (python/django) → product-api (go/gin) → postgres-main (db)
                                        → redis-cache (cache)
                                        → payment-service (java/spring) → stripe-api (external)
            user-service (node/express) → postgres-users (db)
            analytics-worker (python/celery)
```

### Monitor Seed (15 monitors)

Include a mix of statuses:
- 9 × OK
- 3 × Alert (CPU spike, high error rate, host down)
- 2 × Warn (latency elevated, disk space)
- 1 × No Data (legacy host)

### Log Seed (100 entries)

Mix of:
- 70% info (HTTP requests, standard operations)
- 15% warn (slow queries, retries, deprecation)
- 10% error (500 errors, timeouts, connection failures)
- 5% debug (detailed trace output)

Spread across services and hosts. Timestamps should span the "Past 1 Hour" range.

### Dashboard Seed (5 dashboards)

1. **System Overview** — 9 widgets: CPU, memory, load, network I/O, host count, top hosts by CPU
2. **MySQL - Overview** — 9 widgets: connections, reads/writes, slow queries, CPU, locking rate (matches screenshot)
3. **Web Store Performance** — 8 widgets: request rate, error rate, latency p95, top endpoints
4. **Infrastructure Costs** — 6 widgets: cost by service, cost trend, instance type breakdown
5. **API Health** — 7 widgets: availability %, error budget, latency distribution, top errors

### Event Seed (20 events)

Mix of deployment events, alert triggers, config changes over the past 24h.
