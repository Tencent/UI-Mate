export const INITIAL_STATE = {
  user: {
    id: 'user_1',
    name: 'Alex Shopper',
    email: 'alex@example.com',
    address: '123 Market St, Foodville, CA',
    phone: '(555) 010-4422',
    avatar: 'https://picsum.photos/100/100?random=user1',
    preferences: {
      leaveAtDoor: true,
      smsUpdates: true,
      defaultTipPercent: 10
    },
    paymentMethods: [
      { id: 'pay_1', brand: 'Visa', last4: '4242', default: true },
      { id: 'pay_2', brand: 'Mastercard', last4: '1881', default: false }
    ]
  },
  stores: [
    {
      id: 'store_1',
      name: 'Fresh Market',
      logo: 'https://picsum.photos/100/100?random=store1',
      hours: '8am - 10pm',
      deliveryFee: 3.99,
      minOrder: 35.00,
      color: 'bg-green-50'
    },
    {
      id: 'store_2',
      name: 'Grocery King',
      logo: 'https://picsum.photos/100/100?random=store2',
      hours: '24 Hours',
      deliveryFee: 5.99,
      minOrder: 10.00,
      color: 'bg-blue-50'
    },
    {
      id: 'store_3',
      name: 'Organic Earth',
      logo: 'https://picsum.photos/100/100?random=store3',
      hours: '9am - 8pm',
      deliveryFee: 7.99,
      minOrder: 50.00,
      color: 'bg-orange-50'
    }
  ],
  categories: [
    { id: 'cat_1', name: 'Produce', icon: 'Carrot' },
    { id: 'cat_2', name: 'Dairy & Eggs', icon: 'Milk' },
    { id: 'cat_3', name: 'Bakery', icon: 'Croissant' },
    { id: 'cat_4', name: 'Meat & Seafood', icon: 'Beef' },
    { id: 'cat_5', name: 'Pantry', icon: 'Package' },
    { id: 'cat_6', name: 'Beverages', icon: 'CupSoda' },
  ],
  products: [
    // Produce
    { id: 'p1', storeId: 'store_1', categoryId: 'cat_1', name: 'Organic Bananas', price: 0.89, unit: 'lb', image: 'https://picsum.photos/200/200?random=p1', inStock: true },
    { id: 'p2', storeId: 'store_1', categoryId: 'cat_1', name: 'Red Apples', price: 1.29, unit: 'lb', image: 'https://picsum.photos/200/200?random=p2', inStock: true },
    { id: 'p3', storeId: 'store_1', categoryId: 'cat_1', name: 'Avocado', price: 1.50, unit: 'each', image: 'https://picsum.photos/200/200?random=p3', inStock: true },
    // Dairy
    { id: 'p4', storeId: 'store_1', categoryId: 'cat_2', name: 'Whole Milk', price: 3.99, unit: 'gallon', image: 'https://picsum.photos/200/200?random=p4', inStock: true },
    { id: 'p5', storeId: 'store_1', categoryId: 'cat_2', name: 'Large Brown Eggs', price: 4.50, unit: 'dozen', image: 'https://picsum.photos/200/200?random=p5', inStock: true },
    { id: 'p6', storeId: 'store_1', categoryId: 'cat_2', name: 'Cheddar Cheese', price: 5.99, unit: '8oz', image: 'https://picsum.photos/200/200?random=p6', inStock: true },
    // Bakery
    { id: 'p7', storeId: 'store_1', categoryId: 'cat_3', name: 'Sourdough Bread', price: 4.99, unit: 'loaf', image: 'https://picsum.photos/200/200?random=p7', inStock: true },
    { id: 'p8', storeId: 'store_1', categoryId: 'cat_3', name: 'Bagels', price: 3.49, unit: '6ct', image: 'https://picsum.photos/200/200?random=p8', inStock: false },
    // Meat
    { id: 'p9', storeId: 'store_1', categoryId: 'cat_4', name: 'Ground Beef', price: 6.99, unit: 'lb', image: 'https://picsum.photos/200/200?random=p9', inStock: true },
    { id: 'p10', storeId: 'store_1', categoryId: 'cat_4', name: 'Chicken Breast', price: 5.99, unit: 'lb', image: 'https://picsum.photos/200/200?random=p10', inStock: true },

    // Store 2 Products (Subset)
    { id: 'p11', storeId: 'store_2', categoryId: 'cat_1', name: 'Bananas', price: 0.69, unit: 'lb', image: 'https://picsum.photos/200/200?random=p11', inStock: true },
    { id: 'p12', storeId: 'store_2', categoryId: 'cat_5', name: 'Pasta Sauce', price: 2.99, unit: 'jar', image: 'https://picsum.photos/200/200?random=p12', inStock: true },
  ],
  cart: [],
  orders: [],
  activeOrder: null,
  savedAddresses: [
    { id: 'addr_1', label: 'Home', address: '123 Market St, Foodville, CA', instructions: "Leave at door if I'm not around" },
    { id: 'addr_2', label: 'Office', address: '88 Mission Ave, Foodville, CA', instructions: 'Meet at lobby desk' }
  ],
  notifications: []
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'instacart_mock_state';
const BASE_INITIAL_KEY = 'instacart_mock_initialState';

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
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {
    // Local storage remains authoritative when the dev server is unavailable.
  });
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeStore(store, index) {
  return {
    id: store.id || `store_custom_${index}`,
    name: store.name || 'Unknown Store',
    logo: store.logo || store.image || '',
    hours: store.hours || store.openHours || '',
    deliveryFee: typeof store.deliveryFee === 'number' ? store.deliveryFee : 0,
    minOrder: typeof store.minOrder === 'number' ? store.minOrder : 0,
    color: store.color || 'bg-gray-50',
  };
}

