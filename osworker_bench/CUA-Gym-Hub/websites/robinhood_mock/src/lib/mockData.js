import { generateHistoricalData } from './utils';

const BASE_STORAGE_KEY = 'tradeflow_state_v2';
const BASE_INITIAL_KEY = 'tradeflow_initial_v2';

// Get session-specific storage keys
function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

// Read sid from URL query string or sessionStorage (survives refresh + SPA navigation)
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
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    console.log('No custom state available');
  }
  return null;
};

// Save current state to session-specific localStorage
export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  // If custom state provided (first load with session), merge with defaults
  if (customState) {
    const data = deepMergeWithDefaults(createDefaultState(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  // Load from session-specific localStorage (refresh case)
  const stored = localStorage.getItem(sk);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Simple validation to ensure critical data exists
      if (parsed.user && parsed.stocks && parsed.stocks.length > 0) {
        if (!localStorage.getItem(ik)) {
          localStorage.setItem(ik, stored);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored state", e);
    }
  }

  // No session data, no custom state -> create defaults
  const data = createDefaultState();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Normalization helpers for array fields ---

function normalizeStock(stock, index) {
  const s = {
    id: stock.id || stock.symbol || `STOCK${index}`,
    symbol: stock.symbol || stock.id || `STOCK${index}`,
    name: stock.name || `Stock ${index}`,
    currentPrice: typeof stock.currentPrice === 'number' ? stock.currentPrice : 100,
    prevClose: typeof stock.prevClose === 'number' ? stock.prevClose : 100,
    marketCap: typeof stock.marketCap === 'number' ? stock.marketCap : 0,
    volume: typeof stock.volume === 'number' ? stock.volume : 0,
    about: stock.about || '',
    sector: stock.sector || 'Unknown',
  };
  s.history = stock.history || generateHistoricalData(s.currentPrice);
  return s;
}

function normalizeNews(news, index) {
  return {
    id: news.id || index + 1,
    headline: news.headline || 'News Headline',
    source: news.source || 'Unknown',
    time: news.time || 'Now',
    summary: news.summary || '',
    imageUrl: news.imageUrl || `https://picsum.photos/400/300?random=news${index}`,
  };
}

function normalizeTransaction(tx, index) {
  return {
    id: tx.id || `${Date.now()}_${index}`,
    date: tx.date || new Date().toISOString(),
    symbol: tx.symbol || '',
    type: tx.type || 'market',
    side: tx.side || 'buy',
    quantity: typeof tx.quantity === 'number' ? tx.quantity : 0,
    price: typeof tx.price === 'number' ? tx.price : 0,
    status: tx.status || 'filled',
  };
}

function normalizeNotification(notification, index) {
  return {
    id: notification.id || `notif_${index}`,
    title: notification.title || 'Notification',
    message: notification.message || '',
    date: notification.date || new Date().toISOString(),
    read: Boolean(notification.read),
    type: notification.type || 'info',
  };
}

// Deep merge custom state with defaults (custom takes precedence)
function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;

  const result = { ...defaults };

  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'user' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = { ...defaults[key], ...custom[key] };
      } else if (key === 'stocks' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((s, i) => normalizeStock(s, i));
      } else if (key === 'news' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((n, i) => normalizeNews(n, i));
      } else if (key === 'transactions' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((t, i) => normalizeTransaction(t, i));
      } else if (key === 'watchlist' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'alerts' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'notifications' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((n, i) => normalizeNotification(n, i));
      } else if (key === 'portfolio' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object') {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }

  return result;
}

export const INITIAL_USER = {
  id: 'user_1',
  name: 'Demo User',
  cashBalance: 25000.00,
  buyingPower: 25000.00,
  portfolioValue: 0,
};

export const INITIAL_STOCKS = [
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 175.43,
    prevClose: 172.50,
    marketCap: 2700000000000,
    volume: 54000000,
    about: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and Wearables, Home, and Accessories.",
    sector: "Technology"
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    currentPrice: 178.20,
    prevClose: 180.10,
    marketCap: 560000000000,
    volume: 98000000,
    about: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. The company operates in two segments, Automotive, and Energy Generation and Storage.",
    sector: "Automotive"
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 890.50,
    prevClose: 875.20,
    marketCap: 2200000000000,
    volume: 45000000,
    about: "NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company's Graphics segment offers GeForce GPUs for gaming and PCs, the GeForce NOW game streaming service and related infrastructure.",
    sector: "Semiconductors"
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 420.15,
    prevClose: 418.00,
    marketCap: 3100000000000,
    volume: 22000000,
    about: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.",
    sector: "Technology"
  },
  {
    id: 'AMZN',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    currentPrice: 178.30,
    prevClose: 175.00,
    marketCap: 1800000000000,
    volume: 35000000,
    about: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. The company operates through three segments: North America, International, and Amazon Web Services (AWS).",
    sector: "Consumer Cyclical"
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 148.50,
    prevClose: 150.00,
    marketCap: 1900000000000,
    volume: 28000000,
    about: "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.",
    sector: "Communication Services"
  }
].map(stock => ({
  ...stock,
  history: generateHistoricalData(stock.currentPrice)
}));

export const INITIAL_NEWS = [
  {
    id: 1,
    headline: "Tech Stocks Rally as Inflation Data Cools",
    source: "MarketWatch",
    time: "2h ago",
    summary: "Major technology stocks surged today following a report showing lower-than-expected inflation numbers.",
    imageUrl: "https://picsum.photos/400/300?random=news1"
  },
  {
    id: 2,
    headline: "EV Market Sees Increased Competition",
    source: "Bloomberg",
    time: "4h ago",
    summary: "New entrants in the electric vehicle market are putting pressure on established players to innovate faster.",
    imageUrl: "https://picsum.photos/400/300?random=news2"
  },
  {
    id: 3,
    headline: "Fed Signals Potential Rate Cuts Later This Year",
    source: "CNBC",
    time: "6h ago",
    summary: "Federal Reserve officials indicated that interest rate cuts could be on the table if economic data continues to improve.",
    imageUrl: "https://picsum.photos/400/300?random=news3"
  }
];

function createDefaultState() {
  return {
    user: INITIAL_USER,
    stocks: INITIAL_STOCKS,
    portfolio: {}, // { symbol: { quantity, avgPrice } }
    watchlist: ['AAPL', 'TSLA', 'NVDA'],
    transactions: [],
    alerts: [],
    notifications: [
      {
        id: 'notif_welcome',
        title: 'Welcome to TradeFlow',
        message: 'Your simulated brokerage account is ready.',
        date: new Date().toISOString(),
        read: false,
        type: 'info'
      }
    ],
    news: INITIAL_NEWS,
  };
}

export const calculateStateDiff = (initial, current) => {
  const diff = {};
  // Compare user stats
  if (JSON.stringify(initial.user) !== JSON.stringify(current.user)) {
    diff.user = { from: initial.user, to: current.user };
  }
  // Compare portfolio
  if (JSON.stringify(initial.portfolio) !== JSON.stringify(current.portfolio)) {
    diff.portfolio = { from: initial.portfolio, to: current.portfolio };
  }
  // Compare transactions
  if ((current.transactions || []).length !== (initial.transactions || []).length) {
    diff.transactions = { new_count: current.transactions.length };
  }
  // Compare watchlist
  if (JSON.stringify(initial.watchlist) !== JSON.stringify(current.watchlist)) {
    diff.watchlist = { from: initial.watchlist, to: current.watchlist };
  }
  if (JSON.stringify(initial.notifications) !== JSON.stringify(current.notifications)) {
    diff.notifications = current.notifications;
  }
  if (JSON.stringify(initial.alerts) !== JSON.stringify(current.alerts)) {
    diff.alerts = current.alerts;
  }
  return diff;
};
