const BASE_KEY = 'amplitude_mock_state'
const BASE_INITIAL_KEY = 'amplitude_mock_initial_state'

export function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('amplitude_sid', sid)
    return sid
  }
  return sessionStorage.getItem('amplitude_sid') || null
}

export function storageKey(sid) {
  return sid ? `${BASE_KEY}_${sid}` : BASE_KEY
}

export function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY
}

export async function fetchCustomState(sid) {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state'
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data && data.current_state ? data.current_state : null
  } catch (e) {
    return null
  }
}

// Seeded random for reproducible data
function seededRandom(seed) {
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
    return (s >>> 0) / 0xFFFFFFFF
  }
}

function generateDailyData(days = 30, baseVal = 50, variance = 20, trend = 'up', seed = 42) {
  const rng = seededRandom(seed)
  const data = []
  const start = new Date('2024-11-16')
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    let value
    if (trend === 'up') {
      const base = baseVal + (i / days) * variance
      value = Math.max(0, Math.round(base + (rng() - 0.5) * variance * 0.6))
    } else if (trend === 'down') {
      const base = baseVal + variance - (i / days) * variance
      value = Math.max(0, Math.round(base + (rng() - 0.5) * variance * 0.6))
    } else {
      value = Math.max(0, Math.round(baseVal + (rng() - 0.5) * variance))
    }
    data.push({ date: dateStr, value })
  }
  return data
}

const EVENT_TYPES = [
  { name: 'Page View', category: 'tracking', weight: 25 },
  { name: 'Button Click', category: 'interaction', weight: 18 },
  { name: 'Sign Up', category: 'conversion', weight: 3 },
  { name: 'Login', category: 'auth', weight: 8 },
  { name: 'Purchase', category: 'conversion', weight: 4 },
  { name: 'Add to Cart', category: 'conversion', weight: 6 },
  { name: 'Search', category: 'interaction', weight: 10 },
  { name: 'Form Submit', category: 'interaction', weight: 5 },
  { name: 'Start Session', category: 'session', weight: 12 },
  { name: 'End Session', category: 'session', weight: 11 },
  { name: 'Video Play', category: 'engagement', weight: 4 },
  { name: 'Share', category: 'social', weight: 2 },
  { name: 'Download', category: 'engagement', weight: 3 },
  { name: 'Scroll Depth', category: 'engagement', weight: 8 },
  { name: 'Error', category: 'technical', weight: 1 },
]

const PAGES = [
  { title: 'Home', path: '/' },
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Settings', path: '/settings' },
  { title: 'Profile', path: '/profile' },
  { title: 'Pricing', path: '/pricing' },
  { title: 'Products', path: '/products' },
  { title: 'Product Detail', path: '/products/123' },
  { title: 'Cart', path: '/cart' },
  { title: 'Checkout', path: '/checkout' },
  { title: 'Blog', path: '/blog' },
  { title: 'Help Center', path: '/help' },
  { title: 'Search Results', path: '/search' },
]

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'Brazil', 'India', 'Indonesia']
const COUNTRY_FLAGS = { 'United States': 'us', 'United Kingdom': 'gb', 'Canada': 'ca', 'Germany': 'de', 'France': 'fr', 'Australia': 'au', 'Japan': 'jp', 'Brazil': 'br', 'India': 'in', 'Indonesia': 'id' }
const PLATFORMS = ['Web', 'iOS', 'Android']
const BROWSERS = ['Chrome 131', 'Safari 17', 'Firefox 121', 'Edge 120', 'Chrome Mobile', 'Safari Mobile']
const OS_LIST = ['Mac OS X', 'Windows 11', 'Linux', 'iOS 17', 'Android 14', 'iPadOS 17']
const PLANS = ['Free', 'Pro', 'Enterprise']
const ROLES = ['Product Manager', 'Engineer', 'Designer', 'Marketing', 'Sales', 'CEO', 'Data Analyst', 'Content']
const COMPANIES = ['Acme Corp', 'TechStart', 'GlobalCo', 'Bauhaus Digital', 'Nusantara Tech', 'Innovate Labs', 'Media Group', 'DataFlow', 'CloudPeak', 'NextGen', 'PixelPerfect', 'StreamLine']
const SIGNUP_SOURCES = ['organic', 'referral', 'google_ads', 'twitter', 'linkedin', 'direct', 'email_campaign']
const BUTTON_TEXTS = ['Sign Up', 'Learn More', 'Get Started', 'Buy Now', 'Add to Cart', 'Subscribe', 'Download', 'Share', 'Contact Us', 'View Demo']

function pickWeighted(rng, items) {
  const total = items.reduce((s, i) => s + i.weight, 0)
  let r = rng() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item
  }
  return items[0]
}

