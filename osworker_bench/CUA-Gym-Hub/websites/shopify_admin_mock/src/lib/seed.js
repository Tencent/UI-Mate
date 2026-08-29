
// Helper to generate dates relative to now
function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function generateDailyMetrics() {
  const metrics = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 0.7 : 1.0;
    const trend = 1 + (29 - i) * 0.005;
    metrics.push({
      date: d.toISOString().slice(0, 10),
      totalSales: Math.round((800 + Math.random() * 1200) * base * trend * 100) / 100,
      ordersCount: Math.round((10 + Math.random() * 15) * base * trend),
      onlineStoreSessions: Math.round((200 + Math.random() * 300) * base * trend),
      returningCustomerRate: Math.round((0.18 + Math.random() * 0.10) * 100) / 100,
      conversionRate: Math.round((0.03 + Math.random() * 0.04) * 100) / 100,
      averageOrderValue: Math.round((55 + Math.random() * 30) * 100) / 100,
      topProducts: [
        { productId: 'prod_1', title: 'Classic Cotton T-Shirt', quantity: Math.floor(5 + Math.random() * 10), revenue: Math.round((100 + Math.random() * 200) * 100) / 100 },
        { productId: 'prod_4', title: 'Running Sneakers', quantity: Math.floor(2 + Math.random() * 5), revenue: Math.round((200 + Math.random() * 400) * 100) / 100 },
        { productId: 'prod_3', title: 'Leather Crossbody Bag', quantity: Math.floor(2 + Math.random() * 4), revenue: Math.round((150 + Math.random() * 200) * 100) / 100 },
        { productId: 'prod_6', title: 'Scented Soy Candle', quantity: Math.floor(3 + Math.random() * 8), revenue: Math.round((50 + Math.random() * 100) * 100) / 100 },
        { productId: 'prod_7', title: 'Stainless Steel Water Bottle', quantity: Math.floor(2 + Math.random() * 6), revenue: Math.round((60 + Math.random() * 120) * 100) / 100 },
      ],
      topReferrers: [
        { source: 'google.com', sessions: Math.floor(80 + Math.random() * 60) },
        { source: 'instagram.com', sessions: Math.floor(40 + Math.random() * 50) },
        { source: 'facebook.com', sessions: Math.floor(20 + Math.random() * 40) },
        { source: 'direct', sessions: Math.floor(30 + Math.random() * 50) },
        { source: 'pinterest.com', sessions: Math.floor(10 + Math.random() * 25) },
      ],
      sessionsByLocation: [
        { country: 'United States', sessions: Math.floor(120 + Math.random() * 80) },
        { country: 'Canada', sessions: Math.floor(25 + Math.random() * 30) },
        { country: 'United Kingdom', sessions: Math.floor(15 + Math.random() * 25) },
        { country: 'Australia', sessions: Math.floor(8 + Math.random() * 15) },
        { country: 'Germany', sessions: Math.floor(5 + Math.random() * 12) },
      ],
    });
  }
  return metrics;
}