function normalizeCategory(cat, index) {
  return {
    id: cat.id || `cat_custom_${index}`,
    name: cat.name || cat.label || 'Unknown',
    icon: cat.icon || 'Package',
  };
}

function normalizeProduct(product, index) {
  return {
    id: product.id || `p_custom_${index}`,
    storeId: product.storeId || product.store || 'store_1',
    categoryId: product.categoryId || product.category || 'cat_1',
    name: product.name || product.title || 'Unknown Product',
    price: typeof product.price === 'number' ? product.price : 0,
    unit: product.unit || 'each',
    image: product.image || product.img || '',
    inStock: typeof product.inStock === 'boolean' ? product.inStock : true,
  };
}

function normalizeCartItem(item, index) {
  return {
    productId: item.productId || item.id || `cart_item_${index}`,
    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    subPreference: item.subPreference || null,
    subProductId: item.subProductId || null,
  };
}

function normalizeOrder(order, index) {
  const items = Array.isArray(order.items) ? order.items.map((it, i) => normalizeCartItem(it, i)) : [];
  return {
    id: order.id || `order_custom_${index}`,
    items,
    total: typeof order.total === 'number' ? order.total : 0,
    status: order.status || 'pending',
    storeId: order.storeId || order.store || 'store_1',
    deliveryAddress: order.deliveryAddress || order.address || '',
    deliveryInstructions: order.deliveryInstructions || order.instructions || '',
    paymentMethodId: order.paymentMethodId || '',
    tip: typeof order.tip === 'number' ? order.tip : 0,
    created: order.created || order.createdAt || new Date().toISOString(),
    chat: Array.isArray(order.chat) ? order.chat : [],
  };
}

function normalizeAddress(address, index) {
  return {
    id: address.id || `addr_custom_${index}`,
    label: address.label || 'Address',
    address: address.address || '',
    instructions: address.instructions || ''
  };
}

function normalizeNotification(notification, index) {
  return {
    id: notification.id || `notif_custom_${index}`,
    message: notification.message || '',
    read: Boolean(notification.read),
    created: notification.created || notification.date || new Date().toISOString()
  };
}

const arrayNormalizers = {
  stores: normalizeStore,
  categories: normalizeCategory,
  products: normalizeProduct,
  cart: normalizeCartItem,
  orders: normalizeOrder,
  savedAddresses: normalizeAddress,
  notifications: normalizeNotification,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function getDefaultData() {
  return { ...INITIAL_STATE };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