function pickRandom(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function generateUsers(count = 20) {
  const rng = seededRandom(12345)
  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tara']
  const lastNames = ['Johnson', 'Martinez', 'Zhang', 'Mueller', 'Putri', 'Thompson', 'Okonkwo', 'Sullivan', 'Kim', 'Patel', 'Garcia', 'Chen', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Lee', 'Walker', 'Hall', 'Wright']
  const domains = ['example.com', 'techstart.io', 'globalco.com', 'bauhaus.de', 'startup.id', 'acmecorp.com', 'innovate.ca', 'mediagroup.com', 'dataflow.ai', 'cloudpeak.io', 'nextgen.dev', 'pixel.co']
  const users = []

  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length]
    const ln = lastNames[i % lastNames.length]
    const domain = pickRandom(rng, domains)
    const country = pickRandom(rng, COUNTRIES)
    const platform = pickRandom(rng, PLATFORMS)
    const isMobile = platform !== 'Web'
    const daysAgo = Math.floor(rng() * 30)
    const firstSeenDate = new Date('2024-12-16')
    firstSeenDate.setDate(firstSeenDate.getDate() - 30 - Math.floor(rng() * 30))
    const lastSeenDate = new Date('2024-12-16')
    lastSeenDate.setDate(lastSeenDate.getDate() - daysAgo)

    users.push({
      id: `user_${String(i + 1).padStart(3, '0')}`,
      userId: `${fn.toLowerCase()}@${domain}`,
      amplitudeId: String(1000000000000 + Math.floor(rng() * 99999999999)),
      displayName: `${fn} ${ln}`,
      avatar: null,
      firstSeen: firstSeenDate.toISOString().split('T')[0],
      lastSeen: lastSeenDate.toISOString().split('T')[0],
      country,
      countryFlag: COUNTRY_FLAGS[country] || 'us',
      platform,
      deviceType: isMobile ? (rng() > 0.7 ? 'Tablet' : 'Mobile') : 'Desktop',
      os: isMobile ? pickRandom(rng, ['iOS 17', 'Android 14', 'iPadOS 17']) : pickRandom(rng, ['Mac OS X', 'Windows 11', 'Linux']),
      browser: isMobile ? pickRandom(rng, ['Chrome Mobile', 'Safari Mobile']) : pickRandom(rng, ['Chrome 131', 'Safari 17', 'Firefox 121', 'Edge 120']),
      library: isMobile ? 'xmplitude-ios/8.5.0' : 'xmplitude-ts-script/2.11.1',
      properties: {
        plan: pickRandom(rng, PLANS),
        company: pickRandom(rng, COMPANIES),
        role: pickRandom(rng, ROLES),
        signupSource: pickRandom(rng, SIGNUP_SOURCES),
        totalPurchases: Math.floor(rng() * 20),
        lifetimeValue: Math.round(rng() * 5000 * 100) / 100,
      }
    })
  }
  return users
}

