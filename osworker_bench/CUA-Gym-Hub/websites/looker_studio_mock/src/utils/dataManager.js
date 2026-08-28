const BASE_KEY = 'looker_studio_state'
const BASE_INITIAL_KEY = 'looker_studio_initial_state'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('looker_studio_sid', sid)
    return sid
  }
  return sessionStorage.getItem('looker_studio_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${sid}` : '/state'
    const res = await fetch(url)
    const json = await res.json()
    if (json.has_custom_state && json.stored_state) return json.stored_state
  } catch (e) { /* ignore */ }
  return null
}

export const saveState = async (sid, state) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state))
  try {
    const url = sid ? `/post?sid=${sid}` : '/post'
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    })
  } catch (e) { /* ignore */ }
}

function generateWebsiteData() {
  const rows = []
  const channels = [
    { name: 'Organic Search', weight: 0.35 },
    { name: 'Direct', weight: 0.22 },
    { name: 'Social', weight: 0.15 },
    { name: 'Paid Search', weight: 0.12 },
    { name: 'Email', weight: 0.08 },
    { name: 'Referral', weight: 0.05 },
    { name: 'Display', weight: 0.02 },
    { name: 'Other', weight: 0.01 }
  ]
  const countries = [
    { name: 'United States', weight: 0.48 },
    { name: 'United Kingdom', weight: 0.12 },
    { name: 'Canada', weight: 0.08 },
    { name: 'Germany', weight: 0.06 },
    { name: 'India', weight: 0.06 },
    { name: 'Australia', weight: 0.05 },
    { name: 'France', weight: 0.04 },
    { name: 'Brazil', weight: 0.04 },
    { name: 'Japan', weight: 0.04 },
    { name: 'Netherlands', weight: 0.03 }
  ]
  const devices = ['desktop', 'mobile', 'tablet']
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Samsung Internet', 'IE', 'Other']
  const sources = ['google', 'direct', 'facebook', 'twitter', 'linkedin', 'newsletter', 'bing', 'referral']

  const startDate = new Date('2024-10-01')
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseUsers = isWeekend ? 800 + Math.floor(Math.random() * 300) : 1100 + Math.floor(Math.random() * 400)
    const users = baseUsers
    const sessions = Math.floor(users * (1.2 + Math.random() * 0.3))
    const pageviews = Math.floor(sessions * (3 + Math.random() * 0.6))
    const bounceRate = parseFloat((35 + Math.random() * 20).toFixed(1))
    const avgDuration = Math.floor(120 + Math.random() * 120)
    const conversions = Math.floor(20 + Math.random() * 40)
    const revenue = parseFloat((conversions * (40 + Math.random() * 20)).toFixed(2))

    rows.push({
      dim_date: date.toISOString().split('T')[0],
      dim_country: countries[Math.floor(Math.random() * countries.length)].name,
      dim_channel: channels[Math.floor(Math.random() * channels.length)].name,
      dim_device: devices[Math.floor(Math.random() * devices.length)],
      dim_browser: browsers[Math.floor(Math.random() * browsers.length)],
      dim_source: sources[Math.floor(Math.random() * sources.length)],
      dim_medium: Math.random() > 0.5 ? 'organic' : 'cpc',
      dim_city: 'New York',
      dim_os: Math.random() > 0.5 ? 'Windows' : 'macOS',
      dim_page_path: ['/', '/pricing', '/features', '/about', '/blog'][Math.floor(Math.random() * 5)],
      dim_page_title: ['Home', 'Pricing', 'Features', 'About', 'Blog'][Math.floor(Math.random() * 5)],
      dim_campaign: '(none)',
      dim_event_name: 'page_view',
      dim_age: ['18-24', '25-34', '35-44', '45-54', '55+'][Math.floor(Math.random() * 5)],
      dim_gender: Math.random() > 0.5 ? 'male' : 'female',
      dim_product_name: ['Pro Plan', 'Basic Plan', 'Enterprise'][Math.floor(Math.random() * 3)],
      dim_product_category: 'Subscriptions',
      met_users: users,
      met_new_users: Math.floor(users * (0.55 + Math.random() * 0.2)),
      met_sessions: sessions,
      met_pageviews: pageviews,
      met_bounce_rate: bounceRate,
      met_avg_session_duration: avgDuration,
      met_conversions: conversions,
      met_revenue: revenue,
      met_transactions: Math.floor(conversions * 0.85),
      met_event_count: Math.floor(pageviews * 2),
      met_conversion_rate: parseFloat((conversions / sessions * 100).toFixed(2)),
      met_cost: parseFloat((Math.random() * 200 + 50).toFixed(2)),
      met_cpc: parseFloat((0.5 + Math.random() * 1.5).toFixed(2)),
      met_ctr: parseFloat((2 + Math.random() * 4).toFixed(1)),
      met_impressions: Math.floor(50000 + Math.random() * 30000)
    })
  }
  return rows
}

