const STORAGE_KEY = 'cloudflare_mock_state'
const INITIAL_KEY = 'cloudflare_mock_initial'
let initialStateSnapshot = null

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    const clean = sid.replace(/[^a-zA-Z0-9_-]/g, '')
    sessionStorage.setItem('cloudflare_sid', clean)
    return clean
  }
  return sessionStorage.getItem('cloudflare_sid') || null
}

export const storageKey = (sid) => sid ? `${STORAGE_KEY}_${sid}` : STORAGE_KEY
export const initialKey = (sid) => sid ? `${INITIAL_KEY}_${sid}` : INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${sid}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.stored_state || null
  } catch {
    return null
  }
}

function generateTimeseries() {
  const now = new Date()
  const series = []
  for (let i = 23; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3600000)
    const hour = ts.getHours()
    // Traffic pattern: low at night, peak midday
    let base
    if (hour >= 0 && hour < 6) base = 1200 + Math.random() * 800
    else if (hour >= 6 && hour < 9) base = 3000 + Math.random() * 2000
    else if (hour >= 9 && hour < 17) base = 6000 + Math.random() * 2000
    else if (hour >= 17 && hour < 21) base = 4000 + Math.random() * 1500
    else base = 2000 + Math.random() * 1000
    const requests = Math.round(base)
    const cached = Math.round(requests * (0.65 + Math.random() * 0.1))
    series.push({
      timestamp: ts.toISOString(),
      hour: ts.getHours(),
      requests,
      cached_requests: cached,
      uncached_requests: requests - cached,
      bandwidth: requests * 17000, // ~17KB per request avg
      visitors: Math.round(requests * 0.07)
    })
  }
  return series
}

