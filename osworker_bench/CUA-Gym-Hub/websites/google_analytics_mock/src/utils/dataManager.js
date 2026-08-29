// Data Manager for Xoogle Analytics 4 Mock
// Handles state initialization, persistence, and session management

const BASE_KEY = 'ga4_mock_state';
const BASE_INITIAL_KEY = 'ga4_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('ga4_mock_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('ga4_mock_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Object.keys(data).length > 0) return data;
    }
  } catch (e) {
    console.warn('No custom state for sid:', sid);
  }
  return null;
};

export const saveState = async (sid, state) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  // Sync to server
  if (sid) {
    try {
      await fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      });
    } catch (e) { /* ignore */ }
  }
};

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);

  if (customState) {
    const merged = deepMerge(createInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(merged));
    if (!localStorage.getItem(initialKey(sid))) {
      localStorage.setItem(initialKey(sid), JSON.stringify(merged));
    }
    return merged;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) { /* fall through */ }
  }

  const initial = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initial));
  localStorage.setItem(initialKey(sid), JSON.stringify(initial));
  return initial;
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* */ }
  }
  return null;
};

// ============================================================
// Data Generation
// ============================================================

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDailyMetrics() {
  const rng = seededRandom(42);
  const metrics = {};
  const startDate = new Date('2024-09-17');

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Month-over-month growth (~5%)
    const monthIdx = Math.floor(i / 30);
    const growthFactor = 1 + monthIdx * 0.05;

    // Base users
    const baseUsers = isWeekend ? 950 + rng() * 200 : 1200 + rng() * 300;
    const variance = 0.85 + rng() * 0.3; // ±15%
    const users = Math.round(baseUsers * variance * growthFactor);

    const newUsers = Math.round(users * (0.58 + rng() * 0.1));
    const returningUsers = users - newUsers;
    const sessions = Math.round(users * (1.25 + rng() * 0.15));
    const engagedSessions = Math.round(sessions * (0.62 + rng() * 0.1));
    const engagementRate = +(engagedSessions / sessions).toFixed(4);
    const avgSessionDuration = Math.round(120 + rng() * 60);
    const avgEngagementTime = Math.round(80 + rng() * 40);
    const sessionsPerUser = +(sessions / users).toFixed(2);
    const screenPageViews = Math.round(sessions * (2.2 + rng() * 0.8));
    const viewsPerSession = +(screenPageViews / sessions).toFixed(2);
    const eventCount = Math.round(sessions * (4.5 + rng() * 1.5));
    const conversions = Math.round(users * (0.04 + rng() * 0.03));
    const totalRevenue = +(conversions * (75 + rng() * 25)).toFixed(2);
    const purchaseRevenue = +(totalRevenue * 0.92).toFixed(2);
    const ecommercePurchases = Math.round(conversions * 0.6);
    const bounceRate = +(1 - engagementRate).toFixed(4);

    metrics[dateStr] = {
      date: dateStr, users, newUsers, returningUsers, sessions, engagedSessions,
      engagementRate, avgSessionDuration, avgEngagementTime, sessionsPerUser,
      screenPageViews, viewsPerSession, eventCount, conversions,
      totalRevenue, purchaseRevenue, ecommercePurchases, bounceRate
    };
  }
  return metrics;
}

