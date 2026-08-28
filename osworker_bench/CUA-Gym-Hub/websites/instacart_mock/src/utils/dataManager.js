const BASE_STORAGE_KEY = 'instacart_mock_state';
const BASE_INITIAL_KEY = 'instacart_mock_initialState';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const r = await fetch(url);
    if (r.ok) { const d = await r.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch (e) { console.log('No custom state'); }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  }, 300);
};

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

function deepMerge(target, source) {
  if (!source) return target;
  const r = { ...target };
  for (const k in source) {
    if (source[k] !== null && source[k] !== undefined) {
      if (Array.isArray(source[k])) { r[k] = source[k]; }
      else if (typeof source[k] === 'object' && typeof target[k] === 'object' && !Array.isArray(target[k])) {
        r[k] = deepMerge(target[k], source[k]);
      } else { r[k] = source[k]; }
    }
  }
  return r;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);
  if (customState) {
    const data = deepMerge(createInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }
  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }
  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// Emoji map for product images
const PRODUCT_EMOJI = {
  'Organic Bananas': '🍌', 'Strawberries': '🍓', 'Avocados': '🥑', 'Baby Spinach': '🥬',
  'Romaine Hearts': '🥬', 'Russet Potatoes': '🥔', 'Yellow Onions': '🧅', 'Roma Tomatoes': '🍅',
  'Lemons': '🍋', 'Blueberries': '🫐', 'Red Bell Pepper': '🌶️', 'Broccoli Crowns': '🥦',
  '2% Milk': '🥛', 'Large Eggs': '🥚', 'Greek Yogurt': '🥛', 'Cheddar Cheese Block': '🧀',
  'Unsalted Butter': '🧈', 'Cream Cheese': '🧀', 'Shredded Mozzarella': '🧀', 'Half & Half': '🥛',
  'Sour Cream': '🥛', 'Cottage Cheese': '🥛',
  'Chicken Breast': '🍗', 'Ground Beef 80/20': '🥩', 'Atlantic Salmon Fillet': '🐟',
  'Pork Chops': '🥩', 'Thick-Cut Bacon': '🥓', 'Italian Sausage': '🌭', 'Raw Shrimp': '🦐',
  'Deli Turkey Breast': '🦃',
  'Sourdough Bread': '🍞', 'Whole Wheat Bread': '🍞', 'Everything Bagels': '🥯',
  'Croissants': '🥐', 'Chocolate Chip Cookies': '🍪', 'Flour Tortillas': '🫓',
  'DiGiorno Frozen Pizza': '🍕', 'Vanilla Ice Cream': '🍦', 'Frozen Mixed Vegetables': '🥦',
  'Frozen Chicken Nuggets': '🍗', 'Frozen Berry Mix': '🫐', 'Frozen Waffles': '🧇',
  'Frozen Mac & Cheese': '🧀', 'Ice Cream Sandwiches': '🍦',
  'Spaghetti Pasta': '🍝', 'Marinara Sauce': '🥫', 'Creamy Peanut Butter': '🥜',
  'Chicken Broth': '🥣', 'Canned Diced Tomatoes': '🥫', 'Extra Virgin Olive Oil': '🫒',
  'Jasmine Rice': '🍚', 'Black Beans': '🥫', 'Honey': '🍯', 'All-Purpose Flour': '🌾',
  "Lay's Classic Chips": '🥔', 'Goldfish Crackers': '🐟', 'Mixed Nuts': '🥜',
  'Oreo Cookies': '🍪', 'Microwave Popcorn': '🍿', 'Granola Bars': '🥜',
  'Pretzels': '🥨', 'Dark Chocolate Bar': '🍫',
  'Spring Water 24-Pack': '💧', 'Coca-Cola 12-Pack': '🥤', 'Orange Juice': '🍊',
  'Ground Coffee': '☕', 'Green Tea Bags': '🍵', 'Almond Milk': '🥛',
  'LaCroix Sparkling Water': '💧', 'Apple Juice': '🧃',
  'Paper Towels': '🧻', 'Dish Soap': '🧴', 'Laundry Detergent': '🧺',
  'Trash Bags': '🗑️', 'All-Purpose Cleaner': '🧹', 'Sponges': '🧽',
  'Ibuprofen': '💊', 'Multivitamin': '💊', 'Hand Soap': '🧴', 'Toothpaste': '🪥'
};

const STORE_COLORS = {
  store_1: '#E8372C', store_2: '#005DAA', store_3: '#00674B',
  store_4: '#F47920', store_5: '#CC0000', store_6: '#CC0000',
  store_7: '#0056A3', store_8: '#C41230'
};

const STORE_EMOJIS = {
  store_1: '🛒', store_2: '📦', store_3: '🌿', store_4: '🌱',
  store_5: '💊', store_6: '🎯', store_7: '🐾', store_8: '🍷'
};