function createInitialData() {
  const dailyMetrics = generateDailyMetrics();
  const totalSalesThisMonth = Math.round(dailyMetrics.reduce((s, d) => s + d.totalSales, 0) * 100) / 100;
  const totalOrdersThisMonth = dailyMetrics.reduce((s, d) => s + d.ordersCount, 0);
  const totalSessionsThisMonth = dailyMetrics.reduce((s, d) => s + d.onlineStoreSessions, 0);

  return {
    store: {
      id: 'store_1',
      name: 'Evergreen Goods',
      email: 'admin@evergreengoods.com',
      phone: '+1 (555) 123-4567',
      domain: 'evergreengoods.myshopify.com',
      customDomain: 'www.evergreengoods.com',
      address: { address1: '123 Commerce St', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201' },
      currency: 'USD',
      timezone: '(GMT-08:00) Pacific Time',
      weightUnit: 'lb',
      plan: 'Basic Xhopify',
      owner: { firstName: 'Alex', lastName: 'Chen', email: 'alex@evergreengoods.com' },
      createdAt: '2023-06-15T10:00:00Z',
    },

    products: [
      {
        id: 'prod_1', title: 'Classic Cotton T-Shirt', bodyHtml: '<p>Soft 100% organic cotton t-shirt, perfect for everyday wear. Pre-shrunk and machine washable.</p>', vendor: 'Evergreen Basics', productType: 'Shirts', handle: 'classic-cotton-t-shirt', status: 'active', tags: ['cotton', 'summer', 'basics', 'bestseller'],
        images: [{ id: 'img_1', src: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt', alt: 'Classic Cotton T-Shirt', position: 1 }],
        options: [{ id: 'opt_1', name: 'Size', position: 1, values: ['Small', 'Medium', 'Large', 'XL'] }, { id: 'opt_2', name: 'Color', position: 2, values: ['White', 'Black', 'Navy'] }],
        variants: [
          { id: 'var_1', productId: 'prod_1', title: 'Small / White', price: '24.99', compareAtPrice: null, sku: 'CCTS-SM-WHT', inventoryQuantity: 45, option1: 'Small', option2: 'White', position: 1 },
          { id: 'var_2', productId: 'prod_1', title: 'Small / Black', price: '24.99', compareAtPrice: null, sku: 'CCTS-SM-BLK', inventoryQuantity: 38, option1: 'Small', option2: 'Black', position: 2 },
          { id: 'var_3', productId: 'prod_1', title: 'Small / Navy', price: '24.99', compareAtPrice: null, sku: 'CCTS-SM-NVY', inventoryQuantity: 22, option1: 'Small', option2: 'Navy', position: 3 },
          { id: 'var_4', productId: 'prod_1', title: 'Medium / White', price: '24.99', compareAtPrice: null, sku: 'CCTS-MD-WHT', inventoryQuantity: 60, option1: 'Medium', option2: 'White', position: 4 },
          { id: 'var_5', productId: 'prod_1', title: 'Medium / Black', price: '24.99', compareAtPrice: null, sku: 'CCTS-MD-BLK', inventoryQuantity: 55, option1: 'Medium', option2: 'Black', position: 5 },
          { id: 'var_6', productId: 'prod_1', title: 'Medium / Navy', price: '24.99', compareAtPrice: null, sku: 'CCTS-MD-NVY', inventoryQuantity: 30, option1: 'Medium', option2: 'Navy', position: 6 },
          { id: 'var_7', productId: 'prod_1', title: 'Large / White', price: '24.99', compareAtPrice: null, sku: 'CCTS-LG-WHT', inventoryQuantity: 42, option1: 'Large', option2: 'White', position: 7 },
          { id: 'var_8', productId: 'prod_1', title: 'Large / Black', price: '24.99', compareAtPrice: null, sku: 'CCTS-LG-BLK', inventoryQuantity: 48, option1: 'Large', option2: 'Black', position: 8 },
          { id: 'var_9', productId: 'prod_1', title: 'Large / Navy', price: '24.99', compareAtPrice: null, sku: 'CCTS-LG-NVY', inventoryQuantity: 18, option1: 'Large', option2: 'Navy', position: 9 },
          { id: 'var_10', productId: 'prod_1', title: 'XL / White', price: '24.99', compareAtPrice: null, sku: 'CCTS-XL-WHT', inventoryQuantity: 25, option1: 'XL', option2: 'White', position: 10 },
          { id: 'var_11', productId: 'prod_1', title: 'XL / Black', price: '24.99', compareAtPrice: null, sku: 'CCTS-XL-BLK', inventoryQuantity: 20, option1: 'XL', option2: 'Black', position: 11 },
          { id: 'var_12', productId: 'prod_1', title: 'XL / Navy', price: '24.99', compareAtPrice: null, sku: 'CCTS-XL-NVY', inventoryQuantity: 12, option1: 'XL', option2: 'Navy', position: 12 },
        ],
        collections: ['coll_1', 'coll_2'], createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-03-10T14:30:00Z',
      },
      {
        id: 'prod_2', title: 'Slim Fit Jeans', bodyHtml: '<p>Modern slim fit jeans with a touch of stretch for all-day comfort. Dark indigo wash.</p>', vendor: 'Evergreen Basics', productType: 'Pants', handle: 'slim-fit-jeans', status: 'active', tags: ['denim', 'basics', 'bestseller'],
        images: [{ id: 'img_2', src: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Jeans', alt: 'Slim Fit Jeans', position: 1 }],
        options: [{ id: 'opt_3', name: 'Size', position: 1, values: ['28', '30', '32', '34'] }],
        variants: [
          { id: 'var_20', productId: 'prod_2', title: '28', price: '59.99', compareAtPrice: null, sku: 'SFJ-28', inventoryQuantity: 25, option1: '28', option2: null, position: 1 },
          { id: 'var_21', productId: 'prod_2', title: '30', price: '59.99', compareAtPrice: null, sku: 'SFJ-30', inventoryQuantity: 40, option1: '30', option2: null, position: 2 },
          { id: 'var_22', productId: 'prod_2', title: '32', price: '59.99', compareAtPrice: null, sku: 'SFJ-32', inventoryQuantity: 35, option1: '32', option2: null, position: 3 },
          { id: 'var_23', productId: 'prod_2', title: '34', price: '59.99', compareAtPrice: null, sku: 'SFJ-34', inventoryQuantity: 20, option1: '34', option2: null, position: 4 },
        ],
        collections: ['coll_2'], createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-03-05T11:00:00Z',
      },
      {
        id: 'prod_3', title: 'Leather Crossbody Bag', bodyHtml: '<p>Genuine full-grain leather crossbody bag with adjustable strap. Fits essentials perfectly.</p>', vendor: 'Artisan Leather Co', productType: 'Accessories', handle: 'leather-crossbody-bag', status: 'active', tags: ['leather', 'accessories', 'bestseller'],
        images: [{ id: 'img_3', src: 'https://placehold.co/400x400/efebe9/5d4037?text=Bag', alt: 'Leather Crossbody Bag', position: 1 }],
        options: [], variants: [{ id: 'var_30', productId: 'prod_3', title: 'Default', price: '89.99', compareAtPrice: null, sku: 'LCB-BRN', inventoryQuantity: 28, option1: null, option2: null, position: 1 }],
        collections: ['coll_2', 'coll_5'], createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-03-08T09:00:00Z',
      },
      {
        id: 'prod_4', title: 'Running Sneakers', bodyHtml: '<p>Lightweight performance running sneakers with responsive cushioning and breathable mesh upper.</p>', vendor: 'StrideFit', productType: 'Shoes', handle: 'running-sneakers', status: 'active', tags: ['shoes', 'athletic', 'bestseller'],
        images: [{ id: 'img_4', src: 'https://placehold.co/400x400/e8eaf6/283593?text=Sneakers', alt: 'Running Sneakers', position: 1 }],
        options: [{ id: 'opt_4', name: 'Size', position: 1, values: ['8', '9', '10', '11', '12'] }],
        variants: [
          { id: 'var_40', productId: 'prod_4', title: '8', price: '119.99', compareAtPrice: null, sku: 'RS-08', inventoryQuantity: 15, option1: '8', option2: null, position: 1 },
          { id: 'var_41', productId: 'prod_4', title: '9', price: '119.99', compareAtPrice: null, sku: 'RS-09', inventoryQuantity: 22, option1: '9', option2: null, position: 2 },
          { id: 'var_42', productId: 'prod_4', title: '10', price: '119.99', compareAtPrice: null, sku: 'RS-10', inventoryQuantity: 30, option1: '10', option2: null, position: 3 },
          { id: 'var_43', productId: 'prod_4', title: '11', price: '119.99', compareAtPrice: null, sku: 'RS-11', inventoryQuantity: 18, option1: '11', option2: null, position: 4 },
          { id: 'var_44', productId: 'prod_4', title: '12', price: '119.99', compareAtPrice: null, sku: 'RS-12', inventoryQuantity: 10, option1: '12', option2: null, position: 5 },
        ],
        collections: ['coll_1', 'coll_2'], createdAt: '2024-01-25T10:00:00Z', updatedAt: '2024-03-09T16:00:00Z',
      },
      {
        id: 'prod_5', title: 'Organic Face Cream', bodyHtml: '<p>Nourishing organic face cream with shea butter, jojoba oil, and vitamin E. Paraben-free.</p>', vendor: 'Pure Glow', productType: 'Skincare', handle: 'organic-face-cream', status: 'active', tags: ['skincare', 'organic', 'wellness'],
        images: [{ id: 'img_5', src: 'https://placehold.co/400x400/fce4ec/c62828?text=Face+Cream', alt: 'Organic Face Cream', position: 1 }],
        options: [], variants: [{ id: 'var_50', productId: 'prod_5', title: 'Default', price: '34.99', compareAtPrice: '42.00', sku: 'OFC-01', inventoryQuantity: 65, option1: null, option2: null, position: 1 }],
        collections: ['coll_3', 'coll_6'], createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-03-07T12:00:00Z',
      },
      {
        id: 'prod_6', title: 'Scented Soy Candle', bodyHtml: '<p>Hand-poured soy wax candle with essential oils. Burns for 40+ hours. Available in three calming scents.</p>', vendor: 'Glow & Co', productType: 'Home', handle: 'scented-soy-candle', status: 'active', tags: ['home', 'candle', 'gift'],
        images: [{ id: 'img_6', src: 'https://placehold.co/400x400/fff3e0/e65100?text=Candle', alt: 'Scented Soy Candle', position: 1 }],
        options: [{ id: 'opt_6', name: 'Scent', position: 1, values: ['Lavender', 'Vanilla', 'Eucalyptus'] }],
        variants: [
          { id: 'var_60', productId: 'prod_6', title: 'Lavender', price: '19.99', compareAtPrice: null, sku: 'SSC-LAV', inventoryQuantity: 80, option1: 'Lavender', option2: null, position: 1 },
          { id: 'var_61', productId: 'prod_6', title: 'Vanilla', price: '19.99', compareAtPrice: null, sku: 'SSC-VAN', inventoryQuantity: 95, option1: 'Vanilla', option2: null, position: 2 },
          { id: 'var_62', productId: 'prod_6', title: 'Eucalyptus', price: '19.99', compareAtPrice: null, sku: 'SSC-EUC', inventoryQuantity: 60, option1: 'Eucalyptus', option2: null, position: 3 },
        ],
        collections: ['coll_3', 'coll_6'], createdAt: '2024-02-05T10:00:00Z', updatedAt: '2024-03-06T08:00:00Z',
      },
      {
        id: 'prod_7', title: 'Stainless Steel Water Bottle', bodyHtml: '<p>Double-walled vacuum insulated 24oz water bottle. Keeps drinks cold 24hr or hot 12hr.</p>', vendor: 'EcoSip', productType: 'Accessories', handle: 'stainless-steel-water-bottle', status: 'active', tags: ['eco', 'accessories', 'gift'],
        images: [{ id: 'img_7', src: 'https://placehold.co/400x400/e0f2f1/00695c?text=Bottle', alt: 'Stainless Steel Water Bottle', position: 1 }],
        options: [{ id: 'opt_7', name: 'Color', position: 1, values: ['Silver', 'Matte Black'] }],
        variants: [
          { id: 'var_70', productId: 'prod_7', title: 'Silver', price: '29.99', compareAtPrice: null, sku: 'SSWB-SLV', inventoryQuantity: 110, option1: 'Silver', option2: null, position: 1 },
          { id: 'var_71', productId: 'prod_7', title: 'Matte Black', price: '29.99', compareAtPrice: null, sku: 'SSWB-BLK', inventoryQuantity: 90, option1: 'Matte Black', option2: null, position: 2 },
        ],
        collections: ['coll_3', 'coll_5'], createdAt: '2024-02-08T10:00:00Z', updatedAt: '2024-03-04T10:00:00Z',
      },
      {
        id: 'prod_8', title: 'Wool Beanie Hat', bodyHtml: '<p>Soft merino wool beanie, hand-knit. One size fits most. Perfect for cold weather.</p>', vendor: 'Evergreen Basics', productType: 'Accessories', handle: 'wool-beanie-hat', status: 'active', tags: ['winter', 'accessories', 'wool'],
        images: [{ id: 'img_8', src: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Beanie', alt: 'Wool Beanie Hat', position: 1 }],
        options: [{ id: 'opt_8', name: 'Color', position: 1, values: ['Charcoal', 'Cream', 'Burgundy', 'Forest Green'] }],
        variants: [
          { id: 'var_80', productId: 'prod_8', title: 'Charcoal', price: '16.99', compareAtPrice: null, sku: 'WBH-CHR', inventoryQuantity: 70, option1: 'Charcoal', option2: null, position: 1 },
          { id: 'var_81', productId: 'prod_8', title: 'Cream', price: '16.99', compareAtPrice: null, sku: 'WBH-CRM', inventoryQuantity: 55, option1: 'Cream', option2: null, position: 2 },
          { id: 'var_82', productId: 'prod_8', title: 'Burgundy', price: '16.99', compareAtPrice: null, sku: 'WBH-BRG', inventoryQuantity: 40, option1: 'Burgundy', option2: null, position: 3 },
          { id: 'var_83', productId: 'prod_8', title: 'Forest Green', price: '16.99', compareAtPrice: null, sku: 'WBH-FGN', inventoryQuantity: 35, option1: 'Forest Green', option2: null, position: 4 },
        ],
        collections: ['coll_5'], createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-03-02T14:00:00Z',
      },
      // Draft products
      {
        id: 'prod_9', title: 'Silk Scarf', bodyHtml: '<p>Luxurious 100% silk scarf with hand-rolled edges. Elegant floral print.</p>', vendor: 'Artisan Leather Co', productType: 'Accessories', handle: 'silk-scarf', status: 'draft', tags: ['silk', 'accessories', 'luxury'],
        images: [{ id: 'img_9', src: 'https://placehold.co/400x400/fce4ec/ad1457?text=Silk+Scarf', alt: 'Silk Scarf', position: 1 }],
        options: [], variants: [{ id: 'var_90', productId: 'prod_9', title: 'Default', price: '44.99', compareAtPrice: null, sku: 'SS-FLR', inventoryQuantity: 30, option1: null, option2: null, position: 1 }],
        collections: ['coll_5'], createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z',
      },
      {
        id: 'prod_10', title: 'Ceramic Mug Set', bodyHtml: '<p>Set of 4 handcrafted ceramic mugs in earth tones. Microwave and dishwasher safe. 12oz capacity each.</p>', vendor: 'Glow & Co', productType: 'Home', handle: 'ceramic-mug-set', status: 'draft', tags: ['home', 'ceramics', 'gift'],
        images: [{ id: 'img_10', src: 'https://placehold.co/400x400/efebe9/4e342e?text=Mug+Set', alt: 'Ceramic Mug Set', position: 1 }],
        options: [], variants: [{ id: 'var_100', productId: 'prod_10', title: 'Default', price: '39.99', compareAtPrice: null, sku: 'CMS-04', inventoryQuantity: 45, option1: null, option2: null, position: 1 }],
        collections: [], createdAt: '2024-03-05T10:00:00Z', updatedAt: '2024-03-05T10:00:00Z',
      },
      {
        id: 'prod_11', title: 'Yoga Mat', bodyHtml: '<p>Premium eco-friendly yoga mat with alignment lines. 6mm thick, non-slip surface. Includes carry strap.</p>', vendor: 'Pure Glow', productType: 'Wellness', handle: 'yoga-mat', status: 'draft', tags: ['wellness', 'yoga', 'fitness'],
        images: [{ id: 'img_11', src: 'https://placehold.co/400x400/e8f5e9/1b5e20?text=Yoga+Mat', alt: 'Yoga Mat', position: 1 }],
        options: [], variants: [{ id: 'var_110', productId: 'prod_11', title: 'Default', price: '49.99', compareAtPrice: null, sku: 'YM-ECO', inventoryQuantity: 25, option1: null, option2: null, position: 1 }],
        collections: ['coll_6'], createdAt: '2024-03-07T10:00:00Z', updatedAt: '2024-03-07T10:00:00Z',
      },
      // Archived products
      {
        id: 'prod_12', title: 'Holiday Gift Set', bodyHtml: '<p>Curated holiday gift set with candle, face cream, and beanie. Beautifully wrapped.</p>', vendor: 'Evergreen Goods', productType: 'Gift Sets', handle: 'holiday-gift-set', status: 'archived', tags: ['holiday', 'gift', 'seasonal'],
        images: [{ id: 'img_12', src: 'https://placehold.co/400x400/ffebee/b71c1c?text=Gift+Set', alt: 'Holiday Gift Set', position: 1 }],
        options: [], variants: [{ id: 'var_120', productId: 'prod_12', title: 'Default', price: '79.99', compareAtPrice: null, sku: 'HGS-01', inventoryQuantity: 0, option1: null, option2: null, position: 1 }],
        collections: [], createdAt: '2023-11-01T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'prod_13', title: 'Summer Beach Towel', bodyHtml: '<p>Oversized cotton beach towel with vibrant summer stripes. Quick-dry fabric.</p>', vendor: 'Evergreen Basics', productType: 'Accessories', handle: 'summer-beach-towel', status: 'archived', tags: ['summer', 'beach', 'seasonal'],
        images: [{ id: 'img_13', src: 'https://placehold.co/400x400/e3f2fd/0d47a1?text=Beach+Towel', alt: 'Summer Beach Towel', position: 1 }],
        options: [], variants: [{ id: 'var_130', productId: 'prod_13', title: 'Default', price: '24.99', compareAtPrice: null, sku: 'SBT-01', inventoryQuantity: 0, option1: null, option2: null, position: 1 }],
        collections: [], createdAt: '2023-05-01T10:00:00Z', updatedAt: '2023-09-30T10:00:00Z',
      },
    ],

    collections: [
      { id: 'coll_1', title: 'Summer Collection', bodyHtml: '<p>Our best summer picks for the season.</p>', handle: 'summer-collection', collectionType: 'custom', productIds: ['prod_1', 'prod_4', 'prod_6', 'prod_7', 'prod_8', 'prod_2', 'prod_3', 'prod_5'], productsCount: 8, sortOrder: 'best-selling', publishedAt: '2024-01-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z', image: { src: 'https://placehold.co/600x300/e8f5e9/2e7d32?text=Summer', alt: 'Summer Collection' } },
      { id: 'coll_2', title: 'Best Sellers', bodyHtml: '<p>Our most popular products loved by customers.</p>', handle: 'best-sellers', collectionType: 'custom', productIds: ['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_6', 'prod_7'], productsCount: 6, sortOrder: 'best-selling', publishedAt: '2024-01-01T00:00:00Z', updatedAt: '2024-03-05T00:00:00Z', image: null },
      { id: 'coll_3', title: 'New Arrivals', bodyHtml: '<p>Check out our latest additions.</p>', handle: 'new-arrivals', collectionType: 'custom', productIds: ['prod_5', 'prod_6', 'prod_7', 'prod_9'], productsCount: 4, sortOrder: 'created-desc', publishedAt: '2024-02-01T00:00:00Z', updatedAt: '2024-03-08T00:00:00Z', image: null },
      { id: 'coll_4', title: 'Sale', bodyHtml: '<p>Great deals on select items.</p>', handle: 'sale', collectionType: 'smart', conditions: [{ field: 'tag', relation: 'equals', value: 'sale' }], productIds: ['prod_5', 'prod_8', 'prod_1'], productsCount: 3, sortOrder: 'price-asc', publishedAt: '2024-01-15T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z', image: null },
      { id: 'coll_5', title: 'Accessories', bodyHtml: '<p>Complete your look with our accessories.</p>', handle: 'accessories', collectionType: 'custom', productIds: ['prod_3', 'prod_7', 'prod_8', 'prod_9', 'prod_13'], productsCount: 5, sortOrder: 'alpha-asc', publishedAt: '2024-01-01T00:00:00Z', updatedAt: '2024-03-04T00:00:00Z', image: null },
      { id: 'coll_6', title: 'Wellness', bodyHtml: '<p>Self-care and wellness essentials.</p>', handle: 'wellness', collectionType: 'custom', productIds: ['prod_5', 'prod_6', 'prod_11'], productsCount: 3, sortOrder: 'manual', publishedAt: '2024-02-10T00:00:00Z', updatedAt: '2024-03-06T00:00:00Z', image: null },
    ],

    orders: [
      // 6 paid + fulfilled
      { id: 'order_1', name: '#1001', orderNumber: 1001, email: 'john.doe@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '49.98', totalShippingPrice: '5.99', totalTax: '4.00', totalDiscounts: '0.00', totalPrice: '59.97', lineItems: [{ id: 'li_1', productId: 'prod_1', variantId: 'var_4', title: 'Classic Cotton T-Shirt', variantTitle: 'Medium / White', quantity: 2, price: '24.99', sku: 'CCTS-MD-WHT', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt' }], customer: { id: 'cust_1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }, shippingAddress: { firstName: 'John', lastName: 'Doe', address1: '742 Evergreen Terrace', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201', phone: '+1 555-0101' }, billingAddress: { firstName: 'John', lastName: 'Doe', address1: '742 Evergreen Terrace', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(28), updatedAt: daysAgo(26), timeline: [{ id: 'evt_1', type: 'created', message: 'Order #1001 was placed', createdAt: daysAgo(28) }, { id: 'evt_2', type: 'paid', message: 'Payment of $59.97 was received', createdAt: daysAgo(28) }, { id: 'evt_3', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(26) }] },
      { id: 'order_2', name: '#1002', orderNumber: 1002, email: 'sarah.kim@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '119.99', totalShippingPrice: '5.99', totalTax: '9.60', totalDiscounts: '0.00', totalPrice: '135.58', lineItems: [{ id: 'li_2', productId: 'prod_4', variantId: 'var_42', title: 'Running Sneakers', variantTitle: '10', quantity: 1, price: '119.99', sku: 'RS-10', imageSrc: 'https://placehold.co/400x400/e8eaf6/283593?text=Sneakers' }], customer: { id: 'cust_2', firstName: 'Sarah', lastName: 'Kim', email: 'sarah.kim@example.com' }, shippingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, billingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, note: 'VIP customer', tags: ['vip'], discountCodes: [], createdAt: daysAgo(25), updatedAt: daysAgo(23), timeline: [{ id: 'evt_4', type: 'created', message: 'Order #1002 was placed', createdAt: daysAgo(25) }, { id: 'evt_5', type: 'paid', message: 'Payment of $135.58 was received', createdAt: daysAgo(25) }, { id: 'evt_6', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(23) }] },
      { id: 'order_3', name: '#1003', orderNumber: 1003, email: 'marcus.j@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '89.99', totalShippingPrice: '5.99', totalTax: '7.20', totalDiscounts: '0.00', totalPrice: '103.18', lineItems: [{ id: 'li_3', productId: 'prod_3', variantId: 'var_30', title: 'Leather Crossbody Bag', variantTitle: 'Default', quantity: 1, price: '89.99', sku: 'LCB-BRN', imageSrc: 'https://placehold.co/400x400/efebe9/5d4037?text=Bag' }], customer: { id: 'cust_3', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@example.com' }, shippingAddress: { firstName: 'Marcus', lastName: 'Johnson', address1: '233 S Wacker Dr', city: 'Chicago', province: 'Illinois', provinceCode: 'IL', country: 'United States', countryCode: 'US', zip: '60606' }, billingAddress: { firstName: 'Marcus', lastName: 'Johnson', address1: '233 S Wacker Dr', city: 'Chicago', province: 'Illinois', provinceCode: 'IL', country: 'United States', countryCode: 'US', zip: '60606' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(22), updatedAt: daysAgo(20), timeline: [{ id: 'evt_7', type: 'created', message: 'Order #1003 was placed', createdAt: daysAgo(22) }, { id: 'evt_8', type: 'paid', message: 'Payment of $103.18 was received', createdAt: daysAgo(22) }, { id: 'evt_9', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(20) }] },
      { id: 'order_4', name: '#1004', orderNumber: 1004, email: 'carlos.r@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '59.98', totalShippingPrice: '5.99', totalTax: '4.80', totalDiscounts: '0.00', totalPrice: '70.77', lineItems: [{ id: 'li_4a', productId: 'prod_6', variantId: 'var_61', title: 'Scented Soy Candle', variantTitle: 'Vanilla', quantity: 2, price: '19.99', sku: 'SSC-VAN', imageSrc: 'https://placehold.co/400x400/fff3e0/e65100?text=Candle' }, { id: 'li_4b', productId: 'prod_8', variantId: 'var_80', title: 'Wool Beanie Hat', variantTitle: 'Charcoal', quantity: 1, price: '16.99', sku: 'WBH-CHR', imageSrc: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Beanie' }], customer: { id: 'cust_5', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@example.com' }, shippingAddress: { firstName: 'Carlos', lastName: 'Rivera', address1: '1200 Brickell Ave', city: 'Miami', province: 'Florida', provinceCode: 'FL', country: 'United States', countryCode: 'US', zip: '33131' }, billingAddress: { firstName: 'Carlos', lastName: 'Rivera', address1: '1200 Brickell Ave', city: 'Miami', province: 'Florida', provinceCode: 'FL', country: 'United States', countryCode: 'US', zip: '33131' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(18), updatedAt: daysAgo(16), timeline: [{ id: 'evt_10', type: 'created', message: 'Order #1004 was placed', createdAt: daysAgo(18) }, { id: 'evt_11', type: 'paid', message: 'Payment of $70.77 was received', createdAt: daysAgo(18) }, { id: 'evt_12', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(16) }] },
      { id: 'order_5', name: '#1005', orderNumber: 1005, email: 'james.ob@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '149.97', totalShippingPrice: '5.99', totalTax: '12.00', totalDiscounts: '0.00', totalPrice: '167.96', lineItems: [{ id: 'li_5a', productId: 'prod_2', variantId: 'var_22', title: 'Slim Fit Jeans', variantTitle: '32', quantity: 1, price: '59.99', sku: 'SFJ-32', imageSrc: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Jeans' }, { id: 'li_5b', productId: 'prod_3', variantId: 'var_30', title: 'Leather Crossbody Bag', variantTitle: 'Default', quantity: 1, price: '89.99', sku: 'LCB-BRN', imageSrc: 'https://placehold.co/400x400/efebe9/5d4037?text=Bag' }], customer: { id: 'cust_7', firstName: 'James', lastName: "O'Brien", email: 'james.ob@example.com' }, shippingAddress: { firstName: 'James', lastName: "O'Brien", address1: '350 5th Ave', city: 'New York', province: 'New York', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10118' }, billingAddress: { firstName: 'James', lastName: "O'Brien", address1: '350 5th Ave', city: 'New York', province: 'New York', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10118' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(15), updatedAt: daysAgo(13), timeline: [{ id: 'evt_13', type: 'created', message: 'Order #1005 was placed', createdAt: daysAgo(15) }, { id: 'evt_14', type: 'paid', message: 'Payment of $167.96 was received', createdAt: daysAgo(15) }, { id: 'evt_15', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(13) }] },
      { id: 'order_6', name: '#1006', orderNumber: 1006, email: 'sarah.kim@example.com', financialStatus: 'paid', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '34.99', totalShippingPrice: '5.99', totalTax: '2.80', totalDiscounts: '0.00', totalPrice: '43.78', lineItems: [{ id: 'li_6', productId: 'prod_5', variantId: 'var_50', title: 'Organic Face Cream', variantTitle: 'Default', quantity: 1, price: '34.99', sku: 'OFC-01', imageSrc: 'https://placehold.co/400x400/fce4ec/c62828?text=Face+Cream' }], customer: { id: 'cust_2', firstName: 'Sarah', lastName: 'Kim', email: 'sarah.kim@example.com' }, shippingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, billingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(12), updatedAt: daysAgo(10), timeline: [{ id: 'evt_16', type: 'created', message: 'Order #1006 was placed', createdAt: daysAgo(12) }, { id: 'evt_17', type: 'paid', message: 'Payment of $43.78 was received', createdAt: daysAgo(12) }, { id: 'evt_18', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(10) }] },
      // 4 paid + unfulfilled
      { id: 'order_7', name: '#1007', orderNumber: 1007, email: 'john.doe@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '119.99', totalShippingPrice: '5.99', totalTax: '9.60', totalDiscounts: '0.00', totalPrice: '135.58', lineItems: [{ id: 'li_7', productId: 'prod_4', variantId: 'var_41', title: 'Running Sneakers', variantTitle: '9', quantity: 1, price: '119.99', sku: 'RS-09', imageSrc: 'https://placehold.co/400x400/e8eaf6/283593?text=Sneakers' }], customer: { id: 'cust_1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }, shippingAddress: { firstName: 'John', lastName: 'Doe', address1: '742 Evergreen Terrace', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201' }, billingAddress: { firstName: 'John', lastName: 'Doe', address1: '742 Evergreen Terrace', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201' }, note: 'Please gift wrap', tags: ['rush'], discountCodes: [], createdAt: daysAgo(5), updatedAt: daysAgo(5), timeline: [{ id: 'evt_19', type: 'created', message: 'Order #1007 was placed', createdAt: daysAgo(5) }, { id: 'evt_20', type: 'paid', message: 'Payment of $135.58 was received', createdAt: daysAgo(5) }] },
      { id: 'order_8', name: '#1008', orderNumber: 1008, email: 'priya.p@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '69.98', totalShippingPrice: '5.99', totalTax: '5.60', totalDiscounts: '0.00', totalPrice: '81.57', lineItems: [{ id: 'li_8a', productId: 'prod_5', variantId: 'var_50', title: 'Organic Face Cream', variantTitle: 'Default', quantity: 1, price: '34.99', sku: 'OFC-01', imageSrc: 'https://placehold.co/400x400/fce4ec/c62828?text=Face+Cream' }, { id: 'li_8b', productId: 'prod_7', variantId: 'var_70', title: 'Stainless Steel Water Bottle', variantTitle: 'Silver', quantity: 1, price: '29.99', sku: 'SSWB-SLV', imageSrc: 'https://placehold.co/400x400/e0f2f1/00695c?text=Bottle' }], customer: { id: 'cust_6', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@example.com' }, shippingAddress: { firstName: 'Priya', lastName: 'Patel', address1: '1100 Congress Ave', city: 'Austin', province: 'Texas', provinceCode: 'TX', country: 'United States', countryCode: 'US', zip: '78701' }, billingAddress: { firstName: 'Priya', lastName: 'Patel', address1: '1100 Congress Ave', city: 'Austin', province: 'Texas', provinceCode: 'TX', country: 'United States', countryCode: 'US', zip: '78701' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(4), updatedAt: daysAgo(4), timeline: [{ id: 'evt_21', type: 'created', message: 'Order #1008 was placed', createdAt: daysAgo(4) }, { id: 'evt_22', type: 'paid', message: 'Payment of $81.57 was received', createdAt: daysAgo(4) }] },
      { id: 'order_9', name: '#1009', orderNumber: 1009, email: 'sophie.m@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '76.97', totalShippingPrice: '5.99', totalTax: '6.16', totalDiscounts: '0.00', totalPrice: '89.12', lineItems: [{ id: 'li_9a', productId: 'prod_1', variantId: 'var_7', title: 'Classic Cotton T-Shirt', variantTitle: 'Large / White', quantity: 1, price: '24.99', sku: 'CCTS-LG-WHT', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt' }, { id: 'li_9b', productId: 'prod_6', variantId: 'var_60', title: 'Scented Soy Candle', variantTitle: 'Lavender', quantity: 1, price: '19.99', sku: 'SSC-LAV', imageSrc: 'https://placehold.co/400x400/fff3e0/e65100?text=Candle' }, { id: 'li_9c', productId: 'prod_7', variantId: 'var_71', title: 'Stainless Steel Water Bottle', variantTitle: 'Matte Black', quantity: 1, price: '29.99', sku: 'SSWB-BLK', imageSrc: 'https://placehold.co/400x400/e0f2f1/00695c?text=Bottle' }], customer: { id: 'cust_9', firstName: 'Sophie', lastName: 'Martin', email: 'sophie.m@example.com' }, shippingAddress: { firstName: 'Sophie', lastName: 'Martin', address1: '1600 California St', city: 'Denver', province: 'Colorado', provinceCode: 'CO', country: 'United States', countryCode: 'US', zip: '80202' }, billingAddress: { firstName: 'Sophie', lastName: 'Martin', address1: '1600 California St', city: 'Denver', province: 'Colorado', provinceCode: 'CO', country: 'United States', countryCode: 'US', zip: '80202' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(3), updatedAt: daysAgo(3), timeline: [{ id: 'evt_23', type: 'created', message: 'Order #1009 was placed', createdAt: daysAgo(3) }, { id: 'evt_24', type: 'paid', message: 'Payment of $89.12 was received', createdAt: daysAgo(3) }] },
      { id: 'order_10', name: '#1010', orderNumber: 1010, email: 'lisa.c@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '24.99', totalShippingPrice: '5.99', totalTax: '2.00', totalDiscounts: '0.00', totalPrice: '32.98', lineItems: [{ id: 'li_10', productId: 'prod_1', variantId: 'var_2', title: 'Classic Cotton T-Shirt', variantTitle: 'Small / Black', quantity: 1, price: '24.99', sku: 'CCTS-SM-BLK', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt' }], customer: { id: 'cust_11', firstName: 'Lisa', lastName: 'Chen', email: 'lisa.c@example.com' }, shippingAddress: { firstName: 'Lisa', lastName: 'Chen', address1: '800 Robson St', city: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', country: 'Canada', countryCode: 'CA', zip: 'V6Z 3B7' }, billingAddress: { firstName: 'Lisa', lastName: 'Chen', address1: '800 Robson St', city: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', country: 'Canada', countryCode: 'CA', zip: 'V6Z 3B7' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(2), updatedAt: daysAgo(2), timeline: [{ id: 'evt_25', type: 'created', message: 'Order #1010 was placed', createdAt: daysAgo(2) }, { id: 'evt_26', type: 'paid', message: 'Payment of $32.98 was received', createdAt: daysAgo(2) }] },
      // 2 pending payment + unfulfilled
      { id: 'order_11', name: '#1011', orderNumber: 1011, email: 'ahmed.h@example.com', financialStatus: 'pending', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '89.99', totalShippingPrice: '5.99', totalTax: '7.20', totalDiscounts: '0.00', totalPrice: '103.18', lineItems: [{ id: 'li_11', productId: 'prod_3', variantId: 'var_30', title: 'Leather Crossbody Bag', variantTitle: 'Default', quantity: 1, price: '89.99', sku: 'LCB-BRN', imageSrc: 'https://placehold.co/400x400/efebe9/5d4037?text=Bag' }], customer: { id: 'cust_10', firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.h@example.com' }, shippingAddress: { firstName: 'Ahmed', lastName: 'Hassan', address1: '100 Queen St W', city: 'Toronto', province: 'Ontario', provinceCode: 'ON', country: 'Canada', countryCode: 'CA', zip: 'M5H 2N2' }, billingAddress: { firstName: 'Ahmed', lastName: 'Hassan', address1: '100 Queen St W', city: 'Toronto', province: 'Ontario', provinceCode: 'ON', country: 'Canada', countryCode: 'CA', zip: 'M5H 2N2' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(1), updatedAt: daysAgo(1), timeline: [{ id: 'evt_27', type: 'created', message: 'Order #1011 was placed', createdAt: daysAgo(1) }] },
      { id: 'order_12', name: '#1012', orderNumber: 1012, email: 'emma.w@example.com', financialStatus: 'pending', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '59.98', totalShippingPrice: '5.99', totalTax: '4.80', totalDiscounts: '0.00', totalPrice: '70.77', lineItems: [{ id: 'li_12a', productId: 'prod_6', variantId: 'var_62', title: 'Scented Soy Candle', variantTitle: 'Eucalyptus', quantity: 1, price: '19.99', sku: 'SSC-EUC', imageSrc: 'https://placehold.co/400x400/fff3e0/e65100?text=Candle' }, { id: 'li_12b', productId: 'prod_8', variantId: 'var_82', title: 'Wool Beanie Hat', variantTitle: 'Burgundy', quantity: 1, price: '16.99', sku: 'WBH-BRG', imageSrc: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Beanie' }, { id: 'li_12c', productId: 'prod_1', variantId: 'var_1', title: 'Classic Cotton T-Shirt', variantTitle: 'Small / White', quantity: 1, price: '24.99', sku: 'CCTS-SM-WHT', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt' }], customer: { id: 'cust_12', firstName: 'Emma', lastName: 'Williams', email: 'emma.w@example.com' }, shippingAddress: { firstName: 'Emma', lastName: 'Williams', address1: '221B Baker St', city: 'London', province: '', provinceCode: '', country: 'United Kingdom', countryCode: 'GB', zip: 'NW1 6XE' }, billingAddress: { firstName: 'Emma', lastName: 'Williams', address1: '221B Baker St', city: 'London', province: '', provinceCode: '', country: 'United Kingdom', countryCode: 'GB', zip: 'NW1 6XE' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(1), updatedAt: daysAgo(1), timeline: [{ id: 'evt_28', type: 'created', message: 'Order #1012 was placed', createdAt: daysAgo(1) }] },
      // 2 partially fulfilled
      { id: 'order_13', name: '#1013', orderNumber: 1013, email: 'sarah.kim@example.com', financialStatus: 'paid', fulfillmentStatus: 'partial', currency: 'USD', subtotalPrice: '144.97', totalShippingPrice: '5.99', totalTax: '11.60', totalDiscounts: '14.50', totalPrice: '148.06', lineItems: [{ id: 'li_13a', productId: 'prod_4', variantId: 'var_40', title: 'Running Sneakers', variantTitle: '8', quantity: 1, price: '119.99', sku: 'RS-08', imageSrc: 'https://placehold.co/400x400/e8eaf6/283593?text=Sneakers', fulfillmentStatus: 'fulfilled' }, { id: 'li_13b', productId: 'prod_1', variantId: 'var_5', title: 'Classic Cotton T-Shirt', variantTitle: 'Medium / Black', quantity: 1, price: '24.99', sku: 'CCTS-MD-BLK', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt', fulfillmentStatus: null }], customer: { id: 'cust_2', firstName: 'Sarah', lastName: 'Kim', email: 'sarah.kim@example.com' }, shippingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, billingAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, note: '', tags: ['vip'], discountCodes: [{ code: 'SUMMER10', amount: '14.50', type: 'percentage' }], createdAt: daysAgo(10), updatedAt: daysAgo(8), timeline: [{ id: 'evt_29', type: 'created', message: 'Order #1013 was placed', createdAt: daysAgo(10) }, { id: 'evt_30', type: 'paid', message: 'Payment of $148.06 was received', createdAt: daysAgo(10) }, { id: 'evt_31', type: 'fulfilled', message: 'Running Sneakers (8) was fulfilled', createdAt: daysAgo(8) }] },
      { id: 'order_14', name: '#1014', orderNumber: 1014, email: 'james.ob@example.com', financialStatus: 'paid', fulfillmentStatus: 'partial', currency: 'USD', subtotalPrice: '104.97', totalShippingPrice: '5.99', totalTax: '8.40', totalDiscounts: '0.00', totalPrice: '119.36', lineItems: [{ id: 'li_14a', productId: 'prod_2', variantId: 'var_21', title: 'Slim Fit Jeans', variantTitle: '30', quantity: 1, price: '59.99', sku: 'SFJ-30', imageSrc: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Jeans', fulfillmentStatus: 'fulfilled' }, { id: 'li_14b', productId: 'prod_1', variantId: 'var_8', title: 'Classic Cotton T-Shirt', variantTitle: 'Large / Black', quantity: 1, price: '24.99', sku: 'CCTS-LG-BLK', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt', fulfillmentStatus: null }, { id: 'li_14c', productId: 'prod_6', variantId: 'var_60', title: 'Scented Soy Candle', variantTitle: 'Lavender', quantity: 1, price: '19.99', sku: 'SSC-LAV', imageSrc: 'https://placehold.co/400x400/fff3e0/e65100?text=Candle', fulfillmentStatus: null }], customer: { id: 'cust_7', firstName: 'James', lastName: "O'Brien", email: 'james.ob@example.com' }, shippingAddress: { firstName: 'James', lastName: "O'Brien", address1: '350 5th Ave', city: 'New York', province: 'New York', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10118' }, billingAddress: { firstName: 'James', lastName: "O'Brien", address1: '350 5th Ave', city: 'New York', province: 'New York', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10118' }, note: '', tags: [], discountCodes: [], createdAt: daysAgo(7), updatedAt: daysAgo(5), timeline: [{ id: 'evt_32', type: 'created', message: 'Order #1014 was placed', createdAt: daysAgo(7) }, { id: 'evt_33', type: 'paid', message: 'Payment of $119.36 was received', createdAt: daysAgo(7) }, { id: 'evt_34', type: 'fulfilled', message: 'Slim Fit Jeans (30) was fulfilled', createdAt: daysAgo(5) }] },
      // 1 refunded
      { id: 'order_15', name: '#1015', orderNumber: 1015, email: 'emily.w@example.com', financialStatus: 'refunded', fulfillmentStatus: 'fulfilled', currency: 'USD', subtotalPrice: '24.99', totalShippingPrice: '5.99', totalTax: '2.00', totalDiscounts: '0.00', totalPrice: '32.98', lineItems: [{ id: 'li_15', productId: 'prod_1', variantId: 'var_1', title: 'Classic Cotton T-Shirt', variantTitle: 'Small / White', quantity: 1, price: '24.99', sku: 'CCTS-SM-WHT', imageSrc: 'https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt' }], customer: { id: 'cust_4', firstName: 'Emily', lastName: 'Watson', email: 'emily.w@example.com' }, shippingAddress: { firstName: 'Emily', lastName: 'Watson', address1: '400 Broad St', city: 'Seattle', province: 'Washington', provinceCode: 'WA', country: 'United States', countryCode: 'US', zip: '98109' }, billingAddress: { firstName: 'Emily', lastName: 'Watson', address1: '400 Broad St', city: 'Seattle', province: 'Washington', provinceCode: 'WA', country: 'United States', countryCode: 'US', zip: '98109' }, note: 'Customer requested refund - wrong size', tags: ['refunded'], discountCodes: [], createdAt: daysAgo(20), updatedAt: daysAgo(17), timeline: [{ id: 'evt_35', type: 'created', message: 'Order #1015 was placed', createdAt: daysAgo(20) }, { id: 'evt_36', type: 'paid', message: 'Payment of $32.98 was received', createdAt: daysAgo(20) }, { id: 'evt_37', type: 'fulfilled', message: 'All items were fulfilled', createdAt: daysAgo(18) }, { id: 'evt_38', type: 'refunded', message: 'Full refund of $32.98 was issued', createdAt: daysAgo(17) }] },
      // 1 cancelled
      { id: 'order_16', name: '#1016', orderNumber: 1016, email: 'yuki.t@example.com', financialStatus: 'voided', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '59.99', totalShippingPrice: '5.99', totalTax: '4.80', totalDiscounts: '0.00', totalPrice: '70.78', cancelReason: 'customer', cancelledAt: daysAgo(14), lineItems: [{ id: 'li_16', productId: 'prod_2', variantId: 'var_20', title: 'Slim Fit Jeans', variantTitle: '28', quantity: 1, price: '59.99', sku: 'SFJ-28', imageSrc: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Jeans' }], customer: { id: 'cust_8', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.t@example.com' }, shippingAddress: { firstName: 'Yuki', lastName: 'Tanaka', address1: '6801 Hollywood Blvd', city: 'Los Angeles', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '90028' }, billingAddress: { firstName: 'Yuki', lastName: 'Tanaka', address1: '6801 Hollywood Blvd', city: 'Los Angeles', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '90028' }, note: '', tags: ['cancelled'], discountCodes: [], createdAt: daysAgo(16), updatedAt: daysAgo(14), timeline: [{ id: 'evt_39', type: 'created', message: 'Order #1016 was placed', createdAt: daysAgo(16) }, { id: 'evt_40', type: 'cancelled', message: 'Order was cancelled by customer', createdAt: daysAgo(14) }] },
      // 2 with discount codes
      { id: 'order_17', name: '#1017', orderNumber: 1017, email: 'carlos.r@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '149.97', totalShippingPrice: '0.00', totalTax: '12.00', totalDiscounts: '0.00', totalPrice: '161.97', lineItems: [{ id: 'li_17a', productId: 'prod_4', variantId: 'var_43', title: 'Running Sneakers', variantTitle: '11', quantity: 1, price: '119.99', sku: 'RS-11', imageSrc: 'https://placehold.co/400x400/e8eaf6/283593?text=Sneakers' }, { id: 'li_17b', productId: 'prod_7', variantId: 'var_71', title: 'Stainless Steel Water Bottle', variantTitle: 'Matte Black', quantity: 1, price: '29.99', sku: 'SSWB-BLK', imageSrc: 'https://placehold.co/400x400/e0f2f1/00695c?text=Bottle' }], customer: { id: 'cust_5', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@example.com' }, shippingAddress: { firstName: 'Carlos', lastName: 'Rivera', address1: '1200 Brickell Ave', city: 'Miami', province: 'Florida', provinceCode: 'FL', country: 'United States', countryCode: 'US', zip: '33131' }, billingAddress: { firstName: 'Carlos', lastName: 'Rivera', address1: '1200 Brickell Ave', city: 'Miami', province: 'Florida', provinceCode: 'FL', country: 'United States', countryCode: 'US', zip: '33131' }, note: '', tags: [], discountCodes: [{ code: 'FREESHIP', amount: '5.99', type: 'shipping' }], createdAt: daysAgo(2), updatedAt: daysAgo(2), timeline: [{ id: 'evt_41', type: 'created', message: 'Order #1017 was placed', createdAt: daysAgo(2) }, { id: 'evt_42', type: 'paid', message: 'Payment of $161.97 was received', createdAt: daysAgo(2) }] },
      { id: 'order_18', name: '#1018', orderNumber: 1018, email: 'lisa.c@example.com', financialStatus: 'paid', fulfillmentStatus: null, currency: 'USD', subtotalPrice: '109.98', totalShippingPrice: '5.99', totalTax: '7.92', totalDiscounts: '11.00', totalPrice: '112.89', lineItems: [{ id: 'li_18a', productId: 'prod_2', variantId: 'var_22', title: 'Slim Fit Jeans', variantTitle: '32', quantity: 1, price: '59.99', sku: 'SFJ-32', imageSrc: 'https://placehold.co/400x400/e3f2fd/1565c0?text=Jeans' }, { id: 'li_18b', productId: 'prod_5', variantId: 'var_50', title: 'Organic Face Cream', variantTitle: 'Default', quantity: 1, price: '34.99', sku: 'OFC-01', imageSrc: 'https://placehold.co/400x400/fce4ec/c62828?text=Face+Cream' }, { id: 'li_18c', productId: 'prod_8', variantId: 'var_81', title: 'Wool Beanie Hat', variantTitle: 'Cream', quantity: 1, price: '16.99', sku: 'WBH-CRM', imageSrc: 'https://placehold.co/400x400/f3e5f5/7b1fa2?text=Beanie' }], customer: { id: 'cust_11', firstName: 'Lisa', lastName: 'Chen', email: 'lisa.c@example.com' }, shippingAddress: { firstName: 'Lisa', lastName: 'Chen', address1: '800 Robson St', city: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', country: 'Canada', countryCode: 'CA', zip: 'V6Z 3B7' }, billingAddress: { firstName: 'Lisa', lastName: 'Chen', address1: '800 Robson St', city: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', country: 'Canada', countryCode: 'CA', zip: 'V6Z 3B7' }, note: '', tags: [], discountCodes: [{ code: 'SUMMER10', amount: '11.00', type: 'percentage' }], createdAt: daysAgo(1), updatedAt: daysAgo(1), timeline: [{ id: 'evt_43', type: 'created', message: 'Order #1018 was placed', createdAt: daysAgo(1) }, { id: 'evt_44', type: 'paid', message: 'Payment of $112.89 was received', createdAt: daysAgo(1) }] },
    ],

    customers: [
      { id: 'cust_1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1 555-0101', state: 'enabled', ordersCount: 5, totalSpent: '324.95', note: 'Loyal customer since day one', tags: ['loyal'], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'John', lastName: 'Doe', address1: '742 Evergreen Terrace', city: 'Portland', province: 'Oregon', provinceCode: 'OR', country: 'United States', countryCode: 'US', zip: '97201' }, createdAt: '2023-09-15T10:00:00Z', updatedAt: daysAgo(5) },
      { id: 'cust_2', firstName: 'Sarah', lastName: 'Kim', email: 'sarah.kim@example.com', phone: '+1 415-555-0202', state: 'enabled', ordersCount: 8, totalSpent: '1250.00', note: 'VIP customer, high LTV', tags: ['vip', 'wholesale'], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Sarah', lastName: 'Kim', address1: '500 Market St', city: 'San Francisco', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '94105' }, createdAt: '2023-07-20T10:00:00Z', updatedAt: daysAgo(10) },
      { id: 'cust_3', firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.j@example.com', phone: '+1 312-555-0303', state: 'enabled', ordersCount: 3, totalSpent: '189.97', note: '', tags: [], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Marcus', lastName: 'Johnson', address1: '233 S Wacker Dr', city: 'Chicago', province: 'Illinois', provinceCode: 'IL', country: 'United States', countryCode: 'US', zip: '60606' }, createdAt: '2023-11-01T10:00:00Z', updatedAt: daysAgo(22) },
      { id: 'cust_4', firstName: 'Emily', lastName: 'Watson', email: 'emily.w@example.com', phone: '+1 206-555-0404', state: 'enabled', ordersCount: 1, totalSpent: '24.99', note: '', tags: [], taxExempt: false, acceptsMarketing: false, defaultAddress: { firstName: 'Emily', lastName: 'Watson', address1: '400 Broad St', city: 'Seattle', province: 'Washington', provinceCode: 'WA', country: 'United States', countryCode: 'US', zip: '98109' }, createdAt: '2024-01-10T10:00:00Z', updatedAt: daysAgo(20) },
      { id: 'cust_5', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@example.com', phone: '+1 786-555-0505', state: 'enabled', ordersCount: 4, totalSpent: '412.50', note: '', tags: [], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Carlos', lastName: 'Rivera', address1: '1200 Brickell Ave', city: 'Miami', province: 'Florida', provinceCode: 'FL', country: 'United States', countryCode: 'US', zip: '33131' }, createdAt: '2023-10-05T10:00:00Z', updatedAt: daysAgo(2) },
      { id: 'cust_6', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@example.com', phone: '+1 512-555-0606', state: 'enabled', ordersCount: 2, totalSpent: '149.98', note: '', tags: [], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Priya', lastName: 'Patel', address1: '1100 Congress Ave', city: 'Austin', province: 'Texas', provinceCode: 'TX', country: 'United States', countryCode: 'US', zip: '78701' }, createdAt: '2024-01-25T10:00:00Z', updatedAt: daysAgo(4) },
      { id: 'cust_7', firstName: 'James', lastName: "O'Brien", email: 'james.ob@example.com', phone: '+1 212-555-0707', state: 'enabled', ordersCount: 6, totalSpent: '567.89', note: '', tags: ['repeat'], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'James', lastName: "O'Brien", address1: '350 5th Ave', city: 'New York', province: 'New York', provinceCode: 'NY', country: 'United States', countryCode: 'US', zip: '10118' }, createdAt: '2023-08-15T10:00:00Z', updatedAt: daysAgo(5) },
      { id: 'cust_8', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.t@example.com', phone: '+1 323-555-0808', state: 'enabled', ordersCount: 2, totalSpent: '109.98', note: '', tags: [], taxExempt: false, acceptsMarketing: false, defaultAddress: { firstName: 'Yuki', lastName: 'Tanaka', address1: '6801 Hollywood Blvd', city: 'Los Angeles', province: 'California', provinceCode: 'CA', country: 'United States', countryCode: 'US', zip: '90028' }, createdAt: '2024-01-05T10:00:00Z', updatedAt: daysAgo(14) },
      { id: 'cust_9', firstName: 'Sophie', lastName: 'Martin', email: 'sophie.m@example.com', phone: '+1 720-555-0909', state: 'enabled', ordersCount: 3, totalSpent: '234.97', note: '', tags: [], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Sophie', lastName: 'Martin', address1: '1600 California St', city: 'Denver', province: 'Colorado', provinceCode: 'CO', country: 'United States', countryCode: 'US', zip: '80202' }, createdAt: '2023-12-01T10:00:00Z', updatedAt: daysAgo(3) },
      { id: 'cust_10', firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.h@example.com', phone: '+1 416-555-1010', state: 'enabled', ordersCount: 1, totalSpent: '89.99', note: '', tags: [], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Ahmed', lastName: 'Hassan', address1: '100 Queen St W', city: 'Toronto', province: 'Ontario', provinceCode: 'ON', country: 'Canada', countryCode: 'CA', zip: 'M5H 2N2' }, createdAt: '2024-02-20T10:00:00Z', updatedAt: daysAgo(1) },
      { id: 'cust_11', firstName: 'Lisa', lastName: 'Chen', email: 'lisa.c@example.com', phone: '+1 604-555-1111', state: 'enabled', ordersCount: 4, totalSpent: '478.50', note: '', tags: ['repeat'], taxExempt: false, acceptsMarketing: true, defaultAddress: { firstName: 'Lisa', lastName: 'Chen', address1: '800 Robson St', city: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', country: 'Canada', countryCode: 'CA', zip: 'V6Z 3B7' }, createdAt: '2023-10-20T10:00:00Z', updatedAt: daysAgo(1) },
      { id: 'cust_12', firstName: 'Emma', lastName: 'Williams', email: 'emma.w@example.com', phone: '+44 20 7946 0958', state: 'enabled', ordersCount: 2, totalSpent: '59.98', note: '', tags: [], taxExempt: false, acceptsMarketing: false, defaultAddress: { firstName: 'Emma', lastName: 'Williams', address1: '221B Baker St', city: 'London', province: '', provinceCode: '', country: 'United Kingdom', countryCode: 'GB', zip: 'NW1 6XE' }, createdAt: '2024-02-01T10:00:00Z', updatedAt: daysAgo(1) },
    ],

    discounts: [
      { id: 'disc_1', title: 'Summer Sale 10%', code: 'SUMMER10', type: 'percentage', value: '10', status: 'active', appliesTo: 'all', appliesToIds: [], minimumRequirement: 'min_purchase', minimumValue: '50.00', customerEligibility: 'all', usageLimit: 100, usageCount: 23, oncePerCustomer: false, startsAt: '2024-06-01T00:00:00Z', endsAt: '2024-08-31T23:59:59Z', createdAt: '2024-05-20T10:00:00Z' },
      { id: 'disc_2', title: 'Welcome 15% Off', code: 'WELCOME15', type: 'percentage', value: '15', status: 'active', appliesTo: 'all', appliesToIds: [], minimumRequirement: 'none', minimumValue: '0', customerEligibility: 'all', usageLimit: null, usageCount: 45, oncePerCustomer: true, startsAt: '2024-01-01T00:00:00Z', endsAt: null, createdAt: '2024-01-01T10:00:00Z' },
      { id: 'disc_3', title: 'Free Shipping', code: 'FREESHIP', type: 'free_shipping', value: '0', status: 'active', appliesTo: 'all', appliesToIds: [], minimumRequirement: 'min_purchase', minimumValue: '75.00', customerEligibility: 'all', usageLimit: null, usageCount: 67, oncePerCustomer: false, startsAt: '2024-01-01T00:00:00Z', endsAt: null, createdAt: '2024-01-01T10:00:00Z' },
      { id: 'disc_4', title: 'Flash Sale 25%', code: 'FLASH25', type: 'percentage', value: '25', status: 'expired', appliesTo: 'specific_collections', appliesToIds: ['coll_4'], minimumRequirement: 'none', minimumValue: '0', customerEligibility: 'all', usageLimit: 200, usageCount: 156, oncePerCustomer: false, startsAt: '2024-02-01T00:00:00Z', endsAt: daysAgo(7), createdAt: '2024-01-28T10:00:00Z' },
      { id: 'disc_5', title: 'Holiday 20% Off', code: 'HOLIDAY20', type: 'percentage', value: '20', status: 'scheduled', appliesTo: 'all', appliesToIds: [], minimumRequirement: 'none', minimumValue: '0', customerEligibility: 'all', usageLimit: 500, usageCount: 0, oncePerCustomer: false, startsAt: new Date(Date.now() + 30 * 86400000).toISOString(), endsAt: new Date(Date.now() + 60 * 86400000).toISOString(), createdAt: daysAgo(5) },
      { id: 'disc_6', title: 'BOGO Accessories', code: 'BOGO', type: 'buy_x_get_y', value: '0', status: 'active', appliesTo: 'specific_collections', appliesToIds: ['coll_5'], minimumRequirement: 'min_quantity', minimumValue: '2', customerEligibility: 'all', usageLimit: null, usageCount: 12, oncePerCustomer: false, startsAt: '2024-03-01T00:00:00Z', endsAt: null, createdAt: '2024-02-25T10:00:00Z' },
    ],

    draftOrders: [
      { id: 'draft_1', name: '#D1', status: 'open', customer: { id: 'cust_3', firstName: 'Marcus', lastName: 'Johnson' }, lineItems: [{ id: 'dli_1', productId: 'prod_1', title: 'Classic Cotton T-Shirt', variantTitle: 'Medium / White', quantity: 2, price: '24.99' }, { id: 'dli_2', productId: 'prod_8', title: 'Wool Beanie Hat', variantTitle: 'Charcoal', quantity: 1, price: '16.99' }], subtotalPrice: '66.97', totalTax: '5.36', totalPrice: '72.33', note: 'Wholesale order for review', tags: ['wholesale'], createdAt: daysAgo(5), updatedAt: daysAgo(5) },
      { id: 'draft_2', name: '#D2', status: 'invoice_sent', customer: { id: 'cust_2', firstName: 'Sarah', lastName: 'Kim' }, lineItems: [{ id: 'dli_3', productId: 'prod_4', title: 'Running Sneakers', variantTitle: '10', quantity: 2, price: '119.99' }, { id: 'dli_4', productId: 'prod_3', title: 'Leather Crossbody Bag', variantTitle: 'Default', quantity: 1, price: '89.99' }, { id: 'dli_5', productId: 'prod_1', title: 'Classic Cotton T-Shirt', variantTitle: 'Large / White', quantity: 2, price: '24.99' }], subtotalPrice: '379.95', totalTax: '30.40', totalPrice: '410.35', note: '', tags: [], createdAt: daysAgo(3), updatedAt: daysAgo(2) },
      { id: 'draft_3', name: '#D3', status: 'open', customer: null, lineItems: [{ id: 'dli_6', productId: 'prod_3', title: 'Leather Crossbody Bag', variantTitle: 'Default', quantity: 1, price: '89.99' }], subtotalPrice: '89.99', totalTax: '7.20', totalPrice: '97.19', note: '', tags: [], createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    ],

    giftCards: [
      { id: 'gc_1', code: '\u2022\u2022\u2022\u2022 7g4x', initialValue: '50.00', balance: '35.50', currency: 'USD', status: 'enabled', customerId: 'cust_2', note: 'Birthday gift', expiresOn: null, createdAt: '2024-02-14T10:00:00Z' },
      { id: 'gc_2', code: '\u2022\u2022\u2022\u2022 3m9p', initialValue: '25.00', balance: '25.00', currency: 'USD', status: 'enabled', customerId: 'cust_4', note: '', expiresOn: null, createdAt: '2024-03-01T10:00:00Z' },
      { id: 'gc_3', code: '\u2022\u2022\u2022\u2022 8k2r', initialValue: '100.00', balance: '0.00', currency: 'USD', status: 'disabled', customerId: null, note: 'Fully redeemed', expiresOn: null, createdAt: '2023-12-25T10:00:00Z' },
      { id: 'gc_4', code: '\u2022\u2022\u2022\u2022 5t1w', initialValue: '75.00', balance: '75.00', currency: 'USD', status: 'enabled', customerId: null, note: '', expiresOn: null, createdAt: '2024-03-05T10:00:00Z' },
    ],

    analytics: {
      dailyMetrics,
      totalSalesThisMonth,
      totalOrdersThisMonth,
      totalSessionsThisMonth,
    },

    pages: [
      { id: 'page_1', title: 'About Us', handle: 'about-us', bodyHtml: '<h2>About Evergreen Goods</h2><p>Founded in 2023 in Portland, Oregon, Evergreen Goods is a curated online store offering sustainable, high-quality products for everyday life. We believe that the things you use daily should be both beautiful and responsibly made.</p><p>Our team hand-selects each product, working directly with artisans and ethical manufacturers to bring you items that last. From organic skincare to handcrafted home goods, every product in our collection tells a story.</p><p>We are committed to reducing our environmental footprint through eco-friendly packaging, carbon-neutral shipping, and partnerships with organizations dedicated to reforestation.</p>', published: true, createdAt: '2023-06-15T10:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
      { id: 'page_2', title: 'Contact', handle: 'contact', bodyHtml: '<h2>Get in Touch</h2><p>We would love to hear from you! Whether you have a question about an order, want to learn more about our products, or just want to say hello, do not hesitate to reach out.</p><p><strong>Email:</strong> hello@evergreengoods.com<br/><strong>Phone:</strong> +1 (555) 123-4567<br/><strong>Hours:</strong> Monday - Friday, 9 AM - 5 PM PST</p><p><strong>Address:</strong><br/>Evergreen Goods<br/>123 Commerce St<br/>Portland, OR 97201</p>', published: true, createdAt: '2023-06-15T10:00:00Z', updatedAt: '2024-01-10T08:00:00Z' },
      { id: 'page_3', title: 'FAQ', handle: 'faq', bodyHtml: '<h2>Frequently Asked Questions</h2><p><strong>How long does shipping take?</strong><br/>Domestic orders typically arrive within 3-5 business days. International orders may take 7-14 business days.</p><p><strong>What is your return policy?</strong><br/>We accept returns within 30 days of purchase. Items must be unused and in original packaging. Contact us to initiate a return.</p><p><strong>Do you offer gift wrapping?</strong><br/>Yes! Add a note to your order requesting gift wrapping and we will wrap it beautifully at no extra charge.</p>', published: true, createdAt: '2023-07-01T10:00:00Z', updatedAt: '2024-02-15T08:00:00Z' },
      { id: 'page_4', title: 'Shipping & Returns', handle: 'shipping-returns', bodyHtml: '<h2>Shipping & Returns</h2><p><strong>Shipping:</strong> We offer flat-rate shipping at $5.99 for domestic orders. Free shipping on orders over $75. International shipping rates are calculated at checkout.</p><p><strong>Returns:</strong> Not happy with your purchase? We offer hassle-free returns within 30 days. Simply contact our support team and we will send you a prepaid return label.</p><p><strong>Exchanges:</strong> Need a different size or color? We are happy to exchange items. Contact us within 30 days of receiving your order.</p>', published: true, createdAt: '2023-06-20T10:00:00Z', updatedAt: '2024-01-15T08:00:00Z' },
    ],

    blogPosts: [
      { id: 'blog_1', title: '5 Summer Fashion Trends to Watch', author: 'Alex Chen', bodyHtml: '<p>This summer is all about bold colors, sustainable fabrics, and effortless style. Here are the top 5 trends we are excited about...</p><p>From organic cotton basics to handcrafted accessories, sustainable fashion continues to lead the way. Look for pieces that combine style with environmental consciousness.</p>', handle: '5-summer-fashion-trends', tags: ['fashion', 'summer', 'trends'], published: true, publishedAt: '2024-03-01T09:00:00Z', createdAt: '2024-02-28T15:00:00Z' },
      { id: 'blog_2', title: 'How to Style a Crossbody Bag', author: 'Alex Chen', bodyHtml: '<p>The crossbody bag is one of the most versatile accessories in your wardrobe. Here is how to make it work for any occasion...</p><p>Whether you are heading to brunch, running errands, or going out for date night, a quality leather crossbody bag elevates any outfit while keeping your essentials within easy reach.</p>', handle: 'how-to-style-crossbody-bag', tags: ['fashion', 'accessories', 'styling'], published: true, publishedAt: '2024-02-15T09:00:00Z', createdAt: '2024-02-14T12:00:00Z' },
      { id: 'blog_3', title: 'The Benefits of Organic Skincare', author: 'Alex Chen', bodyHtml: '<p>Why switch to organic skincare? The answer lies in what you are NOT putting on your skin. Free from parabens, synthetic fragrances, and harsh chemicals, organic products work with your skin rather than against it.</p><p>Our Organic Face Cream is formulated with shea butter, jojoba oil, and vitamin E to nourish and protect your skin naturally.</p>', handle: 'benefits-organic-skincare', tags: ['skincare', 'wellness', 'organic'], published: true, publishedAt: '2024-02-01T09:00:00Z', createdAt: '2024-01-30T16:00:00Z' },
      { id: 'blog_4', title: 'Gift Guide: Best Picks Under $50', author: 'Alex Chen', bodyHtml: '<p>Looking for the perfect gift that does not break the bank? We have curated our favorite picks all under $50. From scented candles to cozy beanies, these thoughtful gifts are sure to delight.</p>', handle: 'gift-guide-under-50', tags: ['gift', 'guide', 'holiday'], published: true, publishedAt: '2024-01-15T09:00:00Z', createdAt: '2024-01-14T10:00:00Z' },
      { id: 'blog_5', title: 'Sustainable Living Tips for 2024', author: 'Alex Chen', bodyHtml: '<p>Small changes can make a big difference. Here are our top tips for living more sustainably this year, from choosing reusable products to supporting ethical brands.</p><p>Start with swapping single-use plastics for our stainless steel water bottles and choosing organic, sustainably sourced products whenever possible.</p>', handle: 'sustainable-living-tips', tags: ['sustainability', 'eco', 'lifestyle'], published: true, publishedAt: '2024-01-05T09:00:00Z', createdAt: '2024-01-04T14:00:00Z' },
    ],

    navigationMenus: [
      { id: 'menu_1', title: 'Main menu', handle: 'main-menu', items: [{ id: 'mi_1', title: 'Home', url: '/', position: 1, children: [] }, { id: 'mi_2', title: 'Shop', url: '/collections/all', position: 2, children: [] }, { id: 'mi_3', title: 'Collections', url: '/collections', position: 3, children: [] }, { id: 'mi_4', title: 'About', url: '/pages/about-us', position: 4, children: [] }, { id: 'mi_5', title: 'Contact', url: '/pages/contact', position: 5, children: [] }] },
      { id: 'menu_2', title: 'Footer menu', handle: 'footer-menu', items: [{ id: 'mi_6', title: 'About', url: '/pages/about-us', position: 1, children: [] }, { id: 'mi_7', title: 'FAQ', url: '/pages/faq', position: 2, children: [] }, { id: 'mi_8', title: 'Shipping & Returns', url: '/pages/shipping-returns', position: 3, children: [] }, { id: 'mi_9', title: 'Contact', url: '/pages/contact', position: 4, children: [] }, { id: 'mi_10', title: 'Privacy Policy', url: '/pages/privacy-policy', position: 5, children: [] }] },
    ],

    settings: {
      storeName: 'Evergreen Goods',
      storeEmail: 'admin@evergreengoods.com',
      senderEmail: 'noreply@evergreengoods.com',
      storePhone: '+1 (555) 123-4567',
      currency: 'USD',
      timezone: '(GMT-08:00) Pacific Time',
      weightUnit: 'lb',
    },
  };
}

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'shopify_mock_state';
const BASE_INITIAL_KEY = 'shopify_mock_initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state }),
  }).catch(() => {});
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(createInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

export { createInitialData };