function generateTrafficSources() {
  return [
    { id: 'src_001', channelGroup: 'Organic Search', source: 'google', medium: 'organic', campaign: '(not set)', users: 5400, newUsers: 3800, sessions: 7200, engagedSessions: 4800, engagementRate: 0.667, avgEngagementTime: 102, eventCount: 35000, conversions: 320, totalRevenue: 15600.00 },
    { id: 'src_002', channelGroup: 'Organic Search', source: 'bing', medium: 'organic', campaign: '(not set)', users: 850, newUsers: 620, sessions: 1100, engagedSessions: 710, engagementRate: 0.645, avgEngagementTime: 88, eventCount: 5200, conversions: 42, totalRevenue: 1950.00 },
    { id: 'src_003', channelGroup: 'Direct', source: '(direct)', medium: '(none)', campaign: '(not set)', users: 3375, newUsers: 1800, sessions: 4500, engagedSessions: 3100, engagementRate: 0.689, avgEngagementTime: 115, eventCount: 22000, conversions: 210, totalRevenue: 9800.00 },
    { id: 'src_004', channelGroup: 'Referral', source: 'facebook.com', medium: 'referral', campaign: '(not set)', users: 980, newUsers: 750, sessions: 1250, engagedSessions: 780, engagementRate: 0.624, avgEngagementTime: 72, eventCount: 5800, conversions: 48, totalRevenue: 2200.00 },
    { id: 'src_005', channelGroup: 'Referral', source: 'reddit.com', medium: 'referral', campaign: '(not set)', users: 640, newUsers: 520, sessions: 820, engagedSessions: 490, engagementRate: 0.598, avgEngagementTime: 65, eventCount: 3600, conversions: 28, totalRevenue: 1300.00 },
    { id: 'src_006', channelGroup: 'Paid Search', source: 'google', medium: 'cpc', campaign: 'holiday_sale_2024', users: 1350, newUsers: 1100, sessions: 1800, engagedSessions: 1200, engagementRate: 0.667, avgEngagementTime: 95, eventCount: 8500, conversions: 95, totalRevenue: 4500.00 },
    { id: 'src_007', channelGroup: 'Social', source: 'instagram', medium: 'social', campaign: '(not set)', users: 720, newUsers: 580, sessions: 900, engagedSessions: 540, engagementRate: 0.600, avgEngagementTime: 55, eventCount: 4100, conversions: 32, totalRevenue: 1480.00 },
    { id: 'src_008', channelGroup: 'Social', source: 'twitter.com', medium: 'social', campaign: '(not set)', users: 360, newUsers: 290, sessions: 460, engagedSessions: 280, engagementRate: 0.609, avgEngagementTime: 48, eventCount: 2100, conversions: 15, totalRevenue: 700.00 },
    { id: 'src_009', channelGroup: 'Email', source: 'newsletter', medium: 'email', campaign: 'weekly_digest', users: 405, newUsers: 180, sessions: 540, engagedSessions: 400, engagementRate: 0.741, avgEngagementTime: 130, eventCount: 2800, conversions: 38, totalRevenue: 1800.00 },
    { id: 'src_010', channelGroup: 'Display', source: 'google', medium: 'display', campaign: 'retargeting_q4', users: 270, newUsers: 210, sessions: 350, engagedSessions: 190, engagementRate: 0.543, avgEngagementTime: 42, eventCount: 1500, conversions: 12, totalRevenue: 560.00 }
  ];
}

function generateEvents() {
  return [
    { id: 'evt_001', name: 'page_view', count: 45200, totalUsers: 12500, countPerUser: 3.62, isKeyEvent: false, revenue: 0 },
    { id: 'evt_002', name: 'session_start', count: 18920, totalUsers: 12500, countPerUser: 1.51, isKeyEvent: false, revenue: 0 },
    { id: 'evt_003', name: 'first_visit', count: 9850, totalUsers: 9850, countPerUser: 1.00, isKeyEvent: false, revenue: 0 },
    { id: 'evt_004', name: 'scroll', count: 32100, totalUsers: 10200, countPerUser: 3.15, isKeyEvent: false, revenue: 0 },
    { id: 'evt_005', name: 'click', count: 15600, totalUsers: 8900, countPerUser: 1.75, isKeyEvent: false, revenue: 0 },
    { id: 'evt_006', name: 'view_search_results', count: 4200, totalUsers: 3100, countPerUser: 1.35, isKeyEvent: false, revenue: 0 },
    { id: 'evt_007', name: 'file_download', count: 1850, totalUsers: 1400, countPerUser: 1.32, isKeyEvent: false, revenue: 0 },
    { id: 'evt_008', name: 'video_start', count: 3200, totalUsers: 2800, countPerUser: 1.14, isKeyEvent: false, revenue: 0 },
    { id: 'evt_009', name: 'video_progress', count: 2400, totalUsers: 2100, countPerUser: 1.14, isKeyEvent: false, revenue: 0 },
    { id: 'evt_010', name: 'video_complete', count: 1600, totalUsers: 1500, countPerUser: 1.07, isKeyEvent: false, revenue: 0 },
    { id: 'evt_011', name: 'add_to_cart', count: 4800, totalUsers: 3600, countPerUser: 1.33, isKeyEvent: true, revenue: 0 },
    { id: 'evt_012', name: 'begin_checkout', count: 2200, totalUsers: 1900, countPerUser: 1.16, isKeyEvent: true, revenue: 0 },
    { id: 'evt_013', name: 'purchase', count: 1250, totalUsers: 1050, countPerUser: 1.19, isKeyEvent: true, revenue: 58700.00 },
    { id: 'evt_014', name: 'sign_up', count: 980, totalUsers: 980, countPerUser: 1.00, isKeyEvent: true, revenue: 0 },
    { id: 'evt_015', name: 'generate_lead', count: 650, totalUsers: 620, countPerUser: 1.05, isKeyEvent: true, revenue: 0 }
  ];
}