export function createInitialData() {
  const stores = [
    { id:'store_1', name:'Safeway', slug:'safeway', color:'#E8372C', emoji:'🛒', description:'Fresh groceries and everyday essentials', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:45, deliveryTimeMax:60, rating:4.7, isInStorePricing:true, categories:['Groceries'] },
    { id:'store_2', name:'Costco', slug:'costco', color:'#005DAA', emoji:'📦', description:'Warehouse savings on bulk items', deliveryFee:5.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:35, deliveryTimeMin:60, deliveryTimeMax:90, rating:4.8, isInStorePricing:false, categories:['Groceries','Wholesale'] },
    { id:'store_3', name:'Whole Foods Market', slug:'whole-foods', color:'#00674B', emoji:'🌿', description:'Organic and natural foods', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:30, deliveryTimeMax:45, rating:4.6, isInStorePricing:true, categories:['Groceries','Organic'] },
    { id:'store_4', name:'Sprouts Farmers Market', slug:'sprouts', color:'#F47920', emoji:'🌱', description:'Healthy living for less', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:45, deliveryTimeMax:60, rating:4.5, isInStorePricing:true, categories:['Groceries','Natural'] },
    { id:'store_5', name:'CVS Pharmacy', slug:'cvs', color:'#CC0000', emoji:'💊', description:'Pharmacy and everyday essentials', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:30, deliveryTimeMax:45, rating:4.3, isInStorePricing:false, categories:['Pharmacy','Convenience'] },
    { id:'store_6', name:'Target', slug:'target', color:'#CC0000', emoji:'🎯', description:'Expect more, pay less', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:45, deliveryTimeMax:60, rating:4.5, isInStorePricing:false, categories:['Groceries','General'] },
    { id:'store_7', name:'Petco', slug:'petco', color:'#0056A3', emoji:'🐾', description:'Everything your pet needs', deliveryFee:3.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:10, deliveryTimeMin:60, deliveryTimeMax:90, rating:4.4, isInStorePricing:false, categories:['Pet Supplies'] },
    { id:'store_8', name:'Total Wine & More', slug:'total-wine', color:'#C41230', emoji:'🍷', description:'America\'s wine superstore', deliveryFee:5.99, deliveryFeeWithPlus:0, serviceFeePercent:5, minOrder:20, deliveryTimeMin:60, deliveryTimeMax:90, rating:4.6, isInStorePricing:false, categories:['Alcohol','Beverages'] }
  ];

  const departments = [
    { id:'dept_produce', storeId:'store_1', name:'Produce', slug:'produce', icon:'🥬', displayOrder:1, subcategories:[{id:'subcat_fruits',name:'Fresh Fruits',slug:'fresh-fruits'},{id:'subcat_vegetables',name:'Fresh Vegetables',slug:'fresh-vegetables'},{id:'subcat_herbs',name:'Fresh Herbs',slug:'fresh-herbs'},{id:'subcat_organic',name:'Organic Produce',slug:'organic-produce'}] },
    { id:'dept_dairy', storeId:'store_1', name:'Dairy & Eggs', slug:'dairy-eggs', icon:'🥛', displayOrder:2, subcategories:[{id:'subcat_milk',name:'Milk',slug:'milk'},{id:'subcat_cheese',name:'Cheese',slug:'cheese'},{id:'subcat_yogurt',name:'Yogurt',slug:'yogurt'},{id:'subcat_eggs',name:'Eggs',slug:'eggs'},{id:'subcat_butter',name:'Butter & Margarine',slug:'butter'}] },
    { id:'dept_meat', storeId:'store_1', name:'Meat & Seafood', slug:'meat-seafood', icon:'🥩', displayOrder:3, subcategories:[{id:'subcat_beef',name:'Beef',slug:'beef'},{id:'subcat_chicken',name:'Chicken',slug:'chicken'},{id:'subcat_pork',name:'Pork',slug:'pork'},{id:'subcat_seafood',name:'Seafood',slug:'seafood'},{id:'subcat_deli_meat',name:'Deli Meat',slug:'deli-meat'}] },
    { id:'dept_bakery', storeId:'store_1', name:'Bakery', slug:'bakery', icon:'🍞', displayOrder:4, subcategories:[{id:'subcat_bread',name:'Bread',slug:'bread'},{id:'subcat_rolls',name:'Rolls & Buns',slug:'rolls'},{id:'subcat_cakes',name:'Cakes & Pies',slug:'cakes'},{id:'subcat_cookies_bak',name:'Cookies & Brownies',slug:'cookies-brownies'}] },
    { id:'dept_deli', storeId:'store_1', name:'Deli', slug:'deli', icon:'🧀', displayOrder:5, subcategories:[{id:'subcat_prepared',name:'Prepared Meals',slug:'prepared-meals'},{id:'subcat_sliced_cheese',name:'Sliced Cheese',slug:'sliced-cheese'},{id:'subcat_sliced_meats',name:'Sliced Meats',slug:'sliced-meats'},{id:'subcat_dips',name:'Dips & Spreads',slug:'dips'}] },
    { id:'dept_frozen', storeId:'store_1', name:'Frozen', slug:'frozen', icon:'❄️', displayOrder:6, subcategories:[{id:'subcat_frozen_meals',name:'Frozen Meals',slug:'frozen-meals'},{id:'subcat_ice_cream',name:'Ice Cream',slug:'ice-cream'},{id:'subcat_frozen_vegs',name:'Frozen Vegetables',slug:'frozen-vegetables'},{id:'subcat_frozen_pizza',name:'Frozen Pizza',slug:'frozen-pizza'}] },
    { id:'dept_pantry', storeId:'store_1', name:'Pantry', slug:'pantry', icon:'🥫', displayOrder:7, subcategories:[{id:'subcat_pasta',name:'Pasta & Grains',slug:'pasta-grains'},{id:'subcat_canned',name:'Canned Goods',slug:'canned-goods'},{id:'subcat_sauces',name:'Sauces & Condiments',slug:'sauces'},{id:'subcat_oils',name:'Oils & Vinegars',slug:'oils'},{id:'subcat_baking',name:'Baking',slug:'baking'}] },
    { id:'dept_snacks', storeId:'store_1', name:'Snacks & Candy', slug:'snacks-candy', icon:'🍿', displayOrder:8, subcategories:[{id:'subcat_chips',name:'Chips',slug:'chips'},{id:'subcat_crackers',name:'Crackers',slug:'crackers'},{id:'subcat_nuts',name:'Nuts & Seeds',slug:'nuts'},{id:'subcat_candy',name:'Candy & Chocolate',slug:'candy'},{id:'subcat_popcorn',name:'Popcorn',slug:'popcorn'}] },
    { id:'dept_beverages', storeId:'store_1', name:'Beverages', slug:'beverages', icon:'🥤', displayOrder:9, subcategories:[{id:'subcat_water',name:'Water',slug:'water'},{id:'subcat_soda',name:'Soda',slug:'soda'},{id:'subcat_juice',name:'Juice',slug:'juice'},{id:'subcat_coffee',name:'Coffee & Tea',slug:'coffee-tea'},{id:'subcat_energy',name:'Energy Drinks',slug:'energy'}] },
    { id:'dept_breakfast', storeId:'store_1', name:'Breakfast', slug:'breakfast', icon:'🥣', displayOrder:10, subcategories:[{id:'subcat_cereal',name:'Cereal',slug:'cereal'},{id:'subcat_oatmeal',name:'Oatmeal',slug:'oatmeal'},{id:'subcat_pancake',name:'Pancake & Waffle Mix',slug:'pancake'},{id:'subcat_bars',name:'Breakfast Bars',slug:'bars'}] },
    { id:'dept_household', storeId:'store_1', name:'Household', slug:'household', icon:'🧹', displayOrder:11, subcategories:[{id:'subcat_cleaning',name:'Cleaning Supplies',slug:'cleaning'},{id:'subcat_paper',name:'Paper Products',slug:'paper'},{id:'subcat_laundry',name:'Laundry',slug:'laundry'},{id:'subcat_trash',name:'Trash Bags',slug:'trash'}] },
    { id:'dept_health', storeId:'store_1', name:'Health & Beauty', slug:'health-beauty', icon:'💊', displayOrder:12, subcategories:[{id:'subcat_vitamins',name:'Vitamins',slug:'vitamins'},{id:'subcat_pain',name:'Pain Relief',slug:'pain'},{id:'subcat_skin',name:'Skin Care',slug:'skin'},{id:'subcat_hair',name:'Hair Care',slug:'hair'},{id:'subcat_oral',name:'Oral Care',slug:'oral'}] },
    { id:'dept_baby', storeId:'store_1', name:'Baby & Kids', slug:'baby-kids', icon:'🍼', displayOrder:13, subcategories:[{id:'subcat_diapers',name:'Diapers',slug:'diapers'},{id:'subcat_baby_food',name:'Baby Food',slug:'baby-food'},{id:'subcat_baby_care',name:'Baby Care',slug:'baby-care'},{id:'subcat_kids_snacks',name:'Kids Snacks',slug:'kids-snacks'}] },
    { id:'dept_pet', storeId:'store_1', name:'Pet Care', slug:'pet-care', icon:'🐾', displayOrder:14, subcategories:[{id:'subcat_dog',name:'Dog Food',slug:'dog-food'},{id:'subcat_cat',name:'Cat Food',slug:'cat-food'},{id:'subcat_pet_treats',name:'Pet Treats',slug:'pet-treats'},{id:'subcat_pet_supplies',name:'Pet Supplies',slug:'pet-supplies'}] },
    // Costco departments
    { id:'dept_s2_bulk', storeId:'store_2', name:'Bulk Items', slug:'bulk', icon:'📦', displayOrder:1, subcategories:[] },
    { id:'dept_s2_pantry', storeId:'store_2', name:'Pantry', slug:'pantry', icon:'🥫', displayOrder:2, subcategories:[] },
    { id:'dept_s2_beverages', storeId:'store_2', name:'Beverages', slug:'beverages', icon:'🥤', displayOrder:3, subcategories:[] },
    { id:'dept_s2_household', storeId:'store_2', name:'Household', slug:'household', icon:'🧹', displayOrder:4, subcategories:[] },
    { id:'dept_s2_frozen', storeId:'store_2', name:'Frozen', slug:'frozen', icon:'❄️', displayOrder:5, subcategories:[] },
    // Whole Foods departments
    { id:'dept_s3_produce', storeId:'store_3', name:'Organic Produce', slug:'organic-produce', icon:'🥬', displayOrder:1, subcategories:[] },
    { id:'dept_s3_dairy', storeId:'store_3', name:'Dairy & Eggs', slug:'dairy', icon:'🥛', displayOrder:2, subcategories:[] },
    { id:'dept_s3_meat', storeId:'store_3', name:'Meat & Seafood', slug:'meat', icon:'🥩', displayOrder:3, subcategories:[] },
    { id:'dept_s3_bakery', storeId:'store_3', name:'Bakery', slug:'bakery', icon:'🍞', displayOrder:4, subcategories:[] },
    { id:'dept_s3_pantry', storeId:'store_3', name:'Pantry', slug:'pantry', icon:'🥫', displayOrder:5, subcategories:[] },
    // Sprouts departments
    { id:'dept_s4_produce', storeId:'store_4', name:'Fresh Produce', slug:'produce', icon:'🥬', displayOrder:1, subcategories:[] },
    { id:'dept_s4_bulk', storeId:'store_4', name:'Bulk Foods', slug:'bulk', icon:'🌾', displayOrder:2, subcategories:[] },
    { id:'dept_s4_vitamins', storeId:'store_4', name:'Vitamins & Supplements', slug:'vitamins', icon:'💊', displayOrder:3, subcategories:[] },
    { id:'dept_s4_dairy', storeId:'store_4', name:'Dairy', slug:'dairy', icon:'🥛', displayOrder:4, subcategories:[] },
    // CVS departments
    { id:'dept_s5_pharmacy', storeId:'store_5', name:'Pharmacy', slug:'pharmacy', icon:'💊', displayOrder:1, subcategories:[] },
    { id:'dept_s5_health', storeId:'store_5', name:'Health & Wellness', slug:'health', icon:'🏥', displayOrder:2, subcategories:[] },
    { id:'dept_s5_beauty', storeId:'store_5', name:'Beauty', slug:'beauty', icon:'💄', displayOrder:3, subcategories:[] },
    { id:'dept_s5_snacks', storeId:'store_5', name:'Snacks & Drinks', slug:'snacks', icon:'🍿', displayOrder:4, subcategories:[] },
    // Target departments
    { id:'dept_s6_grocery', storeId:'store_6', name:'Grocery', slug:'grocery', icon:'🛒', displayOrder:1, subcategories:[] },
    { id:'dept_s6_household', storeId:'store_6', name:'Household', slug:'household', icon:'🧹', displayOrder:2, subcategories:[] },
    { id:'dept_s6_health', storeId:'store_6', name:'Health & Beauty', slug:'health', icon:'💊', displayOrder:3, subcategories:[] },
    { id:'dept_s6_snacks', storeId:'store_6', name:'Snacks', slug:'snacks', icon:'🍿', displayOrder:4, subcategories:[] },
    // Petco departments
    { id:'dept_s7_dog', storeId:'store_7', name:'Dog', slug:'dog', icon:'🐕', displayOrder:1, subcategories:[] },
    { id:'dept_s7_cat', storeId:'store_7', name:'Cat', slug:'cat', icon:'🐈', displayOrder:2, subcategories:[] },
    { id:'dept_s7_treats', storeId:'store_7', name:'Treats', slug:'treats', icon:'🦴', displayOrder:3, subcategories:[] },
    { id:'dept_s7_supplies', storeId:'store_7', name:'Supplies', slug:'supplies', icon:'🧶', displayOrder:4, subcategories:[] },
    // Total Wine departments
    { id:'dept_s8_wine', storeId:'store_8', name:'Wine', slug:'wine', icon:'🍷', displayOrder:1, subcategories:[] },
    { id:'dept_s8_beer', storeId:'store_8', name:'Beer', slug:'beer', icon:'🍺', displayOrder:2, subcategories:[] },
    { id:'dept_s8_spirits', storeId:'store_8', name:'Spirits', slug:'spirits', icon:'🥃', displayOrder:3, subcategories:[] },
    { id:'dept_s8_mixers', storeId:'store_8', name:'Mixers & More', slug:'mixers', icon:'🧃', displayOrder:4, subcategories:[] }
  ];

  const products = createProducts();
  const cart = [
    { id:'cart_1', productId:'prod_1', storeId:'store_1', quantity:3, replacementPreference:'best_match', specificReplacementId:null, note:'', addedAt:'2025-03-09T14:30:00Z' },
    { id:'cart_2', productId:'prod_13', storeId:'store_1', quantity:1, replacementPreference:'best_match', specificReplacementId:null, note:'', addedAt:'2025-03-09T14:31:00Z' },
    { id:'cart_3', productId:'prod_25', storeId:'store_1', quantity:2, replacementPreference:'best_match', specificReplacementId:null, note:'', addedAt:'2025-03-09T14:32:00Z' },
    { id:'cart_4', productId:'prod_37', storeId:'store_1', quantity:1, replacementPreference:'best_match', specificReplacementId:null, note:'', addedAt:'2025-03-09T14:33:00Z' },
    { id:'cart_5', productId:'prod_15', storeId:'store_1', quantity:2, replacementPreference:'best_match', specificReplacementId:null, note:'', addedAt:'2025-03-09T14:34:00Z' }
  ];

  const orders = createOrders(products);
  const shoppingLists = createShoppingLists();
  const recipes = createRecipes();
  const deals = createDeals();
  const deliverySlots = createDeliverySlots();

  return {
    user: { id:'user_1', firstName:'Sarah', lastName:'Johnson', email:'sarah.johnson@email.com', phone:'(415) 555-0142', avatar:null, defaultAddressId:'addr_1', instacartPlus:true, instacartPlusExpiry:'2026-01-15', preferredStoreId:'store_1', createdAt:'2023-06-15T10:00:00Z' },
    addresses: [
      { id:'addr_1', userId:'user_1', label:'Home', street:'742 Evergreen Terrace', apt:'Apt 3B', city:'San Francisco', state:'CA', zip:'94110', isDefault:true, deliveryInstructions:'Leave at the front door' },
      { id:'addr_2', userId:'user_1', label:'Work', street:'200 Market Street', apt:'Suite 400', city:'San Francisco', state:'CA', zip:'94105', isDefault:false, deliveryInstructions:'Call when arriving' }
    ],
    stores, departments, products, cart, orders, shoppingLists, recipes, deals, deliverySlots,
    selectedStoreId: 'store_1',
    selectedDepartmentId: null,
    searchQuery: '',
    cartOpen: false,
    activeModal: null,
    activeModalData: null,
    deliveryAddressId: 'addr_1',
    selectedDeliverySlot: null,
    shopperTip: 5.00,
    sortBy: 'best_match',
    filters: { onSale: false, organic: false, buyItAgain: false },
    appliedPromo: null,
    favorites: []
  };
}