export function createInitialData() {
  const timeseries = generateTimeseries()

  return {
    account: {
      id: 'acc_001',
      name: "John's Account",
      email: 'john@example.com',
      type: 'standard',
      created_on: '2023-01-15T10:30:00Z',
      settings: { enforce_twofactor: false }
    },

    zones: [
      {
        id: 'zone_001',
        name: 'example.com',
        account_id: 'acc_001',
        status: 'active',
        paused: false,
        plan: { id: 'free', name: 'Free Website', price: 0, currency: 'USD', frequency: 'monthly' },
        name_servers: ['anna.ns.cloudflare.com', 'greg.ns.cloudflare.com'],
        original_name_servers: ['ns1.originaldns.com', 'ns2.originaldns.com'],
        created_on: '2023-06-15T08:00:00Z',
        modified_on: '2024-12-01T14:30:00Z',
        activated_on: '2023-06-15T12:00:00Z',
        meta: { step: 4, page_rule_quota: 3, ssl_status: 'active' },
        stats: { total_requests_24h: 125430, threats_blocked_24h: 47, bandwidth_saved_percent: 68 }
      },
      {
        id: 'zone_002',
        name: 'myapp.io',
        account_id: 'acc_001',
        status: 'active',
        paused: false,
        plan: { id: 'pro', name: 'Pro', price: 20, currency: 'USD', frequency: 'monthly' },
        name_servers: ['bob.ns.cloudflare.com', 'sue.ns.cloudflare.com'],
        original_name_servers: ['ns1.godaddy.com', 'ns2.godaddy.com'],
        created_on: '2023-09-01T10:00:00Z',
        modified_on: '2024-11-15T09:00:00Z',
        activated_on: '2023-09-01T14:00:00Z',
        meta: { step: 4, page_rule_quota: 20, ssl_status: 'active' },
        stats: { total_requests_24h: 43200, threats_blocked_24h: 12, bandwidth_saved_percent: 72 }
      },
      {
        id: 'zone_003',
        name: 'staging-site.dev',
        account_id: 'acc_001',
        status: 'pending',
        paused: false,
        plan: { id: 'free', name: 'Free Website', price: 0, currency: 'USD', frequency: 'monthly' },
        name_servers: ['anna.ns.cloudflare.com', 'greg.ns.cloudflare.com'],
        original_name_servers: ['ns1.hover.com', 'ns2.hover.com'],
        created_on: '2024-12-05T11:00:00Z',
        modified_on: '2024-12-05T11:00:00Z',
        activated_on: null,
        meta: { step: 2, page_rule_quota: 3, ssl_status: 'pending_validation' },
        stats: { total_requests_24h: 0, threats_blocked_24h: 0, bandwidth_saved_percent: 0 }
      },
      {
        id: 'zone_004',
        name: 'oldsite.org',
        account_id: 'acc_001',
        status: 'active',
        paused: true,
        plan: { id: 'free', name: 'Free Website', price: 0, currency: 'USD', frequency: 'monthly' },
        name_servers: ['anna.ns.cloudflare.com', 'greg.ns.cloudflare.com'],
        original_name_servers: ['ns1.namecheap.com', 'ns2.namecheap.com'],
        created_on: '2022-03-10T08:00:00Z',
        modified_on: '2024-01-20T16:00:00Z',
        activated_on: '2022-03-10T12:00:00Z',
        meta: { step: 4, page_rule_quota: 3, ssl_status: 'active' },
        stats: { total_requests_24h: 120, threats_blocked_24h: 0, bandwidth_saved_percent: 0 }
      }
    ],

    dnsRecords: {
      zone_001: [
        { id: 'dns_001', zone_id: 'zone_001', type: 'A', name: 'example.com', content: '192.0.2.1', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-06-15T08:05:00Z', modified_on: '2024-11-20T09:00:00Z' },
        { id: 'dns_002', zone_id: 'zone_001', type: 'A', name: 'www.example.com', content: '192.0.2.1', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-06-15T08:05:00Z', modified_on: '2024-11-20T09:00:00Z' },
        { id: 'dns_003', zone_id: 'zone_001', type: 'A', name: 'api.example.com', content: '192.0.2.2', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-07-01T10:00:00Z', modified_on: '2024-10-05T11:00:00Z' },
        { id: 'dns_004', zone_id: 'zone_001', type: 'A', name: 'mail.example.com', content: '192.0.2.3', ttl: 1, proxied: false, proxiable: true, priority: null, locked: false, created_on: '2023-06-15T08:10:00Z', modified_on: '2023-06-15T08:10:00Z' },
        { id: 'dns_005', zone_id: 'zone_001', type: 'A', name: 'ftp.example.com', content: '192.0.2.4', ttl: 3600, proxied: false, proxiable: true, priority: null, locked: false, created_on: '2023-06-15T08:15:00Z', modified_on: '2023-06-15T08:15:00Z' },
        { id: 'dns_006', zone_id: 'zone_001', type: 'AAAA', name: 'example.com', content: '2001:db8::1', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-08-01T09:00:00Z', modified_on: '2024-09-10T14:00:00Z' },
        { id: 'dns_007', zone_id: 'zone_001', type: 'CNAME', name: 'blog.example.com', content: 'blog.example.com', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-09-15T11:00:00Z', modified_on: '2024-07-20T10:00:00Z' },
        { id: 'dns_008', zone_id: 'zone_001', type: 'CNAME', name: 'shop.example.com', content: 'myshop.shopify.com', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2024-01-10T09:00:00Z', modified_on: '2024-11-01T08:00:00Z' },
        { id: 'dns_009', zone_id: 'zone_001', type: 'MX', name: 'example.com', content: 'mail.example.com', ttl: 1, proxied: false, proxiable: false, priority: 10, locked: false, created_on: '2023-06-15T08:20:00Z', modified_on: '2023-06-15T08:20:00Z' },
        { id: 'dns_010', zone_id: 'zone_001', type: 'MX', name: 'example.com', content: 'mail2.example.com', ttl: 1, proxied: false, proxiable: false, priority: 20, locked: false, created_on: '2023-06-15T08:25:00Z', modified_on: '2023-06-15T08:25:00Z' },
        { id: 'dns_011', zone_id: 'zone_001', type: 'TXT', name: 'example.com', content: 'v=spf1 include:_spf.google.com ~all', ttl: 1, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2023-06-20T10:00:00Z', modified_on: '2024-03-15T09:00:00Z' },
        { id: 'dns_012', zone_id: 'zone_001', type: 'TXT', name: '_dmarc.example.com', content: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com', ttl: 3600, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2023-07-10T11:00:00Z', modified_on: '2024-01-20T12:00:00Z' },
        { id: 'dns_013', zone_id: 'zone_001', type: 'A', name: 'dev.example.com', content: '192.0.2.5', ttl: 3600, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2024-02-15T09:00:00Z', modified_on: '2024-08-20T10:00:00Z' },
        { id: 'dns_014', zone_id: 'zone_001', type: 'CNAME', name: 'cdn.example.com', content: 'cdn.cloudflare.com', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2024-03-10T11:00:00Z', modified_on: '2024-09-15T14:00:00Z' },
        { id: 'dns_015', zone_id: 'zone_001', type: 'A', name: 'staging.example.com', content: '192.0.2.6', ttl: 3600, proxied: false, proxiable: true, priority: null, locked: false, created_on: '2024-04-01T08:00:00Z', modified_on: '2024-10-01T09:00:00Z' },
        { id: 'dns_016', zone_id: 'zone_001', type: 'TXT', name: 'example.com', content: 'google-site-verification=abc123xyz789', ttl: 1, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2024-05-20T10:00:00Z', modified_on: '2024-05-20T10:00:00Z' },
        { id: 'dns_017', zone_id: 'zone_001', type: 'SRV', name: '_sip._tcp.example.com', content: 'sip.example.com', ttl: 3600, proxied: false, proxiable: false, priority: 10, locked: false, created_on: '2024-06-15T11:00:00Z', modified_on: '2024-06-15T11:00:00Z' },
        { id: 'dns_018', zone_id: 'zone_001', type: 'MX', name: 'example.com', content: 'aspmx.l.google.com', ttl: 1, proxied: false, proxiable: false, priority: 5, locked: false, created_on: '2024-07-01T09:00:00Z', modified_on: '2024-07-01T09:00:00Z' }
      ],
      zone_002: [
        { id: 'dns_101', zone_id: 'zone_002', type: 'A', name: 'myapp.io', content: '198.51.100.1', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-09-01T10:00:00Z', modified_on: '2024-10-20T09:00:00Z' },
        { id: 'dns_102', zone_id: 'zone_002', type: 'A', name: 'www.myapp.io', content: '198.51.100.1', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-09-01T10:00:00Z', modified_on: '2024-10-20T09:00:00Z' },
        { id: 'dns_103', zone_id: 'zone_002', type: 'CNAME', name: 'api.myapp.io', content: 'api.myapp.io', ttl: 1, proxied: true, proxiable: true, priority: null, locked: false, created_on: '2023-09-10T11:00:00Z', modified_on: '2024-09-15T10:00:00Z' },
        { id: 'dns_104', zone_id: 'zone_002', type: 'MX', name: 'myapp.io', content: 'mail.myapp.io', ttl: 1, proxied: false, proxiable: false, priority: 10, locked: false, created_on: '2023-09-01T10:05:00Z', modified_on: '2023-09-01T10:05:00Z' },
        { id: 'dns_105', zone_id: 'zone_002', type: 'TXT', name: 'myapp.io', content: 'v=spf1 include:sendgrid.net ~all', ttl: 1, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2023-09-05T09:00:00Z', modified_on: '2024-02-10T11:00:00Z' },
        { id: 'dns_106', zone_id: 'zone_002', type: 'TXT', name: '_dmarc.myapp.io', content: 'v=DMARC1; p=reject; rua=mailto:dmarc@myapp.io', ttl: 3600, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2023-10-01T10:00:00Z', modified_on: '2024-04-15T09:00:00Z' }
      ],
      zone_003: [
        { id: 'dns_201', zone_id: 'zone_003', type: 'A', name: 'staging-site.dev', content: '203.0.113.1', ttl: 1, proxied: false, proxiable: true, priority: null, locked: false, created_on: '2024-12-05T11:00:00Z', modified_on: '2024-12-05T11:00:00Z' },
        { id: 'dns_202', zone_id: 'zone_003', type: 'A', name: 'www.staging-site.dev', content: '203.0.113.1', ttl: 1, proxied: false, proxiable: true, priority: null, locked: false, created_on: '2024-12-05T11:01:00Z', modified_on: '2024-12-05T11:01:00Z' },
        { id: 'dns_203', zone_id: 'zone_003', type: 'TXT', name: 'staging-site.dev', content: 'xloudflare-verify=abc123def456', ttl: 3600, proxied: false, proxiable: false, priority: null, locked: false, created_on: '2024-12-05T11:02:00Z', modified_on: '2024-12-05T11:02:00Z' }
      ]
    },

    sslSettings: {
      zone_001: {
        zone_id: 'zone_001',
        mode: 'full',
        certificate_status: 'active',
        always_use_https: true,
        min_tls_version: '1.2',
        automatic_https_rewrites: true,
        tls_1_3: 'on',
        edge_certificates: [
          { id: 'cert_001', type: 'universal', hosts: ['example.com', '*.example.com'], status: 'active', issuer: 'Xloudflare Inc ECC CA-3', expires_on: '2025-06-15T12:00:00Z', uploaded_on: null }
        ]
      },
      zone_002: {
        zone_id: 'zone_002',
        mode: 'strict',
        certificate_status: 'active',
        always_use_https: true,
        min_tls_version: '1.2',
        automatic_https_rewrites: true,
        tls_1_3: 'on',
        edge_certificates: [
          { id: 'cert_002', type: 'universal', hosts: ['myapp.io', '*.myapp.io'], status: 'active', issuer: 'Xloudflare Inc ECC CA-3', expires_on: '2025-09-01T12:00:00Z', uploaded_on: null }
        ]
      },
      zone_003: {
        zone_id: 'zone_003',
        mode: 'flexible',
        certificate_status: 'pending_validation',
        always_use_https: false,
        min_tls_version: '1.0',
        automatic_https_rewrites: false,
        tls_1_3: 'off',
        edge_certificates: [
          { id: 'cert_003', type: 'universal', hosts: ['staging-site.dev', '*.staging-site.dev'], status: 'pending', issuer: 'Xloudflare Inc ECC CA-3', expires_on: null, uploaded_on: null }
        ]
      },
      zone_004: {
        zone_id: 'zone_004',
        mode: 'flexible',
        certificate_status: 'active',
        always_use_https: false,
        min_tls_version: '1.0',
        automatic_https_rewrites: false,
        tls_1_3: 'off',
        edge_certificates: [
          { id: 'cert_004', type: 'universal', hosts: ['oldsite.org', '*.oldsite.org'], status: 'active', issuer: 'Xloudflare Inc ECC CA-3', expires_on: '2025-03-10T12:00:00Z', uploaded_on: null }
        ]
      }
    },

    securitySettings: {
      zone_001: {
        zone_id: 'zone_001',
        security_level: 'medium',
        challenge_ttl: 1800,
        browser_integrity_check: true,
        bot_fight_mode: true,
        waf_enabled: true,
        ip_access_rules: [
          { id: 'ip_001', mode: 'block', value: '198.51.100.0/24', notes: 'Blocked suspicious range', created_on: '2024-03-01T10:00:00Z' }
        ]
      },
      zone_002: {
        zone_id: 'zone_002',
        security_level: 'high',
        challenge_ttl: 3600,
        browser_integrity_check: true,
        bot_fight_mode: true,
        waf_enabled: true,
        ip_access_rules: []
      },
      zone_003: {
        zone_id: 'zone_003',
        security_level: 'low',
        challenge_ttl: 1800,
        browser_integrity_check: false,
        bot_fight_mode: false,
        waf_enabled: false,
        ip_access_rules: []
      },
      zone_004: {
        zone_id: 'zone_004',
        security_level: 'essentially_off',
        challenge_ttl: 1800,
        browser_integrity_check: false,
        bot_fight_mode: false,
        waf_enabled: false,
        ip_access_rules: []
      }
    },

    firewallRules: {
      zone_001: [
        {
          id: 'fw_001', zone_id: 'zone_001', action: 'block', description: 'Block Known Bots',
          filter: { id: 'filter_001', expression: '(cf.client.bot)', paused: false },
          priority: 1, paused: false, created_on: '2024-01-10T10:00:00Z', modified_on: '2024-06-15T14:00:00Z', activity_last_24h: 23
        },
        {
          id: 'fw_002', zone_id: 'zone_001', action: 'block', description: 'Block Traffic from CN',
          filter: { id: 'filter_002', expression: '(ip.geoip.country eq "CN")', paused: false },
          priority: 2, paused: false, created_on: '2024-02-20T09:00:00Z', modified_on: '2024-07-01T11:00:00Z', activity_last_24h: 15
        },
        {
          id: 'fw_003', zone_id: 'zone_001', action: 'allow', description: 'Allow Office IP Range',
          filter: { id: 'filter_003', expression: '(ip.src in {203.0.113.0/24})', paused: false },
          priority: 3, paused: false, created_on: '2024-03-05T10:00:00Z', modified_on: '2024-09-20T15:00:00Z', activity_last_24h: 0
        },
        {
          id: 'fw_004', zone_id: 'zone_001', action: 'challenge', description: 'Rate limit login page',
          filter: { id: 'filter_004', expression: '(http.request.uri.path eq "/login" and http.request.method eq "POST")', paused: false },
          priority: 4, paused: false, created_on: '2024-04-15T08:00:00Z', modified_on: '2024-10-01T09:00:00Z', activity_last_24h: 8
        }
      ],
      zone_002: [
        {
          id: 'fw_101', zone_id: 'zone_002', action: 'block', description: 'Block Bad User Agents',
          filter: { id: 'filter_101', expression: '(http.user_agent contains "sqlmap" or http.user_agent contains "nikto")', paused: false },
          priority: 1, paused: false, created_on: '2024-01-15T10:00:00Z', modified_on: '2024-05-20T14:00:00Z', activity_last_24h: 4
        },
        {
          id: 'fw_102', zone_id: 'zone_002', action: 'js_challenge', description: 'Challenge Suspicious IPs',
          filter: { id: 'filter_102', expression: '(cf.threat_score gt 50)', paused: false },
          priority: 2, paused: false, created_on: '2024-02-01T09:00:00Z', modified_on: '2024-06-10T11:00:00Z', activity_last_24h: 7
        }
      ]
    },

    speedSettings: {
      zone_001: {
        zone_id: 'zone_001',
        auto_minify: { javascript: true, css: true, html: false },
        brotli: true,
        rocket_loader: 'off',
        polish: 'off',
        mirage: false,
        early_hints: true,
        http2_prioritization: true
      },
      zone_002: {
        zone_id: 'zone_002',
        auto_minify: { javascript: true, css: true, html: true },
        brotli: true,
        rocket_loader: 'on',
        polish: 'lossless',
        mirage: true,
        early_hints: true,
        http2_prioritization: true
      },
      zone_003: {
        zone_id: 'zone_003',
        auto_minify: { javascript: false, css: false, html: false },
        brotli: false,
        rocket_loader: 'off',
        polish: 'off',
        mirage: false,
        early_hints: false,
        http2_prioritization: false
      },
      zone_004: {
        zone_id: 'zone_004',
        auto_minify: { javascript: false, css: false, html: false },
        brotli: false,
        rocket_loader: 'off',
        polish: 'off',
        mirage: false,
        early_hints: false,
        http2_prioritization: false
      }
    },

    cachingSettings: {
      zone_001: {
        zone_id: 'zone_001',
        caching_level: 'standard',
        browser_cache_ttl: 14400,
        always_online: true,
        development_mode: false,
        development_mode_expires: null,
        cache_rules: []
      },
      zone_002: {
        zone_id: 'zone_002',
        caching_level: 'aggressive',
        browser_cache_ttl: 86400,
        always_online: true,
        development_mode: false,
        development_mode_expires: null,
        cache_rules: []
      },
      zone_003: {
        zone_id: 'zone_003',
        caching_level: 'basic',
        browser_cache_ttl: 3600,
        always_online: false,
        development_mode: false,
        development_mode_expires: null,
        cache_rules: []
      },
      zone_004: {
        zone_id: 'zone_004',
        caching_level: 'standard',
        browser_cache_ttl: 14400,
        always_online: false,
        development_mode: false,
        development_mode_expires: null,
        cache_rules: []
      }
    },

    pageRules: {
      zone_001: [
        {
          id: 'pr_001', zone_id: 'zone_001',
          targets: [{ target: 'url', constraint: { operator: 'matches', value: 'http://*.example.com/*' } }],
          actions: [{ id: 'always_use_https', value: 'on' }],
          priority: 1, status: 'active', created_on: '2024-02-15T10:00:00Z', modified_on: '2024-02-15T10:00:00Z'
        },
        {
          id: 'pr_002', zone_id: 'zone_001',
          targets: [{ target: 'url', constraint: { operator: 'matches', value: 'example.com/admin/*' } }],
          actions: [{ id: 'cache_level', value: 'bypass' }],
          priority: 2, status: 'active', created_on: '2024-03-10T09:00:00Z', modified_on: '2024-03-10T09:00:00Z'
        },
        {
          id: 'pr_003', zone_id: 'zone_001',
          targets: [{ target: 'url', constraint: { operator: 'matches', value: 'old.example.com/*' } }],
          actions: [{ id: 'forwarding_url', value: { url: 'https://example.com/$1', status_code: 301 } }],
          priority: 3, status: 'active', created_on: '2024-04-20T11:00:00Z', modified_on: '2024-04-20T11:00:00Z'
        }
      ],
      zone_002: [
        {
          id: 'pr_101', zone_id: 'zone_002',
          targets: [{ target: 'url', constraint: { operator: 'matches', value: 'http://*.myapp.io/*' } }],
          actions: [{ id: 'always_use_https', value: 'on' }],
          priority: 1, status: 'active', created_on: '2023-09-05T10:00:00Z', modified_on: '2023-09-05T10:00:00Z'
        }
      ]
    },

    networkSettings: {
      zone_001: { zone_id: 'zone_001', http2: true, http3: true, websockets: true, grpc: false, onion_routing: 'off', ip_geolocation: true, pseudo_ipv4: 'off' },
      zone_002: { zone_id: 'zone_002', http2: true, http3: true, websockets: true, grpc: true, onion_routing: 'off', ip_geolocation: true, pseudo_ipv4: 'off' },
      zone_003: { zone_id: 'zone_003', http2: true, http3: false, websockets: true, grpc: false, onion_routing: 'off', ip_geolocation: true, pseudo_ipv4: 'off' },
      zone_004: { zone_id: 'zone_004', http2: true, http3: false, websockets: false, grpc: false, onion_routing: 'off', ip_geolocation: false, pseudo_ipv4: 'off' }
    },

    scrapeShieldSettings: {
      zone_001: { zone_id: 'zone_001', email_obfuscation: true, server_side_excludes: true, hotlink_protection: false },
      zone_002: { zone_id: 'zone_002', email_obfuscation: true, server_side_excludes: false, hotlink_protection: true },
      zone_003: { zone_id: 'zone_003', email_obfuscation: false, server_side_excludes: false, hotlink_protection: false },
      zone_004: { zone_id: 'zone_004', email_obfuscation: false, server_side_excludes: false, hotlink_protection: false }
    },

    analytics: {
      zone_001: {
        zone_id: 'zone_001',
        period: '24h',
        traffic: {
          total_requests: 125430,
          cached_requests: 85292,
          uncached_requests: 40138,
          unique_visitors: 8734,
          bandwidth: {
            total: 2147483648,
            cached: 1503238553,
            uncached: 644245095
          },
          requests_by_country: [
            { country: 'US', requests: 45230, percent: 36 },
            { country: 'GB', requests: 18760, percent: 15 },
            { country: 'DE', requests: 12540, percent: 10 },
            { country: 'FR', requests: 8900, percent: 7 },
            { country: 'JP', requests: 7500, percent: 6 }
          ],
          requests_by_status: [
            { status: 200, count: 98500, label: '2xx Success' },
            { status: 301, count: 8700, label: '3xx Redirect' },
            { status: 304, count: 12400, label: '3xx Not Modified' },
            { status: 404, count: 4830, label: '4xx Client Error' },
            { status: 500, count: 1000, label: '5xx Server Error' }
          ],
          timeseries
        },
        security: {
          threats_stopped: 47,
          threats_by_type: [
            { type: 'Bad browser', count: 18 },
            { type: 'Hot linker', count: 12 },
            { type: 'Human challenged', count: 9 },
            { type: 'Bad IP', count: 8 }
          ],
          threats_by_country: [
            { country: 'CN', count: 15 },
            { country: 'RU', count: 12 },
            { country: 'BR', count: 8 },
            { country: 'VN', count: 7 },
            { country: 'IR', count: 5 }
          ]
        },
        performance: {
          bandwidth_saved_percent: 68,
          content_type_breakdown: [
            { type: 'JavaScript', percent: 35 },
            { type: 'Images', percent: 28 },
            { type: 'CSS', percent: 15 },
            { type: 'HTML', percent: 12 },
            { type: 'Other', percent: 10 }
          ]
        }
      },
      zone_002: {
        zone_id: 'zone_002',
        period: '24h',
        traffic: {
          total_requests: 43200,
          cached_requests: 31104,
          uncached_requests: 12096,
          unique_visitors: 3021,
          bandwidth: { total: 734003200, cached: 513002240, uncached: 221000960 },
          requests_by_country: [
            { country: 'US', requests: 17280, percent: 40 },
            { country: 'CA', requests: 8640, percent: 20 },
            { country: 'AU', requests: 4320, percent: 10 }
          ],
          requests_by_status: [
            { status: 200, count: 35000, label: '2xx Success' },
            { status: 301, count: 3200, label: '3xx Redirect' },
            { status: 404, count: 3000, label: '4xx Client Error' },
            { status: 500, count: 2000, label: '5xx Server Error' }
          ],
          timeseries: timeseries.map(t => ({ ...t, requests: Math.round(t.requests * 0.34), cached_requests: Math.round(t.cached_requests * 0.34), uncached_requests: Math.round(t.uncached_requests * 0.34) }))
        },
        security: { threats_stopped: 12, threats_by_type: [{ type: 'Bad browser', count: 7 }, { type: 'Bad IP', count: 5 }], threats_by_country: [{ country: 'CN', count: 8 }, { country: 'RU', count: 4 }] },
        performance: { bandwidth_saved_percent: 72, content_type_breakdown: [{ type: 'JavaScript', percent: 40 }, { type: 'Images', percent: 25 }, { type: 'CSS', percent: 20 }, { type: 'HTML', percent: 10 }, { type: 'Other', percent: 5 }] }
      }
    },

    kvNamespaces: [
      {
        id: 'kv_001',
        title: 'API_CACHE',
        created_on: '2024-05-01T10:00:00Z',
        keys_count: 142
      },
      {
        id: 'kv_002',
        title: 'SESSION_STORE',
        created_on: '2024-08-15T09:00:00Z',
        keys_count: 2387
      }
    ],

    workers: [
      {
        id: 'worker_001', account_id: 'acc_001', name: 'api-handler',
        script: "addEventListener('fetch', event => {\n  event.respondWith(handleRequest(event.request))\n})\n\nasync function handleRequest(request) {\n  return new Response('API Response', { status: 200 })\n}",
        created_on: '2024-05-01T10:00:00Z', modified_on: '2024-11-15T09:00:00Z',
        routes: [{ id: 'route_001', pattern: 'example.com/api/*', zone_id: 'zone_001', zone_name: 'example.com' }],
        usage: { requests_today: 4521, cpu_time_avg_ms: 2.3 }
      },
      {
        id: 'worker_002', account_id: 'acc_001', name: 'redirect-worker',
        script: "addEventListener('fetch', event => {\n  const url = new URL(event.request.url)\n  const newUrl = url.href.replace('/old/', '/')\n  event.respondWith(Response.redirect(newUrl, 301))\n})",
        created_on: '2024-06-15T11:00:00Z', modified_on: '2024-10-20T14:00:00Z',
        routes: [{ id: 'route_002', pattern: 'example.com/old/*', zone_id: 'zone_001', zone_name: 'example.com' }],
        usage: { requests_today: 123, cpu_time_avg_ms: 0.8 }
      }
    ],

    notifications: [
      {
        id: 'notif_001', account_id: 'acc_001', type: 'info',
        title: 'SSL certificate renewed',
        message: 'The universal SSL certificate for example.com has been renewed and is now active.',
        zone_name: 'example.com', read: true, created_on: '2024-12-08T15:30:00Z'
      },
      {
        id: 'notif_002', account_id: 'acc_001', type: 'warning',
        title: 'Unusual traffic spike detected',
        message: 'Traffic to example.com has increased 3x above normal levels in the past hour.',
        zone_name: 'example.com', read: false, created_on: '2024-12-09T10:15:00Z'
      },
      {
        id: 'notif_003', account_id: 'acc_001', type: 'info',
        title: 'New firewall rule triggered',
        message: 'The "Block Known Bots" firewall rule has blocked 23 requests in the last 24 hours.',
        zone_name: 'example.com', read: false, created_on: '2024-12-09T14:00:00Z'
      },
      {
        id: 'notif_004', account_id: 'acc_001', type: 'success',
        title: 'Zone activated',
        message: 'myapp.io is now active on Xloudflare. Your DNS records have been imported.',
        zone_name: 'myapp.io', read: true, created_on: '2024-12-05T09:00:00Z'
      },
      {
        id: 'notif_005', account_id: 'acc_001', type: 'warning',
        title: 'DDoS attack mitigated',
        message: 'A DDoS attack targeting example.com was detected and automatically mitigated.',
        zone_name: 'example.com', read: true, created_on: '2024-12-07T03:45:00Z'
      },
      {
        id: 'notif_006', account_id: 'acc_001', type: 'info',
        title: 'Cache purge completed',
        message: 'All cached files for example.com have been purged successfully.',
        zone_name: 'example.com', read: false, created_on: '2024-12-10T11:30:00Z'
      }
    ],

    selectedZoneId: null,
    currentUser: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null
    }
  }
}

export function initializeData(sid = null, customState = null) {
  const key = storageKey(sid)
  const iKey = initialKey(sid)
  const defaults = createInitialData()

  let state
  if (customState) {
    // Deep merge custom state with defaults
    function deepMerge(base, override) {
      if (!override) return base
      const result = { ...base }
      for (const k of Object.keys(override)) {
        if (override[k] === null || override[k] === undefined) continue
        if (Array.isArray(override[k])) {
          result[k] = override[k]
        } else if (typeof override[k] === 'object' && typeof base[k] === 'object' && !Array.isArray(base[k])) {
          result[k] = deepMerge(base[k] || {}, override[k])
        } else {
          result[k] = override[k]
        }
      }
      return result
    }
    state = deepMerge(defaults, customState)
    localStorage.setItem(iKey, JSON.stringify(state))
    localStorage.setItem(key, JSON.stringify(state))
    return state
  }

  const saved = localStorage.getItem(key)
  if (saved) {
    try { state = JSON.parse(saved) } catch { state = defaults }
  } else {
    state = defaults
  }

  const isFirstLoad = !localStorage.getItem(iKey)
  if (isFirstLoad) {
    localStorage.setItem(iKey, JSON.stringify(state))
    if (sid) {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state })
      }).catch(() => {})
    }
  }

  localStorage.setItem(key, JSON.stringify(state))
  return state
}

export function getState(sid = null) {
  const key = storageKey(sid)
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // fall through
  }
  return createInitialData()
}

let syncTimer = null

export function saveState(state, sid) {
  const s = sid || getSessionId()
  const key = storageKey(s)
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const effectiveSid = s || new URLSearchParams(window.location.search).get('sid') || 'default'
    fetch(`/post?sid=${effectiveSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {})
  }, 500)
}

export function setState(state, sid) {
  const key = storageKey(sid)
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function resetState(sid) {
  const key = storageKey(sid)
  const iKey = initialKey(sid)
  const initialRaw = localStorage.getItem(iKey)
  if (initialRaw) {
    localStorage.setItem(key, initialRaw)
    return JSON.parse(initialRaw)
  }
  const fresh = createInitialData()
  setState(fresh, sid)
  return fresh
}

export function getInitialState(sid) {
  const iKey = initialKey(sid)
  const stored = localStorage.getItem(iKey)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* fall through */ }
  }
  return createInitialData()
}

export function getStateDiff(initial, current) {
  const diff = {}
  if (!initial || !current) return diff
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const iVal = JSON.stringify(initial[key])
    const cVal = JSON.stringify(current[key])
    if (iVal !== cVal) {
      diff[key] = { from: initial[key], to: current[key] }
    }
  }
  return diff
}