function generatePages() {
  return [
    { id: 'page_001', pagePath: '/', pageTitle: 'Home - Acme Store', views: 12500, users: 8900, viewsPerUser: 1.40, avgEngagementTime: 45, eventCount: 28000, conversions: 120 },
    { id: 'page_002', pagePath: '/products', pageTitle: 'All Products - Acme Store', views: 8400, users: 6200, viewsPerUser: 1.35, avgEngagementTime: 62, eventCount: 19000, conversions: 85 },
    { id: 'page_003', pagePath: '/products/wireless-headphones', pageTitle: 'Wireless Headphones - Acme Store', views: 4200, users: 3500, viewsPerUser: 1.20, avgEngagementTime: 78, eventCount: 8500, conversions: 42 },
    { id: 'page_004', pagePath: '/products/smart-watch', pageTitle: 'Smart Watch Pro - Acme Store', views: 3800, users: 3100, viewsPerUser: 1.23, avgEngagementTime: 72, eventCount: 7600, conversions: 38 },
    { id: 'page_005', pagePath: '/products/laptop-stand', pageTitle: 'Ergonomic Laptop Stand - Acme Store', views: 2900, users: 2400, viewsPerUser: 1.21, avgEngagementTime: 55, eventCount: 5800, conversions: 28 },
    { id: 'page_006', pagePath: '/products/mechanical-keyboard', pageTitle: 'Mechanical Keyboard - Acme Store', views: 2600, users: 2200, viewsPerUser: 1.18, avgEngagementTime: 68, eventCount: 5200, conversions: 25 },
    { id: 'page_007', pagePath: '/cart', pageTitle: 'Shopping Cart - Acme Store', views: 3200, users: 2800, viewsPerUser: 1.14, avgEngagementTime: 35, eventCount: 6400, conversions: 0 },
    { id: 'page_008', pagePath: '/checkout', pageTitle: 'Checkout - Acme Store', views: 2100, users: 1900, viewsPerUser: 1.11, avgEngagementTime: 120, eventCount: 4200, conversions: 0 },
    { id: 'page_009', pagePath: '/order-confirmation', pageTitle: 'Order Confirmation - Acme Store', views: 1250, users: 1050, viewsPerUser: 1.19, avgEngagementTime: 22, eventCount: 2500, conversions: 1050 },
    { id: 'page_010', pagePath: '/about', pageTitle: 'About Us - Acme Store', views: 1800, users: 1500, viewsPerUser: 1.20, avgEngagementTime: 48, eventCount: 3600, conversions: 8 },
    { id: 'page_011', pagePath: '/contact', pageTitle: 'Contact - Acme Store', views: 1200, users: 1000, viewsPerUser: 1.20, avgEngagementTime: 42, eventCount: 2400, conversions: 12 },
    { id: 'page_012', pagePath: '/blog', pageTitle: 'Blog - Acme Store', views: 2800, users: 2200, viewsPerUser: 1.27, avgEngagementTime: 95, eventCount: 5600, conversions: 15 },
    { id: 'page_013', pagePath: '/blog/best-headphones-2024', pageTitle: 'Best Headphones 2024 - Acme Store', views: 1600, users: 1400, viewsPerUser: 1.14, avgEngagementTime: 180, eventCount: 3200, conversions: 22 },
    { id: 'page_014', pagePath: '/account', pageTitle: 'My Account - Acme Store', views: 2200, users: 1800, viewsPerUser: 1.22, avgEngagementTime: 35, eventCount: 4400, conversions: 5 },
    { id: 'page_015', pagePath: '/search', pageTitle: 'Search Results - Acme Store', views: 3500, users: 2900, viewsPerUser: 1.21, avgEngagementTime: 28, eventCount: 7000, conversions: 32 }
  ];
}

