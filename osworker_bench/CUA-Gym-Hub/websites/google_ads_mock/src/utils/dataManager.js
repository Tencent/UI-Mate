// dataManager.js - Xoogle Ads Mock seed data and state management

function generateDailyMetrics() {
  const metrics = []
  const campaigns = [
    { id: 'camp-1', type: 'SEARCH', ctrRange: [0.08, 0.12], cpcRange: [1.0, 2.0], convRate: 0.08 },
    { id: 'camp-2', type: 'SEARCH', ctrRange: [0.03, 0.05], cpcRange: [1.5, 3.0], convRate: 0.05 },
    { id: 'camp-3', type: 'SEARCH', ctrRange: [0.02, 0.04], cpcRange: [1.2, 2.5], convRate: 0.03 },
    { id: 'camp-4', type: 'DISPLAY', ctrRange: [0.003, 0.008], cpcRange: [0.3, 0.8], convRate: 0.02 },
    { id: 'camp-5', type: 'VIDEO', ctrRange: [0.001, 0.003], cpcRange: [0.1, 0.3], convRate: 0.01 },
    { id: 'camp-6', type: 'SHOPPING', ctrRange: [0.02, 0.04], cpcRange: [0.8, 1.5], convRate: 0.04 },
    { id: 'camp-7', type: 'PERFORMANCE_MAX', ctrRange: [0.015, 0.035], cpcRange: [0.9, 1.8], convRate: 0.06 },
  ]

  for (let day = 1; day <= 30; day++) {
    const date = `2025-03-${String(day).padStart(2, '0')}`
    const dayOfWeek = new Date(2025, 2, day).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const multiplier = isWeekend ? 0.65 : 1.0

    campaigns.forEach(camp => {
      const baseImpressions = {
        'camp-1': 1200, 'camp-2': 2800, 'camp-3': 800,
        'camp-4': 15000, 'camp-5': 8000, 'camp-6': 3500,
        'camp-7': 5000,
      }[camp.id]

      const impressions = Math.round(baseImpressions * multiplier * (0.85 + Math.random() * 0.3))
      const ctr = camp.ctrRange[0] + Math.random() * (camp.ctrRange[1] - camp.ctrRange[0])
      const clicks = Math.round(impressions * ctr)
      const cpc = camp.cpcRange[0] + Math.random() * (camp.cpcRange[1] - camp.cpcRange[0])
      const cost = parseFloat((clicks * cpc).toFixed(2))
      const conversions = Math.round(clicks * camp.convRate * (0.8 + Math.random() * 0.4))

      metrics.push({ date, campaignId: camp.id, clicks, impressions, cost, conversions })
    })
  }
  return metrics
}

