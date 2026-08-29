const BASE_STORAGE_KEY = 'uber_eats_state';
const BASE_INITIAL_KEY = 'uber_eats_initialState';

export function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}

export function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('uber_eats_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('uber_eats_sid') || null;
}

export async function fetchCustomState(sid = null) {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) {
    // No custom state available; use defaults
  }
  return null;
}

let _syncTimer = null;

function stateUrl(sid) {
  return sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
}

function postState(action, state, sid = null) {
  return fetch(stateUrl(sid), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, state }),
  }).catch(() => {});
}

function syncInitialState(state, sid = null) {
  postState('set', state, sid);
}

export function saveState(state, sid = null) {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    postState('set_current', state, sid);
  }, 300);
}

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function initializeData(sid = null, customState = null) {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const defaults = createInitialData();
    const merged = deepMerge(defaults, customState);
    localStorage.setItem(sk, JSON.stringify(merged));
    localStorage.setItem(ik, JSON.stringify(merged));
    syncInitialState(merged, sid);
    return merged;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
      syncInitialState(JSON.parse(stored), sid);
    }
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  syncInitialState(data, sid);
  return data;
}

export function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ============ SEED DATA ============

export function createInitialData() {
  const now = new Date();
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
  const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

  return {
    user: {
      id: 'user_1',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '(415) 555-0123',
      avatarUrl: '',
      addresses: [
        {
          id: 'addr_1',
          label: 'Home',
          street: '123 Main St',
          apt: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          instructions: 'Ring bell, 2nd floor',
          isDefault: true
        },
        {
          id: 'addr_2',
          label: 'Work',
          street: '456 Market St',
          apt: 'Suite 800',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          instructions: 'Leave at front desk',
          isDefault: false
        }
      ],
      defaultAddressId: 'addr_1',
      paymentMethods: [
        { id: 'pay_1', type: 'visa', label: 'Visa \u2022\u2022\u2022\u2022 4242', last4: '4242', isDefault: true },
        { id: 'pay_2', type: 'paypal', label: 'PayPal', last4: '', isDefault: false }
      ],
      defaultPaymentId: 'pay_1',
      uberOneActive: false,
      favoriteRestaurantIds: ['rest_1', 'rest_6']
    },

    categories: [
      { id: 'cat_1', name: 'Pizza', icon: '\uD83C\uDF55' },
      { id: 'cat_2', name: 'Burgers', icon: '\uD83C\uDF54' },
      { id: 'cat_3', name: 'Sushi', icon: '\uD83C\uDF63' },
      { id: 'cat_4', name: 'Chinese', icon: '\uD83E\uDD61' },
      { id: 'cat_5', name: 'Mexican', icon: '\uD83C\uDF2E' },
      { id: 'cat_6', name: 'Indian', icon: '\uD83C\uDF5B' },
      { id: 'cat_7', name: 'Thai', icon: '\uD83C\uDF5C' },
      { id: 'cat_8', name: 'Italian', icon: '\uD83C\uDF5D' },
      { id: 'cat_9', name: 'Healthy', icon: '\uD83E\uDD57' },
      { id: 'cat_10', name: 'Dessert', icon: '\uD83C\uDF70' },
      { id: 'cat_11', name: 'Coffee', icon: '\u2615' },
      { id: 'cat_12', name: 'Breakfast', icon: '\uD83E\uDD5E' },
      { id: 'cat_13', name: 'Sandwich', icon: '\uD83E\uDD6A' },
      { id: 'cat_14', name: 'Korean', icon: '\uD83C\uDF71' },
      { id: 'cat_15', name: 'Mediterranean', icon: '\uD83E\uDD59' }
    ],

    restaurants: [
      {
        id: 'rest_1', name: 'Bella Italia', imageUrl: '', cuisineType: ['Italian', 'Pizza', 'Pasta'],
        rating: 4.6, reviewCount: 234, priceRange: '$$', deliveryFee: 2.49,
        deliveryTimeMin: 25, deliveryTimeMax: 40, distance: 1.2, isOpen: true,
        hours: '10:00 AM - 11:00 PM', address: '789 Columbus Ave, San Francisco, CA',
        phone: '(415) 555-0456', isSponsored: false, promotions: [{ id: 'promo_rest1', type: 'spend_save', title: 'Spend $30, Save $5', description: '$5 off orders over $30', code: null, minOrder: 30, discountAmount: 5, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_1' }],
        categories: ['Featured Items', 'Appetizers', 'Pasta', 'Pizza', 'Desserts'],
        tags: ['Popular', 'Top Rated'], supportsPickup: true, pickupTimeMin: 15, pickupTimeMax: 25
      },
      {
        id: 'rest_2', name: 'Tokyo Express', imageUrl: '', cuisineType: ['Japanese', 'Sushi', 'Ramen'],
        rating: 4.8, reviewCount: 512, priceRange: '$$', deliveryFee: 3.99,
        deliveryTimeMin: 30, deliveryTimeMax: 45, distance: 2.1, isOpen: true,
        hours: '11:00 AM - 10:00 PM', address: '321 Geary St, San Francisco, CA',
        phone: '(415) 555-0789', isSponsored: false, promotions: [],
        categories: ['Popular Rolls', 'Sashimi', 'Ramen', 'Appetizers', 'Drinks'],
        tags: ['Top Rated'], supportsPickup: true, pickupTimeMin: 20, pickupTimeMax: 30
      },
      {
        id: 'rest_3', name: 'Burger Barn', imageUrl: '', cuisineType: ['American', 'Burgers', 'Fast Food'],
        rating: 4.3, reviewCount: 876, priceRange: '$', deliveryFee: 0.99,
        deliveryTimeMin: 15, deliveryTimeMax: 25, distance: 0.8, isOpen: true,
        hours: '10:00 AM - 12:00 AM', address: '555 Mission St, San Francisco, CA',
        phone: '(415) 555-1234', isSponsored: true, promotions: [{ id: 'promo_rest3', type: 'spend_save', title: '$0 Delivery Fee', description: 'Free delivery on orders $15+', code: null, minOrder: 15, discountAmount: 0, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_3' }],
        categories: ['Burgers', 'Chicken', 'Sides', 'Drinks', 'Desserts'],
        tags: ['Popular', 'Quick Delivery'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 15
      },
      {
        id: 'rest_4', name: 'Taco Fiesta', imageUrl: '', cuisineType: ['Mexican', 'Tacos', 'Burritos'],
        rating: 4.5, reviewCount: 345, priceRange: '$', deliveryFee: 1.49,
        deliveryTimeMin: 20, deliveryTimeMax: 30, distance: 1.5, isOpen: true,
        hours: '9:00 AM - 11:00 PM', address: '420 Valencia St, San Francisco, CA',
        phone: '(415) 555-5678', isSponsored: false, promotions: [],
        categories: ['Tacos', 'Burritos', 'Quesadillas', 'Sides & Drinks'],
        tags: ['Popular'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 20
      },
      {
        id: 'rest_5', name: 'Golden Dragon', imageUrl: '', cuisineType: ['Chinese', 'Asian', 'Dim Sum'],
        rating: 4.4, reviewCount: 198, priceRange: '$$', deliveryFee: 2.99,
        deliveryTimeMin: 25, deliveryTimeMax: 40, distance: 1.8, isOpen: true,
        hours: '11:00 AM - 10:30 PM', address: '888 Grant Ave, San Francisco, CA',
        phone: '(415) 555-8888', isSponsored: false, promotions: [],
        categories: ['Dim Sum', 'Noodles', 'Entrees', 'Rice Dishes'],
        tags: [], supportsPickup: true, pickupTimeMin: 15, pickupTimeMax: 25
      },
      {
        id: 'rest_6', name: 'Spice Route', imageUrl: '', cuisineType: ['Indian', 'Curry', 'Tandoori'],
        rating: 4.7, reviewCount: 421, priceRange: '$$', deliveryFee: 3.49,
        deliveryTimeMin: 30, deliveryTimeMax: 45, distance: 2.5, isOpen: true,
        hours: '11:30 AM - 10:00 PM', address: '1200 Polk St, San Francisco, CA',
        phone: '(415) 555-9999', isSponsored: false, promotions: [],
        categories: ['Appetizers', 'Curries', 'Tandoori', 'Biryani', 'Breads'],
        tags: ['Top Rated'], supportsPickup: true, pickupTimeMin: 20, pickupTimeMax: 30
      },
      {
        id: 'rest_7', name: 'The Green Bowl', imageUrl: '', cuisineType: ['Healthy', 'Salads', 'Bowls'],
        rating: 4.6, reviewCount: 287, priceRange: '$$', deliveryFee: 2.99,
        deliveryTimeMin: 20, deliveryTimeMax: 30, distance: 1.1, isOpen: true,
        hours: '7:00 AM - 9:00 PM', address: '99 Hayes St, San Francisco, CA',
        phone: '(415) 555-7777', isSponsored: false, promotions: [],
        categories: ['Bowls', 'Salads', 'Smoothies', 'Wraps'],
        tags: ['Healthy', 'Vegetarian-friendly'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 20
      },
      {
        id: 'rest_8', name: 'Sweet Treats Bakery', imageUrl: '', cuisineType: ['Dessert', 'Bakery', 'Coffee'],
        rating: 4.9, reviewCount: 654, priceRange: '$', deliveryFee: 1.99,
        deliveryTimeMin: 15, deliveryTimeMax: 25, distance: 0.6, isOpen: true,
        hours: '6:00 AM - 8:00 PM', address: '45 Fillmore St, San Francisco, CA',
        phone: '(415) 555-3333', isSponsored: true, promotions: [],
        categories: ['Cakes & Pies', 'Pastries', 'Cookies', 'Beverages'],
        tags: ['Popular', 'Quick Delivery'], supportsPickup: true, pickupTimeMin: 5, pickupTimeMax: 15
      },
      {
        id: 'rest_9', name: 'Pho King Good', imageUrl: '', cuisineType: ['Vietnamese', 'Pho', 'Banh Mi'],
        rating: 4.5, reviewCount: 321, priceRange: '$', deliveryFee: 2.49,
        deliveryTimeMin: 20, deliveryTimeMax: 35, distance: 1.4, isOpen: true,
        hours: '10:00 AM - 9:30 PM', address: '600 Larkin St, San Francisco, CA',
        phone: '(415) 555-6666', isSponsored: false, promotions: [],
        categories: ['Pho', 'Banh Mi', 'Rice Plates', 'Appetizers'],
        tags: [], supportsPickup: true, pickupTimeMin: 15, pickupTimeMax: 20
      },
      {
        id: 'rest_10', name: 'Mediterranean Grill', imageUrl: '', cuisineType: ['Mediterranean', 'Kebabs', 'Falafel'],
        rating: 4.4, reviewCount: 156, priceRange: '$$', deliveryFee: 0,
        deliveryTimeMin: 25, deliveryTimeMax: 40, distance: 2.0, isOpen: true,
        hours: '11:00 AM - 10:00 PM', address: '750 Divisadero St, San Francisco, CA',
        phone: '(415) 555-4444', isSponsored: false,
        promotions: [{ id: 'promo_rest10', type: 'free_delivery', title: '$0 Delivery Fee', description: 'Free delivery on all orders', code: null, minOrder: 0, discountAmount: 0, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_10' }],
        categories: ['Kebabs', 'Platters', 'Wraps', 'Sides & Dips'],
        tags: ['Free Delivery'], supportsPickup: true, pickupTimeMin: 15, pickupTimeMax: 25
      },
      {
        id: 'rest_11', name: 'Seoul Kitchen', imageUrl: '', cuisineType: ['Korean', 'BBQ', 'Asian'],
        rating: 4.7, reviewCount: 389, priceRange: '$$', deliveryFee: 2.49,
        deliveryTimeMin: 25, deliveryTimeMax: 40, distance: 1.9, isOpen: true,
        hours: '11:00 AM - 10:30 PM', address: '550 Clement St, San Francisco, CA',
        phone: '(415) 555-2222', isSponsored: false,
        promotions: [{ id: 'promo_rest11', type: 'percentage', title: '15% off', description: '15% off orders $20+', code: 'KOREAN15', minOrder: 20, discountAmount: 0, discountPercent: 15, expiresAt: '2026-12-31', restaurantId: 'rest_11' }],
        categories: ['BBQ', 'Rice Bowls', 'Appetizers', 'Drinks'],
        tags: ['Top Rated', 'Deals'], supportsPickup: true, pickupTimeMin: 15, pickupTimeMax: 25
      },
      {
        id: 'rest_12', name: 'Bangkok Street', imageUrl: '', cuisineType: ['Thai', 'Noodles', 'Curry'],
        rating: 4.5, reviewCount: 267, priceRange: '$', deliveryFee: 1.99,
        deliveryTimeMin: 20, deliveryTimeMax: 35, distance: 1.3, isOpen: true,
        hours: '11:00 AM - 10:00 PM', address: '777 Geary Blvd, San Francisco, CA',
        phone: '(415) 555-1111', isSponsored: false, promotions: [],
        categories: ['Curries', 'Noodles', 'Stir Fry', 'Appetizers'],
        tags: ['New'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 20
      },
      {
        id: 'rest_13', name: 'Pizza Planet', imageUrl: '', cuisineType: ['Pizza', 'Italian', 'Wings'],
        rating: 4.2, reviewCount: 543, priceRange: '$', deliveryFee: 0,
        deliveryTimeMin: 20, deliveryTimeMax: 30, distance: 0.9, isOpen: true,
        hours: '10:00 AM - 12:00 AM', address: '200 Castro St, San Francisco, CA',
        phone: '(415) 555-3344', isSponsored: true,
        promotions: [{ id: 'promo_rest13', type: 'free_delivery', title: '$0 Delivery Fee', description: 'Free delivery on all orders', code: null, minOrder: 0, discountAmount: 0, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_13' }],
        categories: ['Specialty Pizzas', 'Wings', 'Sides', 'Drinks'],
        tags: ['Popular', 'Free Delivery', 'Quick Delivery'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 15
      },
      {
        id: 'rest_14', name: 'Sunrise Breakfast', imageUrl: '', cuisineType: ['Breakfast', 'Brunch', 'Coffee'],
        rating: 4.6, reviewCount: 198, priceRange: '$', deliveryFee: 1.49,
        deliveryTimeMin: 15, deliveryTimeMax: 25, distance: 0.7, isOpen: true,
        hours: '6:00 AM - 3:00 PM', address: '340 Divisadero St, San Francisco, CA',
        phone: '(415) 555-5566', isSponsored: false, promotions: [],
        categories: ['Breakfast Plates', 'Pancakes & Waffles', 'Beverages', 'Healthy'],
        tags: ['New', 'Quick Delivery'], supportsPickup: true, pickupTimeMin: 10, pickupTimeMax: 15
      },
      {
        id: 'rest_15', name: 'Flame Grill House', imageUrl: '', cuisineType: ['Steakhouse', 'American', 'BBQ'],
        rating: 4.4, reviewCount: 312, priceRange: '$$$', deliveryFee: 4.99,
        deliveryTimeMin: 35, deliveryTimeMax: 50, distance: 2.8, isOpen: true,
        hours: '4:00 PM - 11:00 PM', address: '900 Van Ness Ave, San Francisco, CA',
        phone: '(415) 555-7788', isSponsored: false,
        promotions: [{ id: 'promo_rest15', type: 'percentage', title: '20% off', description: '20% off first order', code: 'GRILL20', minOrder: 30, discountAmount: 0, discountPercent: 20, expiresAt: '2026-12-31', restaurantId: 'rest_15' }],
        categories: ['Steaks', 'Ribs & BBQ', 'Sides', 'Drinks'],
        tags: ['Deals'], supportsPickup: true, pickupTimeMin: 20, pickupTimeMax: 35
      },
      {
        id: 'rest_16', name: 'Panda Garden', imageUrl: '', cuisineType: ['Chinese', 'Dim Sum', 'Noodles'],
        rating: 4.3, reviewCount: 445, priceRange: '$', deliveryFee: 0.99,
        deliveryTimeMin: 15, deliveryTimeMax: 25, distance: 1.0, isOpen: true,
        hours: '10:30 AM - 10:00 PM', address: '1100 Stockton St, San Francisco, CA',
        phone: '(415) 555-9900', isSponsored: false, promotions: [],
        categories: ['Combo Meals', 'Noodles', 'Fried Rice', 'Dim Sum'],
        tags: ['Popular', 'Quick Delivery'], supportsPickup: true, pickupTimeMin: 8, pickupTimeMax: 15
      }
    ],

    menuItems: [
      // === Bella Italia (rest_1) ===
      { id: 'item_1', restaurantId: 'rest_1', category: 'Featured Items', name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, basil on hand-tossed dough', price: 14.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_1', name: 'Choose your size', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_1', name: 'Small (10")', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_2', name: 'Medium (12")', priceModifier: 2.00, isDefault: false, isAvailable: true },
            { id: 'co_3', name: 'Large (14")', priceModifier: 4.00, isDefault: false, isAvailable: true }
          ]},
          { id: 'cg_2', name: 'Extra toppings', required: false, maxSelections: 4, minSelections: 0, options: [
            { id: 'co_4', name: 'Extra Cheese', priceModifier: 1.50, isDefault: false, isAvailable: true },
            { id: 'co_5', name: 'Mushrooms', priceModifier: 1.00, isDefault: false, isAvailable: true },
            { id: 'co_6', name: 'Olives', priceModifier: 1.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_2', restaurantId: 'rest_1', category: 'Pasta', name: 'Spaghetti Carbonara', description: 'Classic Roman pasta with egg, pecorino cheese, pancetta, and black pepper', price: 16.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_3', name: 'Pasta type', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_7', name: 'Spaghetti', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_8', name: 'Penne', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_9', name: 'Fettuccine', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_3', restaurantId: 'rest_1', category: 'Appetizers', name: 'Bruschetta', description: 'Toasted bread topped with diced tomatoes, garlic, fresh basil, and olive oil', price: 9.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_4', restaurantId: 'rest_1', category: 'Pizza', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni, mozzarella, and our signature tomato sauce', price: 15.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_4', name: 'Choose your size', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_10', name: 'Small (10")', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_11', name: 'Medium (12")', priceModifier: 2.00, isDefault: false, isAvailable: true },
            { id: 'co_12', name: 'Large (14")', priceModifier: 4.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_5', restaurantId: 'rest_1', category: 'Pasta', name: 'Fettuccine Alfredo', description: 'Creamy parmesan alfredo sauce tossed with fresh fettuccine', price: 15.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_5', name: 'Add protein', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_13', name: 'Grilled Chicken', priceModifier: 3.00, isDefault: false, isAvailable: true },
            { id: 'co_14', name: 'Shrimp', priceModifier: 4.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_6', restaurantId: 'rest_1', category: 'Desserts', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert with mascarpone cream', price: 8.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_7', restaurantId: 'rest_1', category: 'Featured Items', name: 'Caprese Salad', description: 'Fresh mozzarella, ripe tomatoes, basil, drizzled with balsamic glaze', price: 11.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Gluten-Free'],
        customizationGroups: [] },

      // === Tokyo Express (rest_2) ===
      { id: 'item_8', restaurantId: 'rest_2', category: 'Popular Rolls', name: 'Dragon Roll', description: 'Shrimp tempura inside, topped with avocado and eel sauce', price: 16.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_6', name: 'Spice level', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_15', name: 'Mild', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_16', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_17', name: 'Hot', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_9', restaurantId: 'rest_2', category: 'Popular Rolls', name: 'California Roll', description: 'Crab, avocado, and cucumber wrapped in seasoned rice and nori', price: 12.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_10', restaurantId: 'rest_2', category: 'Sashimi', name: 'Salmon Sashimi', description: 'Eight pieces of fresh Atlantic salmon, served with wasabi and pickled ginger', price: 18.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_11', restaurantId: 'rest_2', category: 'Ramen', name: 'Tonkotsu Ramen', description: 'Rich pork bone broth with chashu, soft egg, green onions, and noodles', price: 15.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_7', name: 'Noodle firmness', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_18', name: 'Soft', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_19', name: 'Regular', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_20', name: 'Firm', priceModifier: 0, isDefault: false, isAvailable: true }
          ]},
          { id: 'cg_8', name: 'Extra toppings', required: false, maxSelections: 3, minSelections: 0, options: [
            { id: 'co_21', name: 'Extra Chashu', priceModifier: 3.00, isDefault: false, isAvailable: true },
            { id: 'co_22', name: 'Extra Egg', priceModifier: 1.50, isDefault: false, isAvailable: true },
            { id: 'co_23', name: 'Corn', priceModifier: 1.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_12', restaurantId: 'rest_2', category: 'Appetizers', name: 'Edamame', description: 'Steamed soybeans lightly salted', price: 5.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_13', restaurantId: 'rest_2', category: 'Popular Rolls', name: 'Spicy Tuna Roll', description: 'Fresh tuna mixed with spicy mayo, cucumber, wrapped in rice', price: 14.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_14', restaurantId: 'rest_2', category: 'Drinks', name: 'Matcha Latte', description: 'Premium Japanese matcha with steamed milk', price: 5.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_9', name: 'Milk type', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_24', name: 'Whole Milk', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_25', name: 'Oat Milk', priceModifier: 0.50, isDefault: false, isAvailable: true },
            { id: 'co_26', name: 'Almond Milk', priceModifier: 0.50, isDefault: false, isAvailable: true }
          ]}
        ]},

      // === Burger Barn (rest_3) ===
      { id: 'item_15', restaurantId: 'rest_3', category: 'Burgers', name: 'Classic Cheeseburger', description: 'Angus beef patty with cheddar, lettuce, tomato, pickles, and special sauce', price: 11.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_10', name: 'Patty', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_27', name: 'Single', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_28', name: 'Double', priceModifier: 3.00, isDefault: false, isAvailable: true }
          ]},
          { id: 'cg_11', name: 'Add-ons', required: false, maxSelections: 4, minSelections: 0, options: [
            { id: 'co_29', name: 'Bacon', priceModifier: 2.00, isDefault: false, isAvailable: true },
            { id: 'co_30', name: 'Avocado', priceModifier: 1.50, isDefault: false, isAvailable: true },
            { id: 'co_31', name: 'Fried Egg', priceModifier: 1.50, isDefault: false, isAvailable: true },
            { id: 'co_32', name: 'Jalapenos', priceModifier: 0.50, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_16', restaurantId: 'rest_3', category: 'Burgers', name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon, onion rings, and cheddar cheese', price: 14.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_12', name: 'Patty', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_33', name: 'Single', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_34', name: 'Double', priceModifier: 3.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_17', restaurantId: 'rest_3', category: 'Chicken', name: 'Crispy Chicken Sandwich', description: 'Buttermilk-fried chicken breast with coleslaw and pickles on brioche bun', price: 12.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_18', restaurantId: 'rest_3', category: 'Sides', name: 'Loaded Fries', description: 'Crispy fries topped with cheese sauce, bacon bits, and green onions', price: 7.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_19', restaurantId: 'rest_3', category: 'Sides', name: 'Onion Rings', description: 'Beer-battered onion rings with ranch dipping sauce', price: 6.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_20', restaurantId: 'rest_3', category: 'Drinks', name: 'Chocolate Milkshake', description: 'Thick and creamy chocolate milkshake with whipped cream', price: 6.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_13', name: 'Size', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_35', name: 'Regular', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_36', name: 'Large', priceModifier: 2.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_21', restaurantId: 'rest_3', category: 'Desserts', name: 'Apple Pie', description: 'Warm apple pie with a scoop of vanilla ice cream', price: 5.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },

      // === Taco Fiesta (rest_4) ===
      { id: 'item_22', restaurantId: 'rest_4', category: 'Tacos', name: 'Carne Asada Tacos', description: 'Three grilled steak tacos with onion, cilantro, and salsa verde', price: 12.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_14', name: 'Tortilla', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_37', name: 'Corn', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_38', name: 'Flour', priceModifier: 0, isDefault: false, isAvailable: true }
          ]},
          { id: 'cg_15', name: 'Spice level', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_39', name: 'Mild', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_40', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_41', name: 'Hot', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_42', name: 'Extra Hot', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_23', restaurantId: 'rest_4', category: 'Burritos', name: 'Super Burrito', description: 'Flour tortilla stuffed with rice, beans, meat, cheese, sour cream, guacamole', price: 13.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_16', name: 'Protein', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_43', name: 'Chicken', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_44', name: 'Steak', priceModifier: 2.00, isDefault: false, isAvailable: true },
            { id: 'co_45', name: 'Carnitas', priceModifier: 1.00, isDefault: false, isAvailable: true },
            { id: 'co_46', name: 'Veggie', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_24', restaurantId: 'rest_4', category: 'Quesadillas', name: 'Chicken Quesadilla', description: 'Grilled flour tortilla with chicken, melted cheese, peppers, and onions', price: 10.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_25', restaurantId: 'rest_4', category: 'Tacos', name: 'Fish Tacos', description: 'Beer-battered fish with cabbage slaw, chipotle crema on corn tortillas', price: 13.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_26', restaurantId: 'rest_4', category: 'Sides & Drinks', name: 'Guacamole & Chips', description: 'Freshly made guacamole with house-made tortilla chips', price: 8.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_27', restaurantId: 'rest_4', category: 'Sides & Drinks', name: 'Horchata', description: 'Traditional Mexican rice milk drink with cinnamon', price: 3.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },
      { id: 'item_28', restaurantId: 'rest_4', category: 'Burritos', name: 'Breakfast Burrito', description: 'Scrambled eggs, cheese, potatoes, and your choice of meat', price: 10.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },

      // === Golden Dragon (rest_5) ===
      { id: 'item_29', restaurantId: 'rest_5', category: 'Entrees', name: 'Kung Pao Chicken', description: 'Wok-fired chicken with peanuts, chili peppers, and Sichuan peppercorns', price: 14.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_17', name: 'Spice level', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_47', name: 'Mild', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_48', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_49', name: 'Hot', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_30', restaurantId: 'rest_5', category: 'Dim Sum', name: 'Pork Dumplings', description: 'Steamed pork and vegetable dumplings (8 pieces)', price: 10.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_18', name: 'Style', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_50', name: 'Steamed', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_51', name: 'Pan-fried', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_31', restaurantId: 'rest_5', category: 'Noodles', name: 'Beef Chow Mein', description: 'Stir-fried egg noodles with sliced beef, vegetables, and savory sauce', price: 13.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_32', restaurantId: 'rest_5', category: 'Rice Dishes', name: 'Yang Chow Fried Rice', description: 'Classic fried rice with shrimp, char siu pork, eggs, and green onions', price: 12.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_33', restaurantId: 'rest_5', category: 'Entrees', name: 'Sweet and Sour Pork', description: 'Crispy pork pieces in tangy sweet and sour sauce with pineapple', price: 13.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_34', restaurantId: 'rest_5', category: 'Dim Sum', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili dipping sauce (4 pieces)', price: 7.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },

      // === Spice Route (rest_6) ===
      { id: 'item_35', restaurantId: 'rest_6', category: 'Curries', name: 'Butter Chicken', description: 'Tender chicken in rich, creamy tomato-based sauce with aromatic spices', price: 16.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_19', name: 'Spice level', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_52', name: 'Mild', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_53', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_54', name: 'Hot', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_55', name: 'Extra Hot', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_36', restaurantId: 'rest_6', category: 'Curries', name: 'Palak Paneer', description: 'Fresh spinach and paneer cheese in fragrant curry sauce', price: 14.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian', 'Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_37', restaurantId: 'rest_6', category: 'Tandoori', name: 'Tandoori Chicken', description: 'Bone-in chicken marinated in yogurt and spices, cooked in clay oven', price: 17.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_38', restaurantId: 'rest_6', category: 'Biryani', name: 'Lamb Biryani', description: 'Fragrant basmati rice layered with tender lamb, saffron, and caramelized onions', price: 18.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_39', restaurantId: 'rest_6', category: 'Breads', name: 'Garlic Naan', description: 'Freshly baked naan bread with garlic and butter', price: 3.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_40', restaurantId: 'rest_6', category: 'Appetizers', name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas, served with chutneys', price: 6.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },
      { id: 'item_41', restaurantId: 'rest_6', category: 'Biryani', name: 'Chicken Tikka Masala', description: 'Grilled chicken tikka in rich, spiced tomato cream sauce', price: 16.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },

      // === The Green Bowl (rest_7) ===
      { id: 'item_42', restaurantId: 'rest_7', category: 'Bowls', name: 'Acai Power Bowl', description: 'Blended acai topped with granola, banana, berries, and honey', price: 13.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [
          { id: 'cg_20', name: 'Extra toppings', required: false, maxSelections: 3, minSelections: 0, options: [
            { id: 'co_56', name: 'Chia Seeds', priceModifier: 1.00, isDefault: false, isAvailable: true },
            { id: 'co_57', name: 'Peanut Butter', priceModifier: 1.50, isDefault: false, isAvailable: true },
            { id: 'co_58', name: 'Coconut Flakes', priceModifier: 0.75, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_43', restaurantId: 'rest_7', category: 'Bowls', name: 'Poke Bowl', description: 'Fresh ahi tuna, edamame, avocado, cucumber over sushi rice with ponzu', price: 16.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_21', name: 'Base', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_59', name: 'Sushi Rice', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_60', name: 'Brown Rice', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_61', name: 'Mixed Greens', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_44', restaurantId: 'rest_7', category: 'Salads', name: 'Kale Caesar Salad', description: 'Massaged kale with parmesan, croutons, and creamy caesar dressing', price: 12.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_22', name: 'Add protein', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_62', name: 'Grilled Chicken', priceModifier: 3.00, isDefault: false, isAvailable: true },
            { id: 'co_63', name: 'Grilled Salmon', priceModifier: 5.00, isDefault: false, isAvailable: true },
            { id: 'co_64', name: 'Tofu', priceModifier: 2.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_45', restaurantId: 'rest_7', category: 'Smoothies', name: 'Green Detox Smoothie', description: 'Spinach, banana, mango, ginger, and coconut water blended smooth', price: 8.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_46', restaurantId: 'rest_7', category: 'Wraps', name: 'Mediterranean Wrap', description: 'Hummus, falafel, mixed greens, tomato, cucumber, and tahini in a whole wheat wrap', price: 11.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },
      { id: 'item_47', restaurantId: 'rest_7', category: 'Bowls', name: 'Quinoa Harvest Bowl', description: 'Roasted sweet potato, quinoa, black beans, corn, avocado, lime dressing', price: 14.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [] },

      // === Sweet Treats Bakery (rest_8) ===
      { id: 'item_48', restaurantId: 'rest_8', category: 'Cakes & Pies', name: 'New York Cheesecake', description: 'Classic creamy cheesecake with graham cracker crust', price: 7.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_23', name: 'Topping', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_65', name: 'Strawberry Sauce', priceModifier: 1.00, isDefault: false, isAvailable: true },
            { id: 'co_66', name: 'Chocolate Ganache', priceModifier: 1.00, isDefault: false, isAvailable: true },
            { id: 'co_67', name: 'Caramel Drizzle', priceModifier: 1.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_49', restaurantId: 'rest_8', category: 'Pastries', name: 'Butter Croissant', description: 'Flaky, golden French croissant made with real butter', price: 4.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_50', restaurantId: 'rest_8', category: 'Cookies', name: 'Chocolate Chip Cookie', description: 'Warm, gooey chocolate chip cookie with sea salt', price: 3.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_51', restaurantId: 'rest_8', category: 'Cakes & Pies', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream', price: 9.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_52', restaurantId: 'rest_8', category: 'Beverages', name: 'Iced Caramel Latte', description: 'Espresso with caramel syrup, milk, and ice', price: 5.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_24', name: 'Milk type', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_68', name: 'Whole Milk', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_69', name: 'Oat Milk', priceModifier: 0.50, isDefault: false, isAvailable: true },
            { id: 'co_70', name: 'Almond Milk', priceModifier: 0.50, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_53', restaurantId: 'rest_8', category: 'Pastries', name: 'Blueberry Muffin', description: 'Freshly baked muffin loaded with juicy blueberries', price: 3.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },

      // === Pho King Good (rest_9) ===
      { id: 'item_54', restaurantId: 'rest_9', category: 'Pho', name: 'Beef Pho', description: 'Traditional Vietnamese soup with rice noodles, rare beef, brisket, and fresh herbs', price: 14.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_25', name: 'Size', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_71', name: 'Regular', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_72', name: 'Large', priceModifier: 3.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_55', restaurantId: 'rest_9', category: 'Pho', name: 'Chicken Pho', description: 'Clear chicken broth with rice noodles, shredded chicken, and herbs', price: 13.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_56', restaurantId: 'rest_9', category: 'Banh Mi', name: 'Classic Banh Mi', description: 'Vietnamese baguette with grilled pork, pickled daikon & carrots, jalapenos, cilantro', price: 10.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_26', name: 'Protein', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_73', name: 'Grilled Pork', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_74', name: 'Lemongrass Chicken', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_75', name: 'Tofu', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_57', restaurantId: 'rest_9', category: 'Rice Plates', name: 'Lemongrass Chicken Rice', description: 'Grilled lemongrass chicken over steamed rice with pickled vegetables', price: 13.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_58', restaurantId: 'rest_9', category: 'Appetizers', name: 'Fresh Spring Rolls', description: 'Rice paper rolls with shrimp, vermicelli, lettuce, and peanut sauce (2 pcs)', price: 7.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_59', restaurantId: 'rest_9', category: 'Appetizers', name: 'Vietnamese Coffee', description: 'Strong drip coffee with sweetened condensed milk over ice', price: 4.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },

      // === Mediterranean Grill (rest_10) ===
      { id: 'item_60', restaurantId: 'rest_10', category: 'Kebabs', name: 'Chicken Shawarma Plate', description: 'Marinated grilled chicken with rice, hummus, salad, and warm pita', price: 15.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_27', name: 'Sauce', required: false, maxSelections: 2, minSelections: 0, options: [
            { id: 'co_76', name: 'Garlic Sauce', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_77', name: 'Tahini', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_78', name: 'Hot Sauce', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_61', restaurantId: 'rest_10', category: 'Kebabs', name: 'Lamb Kebab Plate', description: 'Grilled lamb skewers with basmati rice, grilled vegetables, and tzatziki', price: 18.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_62', restaurantId: 'rest_10', category: 'Wraps', name: 'Falafel Wrap', description: 'Crispy falafel with hummus, pickled turnips, tomatoes, and tahini in warm pita', price: 11.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },
      { id: 'item_63', restaurantId: 'rest_10', category: 'Platters', name: 'Mixed Grill Platter', description: 'Assorted kebabs (chicken, lamb, kofta) with rice, salad, and sauces', price: 24.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_64', restaurantId: 'rest_10', category: 'Sides & Dips', name: 'Hummus & Pita', description: 'Creamy chickpea hummus with warm pita bread and olive oil', price: 7.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan'],
        customizationGroups: [] },
      { id: 'item_65', restaurantId: 'rest_10', category: 'Sides & Dips', name: 'Baba Ganoush', description: 'Smoky roasted eggplant dip with tahini, lemon, and garlic', price: 7.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_66', restaurantId: 'rest_10', category: 'Platters', name: 'Grilled Fish Plate', description: 'Fresh grilled branzino with saffron rice, salad, and lemon wedges', price: 19.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },

      // === Seoul Kitchen (rest_11) ===
      { id: 'item_67', restaurantId: 'rest_11', category: 'BBQ', name: 'Korean BBQ Beef', description: 'Marinated bulgogi beef grilled to perfection, served with rice and banchan', price: 17.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_28', name: 'Spice level', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_79', name: 'Mild', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_80', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_81', name: 'Spicy', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_68', restaurantId: 'rest_11', category: 'BBQ', name: 'Spicy Pork Belly', description: 'Thinly sliced pork belly marinated in gochujang, served with lettuce wraps', price: 16.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_69', restaurantId: 'rest_11', category: 'Rice Bowls', name: 'Bibimbap', description: 'Mixed rice bowl with vegetables, egg, and gochujang sauce', price: 14.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [
          { id: 'cg_29', name: 'Add protein', required: false, maxSelections: 1, minSelections: 0, options: [
            { id: 'co_82', name: 'Beef', priceModifier: 3.00, isDefault: false, isAvailable: true },
            { id: 'co_83', name: 'Chicken', priceModifier: 2.50, isDefault: false, isAvailable: true },
            { id: 'co_84', name: 'Tofu', priceModifier: 1.50, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_70', restaurantId: 'rest_11', category: 'Appetizers', name: 'Korean Fried Chicken', description: 'Crispy double-fried chicken wings with sweet & spicy glaze', price: 13.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_71', restaurantId: 'rest_11', category: 'Drinks', name: 'Soju Cocktail (NA)', description: 'Non-alcoholic peach-flavored refresher in Korean style', price: 4.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegan'],
        customizationGroups: [] },

      // === Bangkok Street (rest_12) ===
      { id: 'item_72', restaurantId: 'rest_12', category: 'Curries', name: 'Green Curry', description: 'Thai green curry with coconut milk, bamboo shoots, and Thai basil', price: 14.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_30', name: 'Protein', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_85', name: 'Chicken', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_86', name: 'Shrimp', priceModifier: 2.00, isDefault: false, isAvailable: true },
            { id: 'co_87', name: 'Tofu', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_73', restaurantId: 'rest_12', category: 'Noodles', name: 'Pad Thai', description: 'Classic stir-fried rice noodles with tamarind sauce, peanuts, and lime', price: 13.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_74', restaurantId: 'rest_12', category: 'Stir Fry', name: 'Basil Chicken', description: 'Wok-fried chicken with Thai holy basil, chili, garlic over rice', price: 13.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_75', restaurantId: 'rest_12', category: 'Appetizers', name: 'Tom Yum Soup', description: 'Hot and sour Thai soup with shrimp, mushrooms, lemongrass', price: 8.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_76', restaurantId: 'rest_12', category: 'Curries', name: 'Massaman Curry', description: 'Rich peanut curry with potatoes, onions, and your choice of protein', price: 15.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },

      // === Pizza Planet (rest_13) ===
      { id: 'item_77', restaurantId: 'rest_13', category: 'Specialty Pizzas', name: 'Meat Lovers Pizza', description: 'Pepperoni, sausage, bacon, ham on our signature tomato sauce', price: 16.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_31', name: 'Size', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_88', name: 'Medium (12")', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_89', name: 'Large (16")', priceModifier: 4.00, isDefault: false, isAvailable: true },
            { id: 'co_90', name: 'XL (18")', priceModifier: 6.00, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_78', restaurantId: 'rest_13', category: 'Specialty Pizzas', name: 'BBQ Chicken Pizza', description: 'Grilled chicken, red onion, cilantro, BBQ sauce, and mozzarella', price: 15.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_79', restaurantId: 'rest_13', category: 'Wings', name: 'Buffalo Wings (12pc)', description: 'Crispy chicken wings tossed in our spicy buffalo sauce with ranch', price: 13.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_80', restaurantId: 'rest_13', category: 'Sides', name: 'Garlic Breadsticks', description: 'Freshly baked garlic breadsticks with marinara dipping sauce', price: 5.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_81', restaurantId: 'rest_13', category: 'Drinks', name: 'Fountain Drink', description: 'Choice of Coke, Sprite, Dr Pepper, or Lemonade', price: 2.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegan'],
        customizationGroups: [] },

      // === Sunrise Breakfast (rest_14) ===
      { id: 'item_82', restaurantId: 'rest_14', category: 'Breakfast Plates', name: 'Classic Breakfast', description: 'Two eggs any style, bacon or sausage, hash browns, and toast', price: 12.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_32', name: 'Egg style', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_91', name: 'Scrambled', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_92', name: 'Sunny Side Up', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_93', name: 'Over Easy', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_83', restaurantId: 'rest_14', category: 'Pancakes & Waffles', name: 'Blueberry Pancakes', description: 'Fluffy buttermilk pancakes with fresh blueberries and maple syrup', price: 11.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_84', restaurantId: 'rest_14', category: 'Pancakes & Waffles', name: 'Belgian Waffle', description: 'Crispy Belgian waffle with whipped cream and fresh strawberries', price: 10.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_85', restaurantId: 'rest_14', category: 'Healthy', name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado, poached egg, microgreens', price: 13.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_86', restaurantId: 'rest_14', category: 'Beverages', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 4.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegan', 'Gluten-Free'],
        customizationGroups: [] },

      // === Flame Grill House (rest_15) ===
      { id: 'item_87', restaurantId: 'rest_15', category: 'Steaks', name: 'Ribeye Steak', description: '12oz USDA Prime ribeye, chargrilled to your preference', price: 34.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [
          { id: 'cg_33', name: 'Doneness', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_94', name: 'Medium Rare', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_95', name: 'Medium', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_96', name: 'Medium Well', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_97', name: 'Well Done', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_88', restaurantId: 'rest_15', category: 'Ribs & BBQ', name: 'Smoked Baby Back Ribs', description: 'Full rack of slow-smoked ribs with house BBQ sauce, coleslaw, cornbread', price: 26.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_89', restaurantId: 'rest_15', category: 'Steaks', name: 'Filet Mignon', description: '8oz center-cut filet with truffle mashed potatoes and asparagus', price: 39.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Gluten-Free'],
        customizationGroups: [] },
      { id: 'item_90', restaurantId: 'rest_15', category: 'Sides', name: 'Loaded Baked Potato', description: 'Baked potato with butter, sour cream, bacon, cheddar, and chives', price: 7.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_91', restaurantId: 'rest_15', category: 'Drinks', name: 'Craft Lemonade', description: 'House-made lemonade with fresh mint', price: 4.49, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegan'],
        customizationGroups: [] },

      // === Panda Garden (rest_16) ===
      { id: 'item_92', restaurantId: 'rest_16', category: 'Combo Meals', name: 'Two Entree Plate', description: 'Choose 2 entrees with fried rice or chow mein', price: 11.99, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [
          { id: 'cg_34', name: 'Entree 1', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_98', name: 'Orange Chicken', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_99', name: 'Beijing Beef', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_100', name: 'Broccoli Beef', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_101', name: 'Kung Pao Chicken', priceModifier: 0, isDefault: false, isAvailable: true }
          ]},
          { id: 'cg_35', name: 'Entree 2', required: true, maxSelections: 1, minSelections: 1, options: [
            { id: 'co_102', name: 'Orange Chicken', priceModifier: 0, isDefault: true, isAvailable: true },
            { id: 'co_103', name: 'Beijing Beef', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_104', name: 'Broccoli Beef', priceModifier: 0, isDefault: false, isAvailable: true },
            { id: 'co_105', name: 'Kung Pao Chicken', priceModifier: 0, isDefault: false, isAvailable: true }
          ]}
        ]},
      { id: 'item_93', restaurantId: 'rest_16', category: 'Noodles', name: 'Orange Chicken Noodle', description: 'Crispy orange chicken over lo mein noodles', price: 12.49, imageUrl: '', isPopular: true, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_94', restaurantId: 'rest_16', category: 'Fried Rice', name: 'Shrimp Fried Rice', description: 'Wok-fried rice with shrimp, eggs, peas, and green onions', price: 11.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] },
      { id: 'item_95', restaurantId: 'rest_16', category: 'Dim Sum', name: 'Cream Cheese Rangoons', description: 'Crispy wontons filled with cream cheese (6 pieces)', price: 6.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: ['Vegetarian'],
        customizationGroups: [] },
      { id: 'item_96', restaurantId: 'rest_16', category: 'Combo Meals', name: 'Family Feast', description: '3 large entrees, 2 sides, and 4 egg rolls', price: 39.99, imageUrl: '', isPopular: false, isAvailable: true, dietaryTags: [],
        customizationGroups: [] }
    ],

    cart: {
      restaurantId: null,
      restaurantName: null,
      items: [],
      deliveryMode: 'delivery',
      scheduledTime: null,
      promoCode: null,
      promoDiscount: 0,
      tipAmount: 0,
      tipPercentage: 18,
      deliveryInstructions: ''
    },

    orders: [
      {
        id: 'ord_1', restaurantId: 'rest_1', restaurantName: 'Bella Italia', restaurantImageUrl: '',
        items: [
          { menuItemId: 'item_1', name: 'Margherita Pizza', quantity: 1, unitPrice: 16.99, totalPrice: 16.99, selectedOptions: ['Medium (12")'], specialInstructions: '' },
          { menuItemId: 'item_2', name: 'Spaghetti Carbonara', quantity: 1, unitPrice: 16.99, totalPrice: 16.99, selectedOptions: ['Spaghetti'], specialInstructions: '' }
        ],
        status: 'delivered', placedAt: twoDaysAgo,
        estimatedDeliveryMin: new Date(new Date(twoDaysAgo).getTime() + 30 * 60000).toISOString(),
        estimatedDeliveryMax: new Date(new Date(twoDaysAgo).getTime() + 45 * 60000).toISOString(),
        deliveredAt: new Date(new Date(twoDaysAgo).getTime() + 35 * 60000).toISOString(),
        deliveryAddress: { id: 'addr_1', label: 'Home', street: '123 Main St', apt: 'Apt 4B', city: 'San Francisco', state: 'CA', zip: '94102', instructions: '', isDefault: true },
        deliveryMode: 'delivery', subtotal: 33.98, serviceFee: 3.40, deliveryFee: 2.49, tax: 3.06, tip: 5.40, promoDiscount: 0, total: 48.33,
        paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: { id: 'dp_1', name: 'Marcus R.', photoUrl: '', vehicleType: 'car', rating: 4.9 },
        rating: 5, review: 'Excellent food, delivered hot and fresh!'
      },
      {
        id: 'ord_2', restaurantId: 'rest_3', restaurantName: 'Burger Barn', restaurantImageUrl: '',
        items: [
          { menuItemId: 'item_15', name: 'Classic Cheeseburger', quantity: 2, unitPrice: 11.99, totalPrice: 23.98, selectedOptions: ['Single'], specialInstructions: '' },
          { menuItemId: 'item_18', name: 'Loaded Fries', quantity: 1, unitPrice: 7.99, totalPrice: 7.99, selectedOptions: [], specialInstructions: '' }
        ],
        status: 'delivered', placedAt: fiveDaysAgo,
        estimatedDeliveryMin: new Date(new Date(fiveDaysAgo).getTime() + 15 * 60000).toISOString(),
        estimatedDeliveryMax: new Date(new Date(fiveDaysAgo).getTime() + 25 * 60000).toISOString(),
        deliveredAt: new Date(new Date(fiveDaysAgo).getTime() + 20 * 60000).toISOString(),
        deliveryAddress: { id: 'addr_2', label: 'Work', street: '456 Market St', apt: 'Suite 800', city: 'San Francisco', state: 'CA', zip: '94105', instructions: '', isDefault: false },
        deliveryMode: 'delivery', subtotal: 31.97, serviceFee: 3.20, deliveryFee: 0.99, tax: 2.88, tip: 4.80, promoDiscount: 0, total: 43.84,
        paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: { id: 'dp_2', name: 'Sarah L.', photoUrl: '', vehicleType: 'bike', rating: 4.8 },
        rating: null, review: null
      },
      {
        id: 'ord_3', restaurantId: 'rest_2', restaurantName: 'Tokyo Express', restaurantImageUrl: '',
        items: [
          { menuItemId: 'item_8', name: 'Dragon Roll', quantity: 1, unitPrice: 16.99, totalPrice: 16.99, selectedOptions: ['Mild'], specialInstructions: 'Extra wasabi on the side' }
        ],
        status: 'delivered', placedAt: oneWeekAgo,
        estimatedDeliveryMin: new Date(new Date(oneWeekAgo).getTime() + 30 * 60000).toISOString(),
        estimatedDeliveryMax: new Date(new Date(oneWeekAgo).getTime() + 45 * 60000).toISOString(),
        deliveredAt: new Date(new Date(oneWeekAgo).getTime() + 38 * 60000).toISOString(),
        deliveryAddress: { id: 'addr_1', label: 'Home', street: '123 Main St', apt: 'Apt 4B', city: 'San Francisco', state: 'CA', zip: '94102', instructions: '', isDefault: true },
        deliveryMode: 'delivery', subtotal: 16.99, serviceFee: 2.55, deliveryFee: 3.99, tax: 1.53, tip: 3.00, promoDiscount: 0, total: 28.06,
        paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: { id: 'dp_3', name: 'James K.', photoUrl: '', vehicleType: 'car', rating: 4.7 },
        rating: 4, review: 'Fresh sushi, slightly late delivery'
      },
      {
        id: 'ord_4', restaurantId: 'rest_4', restaurantName: 'Taco Fiesta', restaurantImageUrl: '',
        items: [
          { menuItemId: 'item_22', name: 'Carne Asada Tacos', quantity: 2, unitPrice: 12.99, totalPrice: 25.98, selectedOptions: ['Corn', 'Medium'], specialInstructions: '' },
          { menuItemId: 'item_23', name: 'Super Burrito', quantity: 1, unitPrice: 15.99, totalPrice: 15.99, selectedOptions: ['Steak'], specialInstructions: 'No sour cream' },
          { menuItemId: 'item_26', name: 'Guacamole & Chips', quantity: 1, unitPrice: 8.99, totalPrice: 8.99, selectedOptions: [], specialInstructions: '' }
        ],
        status: 'delivered', placedAt: twoWeeksAgo,
        estimatedDeliveryMin: new Date(new Date(twoWeeksAgo).getTime() + 20 * 60000).toISOString(),
        estimatedDeliveryMax: new Date(new Date(twoWeeksAgo).getTime() + 30 * 60000).toISOString(),
        deliveredAt: new Date(new Date(twoWeeksAgo).getTime() + 25 * 60000).toISOString(),
        deliveryAddress: { id: 'addr_1', label: 'Home', street: '123 Main St', apt: 'Apt 4B', city: 'San Francisco', state: 'CA', zip: '94102', instructions: '', isDefault: true },
        deliveryMode: 'delivery', subtotal: 50.96, serviceFee: 5.10, deliveryFee: 1.49, tax: 4.59, tip: 7.64, promoDiscount: 0, total: 69.78,
        paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: { id: 'dp_1', name: 'Marcus R.', photoUrl: '', vehicleType: 'car', rating: 4.9 },
        rating: 5, review: 'Best tacos in SF!'
      },
      {
        id: 'ord_5', restaurantId: 'rest_5', restaurantName: 'Golden Dragon', restaurantImageUrl: '',
        items: [
          { menuItemId: 'item_29', name: 'Kung Pao Chicken', quantity: 1, unitPrice: 14.99, totalPrice: 14.99, selectedOptions: ['Hot'], specialInstructions: '' },
          { menuItemId: 'item_30', name: 'Pork Dumplings', quantity: 1, unitPrice: 10.99, totalPrice: 10.99, selectedOptions: ['Steamed'], specialInstructions: '' }
        ],
        status: 'cancelled', placedAt: threeDaysAgo,
        estimatedDeliveryMin: null, estimatedDeliveryMax: null, deliveredAt: null,
        deliveryAddress: { id: 'addr_1', label: 'Home', street: '123 Main St', apt: 'Apt 4B', city: 'San Francisco', state: 'CA', zip: '94102', instructions: '', isDefault: true },
        deliveryMode: 'delivery', subtotal: 25.98, serviceFee: 2.60, deliveryFee: 2.99, tax: 2.34, tip: 3.90, promoDiscount: 0, total: 37.81,
        paymentMethod: 'Visa \u2022\u2022\u2022\u2022 4242',
        deliveryPerson: null,
        rating: null, review: null
      }
    ],

    activeOrderId: null,

    promotions: [
      { id: 'promo_1', type: 'discount', title: '$5 off $25+', description: 'Save $5 on orders over $25', code: 'SAVE5', minOrder: 25.00, discountAmount: 5.00, discountPercent: null, expiresAt: '2026-12-31', restaurantId: null },
      { id: 'promo_2', type: 'free_delivery', title: 'Free Delivery', description: 'Free delivery at Mediterranean Grill', code: null, minOrder: 0, discountAmount: 0, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_10' },
      { id: 'promo_3', type: 'percentage', title: '20% off first order', description: '20% off your first order', code: 'FIRST20', minOrder: 15.00, discountAmount: 0, discountPercent: 20, expiresAt: '2026-12-31', restaurantId: null },
      { id: 'promo_4', type: 'discount', title: '$3 off Sushi', description: '$3 off at Tokyo Express', code: 'SUSHI3', minOrder: 15.00, discountAmount: 3.00, discountPercent: null, expiresAt: '2026-12-31', restaurantId: 'rest_2' },
      { id: 'promo_5', type: 'free_delivery', title: 'Uber One: $0 Delivery', description: '$0 Delivery Fee and 5% off eligible orders with Uber One', code: null, minOrder: 0, discountAmount: 0, discountPercent: 5, expiresAt: '2026-12-31', restaurantId: null },
      { id: 'promo_6', type: 'discount', title: '$10 off $40+', description: 'Save $10 on orders over $40', code: 'DEAL10', minOrder: 40.00, discountAmount: 10.00, discountPercent: null, expiresAt: '2026-12-31', restaurantId: null },
      { id: 'promo_7', type: 'percentage', title: '15% off Korean', description: '15% off at Seoul Kitchen', code: 'KOREAN15', minOrder: 20.00, discountAmount: 0, discountPercent: 15, expiresAt: '2026-12-31', restaurantId: 'rest_11' }
    ],

    reviews: [
      { id: 'rev_1', restaurantId: 'rest_1', userId: 'user_1', userName: 'Alex J.', rating: 5, comment: 'Best pizza in the city! The crust is perfect.', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), orderId: 'ord_1' },
      { id: 'rev_2', restaurantId: 'rest_1', userId: 'user_2', userName: 'Maria S.', rating: 4, comment: 'Great pasta, portion size could be bigger.', createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_3', restaurantId: 'rest_1', userId: 'user_3', userName: 'David W.', rating: 5, comment: 'Authentic Italian flavors. Will order again!', createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_4', restaurantId: 'rest_2', userId: 'user_1', userName: 'Alex J.', rating: 4, comment: 'Fresh sushi, quick delivery. The Dragon Roll is amazing.', createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), orderId: 'ord_3' },
      { id: 'rev_5', restaurantId: 'rest_2', userId: 'user_4', userName: 'Lisa T.', rating: 5, comment: 'Best sushi outside of Japan!', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_6', restaurantId: 'rest_3', userId: 'user_5', userName: 'Mike R.', rating: 4, comment: 'Solid burgers, great fries. Fast delivery too.', createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_7', restaurantId: 'rest_3', userId: 'user_6', userName: 'Emma B.', rating: 5, comment: 'The BBQ Bacon Burger is incredible!', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_8', restaurantId: 'rest_4', userId: 'user_1', userName: 'Alex J.', rating: 5, comment: 'Best tacos in SF! The carne asada is perfectly seasoned.', createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(), orderId: 'ord_4' },
      { id: 'rev_9', restaurantId: 'rest_4', userId: 'user_7', userName: 'Carlos M.', rating: 4, comment: 'Very authentic Mexican food. Love the horchata.', createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_10', restaurantId: 'rest_5', userId: 'user_8', userName: 'Jenny L.', rating: 4, comment: 'Good Chinese food. Dumplings are the highlight.', createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_11', restaurantId: 'rest_5', userId: 'user_9', userName: 'Tom H.', rating: 5, comment: 'Authentic dim sum! Reminds me of Hong Kong.', createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_12', restaurantId: 'rest_6', userId: 'user_10', userName: 'Priya K.', rating: 5, comment: 'The butter chicken is heavenly. Naan is fresh.', createdAt: new Date(now - 11 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_13', restaurantId: 'rest_6', userId: 'user_11', userName: 'Ryan P.', rating: 4, comment: 'Flavorful curries, generous portions.', createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_14', restaurantId: 'rest_7', userId: 'user_12', userName: 'Sophie N.', rating: 5, comment: 'Love the poke bowl! So fresh and healthy.', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_15', restaurantId: 'rest_7', userId: 'user_13', userName: 'Chris D.', rating: 4, comment: 'Great healthy options. Acai bowl is my go-to.', createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_16', restaurantId: 'rest_8', userId: 'user_14', userName: 'Amanda F.', rating: 5, comment: 'The cheesecake is to die for! Best bakery in town.', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_17', restaurantId: 'rest_8', userId: 'user_15', userName: 'Jake W.', rating: 5, comment: 'Croissants are perfectly flaky. Coffee is great too.', createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_18', restaurantId: 'rest_9', userId: 'user_16', userName: 'Kim N.', rating: 4, comment: 'Authentic pho! The broth is rich and flavorful.', createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_19', restaurantId: 'rest_9', userId: 'user_17', userName: 'Brian C.', rating: 5, comment: 'Best banh mi I have ever had. Highly recommend!', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_20', restaurantId: 'rest_10', userId: 'user_18', userName: 'Sara A.', rating: 4, comment: 'Great Mediterranean food. Shawarma plate is excellent.', createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_21', restaurantId: 'rest_10', userId: 'user_19', userName: 'Omar T.', rating: 5, comment: 'Tastes just like home! Authentic and delicious.', createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_22', restaurantId: 'rest_11', userId: 'user_20', userName: 'Ji-yeon K.', rating: 5, comment: 'Best Korean BBQ delivery. Bulgogi is perfectly marinated!', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_23', restaurantId: 'rest_11', userId: 'user_21', userName: 'Tyler H.', rating: 4, comment: 'Bibimbap is great. Generous portions!', createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_24', restaurantId: 'rest_12', userId: 'user_22', userName: 'Megan C.', rating: 5, comment: 'Pad Thai is incredible. Best Thai food in SF.', createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_25', restaurantId: 'rest_13', userId: 'user_23', userName: 'Daniel B.', rating: 4, comment: 'Quick delivery, hot pizza. Wings are great too.', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_26', restaurantId: 'rest_14', userId: 'user_24', userName: 'Rachel M.', rating: 5, comment: 'Amazing breakfast! Avocado toast is the best in town.', createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_27', restaurantId: 'rest_15', userId: 'user_25', userName: 'Patrick S.', rating: 4, comment: 'Excellent steaks. Ribeye was cooked perfectly.', createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(), orderId: null },
      { id: 'rev_28', restaurantId: 'rest_16', userId: 'user_26', userName: 'Linda W.', rating: 4, comment: 'Fast, affordable Chinese food. Orange chicken is addictive!', createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), orderId: null }
    ],

    ui: {
      selectedAddressId: 'addr_1',
      deliveryMode: 'delivery',
      searchQuery: '',
      recentSearches: ['Pizza', 'Burgers', 'Sushi'],
      activeFilters: {
        sort: 'recommended',
        priceRange: [],
        dietary: [],
        maxDeliveryFee: null,
        deals: false
      }
    }
  };
}