function generateCountries() {
  return [
    { id: 'country_001', country: 'United States', countryCode: 'US', users: 6500, newUsers: 4200, sessions: 8500, engagementRate: 0.72, avgEngagementTime: 110, conversions: 280, revenue: 12500.00 },
    { id: 'country_002', country: 'India', countryCode: 'IN', users: 1250, newUsers: 950, sessions: 1600, engagementRate: 0.58, avgEngagementTime: 65, conversions: 35, revenue: 1200.00 },
    { id: 'country_003', country: 'United Kingdom', countryCode: 'GB', users: 1000, newUsers: 680, sessions: 1300, engagementRate: 0.68, avgEngagementTime: 95, conversions: 52, revenue: 2400.00 },
    { id: 'country_004', country: 'Canada', countryCode: 'CA', users: 750, newUsers: 500, sessions: 980, engagementRate: 0.70, avgEngagementTime: 100, conversions: 38, revenue: 1800.00 },
    { id: 'country_005', country: 'Germany', countryCode: 'DE', users: 620, newUsers: 420, sessions: 810, engagementRate: 0.65, avgEngagementTime: 88, conversions: 28, revenue: 1300.00 },
    { id: 'country_006', country: 'Australia', countryCode: 'AU', users: 480, newUsers: 320, sessions: 630, engagementRate: 0.71, avgEngagementTime: 105, conversions: 25, revenue: 1150.00 },
    { id: 'country_007', country: 'France', countryCode: 'FR', users: 420, newUsers: 290, sessions: 550, engagementRate: 0.63, avgEngagementTime: 82, conversions: 18, revenue: 850.00 },
    { id: 'country_008', country: 'Brazil', countryCode: 'BR', users: 380, newUsers: 280, sessions: 490, engagementRate: 0.55, avgEngagementTime: 58, conversions: 12, revenue: 520.00 },
    { id: 'country_009', country: 'Japan', countryCode: 'JP', users: 350, newUsers: 240, sessions: 460, engagementRate: 0.66, avgEngagementTime: 92, conversions: 20, revenue: 950.00 },
    { id: 'country_010', country: 'Netherlands', countryCode: 'NL', users: 250, newUsers: 170, sessions: 330, engagementRate: 0.69, avgEngagementTime: 98, conversions: 15, revenue: 700.00 }
  ];
}

function generateCities() {
  return [
    { id: 'city_001', city: 'New York', country: 'United States', users: 1200, sessions: 1600 },
    { id: 'city_002', city: 'Los Angeles', country: 'United States', users: 890, sessions: 1150 },
    { id: 'city_003', city: 'Chicago', country: 'United States', users: 650, sessions: 850 },
    { id: 'city_004', city: 'London', country: 'United Kingdom', users: 580, sessions: 750 },
    { id: 'city_005', city: 'Mumbai', country: 'India', users: 420, sessions: 540 },
    { id: 'city_006', city: 'Toronto', country: 'Canada', users: 380, sessions: 500 },
    { id: 'city_007', city: 'San Francisco', country: 'United States', users: 350, sessions: 460 },
    { id: 'city_008', city: 'Berlin', country: 'Germany', users: 310, sessions: 400 },
    { id: 'city_009', city: 'Sydney', country: 'Australia', users: 290, sessions: 380 },
    { id: 'city_010', city: 'Houston', country: 'United States', users: 280, sessions: 360 },
    { id: 'city_011', city: 'Paris', country: 'France', users: 260, sessions: 340 },
    { id: 'city_012', city: 'Seattle', country: 'United States', users: 240, sessions: 310 },
    { id: 'city_013', city: 'Delhi', country: 'India', users: 220, sessions: 280 },
    { id: 'city_014', city: 'Sao Paulo', country: 'Brazil', users: 200, sessions: 260 },
    { id: 'city_015', city: 'Amsterdam', country: 'Netherlands', users: 180, sessions: 235 }
  ];
}

