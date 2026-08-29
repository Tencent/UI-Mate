export const INITIAL_STATE = {
  currentUser: {
    id: 'user_1',
    username: 'admin',
    email: 'admin@example.com',
    avatar: 'https://picsum.photos/100/100?random=user1',
    feedbackScore: 154,
    feedbackRating: 98.5
  },
  users: [
    {
      id: 'user_1',
      username: 'admin',
      email: 'admin@example.com',
      avatar: 'https://picsum.photos/100/100?random=user1',
      feedbackScore: 154,
      feedbackRating: 98.5
    },
    {
      id: 'user_2',
      username: 'RetroGamer99',
      email: 'retro@example.com',
      avatar: 'https://picsum.photos/100/100?random=user2',
      feedbackScore: 42,
      feedbackRating: 100
    },
    {
      id: 'user_3',
      username: 'CameraPro',
      email: 'camera@example.com',
      avatar: 'https://picsum.photos/100/100?random=user3',
      feedbackScore: 890,
      feedbackRating: 99.2
    }
  ],
  listings: [
    {
      id: 'item_1',
      sellerId: 'user_2',
      title: 'Vintage Nintendo Game Boy Color - Atomic Purple',
      description: 'Authentic Nintendo Game Boy Color in Atomic Purple. Tested and working perfectly. Screen has minor scratches consistent with age. Comes with 2 AA batteries.',
      images: [
        'https://picsum.photos/400/400?random=item1a',
        'https://picsum.photos/400/400?random=item1b'
      ],
      type: 'auction',
      startingBid: 40.00,
      currentBid: 55.00,
      buyItNowPrice: 120.00,
      bids: [
        { id: 'bid_1', userId: 'user_3', amount: 45.00, timestamp: Date.now() - 100000, autoBidMax: 45.00 },
        { id: 'bid_2', userId: 'user_1', amount: 55.00, timestamp: Date.now() - 50000, autoBidMax: 60.00 }
      ],
      watchers: ['user_1'],
      views: 124,
      endTime: Date.now() + 86400000 * 2, // 2 days from now
      condition: 'Used',
      shipping: 5.99,
      category: 'Electronics',
      status: 'active'
    },
    {
      id: 'item_2',
      sellerId: 'user_3',
      title: 'Canon EOS R5 Mirrorless Camera Body',
      description: 'Brand new in box. Never opened. Full warranty included.',
      images: [
        'https://picsum.photos/400/400?random=item2'
      ],
      type: 'fixed',
      price: 3200.00,
      buyItNowPrice: 3200.00,
      bids: [],
      watchers: [],
      views: 45,
      endTime: Date.now() + 86400000 * 5,
      condition: 'New',
      shipping: 0.00,
      category: 'Cameras',
      status: 'active'
    },
    {
      id: 'item_3',
      sellerId: 'user_2',
      title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      description: 'Used for one flight. Like new condition. Original box and cables included.',
      images: [
        'https://picsum.photos/400/400?random=item3'
      ],
      type: 'auction',
      startingBid: 150.00,
      currentBid: 150.00,
      buyItNowPrice: 280.00,
      bids: [],
      watchers: ['user_3'],
      views: 89,
      endTime: Date.now() + 3600000, // 1 hour from now
      condition: 'Open Box',
      shipping: 12.50,
      category: 'Electronics',
      status: 'active'
    },
    {
      id: 'item_4',
      sellerId: 'user_1',
      title: 'Rare First Edition Book - The Hobbit',
      description: 'A collector\'s dream. Good condition considering age. Binding is tight.',
      images: [
        'https://picsum.photos/400/400?random=item4'
      ],
      type: 'auction',
      startingBid: 500.00,
      currentBid: 500.00,
      buyItNowPrice: null,
      bids: [],
      watchers: ['user_2'],
      views: 312,
      endTime: Date.now() + 86400000 * 7,
      condition: 'Used',
      shipping: 15.00,
      category: 'Books',
      status: 'active'
    }
  ],
  orders: [],
  messages: [
    {
      id: 'msg_1',
      fromId: 'user_2',
      toId: 'user_1',
      listingId: 'item_4',
      subject: 'Question about shipping',
      content: 'Can you ship this internationally?',
      read: false,
      timestamp: Date.now() - 3600000
    }
  ],
  notifications: [],
  feedbacks: [],
  cart: []
};

// --- Session-based state isolation ---

const BASE_STORAGE_KEY = 'ebay_mock_state';
const BASE_INITIAL_KEY = 'ebay_mock_state_initialState';

function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const d = await resp.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch(e) { console.warn('[ebay_mock] fetchCustomState error:', e); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state }),
  }).catch(e => console.warn('[ebay_mock] saveState server sync error:', e));
};

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid)); return s ? JSON.parse(s) : null;
};

function createDefaultData() {
  return { ...INITIAL_STATE };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid), ik = initialKey(sid);
  if (customState) {
    const data = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }
  const stored = localStorage.getItem(sk);
  if (stored) { if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored); return JSON.parse(stored); }
  const data = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

function normalizeListing(listing, index) {
  return {
    id: listing.id || `listing_custom_${index}`,
    sellerId: listing.sellerId || 'user_1',
    title: listing.title || '(No Title)',
    description: listing.description || '',
    images: Array.isArray(listing.images) ? listing.images : [],
    type: listing.type || 'auction',
    startingBid: typeof listing.startingBid === 'number' ? listing.startingBid : 0,
    currentBid: typeof listing.currentBid === 'number' ? listing.currentBid : (typeof listing.startingBid === 'number' ? listing.startingBid : 0),
    buyItNowPrice: listing.buyItNowPrice ?? listing.price ?? null,
    price: listing.price ?? listing.buyItNowPrice ?? null,
    bids: Array.isArray(listing.bids) ? listing.bids : [],
    watchers: Array.isArray(listing.watchers) ? listing.watchers : [],
    views: typeof listing.views === 'number' ? listing.views : 0,
    endTime: listing.endTime || (Date.now() + 86400000 * 7),
    condition: listing.condition || 'Used',
    shipping: typeof listing.shipping === 'number' ? listing.shipping : (typeof listing.shipping === 'object' && listing.shipping?.cost != null ? listing.shipping.cost : 0),
    category: listing.category || 'Other',
    status: listing.status || 'active',
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'listings' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((l, i) => normalizeListing(l, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else { result[key] = custom[key]; }
    }
  }
  return result;
}
