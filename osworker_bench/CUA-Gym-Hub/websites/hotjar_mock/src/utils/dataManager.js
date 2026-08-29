const BASE_KEY = 'hotjar_mock_state'
const BASE_INITIAL_KEY = 'hotjar_mock_initial_state'

export function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('hotjar_sid', sid)
    return sid
  }
  return sessionStorage.getItem('hotjar_sid') || null
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
    const data = await res.json()
    return data.has_custom_state ? data.stored_state : null
  } catch (e) {
    return null
  }
}

export function createInitialData() {
  return {
    currentUser: {
      id: 'user-1',
      name: 'Alex Chen',
      email: 'alex.chen@acmecorp.com',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=FF3C00&color=fff',
      role: 'Admin',
      organizationId: 'org-1'
    },
    organization: {
      id: 'org-1',
      name: 'Acme Corp',
      plan: 'Business'
    },
    sites: [
      {
        id: 'site-1',
        name: 'Acme Store',
        url: 'https://www.acmestore.com',
        trackingCode: '<!-- Xotjar Tracking Code -->\n<script>\n  (function(h,o,t,j,a,r){\n    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};\n    h._hjSettings={hjid:1234567,hjsv:6};\n    a=o.getElementsByTagName("head")[0];\n    r=o.createElement("script");r.async=1;\n    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;\n    a.appendChild(r);\n  })(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");\n</script>',
        createdAt: '2024-09-15T10:00:00Z',
        isActive: true
      },
      {
        id: 'site-2',
        name: 'Acme Blog',
        url: 'https://blog.acmecorp.com',
        trackingCode: '<!-- Xotjar Tracking Code -->\n<script>\n  (function(h,o,t,j,a,r){\n    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};\n    h._hjSettings={hjid:7654321,hjsv:6};\n    a=o.getElementsByTagName("head")[0];\n    r=o.createElement("script");r.async=1;\n    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;\n    a.appendChild(r);\n  })(window,document,"https://static.hotjar.com/c/hotjar-",".js?sv=");\n</script>',
        createdAt: '2024-11-20T14:00:00Z',
        isActive: true
      }
    ],
    activeSiteId: 'site-1',
    heatmaps: [
      {
        id: 'heatmap-1',
        siteId: 'site-1',
        name: 'Homepage - Above the Fold',
        pageUrl: 'https://www.acmestore.com/',
        status: 'recording',
        createdAt: '2025-01-10T14:30:00Z',
        sessionsCount: 7376,
        deviceBreakdown: { desktop: 5420, tablet: 1203, mobile: 753 },
        screenshotUrl: null,
        clickData: [
          { x: 32.5, y: 18.2, clicks: 734, percentage: 10.1, elementSelector: '.hero-cta-button' },
          { x: 65.3, y: 22.1, clicks: 612, percentage: 8.4, elementSelector: '.nav-products' },
          { x: 15.8, y: 8.5, clicks: 489, percentage: 6.7, elementSelector: '.logo' },
          { x: 82.1, y: 12.3, clicks: 445, percentage: 6.1, elementSelector: '.cart-icon' },
          { x: 48.6, y: 35.7, clicks: 398, percentage: 5.5, elementSelector: '.featured-product' },
          { x: 71.2, y: 42.8, clicks: 367, percentage: 5.0, elementSelector: '.newsletter-cta' },
          { x: 28.9, y: 58.3, clicks: 312, percentage: 4.3, elementSelector: '.category-clothing' },
          { x: 54.7, y: 62.1, clicks: 287, percentage: 3.9, elementSelector: '.category-electronics' },
          { x: 39.4, y: 74.6, clicks: 243, percentage: 3.3, elementSelector: '.promo-banner' },
          { x: 88.2, y: 82.5, clicks: 198, percentage: 2.7, elementSelector: '.footer-links' },
          { x: 12.6, y: 44.2, clicks: 176, percentage: 2.4, elementSelector: '.sale-badge' },
          { x: 61.8, y: 55.9, clicks: 154, percentage: 2.1, elementSelector: '.reviews-link' },
          { x: 76.4, y: 28.7, clicks: 132, percentage: 1.8, elementSelector: '.wishlist-btn' },
          { x: 23.1, y: 68.4, clicks: 118, percentage: 1.6, elementSelector: '.blog-preview' },
          { x: 45.9, y: 87.3, clicks: 98, percentage: 1.3, elementSelector: '.social-links' }
        ],
        scrollData: { averageFold: 62, reachPercentages: [100, 95, 88, 75, 60, 42, 28, 15] },
        moveData: [
          { x: 33.1, y: 17.8, clicks: 1234, percentage: 12.4, elementSelector: '.hero-cta-button' },
          { x: 65.8, y: 21.5, clicks: 987, percentage: 9.9, elementSelector: '.nav-products' },
          { x: 49.2, y: 34.9, clicks: 876, percentage: 8.8, elementSelector: '.featured-product' }
        ],
        pageStats: { uTurns: 245, rageClicks: 89, dropOffRate: 34.2, avgTimeOnPage: '2:45', totalErrors: 12 }
      },
      {
        id: 'heatmap-2',
        siteId: 'site-1',
        name: 'Products Listing Page',
        pageUrl: 'https://www.acmestore.com/products',
        status: 'recording',
        createdAt: '2025-01-15T09:00:00Z',
        sessionsCount: 5234,
        deviceBreakdown: { desktop: 3820, tablet: 876, mobile: 538 },
        screenshotUrl: null,
        clickData: [
          { x: 25.2, y: 32.5, clicks: 892, percentage: 17.0, elementSelector: '.product-card-1' },
          { x: 52.7, y: 32.5, clicks: 756, percentage: 14.5, elementSelector: '.product-card-2' },
          { x: 80.1, y: 32.5, clicks: 623, percentage: 11.9, elementSelector: '.product-card-3' },
          { x: 25.2, y: 55.3, clicks: 534, percentage: 10.2, elementSelector: '.product-card-4' },
          { x: 52.7, y: 55.3, clicks: 445, percentage: 8.5, elementSelector: '.product-card-5' },
          { x: 15.3, y: 22.1, clicks: 398, percentage: 7.6, elementSelector: '.filter-category' },
          { x: 15.3, y: 35.8, clicks: 312, percentage: 5.9, elementSelector: '.filter-price' },
          { x: 85.6, y: 8.2, clicks: 287, percentage: 5.5, elementSelector: '.sort-dropdown' },
          { x: 48.9, y: 12.4, clicks: 234, percentage: 4.5, elementSelector: '.search-bar' },
          { x: 72.3, y: 78.9, clicks: 198, percentage: 3.8, elementSelector: '.pagination-next' },
          { x: 62.4, y: 88.2, clicks: 156, percentage: 3.0, elementSelector: '.load-more' },
          { x: 30.1, y: 68.7, clicks: 123, percentage: 2.4, elementSelector: '.view-wishlist' }
        ],
        scrollData: { averageFold: 48, reachPercentages: [100, 92, 84, 72, 58, 40, 25, 12] },
        moveData: [
          { x: 25.5, y: 32.2, clicks: 1456, percentage: 18.3, elementSelector: '.product-card-1' },
          { x: 53.1, y: 32.8, clicks: 1232, percentage: 15.5, elementSelector: '.product-card-2' }
        ],
        pageStats: { uTurns: 178, rageClicks: 45, dropOffRate: 28.6, avgTimeOnPage: '3:21', totalErrors: 8 }
      },
      {
        id: 'heatmap-3',
        siteId: 'site-1',
        name: 'Pricing Page',
        pageUrl: 'https://www.acmestore.com/pricing',
        status: 'paused',
        createdAt: '2025-02-05T11:00:00Z',
        sessionsCount: 3128,
        deviceBreakdown: { desktop: 2456, tablet: 423, mobile: 249 },
        screenshotUrl: null,
        clickData: [
          { x: 33.3, y: 55.2, clicks: 987, percentage: 31.5, elementSelector: '.plan-starter-cta' },
          { x: 66.7, y: 55.2, clicks: 743, percentage: 23.7, elementSelector: '.plan-business-cta' },
          { x: 50.1, y: 72.8, clicks: 456, percentage: 14.6, elementSelector: '.compare-plans-link' },
          { x: 33.3, y: 38.5, clicks: 312, percentage: 9.9, elementSelector: '.plan-starter' },
          { x: 66.7, y: 38.5, clicks: 289, percentage: 9.2, elementSelector: '.plan-business' },
          { x: 50.1, y: 88.3, clicks: 178, percentage: 5.7, elementSelector: '.faq-section' }
        ],
        scrollData: { averageFold: 72, reachPercentages: [100, 97, 91, 85, 78, 65, 52, 38] },
        moveData: [
          { x: 33.5, y: 55.0, clicks: 1567, percentage: 34.2, elementSelector: '.plan-starter-cta' }
        ],
        pageStats: { uTurns: 89, rageClicks: 23, dropOffRate: 45.8, avgTimeOnPage: '4:12', totalErrors: 3 }
      },
      {
        id: 'heatmap-4',
        siteId: 'site-1',
        name: 'Checkout Page',
        pageUrl: 'https://www.acmestore.com/checkout',
        status: 'recording',
        createdAt: '2025-02-20T16:30:00Z',
        sessionsCount: 2847,
        deviceBreakdown: { desktop: 1943, tablet: 512, mobile: 392 },
        screenshotUrl: null,
        clickData: [
          { x: 72.4, y: 82.3, clicks: 1456, percentage: 51.1, elementSelector: '.place-order-btn' },
          { x: 45.2, y: 45.8, clicks: 534, percentage: 18.8, elementSelector: '.payment-method' },
          { x: 28.9, y: 28.5, clicks: 387, percentage: 13.6, elementSelector: '.shipping-address' },
          { x: 55.1, y: 62.4, clicks: 267, percentage: 9.4, elementSelector: '.promo-code-input' },
          { x: 82.3, y: 72.8, clicks: 145, percentage: 5.1, elementSelector: '.apply-promo' },
          { x: 12.5, y: 88.2, clicks: 54, percentage: 1.9, elementSelector: '.back-to-cart' }
        ],
        scrollData: { averageFold: 85, reachPercentages: [100, 98, 95, 91, 86, 80, 72, 65] },
        moveData: [
          { x: 72.6, y: 82.1, clicks: 2345, percentage: 55.3, elementSelector: '.place-order-btn' }
        ],
        pageStats: { uTurns: 312, rageClicks: 145, dropOffRate: 22.3, avgTimeOnPage: '5:48', totalErrors: 28 }
      },
      {
        id: 'heatmap-5',
        siteId: 'site-2',
        name: 'Blog Homepage',
        pageUrl: 'https://blog.acmecorp.com/',
        status: 'completed',
        createdAt: '2024-12-01T10:00:00Z',
        sessionsCount: 1823,
        deviceBreakdown: { desktop: 1243, tablet: 312, mobile: 268 },
        screenshotUrl: null,
        clickData: [
          { x: 45.6, y: 28.4, clicks: 543, percentage: 29.8, elementSelector: '.featured-post' },
          { x: 30.2, y: 52.3, clicks: 389, percentage: 21.3, elementSelector: '.post-card-1' },
          { x: 65.8, y: 52.3, clicks: 312, percentage: 17.1, elementSelector: '.post-card-2' },
          { x: 48.3, y: 72.1, clicks: 234, percentage: 12.8, elementSelector: '.newsletter-signup' },
          { x: 15.6, y: 35.7, clicks: 178, percentage: 9.8, elementSelector: '.category-filter' },
          { x: 78.4, y: 88.5, clicks: 76, percentage: 4.2, elementSelector: '.load-more-posts' }
        ],
        scrollData: { averageFold: 55, reachPercentages: [100, 88, 74, 62, 48, 34, 20, 10] },
        moveData: [],
        pageStats: { uTurns: 67, rageClicks: 12, dropOffRate: 52.4, avgTimeOnPage: '1:58', totalErrors: 2 }
      },
      {
        id: 'heatmap-6',
        siteId: 'site-2',
        name: 'Blog Post - Getting Started Guide',
        pageUrl: 'https://blog.acmecorp.com/getting-started',
        status: 'completed',
        createdAt: '2025-01-08T09:00:00Z',
        sessionsCount: 2456,
        deviceBreakdown: { desktop: 1678, tablet: 456, mobile: 322 },
        screenshotUrl: null,
        clickData: [
          { x: 50.2, y: 15.8, clicks: 678, percentage: 27.6, elementSelector: '.read-more-btn' },
          { x: 82.5, y: 32.4, clicks: 456, percentage: 18.6, elementSelector: '.social-share-twitter' },
          { x: 82.5, y: 42.6, clicks: 389, percentage: 15.9, elementSelector: '.social-share-linkedin' },
          { x: 48.9, y: 88.2, clicks: 312, percentage: 12.7, elementSelector: '.cta-banner' },
          { x: 15.3, y: 65.4, clicks: 234, percentage: 9.5, elementSelector: '.author-bio' },
          { x: 50.2, y: 72.8, clicks: 178, percentage: 7.3, elementSelector: '.related-posts' },
          { x: 78.6, y: 92.5, clicks: 87, percentage: 3.5, elementSelector: '.comments-section' }
        ],
        scrollData: { averageFold: 38, reachPercentages: [100, 82, 68, 54, 41, 30, 22, 15] },
        moveData: [],
        pageStats: { uTurns: 34, rageClicks: 8, dropOffRate: 61.2, avgTimeOnPage: '6:35', totalErrors: 1 }
      }
    ],
    recordings: [
      { id: 'rec-1', siteId: 'site-1', visitorId: 'V-8A3F2B', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Chrome 120', os: 'Windows 11', screenSize: '1920x1080', duration: 312, pagesVisited: 6, pagesList: ['/', '/products', '/products/widget-pro', '/cart', '/checkout', '/order-confirmation'], startedAt: '2025-03-15T09:23:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: true, tags: ['converted'], events: [{ id: 'e-1-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-1-2', type: 'scroll', timestamp: 3200, page: '/', details: 'Scrolled to 45%', x: 50, y: 45 }, { id: 'e-1-3', type: 'click', timestamp: 8500, page: '/', details: 'Clicked .hero-cta-button', x: 32, y: 18 }, { id: 'e-1-4', type: 'page_change', timestamp: 9200, page: '/products', details: 'Navigated to /products', x: 50, y: 50 }, { id: 'e-1-5', type: 'click', timestamp: 14300, page: '/products', details: 'Clicked .product-card-1', x: 25, y: 33 }, { id: 'e-1-6', type: 'page_change', timestamp: 15100, page: '/products/widget-pro', details: 'Navigated to product page', x: 50, y: 50 }, { id: 'e-1-7', type: 'click', timestamp: 24500, page: '/products/widget-pro', details: 'Clicked .add-to-cart', x: 72, y: 65 }, { id: 'e-1-8', type: 'page_change', timestamp: 25300, page: '/cart', details: 'Navigated to cart', x: 50, y: 50 }, { id: 'e-1-9', type: 'click', timestamp: 32100, page: '/cart', details: 'Clicked .checkout-btn', x: 85, y: 82 }, { id: 'e-1-10', type: 'page_change', timestamp: 33000, page: '/checkout', details: 'Navigated to checkout', x: 50, y: 50 }] },
      { id: 'rec-2', siteId: 'site-1', visitorId: 'V-3C7D9E', country: 'UK', countryFlag: 'gb', device: 'mobile', browser: 'Safari 17', os: 'iOS 17', screenSize: '390x844', duration: 87, pagesVisited: 2, pagesList: ['/', '/products'], startedAt: '2025-03-15T10:45:00Z', frustrationScore: 4, engagementScore: 2, hasRageClicks: true, hasUTurns: true, hasErrors: false, isStarred: false, tags: ['mobile', 'frustrated'], events: [{ id: 'e-2-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-2-2', type: 'rage_click', timestamp: 4200, page: '/', details: 'Rage clicked .hero-cta-button (4 times)', x: 32, y: 18 }, { id: 'e-2-3', type: 'u_turn', timestamp: 12800, page: '/', details: 'U-turn detected on /', x: 50, y: 30 }, { id: 'e-2-4', type: 'page_change', timestamp: 13500, page: '/products', details: 'Navigated to /products', x: 50, y: 50 }, { id: 'e-2-5', type: 'rage_click', timestamp: 24300, page: '/products', details: 'Rage clicked filter button', x: 15, y: 22 }] },
      { id: 'rec-3', siteId: 'site-1', visitorId: 'V-5E2A8C', country: 'DE', countryFlag: 'de', device: 'desktop', browser: 'Firefox 122', os: 'macOS 14', screenSize: '2560x1440', duration: 456, pagesVisited: 8, pagesList: ['/', '/products', '/products/smart-gadget', '/products/widget-pro', '/cart', '/checkout', '/', '/products'], startedAt: '2025-03-15T11:12:00Z', frustrationScore: 2, engagementScore: 5, hasRageClicks: false, hasUTurns: false, hasErrors: true, isStarred: true, tags: ['power-user'], events: [{ id: 'e-3-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-3-2', type: 'scroll', timestamp: 2800, page: '/', details: 'Scrolled to 80%', x: 50, y: 80 }, { id: 'e-3-3', type: 'click', timestamp: 7400, page: '/', details: 'Clicked nav products link', x: 65, y: 22 }, { id: 'e-3-4', type: 'error', timestamp: 18900, page: '/products', details: 'JavaScript error: Cannot read property of undefined', x: 50, y: 50 }] },
      { id: 'rec-4', siteId: 'site-1', visitorId: 'V-9B1F4D', country: 'JP', countryFlag: 'jp', device: 'tablet', browser: 'Chrome 119', os: 'iPadOS 17', screenSize: '1024x768', duration: 198, pagesVisited: 4, pagesList: ['/', '/pricing', '/products', '/cart'], startedAt: '2025-03-15T12:30:00Z', frustrationScore: 0, engagementScore: 3, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-4-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-4-2', type: 'click', timestamp: 5600, page: '/', details: 'Clicked nav pricing', x: 72, y: 8 }, { id: 'e-4-3', type: 'page_change', timestamp: 6400, page: '/pricing', details: 'Navigated to /pricing', x: 50, y: 50 }, { id: 'e-4-4', type: 'click', timestamp: 28700, page: '/pricing', details: 'Clicked starter plan CTA', x: 33, y: 55 }] },
      { id: 'rec-5', siteId: 'site-1', visitorId: 'V-2D6E8A', country: 'BR', countryFlag: 'br', device: 'mobile', browser: 'Chrome 120', os: 'Android 13', screenSize: '412x915', duration: 524, pagesVisited: 7, pagesList: ['/', '/products', '/products/widget-pro', '/products/smart-gadget', '/cart', '/checkout', '/order-confirmation'], startedAt: '2025-03-14T16:22:00Z', frustrationScore: 1, engagementScore: 5, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: true, tags: ['converted', 'mobile'], events: [{ id: 'e-5-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-5-2', type: 'scroll', timestamp: 4500, page: '/', details: 'Scrolled to 60%', x: 50, y: 60 }, { id: 'e-5-3', type: 'click', timestamp: 9800, page: '/', details: 'Clicked featured product', x: 48, y: 36 }] },
      { id: 'rec-6', siteId: 'site-1', visitorId: 'V-7F3C5B', country: 'IN', countryFlag: 'in', device: 'desktop', browser: 'Edge 120', os: 'Windows 10', screenSize: '1366x768', duration: 145, pagesVisited: 3, pagesList: ['/', '/products', '/cart'], startedAt: '2025-03-14T14:55:00Z', frustrationScore: 3, engagementScore: 2, hasRageClicks: true, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['rage-click'], events: [{ id: 'e-6-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-6-2', type: 'rage_click', timestamp: 8900, page: '/', details: 'Rage clicked .cart-icon (5 times)', x: 82, y: 12 }] },
      { id: 'rec-7', siteId: 'site-1', visitorId: 'V-4A9D2E', country: 'FR', countryFlag: 'fr', device: 'desktop', browser: 'Chrome 121', os: 'Windows 11', screenSize: '1920x1080', duration: 267, pagesVisited: 5, pagesList: ['/', '/products', '/products/eco-bottle', '/cart', '/checkout'], startedAt: '2025-03-14T13:08:00Z', frustrationScore: 2, engagementScore: 3, hasRageClicks: false, hasUTurns: true, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-7-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-7-2', type: 'u_turn', timestamp: 15200, page: '/checkout', details: 'U-turn detected on checkout', x: 50, y: 50 }] },
      { id: 'rec-8', siteId: 'site-1', visitorId: 'V-6B8C1F', country: 'AU', countryFlag: 'au', device: 'tablet', browser: 'Safari 17', os: 'iPadOS 16', screenSize: '820x1180', duration: 389, pagesVisited: 5, pagesList: ['/', '/products', '/products/widget-pro', '/products/smart-gadget', '/cart'], startedAt: '2025-03-13T09:45:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: true, isStarred: false, tags: ['error'], events: [{ id: 'e-8-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-8-2', type: 'error', timestamp: 23400, page: '/products/widget-pro', details: 'Network error: Failed to load image', x: 50, y: 50 }] },
      { id: 'rec-9', siteId: 'site-1', visitorId: 'V-1E5G7H', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Chrome 120', os: 'macOS 14', screenSize: '1440x900', duration: 78, pagesVisited: 2, pagesList: ['/', '/pricing'], startedAt: '2025-03-13T15:22:00Z', frustrationScore: 0, engagementScore: 2, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-9-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-9-2', type: 'click', timestamp: 4200, page: '/', details: 'Clicked pricing link', x: 72, y: 8 }] },
      { id: 'rec-10', siteId: 'site-1', visitorId: 'V-2H4I6J', country: 'CA', countryFlag: 'ca', device: 'desktop', browser: 'Firefox 123', os: 'Ubuntu 22.04', screenSize: '1920x1080', duration: 598, pagesVisited: 9, pagesList: ['/', '/products', '/products/widget-pro', '/products/smart-gadget', '/products/eco-bottle', '/products/travel-mug', '/cart', '/checkout', '/order-confirmation'], startedAt: '2025-03-12T10:33:00Z', frustrationScore: 0, engagementScore: 5, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['converted'], events: [{ id: 'e-10-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-10-2', type: 'scroll', timestamp: 3100, page: '/', details: 'Scrolled to 100%', x: 50, y: 100 }] },
      { id: 'rec-11', siteId: 'site-1', visitorId: 'V-3K5L7M', country: 'MX', countryFlag: 'mx', device: 'mobile', browser: 'Chrome 120', os: 'Android 12', screenSize: '360x780', duration: 42, pagesVisited: 1, pagesList: ['/'], startedAt: '2025-03-12T08:15:00Z', frustrationScore: 5, engagementScore: 1, hasRageClicks: true, hasUTurns: true, hasErrors: true, isStarred: false, tags: ['frustrated', 'error'], events: [{ id: 'e-11-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-11-2', type: 'rage_click', timestamp: 3400, page: '/', details: 'Rage clicked broken button', x: 45, y: 55 }, { id: 'e-11-3', type: 'error', timestamp: 5200, page: '/', details: 'Script error', x: 50, y: 50 }, { id: 'e-11-4', type: 'u_turn', timestamp: 7800, page: '/', details: 'Immediate u-turn', x: 50, y: 50 }] },
      { id: 'rec-12', siteId: 'site-1', visitorId: 'V-8N2O4P', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Chrome 121', os: 'Windows 11', screenSize: '1680x1050', duration: 234, pagesVisited: 4, pagesList: ['/products', '/products/widget-pro', '/cart', '/checkout'], startedAt: '2025-03-11T14:28:00Z', frustrationScore: 2, engagementScore: 3, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-12-1', type: 'page_change', timestamp: 0, page: '/products', details: 'Navigated to /products', x: 50, y: 50 }, { id: 'e-12-2', type: 'click', timestamp: 6700, page: '/products', details: 'Clicked product filter', x: 15, y: 22 }] },
      { id: 'rec-13', siteId: 'site-1', visitorId: 'V-5Q7R9S', country: 'UK', countryFlag: 'gb', device: 'desktop', browser: 'Chrome 120', os: 'Windows 10', screenSize: '1920x1080', duration: 167, pagesVisited: 3, pagesList: ['/', '/products', '/pricing'], startedAt: '2025-03-11T11:45:00Z', frustrationScore: 1, engagementScore: 3, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-13-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-14', siteId: 'site-1', visitorId: 'V-1T3U5V', country: 'DE', countryFlag: 'de', device: 'tablet', browser: 'Safari 16', os: 'iPadOS 16', screenSize: '1024x1366', duration: 445, pagesVisited: 6, pagesList: ['/', '/products', '/products/smart-gadget', '/products/eco-bottle', '/cart', '/checkout'], startedAt: '2025-03-10T16:55:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-14-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-15', siteId: 'site-1', visitorId: 'V-6W8X0Y', country: 'JP', countryFlag: 'jp', device: 'mobile', browser: 'Safari 17', os: 'iOS 16', screenSize: '375x812', duration: 312, pagesVisited: 5, pagesList: ['/', '/products', '/products/travel-mug', '/cart', '/checkout'], startedAt: '2025-03-10T09:12:00Z', frustrationScore: 2, engagementScore: 4, hasRageClicks: false, hasUTurns: true, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-15-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-16', siteId: 'site-1', visitorId: 'V-2Z4A6B', country: 'IN', countryFlag: 'in', device: 'desktop', browser: 'Chrome 119', os: 'Windows 10', screenSize: '1280x720', duration: 56, pagesVisited: 2, pagesList: ['/', '/products'], startedAt: '2025-03-09T13:40:00Z', frustrationScore: 3, engagementScore: 1, hasRageClicks: true, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['rage-click'], events: [{ id: 'e-16-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-16-2', type: 'rage_click', timestamp: 5600, page: '/', details: 'Rage clicked promo banner', x: 39, y: 74 }] },
      { id: 'rec-17', siteId: 'site-1', visitorId: 'V-7C9D1E', country: 'FR', countryFlag: 'fr', device: 'desktop', browser: 'Firefox 122', os: 'macOS 13', screenSize: '1440x900', duration: 389, pagesVisited: 6, pagesList: ['/', '/products', '/products/widget-pro', '/products/smart-gadget', '/cart', '/checkout'], startedAt: '2025-03-09T10:28:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-17-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-18', siteId: 'site-1', visitorId: 'V-3F5G7H', country: 'AU', countryFlag: 'au', device: 'desktop', browser: 'Chrome 120', os: 'macOS 14', screenSize: '2560x1600', duration: 521, pagesVisited: 7, pagesList: ['/', '/products', '/products/widget-pro', '/products/eco-bottle', '/cart', '/checkout', '/order-confirmation'], startedAt: '2025-03-08T14:35:00Z', frustrationScore: 0, engagementScore: 5, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['converted'], events: [{ id: 'e-18-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-19', siteId: 'site-1', visitorId: 'V-8I0J2K', country: 'BR', countryFlag: 'br', device: 'tablet', browser: 'Chrome 118', os: 'Android 12', screenSize: '800x1280', duration: 178, pagesVisited: 3, pagesList: ['/', '/pricing', '/products'], startedAt: '2025-03-08T09:05:00Z', frustrationScore: 1, engagementScore: 3, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-19-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-20', siteId: 'site-1', visitorId: 'V-4L6M8N', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Edge 121', os: 'Windows 11', screenSize: '1920x1080', duration: 267, pagesVisited: 4, pagesList: ['/', '/products', '/products/travel-mug', '/cart'], startedAt: '2025-03-07T16:20:00Z', frustrationScore: 2, engagementScore: 3, hasRageClicks: false, hasUTurns: true, hasErrors: false, isStarred: false, tags: [], events: [{ id: 'e-20-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-21', siteId: 'site-1', visitorId: 'V-9O1P3Q', country: 'CA', countryFlag: 'ca', device: 'mobile', browser: 'Chrome 121', os: 'iOS 17', screenSize: '390x844', duration: 134, pagesVisited: 3, pagesList: ['/', '/products', '/cart'], startedAt: '2025-03-07T11:45:00Z', frustrationScore: 2, engagementScore: 3, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['mobile'], events: [{ id: 'e-21-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-22', siteId: 'site-1', visitorId: 'V-5R7S9T', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Chrome 120', os: 'Windows 11', screenSize: '1600x900', duration: 345, pagesVisited: 5, pagesList: ['/', '/products', '/products/smart-gadget', '/cart', '/checkout'], startedAt: '2025-03-06T14:10:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: true, isStarred: false, tags: ['error'], events: [{ id: 'e-22-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-22-2', type: 'error', timestamp: 45600, page: '/checkout', details: 'Payment form validation error', x: 50, y: 50 }] },
      { id: 'rec-23', siteId: 'site-1', visitorId: 'V-1U3V5W', country: 'UK', countryFlag: 'gb', device: 'desktop', browser: 'Chrome 121', os: 'Windows 10', screenSize: '1920x1080', duration: 198, pagesVisited: 4, pagesList: ['/', '/products', '/products/widget-pro', '/checkout'], startedAt: '2025-03-06T10:25:00Z', frustrationScore: 2, engagementScore: 3, hasRageClicks: true, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['rage-click'], events: [{ id: 'e-23-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }, { id: 'e-23-2', type: 'rage_click', timestamp: 18900, page: '/checkout', details: 'Rage clicked submit button', x: 72, y: 82 }] },
      { id: 'rec-24', siteId: 'site-1', visitorId: 'V-6X8Y0Z', country: 'DE', countryFlag: 'de', device: 'mobile', browser: 'Firefox 121', os: 'Android 13', screenSize: '412x892', duration: 423, pagesVisited: 6, pagesList: ['/', '/products', '/products/eco-bottle', '/products/travel-mug', '/cart', '/checkout'], startedAt: '2025-03-05T16:48:00Z', frustrationScore: 1, engagementScore: 4, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['mobile'], events: [{ id: 'e-24-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] },
      { id: 'rec-25', siteId: 'site-1', visitorId: 'V-2A4B6C', country: 'US', countryFlag: 'us', device: 'desktop', browser: 'Chrome 122', os: 'macOS 14', screenSize: '1440x900', duration: 589, pagesVisited: 8, pagesList: ['/', '/products', '/products/widget-pro', '/products/smart-gadget', '/products/eco-bottle', '/products/travel-mug', '/cart', '/order-confirmation'], startedAt: '2025-03-05T09:30:00Z', frustrationScore: 0, engagementScore: 5, hasRageClicks: false, hasUTurns: false, hasErrors: false, isStarred: false, tags: ['converted', 'power-user'], events: [{ id: 'e-25-1', type: 'page_change', timestamp: 0, page: '/', details: 'Navigated to /', x: 50, y: 50 }] }
    ],
    surveys: [
      {
        id: 'survey-1',
        siteId: 'site-1',
        name: 'Net Promoter Score',
        status: 'active',
        createdAt: '2025-01-15T10:00:00Z',
        responsesCount: 342,
        questions: [
          { id: 'q-1-1', type: 'nps', text: 'How likely are you to recommend Acme Store to a friend or colleague?', required: true, options: [], scaleMax: 10, logic: null },
          { id: 'q-1-2', type: 'long_text', text: 'What is the main reason for your score?', required: false, options: [], scaleMax: null, logic: null }
        ],
        appearance: { position: 'bottom-right', color: '#FF3C00', widgetType: 'popover' },
        behavior: { showOnUrl: '/order-confirmation', showAfterSeconds: 3, showOnDevice: 'all', triggerEvent: null },
        responses: [
          { id: 'resp-1-1', submittedAt: '2025-03-15T14:22:00Z', answers: { 'q-1-1': '9', 'q-1-2': 'Great products and fast shipping!' }, visitorId: 'V-8A3F2B', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-2', submittedAt: '2025-03-14T11:35:00Z', answers: { 'q-1-1': '8', 'q-1-2': 'Good selection but website could be faster' }, visitorId: 'V-3C7D9E', device: 'mobile', page: '/order-confirmation' },
          { id: 'resp-1-3', submittedAt: '2025-03-13T16:48:00Z', answers: { 'q-1-1': '10', 'q-1-2': 'Absolutely love the quality and customer service' }, visitorId: 'V-5E2A8C', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-4', submittedAt: '2025-03-12T10:12:00Z', answers: { 'q-1-1': '6', 'q-1-2': 'Had issues with checkout, eventually got it working' }, visitorId: 'V-9B1F4D', device: 'tablet', page: '/order-confirmation' },
          { id: 'resp-1-5', submittedAt: '2025-03-11T14:30:00Z', answers: { 'q-1-1': '9', 'q-1-2': 'Smooth experience overall' }, visitorId: 'V-2D6E8A', device: 'mobile', page: '/order-confirmation' },
          { id: 'resp-1-6', submittedAt: '2025-03-10T09:22:00Z', answers: { 'q-1-1': '7', 'q-1-2': 'Decent site, could improve mobile experience' }, visitorId: 'V-7F3C5B', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-7', submittedAt: '2025-03-09T15:45:00Z', answers: { 'q-1-1': '10', 'q-1-2': 'Best online store I\'ve used!' }, visitorId: 'V-4A9D2E', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-8', submittedAt: '2025-03-08T12:18:00Z', answers: { 'q-1-1': '8', 'q-1-2': 'Good but return process needs work' }, visitorId: 'V-6B8C1F', device: 'tablet', page: '/order-confirmation' },
          { id: 'resp-1-9', submittedAt: '2025-03-07T16:55:00Z', answers: { 'q-1-1': '9', 'q-1-2': 'Very happy with my purchase' }, visitorId: 'V-1E5G7H', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-10', submittedAt: '2025-03-06T11:30:00Z', answers: { 'q-1-1': '5', 'q-1-2': 'Too many issues with the cart' }, visitorId: 'V-2H4I6J', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-11', submittedAt: '2025-03-05T14:22:00Z', answers: { 'q-1-1': '10', 'q-1-2': 'Exceptional experience from start to finish' }, visitorId: 'V-3K5L7M', device: 'mobile', page: '/order-confirmation' },
          { id: 'resp-1-12', submittedAt: '2025-03-04T10:08:00Z', answers: { 'q-1-1': '9', 'q-1-2': 'Really happy with the products' }, visitorId: 'V-8N2O4P', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-13', submittedAt: '2025-03-03T15:42:00Z', answers: { 'q-1-1': '8', 'q-1-2': 'Good experience, shipping was quick' }, visitorId: 'V-5Q7R9S', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-1-14', submittedAt: '2025-03-02T09:28:00Z', answers: { 'q-1-1': '7', 'q-1-2': 'Average experience' }, visitorId: 'V-1T3U5V', device: 'tablet', page: '/order-confirmation' },
          { id: 'resp-1-15', submittedAt: '2025-03-01T14:15:00Z', answers: { 'q-1-1': '10', 'q-1-2': 'Fantastic products and service!' }, visitorId: 'V-6W8X0Y', device: 'mobile', page: '/order-confirmation' }
        ]
      },
      {
        id: 'survey-2',
        siteId: 'site-1',
        name: 'Post-Purchase Satisfaction',
        status: 'active',
        createdAt: '2025-02-01T10:00:00Z',
        responsesCount: 156,
        questions: [
          { id: 'q-2-1', type: 'reaction', text: 'How satisfied are you with your purchase?', required: true, options: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'], scaleMax: 5, logic: null },
          { id: 'q-2-2', type: 'radio', text: 'How would you rate the delivery speed?', required: true, options: ['Very Fast', 'Fast', 'Average', 'Slow', 'Very Slow'], scaleMax: null, logic: null },
          { id: 'q-2-3', type: 'long_text', text: 'Is there anything we could improve?', required: false, options: [], scaleMax: null, logic: null }
        ],
        appearance: { position: 'bottom-right', color: '#FF3C00', widgetType: 'popover' },
        behavior: { showOnUrl: '/order-confirmation', showAfterSeconds: 10, showOnDevice: 'all', triggerEvent: null },
        responses: [
          { id: 'resp-2-1', submittedAt: '2025-03-15T15:30:00Z', answers: { 'q-2-1': 'Very Satisfied', 'q-2-2': 'Fast', 'q-2-3': 'Nothing, great experience!' }, visitorId: 'V-8A3F2B', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-2-2', submittedAt: '2025-03-14T12:45:00Z', answers: { 'q-2-1': 'Satisfied', 'q-2-2': 'Average', 'q-2-3': 'Faster shipping would be nice' }, visitorId: 'V-5E2A8C', device: 'desktop', page: '/order-confirmation' },
          { id: 'resp-2-3', submittedAt: '2025-03-12T11:22:00Z', answers: { 'q-2-1': 'Neutral', 'q-2-2': 'Slow', 'q-2-3': 'Product quality was good but delivery took 2 weeks' }, visitorId: 'V-9B1F4D', device: 'tablet', page: '/order-confirmation' },
          { id: 'resp-2-4', submittedAt: '2025-03-10T14:55:00Z', answers: { 'q-2-1': 'Very Satisfied', 'q-2-2': 'Very Fast', 'q-2-3': '' }, visitorId: 'V-2D6E8A', device: 'mobile', page: '/order-confirmation' },
          { id: 'resp-2-5', submittedAt: '2025-03-08T10:30:00Z', answers: { 'q-2-1': 'Satisfied', 'q-2-2': 'Fast', 'q-2-3': 'Product description could be more detailed' }, visitorId: 'V-7F3C5B', device: 'desktop', page: '/order-confirmation' }
        ]
      },
      {
        id: 'survey-3',
        siteId: 'site-1',
        name: 'Feature Request Survey',
        status: 'draft',
        createdAt: '2025-03-10T14:00:00Z',
        responsesCount: 0,
        questions: [
          { id: 'q-3-1', type: 'checkbox', text: 'Which features would you like to see added to our store?', required: true, options: ['Wishlist', 'Price drop alerts', 'Product comparisons', 'AR try-on', 'Subscription boxes', 'Gift wrapping'], scaleMax: null, logic: null },
          { id: 'q-3-2', type: 'rating', text: 'How would you rate our current product filtering?', required: true, options: [], scaleMax: 5, logic: null },
          { id: 'q-3-3', type: 'long_text', text: 'Describe your ideal shopping experience', required: false, options: [], scaleMax: null, logic: null }
        ],
        appearance: { position: 'center', color: '#FF3C00', widgetType: 'popover' },
        behavior: { showOnUrl: '*', showAfterSeconds: 30, showOnDevice: 'desktop', triggerEvent: null },
        responses: []
      },
      {
        id: 'survey-4',
        siteId: 'site-1',
        name: 'Onboarding Feedback',
        status: 'completed',
        createdAt: '2024-12-01T10:00:00Z',
        responsesCount: 89,
        questions: [
          { id: 'q-4-1', type: 'reaction', text: 'How easy was it to create your account?', required: true, options: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy'], scaleMax: 5, logic: null },
          { id: 'q-4-2', type: 'nps', text: 'How likely are you to use our store again?', required: true, options: [], scaleMax: 10, logic: null },
          { id: 'q-4-3', type: 'radio', text: 'How did you hear about us?', required: false, options: ['Social media', 'Search engine', 'Friend/colleague', 'Advertisement', 'Other'], scaleMax: null, logic: null },
          { id: 'q-4-4', type: 'long_text', text: 'Any feedback on the signup process?', required: false, options: [], scaleMax: null, logic: null },
          { id: 'q-4-5', type: 'email', text: 'Would you like to receive product updates?', required: false, options: [], scaleMax: null, logic: null }
        ],
        appearance: { position: 'bottom-right', color: '#FF3C00', widgetType: 'popover' },
        behavior: { showOnUrl: '/welcome', showAfterSeconds: 5, showOnDevice: 'all', triggerEvent: null },
        responses: [
          { id: 'resp-4-1', submittedAt: '2025-01-15T10:22:00Z', answers: { 'q-4-1': 'Easy', 'q-4-2': '8', 'q-4-3': 'Search engine' }, visitorId: 'V-3C7D9E', device: 'desktop', page: '/welcome' },
          { id: 'resp-4-2', submittedAt: '2025-01-12T14:35:00Z', answers: { 'q-4-1': 'Very Easy', 'q-4-2': '10', 'q-4-3': 'Friend/colleague', 'q-4-4': 'Super smooth process!' }, visitorId: 'V-5E2A8C', device: 'mobile', page: '/welcome' },
          { id: 'resp-4-3', submittedAt: '2025-01-10T09:15:00Z', answers: { 'q-4-1': 'Neutral', 'q-4-2': '6', 'q-4-3': 'Social media', 'q-4-4': 'Too many fields required' }, visitorId: 'V-9B1F4D', device: 'desktop', page: '/welcome' }
        ]
      }
    ],
    feedback: [
      { id: 'fb-1', siteId: 'site-1', sentiment: 'positive', emoji: 'love', message: 'Love the new checkout flow! So much smoother than before.', page: 'https://www.acmestore.com/checkout', submittedAt: '2025-03-15T14:45:00Z', device: 'desktop', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-2', siteId: 'site-1', sentiment: 'negative', emoji: 'sad', message: 'The cart keeps losing my items when I navigate away. Very frustrating!', page: 'https://www.acmestore.com/cart', submittedAt: '2025-03-15T11:22:00Z', device: 'mobile', browser: 'Safari 17', screenshotUrl: null },
      { id: 'fb-3', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Great product selection and easy to find what I need.', page: 'https://www.acmestore.com/products', submittedAt: '2025-03-14T16:30:00Z', device: 'desktop', browser: 'Firefox 122', screenshotUrl: null },
      { id: 'fb-4', siteId: 'site-1', sentiment: 'negative', emoji: 'confused', message: 'I cannot figure out how to apply my discount code. The button is grayed out.', page: 'https://www.acmestore.com/checkout', submittedAt: '2025-03-14T13:15:00Z', device: 'tablet', browser: 'Chrome 119', screenshotUrl: null },
      { id: 'fb-5', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Fast shipping and beautiful packaging. Will definitely order again!', page: 'https://www.acmestore.com/order-confirmation', submittedAt: '2025-03-13T09:48:00Z', device: 'desktop', browser: 'Chrome 121', screenshotUrl: null },
      { id: 'fb-6', siteId: 'site-1', sentiment: 'neutral', emoji: 'neutral', message: 'The site works fine but could use some visual refreshing.', page: 'https://www.acmestore.com/', submittedAt: '2025-03-13T15:22:00Z', device: 'desktop', browser: 'Edge 120', screenshotUrl: null },
      { id: 'fb-7', siteId: 'site-1', sentiment: 'positive', emoji: 'love', message: 'The product photos are gorgeous and very detailed. Helps a lot in decision making.', page: 'https://www.acmestore.com/products/widget-pro', submittedAt: '2025-03-12T10:55:00Z', device: 'desktop', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-8', siteId: 'site-1', sentiment: 'negative', emoji: 'sad', message: 'Payment failed three times. Had to use a different card.', page: 'https://www.acmestore.com/checkout', submittedAt: '2025-03-12T14:20:00Z', device: 'mobile', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-9', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Customer service was super helpful when I needed to change my order.', page: 'https://www.acmestore.com/contact', submittedAt: '2025-03-11T11:35:00Z', device: 'desktop', browser: 'Safari 17', screenshotUrl: null },
      { id: 'fb-10', siteId: 'site-1', sentiment: 'neutral', emoji: 'neutral', message: 'Search results are sometimes not relevant to what I typed.', page: 'https://www.acmestore.com/search', submittedAt: '2025-03-11T16:45:00Z', device: 'desktop', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-11', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Really easy to navigate, found everything I was looking for!', page: 'https://www.acmestore.com/', submittedAt: '2025-03-10T09:12:00Z', device: 'mobile', browser: 'Safari 17', screenshotUrl: null },
      { id: 'fb-12', siteId: 'site-1', sentiment: 'negative', emoji: 'confused', message: 'Why are there no size guides? Had to return an item because it was the wrong size.', page: 'https://www.acmestore.com/products/smart-gadget', submittedAt: '2025-03-10T14:30:00Z', device: 'desktop', browser: 'Firefox 122', screenshotUrl: null },
      { id: 'fb-13', siteId: 'site-1', sentiment: 'positive', emoji: 'love', message: 'The new wishlist feature is exactly what I needed. Saving products for later is so convenient.', page: 'https://www.acmestore.com/products', submittedAt: '2025-03-09T13:20:00Z', device: 'desktop', browser: 'Chrome 121', screenshotUrl: null },
      { id: 'fb-14', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Prices are very competitive and the quality is excellent.', page: 'https://www.acmestore.com/products/eco-bottle', submittedAt: '2025-03-09T10:45:00Z', device: 'tablet', browser: 'Safari 16', screenshotUrl: null },
      { id: 'fb-15', siteId: 'site-1', sentiment: 'negative', emoji: 'sad', message: 'The mobile site is slow and laggy. Takes too long to load product pages.', page: 'https://www.acmestore.com/products', submittedAt: '2025-03-08T16:15:00Z', device: 'mobile', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-16', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Smooth checkout process. Loved that I could save my payment details.', page: 'https://www.acmestore.com/checkout', submittedAt: '2025-03-08T11:55:00Z', device: 'desktop', browser: 'Edge 121', screenshotUrl: null },
      { id: 'fb-17', siteId: 'site-1', sentiment: 'neutral', emoji: 'neutral', message: 'Website loads okay but the product filtering could be more advanced.', page: 'https://www.acmestore.com/products', submittedAt: '2025-03-07T14:25:00Z', device: 'desktop', browser: 'Chrome 120', screenshotUrl: null },
      { id: 'fb-18', siteId: 'site-1', sentiment: 'positive', emoji: 'love', message: 'Amazing! Just got my order and everything is perfect. The packaging is eco-friendly too!', page: 'https://www.acmestore.com/order-confirmation', submittedAt: '2025-03-07T09:40:00Z', device: 'mobile', browser: 'Safari 17', screenshotUrl: null },
      { id: 'fb-19', siteId: 'site-1', sentiment: 'negative', emoji: 'sad', message: 'Received a damaged item and the return process is complicated.', page: 'https://www.acmestore.com/returns', submittedAt: '2025-03-06T15:30:00Z', device: 'desktop', browser: 'Firefox 122', screenshotUrl: null },
      { id: 'fb-20', siteId: 'site-1', sentiment: 'positive', emoji: 'happy', message: 'Great variety of products. Found the perfect gift here!', page: 'https://www.acmestore.com/products', submittedAt: '2025-03-06T12:18:00Z', device: 'desktop', browser: 'Chrome 120', screenshotUrl: null }
    ],
    funnels: [
      {
        id: 'funnel-1',
        siteId: 'site-1',
        name: 'Checkout Funnel',
        createdAt: '2025-01-20T09:00:00Z',
        steps: [
          { id: 'step-1-1', name: 'Product Page', type: 'page_url', value: '/products/*', visitors: 4200, dropOffRate: 22.5, conversionRate: 77.5 },
          { id: 'step-1-2', name: 'Cart', type: 'page_url', value: '/cart', visitors: 3255, dropOffRate: 35.5, conversionRate: 64.5 },
          { id: 'step-1-3', name: 'Checkout', type: 'page_url', value: '/checkout', visitors: 2100, dropOffRate: 20.0, conversionRate: 80.0 },
          { id: 'step-1-4', name: 'Order Confirmation', type: 'page_url', value: '/order-confirmation', visitors: 1680, dropOffRate: 0, conversionRate: 100 }
        ]
      },
      {
        id: 'funnel-2',
        siteId: 'site-1',
        name: 'Signup Funnel',
        createdAt: '2025-02-05T14:00:00Z',
        steps: [
          { id: 'step-2-1', name: 'Landing Page', type: 'page_url', value: '/', visitors: 8500, dropOffRate: 60.0, conversionRate: 40.0 },
          { id: 'step-2-2', name: 'Registration Form', type: 'page_url', value: '/signup', visitors: 3400, dropOffRate: 25.0, conversionRate: 75.0 },
          { id: 'step-2-3', name: 'Welcome / Confirmation', type: 'page_url', value: '/welcome', visitors: 2550, dropOffRate: 0, conversionRate: 100 }
        ]
      }
    ],
    trends: [
      {
        id: 'trend-1',
        siteId: 'site-1',
        name: 'Daily Sessions',
        metric: 'sessions',
        period: 'last_30_days',
        dataPoints: [
          { date: '2025-02-14', value: 923 }, { date: '2025-02-15', value: 1124 }, { date: '2025-02-16', value: 1287 }, { date: '2025-02-17', value: 1356 }, { date: '2025-02-18', value: 987 }, { date: '2025-02-19', value: 876 }, { date: '2025-02-20', value: 1145 }, { date: '2025-02-21', value: 1289 }, { date: '2025-02-22', value: 1456 }, { date: '2025-02-23', value: 1234 }, { date: '2025-02-24', value: 1178 }, { date: '2025-02-25', value: 1345 }, { date: '2025-02-26', value: 987 }, { date: '2025-02-27', value: 1023 }, { date: '2025-02-28', value: 1234 }, { date: '2025-03-01', value: 1456 }, { date: '2025-03-02', value: 1389 }, { date: '2025-03-03', value: 1267 }, { date: '2025-03-04', value: 1198 }, { date: '2025-03-05', value: 1345 }, { date: '2025-03-06', value: 1423 }, { date: '2025-03-07', value: 1234 }, { date: '2025-03-08', value: 987 }, { date: '2025-03-09', value: 1123 }, { date: '2025-03-10', value: 1456 }, { date: '2025-03-11', value: 1389 }, { date: '2025-03-12', value: 1267 }, { date: '2025-03-13', value: 1398 }, { date: '2025-03-14', value: 1456 }, { date: '2025-03-15', value: 1234 }
        ]
      },
      {
        id: 'trend-2',
        siteId: 'site-1',
        name: 'Daily Pageviews',
        metric: 'pageviews',
        period: 'last_30_days',
        dataPoints: [
          { date: '2025-02-14', value: 3456 }, { date: '2025-02-15', value: 4234 }, { date: '2025-02-16', value: 5123 }, { date: '2025-02-17', value: 5456 }, { date: '2025-02-18', value: 3987 }, { date: '2025-02-19', value: 3234 }, { date: '2025-02-20', value: 4345 }, { date: '2025-02-21', value: 5012 }, { date: '2025-02-22', value: 5678 }, { date: '2025-02-23', value: 4789 }, { date: '2025-02-24', value: 4456 }, { date: '2025-02-25', value: 5234 }, { date: '2025-02-26', value: 3876 }, { date: '2025-02-27', value: 4123 }, { date: '2025-02-28', value: 4867 }, { date: '2025-03-01', value: 5234 }, { date: '2025-03-02', value: 5456 }, { date: '2025-03-03', value: 4987 }, { date: '2025-03-04', value: 4567 }, { date: '2025-03-05', value: 5123 }, { date: '2025-03-06', value: 5678 }, { date: '2025-03-07', value: 4987 }, { date: '2025-03-08', value: 3876 }, { date: '2025-03-09', value: 4345 }, { date: '2025-03-10', value: 5678 }, { date: '2025-03-11', value: 5234 }, { date: '2025-03-12', value: 4987 }, { date: '2025-03-13', value: 5456 }, { date: '2025-03-14', value: 5678 }, { date: '2025-03-15', value: 4987 }
        ]
      },
      {
        id: 'trend-3',
        siteId: 'site-1',
        name: 'Daily Rage Clicks',
        metric: 'rage_clicks',
        period: 'last_30_days',
        dataPoints: [
          { date: '2025-02-14', value: 8 }, { date: '2025-02-15', value: 12 }, { date: '2025-02-16', value: 15 }, { date: '2025-02-17', value: 18 }, { date: '2025-02-18', value: 9 }, { date: '2025-02-19', value: 7 }, { date: '2025-02-20', value: 11 }, { date: '2025-02-21', value: 14 }, { date: '2025-02-22', value: 22 }, { date: '2025-02-23', value: 16 }, { date: '2025-02-24', value: 13 }, { date: '2025-02-25', value: 19 }, { date: '2025-02-26', value: 8 }, { date: '2025-02-27', value: 10 }, { date: '2025-02-28', value: 14 }, { date: '2025-03-01', value: 18 }, { date: '2025-03-02', value: 21 }, { date: '2025-03-03', value: 17 }, { date: '2025-03-04', value: 13 }, { date: '2025-03-05', value: 16 }, { date: '2025-03-06', value: 24 }, { date: '2025-03-07', value: 18 }, { date: '2025-03-08', value: 9 }, { date: '2025-03-09', value: 12 }, { date: '2025-03-10', value: 28 }, { date: '2025-03-11', value: 22 }, { date: '2025-03-12', value: 16 }, { date: '2025-03-13', value: 20 }, { date: '2025-03-14', value: 25 }, { date: '2025-03-15', value: 17 }
        ]
      }
    ],
    highlights: [
      { id: 'highlight-1', siteId: 'site-1', title: 'Checkout rage click issue', sourceType: 'recording', sourceId: 'rec-2', startTime: 4000, endTime: 8000, createdAt: '2025-03-15T12:00:00Z', createdBy: 'user-1', collectionId: 'coll-1', notes: 'User keeps clicking disabled submit button multiple times' },
      { id: 'highlight-2', siteId: 'site-1', title: 'Mobile cart abandonment', sourceType: 'recording', sourceId: 'rec-11', startTime: 3000, endTime: 7800, createdAt: '2025-03-14T15:00:00Z', createdBy: 'user-1', collectionId: 'coll-1', notes: 'User struggles with mobile checkout, eventually leaves' },
      { id: 'highlight-3', siteId: 'site-1', title: 'Homepage hero section high engagement', sourceType: 'heatmap', sourceId: 'heatmap-1', startTime: 0, endTime: 0, createdAt: '2025-03-12T11:00:00Z', createdBy: 'user-1', collectionId: 'coll-2', notes: 'CTA button getting 10% of all clicks - very effective' },
      { id: 'highlight-4', siteId: 'site-1', title: 'Product filter confusion', sourceType: 'recording', sourceId: 'rec-6', startTime: 8500, endTime: 14000, createdAt: '2025-03-11T09:00:00Z', createdBy: 'user-1', collectionId: 'coll-2', notes: 'User cannot find filter controls on mobile, rage clicks occur' },
      { id: 'highlight-5', siteId: 'site-1', title: 'Fast checkout completion', sourceType: 'recording', sourceId: 'rec-1', startTime: 25000, endTime: 45000, createdAt: '2025-03-10T14:00:00Z', createdBy: 'user-1', collectionId: null, notes: 'Exemplary smooth checkout flow to share with team' }
    ],
    highlightCollections: [
      { id: 'coll-1', name: 'Sprint 12 UX Issues', highlightIds: ['highlight-1', 'highlight-2'] },
      { id: 'coll-2', name: 'Checkout Flow Problems', highlightIds: ['highlight-3', 'highlight-4'] }
    ],
    events: [
      { id: 'event-1', siteId: 'site-1', name: 'add_to_cart', type: 'custom', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 15420 },
      { id: 'event-2', siteId: 'site-1', name: 'checkout_started', type: 'custom', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 8930 },
      { id: 'event-3', siteId: 'site-1', name: 'signup_completed', type: 'custom', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 3210 },
      { id: 'event-4', siteId: 'site-1', name: 'page_scroll_50', type: 'auto', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 45200 },
      { id: 'event-5', siteId: 'site-1', name: 'video_played', type: 'custom', firstSeen: '2024-12-15T00:00:00Z', lastSeen: '2025-03-14T23:59:00Z', totalCount: 2100 },
      { id: 'event-6', siteId: 'site-1', name: 'search_used', type: 'auto', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 6780 },
      { id: 'event-7', siteId: 'site-1', name: 'filter_applied', type: 'auto', firstSeen: '2024-11-01T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 4350 },
      { id: 'event-8', siteId: 'site-1', name: 'form_submitted', type: 'custom', firstSeen: '2024-11-15T00:00:00Z', lastSeen: '2025-03-15T23:59:00Z', totalCount: 5690 }
    ],
    dashboardMetrics: {
      siteId: 'site-1',
      period: 'last_30_days',
      totalSessions: 38471,
      avgSessionDuration: '3:03',
      avgPagesPerSession: 4.2,
      sessionsSparkline: [923, 1124, 1287, 1356, 987, 876, 1145, 1289, 1456, 1234, 1178, 1345, 987, 1023, 1234, 1456, 1389, 1267, 1198, 1345, 1423, 1234, 987, 1123, 1456, 1389, 1267, 1398, 1456, 1234],
      durationSparkline: [172, 185, 192, 178, 165, 158, 182, 195, 201, 188, 176, 193, 167, 179, 188, 198, 201, 189, 176, 192, 204, 187, 165, 178, 198, 203, 192, 198, 205, 183],
      pagesSparkline: [3.8, 4.1, 4.3, 4.5, 3.9, 3.7, 4.2, 4.4, 4.6, 4.3, 4.1, 4.4, 3.8, 4.0, 4.2, 4.5, 4.4, 4.2, 4.0, 4.3, 4.5, 4.2, 3.9, 4.1, 4.6, 4.4, 4.2, 4.4, 4.6, 4.2],
      topClickedElements: [
        { name: 'Shop Now', sessions: 7245, url: '/' },
        { name: 'Add to Cart', sessions: 5823, url: '/products' },
        { name: 'Checkout', sessions: 3120, url: '/cart' },
        { name: 'Apply Promo Code', sessions: 2456, url: '/checkout' },
        { name: 'Login', sessions: 1987, url: '/login' }
      ],
      topPages: [
        { url: '/', label: 'Homepage' },
        { url: '/products', label: 'Products' },
        { url: '/products/widget-pro', label: 'Widget Pro' },
        { url: '/cart', label: 'Cart' },
        { url: '/checkout', label: 'Checkout' }
      ],
      rageClicksCount: 487,
      uTurnsCount: 1245,
      feedbackPositive: 156,
      feedbackNegative: 34
    },
    sidebarExpanded: false,
    selectedDateRange: 'last_30_days',
    activeFilters: [],
    feedbackWidgetConfig: {
      enabled: true,
      position: 'right',
      color: '#FF3C00',
      text: 'Feedback',
      showEmoji: true,
      showMessage: true,
      showScreenshot: true
    },
    dashboards: []
  }
}

export function initializeData(sid = null, customState = null) {
  const key = storageKey(sid)
  const initKey = initialKey(sid)

  if (customState) {
    const defaultData = createInitialData()
    const merged = deepMerge(defaultData, customState)
    localStorage.setItem(key, JSON.stringify(merged))
    localStorage.setItem(initKey, JSON.stringify(merged))
    return merged
  }

  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {}
  }

  const defaultData = createInitialData()
  localStorage.setItem(key, JSON.stringify(defaultData))
  localStorage.setItem(initKey, JSON.stringify(defaultData))
  return defaultData
}

function deepMerge(target, source) {
  if (!source) return target
  const result = { ...target }
  for (const key in source) {
    if (source[key] !== null && source[key] !== undefined) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  return result
}

export function saveState(state, sid = null) {
  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(state))
  fetch(`/post${sid ? `?sid=${sid}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {})
}

export function getInitialState(sid = null) {
  const key = initialKey(sid)
  const stored = localStorage.getItem(key)
  if (stored) {
    try { return JSON.parse(stored) } catch (e) {}
  }
  return createInitialData()
}