export function createInitialData() {
  return {
    property: {
      propertyId: '384729156',
      propertyName: 'GA4 - Acme Store',
      accountName: 'Acme Corp',
      accountId: '219384756',
      websiteUrl: 'https://www.acmestore.com',
      industry: 'Shopping',
      timezone: 'America/New_York',
      currency: 'USD',
      dataStreams: [
        {
          id: 'ds_001',
          name: 'Acme Store Web',
          type: 'WEB',
          url: 'https://www.acmestore.com',
          measurementId: 'G-ABC123XYZ',
          status: 'active',
          enhancedMeasurement: {
            pageViews: true, scrolls: true, outboundClicks: true,
            siteSearch: true, formInteractions: true, videoEngagement: true, fileDownloads: true
          }
        }
      ],
      createdAt: '2023-01-15'
    },
    dailyMetrics: generateDailyMetrics(),
    trafficSources: generateTrafficSources(),
    events: generateEvents(),
    pages: generatePages(),
    countries: generateCountries(),
    cities: generateCities(),
    languages: [
      { language: 'English', users: 8500, percentage: 0.68 },
      { language: 'Spanish', users: 1250, percentage: 0.10 },
      { language: 'French', users: 625, percentage: 0.05 },
      { language: 'German', users: 500, percentage: 0.04 },
      { language: 'Portuguese', users: 375, percentage: 0.03 },
      { language: 'Japanese', users: 350, percentage: 0.028 }
    ],
    ageBrackets: [
      { bracket: '18-24', users: 2000, percentage: 0.16 },
      { bracket: '25-34', users: 3200, percentage: 0.256 },
      { bracket: '35-44', users: 2800, percentage: 0.224 },
      { bracket: '45-54', users: 2100, percentage: 0.168 },
      { bracket: '55-64', users: 1400, percentage: 0.112 },
      { bracket: '65+', users: 1000, percentage: 0.08 }
    ],
    genders: [
      { gender: 'male', users: 5800, percentage: 0.464 },
      { gender: 'female', users: 5200, percentage: 0.416 },
      { gender: 'unknown', users: 1500, percentage: 0.12 }
    ],
    techPlatforms: {
      browsers: [
        { name: 'Chrome', users: 7750, percentage: 0.62 },
        { name: 'Safari', users: 2250, percentage: 0.18 },
        { name: 'Firefox', users: 1000, percentage: 0.08 },
        { name: 'Edge', users: 875, percentage: 0.07 },
        { name: 'Samsung Internet', users: 375, percentage: 0.03 },
        { name: 'Other', users: 250, percentage: 0.02 }
      ],
      operatingSystems: [
        { name: 'Windows', users: 5625, percentage: 0.45 },
        { name: 'macOS', users: 2750, percentage: 0.22 },
        { name: 'iOS', users: 1875, percentage: 0.15 },
        { name: 'Android', users: 1500, percentage: 0.12 },
        { name: 'Linux', users: 500, percentage: 0.04 },
        { name: 'Chrome OS', users: 250, percentage: 0.02 }
      ],
      devices: [
        { category: 'desktop', users: 7250, percentage: 0.58 },
        { category: 'mobile', users: 4500, percentage: 0.36 },
        { category: 'tablet', users: 750, percentage: 0.06 }
      ],
      screenResolutions: [
        { resolution: '1920x1080', users: 3200 },
        { resolution: '1440x900', users: 1800 },
        { resolution: '1366x768', users: 1500 },
        { resolution: '375x812', users: 2200 },
        { resolution: '414x896', users: 1600 },
        { resolution: '768x1024', users: 700 }
      ]
    },
    realtimeData: {
      activeUsers: 42,
      usersPerMinute: [3,5,2,4,6,1,3,5,4,2,7,3,4,5,2,3,6,4,2,5,3,4,1,6,3,5,4,2,3,4],
      byCountry: [
        { country: 'United States', users: 18 },
        { country: 'India', users: 7 },
        { country: 'United Kingdom', users: 5 },
        { country: 'Canada', users: 4 },
        { country: 'Germany', users: 3 }
      ],
      bySource: [
        { source: 'google / organic', users: 15 },
        { source: '(direct) / (none)', users: 12 },
        { source: 'facebook.com / referral', users: 5 },
        { source: 'google / cpc', users: 4 },
        { source: 'newsletter / email', users: 3 }
      ],
      byPage: [
        { pagePath: '/', pageTitle: 'Home', users: 10 },
        { pagePath: '/products', pageTitle: 'All Products', users: 8 },
        { pagePath: '/products/wireless-headphones', pageTitle: 'Wireless Headphones', users: 6 },
        { pagePath: '/cart', pageTitle: 'Shopping Cart', users: 5 },
        { pagePath: '/blog', pageTitle: 'Blog', users: 4 }
      ],
      byDevice: [
        { device: 'desktop', users: 24 },
        { device: 'mobile', users: 15 },
        { device: 'tablet', users: 3 }
      ]
    },
    retentionCohorts: [
      { cohortDate: '2024-10-14', cohortSize: 1200, retention: [1.0, 0.42, 0.28, 0.21, 0.18, 0.15, 0.13, 0.11] },
      { cohortDate: '2024-10-21', cohortSize: 1150, retention: [1.0, 0.40, 0.27, 0.20, 0.17, 0.14, 0.12, 0.10] },
      { cohortDate: '2024-10-28', cohortSize: 1280, retention: [1.0, 0.44, 0.30, 0.22, 0.19, 0.16, 0.14, 0.12] },
      { cohortDate: '2024-11-04', cohortSize: 1310, retention: [1.0, 0.41, 0.28, 0.21, 0.18, 0.15, 0.13, 0.11] },
      { cohortDate: '2024-11-11', cohortSize: 1250, retention: [1.0, 0.43, 0.29, 0.22, 0.18, 0.15, 0.13, 0.11] },
      { cohortDate: '2024-11-18', cohortSize: 1350, retention: [1.0, 0.45, 0.31, 0.23, 0.19, 0.16, 0.14, 0.12] },
      { cohortDate: '2024-11-25', cohortSize: 1400, retention: [1.0, 0.43, 0.29, 0.22, 0.18, 0.15, 0.13, null] },
      { cohortDate: '2024-12-02', cohortSize: 1380, retention: [1.0, 0.41, 0.28, 0.21, null, null, null, null] }
    ],
    explorations: [
      {
        id: 'exp_001', name: 'Traffic Source Analysis', type: 'free_form',
        createdAt: '2024-10-15', lastModified: '2024-11-20', owner: 'Admin User', shared: false,
        config: { dimensions: ['sessionSource', 'sessionMedium'], metrics: ['sessions', 'engagementRate', 'conversions'], visualization: 'table', dateRange: 'last28days', filters: [] }
      },
      {
        id: 'exp_002', name: 'Purchase Funnel', type: 'funnel',
        createdAt: '2024-10-20', lastModified: '2024-12-01', owner: 'Admin User', shared: true,
        config: { steps: ['session_start', 'view_item', 'add_to_cart', 'purchase'], funnelType: 'closed', dateRange: 'last28days' }
      },
      {
        id: 'exp_003', name: 'User Retention Cohorts', type: 'cohort',
        createdAt: '2024-11-01', lastModified: '2024-12-10', owner: 'Admin User', shared: false,
        config: { cohortInclusion: 'first_visit', returnCriteria: 'any_event', granularity: 'weekly', dateRange: 'last90days' }
      }
    ],
    customDimensions: [
      { id: 'cd_001', name: 'user_membership_level', scope: 'user', description: 'Membership tier of the user', parameterName: 'membership_level' },
      { id: 'cd_002', name: 'product_category', scope: 'event', description: 'Category of product viewed', parameterName: 'item_category' }
    ],
    customMetrics: [
      { id: 'cm_001', name: 'loyalty_points_earned', scope: 'event', description: 'Points earned per transaction', parameterName: 'points_earned', unit: 'STANDARD' }
    ],
    conversions: [
      { id: 'conv_001', eventName: 'purchase', isKeyEvent: true, createdAt: '2023-01-20', count: 1250, value: 58700.00 },
      { id: 'conv_002', eventName: 'add_to_cart', isKeyEvent: true, createdAt: '2023-01-20', count: 4800, value: 0 },
      { id: 'conv_003', eventName: 'sign_up', isKeyEvent: true, createdAt: '2023-02-15', count: 980, value: 0 },
      { id: 'conv_004', eventName: 'generate_lead', isKeyEvent: true, createdAt: '2023-03-10', count: 650, value: 0 }
    ],
    audiences: [
      { id: 'aud_001', name: 'All Users', description: 'All users who have visited the property', membershipDuration: 540, userCount: 12500, trigger: 'any event' },
      { id: 'aud_002', name: 'New Users', description: 'Users who visited for the first time in the last 7 days', membershipDuration: 7, userCount: 2800, trigger: 'first_visit event' },
      { id: 'aud_003', name: 'Purchasers', description: 'Users who completed a purchase in the last 30 days', membershipDuration: 30, userCount: 1250, trigger: 'purchase event' },
      { id: 'aud_004', name: 'Cart Abandoners', description: 'Users who added to cart but did not purchase in the last 14 days', membershipDuration: 14, userCount: 850, trigger: 'add_to_cart without purchase' },
      { id: 'aud_005', name: 'High-Value Customers', description: 'Users with lifetime revenue over $500', membershipDuration: 540, userCount: 320, trigger: 'revenue > $500' }
    ],
    selectedDateRange: {
      preset: 'last28days',
      startDate: '2024-11-18',
      endDate: '2024-12-15',
      compareEnabled: false,
      compareType: 'precedingPeriod'
    },
    activeComparison: null,
    recentlyAccessed: [],
    currentUser: {
      name: 'Admin User',
      email: 'admin@acmestore.com',
      role: 'Administrator',
      avatarUrl: null
    }
  };
}