function generateEvents(users, count = 1200) {
  const rng = seededRandom(67890)
  const events = []
  const now = new Date('2024-12-16T18:00:00')

  for (let i = 0; i < count; i++) {
    const user = pickRandom(rng, users)
    const eventType = pickWeighted(rng, EVENT_TYPES)
    const daysAgo = Math.floor(rng() * 30)
    const hoursAgo = Math.floor(rng() * 24)
    const minutesAgo = Math.floor(rng() * 60)
    const ts = new Date(now)
    ts.setDate(ts.getDate() - daysAgo)
    ts.setHours(ts.getHours() - hoursAgo)
    ts.setMinutes(ts.getMinutes() - minutesAgo)

    const page = pickRandom(rng, PAGES)
    let properties = {}

    switch (eventType.name) {
      case 'Page View':
        properties = {
          'Page Title': page.title,
          'Page Path': page.path,
          'Page URL': `https://app.example.com${page.path}`,
          'Referrer': rng() > 0.6 ? pickRandom(rng, ['https://google.com', 'https://twitter.com', 'https://linkedin.com', '(direct)']) : null,
        }
        break
      case 'Button Click':
        properties = {
          'Button Text': pickRandom(rng, BUTTON_TEXTS),
          'Page Path': page.path,
          'Element ID': `btn-${Math.floor(rng() * 100)}`,
        }
        break
      case 'Purchase':
        properties = {
          'Amount': Math.round((10 + rng() * 490) * 100) / 100,
          'Currency': 'USD',
          'Product': pickRandom(rng, ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Add-on: Storage', 'Add-on: Analytics']),
          'Payment Method': pickRandom(rng, ['Credit Card', 'PayPal', 'Wire Transfer']),
        }
        break
      case 'Add to Cart':
        properties = {
          'Product': pickRandom(rng, ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Add-on: Storage']),
          'Price': Math.round((10 + rng() * 200) * 100) / 100,
          'Quantity': Math.ceil(rng() * 3),
        }
        break
      case 'Sign Up':
        properties = {
          'Method': pickRandom(rng, ['Email', 'Google', 'GitHub', 'SSO']),
          'Plan': pickRandom(rng, PLANS),
          'Source': pickRandom(rng, SIGNUP_SOURCES),
        }
        break
      case 'Login':
        properties = {
          'Method': pickRandom(rng, ['Email', 'Google', 'GitHub', 'SSO']),
          'Success': rng() > 0.05,
        }
        break
      case 'Search':
        properties = {
          'Query': pickRandom(rng, ['pricing', 'api docs', 'dashboard', 'export data', 'integrations', 'billing', 'support']),
          'Results Count': Math.floor(rng() * 50),
          'Page Path': '/search',
        }
        break
      case 'Form Submit':
        properties = {
          'Form Name': pickRandom(rng, ['Contact Form', 'Newsletter', 'Feedback', 'Support Ticket', 'Profile Update']),
          'Success': rng() > 0.1,
        }
        break
      case 'Start Session':
      case 'End Session':
        properties = {
          'Session Length': eventType.name === 'End Session' ? Math.floor(rng() * 1800) : undefined,
          'Session ID': `sess_${Math.floor(rng() * 999999)}`,
        }
        break
      case 'Video Play':
        properties = {
          'Video Title': pickRandom(rng, ['Product Tour', 'Getting Started', 'Advanced Features', 'Case Study']),
          'Duration': Math.floor(rng() * 300),
          'Completion': Math.round(rng() * 100),
        }
        break
      case 'Share':
        properties = {
          'Platform': pickRandom(rng, ['Twitter', 'LinkedIn', 'Email', 'Slack']),
          'Content Type': pickRandom(rng, ['Article', 'Dashboard', 'Report']),
        }
        break
      case 'Download':
        properties = {
          'File Type': pickRandom(rng, ['PDF', 'CSV', 'PNG', 'XLSX']),
          'File Name': pickRandom(rng, ['report-q4.pdf', 'users-export.csv', 'dashboard-screenshot.png', 'analytics-data.xlsx']),
        }
        break
      case 'Scroll Depth':
        properties = {
          'Depth': pickRandom(rng, [25, 50, 75, 100]),
          'Page Path': page.path,
        }
        break
      case 'Error':
        properties = {
          'Error Code': pickRandom(rng, ['404', '500', '403', 'TIMEOUT', 'NETWORK']),
          'Page Path': page.path,
          'Message': pickRandom(rng, ['Not Found', 'Internal Server Error', 'Forbidden', 'Request Timeout', 'Network Error']),
        }
        break
    }

    // Clean null/undefined properties
    Object.keys(properties).forEach(k => {
      if (properties[k] === null || properties[k] === undefined) delete properties[k]
    })

    events.push({
      id: `evt_${String(i + 1).padStart(5, '0')}`,
      name: eventType.name,
      category: eventType.category,
      userId: user.id,
      timestamp: ts.toISOString().split('.')[0],
      sessionId: `sess_${Date.now() - Math.floor(rng() * 10000000)}`,
      properties,
    })
  }

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function generateRetentionHeatmap(seed = 111) {
  const rng = seededRandom(seed)
  const weeks = ['Nov 18', 'Nov 25', 'Dec 2', 'Dec 9']
  const rows = []
  weeks.forEach((week, wi) => {
    const newUsers = 30 + Math.floor(rng() * 40)
    const days = []
    for (let d = 0; d <= 14; d++) {
      if (d === 0) {
        days.push(100)
      } else {
        const prev = days[d - 1]
        const drop = 5 + rng() * 15
        days.push(Math.max(0, Math.round((prev - drop) * 10) / 10))
      }
    }
    rows.push({ week, newUsers, days })
  })
  return rows
}

function generatePathData(seed = 222) {
  const rng = seededRandom(seed)
  const startEvents = ['Start Session', 'Page View', 'Login']
  const midEvents = ['Page View', 'Button Click', 'Search', 'Add to Cart', 'Scroll Depth']
  const endEvents = ['Purchase', 'Sign Up', 'End Session', 'Form Submit']

  const paths = []
  for (let i = 0; i < 8; i++) {
    const from = pickRandom(rng, i === 0 ? startEvents : midEvents)
    const to = pickRandom(rng, i < 5 ? midEvents : endEvents)
    const value = Math.floor(50 + rng() * 200)
    paths.push({ from, to, value, step: Math.floor(i / 2) })
  }

  // Generate nodes for Sankey-like visualization
  const nodeMap = {}
  paths.forEach(p => {
    if (!nodeMap[p.from]) nodeMap[p.from] = { name: p.from, total: 0 }
    if (!nodeMap[p.to]) nodeMap[p.to] = { name: p.to, total: 0 }
    nodeMap[p.from].total += p.value
    nodeMap[p.to].total += p.value
  })

  return { paths, nodes: Object.values(nodeMap) }
}

export function createInitialData() {
  const users = generateUsers(20)
  const events = generateEvents(users, 1200)

  // Aggregate event counts per day for chart data
  const eventCountsByDay = {}
  events.forEach(e => {
    const day = e.timestamp.split('T')[0]
    if (!eventCountsByDay[day]) eventCountsByDay[day] = {}
    if (!eventCountsByDay[day][e.name]) eventCountsByDay[day][e.name] = 0
    eventCountsByDay[day][e.name]++
  })

  const dailyPageViews = generateDailyData(30, 40, 25, 'up', 42)
  const dailyActiveUsers = generateDailyData(30, 30, 15, 'up', 43)
  const dailySessions = generateDailyData(30, 35, 20, 'up', 44)

  const eventDefinitions = [
    { id: 'evtdef_001', name: 'Page View', displayName: 'Page View', description: 'Triggered when a user views a page.', category: 'Tracking', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Page View').length, icon: 'globe', color: '#7C3AED', properties: [{ name: 'Page Title', type: 'string' }, { name: 'Page Path', type: 'string' }, { name: 'Page URL', type: 'string' }, { name: 'Referrer', type: 'string' }] },
    { id: 'evtdef_002', name: 'Button Click', displayName: 'Button Click', description: 'Triggered when a user clicks a button.', category: 'Interaction', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Button Click').length, icon: 'mouse-pointer', color: '#8B5CF6', properties: [{ name: 'Button Text', type: 'string' }, { name: 'Page Path', type: 'string' }, { name: 'Element ID', type: 'string' }] },
    { id: 'evtdef_003', name: 'Sign Up', displayName: 'Sign Up', description: 'Triggered when a new user signs up.', category: 'Conversion', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Sign Up').length, icon: 'user-plus', color: '#059669', properties: [{ name: 'Method', type: 'string' }, { name: 'Plan', type: 'string' }, { name: 'Source', type: 'string' }] },
    { id: 'evtdef_004', name: 'Login', displayName: 'Login', description: 'Triggered when a user logs in.', category: 'Auth', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Login').length, icon: 'log-in', color: '#2563EB', properties: [{ name: 'Method', type: 'string' }, { name: 'Success', type: 'boolean' }] },
    { id: 'evtdef_005', name: 'Purchase', displayName: 'Purchase', description: 'Triggered when a user completes a purchase.', category: 'Conversion', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Purchase').length, icon: 'credit-card', color: '#D97706', properties: [{ name: 'Amount', type: 'number' }, { name: 'Currency', type: 'string' }, { name: 'Product', type: 'string' }, { name: 'Payment Method', type: 'string' }] },
    { id: 'evtdef_006', name: 'Add to Cart', displayName: 'Add to Cart', description: 'Triggered when a user adds item to cart.', category: 'Conversion', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Add to Cart').length, icon: 'shopping-cart', color: '#EC4899', properties: [{ name: 'Product', type: 'string' }, { name: 'Price', type: 'number' }, { name: 'Quantity', type: 'number' }] },
    { id: 'evtdef_007', name: 'Search', displayName: 'Search', description: 'Triggered when a user performs a search.', category: 'Interaction', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Search').length, icon: 'search', color: '#0891B2', properties: [{ name: 'Query', type: 'string' }, { name: 'Results Count', type: 'number' }] },
    { id: 'evtdef_008', name: 'Form Submit', displayName: 'Form Submit', description: 'Triggered when a user submits a form.', category: 'Interaction', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Form Submit').length, icon: 'file-text', color: '#7C3AED', properties: [{ name: 'Form Name', type: 'string' }, { name: 'Success', type: 'boolean' }] },
    { id: 'evtdef_009', name: 'Start Session', displayName: 'Start Session', description: 'Triggered when a user starts a new session.', category: 'Session', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Start Session').length, icon: 'play', color: '#059669', properties: [{ name: 'Session ID', type: 'string' }] },
    { id: 'evtdef_010', name: 'End Session', displayName: 'End Session', description: 'Triggered when a session ends.', category: 'Session', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'End Session').length, icon: 'log-out', color: '#6B7280', properties: [{ name: 'Session Length', type: 'number' }, { name: 'Session ID', type: 'string' }] },
    { id: 'evtdef_011', name: 'Video Play', displayName: 'Video Play', description: 'Triggered when a user plays a video.', category: 'Engagement', status: 'live', createdAt: '2024-11-01', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Video Play').length, icon: 'play-circle', color: '#DC2626', properties: [{ name: 'Video Title', type: 'string' }, { name: 'Duration', type: 'number' }, { name: 'Completion', type: 'number' }] },
    { id: 'evtdef_012', name: 'Share', displayName: 'Share', description: 'Triggered when a user shares content.', category: 'Social', status: 'live', createdAt: '2024-11-01', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Share').length, icon: 'share-2', color: '#0EA5E9', properties: [{ name: 'Platform', type: 'string' }, { name: 'Content Type', type: 'string' }] },
    { id: 'evtdef_013', name: 'Download', displayName: 'Download', description: 'Triggered when a user downloads a file.', category: 'Engagement', status: 'live', createdAt: '2024-11-05', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Download').length, icon: 'download', color: '#6366F1', properties: [{ name: 'File Type', type: 'string' }, { name: 'File Name', type: 'string' }] },
    { id: 'evtdef_014', name: 'Scroll Depth', displayName: 'Scroll Depth', description: 'Triggered when a user reaches scroll milestones.', category: 'Engagement', status: 'live', createdAt: '2024-11-10', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Scroll Depth').length, icon: 'arrow-down', color: '#8B5CF6', properties: [{ name: 'Depth', type: 'number' }, { name: 'Page Path', type: 'string' }] },
    { id: 'evtdef_015', name: 'Error', displayName: 'Error', description: 'Triggered when an error occurs.', category: 'Technical', status: 'live', createdAt: '2024-10-15', createdBy: 'samlee@example.com', occurrencesLast30d: events.filter(e => e.name === 'Error').length, icon: 'alert-triangle', color: '#DC2626', properties: [{ name: 'Error Code', type: 'string' }, { name: 'Message', type: 'string' }] },
  ]

  const charts = [
    {
      id: 'chart_001', name: 'Daily Active Users', description: 'Unique users who triggered any event each day', type: 'segmentation', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-10T09:00:00', updatedAt: '2024-12-16T14:30:00', dashboardIds: ['dash_001', 'dash_002'], notebookIds: ['notebook_001'],
      config: { events: [{ letter: 'A', eventName: 'Start Session', filters: [], groupBy: null }], measuredAs: 'uniques', segments: [{ id: 'seg_1', name: 'All Users', filters: [], cohortId: null }], chartVisualization: 'line', timeRange: '30d', interval: 'daily', groupSegmentBy: null, formula: null },
      data: { series: [{ name: 'All Users', color: '#7C3AED', dataPoints: dailyActiveUsers }], breakdownTable: [{ segment: 'All Users', values: Object.fromEntries(dailyActiveUsers.slice(-5).map(d => [d.date, d.value])), rowAverage: Math.round(dailyActiveUsers.reduce((s,d) => s + d.value, 0) / dailyActiveUsers.length * 10) / 10 }] }
    },
    {
      id: 'chart_002', name: 'Page Views Over Time', description: 'Total page view events over the last 30 days', type: 'segmentation', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-08T10:00:00', updatedAt: '2024-12-15T11:00:00', dashboardIds: ['dash_002'], notebookIds: [],
      config: { events: [{ letter: 'A', eventName: 'Page View', filters: [], groupBy: null }], measuredAs: 'eventTotals', segments: [{ id: 'seg_1', name: 'All Users', filters: [], cohortId: null }], chartVisualization: 'line', timeRange: '30d', interval: 'daily', groupSegmentBy: null, formula: null },
      data: { series: [{ name: 'All Users', color: '#7C3AED', dataPoints: dailyPageViews }], breakdownTable: [{ segment: 'All Users', values: Object.fromEntries(dailyPageViews.slice(-5).map(d => [d.date, d.value])), rowAverage: Math.round(dailyPageViews.reduce((s,d) => s + d.value, 0) / dailyPageViews.length * 10) / 10 }] }
    },
    {
      id: 'chart_003', name: 'Signup Conversion Funnel', description: 'User journey from session start to signup', type: 'funnel', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-05T09:00:00', updatedAt: '2024-12-16T10:00:00', dashboardIds: ['dash_001'], notebookIds: ['notebook_001'],
      config: { steps: [{ eventName: 'Start Session', filters: [] }, { eventName: 'Page View', filters: [] }, { eventName: 'Button Click', filters: [{ property: 'Button Text', operator: 'equals', value: 'Sign Up' }] }, { eventName: 'Sign Up', filters: [] }], conversionWindow: '30d', countingMethod: 'uniques', segments: [{ id: 'seg_1', name: 'All Users', filters: [] }] },
      data: { steps: [{ name: 'Start Session', count: 842, percentage: 100 }, { name: 'Page View', count: 731, percentage: 86.8 }, { name: 'Button Click', count: 289, percentage: 34.3 }, { name: 'Sign Up', count: 47, percentage: 5.6 }], overallConversion: 5.6, medianTime: '4m 12s', stepConversions: [{ from: 'Start Session', to: 'Page View', rate: 86.8, medianTime: '12s' }, { from: 'Page View', to: 'Button Click', rate: 39.5, medianTime: '1m 45s' }, { from: 'Button Click', to: 'Sign Up', rate: 16.3, medianTime: '2m 15s' }] }
    },
    {
      id: 'chart_004', name: 'User Retention (Day 0-14)', description: 'How many users return after their first session', type: 'retention', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-01T09:00:00', updatedAt: '2024-12-14T15:00:00', dashboardIds: [], notebookIds: [],
      config: { startEvent: 'Start Session', returnEvent: 'Any Active Event', retentionType: 'n-day', interval: 'daily', segments: [{ id: 'seg_1', name: 'All Users', filters: [] }] },
      data: { curve: [{ day: 0, percentage: 100, count: 420 }, { day: 1, percentage: 45, count: 189 }, { day: 2, percentage: 32, count: 134 }, { day: 3, percentage: 24, count: 101 }, { day: 4, percentage: 19, count: 80 }, { day: 5, percentage: 15, count: 63 }, { day: 6, percentage: 13, count: 55 }, { day: 7, percentage: 11, count: 46 }, { day: 14, percentage: 6, count: 25 }], heatmap: generateRetentionHeatmap() }
    },
    {
      id: 'chart_005', name: 'Purchase Funnel', description: 'User journey from browsing to purchase', type: 'funnel', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-12T09:00:00', updatedAt: '2024-12-16T09:00:00', dashboardIds: ['dash_002'], notebookIds: [],
      config: { steps: [{ eventName: 'Page View', filters: [] }, { eventName: 'Add to Cart', filters: [] }, { eventName: 'Purchase', filters: [] }], conversionWindow: '7d', countingMethod: 'uniques', segments: [{ id: 'seg_1', name: 'All Users', filters: [] }] },
      data: { steps: [{ name: 'Page View', count: 1200, percentage: 100 }, { name: 'Add to Cart', count: 180, percentage: 15.0 }, { name: 'Purchase', count: 54, percentage: 4.5 }], overallConversion: 4.5, medianTime: '12m 30s', stepConversions: [{ from: 'Page View', to: 'Add to Cart', rate: 15.0, medianTime: '8m 22s' }, { from: 'Add to Cart', to: 'Purchase', rate: 30.0, medianTime: '4m 08s' }] }
    },
    {
      id: 'chart_006', name: 'Events by Type', description: 'Distribution of event types', type: 'segmentation', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-13T09:00:00', updatedAt: '2024-12-16T10:00:00', dashboardIds: [], notebookIds: [],
      config: { events: [{ letter: 'A', eventName: 'Page View', filters: [], groupBy: null }], measuredAs: 'frequency', segments: [{ id: 'seg_1', name: 'All Users', filters: [], cohortId: null }], chartVisualization: 'pie', timeRange: '30d', interval: 'daily', groupSegmentBy: null, formula: null },
      data: { series: [{ name: 'Page View', color: '#7C3AED', value: 300, percentage: 25.0 }, { name: 'Button Click', color: '#8B5CF6', value: 216, percentage: 18.0 }, { name: 'Start Session', color: '#059669', value: 144, percentage: 12.0 }, { name: 'Search', color: '#0891B2', value: 120, percentage: 10.0 }, { name: 'Other', color: '#D1D5DB', value: 420, percentage: 35.0 }], breakdownTable: [{ segment: 'Page View', values: { 'Last 30d': 300 }, rowAverage: 300 }, { segment: 'Button Click', values: { 'Last 30d': 216 }, rowAverage: 216 }, { segment: 'Start Session', values: { 'Last 30d': 144 }, rowAverage: 144 }] }
    },
    {
      id: 'chart_007', name: 'Weekly Sessions', description: 'Sessions aggregated by week', type: 'segmentation', status: 'saved', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', createdAt: '2024-12-14T09:00:00', updatedAt: '2024-12-16T11:00:00', dashboardIds: ['dash_001'], notebookIds: [],
      config: { events: [{ letter: 'A', eventName: 'Start Session', filters: [], groupBy: null }], measuredAs: 'eventTotals', segments: [{ id: 'seg_1', name: 'All Users', filters: [], cohortId: null }], chartVisualization: 'bar', timeRange: '30d', interval: 'weekly', groupSegmentBy: null, formula: null },
      data: { series: [{ name: 'All Users', color: '#7C3AED', dataPoints: [{ date: '2024-11-18', value: 145 }, { date: '2024-11-25', value: 178 }, { date: '2024-12-02', value: 203 }, { date: '2024-12-09', value: 256 }] }], breakdownTable: [{ segment: 'All Users', values: { 'Nov 18': 145, 'Nov 25': 178, 'Dec 2': 203, 'Dec 9': 256 }, rowAverage: 195.5 }] }
    }
  ]

  return {
    currentUser: {
      id: 'ampuser_001',
      name: 'Sam Lee',
      email: 'samlee@example.com',
      avatar: null,
      organization: 'AcmeTech',
      role: 'Admin',
      plan: 'Growth',
      mtuUsed: 12400,
      mtuLimit: 50000
    },

    users,
    events,
    eventDefinitions,
    charts,

    dashboards: [
      {
        id: 'dash_001', name: 'Product KPIs', description: 'Key product metrics tracked weekly.', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', isOfficial: true, createdAt: '2024-11-01T10:00:00', updatedAt: '2024-12-16T15:00:00',
        chartIds: ['chart_001', 'chart_003', 'chart_007'],
        layout: [{ chartId: 'chart_001', x: 0, y: 0, w: 6, h: 4 }, { chartId: 'chart_003', x: 6, y: 0, w: 6, h: 4 }, { chartId: 'chart_007', x: 0, y: 4, w: 12, h: 4 }],
        space: "Sam Lee's Space"
      },
      {
        id: 'dash_002', name: 'Web Engagement', description: 'Web traffic and engagement metrics.', owner: 'Sam Lee', ownerEmail: 'samlee@example.com', isOfficial: false, createdAt: '2024-11-15T10:00:00', updatedAt: '2024-12-16T12:00:00',
        chartIds: ['chart_001', 'chart_002', 'chart_005'],
        layout: [{ chartId: 'chart_001', x: 0, y: 0, w: 6, h: 4 }, { chartId: 'chart_002', x: 6, y: 0, w: 6, h: 4 }, { chartId: 'chart_005', x: 0, y: 4, w: 12, h: 4 }],
        space: "Sam Lee's Space"
      }
    ],

    cohorts: [
      { id: 'cohort_001', name: 'All Users', description: 'All tracked users.', owner: 'Sam Lee', createdAt: '2024-10-15T09:00:00', updatedAt: '2024-12-16T08:00:00', userCount: 20, lastComputed: '2024-12-16T08:00:00', definition: { conditions: [], combinator: 'and' } },
      { id: 'cohort_002', name: 'Power Users', description: 'Users who performed Page View 10+ times in the last 7 days.', owner: 'Sam Lee', createdAt: '2024-12-01T09:00:00', updatedAt: '2024-12-16T08:00:00', userCount: 8, lastComputed: '2024-12-16T08:00:00', definition: { conditions: [{ type: 'didPerform', eventName: 'Page View', operator: '>=', count: 10, timeRange: 'last_7_days' }], combinator: 'and' } },
      { id: 'cohort_003', name: 'Purchasers', description: 'Users who completed at least 1 purchase.', owner: 'Sam Lee', createdAt: '2024-12-05T09:00:00', updatedAt: '2024-12-16T08:00:00', userCount: 14, lastComputed: '2024-12-16T08:00:00', definition: { conditions: [{ type: 'didPerform', eventName: 'Purchase', operator: '>=', count: 1, timeRange: 'last_30_days' }], combinator: 'and' } },
      { id: 'cohort_004', name: 'New Users (7d)', description: 'Users who signed up in the last 7 days.', owner: 'Sam Lee', createdAt: '2024-12-09T09:00:00', updatedAt: '2024-12-16T08:00:00', userCount: 5, lastComputed: '2024-12-16T08:00:00', definition: { conditions: [{ type: 'didPerform', eventName: 'Sign Up', operator: '>=', count: 1, timeRange: 'last_7_days' }], combinator: 'and' } },
      { id: 'cohort_005', name: 'US Desktop Users', description: 'Users in the United States on Desktop.', owner: 'Sam Lee', createdAt: '2024-12-05T09:00:00', updatedAt: '2024-12-16T08:00:00', userCount: 6, lastComputed: '2024-12-16T08:00:00', definition: { conditions: [{ type: 'property', property: 'country', operator: 'equals', value: 'United States' }, { type: 'property', property: 'deviceType', operator: 'equals', value: 'Desktop' }], combinator: 'and' } },
    ],

    notebooks: [
      { id: 'notebook_001', name: 'Q4 Product Analysis', owner: 'Sam Lee', space: "Sam Lee's Space", createdAt: '2024-12-15T10:00:00', updatedAt: '2024-12-16T12:00:00', viewCount: 14, blocks: [{ id: 'block_1', type: 'chart', chartId: 'chart_003' }, { id: 'block_2', type: 'chart', chartId: 'chart_001' }] }
    ],

    experiments: [
      { id: 'exp_001', name: 'Homepage CTA Test', type: 'ab_test', subtype: 'web', status: 'running', owner: 'Sam Lee', createdAt: '2024-12-14T11:00:00', variants: [{ id: 'var_a', name: 'control', isControl: true, rolloutPercent: 50 }, { id: 'var_b', name: 'treatment', isControl: false, rolloutPercent: 50 }], goals: [{ metricName: 'Sign Up', type: 'success', direction: 'increase' }], pages: [{ url: '/' }], targeting: { segments: ['All Users'] }, rolloutPercent: 100, results: { winner: null, lift: 12.3, pValue: 0.08 } },
      { id: 'exp_002', name: 'Pricing Page Redesign', type: 'ab_test', subtype: 'web', status: 'completed', owner: 'Sam Lee', createdAt: '2024-11-20T11:00:00', variants: [{ id: 'var_a', name: 'control', isControl: true, rolloutPercent: 50 }, { id: 'var_b', name: 'new_pricing', isControl: false, rolloutPercent: 50 }], goals: [{ metricName: 'Purchase', type: 'success', direction: 'increase' }], pages: [{ url: '/pricing' }], targeting: { segments: ['All Users'] }, rolloutPercent: 100, results: { winner: 'var_b', lift: 23.5, pValue: 0.03 } }
    ],

    spaces: [
      { id: 'space_001', name: "Sam Lee's Space", owner: 'Sam Lee', isPersonal: true, contentIds: ['chart_001', 'chart_002', 'chart_003', 'chart_004', 'chart_005', 'chart_006', 'chart_007', 'dash_001', 'dash_002', 'notebook_001'] },
      { id: 'space_002', name: 'Product Team', owner: 'Sam Lee', isPersonal: false, contentIds: ['dash_001', 'chart_001', 'chart_003'] }
    ],

    userPaths: generatePathData(),

    homeMetrics: {
      visitors: { value: 842, delta: 12.5, deltaType: 'increase' },
      pageViews: { value: 3247, delta: 8.3, deltaType: 'increase' },
      bounceRate: { value: 38.5, delta: -2.1, deltaType: 'decrease' },
      pageViewsPerSession: { value: 4.8, delta: 5.0, deltaType: 'increase' },
      currentLiveUsers: 7,
      newUsersToday: 4,
      avgSessionDuration: '6m 42s',
      topPages: [
        { title: 'Home', volume: 512 },
        { title: 'Dashboard', volume: 384 },
        { title: 'Products', volume: 298 },
        { title: 'Pricing', volume: 215 },
        { title: 'Settings', volume: 142 },
        { title: 'Profile', volume: 98 },
      ],
      usersByCountry: [
        { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', users: 312 },
        { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', users: 89 },
        { country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', users: 67 },
        { country: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', users: 54 },
        { country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', users: 43 },
        { country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', users: 38 },
      ],
      webEngagementSeries: dailyActiveUsers,
      revenueData: generateDailyData(30, 1200, 600, 'up', 55),
    },

    templates: [
      { id: 'tpl_1', name: 'User Activity', type: 'Dashboard', chartCount: 9 },
      { id: 'tpl_2', name: 'Marketing Analytics', type: 'Dashboard', chartCount: 14 },
      { id: 'tpl_3', name: 'Session Engagement', type: 'Dashboard', chartCount: 6 },
      { id: 'tpl_4', name: 'Product KPIs', type: 'Dashboard', chartCount: 8 },
      { id: 'tpl_5', name: 'E-Commerce', type: 'Dashboard', chartCount: 11 },
    ],

    askThreads: [],

    ui: {
      sidebarExpanded: true,
      activeSidebarItem: 'home',
      expandedSections: ['analytics', 'data', 'audiences'],
      currentProject: 'default'
    }
  }
}

export function loadState(sid = null) {
  const key = storageKey(sid)
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return null
}

export function saveState(state, sid = null) {
  const key = storageKey(sid)
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (e) {}
  const sessionId = sid || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('sid') || null) : null)
  if (sessionId) {
    if (saveState._timer) clearTimeout(saveState._timer)
    saveState._timer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sessionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {})
    }, 300)
  }
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue
    if (Array.isArray(source[key])) {
      result[key] = source[key]
    } else if (typeof source[key] === 'object' && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export function initializeData(sid = null, customState = null) {
  const defaults = createInitialData()
  let state

  if (customState) {
    state = deepMerge(defaults, customState)
  } else {
    const saved = loadState(sid)
    state = saved || defaults
  }

  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(state))

  const iKey = initialKey(sid)
  if (!localStorage.getItem(iKey)) {
    localStorage.setItem(iKey, JSON.stringify(state))
  }

  // Sync initial state to server
  const sessionId = sid || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('sid') || null) : null)
  if (sessionId) {
    fetch(`/post?sid=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state })
    }).catch(() => {})
  }

  return state
}