export function createInitialData() {
  const account = {
    id: 'acc-1',
    name: 'Acme Corp',
    accountId: '123-456-7890',
    currency: 'USD',
    timezone: 'America/New_York',
    optimizationScore: 72
  }

  const campaigns = [
    {
      id: 'camp-1', name: 'Brand Search - US', status: 'ENABLED', type: 'SEARCH',
      budget: 50, biddingStrategy: 'MANUAL_CPC', targetCpa: null, targetRoas: null,
      startDate: '2025-01-15', endDate: null,
      networks: ['SEARCH', 'SEARCH_PARTNERS'], locations: ['United States'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 1245, impressions: 12890, ctr: 0.0966, avgCpc: 1.42, cost: 1768.90, conversions: 87, conversionRate: 0.0699, costPerConversion: 20.33 }
    },
    {
      id: 'camp-2', name: 'Generic Search - Running Shoes', status: 'ENABLED', type: 'SEARCH',
      budget: 120, biddingStrategy: 'MAXIMIZE_CLICKS', targetCpa: null, targetRoas: null,
      startDate: '2025-01-15', endDate: null,
      networks: ['SEARCH', 'SEARCH_PARTNERS', 'DISPLAY'], locations: ['United States', 'Canada'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 2340, impressions: 67800, ctr: 0.0345, avgCpc: 2.18, cost: 5101.20, conversions: 132, conversionRate: 0.0564, costPerConversion: 38.64 }
    },
    {
      id: 'camp-3', name: 'Competitor Keywords', status: 'PAUSED', type: 'SEARCH',
      budget: 30, biddingStrategy: 'MANUAL_CPC', targetCpa: null, targetRoas: null,
      startDate: '2025-02-01', endDate: null,
      networks: ['SEARCH'], locations: ['United States'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 312, impressions: 9800, ctr: 0.0318, avgCpc: 1.85, cost: 577.20, conversions: 18, conversionRate: 0.0577, costPerConversion: 32.07 }
    },
    {
      id: 'camp-4', name: 'Display Remarketing', status: 'ENABLED', type: 'DISPLAY',
      budget: 40, biddingStrategy: 'TARGET_CPA', targetCpa: 12, targetRoas: null,
      startDate: '2025-01-20', endDate: null,
      networks: ['DISPLAY'], locations: ['United States'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 876, impressions: 145600, ctr: 0.0060, avgCpc: 0.52, cost: 455.52, conversions: 45, conversionRate: 0.0514, costPerConversion: 10.12 }
    },
    {
      id: 'camp-5', name: 'YouTube Pre-Roll', status: 'ENABLED', type: 'VIDEO',
      budget: 75, biddingStrategy: 'MAXIMIZE_CONVERSIONS', targetCpa: null, targetRoas: null,
      startDate: '2025-02-01', endDate: null,
      networks: ['YOUTUBE'], locations: ['United States', 'Canada', 'United Kingdom'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 445, impressions: 198000, ctr: 0.00225, avgCpc: 0.18, cost: 80.10, conversions: 22, conversionRate: 0.0494, costPerConversion: 3.64 }
    },
    {
      id: 'camp-6', name: 'Shopping - All Products', status: 'ENABLED', type: 'SHOPPING',
      budget: 100, biddingStrategy: 'TARGET_ROAS', targetCpa: null, targetRoas: 400,
      startDate: '2025-01-15', endDate: null,
      networks: ['SEARCH', 'SHOPPING'], locations: ['United States'], languages: ['English'],
      adSchedule: { enabled: false, schedule: [] },
      metrics: { clicks: 1876, impressions: 67400, ctr: 0.0278, avgCpc: 1.12, cost: 2101.12, conversions: 210, conversionRate: 0.1119, costPerConversion: 10.01 }
    },
    {
      id: 'camp-7', name: 'Performance Max - Spring Sale', status: 'ENABLED', type: 'PERFORMANCE_MAX',
      budget: 85, biddingStrategy: 'MAXIMIZE_CONVERSIONS', targetCpa: null, targetRoas: null,
      startDate: '2025-02-15', endDate: '2025-04-30',
      networks: ['SEARCH', 'DISPLAY', 'YOUTUBE', 'DISCOVER', 'GMAIL', 'MAPS'], locations: ['United States', 'Canada'], languages: ['English', 'Spanish'],
      adSchedule: { enabled: true, schedule: [{ day: 'MONDAY', startHour: 8, endHour: 22 }, { day: 'TUESDAY', startHour: 8, endHour: 22 }, { day: 'WEDNESDAY', startHour: 8, endHour: 22 }, { day: 'THURSDAY', startHour: 8, endHour: 22 }, { day: 'FRIDAY', startHour: 8, endHour: 22 }, { day: 'SATURDAY', startHour: 10, endHour: 20 }, { day: 'SUNDAY', startHour: 10, endHour: 20 }] },
      metrics: { clicks: 1520, impressions: 89400, ctr: 0.017, avgCpc: 1.35, cost: 2052.00, conversions: 98, conversionRate: 0.0645, costPerConversion: 20.94 }
    }
  ]

  const adGroups = [
    // Campaign 1 - Brand Search
    { id: 'ag-1', campaignId: 'camp-1', name: 'Brand Core', status: 'ENABLED', defaultBid: 3.50, metrics: { clicks: 720, impressions: 6800, ctr: 0.1059, avgCpc: 1.35, cost: 972.00, conversions: 52, conversionRate: 0.0722, costPerConversion: 18.69 } },
    { id: 'ag-2', campaignId: 'camp-1', name: 'Brand + Product', status: 'ENABLED', defaultBid: 2.80, metrics: { clicks: 525, impressions: 6090, ctr: 0.0862, avgCpc: 1.51, cost: 792.75, conversions: 35, conversionRate: 0.0667, costPerConversion: 22.65 } },
    // Campaign 2 - Generic Search
    { id: 'ag-3', campaignId: 'camp-2', name: 'Running Shoes - Broad', status: 'ENABLED', defaultBid: 2.50, metrics: { clicks: 980, impressions: 28400, ctr: 0.0345, avgCpc: 2.10, cost: 2058.00, conversions: 55, conversionRate: 0.0561, costPerConversion: 37.42 } },
    { id: 'ag-4', campaignId: 'camp-2', name: 'Running Shoes - Exact', status: 'ENABLED', defaultBid: 3.00, metrics: { clicks: 850, impressions: 19800, ctr: 0.0429, avgCpc: 2.30, cost: 1955.00, conversions: 60, conversionRate: 0.0706, costPerConversion: 32.58 } },
    { id: 'ag-5', campaignId: 'camp-2', name: 'Trail Running', status: 'PAUSED', defaultBid: 2.20, metrics: { clicks: 510, impressions: 19600, ctr: 0.0260, avgCpc: 2.13, cost: 1086.30, conversions: 17, conversionRate: 0.0333, costPerConversion: 63.90 } },
    // Campaign 3 - Competitor
    { id: 'ag-6', campaignId: 'camp-3', name: 'Nike Keywords', status: 'PAUSED', defaultBid: 2.00, metrics: { clicks: 175, impressions: 5200, ctr: 0.0337, avgCpc: 1.90, cost: 332.50, conversions: 10, conversionRate: 0.0571, costPerConversion: 33.25 } },
    { id: 'ag-7', campaignId: 'camp-3', name: 'Adidas Keywords', status: 'PAUSED', defaultBid: 1.80, metrics: { clicks: 137, impressions: 4600, ctr: 0.0298, avgCpc: 1.79, cost: 245.23, conversions: 8, conversionRate: 0.0584, costPerConversion: 30.65 } },
    // Campaign 4 - Display
    { id: 'ag-8', campaignId: 'camp-4', name: 'Cart Abandoners', status: 'ENABLED', defaultBid: 0.60, metrics: { clicks: 540, impressions: 88000, ctr: 0.0061, avgCpc: 0.50, cost: 270.00, conversions: 30, conversionRate: 0.0556, costPerConversion: 9.00 } },
    { id: 'ag-9', campaignId: 'camp-4', name: 'Past Visitors', status: 'ENABLED', defaultBid: 0.45, metrics: { clicks: 336, impressions: 57600, ctr: 0.0058, avgCpc: 0.55, cost: 184.80, conversions: 15, conversionRate: 0.0446, costPerConversion: 12.32 } },
    // Campaign 5 - Video
    { id: 'ag-10', campaignId: 'camp-5', name: 'Product Demo Videos', status: 'ENABLED', defaultBid: 0.20, metrics: { clicks: 245, impressions: 108000, ctr: 0.00227, avgCpc: 0.17, cost: 41.65, conversions: 12, conversionRate: 0.049, costPerConversion: 3.47 } },
    { id: 'ag-11', campaignId: 'camp-5', name: 'Brand Awareness', status: 'ENABLED', defaultBid: 0.15, metrics: { clicks: 200, impressions: 90000, ctr: 0.00222, avgCpc: 0.19, cost: 38.00, conversions: 10, conversionRate: 0.05, costPerConversion: 3.80 } },
    // Campaign 6 - Shopping
    { id: 'ag-12', campaignId: 'camp-6', name: 'All Products', status: 'ENABLED', defaultBid: 1.20, metrics: { clicks: 1050, impressions: 37800, ctr: 0.0278, avgCpc: 1.10, cost: 1155.00, conversions: 118, conversionRate: 0.1124, costPerConversion: 9.79 } },
    { id: 'ag-13', campaignId: 'camp-6', name: 'Best Sellers', status: 'ENABLED', defaultBid: 1.50, metrics: { clicks: 826, impressions: 29600, ctr: 0.0279, avgCpc: 1.15, cost: 950.90, conversions: 92, conversionRate: 0.1114, costPerConversion: 10.34 } },
    { id: 'ag-14', campaignId: 'camp-6', name: 'Clearance Items', status: 'ENABLED', defaultBid: 0.80, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    // Campaign 7 - Performance Max
    { id: 'ag-15', campaignId: 'camp-7', name: 'Asset Group - Spring', status: 'ENABLED', defaultBid: null, metrics: { clicks: 890, impressions: 52000, ctr: 0.0171, avgCpc: 1.28, cost: 1139.20, conversions: 58, conversionRate: 0.0652, costPerConversion: 19.64 } },
    { id: 'ag-16', campaignId: 'camp-7', name: 'Asset Group - New Arrivals', status: 'ENABLED', defaultBid: null, metrics: { clicks: 630, impressions: 37400, ctr: 0.0168, avgCpc: 1.45, cost: 913.50, conversions: 40, conversionRate: 0.0635, costPerConversion: 22.84 } },
  ]

  const ads = [
    // ag-1 Brand Core
    { id: 'ad-1', adGroupId: 'ag-1', campaignId: 'camp-1', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Acme Corp Official Store', 'Shop Acme Corp Running Shoes', 'Free Shipping on All Orders', 'Top Rated Running Gear'],
      descriptions: ['Shop the official Acme Corp store. Free returns on every order.', 'Premium running shoes built for performance. Order today.'],
      finalUrl: 'https://www.acmecorp.com/', displayUrl: 'www.acmecorp.com',
      metrics: { clicks: 720, impressions: 6800, ctr: 0.1059, avgCpc: 1.35, cost: 972.00, conversions: 52, conversionRate: 0.0722, costPerConversion: 18.69 } },
    // ag-2 Brand + Product
    { id: 'ad-2', adGroupId: 'ag-2', campaignId: 'camp-1', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Acme Corp Running Shoes', 'Best Running Shoes by Acme', 'Free Shipping + Easy Returns', 'Shop New Arrivals Today'],
      descriptions: ['Discover Acme Corp running shoes. Performance-engineered for every runner.', 'New styles just dropped. Find your perfect pair with free 2-day shipping.'],
      finalUrl: 'https://www.acmecorp.com/running-shoes', displayUrl: 'www.acmecorp.com/shoes',
      metrics: { clicks: 525, impressions: 6090, ctr: 0.0862, avgCpc: 1.51, cost: 792.75, conversions: 35, conversionRate: 0.0667, costPerConversion: 22.65 } },
    // ag-3 Running Shoes - Broad
    { id: 'ad-3', adGroupId: 'ag-3', campaignId: 'camp-2', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Best Running Shoes Online', 'Shop Running Shoes Now', 'Top Running Shoes 2025', 'Free Shipping on $50+', 'Running Shoes Sale Today'],
      descriptions: ['Shop the latest running shoes from top brands. Free returns on all orders.', 'Find your perfect running shoe. Expert advice, fast shipping, great prices.'],
      finalUrl: 'https://www.acmecorp.com/running-shoes', displayUrl: 'www.acmecorp.com/running',
      metrics: { clicks: 980, impressions: 28400, ctr: 0.0345, avgCpc: 2.10, cost: 2058.00, conversions: 55, conversionRate: 0.0561, costPerConversion: 37.42 } },
    // ag-4 Running Shoes - Exact
    { id: 'ad-4', adGroupId: 'ag-4', campaignId: 'camp-2', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Running Shoes - Shop Now', 'Premium Running Shoes', 'Buy Running Shoes Online', 'Free 2-Day Shipping'],
      descriptions: ['Browse our collection of premium running shoes. Find the perfect fit for your run.', 'Top-rated running shoes at great prices. Order now for fast, free shipping.'],
      finalUrl: 'https://www.acmecorp.com/running-shoes', displayUrl: 'www.acmecorp.com/shoes',
      metrics: { clicks: 850, impressions: 19800, ctr: 0.0429, avgCpc: 2.30, cost: 1955.00, conversions: 60, conversionRate: 0.0706, costPerConversion: 32.58 } },
    // ag-5 Trail Running (paused)
    { id: 'ad-5', adGroupId: 'ag-5', campaignId: 'camp-2', type: 'RESPONSIVE_SEARCH', status: 'PAUSED',
      headlines: ['Trail Running Shoes', 'Best Trail Shoes 2025', 'Shop Trail Running Gear', 'Durable Off-Road Shoes'],
      descriptions: ['Conquer any terrain with our trail running shoes. Built tough, runs smooth.', 'Trail running shoes for every adventure. Free shipping and returns.'],
      finalUrl: 'https://www.acmecorp.com/trail-running', displayUrl: 'www.acmecorp.com/trail',
      metrics: { clicks: 510, impressions: 19600, ctr: 0.0260, avgCpc: 2.13, cost: 1086.30, conversions: 17, conversionRate: 0.0333, costPerConversion: 63.90 } },
    // ag-6 Nike keywords
    { id: 'ad-6', adGroupId: 'ag-6', campaignId: 'camp-3', type: 'RESPONSIVE_SEARCH', status: 'PAUSED',
      headlines: ['Better Than Nike?', 'Compare Running Shoes', 'Try Acme Corp Instead', 'Save on Running Shoes'],
      descriptions: ['Why pay more for a brand name? Acme Corp running shoes outperform at half the price.', 'Compare Acme Corp vs. Nike. Same quality, better price. See for yourself.'],
      finalUrl: 'https://www.acmecorp.com/compare', displayUrl: 'www.acmecorp.com/compare',
      metrics: { clicks: 175, impressions: 5200, ctr: 0.0337, avgCpc: 1.90, cost: 332.50, conversions: 10, conversionRate: 0.0571, costPerConversion: 33.25 } },
    // ag-7 Adidas keywords
    { id: 'ad-7b', adGroupId: 'ag-7', campaignId: 'camp-3', type: 'RESPONSIVE_SEARCH', status: 'PAUSED',
      headlines: ['Adidas Alternative Found', 'Premium Running Shoes', 'Better Value Than Adidas', 'Shop Acme Corp Shoes'],
      descriptions: ['Looking for Adidas? Try Acme Corp for premium quality at better prices.', 'Acme Corp outperforms Adidas in comfort tests. Try risk-free today.'],
      finalUrl: 'https://www.acmecorp.com/compare-adidas', displayUrl: 'www.acmecorp.com/compare',
      metrics: { clicks: 137, impressions: 4600, ctr: 0.0298, avgCpc: 1.79, cost: 245.23, conversions: 8, conversionRate: 0.0584, costPerConversion: 30.65 } },
    // ag-8 Cart Abandoners
    { id: 'ad-7', adGroupId: 'ag-8', campaignId: 'camp-4', type: 'RESPONSIVE_DISPLAY', status: 'ENABLED',
      headlines: ['Still Thinking It Over?', 'Your Cart Is Waiting', 'Complete Your Purchase'],
      descriptions: ['You left something behind. Complete your order today and get free shipping.', 'Don\'t miss out -- your items are still available. Order now.'],
      finalUrl: 'https://www.acmecorp.com/cart', displayUrl: 'www.acmecorp.com/cart',
      metrics: { clicks: 540, impressions: 88000, ctr: 0.0061, avgCpc: 0.50, cost: 270.00, conversions: 30, conversionRate: 0.0556, costPerConversion: 9.00 } },
    // ag-9 Past Visitors
    { id: 'ad-9b', adGroupId: 'ag-9', campaignId: 'camp-4', type: 'RESPONSIVE_DISPLAY', status: 'ENABLED',
      headlines: ['Welcome Back!', 'New Styles Just Dropped', 'Exclusive Returning Customer Deal'],
      descriptions: ['We missed you! Check out our latest running shoe collection.', 'Come back for 15% off your next order. Limited time offer.'],
      finalUrl: 'https://www.acmecorp.com/welcome-back', displayUrl: 'www.acmecorp.com',
      metrics: { clicks: 336, impressions: 57600, ctr: 0.0058, avgCpc: 0.55, cost: 184.80, conversions: 15, conversionRate: 0.0446, costPerConversion: 12.32 } },
    // ag-10 Product Demo Videos
    { id: 'ad-8', adGroupId: 'ag-10', campaignId: 'camp-5', type: 'VIDEO', status: 'ENABLED',
      headlines: ['Watch How It Runs', 'See Acme Shoes In Action', 'Performance Tested'],
      descriptions: ['See why thousands of runners choose Acme Corp. Watch our product demo.', 'Real runners. Real results. Discover Acme Corp running shoes.'],
      finalUrl: 'https://www.acmecorp.com/video', displayUrl: 'www.acmecorp.com/video',
      metrics: { clicks: 245, impressions: 108000, ctr: 0.00227, avgCpc: 0.17, cost: 41.65, conversions: 12, conversionRate: 0.049, costPerConversion: 3.47 } },
    // ag-11 Brand Awareness
    { id: 'ad-11b', adGroupId: 'ag-11', campaignId: 'camp-5', type: 'VIDEO', status: 'ENABLED',
      headlines: ['Acme Corp Running', 'Born to Run', 'Every Mile Matters'],
      descriptions: ['Acme Corp. Running shoes engineered for champions.', 'From 5Ks to marathons, Acme Corp powers your personal best.'],
      finalUrl: 'https://www.acmecorp.com/brand', displayUrl: 'www.acmecorp.com',
      metrics: { clicks: 200, impressions: 90000, ctr: 0.00222, avgCpc: 0.19, cost: 38.00, conversions: 10, conversionRate: 0.05, costPerConversion: 3.80 } },
    // ag-12 Shopping All Products
    { id: 'ad-9', adGroupId: 'ag-12', campaignId: 'camp-6', type: 'SHOPPING', status: 'ENABLED',
      headlines: ['Shop All Running Shoes', 'Huge Selection of Shoes', 'Running Shoes From $39'],
      descriptions: ['Browse our full catalog of running shoes. All brands, all sizes, fast shipping.', 'Free shipping on orders $50+. Easy returns. Shop 1000+ running shoe styles.'],
      finalUrl: 'https://www.acmecorp.com/shop', displayUrl: 'www.acmecorp.com/shop',
      metrics: { clicks: 1050, impressions: 37800, ctr: 0.0278, avgCpc: 1.10, cost: 1155.00, conversions: 118, conversionRate: 0.1124, costPerConversion: 9.79 } },
    // ag-13 Best Sellers
    { id: 'ad-13b', adGroupId: 'ag-13', campaignId: 'camp-6', type: 'SHOPPING', status: 'ENABLED',
      headlines: ['Best Selling Running Shoes', 'Top Rated Shoes', 'Customer Favorites'],
      descriptions: ['Our best-selling running shoes, rated 4.8 stars by thousands of runners.', 'See why these shoes are our #1 sellers. Order now.'],
      finalUrl: 'https://www.acmecorp.com/best-sellers', displayUrl: 'www.acmecorp.com/best-sellers',
      metrics: { clicks: 826, impressions: 29600, ctr: 0.0279, avgCpc: 1.15, cost: 950.90, conversions: 92, conversionRate: 0.1114, costPerConversion: 10.34 } },
    // ag-15 PMax Spring
    { id: 'ad-15a', adGroupId: 'ag-15', campaignId: 'camp-7', type: 'PERFORMANCE_MAX', status: 'ENABLED',
      headlines: ['Spring Sale Running Shoes', 'Up to 40% Off', 'Limited Time Spring Deals', 'Shop the Spring Collection', 'New Season, New Shoes'],
      descriptions: ['Huge spring sale on all running shoes. Up to 40% off plus free shipping.', 'Spring into savings with Acme Corp. Premium shoes at unbeatable prices.', 'Don\'t miss our biggest sale of the season. Shop now.'],
      finalUrl: 'https://www.acmecorp.com/spring-sale', displayUrl: 'www.acmecorp.com/spring-sale',
      metrics: { clicks: 890, impressions: 52000, ctr: 0.0171, avgCpc: 1.28, cost: 1139.20, conversions: 58, conversionRate: 0.0652, costPerConversion: 19.64 } },
    // ag-16 PMax New Arrivals
    { id: 'ad-16a', adGroupId: 'ag-16', campaignId: 'camp-7', type: 'PERFORMANCE_MAX', status: 'ENABLED',
      headlines: ['New Arrivals Just Dropped', 'Fresh Running Shoe Styles', 'Be the First to Try', 'Just Released'],
      descriptions: ['Explore our newest running shoe styles. Be the first to get the latest designs.', 'New arrivals weekly. Shop the freshest running shoes from Acme Corp.'],
      finalUrl: 'https://www.acmecorp.com/new-arrivals', displayUrl: 'www.acmecorp.com/new',
      metrics: { clicks: 630, impressions: 37400, ctr: 0.0168, avgCpc: 1.45, cost: 913.50, conversions: 40, conversionRate: 0.0635, costPerConversion: 22.84 } },
    // Extra ads for ad groups
    { id: 'ad-1b', adGroupId: 'ag-1', campaignId: 'camp-1', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Official Acme Corp Site', 'Trusted by 100K+ Runners', 'Shop Direct & Save', 'Free Returns Always'],
      descriptions: ['The official Acme Corp website. Shop direct for the best prices and selection.', 'Join 100,000+ happy runners. Free shipping, free returns, always.'],
      finalUrl: 'https://www.acmecorp.com/', displayUrl: 'www.acmecorp.com',
      metrics: { clicks: 380, impressions: 3600, ctr: 0.1056, avgCpc: 1.28, cost: 486.40, conversions: 28, conversionRate: 0.0737, costPerConversion: 17.37 } },
    { id: 'ad-3b', adGroupId: 'ag-3', campaignId: 'camp-2', type: 'RESPONSIVE_SEARCH', status: 'ENABLED',
      headlines: ['Running Shoes Deals', 'Best Prices on Running Shoes', 'Shop & Save Today', 'Rated #1 Running Store'],
      descriptions: ['Find incredible deals on running shoes. Price match guarantee on all orders.', 'Expert-curated running shoes at the best prices. Shop our top picks.'],
      finalUrl: 'https://www.acmecorp.com/deals', displayUrl: 'www.acmecorp.com/deals',
      metrics: { clicks: 520, impressions: 15200, ctr: 0.0342, avgCpc: 2.05, cost: 1066.00, conversions: 30, conversionRate: 0.0577, costPerConversion: 35.53 } },
    { id: 'ad-4b', adGroupId: 'ag-4', campaignId: 'camp-2', type: 'RESPONSIVE_SEARCH', status: 'PAUSED',
      headlines: ['Running Shoes Online', 'Shop the Best Selection', 'Fast Free Delivery', 'Easy 30-Day Returns'],
      descriptions: ['The best running shoes, delivered fast. Shop our curated collection today.', 'Over 500 styles in stock. Find your perfect running shoe with free returns.'],
      finalUrl: 'https://www.acmecorp.com/running-shoes', displayUrl: 'www.acmecorp.com/shoes',
      metrics: { clicks: 210, impressions: 5400, ctr: 0.0389, avgCpc: 2.15, cost: 451.50, conversions: 15, conversionRate: 0.0714, costPerConversion: 30.10 } },
    { id: 'ad-8b', adGroupId: 'ag-8', campaignId: 'camp-4', type: 'RESPONSIVE_DISPLAY', status: 'ENABLED',
      headlines: ['Forgot Something?', 'Come Back & Save 10%', 'Items Selling Fast'],
      descriptions: ['Your running shoes are waiting! Complete your order and save 10%.', 'Items in your cart are selling fast. Don\'t miss out on your size.'],
      finalUrl: 'https://www.acmecorp.com/cart-recovery', displayUrl: 'www.acmecorp.com/save',
      metrics: { clicks: 290, impressions: 48000, ctr: 0.006, avgCpc: 0.48, cost: 139.20, conversions: 16, conversionRate: 0.0552, costPerConversion: 8.70 } },
  ]

  const keywords = [
    // ag-3: Running Shoes Broad
    { id: 'kw-1', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes', matchType: 'BROAD', status: 'ENABLED', bid: 2.50, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 280, impressions: 8100, ctr: 0.0346, avgCpc: 2.05, cost: 574.00, conversions: 16, conversionRate: 0.0571, costPerConversion: 35.88 } },
    { id: 'kw-2', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'best running shoes', matchType: 'BROAD', status: 'ENABLED', bid: 2.75, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 210, impressions: 5400, ctr: 0.0389, avgCpc: 2.20, cost: 462.00, conversions: 12, conversionRate: 0.0571, costPerConversion: 38.50 } },
    { id: 'kw-3', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'buy running shoes online', matchType: 'PHRASE', status: 'ENABLED', bid: 3.00, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 180, impressions: 4200, ctr: 0.0429, avgCpc: 2.30, cost: 414.00, conversions: 10, conversionRate: 0.0556, costPerConversion: 41.40 } },
    { id: 'kw-4', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes for men', matchType: 'BROAD', status: 'ENABLED', bid: 2.40, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 145, impressions: 4600, ctr: 0.0315, avgCpc: 1.95, cost: 282.75, conversions: 8, conversionRate: 0.0552, costPerConversion: 35.34 } },
    { id: 'kw-5', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'nike running shoes', matchType: 'EXACT', status: 'ENABLED', bid: 4.00, qualityScore: 9, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 95, impressions: 1800, ctr: 0.0528, avgCpc: 3.80, cost: 361.00, conversions: 5, conversionRate: 0.0526, costPerConversion: 72.20 } },
    { id: 'kw-6', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes sale', matchType: 'BROAD', status: 'ENABLED', bid: 2.20, qualityScore: 5, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 70, impressions: 4300, ctr: 0.0163, avgCpc: 1.85, cost: 129.50, conversions: 4, conversionRate: 0.0571, costPerConversion: 32.38 } },
    { id: 'kw-6b', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes near me', matchType: 'BROAD', status: 'ENABLED', bid: 2.30, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 55, impressions: 1900, ctr: 0.0289, avgCpc: 1.90, cost: 104.50, conversions: 3, conversionRate: 0.0545, costPerConversion: 34.83 } },
    { id: 'kw-6c', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'comfortable running shoes', matchType: 'PHRASE', status: 'ENABLED', bid: 2.60, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 48, impressions: 1350, ctr: 0.0356, avgCpc: 2.10, cost: 100.80, conversions: 3, conversionRate: 0.0625, costPerConversion: 33.60 } },
    // ag-4: Running Shoes Exact
    { id: 'kw-7', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'running shoes', matchType: 'EXACT', status: 'ENABLED', bid: 3.00, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 320, impressions: 7200, ctr: 0.0444, avgCpc: 2.40, cost: 768.00, conversions: 23, conversionRate: 0.0719, costPerConversion: 33.39 } },
    { id: 'kw-8', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'womens running shoes', matchType: 'EXACT', status: 'ENABLED', bid: 3.20, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 280, impressions: 6100, ctr: 0.0459, avgCpc: 2.50, cost: 700.00, conversions: 20, conversionRate: 0.0714, costPerConversion: 35.00 } },
    { id: 'kw-9', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'running shoes cheap', matchType: 'PHRASE', status: 'ENABLED', bid: 2.00, qualityScore: 4, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'BELOW_AVERAGE' }, isNegative: false, metrics: { clicks: 150, impressions: 4800, ctr: 0.0313, avgCpc: 1.90, cost: 285.00, conversions: 8, conversionRate: 0.0533, costPerConversion: 35.63 } },
    { id: 'kw-10', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'marathon running shoes', matchType: 'PHRASE', status: 'ENABLED', bid: 2.80, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 100, impressions: 1700, ctr: 0.0588, avgCpc: 2.02, cost: 202.00, conversions: 9, conversionRate: 0.09, costPerConversion: 22.44 } },
    { id: 'kw-10b', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'mens running shoes', matchType: 'EXACT', status: 'ENABLED', bid: 3.10, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 195, impressions: 4200, ctr: 0.0464, avgCpc: 2.35, cost: 458.25, conversions: 14, conversionRate: 0.0718, costPerConversion: 32.73 } },
    { id: 'kw-10c', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'lightweight running shoes', matchType: 'EXACT', status: 'ENABLED', bid: 2.90, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 85, impressions: 1950, ctr: 0.0436, avgCpc: 2.20, cost: 187.00, conversions: 6, conversionRate: 0.0706, costPerConversion: 31.17 } },
    // ag-1: Brand Core
    { id: 'kw-11', adGroupId: 'ag-1', campaignId: 'camp-1', text: 'acme corp', matchType: 'EXACT', status: 'ENABLED', bid: 3.50, qualityScore: 10, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 420, impressions: 3800, ctr: 0.1105, avgCpc: 1.20, cost: 504.00, conversions: 32, conversionRate: 0.0762, costPerConversion: 15.75 } },
    { id: 'kw-12', adGroupId: 'ag-1', campaignId: 'camp-1', text: 'acmecorp shoes', matchType: 'EXACT', status: 'ENABLED', bid: 3.00, qualityScore: 9, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 300, impressions: 3000, ctr: 0.10, avgCpc: 1.56, cost: 468.00, conversions: 20, conversionRate: 0.0667, costPerConversion: 23.40 } },
    { id: 'kw-12b', adGroupId: 'ag-1', campaignId: 'camp-1', text: 'acme corp store', matchType: 'BROAD', status: 'ENABLED', bid: 3.20, qualityScore: 10, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 180, impressions: 1650, ctr: 0.1091, avgCpc: 1.15, cost: 207.00, conversions: 14, conversionRate: 0.0778, costPerConversion: 14.79 } },
    // ag-2: Brand + Product
    { id: 'kw-13', adGroupId: 'ag-2', campaignId: 'camp-1', text: 'acme running shoes', matchType: 'BROAD', status: 'ENABLED', bid: 2.80, qualityScore: 9, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 280, impressions: 3200, ctr: 0.0875, avgCpc: 1.45, cost: 406.00, conversions: 20, conversionRate: 0.0714, costPerConversion: 20.30 } },
    { id: 'kw-14', adGroupId: 'ag-2', campaignId: 'camp-1', text: 'acme shoes official site', matchType: 'PHRASE', status: 'ENABLED', bid: 2.50, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 245, impressions: 2890, ctr: 0.0848, avgCpc: 1.57, cost: 384.65, conversions: 15, conversionRate: 0.0612, costPerConversion: 25.64 } },
    { id: 'kw-14b', adGroupId: 'ag-2', campaignId: 'camp-1', text: 'acme corp running shoes review', matchType: 'BROAD', status: 'ENABLED', bid: 2.40, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 120, impressions: 1400, ctr: 0.0857, avgCpc: 1.38, cost: 165.60, conversions: 8, conversionRate: 0.0667, costPerConversion: 20.70 } },
    // ag-5: Trail Running
    { id: 'kw-15', adGroupId: 'ag-5', campaignId: 'camp-2', text: 'trail running shoes', matchType: 'BROAD', status: 'PAUSED', bid: 2.20, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 210, impressions: 8500, ctr: 0.0247, avgCpc: 2.00, cost: 420.00, conversions: 7, conversionRate: 0.0333, costPerConversion: 60.00 } },
    { id: 'kw-16', adGroupId: 'ag-5', campaignId: 'camp-2', text: 'off road running shoes', matchType: 'PHRASE', status: 'PAUSED', bid: 2.00, qualityScore: 5, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 180, impressions: 7200, ctr: 0.025, avgCpc: 2.15, cost: 387.00, conversions: 6, conversionRate: 0.0333, costPerConversion: 64.50 } },
    { id: 'kw-16b', adGroupId: 'ag-5', campaignId: 'camp-2', text: 'waterproof trail shoes', matchType: 'BROAD', status: 'PAUSED', bid: 2.10, qualityScore: 5, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 120, impressions: 3900, ctr: 0.0308, avgCpc: 2.05, cost: 246.00, conversions: 4, conversionRate: 0.0333, costPerConversion: 61.50 } },
    // ag-6: Competitor - Nike
    { id: 'kw-17', adGroupId: 'ag-6', campaignId: 'camp-3', text: 'nike running shoes', matchType: 'BROAD', status: 'PAUSED', bid: 2.00, qualityScore: 4, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 95, impressions: 2800, ctr: 0.0339, avgCpc: 1.80, cost: 171.00, conversions: 5, conversionRate: 0.0526, costPerConversion: 34.20 } },
    { id: 'kw-18', adGroupId: 'ag-6', campaignId: 'camp-3', text: 'nike zoom', matchType: 'PHRASE', status: 'PAUSED', bid: 1.80, qualityScore: 3, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'BELOW_AVERAGE' }, isNegative: false, metrics: { clicks: 80, impressions: 2400, ctr: 0.0333, avgCpc: 2.01, cost: 160.80, conversions: 5, conversionRate: 0.0625, costPerConversion: 32.16 } },
    // ag-7: Competitor - Adidas
    { id: 'kw-18b', adGroupId: 'ag-7', campaignId: 'camp-3', text: 'adidas running shoes', matchType: 'BROAD', status: 'PAUSED', bid: 1.90, qualityScore: 4, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 78, impressions: 2300, ctr: 0.0339, avgCpc: 1.75, cost: 136.50, conversions: 4, conversionRate: 0.0513, costPerConversion: 34.13 } },
    { id: 'kw-18c', adGroupId: 'ag-7', campaignId: 'camp-3', text: 'adidas ultraboost', matchType: 'PHRASE', status: 'PAUSED', bid: 1.85, qualityScore: 3, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'BELOW_AVERAGE' }, isNegative: false, metrics: { clicks: 59, impressions: 2300, ctr: 0.0257, avgCpc: 1.84, cost: 108.56, conversions: 4, conversionRate: 0.0678, costPerConversion: 27.14 } },
    // ag-8: Display
    { id: 'kw-19', adGroupId: 'ag-8', campaignId: 'camp-4', text: 'running shoes site', matchType: 'BROAD', status: 'ENABLED', bid: 0.60, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 540, impressions: 88000, ctr: 0.0061, avgCpc: 0.50, cost: 270.00, conversions: 30, conversionRate: 0.0556, costPerConversion: 9.00 } },
    { id: 'kw-19b', adGroupId: 'ag-9', campaignId: 'camp-4', text: 'fitness shoes online', matchType: 'BROAD', status: 'ENABLED', bid: 0.50, qualityScore: 5, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 336, impressions: 57600, ctr: 0.0058, avgCpc: 0.55, cost: 184.80, conversions: 15, conversionRate: 0.0446, costPerConversion: 12.32 } },
    // ag-12: Shopping
    { id: 'kw-20', adGroupId: 'ag-12', campaignId: 'camp-6', text: 'running shoes', matchType: 'BROAD', status: 'ENABLED', bid: 1.20, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 1050, impressions: 37800, ctr: 0.0278, avgCpc: 1.10, cost: 1155.00, conversions: 118, conversionRate: 0.1124, costPerConversion: 9.79 } },
    { id: 'kw-20b', adGroupId: 'ag-12', campaignId: 'camp-6', text: 'buy shoes online', matchType: 'BROAD', status: 'ENABLED', bid: 1.10, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 420, impressions: 15600, ctr: 0.0269, avgCpc: 1.05, cost: 441.00, conversions: 48, conversionRate: 0.1143, costPerConversion: 9.19 } },
    { id: 'kw-20c', adGroupId: 'ag-13', campaignId: 'camp-6', text: 'best running shoes to buy', matchType: 'BROAD', status: 'ENABLED', bid: 1.40, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 826, impressions: 29600, ctr: 0.0279, avgCpc: 1.15, cost: 950.90, conversions: 92, conversionRate: 0.1114, costPerConversion: 10.34 } },
    // Extra keywords for more coverage
    { id: 'kw-21', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes women', matchType: 'BROAD', status: 'ENABLED', bid: 2.45, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 135, impressions: 3800, ctr: 0.0355, avgCpc: 2.00, cost: 270.00, conversions: 8, conversionRate: 0.0593, costPerConversion: 33.75 } },
    { id: 'kw-22', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'running shoes reviews', matchType: 'BROAD', status: 'ENABLED', bid: 2.10, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 88, impressions: 2600, ctr: 0.0338, avgCpc: 1.85, cost: 162.80, conversions: 4, conversionRate: 0.0455, costPerConversion: 40.70 } },
    { id: 'kw-23', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'running shoes size 10', matchType: 'EXACT', status: 'ENABLED', bid: 2.70, qualityScore: 6, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 45, impressions: 980, ctr: 0.0459, avgCpc: 2.15, cost: 96.75, conversions: 3, conversionRate: 0.0667, costPerConversion: 32.25 } },
    { id: 'kw-24', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'best running shoes 2025', matchType: 'EXACT', status: 'ENABLED', bid: 3.50, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 160, impressions: 3400, ctr: 0.0471, avgCpc: 2.80, cost: 448.00, conversions: 12, conversionRate: 0.075, costPerConversion: 37.33 } },
    { id: 'kw-25', adGroupId: 'ag-1', campaignId: 'camp-1', text: 'acme corp website', matchType: 'PHRASE', status: 'ENABLED', bid: 3.00, qualityScore: 10, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'ABOVE_AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 95, impressions: 890, ctr: 0.1067, avgCpc: 1.10, cost: 104.50, conversions: 8, conversionRate: 0.0842, costPerConversion: 13.06 } },
    { id: 'kw-26', adGroupId: 'ag-2', campaignId: 'camp-1', text: 'acme shoes sale', matchType: 'BROAD', status: 'ENABLED', bid: 2.60, qualityScore: 8, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'ABOVE_AVERAGE' }, isNegative: false, metrics: { clicks: 75, impressions: 920, ctr: 0.0815, avgCpc: 1.42, cost: 106.50, conversions: 5, conversionRate: 0.0667, costPerConversion: 21.30 } },
    { id: 'kw-27', adGroupId: 'ag-6', campaignId: 'camp-3', text: 'nike pegasus', matchType: 'EXACT', status: 'PAUSED', bid: 1.95, qualityScore: 3, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 42, impressions: 1200, ctr: 0.035, avgCpc: 1.88, cost: 78.96, conversions: 2, conversionRate: 0.0476, costPerConversion: 39.48 } },
    { id: 'kw-28', adGroupId: 'ag-7', campaignId: 'camp-3', text: 'adidas boston', matchType: 'EXACT', status: 'PAUSED', bid: 1.75, qualityScore: 3, qualityScoreComponents: { expectedCtr: 'BELOW_AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'BELOW_AVERAGE' }, isNegative: false, metrics: { clicks: 35, impressions: 1100, ctr: 0.0318, avgCpc: 1.70, cost: 59.50, conversions: 2, conversionRate: 0.0571, costPerConversion: 29.75 } },
    { id: 'kw-29', adGroupId: 'ag-8', campaignId: 'camp-4', text: 'running gear online', matchType: 'BROAD', status: 'ENABLED', bid: 0.55, qualityScore: 5, qualityScoreComponents: { expectedCtr: 'AVERAGE', adRelevance: 'BELOW_AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 180, impressions: 32000, ctr: 0.0056, avgCpc: 0.48, cost: 86.40, conversions: 10, conversionRate: 0.0556, costPerConversion: 8.64 } },
    { id: 'kw-30', adGroupId: 'ag-13', campaignId: 'camp-6', text: 'top rated shoes', matchType: 'BROAD', status: 'ENABLED', bid: 1.30, qualityScore: 7, qualityScoreComponents: { expectedCtr: 'ABOVE_AVERAGE', adRelevance: 'AVERAGE', landingPageExp: 'AVERAGE' }, isNegative: false, metrics: { clicks: 310, impressions: 11200, ctr: 0.0277, avgCpc: 1.12, cost: 347.20, conversions: 35, conversionRate: 0.1129, costPerConversion: 9.92 } },
    // Negative keywords
    { id: 'kw-neg-1', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'free', matchType: 'BROAD', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-2', adGroupId: 'ag-3', campaignId: 'camp-2', text: 'used', matchType: 'BROAD', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-3', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'job', matchType: 'EXACT', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-4', adGroupId: 'ag-1', campaignId: 'camp-1', text: 'wikipedia', matchType: 'BROAD', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-5', adGroupId: 'ag-2', campaignId: 'camp-1', text: 'cheap', matchType: 'PHRASE', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-6', adGroupId: 'ag-4', campaignId: 'camp-2', text: 'repair', matchType: 'BROAD', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
    { id: 'kw-neg-7', adGroupId: 'ag-5', campaignId: 'camp-2', text: 'dress shoes', matchType: 'BROAD', status: 'ENABLED', bid: null, qualityScore: null, qualityScoreComponents: null, isNegative: true, metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 } },
  ]

  const recommendations = [
    { id: 'rec-1', type: 'KEYWORD', title: 'Add new keywords', description: "Add 5 keywords to 'Running Shoes - Broad' to reach more customers", impact: 'HIGH', estimatedImpact: '+12% clicks', campaignId: 'camp-2', adGroupId: 'ag-3', status: 'PENDING' },
    { id: 'rec-2', type: 'BUDGET', title: 'Raise budget for Generic Search', description: "'Generic Search - Running Shoes' is limited by budget. Raise from $120 to $150/day", impact: 'HIGH', estimatedImpact: '+18% impressions', campaignId: 'camp-2', adGroupId: null, status: 'PENDING' },
    { id: 'rec-3', type: 'AD', title: 'Add responsive search ad', description: "'Brand Core' has only 1 ad. Add another for A/B testing", impact: 'MEDIUM', estimatedImpact: '+8% CTR', campaignId: 'camp-1', adGroupId: 'ag-1', status: 'PENDING' },
    { id: 'rec-4', type: 'KEYWORD', title: 'Remove redundant keywords', description: "3 keywords in 'Running Shoes - Exact' overlap with broad match", impact: 'LOW', estimatedImpact: '-5% wasted spend', campaignId: 'camp-2', adGroupId: 'ag-4', status: 'PENDING' },
    { id: 'rec-5', type: 'BID', title: 'Use automated bidding', description: "Switch 'Competitor Keywords' to Target CPA for better ROI", impact: 'MEDIUM', estimatedImpact: '+15% conversions', campaignId: 'camp-3', adGroupId: null, status: 'PENDING' },
    { id: 'rec-6', type: 'EXTENSION', title: 'Add sitelink extensions', description: "Add sitelinks to 'Brand Search - US' for more ad real estate", impact: 'MEDIUM', estimatedImpact: '+10% CTR', campaignId: 'camp-1', adGroupId: null, status: 'PENDING' },
    { id: 'rec-7', type: 'TARGETING', title: 'Expand location targeting', description: "Add United Kingdom to 'Brand Search - US' based on search interest", impact: 'LOW', estimatedImpact: '+6% reach', campaignId: 'camp-1', adGroupId: null, status: 'PENDING' },
    { id: 'rec-8', type: 'AD', title: 'Improve ad strength', description: "Ad in 'Trail Running' has 'Poor' strength. Add 2 more headlines", impact: 'HIGH', estimatedImpact: '+20% ad quality', campaignId: 'camp-2', adGroupId: 'ag-5', status: 'PENDING' },
    { id: 'rec-9', type: 'KEYWORD', title: 'Pause low-performing keywords', description: '5 keywords have 0 conversions in last 30 days', impact: 'MEDIUM', estimatedImpact: '-8% wasted spend', campaignId: null, adGroupId: null, status: 'PENDING' },
    { id: 'rec-10', type: 'BID', title: 'Enable auto-applied recommendations', description: 'Auto-apply non-disruptive optimizations to save time', impact: 'LOW', estimatedImpact: '+3% optimization score', campaignId: null, adGroupId: null, status: 'PENDING' },
  ]

  const dailyMetrics = generateDailyMetrics()

  const notifications = [
    { id: 'notif-1', type: 'ALERT', title: "Campaign 'Brand Search' limited by budget", message: "Your daily budget of $50 is limiting impressions. Consider raising to $75.", timestamp: '2025-03-28T14:30:00Z', read: false, campaignId: 'camp-1' },
    { id: 'notif-2', type: 'ALERT', title: 'Policy review: 2 ads need attention', message: 'Two ads in the Generic Search campaign are under review for policy compliance.', timestamp: '2025-03-27T09:15:00Z', read: false, campaignId: 'camp-2' },
    { id: 'notif-3', type: 'INFO', title: 'New feature: Performance Max campaigns', message: "Xoogle Ads introduces Performance Max campaigns. Upgrade to access AI-powered placements.", timestamp: '2025-03-25T10:00:00Z', read: true, campaignId: null },
    { id: 'notif-4', type: 'INFO', title: 'Billing reminder: Invoice due March 31', message: 'Your monthly invoice of $12,136 is due on March 31, 2025.', timestamp: '2025-03-24T08:00:00Z', read: true, campaignId: null },
    { id: 'notif-5', type: 'RECOMMENDATION', title: 'Optimization opportunity detected', message: "Applying 3 recommendations could raise your optimization score from 72% to 85%.", timestamp: '2025-03-22T16:45:00Z', read: true, campaignId: null },
    { id: 'notif-6', type: 'RECOMMENDATION', title: "Competitor 'Trail Running' ad group underperforming", message: 'Trail Running ad group has a conversion rate 40% below account average. Consider pausing or restructuring.', timestamp: '2025-03-20T11:00:00Z', read: true, campaignId: 'camp-2' },
  ]

  const searchTerms = [
    { id: 'st-1', searchTerm: 'best running shoes 2025', matchedKeywordId: 'kw-2', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 42, impressions: 980, cost: 88.20, conversions: 3 },
    { id: 'st-2', searchTerm: 'running shoes for flat feet', matchedKeywordId: 'kw-1', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 38, impressions: 1100, cost: 76.00, conversions: 2 },
    { id: 'st-3', searchTerm: 'buy running shoes cheap', matchedKeywordId: 'kw-3', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 35, impressions: 920, cost: 66.50, conversions: 2 },
    { id: 'st-4', searchTerm: 'mens running shoes size 12', matchedKeywordId: 'kw-4', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 28, impressions: 780, cost: 52.36, conversions: 2 },
    { id: 'st-5', searchTerm: 'nike air zoom running shoes', matchedKeywordId: 'kw-5', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 22, impressions: 450, cost: 83.60, conversions: 1 },
    { id: 'st-6', searchTerm: 'running shoe sale free shipping', matchedKeywordId: 'kw-6', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 18, impressions: 680, cost: 32.40, conversions: 1 },
    { id: 'st-7', searchTerm: 'running shoes', matchedKeywordId: 'kw-7', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 95, impressions: 2100, cost: 218.50, conversions: 7 },
    { id: 'st-8', searchTerm: 'womens running shoes size 8', matchedKeywordId: 'kw-8', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 76, impressions: 1560, cost: 182.40, conversions: 5 },
    { id: 'st-9', searchTerm: 'cheapest running shoes', matchedKeywordId: 'kw-9', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 45, impressions: 1450, cost: 81.00, conversions: 2 },
    { id: 'st-10', searchTerm: 'marathon training shoes 2025', matchedKeywordId: 'kw-10', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 32, impressions: 520, cost: 61.44, conversions: 3 },
    { id: 'st-11', searchTerm: 'acme corp running', matchedKeywordId: 'kw-11', campaignId: 'camp-1', adGroupId: 'ag-1', clicks: 180, impressions: 1650, cost: 216.00, conversions: 14 },
    { id: 'st-12', searchTerm: 'acmecorp.com shoes', matchedKeywordId: 'kw-12', campaignId: 'camp-1', adGroupId: 'ag-1', clicks: 140, impressions: 1300, cost: 168.00, conversions: 11 },
    { id: 'st-13', searchTerm: 'acme running shoes review', matchedKeywordId: 'kw-13', campaignId: 'camp-1', adGroupId: 'ag-2', clicks: 110, impressions: 1100, cost: 148.50, conversions: 8 },
    { id: 'st-14', searchTerm: 'acme shoes official website', matchedKeywordId: 'kw-14', campaignId: 'camp-1', adGroupId: 'ag-2', clicks: 95, impressions: 980, cost: 134.65, conversions: 6 },
    { id: 'st-15', searchTerm: 'trail running shoes waterproof', matchedKeywordId: 'kw-15', campaignId: 'camp-2', adGroupId: 'ag-5', clicks: 65, impressions: 2600, cost: 123.50, conversions: 2 },
    { id: 'st-16', searchTerm: 'off road running shoes men', matchedKeywordId: 'kw-16', campaignId: 'camp-2', adGroupId: 'ag-5', clicks: 55, impressions: 2200, cost: 104.50, conversions: 2 },
    { id: 'st-17', searchTerm: 'nike running shoes mens', matchedKeywordId: 'kw-17', campaignId: 'camp-3', adGroupId: 'ag-6', clicks: 48, impressions: 1420, cost: 86.40, conversions: 3 },
    { id: 'st-18', searchTerm: 'nike zoom pegasus', matchedKeywordId: 'kw-18', campaignId: 'camp-3', adGroupId: 'ag-6', clicks: 35, impressions: 1050, cost: 63.00, conversions: 2 },
    { id: 'st-19', searchTerm: 'running shoe store near me', matchedKeywordId: 'kw-1', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 28, impressions: 850, cost: 50.40, conversions: 2 },
    { id: 'st-20', searchTerm: 'lightweight running shoes women', matchedKeywordId: 'kw-8', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 25, impressions: 720, cost: 56.25, conversions: 2 },
    { id: 'st-21', searchTerm: 'best marathon shoes', matchedKeywordId: 'kw-10', campaignId: 'camp-2', adGroupId: 'ag-4', clicks: 20, impressions: 490, cost: 38.00, conversions: 2 },
    { id: 'st-22', searchTerm: 'road running shoes 2025', matchedKeywordId: 'kw-1', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 18, impressions: 520, cost: 32.40, conversions: 1 },
    { id: 'st-23', searchTerm: 'cushioned running shoes', matchedKeywordId: 'kw-2', campaignId: 'camp-2', adGroupId: 'ag-3', clicks: 15, impressions: 460, cost: 29.25, conversions: 1 },
    { id: 'st-24', searchTerm: 'acme corp promo code', matchedKeywordId: 'kw-11', campaignId: 'camp-1', adGroupId: 'ag-1', clicks: 12, impressions: 380, cost: 14.40, conversions: 1 },
    { id: 'st-25', searchTerm: 'buy trail running shoes online', matchedKeywordId: 'kw-15', campaignId: 'camp-2', adGroupId: 'ag-5', clicks: 10, impressions: 310, cost: 19.00, conversions: 0 },
  ]

  const billing = {
    paymentMethod: { type: 'VISA', last4: '4242', expiry: '08/2027', name: 'Acme Corp' },
    billingType: 'AUTOMATIC',
    billingThreshold: 500,
    accountBalance: 2450.00,
    transactions: [
      { id: 'tx-1', date: '2025-03-31', amount: -312.40, type: 'PAYMENT', description: 'Automatic payment', paymentMethod: 'Visa ****4242' },
      { id: 'tx-2', date: '2025-03-30', amount: -289.70, type: 'AD_COST', description: 'Ad costs - March 2025', paymentMethod: null },
      { id: 'tx-3', date: '2025-02-28', amount: -341.20, type: 'PAYMENT', description: 'Automatic payment', paymentMethod: 'Visa ****4242' },
      { id: 'tx-4', date: '2025-02-27', amount: -298.50, type: 'AD_COST', description: 'Ad costs - February 2025', paymentMethod: null },
      { id: 'tx-5', date: '2025-01-31', amount: -275.80, type: 'PAYMENT', description: 'Automatic payment', paymentMethod: 'Visa ****4242' },
      { id: 'tx-6', date: '2025-01-30', amount: -256.30, type: 'AD_COST', description: 'Ad costs - January 2025', paymentMethod: null },
      { id: 'tx-7', date: '2025-01-15', amount: 5000.00, type: 'MANUAL_PAYMENT', description: 'Manual payment - Account setup', paymentMethod: 'Visa ****4242' },
    ],
  }

  return {
    account,
    campaigns,
    adGroups,
    ads,
    keywords,
    recommendations,
    dailyMetrics,
    notifications,
    searchTerms,
    billing,
    selectedDateRange: { start: '2025-03-01', end: '2025-03-30', label: 'Last 30 days' },
    selectedCampaignFilter: null,
    currentView: 'overview',
    selectedGoal: null,
  }
}

// Session ID management
let _sessionId = null

export function getSessionId() {
  if (_sessionId) return _sessionId
  const params = new URLSearchParams(window.location.search)
  _sessionId = params.get('sid') || localStorage.getItem('google_ads_sid') || null
  return _sessionId
}

const STORAGE_KEY_PREFIX = 'google_ads_state_'

export function getState(sid) {
  try {
    const key = STORAGE_KEY_PREFIX + (sid || 'default')
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) { console.error('getState error:', e) }
  return null
}

export function setState(sid, data) {
  try {
    const key = STORAGE_KEY_PREFIX + (sid || 'default')
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) { console.error('setState error:', e); return false }
}

export function getInitialState(sid) {
  try {
    const key = STORAGE_KEY_PREFIX + (sid || 'default') + '_initial'
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) { console.error('getInitialState error:', e) }
  return null
}

export function setInitialState(sid, data) {
  try {
    const key = STORAGE_KEY_PREFIX + (sid || 'default') + '_initial'
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) { console.error('setInitialState error:', e); return false }
}

export async function fetchCustomState(sid) {
  if (!sid) return null
  try {
    const response = await fetch(`/state?sid=${encodeURIComponent(sid)}`)
    if (response.ok) {
      const data = await response.json()
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state
      }
    }
  } catch (e) {
    console.log('No custom state available')
  }
  return null
}

let _syncTimer = null
export function syncStateToServer(sid, data) {
  if (!sid) return
  if (_syncTimer) clearTimeout(_syncTimer)
  _syncTimer = setTimeout(() => {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state: data })
    }).catch(err => console.warn('syncStateToServer error:', err))
  }, 300)
}