function generateAdsData() {
  const campaigns = [
    'Brand Awareness Q4', 'Retargeting Campaign', 'New User Acquisition',
    'Product Launch - Pro', 'Holiday Sale 2024'
  ]
  const rows = []
  const startDate = new Date('2024-10-01')
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    campaigns.forEach(campaign => {
      const impressions = Math.floor(5000 + Math.random() * 15000)
      const ctr = parseFloat((1.5 + Math.random() * 4).toFixed(2))
      const clicks = Math.floor(impressions * ctr / 100)
      const cpc = parseFloat((0.5 + Math.random() * 2).toFixed(2))
      const cost = parseFloat((clicks * cpc).toFixed(2))
      const convRate = parseFloat((2 + Math.random() * 5).toFixed(2))
      const conversions = Math.floor(clicks * convRate / 100)
      rows.push({
        dim_date: date.toISOString().split('T')[0],
        dim_campaign: campaign,
        dim_channel: 'Paid Search',
        dim_device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        met_impressions: impressions,
        met_ctr: ctr,
        met_clicks: clicks,
        met_cpc: cpc,
        met_cost: cost,
        met_conversions: conversions,
        met_conversion_rate: convRate,
        met_revenue: parseFloat((conversions * 45).toFixed(2))
      })
    })
  }
  return rows
}

function generateSalesData() {
  const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  const owners = ['Sarah Chen', 'Alex Rivera', 'Jordan Lee', 'Priya Patel', 'Michael Torres']
  const products = ['Pro Plan', 'Enterprise Plan', 'Basic Plan', 'Custom Solution', 'Add-on Package']
  const rows = []
  for (let i = 0; i < 60; i++) {
    const stage = stages[Math.floor(Math.random() * stages.length)]
    const amount = Math.floor(5000 + Math.random() * 95000)
    const closeDate = new Date('2024-10-01')
    closeDate.setDate(closeDate.getDate() + Math.floor(Math.random() * 90))
    rows.push({
      dim_deal_name: `Deal ${String(i + 1).padStart(3, '0')}`,
      dim_stage: stage,
      dim_owner: owners[Math.floor(Math.random() * owners.length)],
      dim_product: products[Math.floor(Math.random() * products.length)],
      dim_company: `Company ${String(i + 1).padStart(3, '0')}`,
      dim_close_date: closeDate.toISOString().split('T')[0],
      dim_country: ['United States', 'United Kingdom', 'Canada', 'Germany'][Math.floor(Math.random() * 4)],
      met_amount: amount,
      met_probability: [10, 25, 50, 75, 100, 0][stages.indexOf(stage)],
      met_days_in_stage: Math.floor(1 + Math.random() * 30),
      met_expected_revenue: Math.floor(amount * ([0.1, 0.25, 0.5, 0.75, 1, 0][stages.indexOf(stage)]))
    })
  }
  return rows
}

