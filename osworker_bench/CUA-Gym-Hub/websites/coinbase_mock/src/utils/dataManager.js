const BASE_STORAGE_KEY = 'coinbase_mock_state';
const BASE_INITIAL_KEY = 'coinbase_mock_initialState';

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
    sessionStorage.setItem('coinbase_mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('coinbase_mock_sid') || null;
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

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
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
    const data = deepMergeWithDefaults(getInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = getInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

export const calculateStateDiff = (initial, current) => {
  const diff = {};
  if (!initial || !current) return diff;
  for (const key in current) {
    if (JSON.stringify(initial[key]) !== JSON.stringify(current[key])) {
      diff[key] = current[key];
    }
  }
  return diff;
};

export function getInitialData() {
  return JSON.parse(JSON.stringify(initialData));
}

export const initialData = {
  currentUser: {
    id: 'user_1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://picsum.photos/100/100?random=coinbase_user',
    cashBalance: 5000.00,
    defaultCurrency: 'USD',
    notificationPreferences: {
      trade_notifications: true,
      price_alerts: true,
      security_alerts: true
    }
  },

  assets: [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      currentPrice: 43250.00,
      priceChange24h: 2.34,
      priceChange7d: -1.15,
      marketCap: 845000000000,
      volume24h: 28500000000,
      circulatingSupply: 19500000,
      maxSupply: 21000000,
      about: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by an anonymous entity known as Satoshi Nakamoto. It operates on a peer-to-peer network using blockchain technology.',
      category: 'Store of Value',
      iconColor: '#F7931A',
      priceHistory: [
        38200, 38900, 39400, 40100, 39800, 40500, 41200, 40900, 41500, 42000,
        41600, 42200, 43000, 42500, 41800, 42100, 42500, 43000, 42800, 43100,
        43500, 42900, 43200, 43800, 44100, 43600, 43300, 43700, 43100, 43250
      ]
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      currentPrice: 2280.00,
      priceChange24h: 1.87,
      priceChange7d: 3.42,
      marketCap: 274000000000,
      volume24h: 15200000000,
      circulatingSupply: 120000000,
      maxSupply: null,
      about: 'Ethereum is a decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime, fraud, or interference.',
      category: 'Smart Contract Platform',
      iconColor: '#627EEA',
      priceHistory: [
        2050, 2080, 2110, 2090, 2140, 2160, 2120, 2175, 2200, 2185,
        2210, 2230, 2220, 2245, 2260, 2200, 2220, 2250, 2240, 2270,
        2285, 2260, 2275, 2290, 2310, 2295, 2280, 2300, 2265, 2280
      ]
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      currentPrice: 98.50,
      priceChange24h: -0.85,
      priceChange7d: 5.12,
      marketCap: 42000000000,
      volume24h: 3200000000,
      circulatingSupply: 430000000,
      maxSupply: null,
      about: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.',
      category: 'Smart Contract Platform',
      iconColor: '#9945FF',
      priceHistory: [
        82.50, 84.00, 86.50, 88.00, 87.20, 89.50, 91.00, 90.00, 92.50, 94.00,
        93.00, 95.50, 97.00, 96.20, 94.50, 95.00, 96.20, 97.50, 99.00, 98.00,
        99.50, 100.50, 99.80, 101.00, 102.50, 101.00, 99.50, 98.20, 97.80, 98.50
      ]
    },
    {
      id: 'doge',
      name: 'Dogecoin',
      symbol: 'DOGE',
      currentPrice: 0.0825,
      priceChange24h: 4.21,
      priceChange7d: -2.30,
      marketCap: 11700000000,
      volume24h: 890000000,
      circulatingSupply: 142000000000,
      maxSupply: null,
      about: 'Dogecoin is a cryptocurrency featuring a likeness of the Shiba Inu dog from the "Doge" meme as its logo.',
      category: 'Meme',
      iconColor: '#C2A633',
      priceHistory: [
        0.068, 0.071, 0.073, 0.070, 0.072, 0.075, 0.077, 0.074, 0.076, 0.079,
        0.081, 0.078, 0.080, 0.083, 0.085, 0.078, 0.080, 0.079, 0.081, 0.083,
        0.086, 0.084, 0.082, 0.085, 0.087, 0.084, 0.083, 0.081, 0.084, 0.0825
      ]
    },
    {
      id: 'ada',
      name: 'Cardano',
      symbol: 'ADA',
      currentPrice: 0.52,
      priceChange24h: -1.22,
      priceChange7d: 0.85,
      marketCap: 18200000000,
      volume24h: 520000000,
      circulatingSupply: 35000000000,
      maxSupply: 45000000000,
      about: 'Cardano is a proof-of-stake blockchain platform that aims to allow changemakers, innovators, and visionaries to bring about positive global change.',
      category: 'Smart Contract Platform',
      iconColor: '#0033AD',
      priceHistory: [
        0.47, 0.48, 0.50, 0.49, 0.51, 0.52, 0.50, 0.53, 0.54, 0.52,
        0.51, 0.53, 0.55, 0.54, 0.52, 0.51, 0.52, 0.53, 0.525, 0.52,
        0.54, 0.53, 0.51, 0.52, 0.53, 0.52, 0.515, 0.525, 0.51, 0.52
      ]
    },
    {
      id: 'xrp',
      name: 'XRP',
      symbol: 'XRP',
      currentPrice: 0.62,
      priceChange24h: 0.95,
      priceChange7d: -0.42,
      marketCap: 33500000000,
      volume24h: 1100000000,
      circulatingSupply: 54000000000,
      maxSupply: 100000000000,
      about: 'XRP is the native cryptocurrency of the XRP Ledger, designed for fast, low-cost international payments.',
      category: 'Payments',
      iconColor: '#23292F',
      priceHistory: [
        0.56, 0.57, 0.58, 0.57, 0.59, 0.60, 0.58, 0.61, 0.62, 0.60,
        0.59, 0.61, 0.63, 0.62, 0.60, 0.60, 0.61, 0.615, 0.62, 0.618,
        0.625, 0.62, 0.615, 0.62, 0.625, 0.63, 0.62, 0.618, 0.625, 0.62
      ]
    },
    {
      id: 'dot',
      name: 'Polkadot',
      symbol: 'DOT',
      currentPrice: 7.15,
      priceChange24h: -0.45,
      priceChange7d: 2.10,
      marketCap: 9800000000,
      volume24h: 340000000,
      circulatingSupply: 1370000000,
      maxSupply: null,
      about: 'Polkadot enables cross-blockchain transfers of any type of data or asset, not just tokens, making a wide range of blockchains interoperable.',
      category: 'Infrastructure',
      iconColor: '#E6007A',
      priceHistory: [
        6.40, 6.55, 6.70, 6.60, 6.75, 6.90, 6.80, 6.95, 7.10, 6.95,
        6.85, 7.00, 7.15, 7.05, 6.90, 6.90, 7.00, 7.10, 7.05, 7.12,
        7.20, 7.15, 7.10, 7.20, 7.25, 7.15, 7.10, 7.18, 7.20, 7.15
      ]
    },
    {
      id: 'avax',
      name: 'Avalanche',
      symbol: 'AVAX',
      currentPrice: 35.20,
      priceChange24h: 3.15,
      priceChange7d: 1.88,
      marketCap: 12800000000,
      volume24h: 680000000,
      circulatingSupply: 365000000,
      maxSupply: 720000000,
      about: 'Avalanche is an open-source platform for launching decentralized applications and enterprise blockchain deployments.',
      category: 'Smart Contract Platform',
      iconColor: '#E84142',
      priceHistory: [
        30.50, 31.20, 32.00, 31.50, 32.50, 33.00, 32.50, 33.50, 34.50, 33.80,
        33.00, 34.00, 35.00, 34.50, 33.50, 33.50, 34.00, 34.50, 35.00, 34.80,
        35.50, 34.80, 35.20, 35.80, 36.00, 35.50, 35.00, 35.30, 35.10, 35.20
      ]
    },
    {
      id: 'matic',
      name: 'Polygon',
      symbol: 'MATIC',
      currentPrice: 0.89,
      priceChange24h: 1.42,
      priceChange7d: -0.65,
      marketCap: 8200000000,
      volume24h: 420000000,
      circulatingSupply: 9200000000,
      maxSupply: 10000000000,
      about: 'Polygon is a scaling solution for Ethereum that provides faster and cheaper transactions using Layer 2 sidechains.',
      category: 'Layer 2',
      iconColor: '#8247E5',
      priceHistory: [
        0.80, 0.82, 0.84, 0.83, 0.85, 0.86, 0.84, 0.87, 0.88, 0.86,
        0.85, 0.87, 0.89, 0.88, 0.87, 0.87, 0.88, 0.89, 0.885, 0.89,
        0.895, 0.89, 0.885, 0.89, 0.895, 0.90, 0.89, 0.88, 0.895, 0.89
      ]
    },
    {
      id: 'link',
      name: 'Chainlink',
      symbol: 'LINK',
      currentPrice: 14.50,
      priceChange24h: -0.72,
      priceChange7d: 1.95,
      marketCap: 8500000000,
      volume24h: 560000000,
      circulatingSupply: 587000000,
      maxSupply: 1000000000,
      about: 'Chainlink is a decentralized oracle network that provides real-world data to smart contracts on the blockchain.',
      category: 'Oracle',
      iconColor: '#2A5ADA',
      priceHistory: [
        12.80, 13.10, 13.50, 13.20, 13.80, 14.00, 13.70, 14.20, 14.50, 14.10,
        13.90, 14.20, 14.50, 14.30, 14.20, 14.20, 14.30, 14.45, 14.50, 14.40,
        14.55, 14.50, 14.40, 14.55, 14.60, 14.50, 14.45, 14.55, 14.50, 14.50
      ]
    },
    {
      id: 'ltc',
      name: 'Litecoin',
      symbol: 'LTC',
      currentPrice: 68.40,
      priceChange24h: 0.55,
      priceChange7d: -1.20,
      marketCap: 5100000000,
      volume24h: 380000000,
      circulatingSupply: 74000000,
      maxSupply: 84000000,
      about: 'Litecoin is a peer-to-peer cryptocurrency created as a "lighter" version of Bitcoin with faster transaction times.',
      category: 'Payments',
      iconColor: '#BFBBBB',
      priceHistory: [
        62.00, 63.50, 65.00, 64.00, 66.00, 67.50, 66.50, 68.00, 69.00, 67.80,
        67.00, 68.00, 69.50, 68.80, 67.50, 67.50, 68.00, 68.20, 68.10, 68.30,
        68.80, 68.50, 68.20, 68.60, 69.00, 68.80, 68.50, 68.60, 68.50, 68.40
      ]
    },
    {
      id: 'uni',
      name: 'Uniswap',
      symbol: 'UNI',
      currentPrice: 6.25,
      priceChange24h: 2.08,
      priceChange7d: 4.50,
      marketCap: 4700000000,
      volume24h: 210000000,
      circulatingSupply: 753000000,
      maxSupply: 1000000000,
      about: 'Uniswap is a decentralized exchange (DEX) protocol on Ethereum that allows users to swap ERC-20 tokens without intermediaries.',
      category: 'DeFi',
      iconColor: '#FF007A',
      priceHistory: [
        5.20, 5.30, 5.50, 5.40, 5.60, 5.75, 5.60, 5.80, 5.90, 5.70,
        5.65, 5.80, 5.95, 5.85, 5.90, 5.90, 6.00, 6.10, 6.15, 6.20,
        6.25, 6.18, 6.22, 6.28, 6.30, 6.22, 6.18, 6.22, 6.20, 6.25
      ]
    },
    {
      id: 'atom',
      name: 'Cosmos',
      symbol: 'ATOM',
      currentPrice: 9.80,
      priceChange24h: -1.55,
      priceChange7d: 0.32,
      marketCap: 3800000000,
      volume24h: 190000000,
      circulatingSupply: 390000000,
      maxSupply: null,
      about: 'Cosmos is a decentralized network of independent parallel blockchains, each powered by classical BFT consensus algorithms.',
      category: 'Infrastructure',
      iconColor: '#2E3148',
      priceHistory: [
        10.50, 10.80, 11.00, 10.70, 10.90, 10.60, 10.40, 10.60, 10.80, 10.60,
        10.20, 10.40, 10.60, 10.40, 9.90, 9.90, 9.85, 9.80, 9.75, 9.82,
        9.78, 9.80, 9.75, 9.82, 9.85, 9.80, 9.78, 9.82, 9.80, 9.80
      ]
    },
    {
      id: 'xlm',
      name: 'Stellar',
      symbol: 'XLM',
      currentPrice: 0.125,
      priceChange24h: 0.80,
      priceChange7d: -0.95,
      marketCap: 3500000000,
      volume24h: 150000000,
      circulatingSupply: 28000000000,
      maxSupply: 50000000000,
      about: 'Stellar is an open network for storing and moving money, making it possible to create, send, and trade digital representations of all forms of currency.',
      category: 'Payments',
      iconColor: '#000000',
      priceHistory: [
        0.110, 0.113, 0.116, 0.114, 0.117, 0.120, 0.118, 0.121, 0.124, 0.122,
        0.120, 0.122, 0.125, 0.123, 0.122, 0.122, 0.123, 0.124, 0.125, 0.124,
        0.126, 0.125, 0.124, 0.126, 0.127, 0.125, 0.124, 0.126, 0.125, 0.125
      ]
    },
    {
      id: 'algo',
      name: 'Algorand',
      symbol: 'ALGO',
      currentPrice: 0.185,
      priceChange24h: 1.10,
      priceChange7d: 2.75,
      marketCap: 1500000000,
      volume24h: 85000000,
      circulatingSupply: 8100000000,
      maxSupply: 10000000000,
      about: 'Algorand is a self-sustaining, decentralized, blockchain-based network that supports a wide range of applications.',
      category: 'Smart Contract Platform',
      iconColor: '#000000',
      priceHistory: [
        0.162, 0.165, 0.168, 0.166, 0.170, 0.173, 0.170, 0.174, 0.177, 0.175,
        0.172, 0.175, 0.178, 0.176, 0.178, 0.178, 0.180, 0.182, 0.184, 0.183,
        0.185, 0.185, 0.183, 0.186, 0.187, 0.185, 0.184, 0.186, 0.185, 0.185
      ]
    }
  ],

  holdings: [
    { assetId: 'btc', quantity: 0.5, avgBuyPrice: 41000.00 },
    { assetId: 'eth', quantity: 3.2, avgBuyPrice: 2150.00 },
    { assetId: 'sol', quantity: 25.0, avgBuyPrice: 85.00 },
    { assetId: 'link', quantity: 50.0, avgBuyPrice: 13.00 },
    { assetId: 'doge', quantity: 10000, avgBuyPrice: 0.075 }
  ],

  transactions: [
    {
      id: 'tx_1',
      type: 'buy',
      assetId: 'btc',
      quantity: 0.25,
      pricePerUnit: 42000.00,
      totalAmount: 10500.00,
      fee: 14.99,
      status: 'completed',
      timestamp: '2026-02-15T10:30:00Z'
    },
    {
      id: 'tx_2',
      type: 'buy',
      assetId: 'btc',
      quantity: 0.25,
      pricePerUnit: 40000.00,
      totalAmount: 10000.00,
      fee: 14.99,
      status: 'completed',
      timestamp: '2026-01-20T14:15:00Z'
    },
    {
      id: 'tx_3',
      type: 'buy',
      assetId: 'eth',
      quantity: 3.2,
      pricePerUnit: 2150.00,
      totalAmount: 6880.00,
      fee: 9.99,
      status: 'completed',
      timestamp: '2026-01-10T09:00:00Z'
    },
    {
      id: 'tx_4',
      type: 'buy',
      assetId: 'sol',
      quantity: 25.0,
      pricePerUnit: 85.00,
      totalAmount: 2125.00,
      fee: 4.99,
      status: 'completed',
      timestamp: '2025-12-28T16:45:00Z'
    },
    {
      id: 'tx_5',
      type: 'buy',
      assetId: 'link',
      quantity: 50.0,
      pricePerUnit: 13.00,
      totalAmount: 650.00,
      fee: 2.99,
      status: 'completed',
      timestamp: '2025-12-15T11:20:00Z'
    },
    {
      id: 'tx_6',
      type: 'buy',
      assetId: 'doge',
      quantity: 10000,
      pricePerUnit: 0.075,
      totalAmount: 750.00,
      fee: 1.99,
      status: 'completed',
      timestamp: '2025-11-30T08:30:00Z'
    },
    {
      id: 'tx_7',
      type: 'sell',
      assetId: 'ada',
      quantity: 500,
      pricePerUnit: 0.48,
      totalAmount: 240.00,
      fee: 1.49,
      status: 'completed',
      timestamp: '2025-11-15T13:00:00Z'
    },
    {
      id: 'tx_8',
      type: 'send',
      assetId: 'eth',
      quantity: 0.5,
      pricePerUnit: 2100.00,
      totalAmount: 1050.00,
      fee: 5.00,
      toAddress: '0x742d...3abc',
      status: 'completed',
      timestamp: '2025-10-20T10:15:00Z'
    }
  ],

  watchlist: ['btc', 'eth', 'sol', 'avax', 'dot'],

  paymentMethods: [
    { id: 'pm_1', type: 'bank', name: 'Chase Bank', last4: '4422', isDefault: true },
    { id: 'pm_2', type: 'card', brand: 'Visa', last4: '8899', isDefault: false }
  ],

  notifications: [
    {
      id: 'notif_1',
      type: 'trade_completed',
      message: 'Your purchase of 0.25 BTC was completed',
      timestamp: '2026-02-15T10:30:00Z',
      read: false,
      assetId: 'btc'
    },
    {
      id: 'notif_2',
      type: 'price_alert',
      message: 'Bitcoin is up 5% in the last 24 hours',
      timestamp: '2026-02-14T08:00:00Z',
      read: true,
      assetId: 'btc'
    },
    {
      id: 'notif_3',
      type: 'security',
      message: 'New login detected from Chrome on macOS',
      timestamp: '2026-02-13T15:30:00Z',
      read: true,
      assetId: null
    }
  ],

  notificationPreferences: {
    trade_notifications: true,
    price_alerts: true,
    security_alerts: true
  },

  ui: {
    currentView: 'home',
    selectedAsset: null,
    searchQuery: '',
    tradeModal: { isOpen: false, mode: 'buy', assetId: null },
    sendReceiveModal: { isOpen: false, mode: 'send', assetId: null },
    sortBy: 'marketCap',
    sortDirection: 'desc',
    historyFilter: 'all'
  }
};
