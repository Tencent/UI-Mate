const BASE_KEY = 'mixpanel_mock_state'
const BASE_INITIAL_KEY = 'mixpanel_mock_initial_state'

export function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('mixpanel_sid', sid)
    return sid
  }
  return sessionStorage.getItem('mixpanel_sid') || null
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
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data.has_custom_state && data.stored_state) return data.stored_state
  } catch (e) {}
  return null
}

// Seeded random for reproducible data
function seededRandom(seed) {
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
    return (s >>> 0) / 0xFFFFFFFF
  }
}

export function createInitialData() {
  const now = new Date('2026-01-22T10:00:00Z')
  const rand = seededRandom(42)

  function daysAgo(n) {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }
  function minsAgo(n) {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - n)
    return d.toISOString()
  }
  function hoursAgo(n) {
    const d = new Date(now)
    d.setHours(d.getHours() - n)
    return d.toISOString()
  }

  // 15+ event types
  const EVENT_TYPES = [
    'Page View', 'Button Click', 'Sign Up', 'Login', 'Logout',
    'Search', 'Add to Cart', 'Purchase', 'Remove from Cart',
    'Form Submit', 'Page Scroll', 'Video Play', 'File Download',
    'Share', 'Comment', 'Like', 'Profile Update', 'Invite Sent',
    'Notification Click', 'Session Start', 'Session End'
  ]

  // 25 users
  const userProfiles = [
    { id: 'u_001', name: 'Sam Lee', email: 'samlee@example.com', distinctId: 'user_sam_lee', avatar: null, countryCode: 'US', region: 'California', city: 'San Francisco', lastSeen: daysAgo(0), createdAt: daysAgo(90), properties: { Plan: 'Growth', 'Sign Up Date': '2025-10-24', 'Total Sessions': 147, 'Device Type': 'Desktop', 'LTV': 2400 } },
    { id: 'u_002', name: 'Jane Doe', email: 'jdoe@example.com', distinctId: 'user_jane_doe', avatar: null, countryCode: 'US', region: 'New York', city: 'New York', lastSeen: daysAgo(1), createdAt: daysAgo(60), properties: { Plan: 'Free', 'Sign Up Date': '2025-11-23', 'Total Sessions': 42, 'Device Type': 'Mobile', 'LTV': 0 } },
    { id: 'u_003', name: 'Alex Johnson', email: 'alexj@example.com', distinctId: 'user_alex_j', avatar: null, countryCode: 'SG', region: 'Singapore', city: 'Singapore', lastSeen: daysAgo(0), createdAt: daysAgo(45), properties: { Plan: 'Growth', 'Sign Up Date': '2025-12-08', 'Total Sessions': 88, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_004', name: 'Maria Garcia', email: 'mgarcia@example.com', distinctId: 'user_maria_g', avatar: null, countryCode: 'GB', region: 'England', city: 'London', lastSeen: daysAgo(2), createdAt: daysAgo(120), properties: { Plan: 'Enterprise', 'Sign Up Date': '2025-09-24', 'Total Sessions': 312, 'Device Type': 'Desktop', 'LTV': 9600 } },
    { id: 'u_005', name: 'David Kim', email: 'dkim@example.com', distinctId: 'user_david_k', avatar: null, countryCode: 'US', region: 'Washington', city: 'Seattle', lastSeen: daysAgo(0), createdAt: daysAgo(30), properties: { Plan: 'Free', 'Sign Up Date': '2025-12-23', 'Total Sessions': 18, 'Device Type': 'iOS', 'LTV': 0 } },
    { id: 'u_006', name: 'Emily Chen', email: 'echen@example.com', distinctId: 'user_emily_c', avatar: null, countryCode: 'SG', region: 'Singapore', city: 'Singapore', lastSeen: daysAgo(1), createdAt: daysAgo(55), properties: { Plan: 'Growth', 'Sign Up Date': '2025-11-28', 'Total Sessions': 67, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_007', name: 'Chris Wilson', email: 'cwilson@example.com', distinctId: 'user_chris_w', avatar: null, countryCode: 'ID', region: 'Jakarta', city: 'Jakarta', lastSeen: daysAgo(3), createdAt: daysAgo(70), properties: { Plan: 'Free', 'Sign Up Date': '2025-11-13', 'Total Sessions': 24, 'Device Type': 'Android', 'LTV': 0 } },
    { id: 'u_008', name: 'Priya Patel', email: 'ppatel@example.com', distinctId: 'user_priya_p', avatar: null, countryCode: 'GB', region: 'England', city: 'London', lastSeen: daysAgo(1), createdAt: daysAgo(85), properties: { Plan: 'Growth', 'Sign Up Date': '2025-10-29', 'Total Sessions': 94, 'Device Type': 'Desktop', 'LTV': 2400 } },
    { id: 'u_009', name: 'Tom Baker', email: 'tbaker@example.com', distinctId: 'user_tom_b', avatar: null, countryCode: 'US', region: 'Texas', city: 'Austin', lastSeen: daysAgo(0), createdAt: daysAgo(25), properties: { Plan: 'Free', 'Sign Up Date': '2025-12-28', 'Total Sessions': 31, 'Device Type': 'Desktop', 'LTV': 0 } },
    { id: 'u_010', name: 'Lisa Wang', email: 'lwang@example.com', distinctId: 'user_lisa_w', avatar: null, countryCode: 'US', region: 'California', city: 'Los Angeles', lastSeen: daysAgo(2), createdAt: daysAgo(40), properties: { Plan: 'Growth', 'Sign Up Date': '2025-12-13', 'Total Sessions': 56, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_011', name: 'Mike Brown', email: 'mbrown@example.com', distinctId: 'user_mike_b', avatar: null, countryCode: 'CA', region: 'Ontario', city: 'Toronto', lastSeen: daysAgo(0), createdAt: daysAgo(15), properties: { Plan: 'Free', 'Sign Up Date': '2026-01-07', 'Total Sessions': 9, 'Device Type': 'Mobile', 'LTV': 0 } },
    { id: 'u_012', name: 'Sarah Miller', email: 'smiller@example.com', distinctId: 'user_sarah_m', avatar: null, countryCode: 'AU', region: 'New South Wales', city: 'Sydney', lastSeen: daysAgo(1), createdAt: daysAgo(50), properties: { Plan: 'Growth', 'Sign Up Date': '2025-12-03', 'Total Sessions': 73, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_013', name: 'James Taylor', email: 'jtaylor@example.com', distinctId: 'user_james_t', avatar: null, countryCode: 'US', region: 'Illinois', city: 'Chicago', lastSeen: daysAgo(4), createdAt: daysAgo(100), properties: { Plan: 'Enterprise', 'Sign Up Date': '2025-10-14', 'Total Sessions': 201, 'Device Type': 'Desktop', 'LTV': 4800 } },
    { id: 'u_014', name: 'Anna Müller', email: 'amuller@example.com', distinctId: 'user_anna_m', avatar: null, countryCode: 'DE', region: 'Berlin', city: 'Berlin', lastSeen: daysAgo(0), createdAt: daysAgo(35), properties: { Plan: 'Free', 'Sign Up Date': '2025-12-18', 'Total Sessions': 22, 'Device Type': 'Desktop', 'LTV': 0 } },
    { id: 'u_015', name: 'Raj Sharma', email: 'rsharma@example.com', distinctId: 'user_raj_s', avatar: null, countryCode: 'IN', region: 'Maharashtra', city: 'Mumbai', lastSeen: daysAgo(1), createdAt: daysAgo(65), properties: { Plan: 'Growth', 'Sign Up Date': '2025-11-18', 'Total Sessions': 45, 'Device Type': 'Android', 'LTV': 600 } },
    { id: 'u_016', name: 'Sophie Dubois', email: 'sdubois@example.com', distinctId: 'user_sophie_d', avatar: null, countryCode: 'FR', region: 'Île-de-France', city: 'Paris', lastSeen: daysAgo(3), createdAt: daysAgo(80), properties: { Plan: 'Growth', 'Sign Up Date': '2025-11-03', 'Total Sessions': 61, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_017', name: 'Yuki Tanaka', email: 'ytanaka@example.com', distinctId: 'user_yuki_t', avatar: null, countryCode: 'JP', region: 'Tokyo', city: 'Tokyo', lastSeen: daysAgo(0), createdAt: daysAgo(20), properties: { Plan: 'Free', 'Sign Up Date': '2026-01-02', 'Total Sessions': 15, 'Device Type': 'iOS', 'LTV': 0 } },
    { id: 'u_018', name: 'Carlos Ruiz', email: 'cruiz@example.com', distinctId: 'user_carlos_r', avatar: null, countryCode: 'MX', region: 'CDMX', city: 'Mexico City', lastSeen: daysAgo(2), createdAt: daysAgo(45), properties: { Plan: 'Free', 'Sign Up Date': '2025-12-08', 'Total Sessions': 33, 'Device Type': 'Android', 'LTV': 0 } },
    { id: 'u_019', name: 'Nina Petrova', email: 'npetrova@example.com', distinctId: 'user_nina_p', avatar: null, countryCode: 'US', region: 'Massachusetts', city: 'Boston', lastSeen: daysAgo(0), createdAt: daysAgo(10), properties: { Plan: 'Free', 'Sign Up Date': '2026-01-12', 'Total Sessions': 7, 'Device Type': 'Desktop', 'LTV': 0 } },
    { id: 'u_020', name: 'Oliver Smith', email: 'osmith@example.com', distinctId: 'user_oliver_s', avatar: null, countryCode: 'GB', region: 'England', city: 'Manchester', lastSeen: daysAgo(1), createdAt: daysAgo(55), properties: { Plan: 'Growth', 'Sign Up Date': '2025-11-28', 'Total Sessions': 82, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_021', name: 'Aisha Mohammed', email: 'amohammed@example.com', distinctId: 'user_aisha_m', avatar: null, countryCode: 'AE', region: 'Dubai', city: 'Dubai', lastSeen: daysAgo(0), createdAt: daysAgo(28), properties: { Plan: 'Enterprise', 'Sign Up Date': '2025-12-25', 'Total Sessions': 54, 'Device Type': 'Desktop', 'LTV': 4800 } },
    { id: 'u_022', name: 'Wei Zhang', email: 'wzhang@example.com', distinctId: 'user_wei_z', avatar: null, countryCode: 'CN', region: 'Beijing', city: 'Beijing', lastSeen: daysAgo(2), createdAt: daysAgo(75), properties: { Plan: 'Growth', 'Sign Up Date': '2025-11-08', 'Total Sessions': 99, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_023', name: 'Emma Davis', email: 'edavis@example.com', distinctId: 'user_emma_d', avatar: null, countryCode: 'US', region: 'Colorado', city: 'Denver', lastSeen: daysAgo(5), createdAt: daysAgo(90), properties: { Plan: 'Free', 'Sign Up Date': '2025-10-24', 'Total Sessions': 11, 'Device Type': 'Desktop', 'LTV': 0 } },
    { id: 'u_024', name: 'Liam O\'Brien', email: 'lobrien@example.com', distinctId: 'user_liam_o', avatar: null, countryCode: 'IE', region: 'Leinster', city: 'Dublin', lastSeen: daysAgo(1), createdAt: daysAgo(38), properties: { Plan: 'Growth', 'Sign Up Date': '2025-12-15', 'Total Sessions': 48, 'Device Type': 'Desktop', 'LTV': 1200 } },
    { id: 'u_025', name: 'Kim Soo-yeon', email: 'ksyeon@example.com', distinctId: 'user_kim_sy', avatar: null, countryCode: 'KR', region: 'Seoul', city: 'Seoul', lastSeen: daysAgo(0), createdAt: daysAgo(22), properties: { Plan: 'Free', 'Sign Up Date': '2025-12-31', 'Total Sessions': 19, 'Device Type': 'iOS', 'LTV': 0 } },
  ]

  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Chrome Mobile', 'Safari Mobile']
  const oses = ['Mac OS X', 'Windows 11', 'iOS 17', 'Android 14', 'Mac OS X', 'Linux']
  const referrers = ['$direct', 'google.com', 'twitter.com', 'linkedin.com', 'facebook.com', 'producthunt.com', '$direct']
  const pages = ['/', '/pricing', '/features', '/dashboard', '/settings', '/blog', '/about', '/signup', '/login', '/docs', '/contact', '/integrations', '/changelog']
  const utmSources = [null, 'google', 'twitter', 'linkedin', 'email', 'producthunt', null]
  const utmCampaigns = [null, 'brand_search', 'launch_2026', 'newsletter_jan', 'retarget_q1', null]

  // Generate 1200+ events over 30 days
  const events = []
  let evtCounter = 0
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    // More events on recent days
    const eventsPerDay = dayOffset < 7 ? Math.floor(30 + rand() * 40) : Math.floor(15 + rand() * 25)
    for (let j = 0; j < eventsPerDay; j++) {
      evtCounter++
      const userIdx = Math.floor(rand() * userProfiles.length)
      const user = userProfiles[userIdx]
      const eventType = EVENT_TYPES[Math.floor(rand() * EVENT_TYPES.length)]
      const browserIdx = Math.floor(rand() * browsers.length)
      const minuteOffset = Math.floor(rand() * 1440)
      const page = pages[Math.floor(rand() * pages.length)]
      const utmSource = utmSources[Math.floor(rand() * utmSources.length)]
      const utmCampaign = utmCampaigns[Math.floor(rand() * utmCampaigns.length)]

      const eventTime = new Date(now)
      eventTime.setDate(eventTime.getDate() - dayOffset)
      eventTime.setHours(Math.floor(minuteOffset / 60), minuteOffset % 60, Math.floor(rand() * 60))

      events.push({
        id: `evt_${String(evtCounter).padStart(4, '0')}`,
        eventName: eventType,
        distinctId: user.distinctId,
        time: eventTime.toISOString(),
        city: user.city,
        country: user.countryCode === 'US' ? 'United States' : user.countryCode === 'GB' ? 'United Kingdom' : user.countryCode === 'SG' ? 'Singapore' : user.countryCode === 'DE' ? 'Germany' : user.countryCode === 'FR' ? 'France' : user.countryCode === 'JP' ? 'Japan' : user.countryCode === 'IN' ? 'India' : user.countryCode === 'AU' ? 'Australia' : user.countryCode === 'CA' ? 'Canada' : user.countryCode === 'MX' ? 'Mexico' : user.countryCode === 'AE' ? 'UAE' : user.countryCode === 'CN' ? 'China' : user.countryCode === 'IE' ? 'Ireland' : user.countryCode === 'KR' ? 'South Korea' : user.countryCode === 'ID' ? 'Indonesia' : user.city,
        region: user.region,
        operatingSystem: oses[browserIdx % oses.length],
        browser: browsers[browserIdx],
        browserVersion: String(100 + Math.floor(rand() * 50)),
        currentUrl: `https://app.example.com${page}`,
        deviceId: user.distinctId.replace('user_', 'dev_'),
        properties: {
          '$current_url': `https://app.example.com${page}`,
          '$referrer': referrers[Math.floor(rand() * referrers.length)],
          '$screen_height': [768, 900, 1080, 1440][Math.floor(rand() * 4)],
          '$screen_width': [1024, 1280, 1440, 1920][Math.floor(rand() * 4)],
          'page_path': page,
          ...(utmSource ? { 'utm_source': utmSource } : {}),
          ...(utmCampaign ? { 'utm_campaign': utmCampaign } : {}),
          ...(eventType === 'Purchase' ? { 'revenue': Math.floor(10 + rand() * 490), 'item_count': Math.floor(1 + rand() * 5) } : {}),
          ...(eventType === 'Search' ? { 'search_query': ['pricing', 'integrations', 'api docs', 'billing', 'team'][Math.floor(rand() * 5)] } : {}),
          ...(eventType === 'Add to Cart' || eventType === 'Remove from Cart' ? { 'item_name': ['Pro Plan', 'Enterprise Plan', 'Growth Plan', 'Add-on: SSO', 'Add-on: API'][Math.floor(rand() * 5)] } : {}),
        }
      })
    }
  }

  // Sort events by time descending (most recent first)
  events.sort((a, b) => new Date(b.time) - new Date(a.time))

  // Precomputed reports
  const reports = [
    {
      id: 'report_001',
      name: 'User Growth & Engagement',
      type: 'insights',
      boardId: 'board_001',
      createdBy: 'user_001',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'line',
      metrics: [
        { id: 'metric_a', label: 'A', name: 'Total Page View', events: [{ id: 'mevt_001', name: 'Page View', color: '#4F44E0' }], measurement: 'Total Events', aggregation: null },
        { id: 'metric_b', label: 'B', name: 'Unique Users', events: [{ id: 'mevt_002', name: 'All Events', color: '#E74C3C' }], measurement: 'Unique Users', aggregation: null }
      ],
      filters: [],
      breakdowns: [],
      chartData: null,
      tableData: null
    },
    {
      id: 'report_002',
      name: 'Daily Active Users',
      type: 'insights',
      boardId: 'board_001',
      createdBy: 'user_001',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'line',
      metrics: [
        { id: 'metric_a', label: 'A', name: 'Unique Users All Events', events: [{ id: 'mevt_001', name: 'All Events', color: '#4F44E0' }], measurement: 'Unique Users', aggregation: null }
      ],
      filters: [],
      breakdowns: [],
      chartData: null,
      tableData: null
    },
    {
      id: 'report_003',
      name: 'Signup Conversion Funnel',
      type: 'funnels',
      boardId: 'board_001',
      createdBy: 'user_001',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'funnel',
      steps: [
        { id: 'step_a', label: 'A', eventName: 'Page View' },
        { id: 'step_b', label: 'B', eventName: 'Sign Up' },
        { id: 'step_c', label: 'C', eventName: 'Login' }
      ],
      conversionCriteria: { timeWindow: '7 days', counting: 'Uniques' },
      filters: [],
      breakdowns: [],
      funnelData: null
    },
    {
      id: 'report_004',
      name: 'Weekly Retention',
      type: 'retention',
      boardId: 'board_003',
      createdBy: 'user_001',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Week',
      chartType: 'retention',
      retentionConfig: { firstEvent: 'Page View', returnEvent: 'Any Event' },
      retentionData: null
    },
    {
      id: 'report_005',
      name: 'User Journey Flow',
      type: 'flows',
      boardId: 'board_002',
      createdBy: 'user_001',
      createdAt: daysAgo(8),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'flows',
      flowConfig: { startEvent: 'Page View', depth: 4 },
      flowData: null
    },
    {
      id: 'report_006',
      name: 'Top Events by Volume',
      type: 'insights',
      boardId: 'board_003',
      createdBy: 'user_001',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'bar',
      metrics: [
        { id: 'metric_a', label: 'A', name: 'Total Events', events: [{ id: 'mevt_001', name: 'All Events', color: '#4F44E0' }], measurement: 'Total Events', aggregation: null }
      ],
      filters: [],
      breakdowns: [{ id: 'bd_001', property: 'Event Name', propertyType: 'string' }],
      chartData: null,
      tableData: null
    },
    {
      id: 'report_007',
      name: 'Purchase Funnel',
      type: 'funnels',
      boardId: 'board_002',
      createdBy: 'user_001',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(0),
      dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' },
      granularity: 'Day',
      chartType: 'funnel',
      steps: [
        { id: 'step_a', label: 'A', eventName: 'Page View' },
        { id: 'step_b', label: 'B', eventName: 'Add to Cart' },
        { id: 'step_c', label: 'C', eventName: 'Purchase' }
      ],
      conversionCriteria: { timeWindow: '7 days', counting: 'Uniques' },
      filters: [],
      breakdowns: [],
      funnelData: null
    }
  ]

  const boards = [
    {
      id: 'board_001',
      name: 'Main Dashboard',
      description: 'Central view of user activity, engagement, and usage trends',
      isPinned: true,
      isFavorite: true,
      isStarter: false,
      createdBy: 'user_001',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(0),
      items: [
        { id: 'bitem_001', type: 'report', reportId: 'report_001', position: { x: 0, y: 0, w: 6, h: 4 }, title: 'User Growth & Engagement' },
        { id: 'bitem_002', type: 'report', reportId: 'report_003', position: { x: 6, y: 0, w: 6, h: 4 }, title: 'Signup Conversion Funnel' },
        { id: 'bitem_003', type: 'report', reportId: 'report_002', position: { x: 0, y: 4, w: 6, h: 4 }, title: 'Daily Active Users' },
        { id: 'bitem_004', type: 'text', content: 'Key engagement metrics for the product team. Updated daily.', position: { x: 6, y: 4, w: 6, h: 2 } }
      ]
    },
    {
      id: 'board_002',
      name: 'Conversion Analysis',
      description: 'Track user conversion funnels and journey flows.',
      isPinned: true,
      isFavorite: false,
      isStarter: false,
      createdBy: 'user_001',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
      items: [
        { id: 'bitem_005', type: 'report', reportId: 'report_005', position: { x: 0, y: 0, w: 6, h: 4 }, title: 'User Journey Flow' },
        { id: 'bitem_006', type: 'report', reportId: 'report_007', position: { x: 6, y: 0, w: 6, h: 4 }, title: 'Purchase Funnel' }
      ]
    },
    {
      id: 'board_003',
      name: 'Retention & Events',
      description: 'Track retention metrics and event volumes.',
      isPinned: false,
      isFavorite: false,
      isStarter: false,
      createdBy: 'user_001',
      createdAt: daysAgo(15),
      updatedAt: daysAgo(1),
      items: [
        { id: 'bitem_007', type: 'report', reportId: 'report_006', position: { x: 0, y: 0, w: 6, h: 4 }, title: 'Top Events by Volume' },
        { id: 'bitem_008', type: 'report', reportId: 'report_004', position: { x: 6, y: 0, w: 6, h: 4 }, title: 'Weekly Retention' }
      ]
    },
    {
      id: 'board_004',
      name: 'Web Analytics Template',
      description: 'Template board for tracking web analytics KPIs.',
      isPinned: false,
      isFavorite: false,
      isStarter: true,
      createdBy: 'user_001',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(5),
      items: [
        { id: 'bitem_009', type: 'report', reportId: 'report_001', position: { x: 0, y: 0, w: 4, h: 4 }, title: 'Page Views Over Time' },
        { id: 'bitem_010', type: 'report', reportId: 'report_006', position: { x: 4, y: 0, w: 4, h: 4 }, title: 'Top Events' },
        { id: 'bitem_011', type: 'report', reportId: 'report_003', position: { x: 8, y: 0, w: 4, h: 4 }, title: 'Conversion Funnel' }
      ]
    }
  ]

  const lexicon = [
    { id: 'lex_001', category: 'events', eventName: 'Page View', displayName: 'Page View', description: 'User viewed a page', thirtyDayQueries: 42, status: 'Visible', tags: ['engagement'], type: 'custom' },
    { id: 'lex_002', category: 'events', eventName: 'Button Click', displayName: 'Button Click', description: 'User clicked a button element', thirtyDayQueries: 38, status: 'Visible', tags: ['engagement'], type: 'custom' },
    { id: 'lex_003', category: 'events', eventName: 'Sign Up', displayName: 'Sign Up', description: 'User completed registration', thirtyDayQueries: 25, status: 'Visible', tags: ['conversion'], type: 'custom' },
    { id: 'lex_004', category: 'events', eventName: 'Login', displayName: 'Login', description: 'User logged in', thirtyDayQueries: 30, status: 'Visible', tags: ['auth'], type: 'custom' },
    { id: 'lex_005', category: 'events', eventName: 'Logout', displayName: 'Logout', description: 'User logged out', thirtyDayQueries: 8, status: 'Visible', tags: ['auth'], type: 'custom' },
    { id: 'lex_006', category: 'events', eventName: 'Search', displayName: 'Search', description: 'User performed a search', thirtyDayQueries: 15, status: 'Visible', tags: ['engagement'], type: 'custom' },
    { id: 'lex_007', category: 'events', eventName: 'Add to Cart', displayName: 'Add to Cart', description: 'User added item to cart', thirtyDayQueries: 20, status: 'Visible', tags: ['commerce', 'conversion'], type: 'custom' },
    { id: 'lex_008', category: 'events', eventName: 'Purchase', displayName: 'Purchase', description: 'User completed a purchase', thirtyDayQueries: 18, status: 'Visible', tags: ['commerce', 'revenue'], type: 'custom' },
    { id: 'lex_009', category: 'events', eventName: 'Remove from Cart', displayName: 'Remove from Cart', description: 'User removed item from cart', thirtyDayQueries: 5, status: 'Visible', tags: ['commerce'], type: 'custom' },
    { id: 'lex_010', category: 'events', eventName: 'Form Submit', displayName: 'Form Submit', description: 'User submitted a form', thirtyDayQueries: 12, status: 'Visible', tags: ['engagement'], type: 'custom' },
    { id: 'lex_011', category: 'events', eventName: 'Page Scroll', displayName: 'Page Scroll', description: 'User scrolled the page', thirtyDayQueries: 3, status: 'Hidden', tags: [], type: 'auto' },
    { id: 'lex_012', category: 'events', eventName: 'Video Play', displayName: 'Video Play', description: 'User played a video', thirtyDayQueries: 7, status: 'Visible', tags: ['media'], type: 'custom' },
    { id: 'lex_013', category: 'events', eventName: 'File Download', displayName: 'File Download', description: 'User downloaded a file', thirtyDayQueries: 4, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_014', category: 'events', eventName: 'Share', displayName: 'Share', description: 'User shared content', thirtyDayQueries: 6, status: 'Visible', tags: ['social'], type: 'custom' },
    { id: 'lex_015', category: 'events', eventName: 'Comment', displayName: 'Comment', description: 'User posted a comment', thirtyDayQueries: 9, status: 'Visible', tags: ['social'], type: 'custom' },
    { id: 'lex_016', category: 'events', eventName: 'Like', displayName: 'Like', description: 'User liked content', thirtyDayQueries: 11, status: 'Visible', tags: ['social'], type: 'custom' },
    { id: 'lex_017', category: 'events', eventName: 'Profile Update', displayName: 'Profile Update', description: 'User updated profile', thirtyDayQueries: 3, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_018', category: 'events', eventName: 'Invite Sent', displayName: 'Invite Sent', description: 'User sent an invite', thirtyDayQueries: 2, status: 'Visible', tags: ['growth'], type: 'custom' },
    { id: 'lex_019', category: 'events', eventName: 'Notification Click', displayName: 'Notification Click', description: 'User clicked a notification', thirtyDayQueries: 5, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_020', category: 'events', eventName: 'Session Start', displayName: 'Session Start', description: 'Session started', thirtyDayQueries: 1, status: 'Hidden', tags: [], type: 'auto' },
    { id: 'lex_021', category: 'events', eventName: 'Session End', displayName: 'Session End', description: 'Session ended', thirtyDayQueries: 1, status: 'Hidden', tags: [], type: 'auto' },
    { id: 'lex_100', category: 'eventProperties', eventName: '$current_url', displayName: 'Current URL', description: 'URL of the page', thirtyDayQueries: 20, status: 'Visible', tags: [], type: 'auto' },
    { id: 'lex_101', category: 'eventProperties', eventName: '$referrer', displayName: 'Referrer', description: 'Referring URL', thirtyDayQueries: 15, status: 'Visible', tags: [], type: 'auto' },
    { id: 'lex_102', category: 'eventProperties', eventName: 'utm_source', displayName: 'UTM Source', description: 'Campaign source', thirtyDayQueries: 10, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_103', category: 'eventProperties', eventName: 'utm_campaign', displayName: 'UTM Campaign', description: 'Campaign name', thirtyDayQueries: 8, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_104', category: 'eventProperties', eventName: 'page_path', displayName: 'Page Path', description: 'Path of the page visited', thirtyDayQueries: 35, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_105', category: 'eventProperties', eventName: 'revenue', displayName: 'Revenue', description: 'Revenue amount from purchase', thirtyDayQueries: 12, status: 'Visible', tags: ['revenue'], type: 'custom' },
    { id: 'lex_200', category: 'profileProperties', eventName: 'Plan', displayName: 'Plan', description: 'Subscription plan', thirtyDayQueries: 20, status: 'Visible', tags: [], type: 'custom' },
    { id: 'lex_201', category: 'profileProperties', eventName: 'LTV', displayName: 'Lifetime Value', description: 'Customer lifetime value', thirtyDayQueries: 10, status: 'Visible', tags: ['revenue'], type: 'custom' },
    { id: 'lex_202', category: 'profileProperties', eventName: 'Device Type', displayName: 'Device Type', description: 'Primary device type', thirtyDayQueries: 15, status: 'Visible', tags: [], type: 'custom' },
  ]

  const cohorts = [
    { id: 'cohort_001', name: 'All Users', description: 'All tracked users', userCount: userProfiles.length, createdAt: daysAgo(30), criteria: { event: 'Any Event', count: 1, timeframe: 'Last 30 days' } },
    { id: 'cohort_002', name: 'Power Users', description: 'Users with 50+ sessions', userCount: 8, createdAt: daysAgo(20), criteria: { event: 'Any Event', count: 50, timeframe: 'Last 30 days' } },
    { id: 'cohort_003', name: 'New Signups (Jan)', description: 'Users who signed up in January 2026', userCount: 5, createdAt: daysAgo(10), criteria: { event: 'Sign Up', count: 1, timeframe: 'Last 30 days' } },
    { id: 'cohort_004', name: 'Purchasers', description: 'Users who completed a purchase', userCount: 12, createdAt: daysAgo(15), criteria: { event: 'Purchase', count: 1, timeframe: 'Last 30 days' } },
    { id: 'cohort_005', name: 'Churned Users', description: 'Users inactive for 14+ days', userCount: 3, createdAt: daysAgo(5), criteria: { event: 'Any Event', count: 0, timeframe: 'Last 14 days' } },
  ]

  const annotations = [
    { id: 'ann_001', date: '2026-01-18', text: 'New pricing page launched', createdBy: 'user_001' },
    { id: 'ann_002', date: '2026-01-10', text: 'Marketing campaign started', createdBy: 'user_001' },
    { id: 'ann_003', date: '2026-01-05', text: 'v2.0 release', createdBy: 'user_001' },
    { id: 'ann_004', date: '2025-12-28', text: 'Holiday promo ended', createdBy: 'user_001' },
  ]

  return {
    currentUser: {
      id: 'user_001',
      name: 'Sam Lee',
      email: 'samlee@example.com',
      avatar: null,
      role: 'Admin',
      orgName: 'Acme Analytics'
    },
    project: {
      id: 'proj_001',
      name: 'Acme Analytics',
      dataView: 'All Project Data',
      timezone: 'US/Pacific',
      createdAt: '2025-06-15T00:00:00Z'
    },
    events,
    userProfiles,
    boards,
    reports,
    lexicon,
    cohorts,
    annotations,
    recentlyViewed: [
      { type: 'report', id: 'report_001', name: 'User Growth & Engagement', viewedAt: daysAgo(0) },
      { type: 'board', id: 'board_001', name: 'Main Dashboard', viewedAt: daysAgo(0) },
      { type: 'report', id: 'report_003', name: 'Signup Conversion Funnel', viewedAt: daysAgo(1) },
      { type: 'report', id: 'report_005', name: 'User Journey Flow', viewedAt: daysAgo(1) },
    ],
    settings: {
      org: { name: 'Acme Analytics', plan: 'Growth', monthlyEvents: '5M', monthlyReplays: '50K' },
      project: { name: 'Acme Analytics', timezone: 'US/Pacific', dataRetention: '365 days' },
      profile: { id: 'user_001', name: 'Sam Lee', email: 'samlee@example.com', avatar: null },
      teams: [
        {
          id: 'team_001',
          name: 'Product Team',
          members: ['user_001', 'user_002', 'user_003'],
          projects: [
            { name: 'Acme Analytics', role: 'Admin' },
            { name: 'Production', role: 'Analyst' }
          ]
        }
      ],
      orgMembers: [
        { id: 'user_001', name: 'Sam Lee', email: 'samlee@example.com', role: 'Owner', dateJoined: '2025-06-15', lastActive: '2026-01-22' },
        { id: 'user_002', name: 'John Smith', email: 'jsmith@example.com', role: 'Admin', dateJoined: '2025-08-01', lastActive: '2026-01-22' },
        { id: 'user_003', name: 'Jane Doe', email: 'jdoe@example.com', role: 'Member', dateJoined: '2025-09-15', lastActive: '2026-01-20' }
      ]
    }
  }
}

export function initializeData(sid = null, customState = null) {
  const key = storageKey(sid)
  const initKey = initialKey(sid)

  if (customState) {
    const defaults = createInitialData()
    const merged = { ...defaults, ...customState }
    localStorage.setItem(key, JSON.stringify(merged))
    localStorage.setItem(initKey, JSON.stringify(merged))
    return merged
  }

  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (!localStorage.getItem(initKey)) {
        localStorage.setItem(initKey, JSON.stringify(parsed))
      }
      return parsed
    } catch (e) {}
  }

  const data = createInitialData()
  localStorage.setItem(key, JSON.stringify(data))
  localStorage.setItem(initKey, JSON.stringify(data))
  return data
}

export function saveState(state, sid = null) {
  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(state))

  const sidParam = sid ? `?sid=${encodeURIComponent(sid)}` : ''
  fetch(`/post${sidParam}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {})
}