export const createInitialData = () => {
  const now = new Date()
  const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString()

  const websiteData = generateWebsiteData()
  const adsData = generateAdsData()
  const salesData = generateSalesData()

  const dataSources = [
    {
      id: 'ds_001',
      name: 'Sample Website Data',
      type: 'google_analytics',
      connectorIcon: 'analytics',
      createdAt: daysAgo(120),
      modifiedAt: daysAgo(5),
      ownerId: 'user_001',
      ownerName: 'Sarah Chen',
      fields: [
        { id: 'dim_date', name: 'Date', type: 'date', category: 'dimension' },
        { id: 'dim_country', name: 'Country', type: 'text', category: 'dimension' },
        { id: 'dim_city', name: 'City', type: 'text', category: 'dimension' },
        { id: 'dim_source', name: 'Source', type: 'text', category: 'dimension' },
        { id: 'dim_medium', name: 'Medium', type: 'text', category: 'dimension' },
        { id: 'dim_channel', name: 'Channel', type: 'text', category: 'dimension' },
        { id: 'dim_device', name: 'Device Category', type: 'text', category: 'dimension' },
        { id: 'dim_browser', name: 'Browser', type: 'text', category: 'dimension' },
        { id: 'dim_os', name: 'Operating System', type: 'text', category: 'dimension' },
        { id: 'dim_page_path', name: 'Page Path', type: 'text', category: 'dimension' },
        { id: 'dim_page_title', name: 'Page Title', type: 'text', category: 'dimension' },
        { id: 'dim_campaign', name: 'Campaign', type: 'text', category: 'dimension' },
        { id: 'dim_event_name', name: 'Event Name', type: 'text', category: 'dimension' },
        { id: 'dim_age', name: 'Age', type: 'text', category: 'dimension' },
        { id: 'dim_gender', name: 'Gender', type: 'text', category: 'dimension' },
        { id: 'dim_product_name', name: 'Product Name', type: 'text', category: 'dimension' },
        { id: 'dim_product_category', name: 'Product Category', type: 'text', category: 'dimension' },
        { id: 'met_users', name: 'Users', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_new_users', name: 'New Users', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_sessions', name: 'Sessions', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_pageviews', name: 'Pageviews', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_bounce_rate', name: 'Bounce Rate', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_avg_session_duration', name: 'Avg. Session Duration', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_conversions', name: 'Conversions', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_revenue', name: 'Revenue', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_transactions', name: 'Transactions', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_event_count', name: 'Event Count', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_conversion_rate', name: 'Conversion Rate', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_cost', name: 'Cost', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_cpc', name: 'CPC', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_ctr', name: 'CTR', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_impressions', name: 'Impressions', type: 'number', category: 'metric', aggregation: 'SUM' }
      ],
      data: websiteData
    },
    {
      id: 'ds_002',
      name: 'Google Ads Campaign Data',
      type: 'google_ads',
      connectorIcon: 'ads',
      createdAt: daysAgo(100),
      modifiedAt: daysAgo(3),
      ownerId: 'user_001',
      ownerName: 'Sarah Chen',
      fields: [
        { id: 'dim_date', name: 'Date', type: 'date', category: 'dimension' },
        { id: 'dim_campaign', name: 'Campaign', type: 'text', category: 'dimension' },
        { id: 'dim_channel', name: 'Channel', type: 'text', category: 'dimension' },
        { id: 'dim_device', name: 'Device', type: 'text', category: 'dimension' },
        { id: 'met_impressions', name: 'Impressions', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_ctr', name: 'CTR', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_clicks', name: 'Clicks', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_cpc', name: 'CPC', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_cost', name: 'Cost', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_conversions', name: 'Conversions', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_conversion_rate', name: 'Conv. Rate', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_revenue', name: 'Revenue', type: 'number', category: 'metric', aggregation: 'SUM' }
      ],
      data: adsData
    },
    {
      id: 'ds_003',
      name: 'Sales Pipeline Data',
      type: 'google_sheets',
      connectorIcon: 'sheets',
      createdAt: daysAgo(80),
      modifiedAt: daysAgo(10),
      ownerId: 'user_001',
      ownerName: 'Sarah Chen',
      fields: [
        { id: 'dim_deal_name', name: 'Deal Name', type: 'text', category: 'dimension' },
        { id: 'dim_stage', name: 'Stage', type: 'text', category: 'dimension' },
        { id: 'dim_owner', name: 'Owner', type: 'text', category: 'dimension' },
        { id: 'dim_product', name: 'Product', type: 'text', category: 'dimension' },
        { id: 'dim_company', name: 'Company', type: 'text', category: 'dimension' },
        { id: 'dim_close_date', name: 'Close Date', type: 'date', category: 'dimension' },
        { id: 'dim_country', name: 'Country', type: 'text', category: 'dimension' },
        { id: 'met_amount', name: 'Deal Amount', type: 'number', category: 'metric', aggregation: 'SUM' },
        { id: 'met_probability', name: 'Probability', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_days_in_stage', name: 'Days in Stage', type: 'number', category: 'metric', aggregation: 'AVG' },
        { id: 'met_expected_revenue', name: 'Expected Revenue', type: 'number', category: 'metric', aggregation: 'SUM' }
      ],
      data: salesData
    }
  ]

  // Build component helper
  const makeComponent = (id, pageId, type, chartType, x, y, w, h, dsId, dims, mets, style) => ({
    id,
    pageId,
    type,
    chartType: chartType || null,
    controlType: null,
    x, y, width: w, height: h,
    dataSourceId: dsId,
    dimensions: dims || [],
    metrics: mets || [],
    sortField: mets && mets[0] ? mets[0].fieldId : null,
    sortDirection: 'DESC',
    rowLimit: 10,
    filters: [],
    style: {
      title: style?.title || '',
      showTitle: true,
      titleFontSize: 14,
      titleColor: '#202124',
      backgroundColor: '#FFFFFF',
      borderColor: '#DADCE0',
      borderWidth: 1,
      borderRadius: 0,
      fontFamily: 'Roboto',
      fontSize: 12,
      colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6'],
      showLegend: true,
      legendPosition: 'bottom',
      showDataLabels: false,
      opacity: 1,
      padding: 16,
      ...(style || {})
    },
    compactNumber: true,
    comparisonField: null,
    textContent: '',
    textAlign: 'left',
    textBold: false,
    textItalic: false,
    textSize: 14,
    textColor: '#202124',
    shapeType: null,
    lineStartX: null, lineStartY: null, lineEndX: null, lineEndY: null,
    strokeColor: '#5F6368', strokeWidth: 1, fillColor: '#FFFFFF',
    selected: false,
    locked: false
  })

  const dim = (fieldId, name, type = 'text') => ({ fieldId, name, type })
  const met = (fieldId, name, aggregation = 'SUM') => ({ fieldId, name, type: 'number', aggregation })

  // ━━━━ Report 1: Marketing Dashboard Q4 ━━━━
  // Page 1 - Overview
  const comp_p1_dr = makeComponent('comp_p1_dr', 'page_001', 'control', null, 20, 20, 280, 44, 'ds_001', [dim('dim_date', 'Date', 'date')], [], { title: 'Date Range' })
  comp_p1_dr.controlType = 'date_range'
  comp_p1_dr.dateRange = { start: '2024-10-01', end: '2024-12-29', preset: 'Last 90 days' }

  const comp_p1_sc1 = makeComponent('comp_p1_sc1', 'page_001', 'chart', 'scorecard', 20, 80, 250, 100, 'ds_001',
    [], [met('met_users', 'Users')], { title: 'Total Users', showTitle: true })
  const comp_p1_sc2 = makeComponent('comp_p1_sc2', 'page_001', 'chart', 'scorecard', 290, 80, 250, 100, 'ds_001',
    [], [met('met_revenue', 'Revenue')], { title: 'Total Revenue', showTitle: true })
  const comp_p1_sc3 = makeComponent('comp_p1_sc3', 'page_001', 'chart', 'scorecard', 560, 80, 250, 100, 'ds_001',
    [], [met('met_conversions', 'Conversions')], { title: 'Conversions', showTitle: true })
  const comp_p1_sc4 = makeComponent('comp_p1_sc4', 'page_001', 'chart', 'scorecard', 830, 80, 250, 100, 'ds_001',
    [], [met('met_sessions', 'Sessions')], { title: 'Sessions', showTitle: true })

  const comp_p1_ts = makeComponent('comp_p1_ts', 'page_001', 'chart', 'time_series', 20, 200, 680, 280, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_users', 'Users')], { title: 'Users Over Time', showLegend: false })
  const comp_p1_bar = makeComponent('comp_p1_bar', 'page_001', 'chart', 'bar', 720, 200, 400, 280, 'ds_001',
    [dim('dim_channel', 'Channel')], [met('met_users', 'Users')], { title: 'Users by Channel' })
  const comp_p1_pie = makeComponent('comp_p1_pie', 'page_001', 'chart', 'pie', 20, 500, 320, 280, 'ds_001',
    [dim('dim_device', 'Device Category')], [met('met_sessions', 'Sessions')], { title: 'Sessions by Device', legendPosition: 'right' })
  const comp_p1_table = makeComponent('comp_p1_table', 'page_001', 'chart', 'table', 360, 500, 760, 280, 'ds_001',
    [dim('dim_page_path', 'Page Path'), dim('dim_page_title', 'Page Title')],
    [met('met_pageviews', 'Pageviews'), met('met_users', 'Users'), met('met_bounce_rate', 'Bounce Rate', 'AVG')],
    { title: 'Top Pages', showLegend: false })

  // Page 2 - Acquisition
  const comp_p2_ts = makeComponent('comp_p2_ts', 'page_002', 'chart', 'time_series', 20, 20, 700, 280, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_sessions', 'Sessions'), met('met_users', 'Users')], { title: 'Sessions & Users Over Time' })
  const comp_p2_bar = makeComponent('comp_p2_bar', 'page_002', 'chart', 'bar', 740, 20, 380, 280, 'ds_001',
    [dim('dim_channel', 'Channel')], [met('met_sessions', 'Sessions')], { title: 'Sessions by Channel' })
  const comp_p2_geo = makeComponent('comp_p2_geo', 'page_002', 'chart', 'geo', 20, 320, 560, 320, 'ds_001',
    [dim('dim_country', 'Country')], [met('met_users', 'Users')], { title: 'Users by Country', showLegend: false })
  const comp_p2_table = makeComponent('comp_p2_table', 'page_002', 'chart', 'table', 600, 320, 520, 320, 'ds_002',
    [dim('dim_campaign', 'Campaign')],
    [met('met_impressions', 'Impressions'), met('met_clicks', 'Clicks'), met('met_cost', 'Cost'), met('met_conversions', 'Conversions')],
    { title: 'Campaign Performance', showLegend: false })

  // Page 3 - Revenue
  const comp_p3_sc1 = makeComponent('comp_p3_sc1', 'page_003', 'chart', 'scorecard', 20, 20, 350, 100, 'ds_001',
    [], [met('met_revenue', 'Revenue')], { title: 'Total Revenue' })
  const comp_p3_sc2 = makeComponent('comp_p3_sc2', 'page_003', 'chart', 'scorecard', 390, 20, 350, 100, 'ds_001',
    [], [met('met_transactions', 'Transactions')], { title: 'Transactions' })
  const comp_p3_line = makeComponent('comp_p3_line', 'page_003', 'chart', 'line', 20, 140, 680, 280, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_revenue', 'Revenue')], { title: 'Revenue Over Time', showLegend: false })
  const comp_p3_bar = makeComponent('comp_p3_bar', 'page_003', 'chart', 'bar', 720, 140, 380, 280, 'ds_001',
    [dim('dim_product_category', 'Product Category')], [met('met_revenue', 'Revenue')], { title: 'Revenue by Category' })
  const comp_p3_table = makeComponent('comp_p3_table', 'page_003', 'chart', 'table', 20, 440, 1080, 280, 'ds_001',
    [dim('dim_product_name', 'Product Name'), dim('dim_product_category', 'Product Category')],
    [met('met_transactions', 'Transactions'), met('met_revenue', 'Revenue'), met('met_conversion_rate', 'Conv. Rate', 'AVG')],
    { title: 'Top Products', showLegend: false })

  // ━━━━ Report 2: Weekly KPI Dashboard ━━━━
  const comp_kpi_sc1 = makeComponent('comp_kpi_sc1', 'page_kpi_1', 'chart', 'scorecard', 20, 20, 260, 100, 'ds_001',
    [], [met('met_users', 'Users')], { title: 'Weekly Active Users' })
  const comp_kpi_sc2 = makeComponent('comp_kpi_sc2', 'page_kpi_1', 'chart', 'scorecard', 300, 20, 260, 100, 'ds_001',
    [], [met('met_sessions', 'Sessions')], { title: 'Total Sessions' })
  const comp_kpi_sc3 = makeComponent('comp_kpi_sc3', 'page_kpi_1', 'chart', 'scorecard', 580, 20, 260, 100, 'ds_001',
    [], [met('met_revenue', 'Revenue')], { title: 'Revenue' })
  const comp_kpi_sc4 = makeComponent('comp_kpi_sc4', 'page_kpi_1', 'chart', 'scorecard', 860, 20, 260, 100, 'ds_001',
    [], [met('met_bounce_rate', 'Bounce Rate', 'AVG')], { title: 'Bounce Rate' })
  const comp_kpi_ts = makeComponent('comp_kpi_ts', 'page_kpi_1', 'chart', 'time_series', 20, 140, 1100, 300, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_users', 'Users'), met('met_new_users', 'New Users')], { title: 'Users Trend' })
  const comp_kpi_bar = makeComponent('comp_kpi_bar', 'page_kpi_1', 'chart', 'bar', 20, 460, 540, 280, 'ds_001',
    [dim('dim_source', 'Source')], [met('met_sessions', 'Sessions')], { title: 'Sessions by Source' })
  const comp_kpi_pie = makeComponent('comp_kpi_pie', 'page_kpi_1', 'chart', 'donut', 580, 460, 540, 280, 'ds_001',
    [dim('dim_browser', 'Browser')], [met('met_users', 'Users')], { title: 'Users by Browser' })

  // ━━━━ Report 3: Sales Pipeline Report ━━━━
  const comp_sales_sc1 = makeComponent('comp_sales_sc1', 'page_sales_1', 'chart', 'scorecard', 20, 20, 350, 100, 'ds_003',
    [], [met('met_amount', 'Deal Amount')], { title: 'Total Pipeline Value' })
  const comp_sales_sc2 = makeComponent('comp_sales_sc2', 'page_sales_1', 'chart', 'scorecard', 390, 20, 350, 100, 'ds_003',
    [], [met('met_expected_revenue', 'Expected Revenue')], { title: 'Expected Revenue' })
  const comp_sales_bar = makeComponent('comp_sales_bar', 'page_sales_1', 'chart', 'bar', 20, 140, 560, 300, 'ds_003',
    [dim('dim_stage', 'Stage')], [met('met_amount', 'Deal Amount')], { title: 'Pipeline by Stage' })
  const comp_sales_pie = makeComponent('comp_sales_pie', 'page_sales_1', 'chart', 'pie', 600, 140, 520, 300, 'ds_003',
    [dim('dim_owner', 'Owner')], [met('met_amount', 'Deal Amount')], { title: 'Pipeline by Owner' })
  const comp_sales_table = makeComponent('comp_sales_table', 'page_sales_1', 'chart', 'table', 20, 460, 1100, 320, 'ds_003',
    [dim('dim_deal_name', 'Deal Name'), dim('dim_stage', 'Stage'), dim('dim_owner', 'Owner'), dim('dim_product', 'Product')],
    [met('met_amount', 'Deal Amount'), met('met_probability', 'Probability', 'AVG')],
    { title: 'Deal Details', showLegend: false })

  // ━━━━ Report 4: Website Traffic Analysis ━━━━
  const comp_traffic_ts = makeComponent('comp_traffic_ts', 'page_traffic_1', 'chart', 'area', 20, 20, 1100, 300, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_pageviews', 'Pageviews'), met('met_sessions', 'Sessions')], { title: 'Traffic Over Time' })
  const comp_traffic_geo = makeComponent('comp_traffic_geo', 'page_traffic_1', 'chart', 'geo', 20, 340, 540, 300, 'ds_001',
    [dim('dim_country', 'Country')], [met('met_sessions', 'Sessions')], { title: 'Sessions by Country' })
  const comp_traffic_bar = makeComponent('comp_traffic_bar', 'page_traffic_1', 'chart', 'bar', 580, 340, 540, 300, 'ds_001',
    [dim('dim_page_path', 'Page Path')], [met('met_pageviews', 'Pageviews')], { title: 'Top Pages' })
  const comp_traffic_pie = makeComponent('comp_traffic_pie', 'page_traffic_1', 'chart', 'pie', 20, 660, 540, 280, 'ds_001',
    [dim('dim_device', 'Device Category')], [met('met_sessions', 'Sessions')], { title: 'Device Breakdown' })
  const comp_traffic_tree = makeComponent('comp_traffic_tree', 'page_traffic_1', 'chart', 'treemap', 580, 660, 540, 280, 'ds_001',
    [dim('dim_browser', 'Browser')], [met('met_users', 'Users')], { title: 'Browser Distribution' })

  // ━━━━ Report 5: Social Media Metrics ━━━━
  const comp_social_sc1 = makeComponent('comp_social_sc1', 'page_social_1', 'chart', 'scorecard', 20, 20, 260, 100, 'ds_001',
    [], [met('met_users', 'Users')], { title: 'Social Users' })
  const comp_social_sc2 = makeComponent('comp_social_sc2', 'page_social_1', 'chart', 'scorecard', 300, 20, 260, 100, 'ds_001',
    [], [met('met_sessions', 'Sessions')], { title: 'Social Sessions' })
  const comp_social_sc3 = makeComponent('comp_social_sc3', 'page_social_1', 'chart', 'scorecard', 580, 20, 260, 100, 'ds_001',
    [], [met('met_conversions', 'Conversions')], { title: 'Social Conversions' })
  const comp_social_ts = makeComponent('comp_social_ts', 'page_social_1', 'chart', 'time_series', 20, 140, 820, 300, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_users', 'Users')], { title: 'Social Traffic Trend' })
  const comp_social_bar = makeComponent('comp_social_bar', 'page_social_1', 'chart', 'bar', 20, 460, 540, 280, 'ds_001',
    [dim('dim_source', 'Source')], [met('met_users', 'Users')], { title: 'Users by Social Platform' })
  const comp_social_table = makeComponent('comp_social_table', 'page_social_1', 'chart', 'table', 580, 460, 540, 280, 'ds_001',
    [dim('dim_source', 'Source'), dim('dim_medium', 'Medium')],
    [met('met_sessions', 'Sessions'), met('met_conversions', 'Conversions')],
    { title: 'Social Performance Detail', showLegend: false })

  // ━━━━ Report 6: Q3 Revenue Report ━━━━
  const comp_q3_sc1 = makeComponent('comp_q3_sc1', 'page_q3_1', 'chart', 'scorecard', 20, 20, 350, 100, 'ds_001',
    [], [met('met_revenue', 'Revenue')], { title: 'Q3 Revenue' })
  const comp_q3_sc2 = makeComponent('comp_q3_sc2', 'page_q3_1', 'chart', 'scorecard', 390, 20, 350, 100, 'ds_001',
    [], [met('met_conversions', 'Conversions')], { title: 'Q3 Conversions' })
  const comp_q3_line = makeComponent('comp_q3_line', 'page_q3_1', 'chart', 'line', 20, 140, 720, 300, 'ds_001',
    [dim('dim_date', 'Date', 'date')], [met('met_revenue', 'Revenue')], { title: 'Revenue Trend' })
  const comp_q3_bar = makeComponent('comp_q3_bar', 'page_q3_1', 'chart', 'bar', 760, 140, 360, 300, 'ds_001',
    [dim('dim_product_name', 'Product Name')], [met('met_revenue', 'Revenue')], { title: 'Revenue by Product' })
  const comp_q3_table = makeComponent('comp_q3_table', 'page_q3_1', 'chart', 'table', 20, 460, 1100, 280, 'ds_001',
    [dim('dim_country', 'Country')],
    [met('met_revenue', 'Revenue'), met('met_transactions', 'Transactions'), met('met_conversion_rate', 'Conv. Rate', 'AVG')],
    { title: 'Revenue by Country', showLegend: false })

  // ━━━━ Report 8: Campaign Performance ━━━━
  const comp_camp_sc1 = makeComponent('comp_camp_sc1', 'page_camp_1', 'chart', 'scorecard', 20, 20, 260, 100, 'ds_002',
    [], [met('met_impressions', 'Impressions')], { title: 'Total Impressions' })
  const comp_camp_sc2 = makeComponent('comp_camp_sc2', 'page_camp_1', 'chart', 'scorecard', 300, 20, 260, 100, 'ds_002',
    [], [met('met_clicks', 'Clicks')], { title: 'Total Clicks' })
  const comp_camp_sc3 = makeComponent('comp_camp_sc3', 'page_camp_1', 'chart', 'scorecard', 580, 20, 260, 100, 'ds_002',
    [], [met('met_cost', 'Cost')], { title: 'Total Spend' })
  const comp_camp_sc4 = makeComponent('comp_camp_sc4', 'page_camp_1', 'chart', 'scorecard', 860, 20, 260, 100, 'ds_002',
    [], [met('met_conversions', 'Conversions')], { title: 'Conversions' })
  const comp_camp_ts = makeComponent('comp_camp_ts', 'page_camp_1', 'chart', 'time_series', 20, 140, 1100, 280, 'ds_002',
    [dim('dim_date', 'Date', 'date')], [met('met_clicks', 'Clicks'), met('met_conversions', 'Conversions')], { title: 'Campaign Clicks & Conversions' })
  const comp_camp_bar = makeComponent('comp_camp_bar', 'page_camp_1', 'chart', 'bar', 20, 440, 540, 300, 'ds_002',
    [dim('dim_campaign', 'Campaign')], [met('met_cost', 'Cost')], { title: 'Spend by Campaign' })
  const comp_camp_table = makeComponent('comp_camp_table', 'page_camp_1', 'chart', 'table', 580, 440, 540, 300, 'ds_002',
    [dim('dim_campaign', 'Campaign'), dim('dim_device', 'Device')],
    [met('met_impressions', 'Impressions'), met('met_clicks', 'Clicks'), met('met_cpc', 'CPC', 'AVG'), met('met_conversions', 'Conversions')],
    { title: 'Campaign Breakdown', showLegend: false })

  const components = {
    // Report 1
    comp_p1_dr, comp_p1_sc1, comp_p1_sc2, comp_p1_sc3, comp_p1_sc4,
    comp_p1_ts, comp_p1_bar, comp_p1_pie, comp_p1_table,
    comp_p2_ts, comp_p2_bar, comp_p2_geo, comp_p2_table,
    comp_p3_sc1, comp_p3_sc2, comp_p3_line, comp_p3_bar, comp_p3_table,
    // Report 2
    comp_kpi_sc1, comp_kpi_sc2, comp_kpi_sc3, comp_kpi_sc4, comp_kpi_ts, comp_kpi_bar, comp_kpi_pie,
    // Report 3
    comp_sales_sc1, comp_sales_sc2, comp_sales_bar, comp_sales_pie, comp_sales_table,
    // Report 4
    comp_traffic_ts, comp_traffic_geo, comp_traffic_bar, comp_traffic_pie, comp_traffic_tree,
    // Report 5
    comp_social_sc1, comp_social_sc2, comp_social_sc3, comp_social_ts, comp_social_bar, comp_social_table,
    // Report 6
    comp_q3_sc1, comp_q3_sc2, comp_q3_line, comp_q3_bar, comp_q3_table,
    // Report 8
    comp_camp_sc1, comp_camp_sc2, comp_camp_sc3, comp_camp_sc4, comp_camp_ts, comp_camp_bar, comp_camp_table
  }

  const pages = {
    page_001: {
      id: 'page_001', reportId: 'rpt_001', name: 'Overview', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_p1_dr', 'comp_p1_sc1', 'comp_p1_sc2', 'comp_p1_sc3', 'comp_p1_sc4', 'comp_p1_ts', 'comp_p1_bar', 'comp_p1_pie', 'comp_p1_table']
    },
    page_002: {
      id: 'page_002', reportId: 'rpt_001', name: 'Acquisition', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_p2_ts', 'comp_p2_bar', 'comp_p2_geo', 'comp_p2_table']
    },
    page_003: {
      id: 'page_003', reportId: 'rpt_001', name: 'Revenue', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_p3_sc1', 'comp_p3_sc2', 'comp_p3_line', 'comp_p3_bar', 'comp_p3_table']
    },
    page_kpi_1: {
      id: 'page_kpi_1', reportId: 'rpt_002', name: 'KPIs', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_kpi_sc1', 'comp_kpi_sc2', 'comp_kpi_sc3', 'comp_kpi_sc4', 'comp_kpi_ts', 'comp_kpi_bar', 'comp_kpi_pie']
    },
    page_sales_1: {
      id: 'page_sales_1', reportId: 'rpt_003', name: 'Pipeline', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_sales_sc1', 'comp_sales_sc2', 'comp_sales_bar', 'comp_sales_pie', 'comp_sales_table']
    },
    page_traffic_1: {
      id: 'page_traffic_1', reportId: 'rpt_004', name: 'Traffic', width: 1160, height: 900, backgroundColor: '#F8F9FA',
      components: ['comp_traffic_ts', 'comp_traffic_geo', 'comp_traffic_bar', 'comp_traffic_pie', 'comp_traffic_tree']
    },
    page_social_1: {
      id: 'page_social_1', reportId: 'rpt_005', name: 'Overview', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_social_sc1', 'comp_social_sc2', 'comp_social_sc3', 'comp_social_ts', 'comp_social_bar', 'comp_social_table']
    },
    page_q3_1: {
      id: 'page_q3_1', reportId: 'rpt_006', name: 'Revenue', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_q3_sc1', 'comp_q3_sc2', 'comp_q3_line', 'comp_q3_bar', 'comp_q3_table']
    },
    page_cac_1: {
      id: 'page_cac_1', reportId: 'rpt_007', name: 'CAC', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: []
    },
    page_camp_1: {
      id: 'page_camp_1', reportId: 'rpt_008', name: 'Overview', width: 1160, height: 900, backgroundColor: '#FFFFFF',
      components: ['comp_camp_sc1', 'comp_camp_sc2', 'comp_camp_sc3', 'comp_camp_sc4', 'comp_camp_ts', 'comp_camp_bar', 'comp_camp_table']
    }
  }

  const reports = [
    {
      id: 'rpt_001', name: 'Marketing Dashboard Q4',
      ownerId: 'user_001', ownerName: 'Sarah Chen', ownerEmail: 'sarah.chen@example.com',
      createdAt: daysAgo(90), modifiedAt: daysAgo(1), lastOpenedAt: daysAgo(0),
      thumbnailColor: '#4285F4', starred: false, shared: true, trashed: false,
      sharedWith: [
        { email: 'alex.rivera@example.com', name: 'Alex Rivera', role: 'editor', avatarColor: '#EA4335' },
        { email: 'jordan.lee@example.com', name: 'Jordan Lee', role: 'viewer', avatarColor: '#34A853' }
      ],
      dataSources: ['ds_001', 'ds_002'],
      pages: ['page_001', 'page_002', 'page_003'], currentPageId: 'page_001'
    },
    {
      id: 'rpt_002', name: 'Weekly KPI Dashboard',
      ownerId: 'user_001', ownerName: 'Sarah Chen', ownerEmail: 'sarah.chen@example.com',
      createdAt: daysAgo(30), modifiedAt: daysAgo(1), lastOpenedAt: daysAgo(1),
      thumbnailColor: '#34A853', starred: true, shared: false, trashed: false,
      sharedWith: [], dataSources: ['ds_001'],
      pages: ['page_kpi_1'], currentPageId: 'page_kpi_1'
    },
    {
      id: 'rpt_003', name: 'Sales Pipeline Report',
      ownerId: 'user_001', ownerName: 'Sarah Chen', ownerEmail: 'sarah.chen@example.com',
      createdAt: daysAgo(60), modifiedAt: daysAgo(7), lastOpenedAt: daysAgo(7),
      thumbnailColor: '#FBBC04', starred: false, shared: false, trashed: false,
      sharedWith: [], dataSources: ['ds_003'],
      pages: ['page_sales_1'], currentPageId: 'page_sales_1'
    },
    {
      id: 'rpt_004', name: 'Website Traffic Analysis',
      ownerId: 'user_001', ownerName: 'Sarah Chen', ownerEmail: 'sarah.chen@example.com',
      createdAt: daysAgo(45), modifiedAt: daysAgo(14), lastOpenedAt: daysAgo(14),
      thumbnailColor: '#46BDC6', starred: false, shared: false, trashed: false,
      sharedWith: [], dataSources: ['ds_001'],
      pages: ['page_traffic_1'], currentPageId: 'page_traffic_1'
    },
    {
      id: 'rpt_005', name: 'Social Media Metrics',
      ownerId: 'user_002', ownerName: 'Alex Rivera', ownerEmail: 'alex.rivera@example.com',
      createdAt: daysAgo(20), modifiedAt: daysAgo(3), lastOpenedAt: daysAgo(3),
      thumbnailColor: '#9C27B0', starred: false, shared: true, trashed: false,
      sharedWith: [{ email: 'sarah.chen@example.com', name: 'Sarah Chen', role: 'viewer', avatarColor: '#4285F4' }],
      dataSources: ['ds_001'],
      pages: ['page_social_1'], currentPageId: 'page_social_1'
    },
    {
      id: 'rpt_006', name: 'Q3 Revenue Report',
      ownerId: 'user_003', ownerName: 'Jordan Lee', ownerEmail: 'jordan.lee@example.com',
      createdAt: daysAgo(50), modifiedAt: daysAgo(20), lastOpenedAt: daysAgo(20),
      thumbnailColor: '#FF6D01', starred: false, shared: true, trashed: false,
      sharedWith: [{ email: 'sarah.chen@example.com', name: 'Sarah Chen', role: 'editor', avatarColor: '#4285F4' }],
      dataSources: ['ds_001'],
      pages: ['page_q3_1'], currentPageId: 'page_q3_1'
    },
    {
      id: 'rpt_007', name: 'Customer Acquisition Cost',
      ownerId: 'user_001', ownerName: 'Sarah Chen', ownerEmail: 'sarah.chen@example.com',
      createdAt: daysAgo(25), modifiedAt: daysAgo(25), lastOpenedAt: daysAgo(25),
      thumbnailColor: '#EA4335', starred: false, shared: false, trashed: true,
      sharedWith: [], dataSources: ['ds_002'],
      pages: ['page_cac_1'], currentPageId: 'page_cac_1'
    },
    {
      id: 'rpt_008', name: 'Campaign Performance',
      ownerId: 'user_004', ownerName: 'Priya Patel', ownerEmail: 'priya.patel@example.com',
      createdAt: daysAgo(15), modifiedAt: daysAgo(5), lastOpenedAt: daysAgo(5),
      thumbnailColor: '#4285F4', starred: false, shared: true, trashed: false,
      sharedWith: [{ email: 'sarah.chen@example.com', name: 'Sarah Chen', role: 'viewer', avatarColor: '#4285F4' }],
      dataSources: ['ds_002'],
      pages: ['page_camp_1'], currentPageId: 'page_camp_1'
    }
  ]

  const templates = [
    { id: 'tmpl_001', name: 'Google Analytics Overview', category: 'Marketing', description: 'Comprehensive website traffic and user behavior dashboard.', thumbnailColor: '#4285F4', dataSourceType: 'google_analytics', popularity: 1200 },
    { id: 'tmpl_002', name: 'Google Ads Performance', category: 'Marketing', description: 'Track your Google Ads campaigns, clicks, costs and conversions.', thumbnailColor: '#EA4335', dataSourceType: 'google_ads', popularity: 980 },
    { id: 'tmpl_003', name: 'Social Media Dashboard', category: 'Marketing', description: 'Monitor performance across all social media platforms.', thumbnailColor: '#9C27B0', dataSourceType: 'social', popularity: 850 },
    { id: 'tmpl_004', name: 'Sales Pipeline', category: 'Sales', description: 'Visualize your sales funnel, deal stages and revenue pipeline.', thumbnailColor: '#34A853', dataSourceType: 'crm', popularity: 760 },
    { id: 'tmpl_005', name: 'Revenue Overview', category: 'Finance', description: 'High-level revenue metrics, trends and forecasts.', thumbnailColor: '#FBBC04', dataSourceType: 'finance', popularity: 690 },
    { id: 'tmpl_006', name: 'E-commerce Dashboard', category: 'Sales', description: 'Track orders, revenue, conversion rates and product performance.', thumbnailColor: '#FF6D01', dataSourceType: 'ecommerce', popularity: 820 },
    { id: 'tmpl_007', name: 'SEO Performance', category: 'Marketing', description: 'Organic search metrics, keyword rankings and traffic trends.', thumbnailColor: '#46BDC6', dataSourceType: 'search_console', popularity: 640 },
    { id: 'tmpl_008', name: 'Customer Support Metrics', category: 'Operations', description: 'Support ticket volume, resolution times and CSAT scores.', thumbnailColor: '#4285F4', dataSourceType: 'support', popularity: 510 },
    { id: 'tmpl_009', name: 'HR Workforce Dashboard', category: 'HR', description: 'Headcount, turnover rate, hiring funnel and employee metrics.', thumbnailColor: '#34A853', dataSourceType: 'hr', popularity: 420 },
    { id: 'tmpl_010', name: 'Project Management', category: 'Operations', description: 'Project status, milestones, resource utilization and timelines.', thumbnailColor: '#EA4335', dataSourceType: 'project', popularity: 380 }
  ]

  return {
    user: {
      id: 'user_001',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      avatarUrl: null,
      avatarColor: '#4285F4'
    },
    reports,
    dataSources,
    templates,
    currentReport: reports[0],
    pages,
    components,
    editor: {
      mode: 'edit',
      selectedComponentIds: [],
      clipboard: null,
      zoom: 100,
      showGrid: true,
      snapToGrid: true,
      gridSize: 10,
      undoStack: [],
      redoStack: [],
      propertiesPanel: { visible: true, activeTab: 'setup' },
      activeTool: 'select',
      activeChartType: null,
      activeControlType: null,
      isDrawing: false,
      drawStart: null
    },
    home: {
      view: 'recent',
      sortBy: 'lastOpened',
      sortDirection: 'desc',
      searchQuery: '',
      viewMode: 'grid'
    },
    dataSourcesView: { sortBy: 'lastModified', searchQuery: '' },
    shareDialog: { open: false, reportId: null },
    connectorDialog: { open: false },
    publishDialog: { open: false, reportId: null }
  }
}

export const initializeData = (sid = null, customState = null) => {
  const key = storageKey(sid)
  const initKey = initialKey(sid)

  if (customState) {
    localStorage.setItem(key, JSON.stringify(customState))
    localStorage.setItem(initKey, JSON.stringify(customState))
    return customState
  }

  const existing = localStorage.getItem(key)
  if (existing) {
    try { return JSON.parse(existing) } catch (e) { /* fall through */ }
  }

  const fresh = createInitialData()
  localStorage.setItem(key, JSON.stringify(fresh))
  localStorage.setItem(initKey, JSON.stringify(fresh))
  return fresh
}
