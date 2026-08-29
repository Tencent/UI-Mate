const BASE_STORAGE_KEY = 'amazonSellerState';
const BASE_INITIAL_KEY = 'amazonSellerInitialState';

export function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
export function initialKey(sid) {
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

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) return JSON.parse(stored);
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) {}
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  }
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const defaults = createInitialData();
    const initialData = deepMergeData(defaults, customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    // Write .initial.json on server for set action
    if (sid) {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state: initialData }),
      }).catch(() => {});
    }
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }

  const freshData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(freshData));
  localStorage.setItem(ik, JSON.stringify(freshData));
  // Write .initial.json on server
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: freshData }),
    }).catch(() => {});
  }
  return freshData;
};

function deepMergeData(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === 'object') {
      result[key] = deepMergeData(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function randomSales(base, variance) {
  return Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100;
}

function generateDailySnapshots() {
  const snapshots = [];
  const today = new Date('2026-04-10');
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    const trendFactor = 1 + (90 - i) * 0.002;
    snapshots.push({
      date: dateStr,
      orderedProductSales: randomSales(1150 * weekendFactor * trendFactor, 250),
      unitsOrdered: Math.round(randomSales(42 * weekendFactor * trendFactor, 10)),
      totalOrderItems: Math.round(randomSales(48 * weekendFactor * trendFactor, 12)),
      pageViews: Math.round(randomSales(3200 * weekendFactor * trendFactor, 600)),
      sessions: Math.round(randomSales(2800 * weekendFactor * trendFactor, 500)),
      buyBoxPercentage: randomSales(78, 6),
      orderItemSessionPercentage: randomSales(1.8, 0.4)
    });
  }
  return snapshots;
}

export function createInitialData() {
  const products = [
    { id: 'PROD_001', asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 45, reservedQuantity: 3, inboundQuantity: 100, buyBoxOwner: true, buyBoxPrice: 18.99, lowestPrice: 18.99, rating: 4.5, reviewCount: 287, bulletPoints: ['Hand-poured 100% soy wax candle', 'Natural lavender essential oil fragrance', 'Burns cleanly for 40+ hours', 'Reusable glass jar with wooden lid', 'Made in Austin, TX'], description: 'Our signature lavender soy candle brings calming relaxation to any room. Hand-poured with premium soy wax and pure lavender essential oil.', keywords: 'lavender candle, soy candle, scented candle, relaxation, aromatherapy', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2024-03-15T10:00:00Z', lastUpdated: '2026-04-09T12:00:00Z' },
    { id: 'PROD_002', asin: 'B09ABCDEF2', sku: 'EHG-CANDLE-VAN-01', title: 'Evergreen Vanilla Bean Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: 15.99, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 62, reservedQuantity: 5, inboundQuantity: 100, buyBoxOwner: true, buyBoxPrice: 15.99, lowestPrice: 15.99, rating: 4.6, reviewCount: 342, bulletPoints: ['Rich vanilla bean fragrance', '100% natural soy wax blend', '45+ hour burn time', 'Lead-free cotton wick'], description: 'A warm, comforting vanilla bean candle perfect for cozy evenings. Made with 100% natural soy wax and premium vanilla extract.', keywords: 'vanilla candle, soy candle, scented candle, home fragrance', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2024-03-15T10:00:00Z', lastUpdated: '2026-04-08T10:00:00Z' },
    { id: 'PROD_003', asin: 'B09ABCDEF3', sku: 'EHG-CANDLE-EUC-01', title: 'Evergreen Eucalyptus & Mint Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 19.99, salePrice: null, costOfGoods: 5.75, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 8, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 19.99, lowestPrice: 19.49, rating: 4.4, reviewCount: 198, bulletPoints: ['Invigorating eucalyptus and mint blend', 'Pure essential oils for natural aroma', 'Clean-burning soy wax', 'Eco-friendly packaging'], description: 'Refresh your space with our eucalyptus and mint candle. Crafted with pure essential oils for a spa-like experience.', keywords: 'eucalyptus candle, mint candle, soy candle, spa candle, refresh', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2024-06-01T10:00:00Z', lastUpdated: '2026-04-10T08:00:00Z' },
    { id: 'PROD_004', asin: 'B09ABCDEF4', sku: 'EHG-CANDLE-CIT-01', title: 'Evergreen Citrus Grove Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 33, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 17.99, lowestPrice: 17.99, rating: 4.3, reviewCount: 156, bulletPoints: ['Bright citrus blend of orange, lemon and grapefruit', 'Energizing natural fragrance', '40+ hour burn time', 'Recyclable glass container'], description: 'Brighten your day with our citrus grove candle. A refreshing blend of orange, lemon, and grapefruit essential oils.', keywords: 'citrus candle, orange candle, lemon candle, fresh candle', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2024-09-10T10:00:00Z', lastUpdated: '2026-04-05T10:00:00Z' },
    { id: 'PROD_005', asin: 'B09ABCDEF5', sku: 'EHG-CANDLE-SEA-01', title: 'Evergreen Sea Breeze Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBM', status: 'Active', condition: 'New', availableQuantity: 28, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 18.99, lowestPrice: 18.99, rating: 4.2, reviewCount: 89, bulletPoints: ['Ocean-inspired fragrance', 'Calming sea salt and driftwood notes', '100% soy wax', 'Hand-poured in small batches'], description: 'Bring the coast to your home with our sea breeze candle. Notes of sea salt, driftwood, and ocean mist.', keywords: 'sea breeze candle, ocean candle, beach candle, coastal', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2025-01-20T10:00:00Z', lastUpdated: '2026-04-01T10:00:00Z' },
    { id: 'PROD_006', asin: 'B09ABCDEF6', sku: 'EHG-CANDLE-ROSE-01', title: 'Evergreen Rose Garden Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 19.99, salePrice: null, costOfGoods: 6.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 41, reservedQuantity: 2, inboundQuantity: 50, buyBoxOwner: true, buyBoxPrice: 19.99, lowestPrice: 19.49, rating: 4.7, reviewCount: 215, bulletPoints: ['Elegant rose petal fragrance', 'Premium soy wax with rose essential oil', 'Beautiful frosted glass jar', 'Perfect for gifting'], description: 'An elegant rose garden fragrance that fills any room with the scent of fresh-cut roses. Beautiful gift packaging included.', keywords: 'rose candle, floral candle, gift candle, romantic candle', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2025-02-14T10:00:00Z', lastUpdated: '2026-04-07T10:00:00Z' },
    { id: 'PROD_007', asin: 'B09ABCDEF7', sku: 'EHG-DIFF-LAV-01', title: 'Evergreen Lavender Reed Diffuser Set, 100ml', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Home Fragrance', price: 24.99, salePrice: null, costOfGoods: 7.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 37, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 24.99, lowestPrice: 23.99, rating: 4.4, reviewCount: 167, bulletPoints: ['Long-lasting lavender fragrance for 3+ months', 'Includes 8 natural rattan reeds', 'No flame, no soot - safe fragrance', 'Elegant glass bottle design'], description: 'Our reed diffuser provides a constant, flame-free lavender fragrance. Just insert the reeds and enjoy months of calming aroma.', keywords: 'reed diffuser, lavender diffuser, room fragrance, no flame', weight: '8 oz', dimensions: '2.5 x 2.5 x 8 inches', dateCreated: '2024-08-01T10:00:00Z', lastUpdated: '2026-04-06T10:00:00Z' },
    { id: 'PROD_008', asin: 'B09ABCDEF8', sku: 'EHG-DIFF-VAN-01', title: 'Evergreen Vanilla Reed Diffuser Set, 100ml', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Home Fragrance', price: 24.99, salePrice: null, costOfGoods: 7.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 29, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 22.99, lowestPrice: 22.99, rating: 4.3, reviewCount: 134, bulletPoints: ['Warm vanilla fragrance lasts 3+ months', '8 premium rattan reeds included', 'Stylish amber glass bottle', 'No-mess, flame-free design'], description: 'Fill your home with the comforting scent of vanilla. Our reed diffuser is hassle-free and long-lasting.', keywords: 'vanilla diffuser, reed diffuser, home scent, warm fragrance', weight: '8 oz', dimensions: '2.5 x 2.5 x 8 inches', dateCreated: '2024-08-01T10:00:00Z', lastUpdated: '2026-04-03T10:00:00Z' },
    { id: 'PROD_009', asin: 'B09ABCDEF9', sku: 'EHG-BOARD-BAM-01', title: 'Evergreen Bamboo Cutting Board Set, 3-Piece', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen', price: 29.99, salePrice: null, costOfGoods: 9.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 52, reservedQuantity: 4, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 29.99, lowestPrice: 28.99, rating: 4.6, reviewCount: 412, bulletPoints: ['Set of 3 bamboo cutting boards (S/M/L)', 'Premium organic bamboo, knife-friendly', 'Deep juice grooves prevent spills', 'Easy to clean - hand wash recommended', 'Built-in handles for easy carrying'], description: 'Professional-grade bamboo cutting boards in three convenient sizes. Our bamboo is sustainably sourced and naturally antimicrobial.', keywords: 'cutting board, bamboo board, kitchen board set, chopping board', weight: '3.2 lbs', dimensions: '16 x 12 x 1.5 inches', dateCreated: '2024-01-10T10:00:00Z', lastUpdated: '2026-04-09T10:00:00Z' },
    { id: 'PROD_010', asin: 'B09ABCDEFA', sku: 'EHG-TOWEL-COT-01', title: 'Evergreen Organic Cotton Kitchen Towels, 6-Pack', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen Textiles', price: 22.99, salePrice: null, costOfGoods: 6.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 67, reservedQuantity: 3, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 22.99, lowestPrice: 21.99, rating: 4.5, reviewCount: 523, bulletPoints: ['6 organic cotton kitchen towels', 'Super absorbent and quick-drying', 'GOTS certified organic cotton', 'Machine washable, tumble dry low', 'Classic herringbone weave design'], description: 'Our organic cotton kitchen towels are soft, absorbent, and built to last. Certified organic cotton with a classic herringbone pattern.', keywords: 'kitchen towels, organic towels, cotton towels, dish towels', weight: '1.1 lbs', dimensions: '28 x 18 inches each', dateCreated: '2024-04-01T10:00:00Z', lastUpdated: '2026-04-08T10:00:00Z' },
    { id: 'PROD_011', asin: 'B09ABCDEFB', sku: 'EHG-BOTTLE-SS-01', title: 'Evergreen Stainless Steel Water Bottle, 24 oz', brand: 'Evergreen Home Goods', category: 'Sports & Outdoors > Water Bottles', price: 24.99, salePrice: null, costOfGoods: 8.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 38, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 24.99, lowestPrice: 24.49, rating: 4.4, reviewCount: 278, bulletPoints: ['Double-wall vacuum insulation', 'Keeps drinks cold 24 hours, hot 12 hours', '18/8 stainless steel, BPA-free', 'Leak-proof lid with carry handle', 'Powder-coated finish in sage green'], description: 'Our premium insulated water bottle keeps your drinks at the perfect temperature. Double-wall vacuum insulation technology.', keywords: 'water bottle, insulated bottle, stainless steel bottle, thermos', weight: '12 oz', dimensions: '3 x 3 x 10 inches', dateCreated: '2024-05-15T10:00:00Z', lastUpdated: '2026-04-07T10:00:00Z' },
    { id: 'PROD_012', asin: 'B09ABCDEFC', sku: 'EHG-BOTTLE-SS-02', title: 'Evergreen Stainless Steel Water Bottle, 32 oz', brand: 'Evergreen Home Goods', category: 'Sports & Outdoors > Water Bottles', price: 28.99, salePrice: null, costOfGoods: 9.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 5, reservedQuantity: 1, inboundQuantity: 30, buyBoxOwner: true, buyBoxPrice: 28.99, lowestPrice: 27.99, rating: 4.5, reviewCount: 189, bulletPoints: ['Extra-large 32 oz capacity', 'Double-wall vacuum insulation', 'Wide-mouth opening for ice cubes', 'Fits standard cup holders', 'Powder-coated matte black finish'], description: 'Our largest insulated water bottle for all-day hydration. Wide mouth for easy filling and cleaning.', keywords: 'large water bottle, 32 oz bottle, insulated, stainless steel', weight: '14 oz', dimensions: '3.5 x 3.5 x 11 inches', dateCreated: '2024-05-15T10:00:00Z', lastUpdated: '2026-04-09T10:00:00Z' },
    { id: 'PROD_013', asin: 'B09ABCDEFD', sku: 'EHG-PLANTER-TC-01', title: 'Evergreen Terracotta Plant Pots, Set of 3', brand: 'Evergreen Home Goods', category: 'Patio, Lawn & Garden > Pots & Planters', price: 34.99, salePrice: null, costOfGoods: 10.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 24, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 34.99, lowestPrice: 33.99, rating: 4.6, reviewCount: 301, bulletPoints: ['Set of 3 terracotta pots (4", 6", 8")', 'Drainage holes with matching saucers', 'Classic Italian terracotta finish', 'Perfect for herbs, succulents, flowers'], description: 'Beautiful Italian-style terracotta pots with drainage holes and saucers. Three sizes for versatile indoor and outdoor use.', keywords: 'terracotta pots, plant pots, planters, garden pots, succulent pots', weight: '5.5 lbs', dimensions: '8 x 8 x 7 inches (largest)', dateCreated: '2024-07-20T10:00:00Z', lastUpdated: '2026-04-06T10:00:00Z' },
    { id: 'PROD_014', asin: 'B09ABCDEFE', sku: 'EHG-STORAGE-SIL-01', title: 'Evergreen Silicone Food Storage Bags, 8-Pack', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Food Storage', price: 19.99, salePrice: null, costOfGoods: 5.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 72, reservedQuantity: 5, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 19.99, lowestPrice: 19.49, rating: 4.3, reviewCount: 446, bulletPoints: ['8 reusable silicone bags (2 gallon, 4 sandwich, 2 snack)', 'Food-grade platinum silicone', 'Microwave, dishwasher & freezer safe', 'Airtight seal keeps food fresh', 'Replace 1000+ plastic bags per year'], description: 'Our reusable silicone bags are a sustainable alternative to single-use plastics. Airtight, leak-proof, and incredibly durable.', keywords: 'reusable bags, silicone bags, food storage, eco friendly, zero waste', weight: '1.5 lbs', dimensions: '11 x 7 inches (gallon size)', dateCreated: '2024-02-01T10:00:00Z', lastUpdated: '2026-04-04T10:00:00Z' },
    { id: 'PROD_015', asin: 'B09ABCDEFF', sku: 'EHG-CANDLE-3PK-01', title: 'Evergreen Soy Candle Gift Set, 3 Scents', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 44.99, salePrice: 39.99, costOfGoods: 14.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 18, reservedQuantity: 2, inboundQuantity: 50, buyBoxOwner: true, buyBoxPrice: 39.99, lowestPrice: 39.99, rating: 4.8, reviewCount: 567, bulletPoints: ['Gift set includes Lavender, Vanilla & Rose candles', 'Beautiful gift box with ribbon', '3x 4oz travel-size candles', 'Premium soy wax & essential oils', 'Perfect for birthdays, holidays, housewarming'], description: 'Our best-selling candle trio in a beautiful gift box. Three signature scents for the perfect gift.', keywords: 'candle gift set, scented candles, gift for her, housewarming gift', weight: '1.8 lbs', dimensions: '10 x 4 x 4 inches', dateCreated: '2024-11-01T10:00:00Z', lastUpdated: '2026-04-10T10:00:00Z' },
    { id: 'PROD_016', asin: 'B09ABCDEFG', sku: 'EHG-BOARD-OLV-01', title: 'Evergreen Olive Wood Serving Board, Large', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen', price: 42.99, salePrice: null, costOfGoods: 15.00, fulfillmentChannel: 'FBM', status: 'Active', condition: 'New', availableQuantity: 14, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 42.99, lowestPrice: 41.99, rating: 4.7, reviewCount: 178, bulletPoints: ['Genuine olive wood from Mediterranean', 'Unique natural grain - no two boards alike', 'Food-safe mineral oil finish', '18" x 9" large serving size', 'Perfect for charcuterie and cheese'], description: 'Each olive wood serving board is a unique work of art. Hand-crafted from sustainably harvested Mediterranean olive wood.', keywords: 'olive wood board, charcuterie board, serving board, cheese board', weight: '2.2 lbs', dimensions: '18 x 9 x 0.75 inches', dateCreated: '2025-03-01T10:00:00Z', lastUpdated: '2026-04-02T10:00:00Z' },
    { id: 'PROD_017', asin: 'B09ABCDEFH', sku: 'EHG-COASTER-BAM-01', title: 'Evergreen Bamboo Coasters with Holder, Set of 6', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Coasters', price: 16.99, salePrice: null, costOfGoods: 4.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 86, reservedQuantity: 4, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 16.99, lowestPrice: 15.99, rating: 4.4, reviewCount: 389, bulletPoints: ['6 natural bamboo coasters with holder', 'Protects furniture from water rings', 'Sustainable and eco-friendly bamboo', 'Non-slip cork bottom', 'Compact holder fits any countertop'], description: 'Protect your surfaces in style with our bamboo coaster set. Includes a matching holder to keep coasters organized.', keywords: 'bamboo coasters, coaster set, drink coasters, table coasters', weight: '12 oz', dimensions: '4 x 4 x 0.3 inches each', dateCreated: '2024-06-15T10:00:00Z', lastUpdated: '2026-04-05T10:00:00Z' },
    { id: 'PROD_018', asin: 'B09ABCDEFI', sku: 'EHG-NAPKIN-LIN-01', title: 'Evergreen Linen Cloth Napkins, 8-Pack', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Table Linens', price: 26.99, salePrice: null, costOfGoods: 7.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 43, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 26.99, lowestPrice: 25.99, rating: 4.5, reviewCount: 234, bulletPoints: ['8 premium linen blend napkins', 'Soft-washed for immediate softness', 'Hemstitched edges for elegant finish', 'Machine washable, wrinkle-resistant', '20" x 20" generous dinner size'], description: 'Elegant cloth napkins for everyday dining. Our linen blend is pre-washed for a luxurious soft hand feel.', keywords: 'cloth napkins, linen napkins, dinner napkins, reusable napkins', weight: '1.3 lbs', dimensions: '20 x 20 inches each', dateCreated: '2024-10-01T10:00:00Z', lastUpdated: '2026-04-03T10:00:00Z' },
    { id: 'PROD_019', asin: 'B09ABCDEFJ', sku: 'EHG-CANDLE-CIN-01', title: 'Evergreen Cinnamon Spice Soy Candle, 12 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 22.99, salePrice: null, costOfGoods: 6.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 31, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 22.99, lowestPrice: 22.49, rating: 4.6, reviewCount: 176, bulletPoints: ['Large 12 oz cinnamon spice candle', 'Warm cinnamon, clove & vanilla blend', '60+ hour burn time', 'Premium soy wax & cotton wick', 'Perfect for fall & winter seasons'], description: 'Our cinnamon spice candle fills your home with the cozy warmth of cinnamon, clove, and a touch of vanilla.', keywords: 'cinnamon candle, spice candle, fall candle, winter candle, warm candle', weight: '14 oz', dimensions: '4 x 4 x 4.5 inches', dateCreated: '2025-09-01T10:00:00Z', lastUpdated: '2026-04-08T10:00:00Z' },
    { id: 'PROD_020', asin: 'B09ABCDEFK', sku: 'EHG-TRIVET-CER-01', title: 'Evergreen Ceramic Trivets, Set of 2', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen', price: 21.99, salePrice: null, costOfGoods: 6.00, fulfillmentChannel: 'FBM', status: 'Active', condition: 'New', availableQuantity: 25, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 21.99, lowestPrice: 20.99, rating: 4.3, reviewCount: 112, bulletPoints: ['Set of 2 hand-painted ceramic trivets', 'Heat-resistant up to 500F', 'Cork backing protects countertops', 'Mediterranean tile-inspired design', 'Also works as decorative wall art'], description: 'Beautiful hand-painted ceramic trivets that double as kitchen decor. Heat-resistant and protected with cork backing.', keywords: 'trivets, ceramic trivets, hot pad, kitchen decor, tile trivet', weight: '1.4 lbs', dimensions: '7 x 7 x 0.5 inches each', dateCreated: '2025-05-01T10:00:00Z', lastUpdated: '2026-04-01T10:00:00Z' },
    { id: 'PROD_021', asin: 'B09ABCDEFL', sku: 'EHG-SOAP-BAR-01', title: 'Evergreen Natural Bar Soap Gift Set, 6 Bars', brand: 'Evergreen Home Goods', category: 'Beauty & Personal Care > Bar Soap', price: 28.99, salePrice: null, costOfGoods: 8.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 55, reservedQuantity: 3, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 28.99, lowestPrice: 27.99, rating: 4.5, reviewCount: 298, bulletPoints: ['6 artisan bar soaps in unique scents', 'Cold-pressed with organic shea butter', 'No parabens, sulfates, or synthetic fragrances', 'Cruelty-free & vegan certified', 'Includes Lavender, Oatmeal, Charcoal, Honey, Rose, Mint'], description: 'Six unique artisan soaps made with organic ingredients. Each bar is cold-pressed and cured for 6 weeks.', keywords: 'natural soap, bar soap, organic soap, gift soap, handmade soap', weight: '2.1 lbs', dimensions: '8 x 6 x 3 inches', dateCreated: '2025-01-15T10:00:00Z', lastUpdated: '2026-04-09T10:00:00Z' },
    { id: 'PROD_022', asin: 'B09ABCDEFM', sku: 'EHG-BLANKET-TH-01', title: 'Evergreen Herringbone Throw Blanket, 50x60"', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Bedding', price: 39.99, salePrice: 34.99, costOfGoods: 12.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 19, reservedQuantity: 1, inboundQuantity: 25, buyBoxOwner: true, buyBoxPrice: 34.99, lowestPrice: 34.99, rating: 4.7, reviewCount: 456, bulletPoints: ['Classic herringbone weave pattern', '100% organic cotton throw', 'Soft pre-washed finish', 'Generous 50x60 inch size', 'Available in Sage Green, Natural, Charcoal'], description: 'Our herringbone throw adds cozy style to any room. Made from 100% organic cotton and pre-washed for ultimate softness.', keywords: 'throw blanket, cotton throw, herringbone blanket, cozy blanket', weight: '2.8 lbs', dimensions: '50 x 60 inches', dateCreated: '2025-03-10T10:00:00Z', lastUpdated: '2026-04-07T10:00:00Z' },
    { id: 'PROD_023', asin: 'B09ABCDEFN', sku: 'EHG-MUG-CER-01', title: 'Evergreen Handmade Ceramic Mug, 14 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Mugs', price: 18.99, salePrice: null, costOfGoods: 5.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 64, reservedQuantity: 3, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 18.99, lowestPrice: 17.99, rating: 4.4, reviewCount: 323, bulletPoints: ['Hand-thrown stoneware ceramic', 'Food-safe reactive glaze', 'Microwave & dishwasher safe', '14 oz comfortable capacity', 'Ergonomic handle design'], description: 'Each handmade ceramic mug is unique with its own reactive glaze pattern. Perfect for your morning coffee or tea.', keywords: 'ceramic mug, handmade mug, coffee mug, pottery mug, stoneware', weight: '14 oz', dimensions: '4 x 3.5 x 4.5 inches', dateCreated: '2025-06-01T10:00:00Z', lastUpdated: '2026-04-06T10:00:00Z' },
    { id: 'PROD_024', asin: 'B09ABCDEFO', sku: 'EHG-UTENSIL-WD-01', title: 'Evergreen Wooden Kitchen Utensil Set, 7-Piece', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen', price: 32.99, salePrice: null, costOfGoods: 9.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 40, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 32.99, lowestPrice: 31.99, rating: 4.5, reviewCount: 267, bulletPoints: ['7 essential wooden utensils + holder', 'Teak wood - naturally antimicrobial', 'Won\'t scratch non-stick cookware', 'Includes spatula, spoon, tongs, ladle & more', 'Food-grade mineral oil finish'], description: 'Complete your kitchen with our premium teak wood utensil set. Natural, durable, and safe for all cookware.', keywords: 'wooden utensils, kitchen utensil set, teak utensils, cooking tools', weight: '1.9 lbs', dimensions: '14 x 4 x 4 inches', dateCreated: '2025-04-01T10:00:00Z', lastUpdated: '2026-04-05T10:00:00Z' },
    { id: 'PROD_025', asin: 'B09ABCDEFP', sku: 'EHG-BASKET-SEA-01', title: 'Evergreen Seagrass Storage Baskets, Set of 3', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Storage & Organization', price: 36.99, salePrice: null, costOfGoods: 11.00, fulfillmentChannel: 'FBM', status: 'Active', condition: 'New', availableQuantity: 16, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 34.99, lowestPrice: 34.99, rating: 4.4, reviewCount: 198, bulletPoints: ['Set of 3 hand-woven seagrass baskets', 'Nesting design for easy storage', 'Sturdy iron frame for structure', 'Natural boho-chic aesthetic', 'Great for blankets, toys, laundry, plants'], description: 'Beautiful hand-woven seagrass baskets that bring natural texture to any room. Three sizes for versatile storage.', keywords: 'storage baskets, seagrass baskets, woven baskets, boho decor', weight: '3.5 lbs', dimensions: '15 x 12 x 13 inches (large)', dateCreated: '2025-07-01T10:00:00Z', lastUpdated: '2026-04-04T10:00:00Z' },
    { id: 'PROD_026', asin: 'B09ABCDEFQ', sku: 'EHG-CANDLE-PKY-01', title: 'Evergreen Peach & Peony Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 49, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 18.99, lowestPrice: 18.49, rating: 4.5, reviewCount: 143, bulletPoints: ['Sweet peach & peony floral blend', '100% soy wax, cotton wick', '40+ hour clean burn', 'Spring-inspired fragrance', 'Gift-ready packaging'], description: 'Welcome spring with our peach & peony candle. A delightfully sweet and floral fragrance.', keywords: 'peach candle, peony candle, spring candle, floral candle', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2026-02-01T10:00:00Z', lastUpdated: '2026-04-09T10:00:00Z' },
    { id: 'PROD_027', asin: 'B09ABCDEFR', sku: 'EHG-TRAY-MAR-01', title: 'Evergreen Marble & Acacia Serving Tray', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Kitchen', price: 38.99, salePrice: null, costOfGoods: 13.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 11, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 38.99, lowestPrice: 37.99, rating: 4.6, reviewCount: 89, bulletPoints: ['White marble with acacia wood handles', 'Perfect for cheese, appetizers, decor', 'Polished marble surface', 'Sturdy acacia wood side panels', '16 x 8 inch generous serving area'], description: 'An elegant marble and acacia wood serving tray for entertaining or everyday decor. The perfect hostess gift.', keywords: 'marble tray, serving tray, cheese tray, charcuterie, entertaining', weight: '4.1 lbs', dimensions: '16 x 8 x 2 inches', dateCreated: '2025-10-01T10:00:00Z', lastUpdated: '2026-04-03T10:00:00Z' },
    { id: 'PROD_028', asin: 'B09ABCDEFS', sku: 'EHG-PLMAT-BAM-01', title: 'Evergreen Bamboo Placemats, Set of 6', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Table Linens', price: 24.99, salePrice: null, costOfGoods: 6.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 58, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 24.99, lowestPrice: 23.99, rating: 4.3, reviewCount: 167, bulletPoints: ['6 natural bamboo placemats', 'Heat-resistant up to 200F', 'Easy to wipe clean', 'Rolled edges for safety', 'Fits standard table settings'], description: 'Stylish bamboo placemats that protect your table while adding natural warmth. Easy to clean and maintain.', keywords: 'bamboo placemats, dining placemats, table mats, natural placemats', weight: '1.6 lbs', dimensions: '18 x 12 inches each', dateCreated: '2025-08-01T10:00:00Z', lastUpdated: '2026-04-02T10:00:00Z' },
    { id: 'PROD_029', asin: 'B09ABCDEFT', sku: 'EHG-DISPNS-SOAP-01', title: 'Evergreen Ceramic Soap Dispenser Set, 2-Pack', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Bathroom', price: 26.99, salePrice: null, costOfGoods: 7.50, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 34, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 26.99, lowestPrice: 25.99, rating: 4.4, reviewCount: 212, bulletPoints: ['2 matching ceramic soap dispensers', 'Stainless steel pump - won\'t rust', '14 oz capacity each', 'Matte finish in Stone Gray', 'Great for kitchen & bathroom'], description: 'Upgrade your countertop with our matching ceramic soap dispensers. Durable stainless steel pumps with a smooth, reliable action.', keywords: 'soap dispenser, ceramic dispenser, bathroom accessories, pump dispenser', weight: '1.8 lbs', dimensions: '3.5 x 3.5 x 7 inches each', dateCreated: '2025-11-01T10:00:00Z', lastUpdated: '2026-04-06T10:00:00Z' },
    { id: 'PROD_030', asin: 'B09ABCDEFU', sku: 'EHG-CANDLE-WD-01', title: 'Evergreen Woodwick Crackling Soy Candle, 10 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 24.99, salePrice: null, costOfGoods: 7.00, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 27, reservedQuantity: 2, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 24.99, lowestPrice: 24.49, rating: 4.7, reviewCount: 234, bulletPoints: ['Natural wood wick creates crackling sound', 'Cedarwood & amber fragrance', '50+ hour burn time', 'Premium soy coconut wax blend', 'Wide flame for even melt pool'], description: 'Experience the cozy ambiance of a crackling fireplace with our wood wick candle. Cedarwood and amber create a warm, inviting scent.', keywords: 'wood wick candle, crackling candle, fireplace candle, amber candle', weight: '12 oz', dimensions: '4 x 4 x 4 inches', dateCreated: '2025-12-01T10:00:00Z', lastUpdated: '2026-04-08T10:00:00Z' },
    { id: 'PROD_031', asin: 'B09ABCDEFV', sku: 'EHG-VASE-GLS-01', title: 'Evergreen Hand-Blown Glass Bud Vase, Set of 3', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Vases', price: 29.99, salePrice: null, costOfGoods: 9.00, fulfillmentChannel: 'FBM', status: 'Active', condition: 'New', availableQuantity: 20, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 29.99, lowestPrice: 28.99, rating: 4.5, reviewCount: 156, bulletPoints: ['Set of 3 hand-blown glass bud vases', 'Each vase has unique color variations', 'Perfect for single stems or small bouquets', 'Amber, sage green, and clear options', 'Weighted base for stability'], description: 'Three beautiful hand-blown glass bud vases, each with unique character. Perfect for displaying single stems on any surface.', keywords: 'bud vase, glass vase, flower vase, hand blown glass, vase set', weight: '1.5 lbs', dimensions: '3 x 3 x 6 inches each', dateCreated: '2026-01-15T10:00:00Z', lastUpdated: '2026-04-04T10:00:00Z' },
    { id: 'PROD_032', asin: 'B09ABCDEFW', sku: 'EHG-CANDLE-JAP-01', title: 'Evergreen Japanese Cherry Blossom Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 19.99, salePrice: null, costOfGoods: 5.75, fulfillmentChannel: 'FBA', status: 'Active', condition: 'New', availableQuantity: 36, reservedQuantity: 1, inboundQuantity: 0, buyBoxOwner: true, buyBoxPrice: 19.99, lowestPrice: 19.49, rating: 4.5, reviewCount: 98, bulletPoints: ['Delicate cherry blossom fragrance', 'Light floral with subtle fruit notes', 'Pure soy wax, lead-free wick', 'Beautiful pink tinted glass', 'Spring collection favorite'], description: 'Our cherry blossom candle captures the essence of spring. A delicate, uplifting floral fragrance.', keywords: 'cherry blossom candle, spring candle, floral candle, japanese candle', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2026-03-01T10:00:00Z', lastUpdated: '2026-04-10T10:00:00Z' },
    // Suppressed / Inactive products
    { id: 'PROD_033', asin: 'B09ABCDEFX', sku: 'EHG-CANDLE-OLD-01', title: 'Evergreen Pine Forest Soy Candle, 8 oz (Discontinued)', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 17.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Inactive', condition: 'New', availableQuantity: 0, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 0, lowestPrice: 0, rating: 3.8, reviewCount: 67, bulletPoints: ['Pine forest scent', 'Soy wax candle'], description: 'Discontinued pine forest candle.', keywords: 'pine candle', weight: '10 oz', dimensions: '3.5 x 3.5 x 4 inches', dateCreated: '2023-06-01T10:00:00Z', lastUpdated: '2026-01-15T10:00:00Z' },
    { id: 'PROD_034', asin: 'B09ABCDEFY', sku: 'EHG-HOLDER-MET-01', title: 'Evergreen Metal Candle Holder, Brass Finish', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candle Holders', price: 15.99, salePrice: null, costOfGoods: 4.00, fulfillmentChannel: 'FBA', status: 'Suppressed', condition: 'New', availableQuantity: 12, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 14.99, lowestPrice: 14.99, rating: 3.5, reviewCount: 23, bulletPoints: ['Brass finish candle holder'], description: 'Listing suppressed - image quality below requirements.', keywords: 'candle holder, brass', weight: '8 oz', dimensions: '4 x 4 x 5 inches', dateCreated: '2025-08-01T10:00:00Z', lastUpdated: '2026-03-20T10:00:00Z' },
    { id: 'PROD_035', asin: 'B09ABCDEFZ', sku: 'EHG-CANDLE-DRF-01', title: 'Evergreen Driftwood & Sage Soy Candle, 8 oz', brand: 'Evergreen Home Goods', category: 'Home & Kitchen > Candles & Holders', price: 18.99, salePrice: null, costOfGoods: 5.50, fulfillmentChannel: 'FBA', status: 'Incomplete', condition: 'New', availableQuantity: 0, reservedQuantity: 0, inboundQuantity: 0, buyBoxOwner: false, buyBoxPrice: 0, lowestPrice: 0, rating: 0, reviewCount: 0, bulletPoints: [], description: '', keywords: '', weight: '', dimensions: '', dateCreated: '2026-04-09T10:00:00Z', lastUpdated: '2026-04-09T10:00:00Z' }
  ];

  const addresses = [
    { name: 'Jennifer Adams', line1: '742 Elm Street', line2: 'Apt 3B', city: 'Portland', state: 'OR', postalCode: '97201' },
    { name: 'Michael Chen', line1: '1984 Redwood Dr', line2: '', city: 'San Francisco', state: 'CA', postalCode: '94107' },
    { name: 'Sarah Thompson', line1: '567 Maple Ave', line2: '', city: 'Denver', state: 'CO', postalCode: '80202' },
    { name: 'David Kim', line1: '2301 Oak Lane', line2: 'Suite 12', city: 'Seattle', state: 'WA', postalCode: '98101' },
    { name: 'Emily Rodriguez', line1: '890 Pine Street', line2: '', city: 'Austin', state: 'TX', postalCode: '78701' },
    { name: 'James Wilson', line1: '456 Cedar Blvd', line2: '', city: 'Nashville', state: 'TN', postalCode: '37201' },
    { name: 'Laura Bennett', line1: '123 Birch Road', line2: 'Unit 7', city: 'Chicago', state: 'IL', postalCode: '60601' },
    { name: 'Daniel Johnson', line1: '789 Walnut St', line2: '', city: 'Boston', state: 'MA', postalCode: '02101' },
    { name: 'Rachel Harris', line1: '321 Spruce Way', line2: '', city: 'Atlanta', state: 'GA', postalCode: '30301' },
    { name: 'Mark Davis', line1: '654 Willow Lane', line2: 'Apt 5C', city: 'Phoenix', state: 'AZ', postalCode: '85001' },
    { name: 'Nancy O\'Brien', line1: '987 Ash Court', line2: '', city: 'Miami', state: 'FL', postalCode: '33101' },
    { name: 'Peter Klein', line1: '246 Cypress Dr', line2: '', city: 'Minneapolis', state: 'MN', postalCode: '55401' },
    { name: 'Diana Mitchell', line1: '135 Holly Ave', line2: '', city: 'San Diego', state: 'CA', postalCode: '92101' },
    { name: 'Steve Morris', line1: '864 Juniper St', line2: '', city: 'Charlotte', state: 'NC', postalCode: '28201' },
    { name: 'Alison Green', line1: '579 Poplar Way', line2: 'Apt 9A', city: 'Philadelphia', state: 'PA', postalCode: '19101' },
    { name: 'Kevin Wang', line1: '312 Laurel Blvd', line2: '', city: 'Houston', state: 'TX', postalCode: '77001' },
    { name: 'Christine Lee', line1: '743 Hazel Dr', line2: '', city: 'Columbus', state: 'OH', postalCode: '43201' },
    { name: 'Greg Patterson', line1: '198 Chestnut Rd', line2: '', city: 'Raleigh', state: 'NC', postalCode: '27601' },
    { name: 'Maria Sanchez', line1: '451 Magnolia Lane', line2: '', city: 'Dallas', state: 'TX', postalCode: '75201' },
    { name: 'Brian Foster', line1: '876 Dogwood Ave', line2: 'Suite 4', city: 'Tampa', state: 'FL', postalCode: '33601' }
  ];

  const buyers = [
    { name: 'Jennifer A.', email: 'jennifer.a@email.com' },
    { name: 'Michael C.', email: 'michael.c@email.com' },
    { name: 'Sarah T.', email: 'sarah.t@email.com' },
    { name: 'David K.', email: 'david.k@email.com' },
    { name: 'Emily R.', email: 'emily.r@email.com' },
    { name: 'James W.', email: 'james.w@email.com' },
    { name: 'Laura B.', email: 'laura.b@email.com' },
    { name: 'Daniel J.', email: 'daniel.j@email.com' },
    { name: 'Rachel H.', email: 'rachel.h@email.com' },
    { name: 'Mark D.', email: 'mark.d@email.com' },
    { name: 'Nancy O.', email: 'nancy.o@email.com' },
    { name: 'Peter K.', email: 'peter.k@email.com' },
    { name: 'Diana M.', email: 'diana.m@email.com' },
    { name: 'Steve M.', email: 'steve.m@email.com' },
    { name: 'Alison G.', email: 'alison.g@email.com' },
    { name: 'Kevin W.', email: 'kevin.w@email.com' },
    { name: 'Christine L.', email: 'christine.l@email.com' },
    { name: 'Greg P.', email: 'greg.p@email.com' },
    { name: 'Maria S.', email: 'maria.s@email.com' },
    { name: 'Brian F.', email: 'brian.f@email.com' }
  ];

  function makeOrder(id, num, buyerIdx, prodItems, status, purchaseDate, opts = {}) {
    const buyer = buyers[buyerIdx % buyers.length];
    const addr = addresses[buyerIdx % addresses.length];
    const orderTotal = prodItems.reduce((s, i) => s + i.itemTotal, 0);
    const shippingFee = opts.shippingFee || (orderTotal > 25 ? 0 : 5.99);
    const amazonFees = Math.round(orderTotal * 0.15 * 100) / 100;
    const pDate = new Date(purchaseDate);
    const shipBy = new Date(pDate); shipBy.setDate(shipBy.getDate() + 2);
    const deliverBy = new Date(pDate); deliverBy.setDate(deliverBy.getDate() + 7);
    return {
      id,
      amazonOrderId: `114-${num}`,
      purchaseDate,
      lastUpdateDate: opts.lastUpdateDate || purchaseDate,
      status,
      fulfillmentChannel: opts.fulfillmentChannel || 'FBA',
      salesChannel: 'Amazon.com',
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      shippingAddress: { ...addr },
      items: prodItems.map((p, idx) => ({ ...p, orderItemId: `OI_${id}_${idx}` })),
      orderTotal,
      shippingFee,
      amazonFees,
      netProceeds: Math.round((orderTotal + shippingFee - amazonFees) * 100) / 100,
      carrier: opts.carrier || null,
      trackingNumber: opts.trackingNumber || null,
      shipByDate: shipBy.toISOString(),
      deliverByDate: deliverBy.toISOString(),
      shippedDate: opts.shippedDate || null
    };
  }

  const orders = [
    // Today's orders
    makeOrder('ORDER_001', '3941689-8772232', 0, [
      { asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', quantity: 2, unitPrice: 18.99, itemTotal: 37.98 }
    ], 'Pending', '2026-04-10T09:15:00Z'),
    makeOrder('ORDER_002', '5892341-9341256', 1, [
      { asin: 'B09ABCDEF2', sku: 'EHG-CANDLE-VAN-01', title: 'Evergreen Vanilla Bean Soy Candle, 8 oz', quantity: 1, unitPrice: 15.99, itemTotal: 15.99 },
      { asin: 'B09ABCDEF9', sku: 'EHG-BOARD-BAM-01', title: 'Evergreen Bamboo Cutting Board Set, 3-Piece', quantity: 1, unitPrice: 29.99, itemTotal: 29.99 }
    ], 'Pending', '2026-04-10T11:22:00Z'),
    makeOrder('ORDER_003', '7234891-5678901', 2, [
      { asin: 'B09ABCDEFB', sku: 'EHG-BOTTLE-SS-01', title: 'Evergreen Stainless Steel Water Bottle, 24 oz', quantity: 1, unitPrice: 24.99, itemTotal: 24.99 }
    ], 'Unshipped', '2026-04-10T14:05:00Z'),
    makeOrder('ORDER_004', '8901234-5678923', 3, [
      { asin: 'B09ABCDEFN', sku: 'EHG-MUG-CER-01', title: 'Evergreen Handmade Ceramic Mug, 14 oz', quantity: 3, unitPrice: 18.99, itemTotal: 56.97 }
    ], 'Unshipped', '2026-04-10T16:30:00Z'),
    // Yesterday's orders
    makeOrder('ORDER_005', '2345678-9012345', 4, [
      { asin: 'B09ABCDEF6', sku: 'EHG-CANDLE-ROSE-01', title: 'Evergreen Rose Garden Soy Candle, 8 oz', quantity: 2, unitPrice: 19.99, itemTotal: 39.98 },
      { asin: 'B09ABCDEF7', sku: 'EHG-DIFF-LAV-01', title: 'Evergreen Lavender Reed Diffuser Set, 100ml', quantity: 1, unitPrice: 24.99, itemTotal: 24.99 }
    ], 'Unshipped', '2026-04-09T10:00:00Z'),
    makeOrder('ORDER_006', '3456789-0123456', 5, [
      { asin: 'B09ABCDEFF', sku: 'EHG-CANDLE-3PK-01', title: 'Evergreen Soy Candle Gift Set, 3 Scents', quantity: 1, unitPrice: 39.99, itemTotal: 39.99 }
    ], 'Unshipped', '2026-04-09T14:30:00Z'),
    // Recent shipped orders
    makeOrder('ORDER_007', '4567890-1234567', 6, [
      { asin: 'B09ABCDEFL', sku: 'EHG-SOAP-BAR-01', title: 'Evergreen Natural Bar Soap Gift Set, 6 Bars', quantity: 1, unitPrice: 28.99, itemTotal: 28.99 },
      { asin: 'B09ABCDEFM', sku: 'EHG-BLANKET-TH-01', title: 'Evergreen Herringbone Throw Blanket, 50x60"', quantity: 1, unitPrice: 34.99, itemTotal: 34.99 }
    ], 'Shipped', '2026-04-08T09:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034825', shippedDate: '2026-04-08T15:00:00Z' }),
    makeOrder('ORDER_008', '5678901-2345678', 7, [
      { asin: 'B09ABCDEF9', sku: 'EHG-BOARD-BAM-01', title: 'Evergreen Bamboo Cutting Board Set, 3-Piece', quantity: 1, unitPrice: 29.99, itemTotal: 29.99 }
    ], 'Shipped', '2026-04-08T11:30:00Z', { carrier: 'UPS', trackingNumber: '1Z9999W99999999999', shippedDate: '2026-04-08T16:00:00Z' }),
    makeOrder('ORDER_009', '6789012-3456789', 8, [
      { asin: 'B09ABCDEFO', sku: 'EHG-UTENSIL-WD-01', title: 'Evergreen Wooden Kitchen Utensil Set, 7-Piece', quantity: 1, unitPrice: 32.99, itemTotal: 32.99 },
      { asin: 'B09ABCDEF3', sku: 'EHG-CANDLE-EUC-01', title: 'Evergreen Eucalyptus & Mint Soy Candle, 8 oz', quantity: 2, unitPrice: 19.99, itemTotal: 39.98 }
    ], 'Shipped', '2026-04-07T10:00:00Z', { carrier: 'FedEx', trackingNumber: '7489234789234', shippedDate: '2026-04-07T14:00:00Z' }),
    makeOrder('ORDER_010', '7890123-4567890', 9, [
      { asin: 'B09ABCDEFA', sku: 'EHG-TOWEL-COT-01', title: 'Evergreen Organic Cotton Kitchen Towels, 6-Pack', quantity: 2, unitPrice: 22.99, itemTotal: 45.98 }
    ], 'Shipped', '2026-04-07T15:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034826', shippedDate: '2026-04-07T18:00:00Z' }),
    makeOrder('ORDER_011', '8901234-5678901', 10, [
      { asin: 'B09ABCDEFR', sku: 'EHG-TRAY-MAR-01', title: 'Evergreen Marble & Acacia Serving Tray', quantity: 1, unitPrice: 38.99, itemTotal: 38.99 }
    ], 'Shipped', '2026-04-06T09:00:00Z', { carrier: 'UPS', trackingNumber: '1Z9999W99999999998', shippedDate: '2026-04-06T12:00:00Z' }),
    makeOrder('ORDER_012', '9012345-6789012', 11, [
      { asin: 'B09ABCDEFD', sku: 'EHG-PLANTER-TC-01', title: 'Evergreen Terracotta Plant Pots, Set of 3', quantity: 2, unitPrice: 34.99, itemTotal: 69.98 }
    ], 'Shipped', '2026-04-06T14:00:00Z', { carrier: 'FedEx', trackingNumber: '7489234789235', shippedDate: '2026-04-06T17:00:00Z' }),
    makeOrder('ORDER_013', '0123456-7890123', 12, [
      { asin: 'B09ABCDEFB', sku: 'EHG-BOTTLE-SS-01', title: 'Evergreen Stainless Steel Water Bottle, 24 oz', quantity: 2, unitPrice: 24.99, itemTotal: 49.98 }
    ], 'Shipped', '2026-04-05T11:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034827', shippedDate: '2026-04-05T14:00:00Z' }),
    makeOrder('ORDER_014', '1234567-8901234', 13, [
      { asin: 'B09ABCDEFI', sku: 'EHG-NAPKIN-LIN-01', title: 'Evergreen Linen Cloth Napkins, 8-Pack', quantity: 1, unitPrice: 26.99, itemTotal: 26.99 },
      { asin: 'B09ABCDEFH', sku: 'EHG-COASTER-BAM-01', title: 'Evergreen Bamboo Coasters with Holder, Set of 6', quantity: 1, unitPrice: 16.99, itemTotal: 16.99 }
    ], 'Shipped', '2026-04-05T14:00:00Z', { carrier: 'UPS', trackingNumber: '1Z9999W99999999997', shippedDate: '2026-04-05T17:00:00Z' }),
    makeOrder('ORDER_015', '2345678-9012346', 14, [
      { asin: 'B09ABCDEFG', sku: 'EHG-BOARD-OLV-01', title: 'Evergreen Olive Wood Serving Board, Large', quantity: 1, unitPrice: 42.99, itemTotal: 42.99 }
    ], 'Shipped', '2026-04-04T10:00:00Z', { fulfillmentChannel: 'FBM', carrier: 'USPS', trackingNumber: '9400111899223100034828', shippedDate: '2026-04-04T15:00:00Z' }),
    makeOrder('ORDER_016', '3456789-0123457', 15, [
      { asin: 'B09ABCDEFU', sku: 'EHG-CANDLE-WD-01', title: 'Evergreen Woodwick Crackling Soy Candle, 10 oz', quantity: 2, unitPrice: 24.99, itemTotal: 49.98 },
      { asin: 'B09ABCDEFQ', sku: 'EHG-CANDLE-PKY-01', title: 'Evergreen Peach & Peony Soy Candle, 8 oz', quantity: 1, unitPrice: 18.99, itemTotal: 18.99 }
    ], 'Shipped', '2026-04-03T11:00:00Z', { carrier: 'FedEx', trackingNumber: '7489234789236', shippedDate: '2026-04-03T14:00:00Z' }),
    makeOrder('ORDER_017', '4567890-1234568', 16, [
      { asin: 'B09ABCDEF4', sku: 'EHG-CANDLE-CIT-01', title: 'Evergreen Citrus Grove Soy Candle, 8 oz', quantity: 1, unitPrice: 18.99, itemTotal: 18.99 },
      { asin: 'B09ABCDEF5', sku: 'EHG-CANDLE-SEA-01', title: 'Evergreen Sea Breeze Soy Candle, 8 oz', quantity: 1, unitPrice: 18.99, itemTotal: 18.99 }
    ], 'Shipped', '2026-04-02T10:00:00Z', { fulfillmentChannel: 'FBM', carrier: 'USPS', trackingNumber: '9400111899223100034829', shippedDate: '2026-04-02T16:00:00Z' }),
    makeOrder('ORDER_018', '5678901-2345679', 17, [
      { asin: 'B09ABCDEFP', sku: 'EHG-BASKET-SEA-01', title: 'Evergreen Seagrass Storage Baskets, Set of 3', quantity: 1, unitPrice: 36.99, itemTotal: 36.99 },
      { asin: 'B09ABCDEFN', sku: 'EHG-MUG-CER-01', title: 'Evergreen Handmade Ceramic Mug, 14 oz', quantity: 2, unitPrice: 18.99, itemTotal: 37.98 }
    ], 'Shipped', '2026-04-01T09:00:00Z', { fulfillmentChannel: 'FBM', carrier: 'UPS', trackingNumber: '1Z9999W99999999996', shippedDate: '2026-04-01T14:00:00Z' }),
    makeOrder('ORDER_019', '6789012-3456790', 18, [
      { asin: 'B09ABCDEFE', sku: 'EHG-STORAGE-SIL-01', title: 'Evergreen Silicone Food Storage Bags, 8-Pack', quantity: 2, unitPrice: 19.99, itemTotal: 39.98 },
      { asin: 'B09ABCDEF9', sku: 'EHG-BOARD-BAM-01', title: 'Evergreen Bamboo Cutting Board Set, 3-Piece', quantity: 1, unitPrice: 29.99, itemTotal: 29.99 }
    ], 'Shipped', '2026-03-30T10:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034830', shippedDate: '2026-03-30T15:00:00Z' }),
    makeOrder('ORDER_020', '7890123-4567891', 19, [
      { asin: 'B09ABCDEFS', sku: 'EHG-DISPNS-SOAP-01', title: 'Evergreen Ceramic Soap Dispenser Set, 2-Pack', quantity: 1, unitPrice: 26.99, itemTotal: 26.99 },
      { asin: 'B09ABCDEFL', sku: 'EHG-SOAP-BAR-01', title: 'Evergreen Natural Bar Soap Gift Set, 6 Bars', quantity: 1, unitPrice: 28.99, itemTotal: 28.99 }
    ], 'Shipped', '2026-03-28T11:00:00Z', { carrier: 'FedEx', trackingNumber: '7489234789237', shippedDate: '2026-03-28T15:00:00Z' }),
    makeOrder('ORDER_021', '8901234-5678902', 0, [
      { asin: 'B09ABCDEFJ', sku: 'EHG-CANDLE-CIN-01', title: 'Evergreen Cinnamon Spice Soy Candle, 12 oz', quantity: 1, unitPrice: 22.99, itemTotal: 22.99 },
      { asin: 'B09ABCDEFK', sku: 'EHG-TRIVET-CER-01', title: 'Evergreen Ceramic Trivets, Set of 2', quantity: 1, unitPrice: 21.99, itemTotal: 21.99 }
    ], 'Shipped', '2026-03-26T10:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034831', shippedDate: '2026-03-26T14:00:00Z' }),
    makeOrder('ORDER_022', '9012345-6789013', 1, [
      { asin: 'B09ABCDEFV', sku: 'EHG-VASE-GLS-01', title: 'Evergreen Hand-Blown Glass Bud Vase, Set of 3', quantity: 1, unitPrice: 29.99, itemTotal: 29.99 },
      { asin: 'B09ABCDEFW', sku: 'EHG-CANDLE-JAP-01', title: 'Evergreen Japanese Cherry Blossom Candle, 8 oz', quantity: 2, unitPrice: 19.99, itemTotal: 39.98 }
    ], 'Shipped', '2026-03-22T09:00:00Z', { carrier: 'UPS', trackingNumber: '1Z9999W99999999995', shippedDate: '2026-03-22T13:00:00Z' }),
    makeOrder('ORDER_023', '0123456-7890124', 2, [
      { asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', quantity: 3, unitPrice: 18.99, itemTotal: 56.97 }
    ], 'Shipped', '2026-03-18T10:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034832', shippedDate: '2026-03-18T15:00:00Z' }),
    makeOrder('ORDER_024', '1234567-8901235', 3, [
      { asin: 'B09ABCDEFM', sku: 'EHG-BLANKET-TH-01', title: 'Evergreen Herringbone Throw Blanket, 50x60"', quantity: 1, unitPrice: 34.99, itemTotal: 34.99 }
    ], 'Shipped', '2026-03-15T09:00:00Z', { carrier: 'FedEx', trackingNumber: '7489234789238', shippedDate: '2026-03-15T12:00:00Z' }),
    // Cancelled orders
    makeOrder('ORDER_025', '2345678-9012347', 4, [
      { asin: 'B09ABCDEF8', sku: 'EHG-DIFF-VAN-01', title: 'Evergreen Vanilla Reed Diffuser Set, 100ml', quantity: 1, unitPrice: 24.99, itemTotal: 24.99 }
    ], 'Cancelled', '2026-04-09T16:00:00Z', { lastUpdateDate: '2026-04-09T17:00:00Z' }),
    makeOrder('ORDER_026', '7823456-1234567', 17, [
      { asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', quantity: 1, unitPrice: 18.99, itemTotal: 18.99 }
    ], 'Shipped', '2026-04-04T14:00:00Z', { carrier: 'USPS', trackingNumber: '9400111899223100034833', shippedDate: '2026-04-04T17:00:00Z' }),
    makeOrder('ORDER_027', '3456789-0123458', 5, [
      { asin: 'B09ABCDEFN', sku: 'EHG-MUG-CER-01', title: 'Evergreen Handmade Ceramic Mug, 14 oz', quantity: 4, unitPrice: 18.99, itemTotal: 75.96 }
    ], 'Cancelled', '2026-03-20T10:00:00Z', { lastUpdateDate: '2026-03-20T11:00:00Z' })
  ];

  const messages = [
    { id: 'MSG_001', threadId: 'THREAD_001', orderId: 'ORDER_003', buyerName: 'Sarah T.', subject: 'Delivery time question', body: 'Hi, I ordered the water bottle today. Could you please let me know when it will ship? I need it by this weekend for a hiking trip. Thank you!', sender: 'buyer', timestamp: '2026-04-10T15:00:00Z', isRead: false, status: 'Unanswered', responseDeadline: '2026-04-11T15:00:00Z', attachments: [] },
    { id: 'MSG_002', threadId: 'THREAD_002', orderId: 'ORDER_007', buyerName: 'Laura B.', subject: 'Gift wrapping options', body: 'Hello! I\'m ordering the throw blanket and soap set as a gift. Do you offer any gift wrapping services? Also, can you include a gift note?', sender: 'buyer', timestamp: '2026-04-08T10:00:00Z', isRead: false, status: 'Unanswered', responseDeadline: '2026-04-09T10:00:00Z', attachments: [] },
    { id: 'MSG_003', threadId: 'THREAD_003', orderId: 'ORDER_012', buyerName: 'Peter K.', subject: 'Terracotta pot sizes', body: 'Hi there, I received the terracotta pot set. They\'re beautiful! I was wondering, do you sell the 8-inch pot individually? I need one more for my front porch.', sender: 'buyer', timestamp: '2026-04-07T09:00:00Z', isRead: false, status: 'Unanswered', responseDeadline: '2026-04-08T09:00:00Z', attachments: [] },
    { id: 'MSG_004', threadId: 'THREAD_004', orderId: 'ORDER_010', buyerName: 'Mark D.', subject: 'Kitchen towels are great!', body: 'Just wanted to say the organic kitchen towels are fantastic! So much better than the ones I had before. Will you be releasing any new colors soon?', sender: 'buyer', timestamp: '2026-04-08T12:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] },
    { id: 'MSG_005', threadId: 'THREAD_004', orderId: 'ORDER_010', buyerName: 'Evergreen Home Goods', subject: 'Re: Kitchen towels are great!', body: 'Thank you so much for the kind words, Mark! We\'re thrilled you love the towels. We have new sage green and charcoal colors coming in May. Stay tuned!', sender: 'seller', timestamp: '2026-04-08T14:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] },
    { id: 'MSG_006', threadId: 'THREAD_005', orderId: 'ORDER_026', buyerName: 'Greg P.', subject: 'Defective candle - return request', body: 'I received the lavender candle and the glass jar had a visible crack. When I tried to light it, the wick was off-center and the wax melted unevenly. I\'d like to return this and get a replacement or refund.', sender: 'buyer', timestamp: '2026-04-07T11:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] },
    { id: 'MSG_007', threadId: 'THREAD_005', orderId: 'ORDER_026', buyerName: 'Evergreen Home Goods', subject: 'Re: Defective candle - return request', body: 'We\'re very sorry about this! A cracked jar is absolutely unacceptable and not up to our quality standards. We\'ve initiated a return and will send a replacement immediately. Please use the return label that will be emailed to you shortly.', sender: 'seller', timestamp: '2026-04-07T13:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] },
    { id: 'MSG_008', threadId: 'THREAD_006', orderId: 'ORDER_016', buyerName: 'Kevin W.', subject: 'Candle burn time question', body: 'Hi, I love the woodwick candle! The crackling sound is amazing. How long should I burn it each session for the best experience? I want to make it last as long as possible.', sender: 'buyer', timestamp: '2026-04-05T10:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] },
    { id: 'MSG_009', threadId: 'THREAD_006', orderId: 'ORDER_016', buyerName: 'Evergreen Home Goods', subject: 'Re: Candle burn time question', body: 'Great question, Kevin! For the best experience, burn the candle for 2-3 hours per session, letting the wax melt all the way to the edges. This prevents tunneling and maximizes your burn time. Enjoy!', sender: 'seller', timestamp: '2026-04-05T12:00:00Z', isRead: true, status: 'Answered', responseDeadline: null, attachments: [] }
  ];

  const returns_data = [
    { id: 'RETURN_001', orderId: 'ORDER_026', amazonOrderId: '114-7823456-1234567', returnRequestDate: '2026-04-07T11:00:00Z', status: 'Pending', reason: 'Item defective or doesn\'t work', buyerComments: 'The candle wick was off-center and the glass cracked when burning after just 30 minutes. Very disappointing.', items: [{ asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', quantity: 1, refundAmount: 18.99 }], sellerNotes: '', resolution: null },
    { id: 'RETURN_002', orderId: 'ORDER_023', amazonOrderId: '114-0123456-7890124', returnRequestDate: '2026-03-25T10:00:00Z', status: 'Approved', reason: 'No longer needed', buyerComments: 'Ordered too many candles by mistake. The products are fine, just don\'t need 3.', items: [{ asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', title: 'Evergreen Lavender Scented Soy Candle, 8 oz', quantity: 1, refundAmount: 18.99 }], sellerNotes: 'Approved - buyer changed mind. Item will be restocked.', resolution: 'Refund' },
    { id: 'RETURN_003', orderId: 'ORDER_024', amazonOrderId: '114-1234567-8901235', returnRequestDate: '2026-03-22T09:00:00Z', status: 'Completed', reason: 'Item arrived too late', buyerComments: 'The blanket arrived 3 days after the estimated delivery. I needed it for a specific event.', items: [{ asin: 'B09ABCDEFM', sku: 'EHG-BLANKET-TH-01', title: 'Evergreen Herringbone Throw Blanket, 50x60"', quantity: 1, refundAmount: 34.99 }], sellerNotes: 'Refund issued. Carrier delay - not seller fault.', resolution: 'Refund' },
    { id: 'RETURN_004', orderId: 'ORDER_017', amazonOrderId: '114-4567890-1234568', returnRequestDate: '2026-04-08T14:00:00Z', status: 'Pending', reason: 'Different from what was ordered', buyerComments: 'I expected the sea breeze candle to be blue colored based on the photos, but it is white. The scent is fine but the visual doesn\'t match the listing images.', items: [{ asin: 'B09ABCDEF5', sku: 'EHG-CANDLE-SEA-01', title: 'Evergreen Sea Breeze Soy Candle, 8 oz', quantity: 1, refundAmount: 18.99 }], sellerNotes: '', resolution: null },
    { id: 'RETURN_005', orderId: 'ORDER_021', amazonOrderId: '114-8901234-5678902', returnRequestDate: '2026-04-02T10:00:00Z', status: 'Denied', reason: 'Product and shipping box damaged', buyerComments: 'The cinnamon candle jar arrived with a small chip on the rim.', items: [{ asin: 'B09ABCDEFJ', sku: 'EHG-CANDLE-CIN-01', title: 'Evergreen Cinnamon Spice Soy Candle, 12 oz', quantity: 1, refundAmount: 22.99 }], sellerNotes: 'Carrier damage claim filed. Buyer was offered replacement instead.', resolution: 'Denied' }
  ];

  const campaigns = [
    {
      id: 'CAMP_001', name: 'Candle Collection - Sponsored Products', type: 'Sponsored Products', status: 'Enabled', dailyBudget: 25.00, startDate: '2026-03-01', endDate: null, targetingType: 'Manual', bidStrategy: 'Dynamic bids - down only',
      metrics: { impressions: 148230, clicks: 3421, ctr: 2.31, spend: 1845.67, sales: 6789.00, acos: 27.2, roas: 3.68, orders: 256, cpc: 0.54 },
      adGroups: [
        { id: 'AG_001', name: 'Candle Core Keywords', status: 'Enabled', defaultBid: 0.55, products: ['PROD_001', 'PROD_002', 'PROD_003', 'PROD_004', 'PROD_005', 'PROD_006', 'PROD_019', 'PROD_026', 'PROD_030', 'PROD_032'], keywords: [
          { keyword: 'soy candle', matchType: 'Exact', bid: 0.65, status: 'Enabled', impressions: 42000, clicks: 1200, spend: 648, sales: 2400 },
          { keyword: 'scented candle', matchType: 'Phrase', bid: 0.55, status: 'Enabled', impressions: 38000, clicks: 890, spend: 445, sales: 1780 },
          { keyword: 'lavender candle', matchType: 'Exact', bid: 0.70, status: 'Enabled', impressions: 25000, clicks: 680, spend: 408, sales: 1632 },
          { keyword: 'vanilla candle', matchType: 'Exact', bid: 0.60, status: 'Enabled', impressions: 18000, clicks: 420, spend: 210, sales: 630 },
          { keyword: 'natural candle', matchType: 'Broad', bid: 0.45, status: 'Paused', impressions: 12000, clicks: 150, spend: 60, sales: 90 },
          { keyword: 'gift candle set', matchType: 'Phrase', bid: 0.50, status: 'Enabled', impressions: 13230, clicks: 81, spend: 74.67, sales: 257 }
        ]}
      ]
    },
    {
      id: 'CAMP_002', name: 'Kitchen Essentials - Sponsored Products', type: 'Sponsored Products', status: 'Enabled', dailyBudget: 20.00, startDate: '2026-03-15', endDate: null, targetingType: 'Manual', bidStrategy: 'Dynamic bids - up and down',
      metrics: { impressions: 87450, clicks: 1834, ctr: 2.10, spend: 987.34, sales: 4123.50, acos: 23.9, roas: 4.18, orders: 143, cpc: 0.54 },
      adGroups: [
        { id: 'AG_002', name: 'Kitchen Products', status: 'Enabled', defaultBid: 0.50, products: ['PROD_009', 'PROD_010', 'PROD_016', 'PROD_024', 'PROD_027'], keywords: [
          { keyword: 'bamboo cutting board', matchType: 'Exact', bid: 0.60, status: 'Enabled', impressions: 35000, clicks: 780, spend: 390, sales: 1560 },
          { keyword: 'kitchen towels organic', matchType: 'Phrase', bid: 0.50, status: 'Enabled', impressions: 22000, clicks: 510, spend: 255, sales: 1020 },
          { keyword: 'wooden utensil set', matchType: 'Exact', bid: 0.55, status: 'Enabled', impressions: 18000, clicks: 340, spend: 170, sales: 850 },
          { keyword: 'olive wood board', matchType: 'Exact', bid: 0.65, status: 'Enabled', impressions: 12450, clicks: 204, spend: 172.34, sales: 693.50 }
        ]}
      ]
    },
    {
      id: 'CAMP_003', name: 'Home Fragrance - Sponsored Display', type: 'Sponsored Display', status: 'Paused', dailyBudget: 15.00, startDate: '2026-02-01', endDate: '2026-04-30', targetingType: 'Automatic', bidStrategy: 'Optimize for reach',
      metrics: { impressions: 234500, clicks: 2345, ctr: 1.00, spend: 567.89, sales: 1234.56, acos: 46.0, roas: 2.17, orders: 45, cpc: 0.24 },
      adGroups: [
        { id: 'AG_003', name: 'Auto Targeting - Fragrance', status: 'Paused', defaultBid: 0.25, products: ['PROD_007', 'PROD_008'], keywords: [
          { keyword: 'Auto - Close match', matchType: 'Auto', bid: 0.25, status: 'Paused', impressions: 120000, clicks: 1200, spend: 300, sales: 600 },
          { keyword: 'Auto - Loose match', matchType: 'Auto', bid: 0.20, status: 'Paused', impressions: 114500, clicks: 1145, spend: 267.89, sales: 634.56 }
        ]}
      ]
    },
    {
      id: 'CAMP_004', name: 'Spring Collection Launch', type: 'Sponsored Products', status: 'Enabled', dailyBudget: 30.00, startDate: '2026-04-01', endDate: '2026-05-31', targetingType: 'Manual', bidStrategy: 'Dynamic bids - down only',
      metrics: { impressions: 24560, clicks: 567, ctr: 2.31, spend: 312.45, sales: 1189.60, acos: 26.3, roas: 3.81, orders: 38, cpc: 0.55 },
      adGroups: [
        { id: 'AG_004', name: 'Spring Scents', status: 'Enabled', defaultBid: 0.55, products: ['PROD_026', 'PROD_032', 'PROD_006'], keywords: [
          { keyword: 'spring candle', matchType: 'Exact', bid: 0.60, status: 'Enabled', impressions: 12000, clicks: 290, spend: 160, sales: 600 },
          { keyword: 'cherry blossom candle', matchType: 'Exact', bid: 0.55, status: 'Enabled', impressions: 8000, clicks: 180, spend: 99, sales: 360 },
          { keyword: 'peach candle', matchType: 'Phrase', bid: 0.50, status: 'Enabled', impressions: 4560, clicks: 97, spend: 53.45, sales: 229.60 }
        ]}
      ]
    }
  ];

  const accountHealth = {
    overallRating: 'Good',
    accountHealthRating: 350,
    customerServicePerformance: {
      orderDefectRate: { current: 0.28, target: 1.0, status: 'Good', orders: 3, totalOrders: 1072 },
      negativeFeedbackRate: { current: 0.56, target: null, count: 6 },
      aToZClaimRate: { current: 0.09, target: null, count: 1 },
      chargebackRate: { current: 0.0, count: 0 }
    },
    policyCompliance: {
      status: 'Good',
      intellectualPropertyComplaints: 0,
      productAuthenticityComplaints: 0,
      productConditionComplaints: 1,
      listingPolicyViolations: 0,
      restrictedProductViolations: 0,
      foodSafetyIssues: 0,
      customerProductReviews: 'No issues'
    },
    shippingPerformance: {
      lateShipmentRate: { current: 1.23, target: 4.0, status: 'Good' },
      preFulfillmentCancelRate: { current: 0.85, target: 2.5, status: 'Good' },
      validTrackingRate: { current: 97.5, target: 95.0, status: 'Good' },
      onTimeDeliveryRate: { current: 96.8, target: 97.0, status: 'Fair' }
    }
  };

  const feedback = [
    { id: 'FB_001', orderId: 'ORDER_008', buyerName: 'Daniel J.', rating: 5, comment: 'Incredible seller! Fast shipping and the bamboo cutting board is exactly as described. High quality product, will definitely order again.', date: '2026-04-09T08:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_002', orderId: 'ORDER_016', buyerName: 'Kevin W.', rating: 5, comment: 'Both candles arrived quickly and smell amazing. The woodwick crackling is so cozy. The packaging was beautiful. Perfect!', date: '2026-04-07T10:00:00Z', hasResponse: true, sellerResponse: 'Thank you so much for your kind words! We\'re so happy you love the candles. Enjoy the crackling ambiance!', removalRequested: false },
    { id: 'FB_003', orderId: 'ORDER_019', buyerName: 'Maria S.', rating: 5, comment: 'Love the silicone bags and cutting board! Great quality, exactly what I needed for meal prep. Eco-friendly too!', date: '2026-04-05T14:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_004', orderId: 'ORDER_020', buyerName: 'Brian F.', rating: 4, comment: 'The soap set and dispensers are great quality. Shipping was a bit slow but overall happy with the purchase.', date: '2026-04-03T09:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_005', orderId: 'ORDER_013', buyerName: 'Diana M.', rating: 5, comment: 'Water bottles are excellent! Keeps drinks cold all day. Very well made and worth every penny.', date: '2026-04-01T11:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_006', orderId: 'ORDER_010', buyerName: 'Mark D.', rating: 5, comment: 'Ordered kitchen towels and they are all perfect. Soft, absorbent and look great. Will buy again.', date: '2026-03-31T15:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_007', orderId: 'ORDER_012', buyerName: 'Peter K.', rating: 5, comment: 'Beautiful terracotta plant pots! Arrived well packaged, no damage. Perfect for my succulent collection.', date: '2026-03-28T10:00:00Z', hasResponse: true, sellerResponse: 'Thank you Peter! We love hearing our pots are being used for succulents. Enjoy your plant collection!', removalRequested: false },
    { id: 'FB_008', orderId: 'ORDER_018', buyerName: 'Greg P.', rating: 4, comment: 'Good products, fast delivery. The storage baskets look great. Mugs are nice but slightly smaller than expected.', date: '2026-03-22T12:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_009', orderId: 'ORDER_015', buyerName: 'Alison G.', rating: 5, comment: 'The olive wood serving board is stunning! Each one is truly unique. Used it for a dinner party and got tons of compliments.', date: '2026-04-08T09:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_010', orderId: 'ORDER_017', buyerName: 'Christine L.', rating: 3, comment: 'The citrus candle smells nice but the sea breeze one was not what I expected. The packaging was a bit flimsy for FBM shipping.', date: '2026-04-06T14:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_011', orderId: 'ORDER_009', buyerName: 'Rachel H.', rating: 5, comment: 'The wooden utensil set is gorgeous and the eucalyptus candle smells divine. Both arrived super fast. 5 stars!', date: '2026-04-10T11:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false },
    { id: 'FB_012', orderId: 'ORDER_026', buyerName: 'Greg P.', rating: 1, comment: 'Terrible experience. The candle arrived defective - wick was off-center and the glass cracked while burning. Safety hazard!', date: '2026-04-08T16:00:00Z', hasResponse: false, sellerResponse: null, removalRequested: false }
  ];

  const dailySnapshots = generateDailySnapshots();
  const salesData = {
    dailySnapshots,
    summary: {
      last7Days: { orderedProductSales: 8234.50, unitsOrdered: 312, totalOrderItems: 345, averageSellingPrice: 26.40 },
      last30Days: { orderedProductSales: 34567.89, unitsOrdered: 1305, totalOrderItems: 1450, averageSellingPrice: 26.48 },
      previousPeriod: { orderedProductSales: 31245.67, unitsOrdered: 1180 }
    }
  };

  const payments = {
    currentBalance: 2847.35,
    nextDisbursementDate: '2026-04-14',
    nextDisbursementEstimate: 2847.35,
    recentDisbursements: [
      { id: 'DISB_001', date: '2026-04-07', amount: 3124.50, status: 'Completed' },
      { id: 'DISB_002', date: '2026-03-31', amount: 2987.20, status: 'Completed' },
      { id: 'DISB_003', date: '2026-03-24', amount: 2756.80, status: 'Completed' },
      { id: 'DISB_004', date: '2026-03-17', amount: 3012.45, status: 'Completed' }
    ],
    feeBreakdown: { referralFees: 4567.89, fbaFulfillmentFees: 3456.78, fbaStorageFees: 234.56, subscriptionFee: 39.99, otherFees: 12.50 },
    transactions: [
      { id: 'TXN_001', date: '2026-04-10T09:15:00Z', type: 'Order', description: 'Order #114-3941689-8772232', amount: 37.98, orderId: 'ORDER_001' },
      { id: 'TXN_002', date: '2026-04-10T11:22:00Z', type: 'Order', description: 'Order #114-5892341-9341256', amount: 45.98, orderId: 'ORDER_002' },
      { id: 'TXN_003', date: '2026-04-10T14:05:00Z', type: 'Order', description: 'Order #114-7234891-5678901', amount: 24.99, orderId: 'ORDER_003' },
      { id: 'TXN_004', date: '2026-04-10T16:30:00Z', type: 'Order', description: 'Order #114-8901234-5678923', amount: 56.97, orderId: 'ORDER_004' },
      { id: 'TXN_005', date: '2026-04-09T10:00:00Z', type: 'Order', description: 'Order #114-2345678-9012345', amount: 64.97, orderId: 'ORDER_005' },
      { id: 'TXN_006', date: '2026-04-09T14:00:00Z', type: 'Fee', description: 'FBA Fulfillment Fee - April Week 2', amount: -234.50, orderId: null },
      { id: 'TXN_007', date: '2026-04-08T00:00:00Z', type: 'Fee', description: 'Referral Fee - April Week 2', amount: -456.78, orderId: null },
      { id: 'TXN_008', date: '2026-04-08T09:00:00Z', type: 'Order', description: 'Order #114-4567890-1234567', amount: 63.98, orderId: 'ORDER_007' },
      { id: 'TXN_009', date: '2026-04-07T00:00:00Z', type: 'Disbursement', description: 'Bank Transfer - April 7', amount: -3124.50, orderId: null },
      { id: 'TXN_010', date: '2026-04-07T11:00:00Z', type: 'Refund', description: 'Refund - Order #114-7823456-1234567', amount: -18.99, orderId: 'ORDER_026' },
      { id: 'TXN_011', date: '2026-04-06T09:00:00Z', type: 'Order', description: 'Order #114-8901234-5678901', amount: 38.99, orderId: 'ORDER_011' },
      { id: 'TXN_012', date: '2026-04-06T14:00:00Z', type: 'Order', description: 'Order #114-9012345-6789012', amount: 69.98, orderId: 'ORDER_012' },
      { id: 'TXN_013', date: '2026-04-05T11:00:00Z', type: 'Order', description: 'Order #114-0123456-7890123', amount: 49.98, orderId: 'ORDER_013' },
      { id: 'TXN_014', date: '2026-04-04T10:00:00Z', type: 'Fee', description: 'Subscription Fee - Monthly', amount: -39.99, orderId: null },
      { id: 'TXN_015', date: '2026-04-03T11:00:00Z', type: 'Order', description: 'Order #114-3456789-0123457', amount: 68.97, orderId: 'ORDER_016' },
      { id: 'TXN_016', date: '2026-04-02T10:00:00Z', type: 'Order', description: 'Order #114-4567890-1234568', amount: 37.98, orderId: 'ORDER_017' },
      { id: 'TXN_017', date: '2026-04-01T09:00:00Z', type: 'Order', description: 'Order #114-5678901-2345679', amount: 74.97, orderId: 'ORDER_018' },
      { id: 'TXN_018', date: '2026-03-31T00:00:00Z', type: 'Disbursement', description: 'Bank Transfer - March 31', amount: -2987.20, orderId: null },
      { id: 'TXN_019', date: '2026-03-30T10:00:00Z', type: 'Order', description: 'Order #114-6789012-3456790', amount: 69.97, orderId: 'ORDER_019' },
      { id: 'TXN_020', date: '2026-03-30T00:00:00Z', type: 'Fee', description: 'FBA Storage Fee - March', amount: -234.56, orderId: null },
      { id: 'TXN_021', date: '2026-03-28T11:00:00Z', type: 'Order', description: 'Order #114-7890123-4567891', amount: 55.98, orderId: 'ORDER_020' },
      { id: 'TXN_022', date: '2026-03-26T10:00:00Z', type: 'Order', description: 'Order #114-8901234-5678902', amount: 44.98, orderId: 'ORDER_021' },
      { id: 'TXN_023', date: '2026-03-22T09:00:00Z', type: 'Order', description: 'Order #114-9012345-6789013', amount: 69.97, orderId: 'ORDER_022' },
      { id: 'TXN_024', date: '2026-03-18T10:00:00Z', type: 'Order', description: 'Order #114-0123456-7890124', amount: 56.97, orderId: 'ORDER_023' },
      { id: 'TXN_025', date: '2026-03-15T09:00:00Z', type: 'Fee', description: 'Referral Fee - March Week 2', amount: -389.45, orderId: null },
      { id: 'TXN_026', date: '2026-03-15T09:00:00Z', type: 'Order', description: 'Order #114-1234567-8901235', amount: 34.99, orderId: 'ORDER_024' },
      { id: 'TXN_027', date: '2026-03-15T00:00:00Z', type: 'Adjustment', description: 'Inventory Reimbursement', amount: 12.50, orderId: null }
    ]
  };

  const fbaInventory = {
    inventoryPerformanceIndex: 580,
    storageLimits: {
      standardSize: { used: 1250, limit: 5000, unit: 'cubic feet' },
      oversize: { used: 0, limit: 500, unit: 'cubic feet' }
    },
    inventoryAge: products.filter(p => p.fulfillmentChannel === 'FBA').map(p => ({
      productId: p.id,
      asin: p.asin,
      title: p.title,
      daysInInventory: Math.floor(Math.random() * 80) + 10,
      quantity: p.availableQuantity,
      estimatedFee: 0.00,
      ageCategory: '0-90 days'
    })),
    restockSuggestions: [
      { productId: 'PROD_003', asin: 'B09ABCDEF3', title: 'Evergreen Eucalyptus & Mint Soy Candle, 8 oz', currentStock: 8, recommendedQuantity: 50, daysOfSupply: 5, alert: 'Low stock' },
      { productId: 'PROD_012', asin: 'B09ABCDEFC', title: 'Evergreen Stainless Steel Water Bottle, 32 oz', currentStock: 5, recommendedQuantity: 30, daysOfSupply: 9, alert: 'Restock soon' },
      { productId: 'PROD_027', asin: 'B09ABCDEFR', title: 'Evergreen Marble & Acacia Serving Tray', currentStock: 11, recommendedQuantity: 25, daysOfSupply: 12, alert: 'Restock soon' }
    ],
    inboundShipments: [
      { id: 'SHIP_001', shipmentName: 'Spring Restock - Candles', status: 'In Transit', destination: 'FBA Warehouse - PHX7', createdDate: '2026-04-05', estimatedArrival: '2026-04-12', itemCount: 200, receivedCount: 0, items: [{ asin: 'B09ABCDEF1', sku: 'EHG-CANDLE-LAV-01', quantity: 100, received: 0 }, { asin: 'B09ABCDEF2', sku: 'EHG-CANDLE-VAN-01', quantity: 100, received: 0 }] },
      { id: 'SHIP_002', shipmentName: 'Rose Candle & Gift Set Restock', status: 'Working', destination: 'FBA Warehouse - SDF8', createdDate: '2026-04-08', estimatedArrival: '2026-04-18', itemCount: 100, receivedCount: 0, items: [{ asin: 'B09ABCDEF6', sku: 'EHG-CANDLE-ROSE-01', quantity: 50, received: 0 }, { asin: 'B09ABCDEFF', sku: 'EHG-CANDLE-3PK-01', quantity: 50, received: 0 }] },
      { id: 'SHIP_003', shipmentName: 'Water Bottle & Blanket Restock', status: 'Receiving', destination: 'FBA Warehouse - ONT8', createdDate: '2026-03-28', estimatedArrival: '2026-04-10', itemCount: 55, receivedCount: 32, items: [{ asin: 'B09ABCDEFC', sku: 'EHG-BOTTLE-SS-02', quantity: 30, received: 18 }, { asin: 'B09ABCDEFM', sku: 'EHG-BLANKET-TH-01', quantity: 25, received: 14 }] },
      { id: 'SHIP_004', shipmentName: 'March Restock - Mixed', status: 'Closed', destination: 'FBA Warehouse - PHX7', createdDate: '2026-03-10', estimatedArrival: '2026-03-20', itemCount: 150, receivedCount: 150, items: [{ asin: 'B09ABCDEF9', sku: 'EHG-BOARD-BAM-01', quantity: 50, received: 50 }, { asin: 'B09ABCDEFA', sku: 'EHG-TOWEL-COT-01', quantity: 100, received: 100 }] }
    ]
  };

  const coupons = [
    { id: 'COUPON_001', name: 'Spring Sale - 15% Off Candles', type: 'Percentage Off', discount: 15, budget: 500.00, budgetUsed: 123.45, startDate: '2026-04-01', endDate: '2026-04-30', status: 'Active', targetProducts: ['PROD_001', 'PROD_002', 'PROD_003', 'PROD_004', 'PROD_005', 'PROD_006', 'PROD_019', 'PROD_026', 'PROD_030', 'PROD_032'], redemptions: 42, clipCount: 187 },
    { id: 'COUPON_002', name: 'March Clearance - $5 Off Water Bottles', type: 'Money Off', discount: 5, budget: 200.00, budgetUsed: 200.00, startDate: '2026-03-01', endDate: '2026-03-31', status: 'Expired', targetProducts: ['PROD_011', 'PROD_012'], redemptions: 40, clipCount: 98 },
    { id: 'COUPON_003', name: 'New Customer - $3 Off Kitchen Items', type: 'Money Off', discount: 3, budget: 300.00, budgetUsed: 78.00, startDate: '2026-04-01', endDate: '2026-06-30', status: 'Active', targetProducts: ['PROD_009', 'PROD_010', 'PROD_016', 'PROD_024', 'PROD_027'], redemptions: 26, clipCount: 134 }
  ];

  const pricingRules = [
    { id: 'RULE_001', name: 'Match Buy Box Price', target: 'All Active FBA Listings', strategy: 'Match lowest price', status: 'Active', productsCount: 25, minPrice: null, maxPrice: null },
    { id: 'RULE_002', name: 'Beat Competitor by $0.50', target: 'Candles Category', strategy: 'Beat lowest by $0.50', status: 'Paused', productsCount: 10, minPrice: 14.99, maxPrice: null },
    { id: 'RULE_003', name: 'Stay Above Cost + 30%', target: 'All Active Listings', strategy: 'Price floor - cost + 30% margin', status: 'Active', productsCount: 32, minPrice: null, maxPrice: null }
  ];

  const notifications = [
    { id: 'NOTIF_001', type: 'warning', title: 'Low Inventory Alert', message: 'Eucalyptus & Mint Candle has only 8 units remaining. Estimated 5 days of supply.', timestamp: '2026-04-10T08:00:00Z', isRead: false, actionUrl: '/inventory/planning', category: 'inventory' },
    { id: 'NOTIF_002', type: 'info', title: 'New Return Request', message: 'A return has been requested for Order #114-4567890-1234568. Reason: Different from expected.', timestamp: '2026-04-08T14:00:00Z', isRead: false, actionUrl: '/returns', category: 'orders' },
    { id: 'NOTIF_003', type: 'info', title: 'New Buyer Messages', message: 'You have 3 unanswered buyer messages. Respond within 24 hours to maintain your account health.', timestamp: '2026-04-10T09:00:00Z', isRead: false, actionUrl: '/messages', category: 'orders' },
    { id: 'NOTIF_004', type: 'warning', title: 'Policy Compliance Notice', message: '1 product condition complaint has been received. Review your listings to ensure accurate descriptions.', timestamp: '2026-04-08T12:00:00Z', isRead: true, actionUrl: '/account-health', category: 'policy' },
    { id: 'NOTIF_005', type: 'success', title: 'Disbursement Complete', message: 'Your payment of $3,124.50 has been disbursed to your bank account ending in 4521.', timestamp: '2026-04-07T10:00:00Z', isRead: true, actionUrl: '/payments', category: 'account' },
    { id: 'NOTIF_006', type: 'warning', title: 'Advertising Budget Alert', message: 'Your "Candle Collection - Sponsored Products" campaign has used 90% of daily budget.', timestamp: '2026-04-10T16:00:00Z', isRead: true, actionUrl: '/advertising', category: 'advertising' },
    { id: 'NOTIF_007', type: 'info', title: 'Shipment Update', message: 'Inbound shipment "Water Bottle & Blanket Restock" is now being received at ONT8.', timestamp: '2026-04-09T14:00:00Z', isRead: true, actionUrl: '/inventory/shipments', category: 'inventory' },
    { id: 'NOTIF_008', type: 'success', title: 'New 5-Star Review', message: 'Your Bamboo Cutting Board Set received a new 5-star review. "Best cutting boards I\'ve ever owned!"', timestamp: '2026-04-10T12:00:00Z', isRead: false, actionUrl: '/feedback', category: 'performance' }
  ];

  const settings = {
    notificationPreferences: {
      emailOrderConfirmation: true,
      emailReturnRequest: true,
      emailBuyerMessage: true,
      emailInventoryAlert: true,
      emailPromotions: false,
      emailReports: true,
      emailFeedback: true,
      emailAdvertisingAlerts: true
    },
    shippingSettings: {
      defaultShippingService: 'USPS Priority Mail',
      handlingTime: 2,
      returnAddress: { name: 'Evergreen Home Goods', line1: '456 Warehouse Blvd', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' }
    },
    listingDefaults: { defaultCondition: 'New', defaultFulfillment: 'FBA' }
  };

  return {
    seller: {
      id: 'SELLER_001',
      displayName: 'Evergreen Home Goods',
      legalName: 'Evergreen Home Goods LLC',
      email: 'admin@evergreenhomegoods.com',
      marketplace: 'Amazon.com (US)',
      planType: 'Professional',
      storeName: 'Evergreen Home Goods',
      sellerId: 'A2B7C9D1E3F5G7H9',
      registeredSince: '2021-06-15',
      accountHealthRating: 350,
      notificationCount: 4,
      unreadMessages: 3
    },
    products,
    orders,
    messages,
    returns: returns_data,
    campaigns,
    accountHealth,
    feedback,
    salesData,
    payments,
    fbaInventory,
    coupons,
    pricingRules,
    notifications,
    settings
  };
}
