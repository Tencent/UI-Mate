const BASE_KEY = 'woocommerce_mock_state'
const BASE_INITIAL_KEY = 'woocommerce_mock_initial'

export const getSessionId = () => {
  const url = new URL(window.location.href)
  const sid = url.searchParams.get('sid')
  if (sid) sessionStorage.setItem('wc_sid', sid)
  return sid || sessionStorage.getItem('wc_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${sid}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.has_custom_state && data.stored_state) return data.stored_state
    return null
  } catch { return null }
}

export function createInitialData() {
  const now = new Date('2026-04-11T12:00:00Z')
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString()

  const currentUser = {
    id: 'user_1',
    username: 'admin',
    displayName: 'Alex Rivera',
    email: 'alex@greenleaforganics.com',
    role: 'administrator',
    avatarUrl: 'https://placehold.co/32x32/1d2327/fff?text=AR'
  }

  const store = {
    id: 'store_1',
    name: 'GreenLeaf Organics',
    tagline: 'Fresh Organic Products Delivered',
    email: 'admin@greenleaforganics.com',
    address: { address1: '456 Market Street', address2: 'Suite 100', city: 'San Francisco', state: 'CA', country: 'US', postcode: '94102' },
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'left',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimals: 2,
    weightUnit: 'lbs',
    dimensionUnit: 'in',
    enableTax: true,
    enableCoupons: true,
    enableReviews: true,
    timezone: 'America/Los_Angeles',
    dateFormat: 'F j, Y',
    sellingLocation: 'all',
    shippingLocation: 'all',
    defaultCustomerLocation: 'base',
  }

  const categories = [
    { id: 'cat_1', name: 'Oils & Vinegars', slug: 'oils-vinegars', parent: null, description: 'Premium organic oils and vinegars', count: 4 },
    { id: 'cat_2', name: 'Snacks & Granola', slug: 'snacks-granola', parent: null, description: 'Healthy organic snacks and granola', count: 3 },
    { id: 'cat_3', name: 'Teas & Beverages', slug: 'teas-beverages', parent: null, description: 'Organic teas and beverages', count: 3 },
    { id: 'cat_4', name: 'Skincare', slug: 'skincare', parent: null, description: 'Natural organic skincare products', count: 3 },
    { id: 'cat_5', name: 'Supplements', slug: 'supplements', parent: null, description: 'Organic health supplements', count: 2 },
    { id: 'cat_6', name: 'Essential Oils', slug: 'essential-oils', parent: 'cat_4', description: 'Pure essential oils for skincare', count: 1 },
    { id: 'cat_7', name: 'Green Teas', slug: 'green-teas', parent: 'cat_3', description: 'Premium organic green teas', count: 2 },
  ]

  const tags = [
    { id: 'tag_1', name: 'organic', slug: 'organic', count: 15 },
    { id: 'tag_2', name: 'vegan', slug: 'vegan', count: 12 },
    { id: 'tag_3', name: 'gluten-free', slug: 'gluten-free', count: 10 },
    { id: 'tag_4', name: 'non-gmo', slug: 'non-gmo', count: 13 },
    { id: 'tag_5', name: 'fair-trade', slug: 'fair-trade', count: 6 },
    { id: 'tag_6', name: 'local', slug: 'local', count: 4 },
    { id: 'tag_7', name: 'seasonal', slug: 'seasonal', count: 5 },
    { id: 'tag_8', name: 'bestseller', slug: 'bestseller', count: 7 },
  ]

  const products = [
    {
      id: 'prod_1', name: 'Organic Avocado Oil', slug: 'organic-avocado-oil', type: 'simple', status: 'publish',
      featured: true, catalogVisibility: 'visible',
      description: '<p>Cold-pressed organic avocado oil, perfect for high-heat cooking and salad dressings. Rich in healthy monounsaturated fats and vitamin E.</p>',
      shortDescription: 'Premium cold-pressed avocado oil',
      sku: 'GAO-001', price: '24.99', regularPrice: '29.99', salePrice: '24.99', onSale: true,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 150, stockStatus: 'instock',
      weight: '0.5', dimensions: { length: '6', width: '3', height: '3' },
      categories: [{ id: 'cat_1', name: 'Oils & Vinegars' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_8', name: 'bestseller' }],
      images: [{ id: 'img_1', src: 'https://placehold.co/300x300/e8f5e9/2e7d32?text=Avocado+Oil', alt: 'Organic Avocado Oil' }],
      attributes: [], variations: [], reviewCount: 12, averageRating: '4.5',
      totalSales: 245, dateCreated: daysAgo(180), dateModified: daysAgo(10)
    },
    {
      id: 'prod_2', name: 'Raw Organic Honey', slug: 'raw-organic-honey', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Unfiltered raw honey sourced from organic wildflower meadows. Rich in antioxidants and natural enzymes.</p>',
      shortDescription: 'Unfiltered raw wildflower honey',
      sku: 'ROH-002', price: '18.99', regularPrice: '18.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 87, stockStatus: 'instock',
      weight: '1.0', dimensions: { length: '4', width: '4', height: '5' },
      categories: [{ id: 'cat_1', name: 'Oils & Vinegars' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_6', name: 'local' }],
      images: [{ id: 'img_2', src: 'https://placehold.co/300x300/fff8e1/f57f17?text=Raw+Honey', alt: 'Raw Organic Honey' }],
      attributes: [], variations: [], reviewCount: 8, averageRating: '4.8',
      totalSales: 189, dateCreated: daysAgo(160), dateModified: daysAgo(25)
    },
    {
      id: 'prod_3', name: 'Organic Apple Cider Vinegar', slug: 'organic-apple-cider-vinegar', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Raw unfiltered apple cider vinegar with the mother. Perfect for salad dressings, marinades, and wellness shots.</p>',
      shortDescription: 'Raw unfiltered ACV with the mother',
      sku: 'ACV-003', price: '12.99', regularPrice: '12.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 200, stockStatus: 'instock',
      weight: '0.8', dimensions: { length: '3', width: '3', height: '8' },
      categories: [{ id: 'cat_1', name: 'Oils & Vinegars' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_3', name: 'gluten-free' }],
      images: [{ id: 'img_3', src: 'https://placehold.co/300x300/fce4ec/c62828?text=ACV', alt: 'Apple Cider Vinegar' }],
      attributes: [], variations: [], reviewCount: 15, averageRating: '4.6',
      totalSales: 312, dateCreated: daysAgo(150), dateModified: daysAgo(5)
    },
    {
      id: 'prod_4', name: 'Granola Trail Mix', slug: 'granola-trail-mix', type: 'variable', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Certified organic granola trail mix with nuts, seeds, and dried berries. Available in Original and Chocolate varieties.</p>',
      shortDescription: 'Organic granola trail mix with nuts and berries',
      sku: 'GTM-004', price: '14.99', regularPrice: '16.99', salePrice: '14.99', onSale: true,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 45, stockStatus: 'instock',
      weight: '0.6', dimensions: { length: '8', width: '5', height: '2' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_3', name: 'gluten-free' }],
      images: [{ id: 'img_4', src: 'https://placehold.co/300x300/f3e5f5/7b1fa2?text=Granola', alt: 'Granola Trail Mix' }],
      attributes: [{ name: 'Flavor', options: ['Original', 'Chocolate'] }],
      variations: [
        { id: 'var_1', sku: 'GTM-004-OR', attributes: [{ name: 'Flavor', option: 'Original' }], price: '14.99', stockQuantity: 30 },
        { id: 'var_2', sku: 'GTM-004-CH', attributes: [{ name: 'Flavor', option: 'Chocolate' }], price: '14.99', stockQuantity: 15 }
      ],
      reviewCount: 6, averageRating: '4.3', totalSales: 98, dateCreated: daysAgo(120), dateModified: daysAgo(15)
    },
    {
      id: 'prod_5', name: 'Organic Almond Butter', slug: 'organic-almond-butter', type: 'simple', status: 'publish',
      featured: true, catalogVisibility: 'visible',
      description: '<p>Stone-ground organic almond butter made from raw sprouted almonds. No added sugars, oils, or preservatives.</p>',
      shortDescription: 'Stone-ground raw organic almond butter',
      sku: 'OAB-005', price: '16.99', regularPrice: '16.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 0, stockStatus: 'outofstock',
      weight: '0.7', dimensions: { length: '4', width: '4', height: '4' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_5', src: 'https://placehold.co/300x300/efebe9/4e342e?text=Almond+Butter', alt: 'Almond Butter' }],
      attributes: [], variations: [], reviewCount: 9, averageRating: '4.7',
      totalSales: 134, dateCreated: daysAgo(130), dateModified: daysAgo(3)
    },
    {
      id: 'prod_6', name: 'Organic Green Tea Matcha', slug: 'organic-green-tea-matcha', type: 'variable', status: 'publish',
      featured: true, catalogVisibility: 'visible',
      description: '<p>Ceremonial grade organic matcha green tea powder from Uji, Japan. Rich in antioxidants and L-theanine for calm focus.</p>',
      shortDescription: 'Ceremonial grade Japanese matcha',
      sku: 'OGM-006', price: '32.99', regularPrice: '38.99', salePrice: '32.99', onSale: true,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 8, stockStatus: 'instock',
      weight: '0.1', dimensions: { length: '3', width: '3', height: '4' },
      categories: [{ id: 'cat_3', name: 'Teas & Beverages' }, { id: 'cat_7', name: 'Green Teas' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_5', name: 'fair-trade' }, { id: 'tag_8', name: 'bestseller' }],
      images: [{ id: 'img_6', src: 'https://placehold.co/300x300/e8f5e9/1b5e20?text=Matcha', alt: 'Matcha Green Tea' }],
      attributes: [{ name: 'Size', options: ['30g', '100g'] }],
      variations: [
        { id: 'var_3', sku: 'OGM-006-30', attributes: [{ name: 'Size', option: '30g' }], price: '32.99', stockQuantity: 5 },
        { id: 'var_4', sku: 'OGM-006-100', attributes: [{ name: 'Size', option: '100g' }], price: '79.99', stockQuantity: 3 }
      ],
      reviewCount: 18, averageRating: '4.9', totalSales: 276, dateCreated: daysAgo(200), dateModified: daysAgo(2)
    },
    {
      id: 'prod_7', name: 'Organic Chamomile Tea', slug: 'organic-chamomile-tea', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Soothing organic chamomile flower tea, hand-picked and sun-dried. Perfect for relaxation and sleep support.</p>',
      shortDescription: 'Hand-picked organic chamomile tea',
      sku: 'OCT-007', price: '9.99', regularPrice: '9.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 120, stockStatus: 'instock',
      weight: '0.15', dimensions: { length: '5', width: '3', height: '5' },
      categories: [{ id: 'cat_3', name: 'Teas & Beverages' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_7', name: 'seasonal' }],
      images: [{ id: 'img_7', src: 'https://placehold.co/300x300/fffde7/f9a825?text=Chamomile', alt: 'Chamomile Tea' }],
      attributes: [], variations: [], reviewCount: 5, averageRating: '4.4',
      totalSales: 89, dateCreated: daysAgo(90), dateModified: daysAgo(20)
    },
    {
      id: 'prod_8', name: 'Rose Hip Facial Serum', slug: 'rose-hip-facial-serum', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Pure organic rosehip seed oil serum. Reduces fine lines, brightens skin tone, and provides deep hydration. For all skin types.</p>',
      shortDescription: 'Pure organic rosehip seed oil serum',
      sku: 'RFS-008', price: '44.99', regularPrice: '44.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 35, stockStatus: 'instock',
      weight: '0.1', dimensions: { length: '2', width: '2', height: '5' },
      categories: [{ id: 'cat_4', name: 'Skincare' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_8', src: 'https://placehold.co/300x300/fce4ec/c62828?text=Rose+Serum', alt: 'Rose Hip Serum' }],
      attributes: [], variations: [], reviewCount: 11, averageRating: '4.7',
      totalSales: 167, dateCreated: daysAgo(110), dateModified: daysAgo(8)
    },
    {
      id: 'prod_9', name: 'Lavender Essential Oil', slug: 'lavender-essential-oil', type: 'variable', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>100% pure certified organic lavender essential oil from Provence, France. Therapeutic grade, steam distilled.</p>',
      shortDescription: 'Pure organic lavender essential oil',
      sku: 'LEO-009', price: '19.99', regularPrice: '19.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 0, stockStatus: 'outofstock',
      weight: '0.1', dimensions: { length: '2', width: '2', height: '4' },
      categories: [{ id: 'cat_4', name: 'Skincare' }, { id: 'cat_6', name: 'Essential Oils' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_5', name: 'fair-trade' }],
      images: [{ id: 'img_9', src: 'https://placehold.co/300x300/ede7f6/4527a0?text=Lavender', alt: 'Lavender Essential Oil' }],
      attributes: [{ name: 'Size', options: ['10ml', '30ml'] }],
      variations: [
        { id: 'var_5', sku: 'LEO-009-10', attributes: [{ name: 'Size', option: '10ml' }], price: '19.99', stockQuantity: 0 },
        { id: 'var_6', sku: 'LEO-009-30', attributes: [{ name: 'Size', option: '30ml' }], price: '39.99', stockQuantity: 0 }
      ],
      reviewCount: 7, averageRating: '4.6', totalSales: 142, dateCreated: daysAgo(170), dateModified: daysAgo(30)
    },
    {
      id: 'prod_10', name: 'Organic Turmeric Capsules', slug: 'organic-turmeric-capsules', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>High-potency organic turmeric curcumin capsules with black pepper extract for enhanced absorption. 500mg per capsule.</p>',
      shortDescription: 'High-potency organic turmeric with black pepper',
      sku: 'OTC-010', price: '28.99', regularPrice: '28.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 63, stockStatus: 'instock',
      weight: '0.2', dimensions: { length: '3', width: '3', height: '5' },
      categories: [{ id: 'cat_5', name: 'Supplements' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_3', name: 'gluten-free' }, { id: 'tag_4', name: 'non-gmo' }, { id: 'tag_8', name: 'bestseller' }],
      images: [{ id: 'img_10', src: 'https://placehold.co/300x300/fff3e0/e65100?text=Turmeric', alt: 'Turmeric Capsules' }],
      attributes: [], variations: [], reviewCount: 14, averageRating: '4.5',
      totalSales: 203, dateCreated: daysAgo(140), dateModified: daysAgo(12)
    },
    {
      id: 'prod_11', name: 'Organic Spirulina Powder', slug: 'organic-spirulina-powder', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Certified organic spirulina powder packed with protein, vitamins, and minerals. Add to smoothies or juices.</p>',
      shortDescription: 'Certified organic spirulina superfood powder',
      sku: 'OSP-011', price: '34.99', regularPrice: '34.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 28, stockStatus: 'instock',
      weight: '0.25', dimensions: { length: '4', width: '4', height: '5' },
      categories: [{ id: 'cat_5', name: 'Supplements' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_3', name: 'gluten-free' }],
      images: [{ id: 'img_11', src: 'https://placehold.co/300x300/e0f2f1/00695c?text=Spirulina', alt: 'Spirulina Powder' }],
      attributes: [], variations: [], reviewCount: 4, averageRating: '4.2',
      totalSales: 76, dateCreated: daysAgo(60), dateModified: daysAgo(7)
    },
    {
      id: 'prod_12', name: 'Organic Coconut Oil', slug: 'organic-coconut-oil', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Virgin cold-pressed organic coconut oil. Ideal for cooking, baking, and beauty applications.</p>',
      shortDescription: 'Virgin cold-pressed organic coconut oil',
      sku: 'OCO-012', price: '15.99', regularPrice: '15.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 95, stockStatus: 'instock',
      weight: '1.2', dimensions: { length: '5', width: '5', height: '5' },
      categories: [{ id: 'cat_1', name: 'Oils & Vinegars' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_12', src: 'https://placehold.co/300x300/f1f8e9/558b2f?text=Coconut+Oil', alt: 'Coconut Oil' }],
      attributes: [], variations: [], reviewCount: 10, averageRating: '4.4',
      totalSales: 221, dateCreated: daysAgo(220), dateModified: daysAgo(18)
    },
    {
      id: 'prod_13', name: 'Organic Energy Bites', slug: 'organic-energy-bites', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>No-bake organic energy bites made with oats, dates, and dark chocolate chips. Perfect pre-workout snack.</p>',
      shortDescription: 'No-bake organic energy bites',
      sku: 'OEB-013', price: '11.99', regularPrice: '11.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 42, stockStatus: 'instock',
      weight: '0.4', dimensions: { length: '6', width: '4', height: '2' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_7', name: 'seasonal' }],
      images: [{ id: 'img_13', src: 'https://placehold.co/300x300/efebe9/3e2723?text=Energy+Bites', alt: 'Energy Bites' }],
      attributes: [], variations: [], reviewCount: 3, averageRating: '4.1',
      totalSales: 54, dateCreated: daysAgo(45), dateModified: daysAgo(1)
    },
    {
      id: 'prod_14', name: 'Organic Argan Oil', slug: 'organic-argan-oil', type: 'simple', status: 'draft',
      featured: false, catalogVisibility: 'visible',
      description: '<p>100% pure organic argan oil from Morocco. Rich in vitamin E and fatty acids for hair and skin nourishment.</p>',
      shortDescription: '100% pure Moroccan organic argan oil',
      sku: 'OAO-014', price: '39.99', regularPrice: '39.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 20, stockStatus: 'instock',
      weight: '0.1', dimensions: { length: '2', width: '2', height: '5' },
      categories: [{ id: 'cat_4', name: 'Skincare' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_5', name: 'fair-trade' }],
      images: [{ id: 'img_14', src: 'https://placehold.co/300x300/fff8e1/f57f17?text=Argan+Oil', alt: 'Argan Oil' }],
      attributes: [], variations: [], reviewCount: 0, averageRating: '0',
      totalSales: 0, dateCreated: daysAgo(5), dateModified: daysAgo(1)
    },
    {
      id: 'prod_15', name: 'Organic Peppermint Tea', slug: 'organic-peppermint-tea', type: 'simple', status: 'draft',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Refreshing organic peppermint leaf tea. Supports digestion and provides a natural energy boost without caffeine.</p>',
      shortDescription: 'Refreshing organic peppermint leaf tea',
      sku: 'OPT-015', price: '8.99', regularPrice: '8.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: false, stockQuantity: null, stockStatus: 'instock',
      weight: '0.12', dimensions: { length: '4', width: '3', height: '5' },
      categories: [{ id: 'cat_3', name: 'Teas & Beverages' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }],
      images: [{ id: 'img_15', src: 'https://placehold.co/300x300/e8f5e9/1b5e20?text=Peppermint', alt: 'Peppermint Tea' }],
      attributes: [], variations: [], reviewCount: 0, averageRating: '0',
      totalSales: 0, dateCreated: daysAgo(3), dateModified: daysAgo(1)
    },
    {
      id: 'prod_16', name: 'Organic Chia Seeds', slug: 'organic-chia-seeds', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Premium organic chia seeds packed with omega-3 fatty acids, fiber, and protein. Perfect for smoothies, puddings, and baking.</p>',
      shortDescription: 'Premium organic chia seeds',
      sku: 'OCS-016', price: '11.99', regularPrice: '11.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 95, stockStatus: 'instock',
      weight: '0.5', dimensions: { length: '5', width: '3', height: '7' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_3', name: 'gluten-free' }],
      images: [{ id: 'img_16', src: 'https://placehold.co/300x300/e8eaf6/283593?text=Chia+Seeds', alt: 'Chia Seeds' }],
      attributes: [], variations: [], reviewCount: 7, averageRating: '4.5',
      totalSales: 156, dateCreated: daysAgo(140), dateModified: daysAgo(12)
    },
    {
      id: 'prod_17', name: 'Organic Shea Butter Lotion', slug: 'organic-shea-butter-lotion', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Luxurious organic shea butter body lotion. Deeply moisturizes and nourishes dry skin with natural ingredients.</p>',
      shortDescription: 'Luxurious organic shea butter body lotion',
      sku: 'SBL-017', price: '28.99', regularPrice: '28.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 42, stockStatus: 'instock',
      weight: '0.4', dimensions: { length: '3', width: '3', height: '6' },
      categories: [{ id: 'cat_4', name: 'Skincare' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_17', src: 'https://placehold.co/300x300/fce4ec/880e4f?text=Shea+Lotion', alt: 'Shea Butter Lotion' }],
      attributes: [], variations: [], reviewCount: 4, averageRating: '4.3',
      totalSales: 78, dateCreated: daysAgo(85), dateModified: daysAgo(18)
    },
    {
      id: 'prod_18', name: 'Organic Flaxseed Oil', slug: 'organic-flaxseed-oil', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Cold-pressed organic flaxseed oil rich in ALA omega-3. Ideal for salads, smoothies, and daily supplementation.</p>',
      shortDescription: 'Cold-pressed organic flaxseed oil',
      sku: 'OFO-018', price: '19.99', regularPrice: '19.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 60, stockStatus: 'instock',
      weight: '0.6', dimensions: { length: '3', width: '3', height: '7' },
      categories: [{ id: 'cat_1', name: 'Oils & Vinegars' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_18', src: 'https://placehold.co/300x300/fff3e0/e65100?text=Flaxseed+Oil', alt: 'Flaxseed Oil' }],
      attributes: [], variations: [], reviewCount: 3, averageRating: '4.2',
      totalSales: 67, dateCreated: daysAgo(100), dateModified: daysAgo(22)
    },
    {
      id: 'prod_19', name: 'Organic Maca Root Powder', slug: 'organic-maca-root-powder', type: 'simple', status: 'publish',
      featured: true, catalogVisibility: 'visible',
      description: '<p>Premium organic maca root powder from Peru. Supports energy, stamina, and hormonal balance naturally.</p>',
      shortDescription: 'Premium Peruvian organic maca root powder',
      sku: 'MRP-019', price: '22.99', regularPrice: '26.99', salePrice: '22.99', onSale: true,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 38, stockStatus: 'instock',
      weight: '0.25', dimensions: { length: '4', width: '4', height: '5' },
      categories: [{ id: 'cat_5', name: 'Supplements' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_5', name: 'fair-trade' }],
      images: [{ id: 'img_19', src: 'https://placehold.co/300x300/ffe0b2/bf360c?text=Maca+Root', alt: 'Maca Root Powder' }],
      attributes: [], variations: [], reviewCount: 10, averageRating: '4.6',
      totalSales: 143, dateCreated: daysAgo(170), dateModified: daysAgo(6)
    },
    {
      id: 'prod_20', name: 'Organic Jasmine Green Tea', slug: 'organic-jasmine-green-tea', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Delicate organic jasmine-scented green tea leaves. Hand-rolled and naturally scented with jasmine blossoms.</p>',
      shortDescription: 'Hand-rolled organic jasmine green tea',
      sku: 'JGT-020', price: '15.99', regularPrice: '15.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 75, stockStatus: 'instock',
      weight: '0.15', dimensions: { length: '4', width: '3', height: '5' },
      categories: [{ id: 'cat_3', name: 'Teas & Beverages' }, { id: 'cat_7', name: 'Green Teas' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_5', name: 'fair-trade' }, { id: 'tag_7', name: 'seasonal' }],
      images: [{ id: 'img_20', src: 'https://placehold.co/300x300/f1f8e9/33691e?text=Jasmine+Tea', alt: 'Jasmine Green Tea' }],
      attributes: [], variations: [], reviewCount: 6, averageRating: '4.7',
      totalSales: 92, dateCreated: daysAgo(95), dateModified: daysAgo(14)
    },
    {
      id: 'prod_21', name: 'Organic Hemp Seed Hearts', slug: 'organic-hemp-seed-hearts', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Shelled organic hemp seeds rich in complete protein, omega-3 and omega-6. Sprinkle on salads, yogurt, or smoothies.</p>',
      shortDescription: 'Shelled organic hemp seed hearts',
      sku: 'HSH-021', price: '13.99', regularPrice: '13.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 110, stockStatus: 'instock',
      weight: '0.5', dimensions: { length: '5', width: '3', height: '7' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_3', name: 'gluten-free' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_21', src: 'https://placehold.co/300x300/e0f2f1/004d40?text=Hemp+Seeds', alt: 'Hemp Seed Hearts' }],
      attributes: [], variations: [], reviewCount: 5, averageRating: '4.4',
      totalSales: 88, dateCreated: daysAgo(115), dateModified: daysAgo(9)
    },
    {
      id: 'prod_22', name: 'Organic Tea Tree Oil', slug: 'organic-tea-tree-oil', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>100% pure organic tea tree essential oil. Known for its antibacterial and antifungal properties for skin care.</p>',
      shortDescription: '100% pure organic tea tree essential oil',
      sku: 'TTO-022', price: '14.99', regularPrice: '14.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 55, stockStatus: 'instock',
      weight: '0.05', dimensions: { length: '2', width: '2', height: '4' },
      categories: [{ id: 'cat_4', name: 'Skincare' }, { id: 'cat_6', name: 'Essential Oils' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_22', src: 'https://placehold.co/300x300/e8f5e9/1b5e20?text=Tea+Tree', alt: 'Tea Tree Oil' }],
      attributes: [], variations: [], reviewCount: 8, averageRating: '4.5',
      totalSales: 121, dateCreated: daysAgo(130), dateModified: daysAgo(11)
    },
    {
      id: 'prod_23', name: 'Organic Acai Berry Powder', slug: 'organic-acai-berry-powder', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Freeze-dried organic acai berry powder. Loaded with antioxidants, fiber, and heart-healthy fats for smoothie bowls.</p>',
      shortDescription: 'Freeze-dried organic acai berry powder',
      sku: 'ABP-023', price: '29.99', regularPrice: '34.99', salePrice: '29.99', onSale: true,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 28, stockStatus: 'instock',
      weight: '0.2', dimensions: { length: '4', width: '4', height: '5' },
      categories: [{ id: 'cat_5', name: 'Supplements' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_8', name: 'bestseller' }],
      images: [{ id: 'img_23', src: 'https://placehold.co/300x300/ce93d8/4a148c?text=Acai+Powder', alt: 'Acai Berry Powder' }],
      attributes: [], variations: [], reviewCount: 11, averageRating: '4.8',
      totalSales: 198, dateCreated: daysAgo(155), dateModified: daysAgo(4)
    },
    {
      id: 'prod_24', name: 'Organic Quinoa Grain', slug: 'organic-quinoa-grain', type: 'variable', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Premium organic quinoa grain, a complete protein source. Available in White and Tri-Color varieties.</p>',
      shortDescription: 'Premium organic quinoa grain',
      sku: 'OQG-024', price: '9.99', regularPrice: '9.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 130, stockStatus: 'instock',
      weight: '0.5', dimensions: { length: '6', width: '4', height: '2' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_3', name: 'gluten-free' }, { id: 'tag_5', name: 'fair-trade' }],
      images: [{ id: 'img_24', src: 'https://placehold.co/300x300/efebe9/3e2723?text=Quinoa', alt: 'Quinoa Grain' }],
      attributes: [{ name: 'Type', options: ['White', 'Tri-Color'] }],
      variations: [
        { id: 'var_5', sku: 'OQG-024-W', attributes: [{ name: 'Type', option: 'White' }], price: '9.99', stockQuantity: 80 },
        { id: 'var_6', sku: 'OQG-024-TC', attributes: [{ name: 'Type', option: 'Tri-Color' }], price: '11.99', stockQuantity: 50 }
      ],
      reviewCount: 9, averageRating: '4.6', totalSales: 174, dateCreated: daysAgo(165), dateModified: daysAgo(7)
    },
    {
      id: 'prod_25', name: 'Organic Vitamin D3 Drops', slug: 'organic-vitamin-d3-drops', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>Organic plant-based vitamin D3 drops in olive oil base. Supports bone health, immune function, and mood.</p>',
      shortDescription: 'Organic plant-based vitamin D3 drops',
      sku: 'VDD-025', price: '19.99', regularPrice: '19.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 65, stockStatus: 'instock',
      weight: '0.05', dimensions: { length: '2', width: '2', height: '4' },
      categories: [{ id: 'cat_5', name: 'Supplements' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_25', src: 'https://placehold.co/300x300/fff9c4/f57f17?text=Vitamin+D3', alt: 'Vitamin D3 Drops' }],
      attributes: [], variations: [], reviewCount: 7, averageRating: '4.7',
      totalSales: 105, dateCreated: daysAgo(120), dateModified: daysAgo(15)
    },
    {
      id: 'prod_26', name: 'Organic Dark Chocolate Bar', slug: 'organic-dark-chocolate-bar', type: 'variable', status: 'publish',
      featured: true, catalogVisibility: 'visible',
      description: '<p>Single-origin organic dark chocolate bar from Ecuador. Smooth, rich flavor with notes of cherry and cocoa.</p>',
      shortDescription: 'Single-origin organic dark chocolate',
      sku: 'DCB-026', price: '6.99', regularPrice: '6.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 200, stockStatus: 'instock',
      weight: '0.15', dimensions: { length: '6', width: '3', height: '0.5' },
      categories: [{ id: 'cat_2', name: 'Snacks & Granola' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_5', name: 'fair-trade' }, { id: 'tag_8', name: 'bestseller' }],
      images: [{ id: 'img_26', src: 'https://placehold.co/300x300/3e2723/ffab91?text=Dark+Choc', alt: 'Dark Chocolate Bar' }],
      attributes: [{ name: 'Cocoa %', options: ['70%', '85%'] }],
      variations: [
        { id: 'var_7', sku: 'DCB-026-70', attributes: [{ name: 'Cocoa %', option: '70%' }], price: '6.99', stockQuantity: 120 },
        { id: 'var_8', sku: 'DCB-026-85', attributes: [{ name: 'Cocoa %', option: '85%' }], price: '7.99', stockQuantity: 80 }
      ],
      reviewCount: 14, averageRating: '4.8', totalSales: 267, dateCreated: daysAgo(190), dateModified: daysAgo(3)
    },
    {
      id: 'prod_27', name: 'Organic Aloe Vera Gel', slug: 'organic-aloe-vera-gel', type: 'simple', status: 'publish',
      featured: false, catalogVisibility: 'visible',
      description: '<p>99% pure organic aloe vera gel. Soothes sunburn, moisturizes skin, and supports healing. No artificial colors or fragrances.</p>',
      shortDescription: '99% pure organic aloe vera gel',
      sku: 'AVG-027', price: '16.99', regularPrice: '16.99', salePrice: '', onSale: false,
      taxStatus: 'taxable', taxClass: '', manageStock: true, stockQuantity: 48, stockStatus: 'instock',
      weight: '0.35', dimensions: { length: '3', width: '3', height: '6' },
      categories: [{ id: 'cat_4', name: 'Skincare' }],
      tags: [{ id: 'tag_1', name: 'organic' }, { id: 'tag_2', name: 'vegan' }, { id: 'tag_4', name: 'non-gmo' }],
      images: [{ id: 'img_27', src: 'https://placehold.co/300x300/c8e6c9/1b5e20?text=Aloe+Vera', alt: 'Aloe Vera Gel' }],
      attributes: [], variations: [], reviewCount: 6, averageRating: '4.4',
      totalSales: 94, dateCreated: daysAgo(105), dateModified: daysAgo(16)
    },
  ]

  const customers = [
    { id: 'cust_1', email: 'sarah.johnson@example.com', firstName: 'Sarah', lastName: 'Johnson', username: 'sarahj', billing: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US', email: 'sarah.johnson@example.com', phone: '(503) 555-0123' }, shipping: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US' }, ordersCount: 8, totalSpent: '432.50', averageOrderValue: '54.06', dateCreated: daysAgo(310), dateLastActive: daysAgo(2), avatarUrl: 'https://placehold.co/40x40/7f54b3/fff?text=SJ', role: 'customer' },
    { id: 'cust_2', email: 'mike.davis@example.com', firstName: 'Mike', lastName: 'Davis', username: 'miked', billing: { firstName: 'Mike', lastName: 'Davis', company: 'Davis Fitness LLC', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US', email: 'mike.davis@example.com', phone: '(206) 555-0187' }, shipping: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US' }, ordersCount: 12, totalSpent: '789.25', averageOrderValue: '65.77', dateCreated: daysAgo(420), dateLastActive: daysAgo(1), avatarUrl: 'https://placehold.co/40x40/2271b1/fff?text=MD', role: 'customer' },
    { id: 'cust_3', email: 'emily.chen@example.com', firstName: 'Emily', lastName: 'Chen', username: 'emilyc', billing: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US', email: 'emily.chen@example.com', phone: '(415) 555-0234' }, shipping: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US' }, ordersCount: 15, totalSpent: '1024.75', averageOrderValue: '68.32', dateCreated: daysAgo(500), dateLastActive: daysAgo(1), avatarUrl: 'https://placehold.co/40x40/d63638/fff?text=EC', role: 'customer' },
    { id: 'cust_4', email: 'james.wilson@example.com', firstName: 'James', lastName: 'Wilson', username: 'jamesw', billing: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US', email: 'james.wilson@example.com', phone: '(720) 555-0345' }, shipping: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US' }, ordersCount: 5, totalSpent: '267.45', averageOrderValue: '53.49', dateCreated: daysAgo(200), dateLastActive: daysAgo(10), avatarUrl: 'https://placehold.co/40x40/1b5e20/fff?text=JW', role: 'customer' },
    { id: 'cust_5', email: 'lisa.martinez@example.com', firstName: 'Lisa', lastName: 'Martinez', username: 'lisam', billing: { firstName: 'Lisa', lastName: 'Martinez', company: 'Green Living Co', address1: '654 Cedar Lane', address2: 'Suite 200', city: 'Austin', state: 'TX', postcode: '78701', country: 'US', email: 'lisa.martinez@example.com', phone: '(512) 555-0456' }, shipping: { firstName: 'Lisa', lastName: 'Martinez', company: '', address1: '654 Cedar Lane', address2: '', city: 'Austin', state: 'TX', postcode: '78701', country: 'US' }, ordersCount: 7, totalSpent: '398.90', averageOrderValue: '56.99', dateCreated: daysAgo(280), dateLastActive: daysAgo(4), avatarUrl: 'https://placehold.co/40x40/e65100/fff?text=LM', role: 'customer' },
    { id: 'cust_6', email: 'tom.baker@example.com', firstName: 'Tom', lastName: 'Baker', username: 'tomb', billing: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US', email: 'tom.baker@example.com', phone: '(312) 555-0567' }, shipping: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US' }, ordersCount: 3, totalSpent: '142.97', averageOrderValue: '47.66', dateCreated: daysAgo(150), dateLastActive: daysAgo(20), avatarUrl: 'https://placehold.co/40x40/4527a0/fff?text=TB', role: 'customer' },
    { id: 'cust_7', email: 'anna.white@example.com', firstName: 'Anna', lastName: 'White', username: 'annaw', billing: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US', email: 'anna.white@example.com', phone: '(617) 555-0678' }, shipping: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US' }, ordersCount: 4, totalSpent: '218.50', averageOrderValue: '54.63', dateCreated: daysAgo(180), dateLastActive: daysAgo(7), avatarUrl: 'https://placehold.co/40x40/00695c/fff?text=AW', role: 'customer' },
    { id: 'cust_8', email: 'chris.taylor@example.com', firstName: 'Chris', lastName: 'Taylor', username: 'christ', billing: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US', email: 'chris.taylor@example.com', phone: '(615) 555-0789' }, shipping: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US' }, ordersCount: 6, totalSpent: '335.40', averageOrderValue: '55.90', dateCreated: daysAgo(240), dateLastActive: daysAgo(12), avatarUrl: 'https://placehold.co/40x40/558b2f/fff?text=CT', role: 'customer' },
    { id: 'cust_9', email: 'nina.patel@example.com', firstName: 'Nina', lastName: 'Patel', username: 'ninap', billing: { firstName: 'Nina', lastName: 'Patel', company: '', address1: '369 Ash Street', address2: '', city: 'Miami', state: 'FL', postcode: '33101', country: 'US', email: 'nina.patel@example.com', phone: '(305) 555-0890' }, shipping: { firstName: 'Nina', lastName: 'Patel', company: '', address1: '369 Ash Street', address2: '', city: 'Miami', state: 'FL', postcode: '33101', country: 'US' }, ordersCount: 1, totalSpent: '44.99', averageOrderValue: '44.99', dateCreated: daysAgo(30), dateLastActive: daysAgo(30), avatarUrl: 'https://placehold.co/40x40/c62828/fff?text=NP', role: 'customer' },
    { id: 'cust_10', email: 'robert.kim@example.com', firstName: 'Robert', lastName: 'Kim', username: 'robertk', billing: { firstName: 'Robert', lastName: 'Kim', company: '', address1: '741 Poplar Road', address2: 'Suite 5', city: 'Phoenix', state: 'AZ', postcode: '85001', country: 'US', email: 'robert.kim@example.com', phone: '(602) 555-0901' }, shipping: { firstName: 'Robert', lastName: 'Kim', company: '', address1: '741 Poplar Road', address2: '', city: 'Phoenix', state: 'AZ', postcode: '85001', country: 'US' }, ordersCount: 1, totalSpent: '89.97', averageOrderValue: '89.97', dateCreated: daysAgo(20), dateLastActive: daysAgo(20), avatarUrl: 'https://placehold.co/40x40/f57f17/fff?text=RK', role: 'customer' },
    { id: 'cust_11', email: 'julia.brooks@example.com', firstName: 'Julia', lastName: 'Brooks', username: 'juliab', billing: { firstName: 'Julia', lastName: 'Brooks', company: '', address1: '852 Hickory Lane', address2: '', city: 'Minneapolis', state: 'MN', postcode: '55401', country: 'US', email: 'julia.brooks@example.com', phone: '(612) 555-1012' }, shipping: { firstName: 'Julia', lastName: 'Brooks', company: '', address1: '852 Hickory Lane', address2: '', city: 'Minneapolis', state: 'MN', postcode: '55401', country: 'US' }, ordersCount: 1, totalSpent: '32.99', averageOrderValue: '32.99', dateCreated: daysAgo(15), dateLastActive: daysAgo(15), avatarUrl: 'https://placehold.co/40x40/7b1fa2/fff?text=JB', role: 'customer' },
    { id: 'cust_12', email: 'david.nguyen@example.com', firstName: 'David', lastName: 'Nguyen', username: 'davidn', billing: { firstName: 'David', lastName: 'Nguyen', company: '', address1: '963 Sycamore Blvd', address2: '', city: 'San Diego', state: 'CA', postcode: '92101', country: 'US', email: 'david.nguyen@example.com', phone: '(619) 555-1123' }, shipping: { firstName: 'David', lastName: 'Nguyen', company: '', address1: '963 Sycamore Blvd', address2: '', city: 'San Diego', state: 'CA', postcode: '92101', country: 'US' }, ordersCount: 1, totalSpent: '67.50', averageOrderValue: '67.50', dateCreated: daysAgo(8), dateLastActive: daysAgo(8), avatarUrl: 'https://placehold.co/40x40/1565c0/fff?text=DN', role: 'customer' },
  ]

  const makeNote = (id, content, daysBack, isCustomer = false, addedBy = 'system') => ({
    id, content, dateCreated: daysAgo(daysBack), isCustomerNote: isCustomer, addedBy
  })

  const orders = [
    { id: 'order_1', number: '1001', status: 'processing', dateCreated: daysAgo(2), dateModified: daysAgo(2), dateCompleted: null, datePaid: daysAgo(2), currency: 'USD', total: '89.97', subtotal: '84.97', totalTax: '5.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_1', billing: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US', email: 'sarah.johnson@example.com', phone: '(503) 555-0123' }, shipping: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US' }, lineItems: [{ id: 'li_1', productId: 'prod_1', name: 'Organic Avocado Oil', quantity: 2, price: '24.99', total: '49.98', sku: 'GAO-001' }, { id: 'li_2', productId: 'prod_3', name: 'Organic Apple Cider Vinegar', quantity: 1, price: '12.99', total: '12.99', sku: 'ACV-003' }, { id: 'li_3', productId: 'prod_7', name: 'Organic Chamomile Tea', quantity: 2, price: '9.99', total: '19.98', sku: 'OCT-007' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_1', 'Payment received via Stripe', 2)] },
    { id: 'order_2', number: '1002', status: 'processing', dateCreated: daysAgo(3), dateModified: daysAgo(3), dateCompleted: null, datePaid: daysAgo(3), currency: 'USD', total: '67.50', subtotal: '61.98', totalTax: '5.52', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_12', billing: { firstName: 'David', lastName: 'Nguyen', company: '', address1: '963 Sycamore Blvd', address2: '', city: 'San Diego', state: 'CA', postcode: '92101', country: 'US', email: 'david.nguyen@example.com', phone: '(619) 555-1123' }, shipping: { firstName: 'David', lastName: 'Nguyen', company: '', address1: '963 Sycamore Blvd', address2: '', city: 'San Diego', state: 'CA', postcode: '92101', country: 'US' }, lineItems: [{ id: 'li_4', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_5', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: 'Gift wrap please', orderNotes: [makeNote('note_2', 'Payment received via PayPal', 3)] },
    { id: 'order_3', number: '1003', status: 'processing', dateCreated: daysAgo(4), dateModified: daysAgo(4), dateCompleted: null, datePaid: daysAgo(4), currency: 'USD', total: '44.99', subtotal: '44.99', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_9', billing: { firstName: 'Nina', lastName: 'Patel', company: '', address1: '369 Ash Street', address2: '', city: 'Miami', state: 'FL', postcode: '33101', country: 'US', email: 'nina.patel@example.com', phone: '(305) 555-0890' }, shipping: { firstName: 'Nina', lastName: 'Patel', company: '', address1: '369 Ash Street', address2: '', city: 'Miami', state: 'FL', postcode: '33101', country: 'US' }, lineItems: [{ id: 'li_6', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_3', 'Payment received via Stripe', 4)] },
    { id: 'order_4', number: '1004', status: 'processing', dateCreated: daysAgo(5), dateModified: daysAgo(5), dateCompleted: null, datePaid: daysAgo(5), currency: 'USD', total: '125.96', subtotal: '119.96', totalTax: '6.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_2', billing: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US', email: 'mike.davis@example.com', phone: '(206) 555-0187' }, shipping: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US' }, lineItems: [{ id: 'li_7', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 2, price: '28.99', total: '57.98', sku: 'OTC-010' }, { id: 'li_8', productId: 'prod_11', name: 'Organic Spirulina Powder', quantity: 1, price: '34.99', total: '34.99', sku: 'OSP-011' }, { id: 'li_9', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 1, price: '18.99', total: '18.99', sku: 'ROH-002' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_4', 'Payment received via Stripe', 5)] },
    { id: 'order_5', number: '1005', status: 'processing', dateCreated: daysAgo(7), dateModified: daysAgo(7), dateCompleted: null, datePaid: daysAgo(7), currency: 'USD', total: '54.97', subtotal: '54.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_4', billing: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US', email: 'james.wilson@example.com', phone: '(720) 555-0345' }, shipping: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US' }, lineItems: [{ id: 'li_10', productId: 'prod_5', name: 'Organic Almond Butter', quantity: 1, price: '16.99', total: '16.99', sku: 'OAB-005' }, { id: 'li_11', productId: 'prod_4', name: 'Granola Trail Mix', quantity: 1, price: '14.99', total: '14.99', sku: 'GTM-004' }, { id: 'li_12', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 1, price: '18.99', total: '18.99', sku: 'ROH-002' }], shippingLines: [{ methodTitle: 'Flat rate', total: '5.99' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_5', 'Payment received via PayPal', 7)] },
    { id: 'order_6', number: '1006', status: 'processing', dateCreated: daysAgo(9), dateModified: daysAgo(9), dateCompleted: null, datePaid: daysAgo(9), currency: 'USD', total: '79.97', subtotal: '79.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_7', billing: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US', email: 'anna.white@example.com', phone: '(617) 555-0678' }, shipping: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US' }, lineItems: [{ id: 'li_13', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_14', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_6', 'Payment received via Stripe', 9)] },
    { id: 'order_7', number: '1007', status: 'processing', dateCreated: daysAgo(11), dateModified: daysAgo(11), dateCompleted: null, datePaid: daysAgo(11), currency: 'USD', total: '63.97', subtotal: '63.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_3', billing: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US', email: 'emily.chen@example.com', phone: '(415) 555-0234' }, shipping: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US' }, lineItems: [{ id: 'li_15', productId: 'prod_1', name: 'Organic Avocado Oil', quantity: 1, price: '24.99', total: '24.99', sku: 'GAO-001' }, { id: 'li_16', productId: 'prod_12', name: 'Organic Coconut Oil', quantity: 1, price: '15.99', total: '15.99', sku: 'OCO-012' }, { id: 'li_17', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 1, price: '18.99', total: '18.99', sku: 'ROH-002' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_7', 'Payment received via Stripe', 11)] },
    { id: 'order_8', number: '1008', status: 'processing', dateCreated: daysAgo(14), dateModified: daysAgo(14), dateCompleted: null, datePaid: daysAgo(14), currency: 'USD', total: '103.97', subtotal: '97.97', totalTax: '6.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_5', billing: { firstName: 'Lisa', lastName: 'Martinez', company: '', address1: '654 Cedar Lane', address2: '', city: 'Austin', state: 'TX', postcode: '78701', country: 'US', email: 'lisa.martinez@example.com', phone: '(512) 555-0456' }, shipping: { firstName: 'Lisa', lastName: 'Martinez', company: '', address1: '654 Cedar Lane', address2: '', city: 'Austin', state: 'TX', postcode: '78701', country: 'US' }, lineItems: [{ id: 'li_18', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }, { id: 'li_19', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_20', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_8', 'Payment received via Stripe', 14)] },
    // Completed orders
    { id: 'order_9', number: '1009', status: 'completed', dateCreated: daysAgo(18), dateModified: daysAgo(15), dateCompleted: daysAgo(15), datePaid: daysAgo(18), currency: 'USD', total: '89.97', subtotal: '84.97', totalTax: '5.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_2', billing: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US', email: 'mike.davis@example.com', phone: '(206) 555-0187' }, shipping: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US' }, lineItems: [{ id: 'li_21', productId: 'prod_1', name: 'Organic Avocado Oil', quantity: 2, price: '24.99', total: '49.98', sku: 'GAO-001' }, { id: 'li_22', productId: 'prod_3', name: 'Organic Apple Cider Vinegar', quantity: 1, price: '12.99', total: '12.99', sku: 'ACV-003' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_9', 'Payment received via Stripe', 18), makeNote('note_10', 'Order status changed from processing to completed.', 15)] },
    { id: 'order_10', number: '1010', status: 'completed', dateCreated: daysAgo(22), dateModified: daysAgo(19), dateCompleted: daysAgo(19), datePaid: daysAgo(22), currency: 'USD', total: '47.98', subtotal: '47.98', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_8', billing: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US', email: 'chris.taylor@example.com', phone: '(615) 555-0789' }, shipping: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US' }, lineItems: [{ id: 'li_23', productId: 'prod_7', name: 'Organic Chamomile Tea', quantity: 2, price: '9.99', total: '19.98', sku: 'OCT-007' }, { id: 'li_24', productId: 'prod_4', name: 'Granola Trail Mix', quantity: 1, price: '14.99', total: '14.99', sku: 'GTM-004' }], shippingLines: [{ methodTitle: 'Flat rate', total: '5.99' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_11', 'Payment received via PayPal', 22), makeNote('note_12', 'Order status changed from processing to completed.', 19)] },
    { id: 'order_11', number: '1011', status: 'completed', dateCreated: daysAgo(28), dateModified: daysAgo(24), dateCompleted: daysAgo(24), datePaid: daysAgo(28), currency: 'USD', total: '73.97', subtotal: '73.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_3', billing: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US', email: 'emily.chen@example.com', phone: '(415) 555-0234' }, shipping: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US' }, lineItems: [{ id: 'li_25', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }, { id: 'li_26', productId: 'prod_12', name: 'Organic Coconut Oil', quantity: 1, price: '15.99', total: '15.99', sku: 'OCO-012' }, { id: 'li_27', productId: 'prod_1', name: 'Organic Avocado Oil', quantity: 1, price: '24.99', total: '24.99', sku: 'GAO-001' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_13', 'Payment received via Stripe', 28)] },
    { id: 'order_12', number: '1012', status: 'completed', dateCreated: daysAgo(35), dateModified: daysAgo(30), dateCompleted: daysAgo(30), datePaid: daysAgo(35), currency: 'USD', total: '62.97', subtotal: '62.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'bacs', paymentMethodTitle: 'Direct Bank Transfer', customerId: 'cust_1', billing: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US', email: 'sarah.johnson@example.com', phone: '(503) 555-0123' }, shipping: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US' }, lineItems: [{ id: 'li_28', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 2, price: '18.99', total: '37.98', sku: 'ROH-002' }, { id: 'li_29', productId: 'prod_7', name: 'Organic Chamomile Tea', quantity: 1, price: '9.99', total: '9.99', sku: 'OCT-007' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_14', 'Payment received via Bank Transfer', 35)] },
    { id: 'order_13', number: '1013', status: 'completed', dateCreated: daysAgo(42), dateModified: daysAgo(38), dateCompleted: daysAgo(38), datePaid: daysAgo(42), currency: 'USD', total: '92.97', subtotal: '86.97', totalTax: '6.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_5', billing: { firstName: 'Lisa', lastName: 'Martinez', company: '', address1: '654 Cedar Lane', address2: '', city: 'Austin', state: 'TX', postcode: '78701', country: 'US', email: 'lisa.martinez@example.com', phone: '(512) 555-0456' }, shipping: { firstName: 'Lisa', lastName: 'Martinez', company: '', address1: '654 Cedar Lane', address2: '', city: 'Austin', state: 'TX', postcode: '78701', country: 'US' }, lineItems: [{ id: 'li_30', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_31', productId: 'prod_11', name: 'Organic Spirulina Powder', quantity: 1, price: '34.99', total: '34.99', sku: 'OSP-011' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_15', 'Payment received via Stripe', 42)] },
    // On-hold orders
    { id: 'order_14', number: '1014', status: 'on-hold', dateCreated: daysAgo(6), dateModified: daysAgo(6), dateCompleted: null, datePaid: null, currency: 'USD', total: '55.98', subtotal: '55.98', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'bacs', paymentMethodTitle: 'Direct Bank Transfer', customerId: 'cust_6', billing: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US', email: 'tom.baker@example.com', phone: '(312) 555-0567' }, shipping: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US' }, lineItems: [{ id: 'li_32', productId: 'prod_12', name: 'Organic Coconut Oil', quantity: 2, price: '15.99', total: '31.98', sku: 'OCO-012' }, { id: 'li_33', productId: 'prod_3', name: 'Organic Apple Cider Vinegar', quantity: 1, price: '12.99', total: '12.99', sku: 'ACV-003' }], shippingLines: [{ methodTitle: 'Flat rate', total: '5.99' }], couponLines: [], customerNote: 'Please confirm before shipping', orderNotes: [makeNote('note_16', 'Awaiting bank transfer payment', 6)] },
    { id: 'order_15', number: '1015', status: 'on-hold', dateCreated: daysAgo(10), dateModified: daysAgo(10), dateCompleted: null, datePaid: null, currency: 'USD', total: '44.98', subtotal: '44.98', totalTax: '0.00', shippingTotal: '5.99', discountTotal: '0.00', paymentMethod: 'bacs', paymentMethodTitle: 'Direct Bank Transfer', customerId: 'cust_4', billing: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US', email: 'james.wilson@example.com', phone: '(720) 555-0345' }, shipping: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US' }, lineItems: [{ id: 'li_34', productId: 'prod_4', name: 'Granola Trail Mix', quantity: 2, price: '14.99', total: '29.98', sku: 'GTM-004' }, { id: 'li_35', productId: 'prod_13', name: 'Organic Energy Bites', quantity: 1, price: '11.99', total: '11.99', sku: 'OEB-013' }], shippingLines: [{ methodTitle: 'Flat rate', total: '5.99' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_17', 'Awaiting bank transfer payment', 10)] },
    { id: 'order_16', number: '1016', status: 'on-hold', dateCreated: daysAgo(16), dateModified: daysAgo(16), dateCompleted: null, datePaid: null, currency: 'USD', total: '99.98', subtotal: '99.98', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'bacs', paymentMethodTitle: 'Direct Bank Transfer', customerId: 'cust_8', billing: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US', email: 'chris.taylor@example.com', phone: '(615) 555-0789' }, shipping: { firstName: 'Chris', lastName: 'Taylor', company: '', address1: '258 Spruce Court', address2: '', city: 'Nashville', state: 'TN', postcode: '37201', country: 'US' }, lineItems: [{ id: 'li_36', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }, { id: 'li_37', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_38', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 1, price: '18.99', total: '18.99', sku: 'ROH-002' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_18', 'Awaiting bank transfer payment', 16)] },
    // Pending orders
    { id: 'order_17', number: '1017', status: 'pending', dateCreated: daysAgo(1), dateModified: daysAgo(1), dateCompleted: null, datePaid: null, currency: 'USD', total: '89.97', subtotal: '84.97', totalTax: '5.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_10', billing: { firstName: 'Robert', lastName: 'Kim', company: '', address1: '741 Poplar Road', address2: '', city: 'Phoenix', state: 'AZ', postcode: '85001', country: 'US', email: 'robert.kim@example.com', phone: '(602) 555-0901' }, shipping: { firstName: 'Robert', lastName: 'Kim', company: '', address1: '741 Poplar Road', address2: '', city: 'Phoenix', state: 'AZ', postcode: '85001', country: 'US' }, lineItems: [{ id: 'li_39', productId: 'prod_1', name: 'Organic Avocado Oil', quantity: 1, price: '24.99', total: '24.99', sku: 'GAO-001' }, { id: 'li_40', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }, { id: 'li_41', productId: 'prod_11', name: 'Organic Spirulina Powder', quantity: 1, price: '34.99', total: '34.99', sku: 'OSP-011' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [] },
    { id: 'order_18', number: '1018', status: 'pending', dateCreated: daysAgo(2), dateModified: daysAgo(2), dateCompleted: null, datePaid: null, currency: 'USD', total: '32.99', subtotal: '32.99', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_11', billing: { firstName: 'Julia', lastName: 'Brooks', company: '', address1: '852 Hickory Lane', address2: '', city: 'Minneapolis', state: 'MN', postcode: '55401', country: 'US', email: 'julia.brooks@example.com', phone: '(612) 555-1012' }, shipping: { firstName: 'Julia', lastName: 'Brooks', company: '', address1: '852 Hickory Lane', address2: '', city: 'Minneapolis', state: 'MN', postcode: '55401', country: 'US' }, lineItems: [{ id: 'li_42', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [] },
    { id: 'order_19', number: '1019', status: 'pending', dateCreated: daysAgo(3), dateModified: daysAgo(3), dateCompleted: null, datePaid: null, currency: 'USD', total: '60.97', subtotal: '60.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_3', billing: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US', email: 'emily.chen@example.com', phone: '(415) 555-0234' }, shipping: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US' }, lineItems: [{ id: 'li_43', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }, { id: 'li_44', productId: 'prod_7', name: 'Organic Chamomile Tea', quantity: 1, price: '9.99', total: '9.99', sku: 'OCT-007' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [] },
    { id: 'order_20', number: '1020', status: 'pending', dateCreated: daysAgo(4), dateModified: daysAgo(4), dateCompleted: null, datePaid: null, currency: 'USD', total: '43.98', subtotal: '43.98', totalTax: '0.00', shippingTotal: '5.99', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_7', billing: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US', email: 'anna.white@example.com', phone: '(617) 555-0678' }, shipping: { firstName: 'Anna', lastName: 'White', company: '', address1: '147 Walnut Ave', address2: 'Apt 2', city: 'Boston', state: 'MA', postcode: '02101', country: 'US' }, lineItems: [{ id: 'li_45', productId: 'prod_2', name: 'Raw Organic Honey', quantity: 1, price: '18.99', total: '18.99', sku: 'ROH-002' }, { id: 'li_46', productId: 'prod_13', name: 'Organic Energy Bites', quantity: 1, price: '11.99', total: '11.99', sku: 'OEB-013' }], shippingLines: [{ methodTitle: 'Flat rate', total: '5.99' }], couponLines: [], customerNote: '', orderNotes: [] },
    // Cancelled
    { id: 'order_21', number: '1021', status: 'cancelled', dateCreated: daysAgo(25), dateModified: daysAgo(23), dateCompleted: null, datePaid: null, currency: 'USD', total: '44.99', subtotal: '44.99', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_6', billing: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US', email: 'tom.baker@example.com', phone: '(312) 555-0567' }, shipping: { firstName: 'Tom', lastName: 'Baker', company: '', address1: '987 Birch Street', address2: '', city: 'Chicago', state: 'IL', postcode: '60601', country: 'US' }, lineItems: [{ id: 'li_47', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_19', 'Order cancelled by customer', 23)] },
    { id: 'order_22', number: '1022', status: 'cancelled', dateCreated: daysAgo(40), dateModified: daysAgo(38), dateCompleted: null, datePaid: null, currency: 'USD', total: '28.99', subtotal: '28.99', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_4', billing: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US', email: 'james.wilson@example.com', phone: '(720) 555-0345' }, shipping: { firstName: 'James', lastName: 'Wilson', company: '', address1: '321 Maple Drive', address2: '', city: 'Denver', state: 'CO', postcode: '80203', country: 'US' }, lineItems: [{ id: 'li_48', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_20', 'Order cancelled - duplicate order', 38)] },
    // Refunded
    { id: 'order_23', number: '1023', status: 'refunded', dateCreated: daysAgo(50), dateModified: daysAgo(45), dateCompleted: null, datePaid: daysAgo(50), currency: 'USD', total: '79.97', subtotal: '79.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_3', billing: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US', email: 'emily.chen@example.com', phone: '(415) 555-0234' }, shipping: { firstName: 'Emily', lastName: 'Chen', company: '', address1: '456 Pine Road', address2: 'Unit 12', city: 'San Francisco', state: 'CA', postcode: '94105', country: 'US' }, lineItems: [{ id: 'li_49', productId: 'prod_9', name: 'Lavender Essential Oil', quantity: 2, price: '19.99', total: '39.98', sku: 'LEO-009' }, { id: 'li_50', productId: 'prod_12', name: 'Organic Coconut Oil', quantity: 1, price: '15.99', total: '15.99', sku: 'OCO-012' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_21', 'Full refund issued - product damaged in shipping', 45)] },
    { id: 'order_24', number: '1024', status: 'refunded', dateCreated: daysAgo(55), dateModified: daysAgo(52), dateCompleted: null, datePaid: daysAgo(55), currency: 'USD', total: '28.99', subtotal: '28.99', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'paypal', paymentMethodTitle: 'PayPal', customerId: 'cust_1', billing: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US', email: 'sarah.johnson@example.com', phone: '(503) 555-0123' }, shipping: { firstName: 'Sarah', lastName: 'Johnson', company: '', address1: '123 Oak Street', address2: 'Apt 4B', city: 'Portland', state: 'OR', postcode: '97201', country: 'US' }, lineItems: [{ id: 'li_51', productId: 'prod_10', name: 'Organic Turmeric Capsules', quantity: 1, price: '28.99', total: '28.99', sku: 'OTC-010' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_22', 'Refund issued - wrong item received', 52)] },
    // Failed
    { id: 'order_25', number: '1025', status: 'failed', dateCreated: daysAgo(8), dateModified: daysAgo(8), dateCompleted: null, datePaid: null, currency: 'USD', total: '67.97', subtotal: '67.97', totalTax: '0.00', shippingTotal: '0.00', discountTotal: '0.00', paymentMethod: 'stripe', paymentMethodTitle: 'Credit Card (Stripe)', customerId: 'cust_2', billing: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US', email: 'mike.davis@example.com', phone: '(206) 555-0187' }, shipping: { firstName: 'Mike', lastName: 'Davis', company: '', address1: '789 Elm Avenue', address2: '', city: 'Seattle', state: 'WA', postcode: '98101', country: 'US' }, lineItems: [{ id: 'li_52', productId: 'prod_6', name: 'Organic Green Tea Matcha', quantity: 1, price: '32.99', total: '32.99', sku: 'OGM-006' }, { id: 'li_53', productId: 'prod_8', name: 'Rose Hip Facial Serum', quantity: 1, price: '44.99', total: '44.99', sku: 'RFS-008' }], shippingLines: [{ methodTitle: 'Free shipping', total: '0.00' }], couponLines: [], customerNote: '', orderNotes: [makeNote('note_23', 'Payment failed - card declined', 8)] },
  ]

  const coupons = [
    { id: 'coupon_1', code: 'SAVE10', description: '10% off entire order', discountType: 'percent', amount: '10', dateCreated: daysAgo(100), dateExpires: new Date(now.getTime() + 240 * 86400000).toISOString(), usageCount: 34, usageLimit: 100, usageLimitPerUser: 1, minimumAmount: '25.00', maximumAmount: '', freeShipping: false, excludeSaleItems: false, productIds: [], categoryIds: [] },
    { id: 'coupon_2', code: 'FREESHIP', description: 'Free shipping on orders over $50', discountType: 'percent', amount: '0', dateCreated: daysAgo(90), dateExpires: null, usageCount: 67, usageLimit: null, usageLimitPerUser: null, minimumAmount: '50.00', maximumAmount: '', freeShipping: true, excludeSaleItems: false, productIds: [], categoryIds: [] },
    { id: 'coupon_3', code: 'WELCOME15', description: '$15 off for new customers', discountType: 'fixed_cart', amount: '15', dateCreated: daysAgo(60), dateExpires: null, usageCount: 12, usageLimit: null, usageLimitPerUser: 1, minimumAmount: '40.00', maximumAmount: '', freeShipping: false, excludeSaleItems: false, productIds: [], categoryIds: [] },
    { id: 'coupon_4', code: 'EXPIRED20', description: '20% off - expired promotion', discountType: 'percent', amount: '20', dateCreated: daysAgo(180), dateExpires: daysAgo(5), usageCount: 89, usageLimit: 100, usageLimitPerUser: null, minimumAmount: '', maximumAmount: '', freeShipping: false, excludeSaleItems: true, productIds: [], categoryIds: [] },
    { id: 'coupon_5', code: 'SKINCARE25', description: '25% off skincare products', discountType: 'percent', amount: '25', dateCreated: daysAgo(45), dateExpires: new Date(now.getTime() + 120 * 86400000).toISOString(), usageCount: 18, usageLimit: 50, usageLimitPerUser: 2, minimumAmount: '30.00', maximumAmount: '', freeShipping: false, excludeSaleItems: false, productIds: [], categoryIds: ['cat_4'] },
    { id: 'coupon_6', code: 'FLAT5OFF', description: '$5 off any order', discountType: 'fixed_cart', amount: '5', dateCreated: daysAgo(30), dateExpires: null, usageCount: 42, usageLimit: null, usageLimitPerUser: null, minimumAmount: '20.00', maximumAmount: '', freeShipping: false, excludeSaleItems: false, productIds: [], categoryIds: [] },
    { id: 'coupon_7', code: 'TEALOVERS', description: 'Free shipping on tea orders over $25', discountType: 'percent', amount: '0', dateCreated: daysAgo(20), dateExpires: new Date(now.getTime() + 90 * 86400000).toISOString(), usageCount: 8, usageLimit: 30, usageLimitPerUser: 1, minimumAmount: '25.00', maximumAmount: '', freeShipping: true, excludeSaleItems: false, productIds: [], categoryIds: ['cat_3'] },
    { id: 'coupon_8', code: 'BULKBUY10', description: '$10 off orders over $100', discountType: 'fixed_cart', amount: '10', dateCreated: daysAgo(15), dateExpires: null, usageCount: 5, usageLimit: null, usageLimitPerUser: null, minimumAmount: '100.00', maximumAmount: '', freeShipping: false, excludeSaleItems: false, productIds: [], categoryIds: [] },
  ]

  const reviews = [
    { id: 'review_1', productId: 'prod_1', productName: 'Organic Avocado Oil', reviewer: 'Sarah Johnson', reviewerEmail: 'sarah@example.com', rating: 5, review: 'Excellent quality oil! Perfect for high-heat cooking and the flavor is amazing in salad dressings. Will definitely reorder.', status: 'approved', dateCreated: daysAgo(20), verified: true },
    { id: 'review_2', productId: 'prod_6', productName: 'Organic Green Tea Matcha', reviewer: 'Emily Chen', reviewerEmail: 'emily@example.com', rating: 5, review: 'The best matcha I have ever tasted. Ceremonial grade is evident in the smooth, rich flavor with no bitterness. Perfect for lattes!', status: 'approved', dateCreated: daysAgo(15), verified: true },
    { id: 'review_3', productId: 'prod_10', productName: 'Organic Turmeric Capsules', reviewer: 'Mike Davis', reviewerEmail: 'mike@example.com', rating: 4, review: 'Great supplement, I have noticed reduced inflammation after 3 weeks of use. The black pepper extract helps with absorption. Good value.', status: 'approved', dateCreated: daysAgo(25), verified: true },
    { id: 'review_4', productId: 'prod_8', productName: 'Rose Hip Facial Serum', reviewer: 'Lisa Martinez', reviewerEmail: 'lisa@example.com', rating: 5, review: 'My skin has never looked better! This serum absorbs quickly, does not feel greasy, and I can see visible improvement in fine lines after 4 weeks.', status: 'approved', dateCreated: daysAgo(18), verified: true },
    { id: 'review_5', productId: 'prod_2', productName: 'Raw Organic Honey', reviewer: 'Chris Taylor', reviewerEmail: 'chris@example.com', rating: 5, review: 'Incredible honey - you can taste the difference from commercial brands. The floral notes are complex and it crystallizes naturally which is a good sign.', status: 'approved', dateCreated: daysAgo(30), verified: true },
    { id: 'review_6', productId: 'prod_3', productName: 'Organic Apple Cider Vinegar', reviewer: 'Anna White', reviewerEmail: 'anna@example.com', rating: 4, review: 'Great ACV with visible mother culture. I use it daily in water and my digestion has improved. Slightly strong taste but that is expected.', status: 'approved', dateCreated: daysAgo(12), verified: true },
    { id: 'review_7', productId: 'prod_5', productName: 'Organic Almond Butter', reviewer: 'Tom Baker', reviewerEmail: 'tom@example.com', rating: 5, review: 'The creamiest almond butter I have ever had. Stone-ground texture is perfect, and I love that it is just almonds with no added ingredients.', status: 'approved', dateCreated: daysAgo(40), verified: true },
    { id: 'review_8', productId: 'prod_12', productName: 'Organic Coconut Oil', reviewer: 'James Wilson', reviewerEmail: 'james@example.com', rating: 4, review: 'Good quality coconut oil with great coconut scent. Solid at room temperature as expected. Melts nicely for cooking.', status: 'approved', dateCreated: daysAgo(35), verified: false },
    { id: 'review_9', productId: 'prod_1', productName: 'Organic Avocado Oil', reviewer: 'Nina Patel', reviewerEmail: 'nina@example.com', rating: 4, review: 'Good quality avocado oil. Light color and neutral flavor. Great for cooking at high temperatures without smoke.', status: 'approved', dateCreated: daysAgo(8), verified: false },
    { id: 'review_10', productId: 'prod_4', productName: 'Granola Trail Mix', reviewer: 'David Nguyen', reviewerEmail: 'david@example.com', rating: 4, review: 'Delicious granola with good crunch. Loved the mix of nuts and berries. Not too sweet. The chocolate flavor option is particularly good.', status: 'approved', dateCreated: daysAgo(5), verified: true },
    { id: 'review_11', productId: 'prod_11', productName: 'Organic Spirulina Powder', reviewer: 'Robert Kim', reviewerEmail: 'robert@example.com', rating: 3, review: 'Good spirulina but the taste is quite strong even when mixed in smoothies. Adding banana helps mask the flavor. Effective supplement though.', status: 'approved', dateCreated: daysAgo(22), verified: true },
    { id: 'review_12', productId: 'prod_7', productName: 'Organic Chamomile Tea', reviewer: 'Julia Brooks', reviewerEmail: 'julia@example.com', rating: 5, review: 'So calming and flavorful! I have been drinking this every night before bed and my sleep quality has improved. Beautiful floral aroma.', status: 'approved', dateCreated: daysAgo(10), verified: false },
    { id: 'review_13', productId: 'prod_6', productName: 'Organic Green Tea Matcha', reviewer: 'Chris Taylor', reviewerEmail: 'chris@example.com', rating: 5, review: 'Absolutely premium matcha. The color is vibrant green, mixes smoothly without clumps, and the flavor is earthy and sweet without any bitterness.', status: 'approved', dateCreated: daysAgo(45), verified: true },
    { id: 'review_14', productId: 'prod_8', productName: 'Rose Hip Facial Serum', reviewer: 'Emily Chen', reviewerEmail: 'emily@example.com', rating: 5, review: 'I have been using this for 2 months now and my skin tone is noticeably more even. The vitamin C content really helps with brightening.', status: 'approved', dateCreated: daysAgo(60), verified: true },
    { id: 'review_15', productId: 'prod_10', productName: 'Organic Turmeric Capsules', reviewer: 'Lisa Martinez', reviewerEmail: 'lisa@example.com', rating: 4, review: 'Great product, good sourcing. I take 2 capsules daily for joint support. Will continue purchasing.', status: 'approved', dateCreated: daysAgo(55), verified: true },
    { id: 'review_16', productId: 'prod_13', productName: 'Organic Energy Bites', reviewer: 'Mike Davis', reviewerEmail: 'mike@example.com', rating: 4, review: 'Perfect pre-workout snack. Natural energy boost without the crash. The date-oat combination is filling and delicious.', status: 'approved', dateCreated: daysAgo(3), verified: true },
    // On-hold reviews
    { id: 'review_17', productId: 'prod_1', productName: 'Organic Avocado Oil', reviewer: 'Guest Reviewer', reviewerEmail: 'guest1@example.com', rating: 3, review: 'The oil quality seems good but the bottle leaked during shipping. Packaging could be improved. Contacted support.', status: 'hold', dateCreated: daysAgo(2), verified: false },
    { id: 'review_18', productId: 'prod_3', productName: 'Organic Apple Cider Vinegar', reviewer: 'Anonymous', reviewerEmail: 'anon@example.com', rating: 5, review: 'Best ACV on the market! Cured my acid reflux, improved my skin, lost 10 pounds. This is a miracle product!', status: 'hold', dateCreated: daysAgo(1), verified: false },
    { id: 'review_19', productId: 'prod_6', productName: 'Organic Green Tea Matcha', reviewer: 'First Time Buyer', reviewerEmail: 'firsttime@example.com', rating: 4, review: 'My first time trying matcha and I am impressed. Slightly bitter for my taste but adding honey makes it perfect.', status: 'hold', dateCreated: daysAgo(3), verified: false },
    { id: 'review_20', productId: 'prod_12', productName: 'Organic Coconut Oil', reviewer: 'Regular Customer', reviewerEmail: 'regular@example.com', rating: 3, review: 'The oil is good quality but the price has increased recently. Still buying but hoping they will have a sale soon.', status: 'hold', dateCreated: daysAgo(4), verified: false },
  ]

  // Generate 30 days of analytics data
  const analyticsData = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const dateStr = d.toISOString().split('T')[0]
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const baseRevenue = isWeekend ? 900 : 1300
    const variation = Math.floor(Math.random() * 400) - 200
    const grossRevenue = Math.max(600, baseRevenue + variation + (29 - i) * 10)
    const ordersCount = Math.floor(grossRevenue / 75)
    const refunds = i % 7 === 0 ? 50 : 0
    const couponsAmt = Math.floor(ordersCount * 2.5)
    const taxes = Math.floor(grossRevenue * 0.06)
    const shipping = Math.floor(ordersCount * 3)
    const netRevenue = grossRevenue - refunds - couponsAmt
    const prevGrossRevenue = Math.floor(grossRevenue * 0.85)
    analyticsData.push({
      date: dateStr,
      grossRevenue, ordersCount, refunds, coupons: couponsAmt, taxes, shipping, netRevenue,
      previousGrossRevenue: prevGrossRevenue,
      previousNetRevenue: Math.floor(prevGrossRevenue * 0.9),
      previousOrdersCount: Math.floor(ordersCount * 0.85)
    })
  }

  const analyticsRevenueSummary = {
    period: 'month',
    dateRange: { start: '2026-03-01', end: '2026-03-31' },
    grossRevenue: analyticsData.reduce((s, d) => s + d.grossRevenue, 0),
    refunds: analyticsData.reduce((s, d) => s + d.refunds, 0),
    coupons: analyticsData.reduce((s, d) => s + d.coupons, 0),
    taxes: analyticsData.reduce((s, d) => s + d.taxes, 0),
    shipping: analyticsData.reduce((s, d) => s + d.shipping, 0),
    netRevenue: analyticsData.reduce((s, d) => s + d.netRevenue, 0),
    ordersCount: analyticsData.reduce((s, d) => s + d.ordersCount, 0),
    previousPeriod: {
      grossRevenue: analyticsData.reduce((s, d) => s + d.previousGrossRevenue, 0),
      netRevenue: analyticsData.reduce((s, d) => s + d.previousNetRevenue, 0),
      ordersCount: analyticsData.reduce((s, d) => s + d.previousOrdersCount, 0),
    }
  }

  const topProducts = [
    { productId: 'prod_1', name: 'Organic Avocado Oil', itemsSold: 45, netRevenue: 1124.55, ordersCount: 38 },
    { productId: 'prod_6', name: 'Organic Green Tea Matcha', itemsSold: 38, netRevenue: 1253.62, ordersCount: 31 },
    { productId: 'prod_10', name: 'Organic Turmeric Capsules', itemsSold: 35, netRevenue: 1014.65, ordersCount: 29 },
    { productId: 'prod_8', name: 'Rose Hip Facial Serum', itemsSold: 29, netRevenue: 1304.71, ordersCount: 24 },
    { productId: 'prod_3', name: 'Organic Apple Cider Vinegar', itemsSold: 52, netRevenue: 675.48, ordersCount: 43 },
  ]

  const notifications = [
    { id: 'notif_1', type: 'info', title: 'New order received', content: 'Order #1025 placed by Mike Davis for $67.50. Payment pending.', dateCreated: daysAgo(0.3), isRead: false, actions: [{ label: 'View order', url: '/orders/order_25' }] },
    { id: 'notif_2', type: 'warning', title: 'Low stock alert', content: 'Organic Green Tea Matcha (30g) has only 5 units remaining.', dateCreated: daysAgo(0.5), isRead: false, actions: [{ label: 'Update stock', url: '/products/prod_6' }] },
    { id: 'notif_3', type: 'success', title: 'New 5-star review', content: 'Emily Chen left a 5-star review on Organic Green Tea Matcha.', dateCreated: daysAgo(1), isRead: false, actions: [{ label: 'View review', url: '/products/prod_6' }] },
    { id: 'notif_4', type: 'info', title: 'XooCommerce tip', content: 'Enable product reviews to build social proof and increase conversions.', dateCreated: daysAgo(3), isRead: true, actions: [] },
    { id: 'notif_5', type: 'info', title: 'Order completed', content: 'Order #1013 by Lisa Martinez has been marked as completed.', dateCreated: daysAgo(5), isRead: true, actions: [{ label: 'View order', url: '/orders/order_13' }] },
    { id: 'notif_6', type: 'success', title: 'Coupon usage milestone', content: 'Your SAVE10 coupon has been used 34 times this month!', dateCreated: daysAgo(7), isRead: true, actions: [] },
    { id: 'notif_7', type: 'info', title: 'Store setup reminder', content: 'Complete your store setup: add your store logo and configure payment gateways.', dateCreated: daysAgo(10), isRead: true, actions: [] },
    { id: 'notif_8', type: 'warning', title: 'Products out of stock', content: 'Organic Almond Butter and Lavender Essential Oil are out of stock.', dateCreated: daysAgo(12), isRead: true, actions: [{ label: 'Manage products', url: '/products' }] },
  ]

  const shippingZones = [
    { id: 'zone_1', name: 'United States', regions: ['US'], methods: [{ id: 'flat_rate', title: 'Flat Rate', cost: '5.99', enabled: true }, { id: 'free_shipping', title: 'Free Shipping', minAmount: '50.00', enabled: true }] },
    { id: 'zone_2', name: 'Canada', regions: ['CA'], methods: [{ id: 'flat_rate_ca', title: 'Flat Rate', cost: '12.99', enabled: true }] },
    { id: 'zone_3', name: 'International', regions: ['*'], methods: [{ id: 'flat_rate_intl', title: 'Flat Rate', cost: '24.99', enabled: true }] },
  ]

  const taxRates = [
    { id: 'tax_1', country: 'US', state: 'CA', postcode: '', city: '', rate: '7.25', name: 'State Tax', priority: 1, compound: false, shipping: true, taxClass: 'standard' },
    { id: 'tax_2', country: 'US', state: 'NY', postcode: '', city: '', rate: '8.00', name: 'State Tax', priority: 1, compound: false, shipping: true, taxClass: 'standard' },
    { id: 'tax_3', country: 'US', state: 'TX', postcode: '', city: '', rate: '6.25', name: 'State Tax', priority: 1, compound: false, shipping: false, taxClass: 'standard' },
  ]

  const paymentGateways = [
    { id: 'stripe', title: 'Credit Card (Stripe)', description: 'Pay with your credit card via Stripe.', enabled: true, order: 0 },
    { id: 'paypal', title: 'PayPal', description: 'Pay via PayPal; you can pay with your credit card if you do not have a PayPal account.', enabled: true, order: 1 },
    { id: 'bacs', title: 'Direct Bank Transfer', description: 'Make your payment directly into our bank account.', enabled: true, order: 2 },
    { id: 'cod', title: 'Cash on Delivery', description: 'Pay with cash upon delivery.', enabled: false, order: 3 },
  ]

  return {
    currentUser,
    store,
    products,
    categories,
    tags,
    orders,
    customers,
    coupons,
    reviews,
    analytics: {
      dailyData: analyticsData,
      revenueSummary: analyticsRevenueSummary,
      topProducts,
    },
    notifications,
    shippingZones,
    taxRates,
    paymentGateways,
  }
}

function deepMerge(target, source) {
  if (!source) return target
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue
    if (Array.isArray(source[key])) {
      result[key] = source[key]
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid)
  const iKey = initialKey(sid)

  if (customState) {
    const base = createInitialData()
    const merged = { ...base, ...customState }
    localStorage.setItem(sKey, JSON.stringify(merged))
    if (!localStorage.getItem(iKey)) {
      localStorage.setItem(iKey, JSON.stringify(merged))
    }
    return merged
  }

  const stored = localStorage.getItem(sKey)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* fall through */ }
  }

  const data = createInitialData()
  localStorage.setItem(sKey, JSON.stringify(data))
  localStorage.setItem(iKey, JSON.stringify(data))
  return data
}

export function saveState(state, sid = null) {
  const sKey = storageKey(sid)
  localStorage.setItem(sKey, JSON.stringify(state))
  if (sid) {
    fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {})
  }
}