function seededRating(seed) {
  // Simple deterministic hash-based pseudo-random for ratings
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return 4.0 + (x - Math.floor(x));
}

function seededReviewCount(seed, base, range) {
  const x = Math.sin(seed * 7919 + 31337) * 31337;
  return Math.floor(base + (x - Math.floor(x)) * range);
}

function createProducts() {
  const p = [];
  let id = 1;
  const mkId = () => `prod_${id++}`;

  // Produce (12)
  const produce = [
    { name:'Organic Bananas', brand:'Organic', price:0.79, unit:'each', unitSize:'1 ct', unitPrice:0.79, unitPriceLabel:'/each', isOrganic:true, isOnSale:false, sub:'subcat_fruits', tags:['organic','fruit','fresh'], nutrition:{servingSize:'1 medium (126g)',calories:110,totalFat:'0g',sodium:'0mg',totalCarbs:'28g',fiber:'3g',sugars:'15g',protein:'1g'}, desc:'Ripe organic bananas, perfect for snacking or baking.', ingredients:'Organic bananas' },
    { name:'Strawberries', brand:'Driscoll\'s', price:4.99, unit:'lb', unitSize:'1 lb', unitPrice:4.99, unitPriceLabel:'/lb', isOrganic:false, isOnSale:true, originalPrice:5.99, sub:'subcat_fruits', tags:['fruit','fresh','berries'], nutrition:{servingSize:'8 berries (147g)',calories:50,totalFat:'0g',sodium:'0mg',totalCarbs:'12g',fiber:'3g',sugars:'7g',protein:'1g'}, desc:'Sweet, juicy California strawberries.', ingredients:'Strawberries' },
    { name:'Avocados', brand:'Hass', price:1.50, unit:'each', unitSize:'1 ct', unitPrice:1.50, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, sub:'subcat_fruits', tags:['fruit','fresh'], nutrition:{servingSize:'1/3 medium (50g)',calories:80,totalFat:'7g',sodium:'0mg',totalCarbs:'4g',fiber:'3g',sugars:'0g',protein:'1g'}, desc:'Creamy Hass avocados, perfect for guacamole.', ingredients:'Avocados' },
    { name:'Baby Spinach', brand:'Organic Girl', price:3.99, unit:'oz', unitSize:'5 oz', unitPrice:0.80, unitPriceLabel:'/oz', isOrganic:true, isOnSale:false, sub:'subcat_vegetables', tags:['organic','vegetable','greens','fresh'], nutrition:{servingSize:'3 cups (85g)',calories:20,totalFat:'0g',sodium:'65mg',totalCarbs:'3g',fiber:'2g',sugars:'0g',protein:'2g'}, desc:'Tender organic baby spinach leaves.', ingredients:'Organic baby spinach' },
    { name:'Romaine Hearts', brand:'Fresh Express', price:3.49, unit:'ct', unitSize:'3 ct', unitPrice:1.16, unitPriceLabel:'/ct', isOrganic:false, isOnSale:false, sub:'subcat_vegetables', tags:['vegetable','greens','fresh'], nutrition:{servingSize:'6 leaves (85g)',calories:15,totalFat:'0g',sodium:'5mg',totalCarbs:'3g',fiber:'2g',sugars:'1g',protein:'1g'}, desc:'Crisp romaine lettuce hearts.', ingredients:'Romaine lettuce' },
    { name:'Russet Potatoes', brand:'Store Brand', price:4.49, unit:'lb', unitSize:'5 lb bag', unitPrice:0.90, unitPriceLabel:'/lb', isOrganic:false, isOnSale:false, sub:'subcat_vegetables', tags:['vegetable','starchy'], nutrition:{servingSize:'1 medium (148g)',calories:110,totalFat:'0g',sodium:'0mg',totalCarbs:'26g',fiber:'2g',sugars:'1g',protein:'3g'}, desc:'Premium russet potatoes for baking and mashing.', ingredients:'Potatoes' },
    { name:'Yellow Onions', brand:'Store Brand', price:1.29, unit:'lb', unitSize:'1 lb', unitPrice:1.29, unitPriceLabel:'/lb', isOrganic:false, isOnSale:false, sub:'subcat_vegetables', tags:['vegetable','cooking'], nutrition:{servingSize:'1 medium (148g)',calories:45,totalFat:'0g',sodium:'0mg',totalCarbs:'11g',fiber:'2g',sugars:'5g',protein:'1g'}, desc:'Versatile yellow onions for cooking.', ingredients:'Yellow onions' },
    { name:'Roma Tomatoes', brand:'Store Brand', price:1.99, unit:'lb', unitSize:'1 lb', unitPrice:1.99, unitPriceLabel:'/lb', isOrganic:false, isOnSale:true, originalPrice:2.49, sub:'subcat_vegetables', tags:['vegetable','fresh'], nutrition:{servingSize:'1 medium (62g)',calories:11,totalFat:'0g',sodium:'2mg',totalCarbs:'2g',fiber:'1g',sugars:'2g',protein:'1g'}, desc:'Firm Roma tomatoes, ideal for sauces.', ingredients:'Roma tomatoes' },
    { name:'Lemons', brand:'Sunkist', price:0.69, unit:'each', unitSize:'1 ct', unitPrice:0.69, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, sub:'subcat_fruits', tags:['fruit','citrus','fresh'], nutrition:{servingSize:'1 medium (58g)',calories:15,totalFat:'0g',sodium:'1mg',totalCarbs:'5g',fiber:'2g',sugars:'1g',protein:'0g'}, desc:'Bright, tangy lemons.', ingredients:'Lemons' },
    { name:'Blueberries', brand:'Driscoll\'s', price:4.49, unit:'oz', unitSize:'6 oz', unitPrice:0.75, unitPriceLabel:'/oz', isOrganic:true, isOnSale:false, sub:'subcat_fruits', tags:['organic','fruit','berries','fresh'], nutrition:{servingSize:'1 cup (148g)',calories:85,totalFat:'0g',sodium:'1mg',totalCarbs:'21g',fiber:'4g',sugars:'15g',protein:'1g'}, desc:'Plump organic blueberries.', ingredients:'Organic blueberries' },
    { name:'Red Bell Pepper', brand:'Store Brand', price:1.49, unit:'each', unitSize:'1 ct', unitPrice:1.49, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, sub:'subcat_vegetables', tags:['vegetable','fresh'], nutrition:{servingSize:'1 medium (119g)',calories:25,totalFat:'0g',sodium:'3mg',totalCarbs:'6g',fiber:'2g',sugars:'4g',protein:'1g'}, desc:'Sweet red bell pepper.', ingredients:'Red bell pepper' },
    { name:'Broccoli Crowns', brand:'Store Brand', price:2.49, unit:'lb', unitSize:'1 lb', unitPrice:2.49, unitPriceLabel:'/lb', isOrganic:false, isOnSale:false, sub:'subcat_vegetables', tags:['vegetable','fresh'], nutrition:{servingSize:'1 cup chopped (91g)',calories:31,totalFat:'0g',sodium:'30mg',totalCarbs:'6g',fiber:'2g',sugars:'2g',protein:'3g'}, desc:'Fresh broccoli crowns.', ingredients:'Broccoli' }
  ];
  produce.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_produce', subcategoryId:item.sub, name:item.name, brand:item.brand, description:item.desc, emoji:PRODUCT_EMOJI[item.name]||'🥬', price:item.price, originalPrice:item.originalPrice||null, priceUnit:item.unit, unitSize:item.unitSize, unitPrice:item.unitPrice, unitPriceLabel:item.unitPriceLabel, isOrganic:item.isOrganic, isOnSale:item.isOnSale, saleEndDate:item.isOnSale?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,50,200), nutrition:item.nutrition, ingredients:item.ingredients, allergens:[], tags:item.tags }));

  // Dairy & Eggs (10)
  const dairy = [
    { name:'2% Milk', brand:'Lucerne', price:4.29, unit:'gal', unitSize:'1 gallon', unitPrice:4.29, unitPriceLabel:'/gal', isOrganic:false, isOnSale:false, sub:'subcat_milk', tags:['dairy','milk'], desc:'Fresh 2% reduced-fat milk.' },
    { name:'Large Eggs', brand:'Eggland\'s Best', price:5.49, unit:'doz', unitSize:'1 dozen', unitPrice:0.46, unitPriceLabel:'/ct', isOrganic:false, isOnSale:true, originalPrice:6.49, sub:'subcat_eggs', tags:['dairy','eggs'], desc:'Grade A large brown eggs.' },
    { name:'Greek Yogurt', brand:'Chobani', price:1.49, unit:'oz', unitSize:'5.3 oz', unitPrice:0.28, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_yogurt', tags:['dairy','yogurt'], desc:'Non-fat plain Greek yogurt.' },
    { name:'Cheddar Cheese Block', brand:'Tillamook', price:5.99, unit:'oz', unitSize:'8 oz', unitPrice:0.75, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_cheese', tags:['dairy','cheese'], desc:'Sharp cheddar cheese block.' },
    { name:'Unsalted Butter', brand:'Kerrygold', price:5.49, unit:'oz', unitSize:'8 oz', unitPrice:0.69, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_butter', tags:['dairy','butter'], desc:'Premium Irish unsalted butter.' },
    { name:'Cream Cheese', brand:'Philadelphia', price:3.49, unit:'oz', unitSize:'8 oz', unitPrice:0.44, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_cheese', tags:['dairy','cheese'], desc:'Original cream cheese.' },
    { name:'Shredded Mozzarella', brand:'Sargento', price:4.29, unit:'oz', unitSize:'8 oz', unitPrice:0.54, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_cheese', tags:['dairy','cheese'], desc:'Part-skim shredded mozzarella.' },
    { name:'Half & Half', brand:'Organic Valley', price:4.99, unit:'oz', unitSize:'32 oz', unitPrice:0.16, unitPriceLabel:'/oz', isOrganic:true, isOnSale:false, sub:'subcat_milk', tags:['organic','dairy','cream'], desc:'Organic half and half.' },
    { name:'Sour Cream', brand:'Daisy', price:2.99, unit:'oz', unitSize:'16 oz', unitPrice:0.19, unitPriceLabel:'/oz', isOrganic:false, isOnSale:false, sub:'subcat_milk', tags:['dairy'], desc:'Pure and natural sour cream.' },
    { name:'Cottage Cheese', brand:'Good Culture', price:4.49, unit:'oz', unitSize:'16 oz', unitPrice:0.28, unitPriceLabel:'/oz', isOrganic:true, isOnSale:false, sub:'subcat_milk', tags:['organic','dairy'], desc:'Organic low-fat cottage cheese.' }
  ];
  dairy.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_dairy', subcategoryId:item.sub, name:item.name, brand:item.brand, description:item.desc, emoji:PRODUCT_EMOJI[item.name]||'🥛', price:item.price, originalPrice:item.originalPrice||null, priceUnit:item.unit, unitSize:item.unitSize, unitPrice:item.unitPrice, unitPriceLabel:item.unitPriceLabel, isOrganic:item.isOrganic, isOnSale:item.isOnSale||false, saleEndDate:item.isOnSale?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,50,200), nutrition:{servingSize:'1 serving',calories:120,totalFat:'5g',sodium:'120mg',totalCarbs:'12g',fiber:'0g',sugars:'12g',protein:'8g'}, ingredients:item.name, allergens:['milk'], tags:item.tags }));

  // Meat & Seafood (8)
  const meat = [
    { name:'Chicken Breast', brand:'Foster Farms', price:6.99, unit:'lb', unitSize:'1 lb', unitPrice:6.99, unitPriceLabel:'/lb', sub:'subcat_chicken', tags:['meat','chicken','protein'] },
    { name:'Ground Beef 80/20', brand:'Store Brand', price:5.99, unit:'lb', unitSize:'1 lb', unitPrice:5.99, unitPriceLabel:'/lb', sub:'subcat_beef', tags:['meat','beef','protein'] },
    { name:'Atlantic Salmon Fillet', brand:'Fresh', price:12.99, unit:'lb', unitSize:'1 lb', unitPrice:12.99, unitPriceLabel:'/lb', isOnSale:true, originalPrice:14.99, sub:'subcat_seafood', tags:['seafood','fish','protein'] },
    { name:'Pork Chops', brand:'Store Brand', price:4.99, unit:'lb', unitSize:'1 lb', unitPrice:4.99, unitPriceLabel:'/lb', sub:'subcat_pork', tags:['meat','pork','protein'] },
    { name:'Thick-Cut Bacon', brand:'Oscar Mayer', price:7.49, unit:'oz', unitSize:'16 oz', unitPrice:0.47, unitPriceLabel:'/oz', sub:'subcat_pork', tags:['meat','bacon','breakfast'] },
    { name:'Italian Sausage', brand:'Johnsonville', price:5.49, unit:'oz', unitSize:'19 oz', unitPrice:0.29, unitPriceLabel:'/oz', sub:'subcat_pork', tags:['meat','sausage'] },
    { name:'Raw Shrimp', brand:'SeaPak', price:9.99, unit:'lb', unitSize:'1 lb', unitPrice:9.99, unitPriceLabel:'/lb', sub:'subcat_seafood', tags:['seafood','shrimp','protein'] },
    { name:'Deli Turkey Breast', brand:'Boar\'s Head', price:8.99, unit:'lb', unitSize:'1 lb', unitPrice:8.99, unitPriceLabel:'/lb', sub:'subcat_deli_meat', tags:['meat','deli','turkey'] }
  ];
  meat.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_meat', subcategoryId:item.sub, name:item.name, brand:item.brand, description:`Fresh ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🥩', price:item.price, originalPrice:item.originalPrice||null, priceUnit:item.unit, unitSize:item.unitSize, unitPrice:item.unitPrice, unitPriceLabel:item.unitPriceLabel, isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,30,150), nutrition:{servingSize:'4 oz (112g)',calories:180,totalFat:'8g',sodium:'75mg',totalCarbs:'0g',fiber:'0g',sugars:'0g',protein:'24g'}, ingredients:item.name, allergens:[], tags:item.tags }));

  // Bakery (6)
  const bakery = [
    { name:'Sourdough Bread', brand:'San Francisco Baking Co.', price:4.99, unitSize:'1 loaf' },
    { name:'Whole Wheat Bread', brand:'Dave\'s Killer Bread', price:5.49, unitSize:'27 oz', isOrganic:true },
    { name:'Everything Bagels', brand:'Thomas\'', price:4.49, unitSize:'6 ct' },
    { name:'Croissants', brand:'La Boulangerie', price:4.99, unitSize:'4 ct', isOnSale:true, originalPrice:5.99 },
    { name:'Chocolate Chip Cookies', brand:'Tate\'s Bake Shop', price:5.49, unitSize:'7 oz' },
    { name:'Flour Tortillas', brand:'Mission', price:3.49, unitSize:'10 ct' }
  ];
  bakery.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_bakery', subcategoryId:'subcat_bread', name:item.name, brand:item.brand, description:`Delicious ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🍞', price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,40,160), nutrition:{servingSize:'1 slice (50g)',calories:140,totalFat:'1g',sodium:'250mg',totalCarbs:'27g',fiber:'1g',sugars:'2g',protein:'5g'}, ingredients:'Wheat flour, water, salt, yeast', allergens:['wheat'], tags:['bakery','bread'] }));

  // Frozen (8)
  const frozen = [
    { name:'DiGiorno Frozen Pizza', brand:'DiGiorno', price:6.99, unitSize:'1 pizza' },
    { name:'Vanilla Ice Cream', brand:'Haagen-Dazs', price:5.99, unitSize:'14 oz', isOnSale:true, originalPrice:7.49 },
    { name:'Frozen Mixed Vegetables', brand:'Birds Eye', price:2.49, unitSize:'16 oz' },
    { name:'Frozen Chicken Nuggets', brand:'Tyson', price:7.99, unitSize:'32 oz' },
    { name:'Frozen Berry Mix', brand:'Wyman\'s', price:5.49, unitSize:'15 oz', isOrganic:true },
    { name:'Frozen Waffles', brand:'Eggo', price:3.99, unitSize:'10 ct' },
    { name:'Frozen Mac & Cheese', brand:'Stouffer\'s', price:3.49, unitSize:'12 oz' },
    { name:'Ice Cream Sandwiches', brand:'Klondike', price:4.99, unitSize:'6 ct' }
  ];
  frozen.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_frozen', subcategoryId:'subcat_frozen_meals', name:item.name, brand:item.brand, description:`${item.name} from ${item.brand}.`, emoji:PRODUCT_EMOJI[item.name]||'❄️', price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,60,200), nutrition:{servingSize:'1 serving',calories:280,totalFat:'12g',sodium:'580mg',totalCarbs:'35g',fiber:'2g',sugars:'5g',protein:'10g'}, ingredients:'Various', allergens:['wheat','milk'], tags:['frozen'] }));

  // Pantry (10)
  const pantry = [
    { name:'Spaghetti Pasta', brand:'Barilla', price:1.99, unitSize:'16 oz' },
    { name:'Marinara Sauce', brand:'Rao\'s', price:8.49, unitSize:'24 oz' },
    { name:'Creamy Peanut Butter', brand:'Jif', price:4.49, unitSize:'16 oz' },
    { name:'Chicken Broth', brand:'Swanson', price:2.99, unitSize:'32 oz' },
    { name:'Canned Diced Tomatoes', brand:'Muir Glen', price:2.49, unitSize:'14.5 oz', isOrganic:true },
    { name:'Extra Virgin Olive Oil', brand:'California Olive Ranch', price:9.99, unitSize:'25.4 oz' },
    { name:'Jasmine Rice', brand:'Mahatma', price:3.99, unitSize:'2 lb' },
    { name:'Black Beans', brand:'Bush\'s', price:1.29, unitSize:'15 oz' },
    { name:'Honey', brand:'Nature Nate\'s', price:8.99, unitSize:'16 oz', isOrganic:true },
    { name:'All-Purpose Flour', brand:'King Arthur', price:4.99, unitSize:'5 lb' }
  ];
  pantry.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_pantry', subcategoryId:'subcat_pasta', name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🥫', price:item.price, originalPrice:null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:false, saleEndDate:null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,80,300), nutrition:{servingSize:'1 serving',calories:200,totalFat:'1g',sodium:'0mg',totalCarbs:'42g',fiber:'2g',sugars:'1g',protein:'7g'}, ingredients:'Various', allergens:item.name.includes('Pasta')?['wheat']:[], tags:['pantry'] }));

  // Snacks (8)
  const snacks = [
    { name:"Lay's Classic Chips", brand:"Lay's", price:4.49, unitSize:'8 oz', isOnSale:true, originalPrice:5.29 },
    { name:'Goldfish Crackers', brand:'Pepperidge Farm', price:3.49, unitSize:'6.6 oz' },
    { name:'Mixed Nuts', brand:'Planters', price:7.99, unitSize:'15 oz' },
    { name:'Oreo Cookies', brand:'Nabisco', price:4.99, unitSize:'14.3 oz' },
    { name:'Microwave Popcorn', brand:'Orville Redenbacher\'s', price:4.49, unitSize:'6 ct' },
    { name:'Granola Bars', brand:'Nature Valley', price:3.99, unitSize:'6 ct' },
    { name:'Pretzels', brand:'Snyder\'s', price:3.49, unitSize:'16 oz' },
    { name:'Dark Chocolate Bar', brand:'Ghirardelli', price:3.99, unitSize:'3.5 oz' }
  ];
  snacks.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_snacks', subcategoryId:'subcat_chips', name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🍿', price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,100,400), nutrition:{servingSize:'1 serving (28g)',calories:150,totalFat:'9g',sodium:'170mg',totalCarbs:'15g',fiber:'1g',sugars:'1g',protein:'2g'}, ingredients:'Various', allergens:[], tags:['snacks'] }));

  // Beverages (8)
  const beverages = [
    { name:'Spring Water 24-Pack', brand:'Crystal Geyser', price:4.99, unitSize:'24 x 16.9 oz' },
    { name:'Coca-Cola 12-Pack', brand:'Coca-Cola', price:6.99, unitSize:'12 x 12 oz', isOnSale:true, originalPrice:8.49 },
    { name:'Orange Juice', brand:'Tropicana', price:4.49, unitSize:'52 oz' },
    { name:'Ground Coffee', brand:'Peet\'s Coffee', price:9.99, unitSize:'12 oz' },
    { name:'Green Tea Bags', brand:'Tazo', price:4.99, unitSize:'20 ct' },
    { name:'Almond Milk', brand:'Califia Farms', price:4.49, unitSize:'48 oz' },
    { name:'LaCroix Sparkling Water', brand:'LaCroix', price:5.49, unitSize:'12 x 12 oz' },
    { name:'Apple Juice', brand:'Martinelli\'s', price:3.99, unitSize:'50.7 oz' }
  ];
  beverages.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_beverages', subcategoryId:'subcat_water', name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🥤', price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,60,250), nutrition:{servingSize:'8 fl oz',calories:0,totalFat:'0g',sodium:'0mg',totalCarbs:'0g',fiber:'0g',sugars:'0g',protein:'0g'}, ingredients:'Water', allergens:[], tags:['beverages'] }));

  // Household (6)
  const household = [
    { name:'Paper Towels', brand:'Bounty', price:11.99, unitSize:'6 rolls' },
    { name:'Dish Soap', brand:'Dawn', price:3.99, unitSize:'16 oz' },
    { name:'Laundry Detergent', brand:'Tide', price:12.49, unitSize:'92 oz' },
    { name:'Trash Bags', brand:'Glad', price:8.99, unitSize:'40 ct' },
    { name:'All-Purpose Cleaner', brand:'Mrs. Meyer\'s', price:4.49, unitSize:'16 oz' },
    { name:'Sponges', brand:'Scotch-Brite', price:3.49, unitSize:'3 ct' }
  ];
  household.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_household', subcategoryId:'subcat_cleaning', name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'🧹', price:item.price, originalPrice:null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, saleEndDate:null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,80,300), nutrition:null, ingredients:null, allergens:[], tags:['household','cleaning'] }));

  // Health (4)
  const health = [
    { name:'Ibuprofen', brand:'Advil', price:9.99, unitSize:'100 ct' },
    { name:'Multivitamin', brand:'Centrum', price:12.99, unitSize:'130 ct' },
    { name:'Hand Soap', brand:'Method', price:3.99, unitSize:'12 oz' },
    { name:'Toothpaste', brand:'Crest', price:4.49, unitSize:'4.1 oz' }
  ];
  health.forEach(item => p.push({ id:mkId(), storeId:'store_1', departmentId:'dept_health', subcategoryId:'subcat_vitamins', name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:PRODUCT_EMOJI[item.name]||'💊', price:item.price, originalPrice:null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, saleEndDate:null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,40,200), nutrition:null, ingredients:null, allergens:[], tags:['health','personal-care'] }));

  // Costco (store_2) products
  const costco = [
    { name:'Kirkland Organic Whole Milk', brand:'Kirkland Signature', price:19.99, unitSize:'3 x 0.5 gal', dept:'dept_s2_bulk', emoji:'🥛', isOrganic:true, tags:['dairy','milk','organic','bulk'] },
    { name:'Kirkland Chicken Breast', brand:'Kirkland Signature', price:24.99, unitSize:'6 lb', dept:'dept_s2_bulk', emoji:'🍗', tags:['meat','chicken','bulk','protein'] },
    { name:'Kirkland Ground Coffee', brand:'Kirkland Signature', price:14.99, unitSize:'2.5 lb', dept:'dept_s2_beverages', emoji:'☕', tags:['beverages','coffee','bulk'] },
    { name:'Kirkland Mixed Nuts', brand:'Kirkland Signature', price:21.99, unitSize:'2.5 lb', dept:'dept_s2_pantry', emoji:'🥜', tags:['snacks','nuts','bulk'] },
    { name:'Kirkland Paper Towels', brand:'Kirkland Signature', price:22.99, unitSize:'12 rolls', dept:'dept_s2_household', emoji:'🧻', tags:['household','paper','bulk'] },
    { name:'Kirkland Frozen Pizza', brand:'Kirkland Signature', price:12.99, unitSize:'4-pack', dept:'dept_s2_frozen', emoji:'🍕', isOnSale:true, originalPrice:16.99, tags:['frozen','pizza','bulk'] },
    { name:'Kirkland Olive Oil', brand:'Kirkland Signature', price:17.99, unitSize:'2 L', dept:'dept_s2_pantry', emoji:'🫒', tags:['pantry','oil','bulk'] },
    { name:'Kirkland Salmon', brand:'Kirkland Signature', price:29.99, unitSize:'3 lb', dept:'dept_s2_bulk', emoji:'🐟', tags:['seafood','fish','bulk'] },
    { name:'Kirkland Laundry Detergent', brand:'Kirkland Signature', price:24.99, unitSize:'194 oz', dept:'dept_s2_household', emoji:'🧺', tags:['household','laundry','bulk'] },
    { name:'Kirkland Apple Juice', brand:'Kirkland Signature', price:11.99, unitSize:'6 x 1 L', dept:'dept_s2_beverages', emoji:'🧃', tags:['beverages','juice','bulk'] }
  ];
  costco.forEach(item => p.push({ id:mkId(), storeId:'store_2', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`Bulk savings on ${item.name.toLowerCase()} from Costco.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,100,500), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // Whole Foods (store_3) products
  const wholefoods = [
    { name:'365 Organic Bananas', brand:'365', price:1.29, unitSize:'1 bunch', dept:'dept_s3_produce', emoji:'🍌', isOrganic:true, tags:['organic','fruit','fresh'] },
    { name:'365 Organic Baby Kale', brand:'365', price:4.99, unitSize:'5 oz', dept:'dept_s3_produce', emoji:'🥬', isOrganic:true, tags:['organic','vegetable','greens'] },
    { name:'365 Organic Whole Milk', brand:'365', price:5.99, unitSize:'1 gal', dept:'dept_s3_dairy', emoji:'🥛', isOrganic:true, tags:['organic','dairy','milk'] },
    { name:'Wild Salmon Fillet', brand:'Fresh', price:15.99, unitSize:'1 lb', dept:'dept_s3_meat', emoji:'🐟', isOnSale:true, originalPrice:18.99, tags:['seafood','fish','protein'] },
    { name:'365 Free Range Eggs', brand:'365', price:6.49, unitSize:'1 dozen', dept:'dept_s3_dairy', emoji:'🥚', isOrganic:true, tags:['organic','eggs','dairy'] },
    { name:'Artisan Sourdough', brand:'Whole Foods Bakery', price:5.99, unitSize:'1 loaf', dept:'dept_s3_bakery', emoji:'🍞', tags:['bakery','bread'] },
    { name:'365 Organic Peanut Butter', brand:'365', price:5.49, unitSize:'16 oz', dept:'dept_s3_pantry', emoji:'🥜', isOrganic:true, tags:['organic','pantry'] },
    { name:'365 Organic Marinara', brand:'365', price:5.99, unitSize:'25 oz', dept:'dept_s3_pantry', emoji:'🥫', isOrganic:true, tags:['organic','pantry'] },
    { name:'365 Organic Avocados', brand:'365', price:2.49, unitSize:'each', dept:'dept_s3_produce', emoji:'🥑', isOrganic:true, tags:['organic','fruit','fresh'] },
    { name:'Pasture-Raised Chicken', brand:'Mary\'s', price:9.99, unitSize:'1 lb', dept:'dept_s3_meat', emoji:'🍗', tags:['meat','chicken','organic'] }
  ];
  wholefoods.forEach(item => p.push({ id:mkId(), storeId:'store_3', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`Organic quality ${item.name.toLowerCase()} from Whole Foods.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,50,300), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // Sprouts (store_4) products
  const sprouts = [
    { name:'Organic Strawberries', brand:'Sprouts', price:4.49, unitSize:'1 lb', dept:'dept_s4_produce', emoji:'🍓', isOrganic:true, tags:['organic','fruit','berries'] },
    { name:'Organic Spinach', brand:'Sprouts', price:3.49, unitSize:'5 oz', dept:'dept_s4_produce', emoji:'🥬', isOrganic:true, tags:['organic','vegetable','greens'] },
    { name:'Organic Whole Milk', brand:'Sprouts', price:5.49, unitSize:'1/2 gal', dept:'dept_s4_dairy', emoji:'🥛', isOrganic:true, tags:['organic','dairy','milk'] },
    { name:'Bulk Almonds', brand:'Sprouts', price:7.99, unitSize:'1 lb', dept:'dept_s4_bulk', emoji:'🥜', tags:['bulk','nuts','snacks'] },
    { name:'Bulk Quinoa', brand:'Sprouts', price:4.99, unitSize:'1 lb', dept:'dept_s4_bulk', emoji:'🌾', tags:['bulk','grain'] },
    { name:'Vitamin C 1000mg', brand:'Solgar', price:14.99, unitSize:'100 ct', dept:'dept_s4_vitamins', emoji:'💊', tags:['vitamins','health'] },
    { name:'Probiotic Supplement', brand:'Garden of Life', price:24.99, unitSize:'30 ct', dept:'dept_s4_vitamins', emoji:'💊', isOnSale:true, originalPrice:29.99, tags:['vitamins','health'] },
    { name:'Organic Yogurt', brand:'Stonyfield', price:5.99, unitSize:'32 oz', dept:'dept_s4_dairy', emoji:'🥛', isOrganic:true, tags:['organic','dairy','yogurt'] }
  ];
  sprouts.forEach(item => p.push({ id:mkId(), storeId:'store_4', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`Healthy ${item.name.toLowerCase()} from Sprouts.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:item.isOrganic||false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,30,200), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // CVS (store_5) products
  const cvs = [
    { name:'CVS Ibuprofen 200mg', brand:'CVS Health', price:7.99, unitSize:'100 ct', dept:'dept_s5_pharmacy', emoji:'💊', tags:['pharmacy','pain-relief'] },
    { name:'Tylenol Extra Strength', brand:'Tylenol', price:9.99, unitSize:'100 ct', dept:'dept_s5_pharmacy', emoji:'💊', tags:['pharmacy','pain-relief'] },
    { name:'Centrum Silver Vitamins', brand:'Centrum', price:14.99, unitSize:'65 ct', dept:'dept_s5_health', emoji:'💊', tags:['vitamins','health'] },
    { name:'Band-Aid Variety Pack', brand:'Band-Aid', price:6.49, unitSize:'80 ct', dept:'dept_s5_health', emoji:'🩹', tags:['first-aid','health'] },
    { name:'Neutrogena Moisturizer', brand:'Neutrogena', price:12.99, unitSize:'2.5 oz', dept:'dept_s5_beauty', emoji:'🧴', tags:['beauty','skin-care'] },
    { name:'Listerine Mouthwash', brand:'Listerine', price:6.99, unitSize:'500 ml', dept:'dept_s5_beauty', emoji:'🪥', tags:['oral-care','beauty'] },
    { name:'CVS Chips & Salsa', brand:'CVS', price:4.99, unitSize:'12 oz', dept:'dept_s5_snacks', emoji:'🍿', tags:['snacks'] },
    { name:'Vitamin Water Zero', brand:'Vitaminwater', price:1.99, unitSize:'20 oz', dept:'dept_s5_snacks', emoji:'💧', tags:['beverages','snacks'] }
  ];
  cvs.forEach(item => p.push({ id:mkId(), storeId:'store_5', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()}.`, emoji:item.emoji, price:item.price, originalPrice:null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:false, saleEndDate:null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,50,300), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // Target (store_6) products
  const target = [
    { name:'Good & Gather Milk', brand:'Good & Gather', price:3.99, unitSize:'1 gal', dept:'dept_s6_grocery', emoji:'🥛', tags:['dairy','milk'] },
    { name:'Good & Gather Eggs', brand:'Good & Gather', price:4.99, unitSize:'1 dozen', dept:'dept_s6_grocery', emoji:'🥚', tags:['dairy','eggs'] },
    { name:'Good & Gather Orange Juice', brand:'Good & Gather', price:3.79, unitSize:'52 oz', dept:'dept_s6_grocery', emoji:'🍊', tags:['beverages','juice'] },
    { name:'Up & Up Paper Towels', brand:'Up & Up', price:8.99, unitSize:'6 rolls', dept:'dept_s6_household', emoji:'🧻', tags:['household','paper'] },
    { name:'Up & Up Dish Soap', brand:'Up & Up', price:2.99, unitSize:'16 oz', dept:'dept_s6_household', emoji:'🧴', tags:['household','cleaning'] },
    { name:'Up & Up Ibuprofen', brand:'Up & Up', price:7.49, unitSize:'100 ct', dept:'dept_s6_health', emoji:'💊', tags:['health','pain-relief'] },
    { name:'Lay\'s Chips', brand:'Lay\'s', price:4.49, unitSize:'8 oz', dept:'dept_s6_snacks', emoji:'🥔', isOnSale:true, originalPrice:5.29, tags:['snacks','chips'] },
    { name:'Good & Gather Pasta', brand:'Good & Gather', price:1.49, unitSize:'16 oz', dept:'dept_s6_grocery', emoji:'🍝', tags:['pantry','pasta'] },
    { name:'Up & Up Multivitamin', brand:'Up & Up', price:9.99, unitSize:'100 ct', dept:'dept_s6_health', emoji:'💊', tags:['health','vitamins'] },
    { name:'Good & Gather Salsa', brand:'Good & Gather', price:3.49, unitSize:'24 oz', dept:'dept_s6_snacks', emoji:'🥫', tags:['snacks','condiments'] }
  ];
  target.forEach(item => p.push({ id:mkId(), storeId:'store_6', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()} from Target.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,80,400), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // Petco (store_7) products
  const petco = [
    { name:'Purina Pro Plan Dog Food', brand:'Purina Pro Plan', price:54.99, unitSize:'18 lb', dept:'dept_s7_dog', emoji:'🐕', tags:['dog','dog-food'] },
    { name:'Blue Buffalo Dog Food', brand:'Blue Buffalo', price:49.99, unitSize:'15 lb', dept:'dept_s7_dog', emoji:'🐕', isOnSale:true, originalPrice:59.99, tags:['dog','dog-food'] },
    { name:'Fancy Feast Cat Food', brand:'Fancy Feast', price:14.99, unitSize:'12 ct', dept:'dept_s7_cat', emoji:'🐈', tags:['cat','cat-food'] },
    { name:'Blue Buffalo Cat Food', brand:'Blue Buffalo', price:24.99, unitSize:'5 lb', dept:'dept_s7_cat', emoji:'🐈', tags:['cat','cat-food'] },
    { name:'Milk-Bone Dog Treats', brand:'Milk-Bone', price:6.99, unitSize:'19 oz', dept:'dept_s7_treats', emoji:'🦴', tags:['dog','treats'] },
    { name:'Temptations Cat Treats', brand:'Temptations', price:4.49, unitSize:'6.3 oz', dept:'dept_s7_treats', emoji:'🐈', tags:['cat','treats'] },
    { name:'Dog Poop Bags', brand:'Earth Rated', price:9.99, unitSize:'120 ct', dept:'dept_s7_supplies', emoji:'🧶', tags:['dog','supplies'] },
    { name:'Cat Litter', brand:'Arm & Hammer', price:14.99, unitSize:'14 lb', dept:'dept_s7_supplies', emoji:'🐈', tags:['cat','supplies'] }
  ];
  petco.forEach(item => p.push({ id:mkId(), storeId:'store_7', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()} for your pet.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,100,600), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  // Total Wine (store_8) products
  const totalwine = [
    { name:'Cabernet Sauvignon', brand:'Josh Cellars', price:12.99, unitSize:'750 ml', dept:'dept_s8_wine', emoji:'🍷', tags:['wine','red-wine'] },
    { name:'Chardonnay', brand:'Kendall-Jackson', price:14.99, unitSize:'750 ml', dept:'dept_s8_wine', emoji:'🥂', isOnSale:true, originalPrice:17.99, tags:['wine','white-wine'] },
    { name:'Pinot Noir', brand:'Meiomi', price:16.99, unitSize:'750 ml', dept:'dept_s8_wine', emoji:'🍷', tags:['wine','red-wine'] },
    { name:'Craft IPA 6-Pack', brand:'Sierra Nevada', price:10.99, unitSize:'6 x 12 oz', dept:'dept_s8_beer', emoji:'🍺', tags:['beer','ipa'] },
    { name:'Modelo Especial 12-Pack', brand:'Modelo', price:15.99, unitSize:'12 x 12 oz', dept:'dept_s8_beer', emoji:'🍺', tags:['beer','lager'] },
    { name:'Tito\'s Vodka', brand:'Tito\'s Handmade', price:24.99, unitSize:'750 ml', dept:'dept_s8_spirits', emoji:'🥃', tags:['spirits','vodka'] },
    { name:'Jameson Irish Whiskey', brand:'Jameson', price:29.99, unitSize:'750 ml', dept:'dept_s8_spirits', emoji:'🥃', isOnSale:true, originalPrice:34.99, tags:['spirits','whiskey'] },
    { name:'Tonic Water', brand:'Fever-Tree', price:6.99, unitSize:'4 x 6.8 oz', dept:'dept_s8_mixers', emoji:'🧃', tags:['mixers','beverages'] },
    { name:'Sparkling Water 8-Pack', brand:'Spindrift', price:8.99, unitSize:'8 x 12 oz', dept:'dept_s8_mixers', emoji:'💧', tags:['mixers','beverages'] }
  ];
  totalwine.forEach(item => p.push({ id:mkId(), storeId:'store_8', departmentId:item.dept, subcategoryId:null, name:item.name, brand:item.brand, description:`${item.brand} ${item.name.toLowerCase()} from Total Wine.`, emoji:item.emoji, price:item.price, originalPrice:item.originalPrice||null, priceUnit:'ct', unitSize:item.unitSize, unitPrice:item.price, unitPriceLabel:'/each', isOrganic:false, isOnSale:!!item.originalPrice, saleEndDate:item.originalPrice?'2025-03-15':null, inStock:true, rating:seededRating(id), reviewCount:seededReviewCount(id,60,400), nutrition:null, ingredients:null, allergens:[], tags:item.tags }));

  return p;
}

function createOrders(products) {
  const getProduct = (id) => products.find(p => p.id === id);
  return [
    { id:'order_1', userId:'user_1', storeId:'store_1', storeName:'Safeway', status:'delivered', items:[
      {productId:'prod_1',productName:'Organic Bananas',quantity:3,price:0.79,wasReplaced:false,replacementProductName:null},
      {productId:'prod_13',productName:'2% Milk',quantity:1,price:4.29,wasReplaced:false,replacementProductName:null},
      {productId:'prod_25',productName:'Chicken Breast',quantity:2,price:6.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_37',productName:'Sourdough Bread',quantity:1,price:4.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_15',productName:'Greek Yogurt',quantity:2,price:1.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_4',productName:'Baby Spinach',quantity:1,price:3.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_9',productName:'Lemons',quantity:4,price:0.69,wasReplaced:false,replacementProductName:null},
      {productId:'prod_49',productName:'Spaghetti Pasta',quantity:1,price:1.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_50',productName:'Marinara Sauce',quantity:1,price:8.49,wasReplaced:false,replacementProductName:null}
    ], subtotal:47.82, serviceFee:2.39, deliveryFee:0, tip:5.00, tax:3.83, total:59.04, itemCount:9, deliveryAddress:'742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110', deliveryDate:'2025-03-07', deliveryWindow:'2:00 PM - 3:00 PM', placedAt:'2025-03-07T13:15:00Z', deliveredAt:'2025-03-07T14:22:00Z', shopperName:'Maria G.', shopperRating:null },
    { id:'order_2', userId:'user_1', storeId:'store_3', storeName:'Whole Foods Market', status:'delivered', items:[
      {productId:'prod_1',productName:'Organic Bananas',quantity:2,price:0.79,wasReplaced:false,replacementProductName:null},
      {productId:'prod_10',productName:'Blueberries',quantity:2,price:4.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_27',productName:'Atlantic Salmon Fillet',quantity:1,price:12.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_54',productName:'Extra Virgin Olive Oil',quantity:1,price:9.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_20',productName:'Half & Half',quantity:1,price:4.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_4',productName:'Baby Spinach',quantity:2,price:3.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_3',productName:'Avocados',quantity:3,price:1.50,wasReplaced:false,replacementProductName:null},
      {productId:'prod_17',productName:'Unsalted Butter',quantity:1,price:5.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_57',productName:'Honey',quantity:1,price:8.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_5',productName:'Romaine Hearts',quantity:1,price:3.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_6',productName:'Russet Potatoes',quantity:1,price:4.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_42',productName:'Frozen Berry Mix',quantity:1,price:5.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_59',productName:'Ground Coffee',quantity:1,price:9.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_22',productName:'Cottage Cheese',quantity:1,price:4.49,wasReplaced:false,replacementProductName:null}
    ], subtotal:72.69, serviceFee:3.63, deliveryFee:0, tip:5.00, tax:5.91, total:87.23, itemCount:14, deliveryAddress:'742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110', deliveryDate:'2025-03-03', deliveryWindow:'10:00 AM - 11:00 AM', placedAt:'2025-03-03T09:00:00Z', deliveredAt:'2025-03-03T10:35:00Z', shopperName:'David L.', shopperRating:5 },
    { id:'order_3', userId:'user_1', storeId:'store_2', storeName:'Costco', status:'delivered', items:[
      {productId:'prod_65',productName:'Paper Towels',quantity:1,price:11.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_67',productName:'Laundry Detergent',quantity:1,price:12.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_61',productName:'Spring Water 24-Pack',quantity:2,price:4.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_62',productName:'Coca-Cola 12-Pack',quantity:1,price:6.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_45',productName:'Frozen Chicken Nuggets',quantity:2,price:7.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_68',productName:'Trash Bags',quantity:1,price:8.99,wasReplaced:false,replacementProductName:null}
    ], subtotal:103.42, serviceFee:5.17, deliveryFee:0, tip:7.00, tax:8.97, total:124.56, itemCount:6, deliveryAddress:'742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110', deliveryDate:'2025-02-25', deliveryWindow:'1:00 PM - 3:00 PM', placedAt:'2025-02-25T11:30:00Z', deliveredAt:'2025-02-25T13:45:00Z', shopperName:'Sarah K.', shopperRating:4 },
    { id:'order_4', userId:'user_1', storeId:'store_1', storeName:'Safeway', status:'delivered', items:[
      {productId:'prod_1',productName:'Organic Bananas',quantity:2,price:0.79,wasReplaced:false,replacementProductName:null},
      {productId:'prod_13',productName:'2% Milk',quantity:1,price:4.29,wasReplaced:false,replacementProductName:null},
      {productId:'prod_14',productName:'Large Eggs',quantity:1,price:5.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_26',productName:'Ground Beef 80/20',quantity:2,price:5.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_37',productName:'Sourdough Bread',quantity:1,price:4.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_7',productName:'Yellow Onions',quantity:2,price:1.29,wasReplaced:false,replacementProductName:null},
      {productId:'prod_8',productName:'Roma Tomatoes',quantity:1,price:1.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_49',productName:'Spaghetti Pasta',quantity:2,price:1.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_50',productName:'Marinara Sauce',quantity:1,price:8.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_66',productName:'Dish Soap',quantity:1,price:3.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_11',productName:'Red Bell Pepper',quantity:2,price:1.49,wasReplaced:false,replacementProductName:null}
    ], subtotal:43.08, serviceFee:2.15, deliveryFee:0, tip:3.00, tax:4.07, total:52.30, itemCount:11, deliveryAddress:'742 Evergreen Terrace, Apt 3B, San Francisco, CA 94110', deliveryDate:'2025-02-18', deliveryWindow:'3:00 PM - 5:00 PM', placedAt:'2025-02-18T14:00:00Z', deliveredAt:'2025-02-18T15:30:00Z', shopperName:'James R.', shopperRating:5 },
    { id:'order_5', userId:'user_1', storeId:'store_6', storeName:'Target', status:'delivered', items:[
      {productId:'prod_69',productName:'All-Purpose Cleaner',quantity:1,price:4.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_70',productName:'Sponges',quantity:2,price:3.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_65',productName:'Paper Towels',quantity:1,price:11.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_72',productName:'Multivitamin',quantity:1,price:12.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_74',productName:'Toothpaste',quantity:2,price:4.49,wasReplaced:false,replacementProductName:null},
      {productId:'prod_73',productName:'Hand Soap',quantity:1,price:3.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_71',productName:'Ibuprofen',quantity:1,price:9.99,wasReplaced:false,replacementProductName:null},
      {productId:'prod_68',productName:'Trash Bags',quantity:1,price:8.99,wasReplaced:false,replacementProductName:null}
    ], subtotal:35.42, serviceFee:1.77, deliveryFee:0, tip:2.00, tax:3.98, total:43.17, itemCount:8, deliveryAddress:'200 Market Street, Suite 400, San Francisco, CA 94105', deliveryDate:'2025-02-10', deliveryWindow:'11:00 AM - 1:00 PM', placedAt:'2025-02-10T10:00:00Z', deliveredAt:'2025-02-10T11:45:00Z', shopperName:'Emily T.', shopperRating:null }
  ];
}

function createShoppingLists() {
  return [
    { id:'list_1', userId:'user_1', name:'Weekly Essentials', items:[
      {id:'li_1',productId:'prod_1',name:'Organic Bananas',checked:false,quantity:3,addedAt:'2025-03-01T10:00:00Z'},
      {id:'li_2',productId:'prod_13',name:'2% Milk',checked:false,quantity:1,addedAt:'2025-03-01T10:01:00Z'},
      {id:'li_3',productId:'prod_14',name:'Large Eggs',checked:true,quantity:1,addedAt:'2025-03-01T10:02:00Z'},
      {id:'li_4',productId:'prod_37',name:'Sourdough Bread',checked:false,quantity:1,addedAt:'2025-03-01T10:03:00Z'},
      {id:'li_5',productId:'prod_25',name:'Chicken Breast',checked:false,quantity:2,addedAt:'2025-03-01T10:04:00Z'},
      {id:'li_6',productId:null,name:'Bread (any brand)',checked:true,quantity:1,addedAt:'2025-03-01T10:05:00Z'},
      {id:'li_7',productId:'prod_15',name:'Greek Yogurt',checked:false,quantity:2,addedAt:'2025-03-01T10:06:00Z'},
      {id:'li_8',productId:'prod_4',name:'Baby Spinach',checked:false,quantity:1,addedAt:'2025-03-01T10:07:00Z'}
    ], createdAt:'2025-02-01T10:00:00Z', updatedAt:'2025-03-05T16:30:00Z' },
    { id:'list_2', userId:'user_1', name:'Party Supplies', items:[
      {id:'li_9',productId:'prod_57',name:"Lay's Classic Chips",checked:false,quantity:3,addedAt:'2025-03-05T12:00:00Z'},
      {id:'li_10',productId:'prod_62',name:'Coca-Cola 12-Pack',checked:false,quantity:2,addedAt:'2025-03-05T12:01:00Z'},
      {id:'li_11',productId:'prod_61',name:'Spring Water 24-Pack',checked:false,quantity:1,addedAt:'2025-03-05T12:02:00Z'},
      {id:'li_12',productId:'prod_60',name:'Oreo Cookies',checked:false,quantity:2,addedAt:'2025-03-05T12:03:00Z'},
      {id:'li_13',productId:'prod_44',name:'Vanilla Ice Cream',checked:false,quantity:2,addedAt:'2025-03-05T12:04:00Z'},
      {id:'li_14',productId:'prod_3',name:'Avocados',checked:false,quantity:6,addedAt:'2025-03-05T12:05:00Z'},
      {id:'li_15',productId:'prod_8',name:'Roma Tomatoes',checked:false,quantity:4,addedAt:'2025-03-05T12:06:00Z'},
      {id:'li_16',productId:'prod_7',name:'Yellow Onions',checked:false,quantity:2,addedAt:'2025-03-05T12:07:00Z'},
      {id:'li_17',productId:'prod_9',name:'Lemons',checked:false,quantity:6,addedAt:'2025-03-05T12:08:00Z'},
      {id:'li_18',productId:null,name:'Salsa',checked:false,quantity:2,addedAt:'2025-03-05T12:09:00Z'},
      {id:'li_19',productId:null,name:'Paper plates',checked:false,quantity:1,addedAt:'2025-03-05T12:10:00Z'},
      {id:'li_20',productId:null,name:'Napkins',checked:false,quantity:1,addedAt:'2025-03-05T12:11:00Z'}
    ], createdAt:'2025-03-05T12:00:00Z', updatedAt:'2025-03-05T12:11:00Z' },
    { id:'list_3', userId:'user_1', name:'Healthy Eating', items:[
      {id:'li_21',productId:'prod_4',name:'Baby Spinach',checked:true,quantity:2,addedAt:'2025-03-02T09:00:00Z'},
      {id:'li_22',productId:'prod_10',name:'Blueberries',checked:false,quantity:1,addedAt:'2025-03-02T09:01:00Z'},
      {id:'li_23',productId:'prod_27',name:'Atlantic Salmon Fillet',checked:false,quantity:1,addedAt:'2025-03-02T09:02:00Z'},
      {id:'li_24',productId:'prod_15',name:'Greek Yogurt',checked:true,quantity:3,addedAt:'2025-03-02T09:03:00Z'},
      {id:'li_25',productId:'prod_3',name:'Avocados',checked:false,quantity:3,addedAt:'2025-03-02T09:04:00Z'},
      {id:'li_26',productId:'prod_12',name:'Broccoli Crowns',checked:false,quantity:2,addedAt:'2025-03-02T09:05:00Z'}
    ], createdAt:'2025-03-02T09:00:00Z', updatedAt:'2025-03-06T14:00:00Z' }
  ];
}

function createRecipes() {
  return [
    { id:'recipe_1', title:'Classic Spaghetti Bolognese', description:'A hearty Italian pasta dish with a rich meat sauce.', prepTime:'15 min', cookTime:'30 min', totalTime:'45 min', servings:4, difficulty:'Easy', tags:['dinner','italian','pasta'], ingredients:[{name:'Spaghetti Pasta',quantity:'1 lb',productId:'prod_49'},{name:'Ground Beef 80/20',quantity:'1 lb',productId:'prod_26'},{name:'Marinara Sauce',quantity:'24 oz jar',productId:'prod_50'},{name:'Yellow Onion',quantity:'1',productId:'prod_7'},{name:'Garlic',quantity:'3 cloves',productId:null},{name:'Parmesan Cheese',quantity:'1/2 cup grated',productId:null}], instructions:['Boil water and cook spaghetti according to package directions.','Brown ground beef in a large skillet over medium-high heat.','Add diced onion and garlic, cook until softened.','Stir in marinara sauce and simmer for 15 minutes.','Serve sauce over spaghetti and top with parmesan.'], emoji:'🍝' },
    { id:'recipe_2', title:'Chicken Stir-Fry', description:'Quick and healthy chicken stir-fry with fresh vegetables.', prepTime:'10 min', cookTime:'15 min', totalTime:'25 min', servings:4, difficulty:'Easy', tags:['dinner','asian','quick'], ingredients:[{name:'Chicken Breast',quantity:'1 lb',productId:'prod_25'},{name:'Broccoli Crowns',quantity:'2 cups',productId:'prod_12'},{name:'Red Bell Pepper',quantity:'1',productId:'prod_11'},{name:'Soy Sauce',quantity:'3 tbsp',productId:null},{name:'Jasmine Rice',quantity:'2 cups cooked',productId:'prod_55'},{name:'Olive Oil',quantity:'2 tbsp',productId:'prod_54'}], instructions:['Cut chicken into bite-sized pieces and season.','Cook rice according to package directions.','Heat oil in a wok over high heat, stir-fry chicken until golden.','Add vegetables and stir-fry 3-4 minutes.','Add soy sauce and toss to combine. Serve over rice.'], emoji:'🥘' },
    { id:'recipe_3', title:'Greek Salad', description:'Fresh and vibrant Mediterranean salad.', prepTime:'15 min', cookTime:'0 min', totalTime:'15 min', servings:2, difficulty:'Easy', tags:['lunch','salad','healthy'], ingredients:[{name:'Romaine Hearts',quantity:'1',productId:'prod_5'},{name:'Roma Tomatoes',quantity:'2',productId:'prod_8'},{name:'Avocados',quantity:'1',productId:'prod_3'},{name:'Red Bell Pepper',quantity:'1/2',productId:'prod_11'},{name:'Feta Cheese',quantity:'1/2 cup',productId:null},{name:'Olive Oil',quantity:'2 tbsp',productId:'prod_54'},{name:'Lemon',quantity:'1',productId:'prod_9'}], instructions:['Chop romaine, tomatoes, and bell pepper.','Slice avocado.','Crumble feta cheese over vegetables.','Drizzle with olive oil and lemon juice.','Toss gently and serve.'], emoji:'🥗' },
    { id:'recipe_4', title:'Breakfast Scramble', description:'Hearty morning scramble with eggs and vegetables.', prepTime:'5 min', cookTime:'10 min', totalTime:'15 min', servings:2, difficulty:'Easy', tags:['breakfast','eggs','quick'], ingredients:[{name:'Large Eggs',quantity:'4',productId:'prod_14'},{name:'Unsalted Butter',quantity:'1 tbsp',productId:'prod_17'},{name:'Baby Spinach',quantity:'1 cup',productId:'prod_4'},{name:'Cheddar Cheese',quantity:'1/4 cup shredded',productId:'prod_16'},{name:'Roma Tomato',quantity:'1 diced',productId:'prod_8'}], instructions:['Whisk eggs in a bowl with salt and pepper.','Melt butter in a non-stick pan over medium heat.','Add spinach and tomato, cook 2 minutes.','Pour in eggs and gently scramble.','Top with cheese and serve.'], emoji:'🍳' },
    { id:'recipe_5', title:'Grilled Salmon with Vegetables', description:'Perfectly grilled salmon with roasted seasonal vegetables.', prepTime:'10 min', cookTime:'20 min', totalTime:'30 min', servings:2, difficulty:'Medium', tags:['dinner','seafood','healthy'], ingredients:[{name:'Atlantic Salmon Fillet',quantity:'2 fillets',productId:'prod_27'},{name:'Broccoli Crowns',quantity:'2 cups',productId:'prod_12'},{name:'Lemon',quantity:'1',productId:'prod_9'},{name:'Olive Oil',quantity:'2 tbsp',productId:'prod_54'},{name:'Russet Potatoes',quantity:'2',productId:'prod_6'}], instructions:['Preheat oven to 425F.','Season salmon with olive oil, lemon, salt, and pepper.','Cut potatoes and broccoli into pieces, toss with oil.','Roast vegetables for 15 minutes, then add salmon.','Cook 12-15 more minutes until salmon flakes easily.'], emoji:'🐟' },
    { id:'recipe_6', title:'Chocolate Chip Pancakes', description:'Fluffy pancakes loaded with chocolate chips for a sweet breakfast.', prepTime:'5 min', cookTime:'15 min', totalTime:'20 min', servings:4, difficulty:'Easy', tags:['breakfast','sweet','family'], ingredients:[{name:'All-Purpose Flour',quantity:'1.5 cups',productId:'prod_58'},{name:'Large Eggs',quantity:'2',productId:'prod_14'},{name:'2% Milk',quantity:'1 cup',productId:'prod_13'},{name:'Unsalted Butter',quantity:'2 tbsp melted',productId:'prod_17'},{name:'Chocolate Chips',quantity:'1/2 cup',productId:null},{name:'Honey',quantity:'for serving',productId:'prod_57'}], instructions:['Mix flour, baking powder, and salt in a bowl.','Whisk eggs, milk, and melted butter together.','Combine wet and dry ingredients.','Fold in chocolate chips.','Cook pancakes on a greased griddle until golden on both sides.'], emoji:'🥞' }
  ];
}

function createDeals() {
  return [
    { id:'deal_1', storeId:'store_1', type:'percent_off', title:'20% Off Organic Produce', description:'Save on all organic fruits and vegetables this week.', discountValue:20, badge:'20% OFF', minPurchase:0, applicableDepartmentId:'dept_produce', startDate:'2025-03-03', endDate:'2025-03-10', isClipped:false },
    { id:'deal_2', storeId:'store_1', type:'bogo', title:'Buy 1 Get 1 Free Ice Cream', description:'Stock up on your favorite ice cream flavors.', discountValue:0, badge:'BOGO', minPurchase:0, applicableDepartmentId:'dept_frozen', startDate:'2025-03-03', endDate:'2025-03-10', isClipped:false },
    { id:'deal_3', storeId:'store_3', type:'dollar_off', title:'$3 Off on Orders $35+', description:'Save $3 on your next Whole Foods order of $35 or more.', discountValue:3, badge:'$3 OFF', minPurchase:35, applicableDepartmentId:null, startDate:'2025-03-01', endDate:'2025-03-15', isClipped:false },
    { id:'deal_4', storeId:null, type:'dollar_off', title:'$5 Off First Order', description:'New to Xnstacart? Get $5 off your first order.', discountValue:5, badge:'$5 OFF', minPurchase:0, applicableDepartmentId:null, startDate:'2025-03-01', endDate:'2025-03-31', isClipped:false },
    { id:'deal_5', storeId:null, type:'free_delivery', title:'Free Delivery Weekend', description:'Free delivery on all orders this weekend.', discountValue:0, badge:'FREE DELIVERY', minPurchase:0, applicableDepartmentId:null, startDate:'2025-03-08', endDate:'2025-03-09', isClipped:false },
    { id:'deal_6', storeId:'store_1', type:'percent_off', title:'15% Off Breakfast Items', description:'Start your morning right with savings on breakfast.', discountValue:15, badge:'15% OFF', minPurchase:0, applicableDepartmentId:'dept_breakfast', startDate:'2025-03-03', endDate:'2025-03-10', isClipped:false },
    { id:'deal_7', storeId:'store_6', type:'bogo', title:'BOGO Chips & Snacks', description:'Buy one get one free on select chips and snacks at Target.', discountValue:0, badge:'BOGO', minPurchase:0, applicableDepartmentId:'dept_snacks', startDate:'2025-03-03', endDate:'2025-03-10', isClipped:false },
    { id:'deal_8', storeId:'store_2', type:'percent_off', title:'10% Off Household Essentials', description:'Save on cleaning and household items at Costco.', discountValue:10, badge:'10% OFF', minPurchase:0, applicableDepartmentId:'dept_household', startDate:'2025-03-03', endDate:'2025-03-10', isClipped:false }
  ];
}

function createDeliverySlots() {
  const slots = [];
  const today = new Date();
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  for (let d = 0; d < 5; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dayLabel = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : dayNames[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    const windows = [
      {id:`win_${d}_1`,start:'9:00 AM',end:'11:00 AM',available:d>0,priority:false,fee:0},
      {id:`win_${d}_2`,start:'11:00 AM',end:'1:00 PM',available:true,priority:false,fee:0},
      {id:`win_${d}_3`,start:'1:00 PM',end:'3:00 PM',available:true,priority:true,fee:2.00},
      {id:`win_${d}_4`,start:'3:00 PM',end:'5:00 PM',available:true,priority:false,fee:0},
      {id:`win_${d}_5`,start:'5:00 PM',end:'7:00 PM',available:true,priority:false,fee:0},
      {id:`win_${d}_6`,start:'7:00 PM',end:'9:00 PM',available:d<3,priority:false,fee:0}
    ];
    slots.push({ id:`slot_${d}`, date:dateStr, dayLabel, windows });
  }
  return slots;
}