// Utility: aggregate dailyMetrics for a date range
export function getMetricsForDateRange(dailyMetrics, startDate, endDate) {
  const result = {
    users: 0, newUsers: 0, returningUsers: 0, sessions: 0,
    engagedSessions: 0, screenPageViews: 0, eventCount: 0,
    conversions: 0, totalRevenue: 0, purchaseRevenue: 0,
    ecommercePurchases: 0, avgEngagementTime: 0, avgSessionDuration: 0,
    engagementRate: 0, bounceRate: 0, sessionsPerUser: 0, viewsPerSession: 0
  };
  let count = 0;
  const dates = Object.keys(dailyMetrics).sort();
  for (const date of dates) {
    if (date >= startDate && date <= endDate) {
      const m = dailyMetrics[date];
      result.users += m.users;
      result.newUsers += m.newUsers;
      result.returningUsers += m.returningUsers;
      result.sessions += m.sessions;
      result.engagedSessions += m.engagedSessions;
      result.screenPageViews += m.screenPageViews;
      result.eventCount += m.eventCount;
      result.conversions += m.conversions;
      result.totalRevenue += m.totalRevenue;
      result.purchaseRevenue += m.purchaseRevenue;
      result.ecommercePurchases += m.ecommercePurchases;
      result.avgEngagementTime += m.avgEngagementTime;
      result.avgSessionDuration += m.avgSessionDuration;
      count++;
    }
  }
  if (count > 0) {
    result.avgEngagementTime = Math.round(result.avgEngagementTime / count);
    result.avgSessionDuration = Math.round(result.avgSessionDuration / count);
    result.engagementRate = +(result.engagedSessions / result.sessions).toFixed(4);
    result.bounceRate = +(1 - result.engagementRate).toFixed(4);
    result.sessionsPerUser = +(result.sessions / result.users).toFixed(2);
    result.viewsPerSession = +(result.screenPageViews / result.sessions).toFixed(2);
    result.totalRevenue = +result.totalRevenue.toFixed(2);
    result.purchaseRevenue = +result.purchaseRevenue.toFixed(2);
  }
  return result;
}

// Get daily metrics as array for charting
export function getDailyMetricsArray(dailyMetrics, startDate, endDate) {
  return Object.keys(dailyMetrics)
    .filter(date => date >= startDate && date <= endDate)
    .sort()
    .map(date => dailyMetrics[date]);
}

// Format number with K/M suffix
export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Format seconds to Xm Ys
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

// Format currency
export function formatCurrency(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format percentage
export function formatPercent(value) {
  return (value * 100).toFixed(1) + '%';
}
