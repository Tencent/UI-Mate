const BASE_STORAGE_KEY = 'tradingViewState';
const BASE_INITIAL_KEY = 'tradingViewInitialState';

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
  } catch (e) {
    console.log('No custom state available');
  }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

export function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  if (typeof custom !== 'object' || custom === null) return custom;
  if (Array.isArray(custom)) return custom;
  const result = { ...defaults };
  for (const key of Object.keys(custom)) {
    if (custom[key] === null || custom[key] === undefined) continue;
    if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
    } else {
      result[key] = custom[key];
    }
  }
  return result;
}

export function calculateStateDiff(initial, current) {
  const diff = {};
  function compare(obj1, obj2, path) {
    if (obj1 === obj2) return;
    if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null || typeof obj1 !== 'object') {
      diff[path] = { old: obj1, new: obj2 };
      return;
    }
    if (Array.isArray(obj1) || Array.isArray(obj2)) {
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        diff[path] = { old: obj1, new: obj2 };
      }
      return;
    }
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    for (const key of allKeys) {
      compare(obj1?.[key], obj2?.[key], path ? `${path}.${key}` : key);
    }
  }
  compare(initial, current, '');
  return diff;
}

// Candle data generation
function round2(n) { return Math.round(n * 100) / 100; }

function timeframeToSeconds(tf) {
  const map = { '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, 'D': 86400, 'W': 604800, 'M': 2592000 };
  return map[tf] || 86400;
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateCandles(basePrice, count, timeframe = 'D', seed = 42) {
  const candles = [];
  let price = basePrice;
  const volatility = basePrice * 0.015;
  const tfSec = timeframeToSeconds(timeframe);
  let time = Math.floor(Date.now() / 1000) - count * tfSec;
  const rand = seededRandom(seed);

  for (let i = 0; i < count; i++) {
    const change = (rand() - 0.48) * volatility;
    const open = round2(price);
    const close = round2(price + change);
    const high = round2(Math.max(open, close) + rand() * volatility * 0.5);
    const low = round2(Math.min(open, close) - rand() * volatility * 0.5);
    const baseVol = basePrice > 1000 ? 500000 : basePrice > 100 ? 30000000 : basePrice > 10 ? 100000000 : 5000000000;
    const volume = Math.floor(baseVol * (0.7 + rand() * 0.6));

    // Skip weekends for daily/weekly data on stocks
    const d = new Date(time * 1000);
    const dow = d.getUTCDay();
    if (timeframe === 'D' && (dow === 0 || dow === 6)) {
      time += tfSec;
      continue;
    }

    candles.push({ time, open, high, low, close, volume });
    price = close;
    time += tfSec;
  }
  return candles;
}

export function createInitialData() {
  const symbols = {
    AAPL: { id: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Technology', industry: 'Consumer Electronics', description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', price: 228.52, open: 226.80, high: 229.75, low: 225.90, close: 228.52, previousClose: 226.42, change: 2.10, changePercent: 0.93, volume: 54200000, marketCap: 3500000000000, pe: 37.2, eps: 6.14, dividend: 0.96, dividendYield: 0.42, week52High: 237.49, week52Low: 164.08, avgVolume: 48500000, beta: 1.24, weeklyPerf: 1.85, monthlyPerf: -2.10, threeMonthPerf: 5.40, sixMonthPerf: 12.80, ytdPerf: -8.20, yearlyPerf: 18.60, grossMargin: 46.2, operatingMargin: 31.5, debtToEquity: 1.87, roe: 175.0, rsi14: 52.3, recommendation: 'Buy' },
    MSFT: { id: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Technology', industry: 'Software', description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', price: 415.20, open: 412.50, high: 417.80, low: 411.20, close: 415.20, previousClose: 411.85, change: 3.35, changePercent: 0.81, volume: 22100000, marketCap: 3100000000000, pe: 35.4, eps: 11.73, dividend: 3.00, dividendYield: 0.72, week52High: 468.35, week52Low: 362.90, avgVolume: 20500000, beta: 0.90, weeklyPerf: 1.20, monthlyPerf: -4.80, threeMonthPerf: -8.50, sixMonthPerf: 5.20, ytdPerf: -12.40, yearlyPerf: 8.60, grossMargin: 70.1, operatingMargin: 45.2, debtToEquity: 0.43, roe: 39.2, rsi14: 45.8, recommendation: 'Buy' },
    GOOGL: { id: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Technology', industry: 'Internet Services', description: 'Alphabet Inc. provides online advertising services in the United States, Europe, and internationally.', price: 192.35, open: 190.80, high: 193.60, low: 189.90, close: 192.35, previousClose: 190.45, change: 1.90, changePercent: 1.00, volume: 18500000, marketCap: 2360000000000, pe: 24.2, eps: 7.95, dividend: 0, dividendYield: 0, week52High: 208.70, week52Low: 155.60, avgVolume: 21200000, beta: 1.05, weeklyPerf: 0.80, monthlyPerf: -3.20, threeMonthPerf: 2.10, sixMonthPerf: 8.50, ytdPerf: -6.80, yearlyPerf: 15.40, grossMargin: 58.2, operatingMargin: 31.5, debtToEquity: 0.07, roe: 30.5, rsi14: 48.2, recommendation: 'Buy' },
    AMZN: { id: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Internet Retail', description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores.', price: 225.40, open: 223.60, high: 226.80, low: 222.90, close: 225.40, previousClose: 223.25, change: 2.15, changePercent: 0.96, volume: 32800000, marketCap: 2340000000000, pe: 44.1, eps: 5.11, dividend: 0, dividendYield: 0, week52High: 242.52, week52Low: 151.61, avgVolume: 35400000, beta: 1.18, weeklyPerf: 2.40, monthlyPerf: -5.60, threeMonthPerf: -3.20, sixMonthPerf: 15.80, ytdPerf: -9.50, yearlyPerf: 32.80, grossMargin: 49.0, operatingMargin: 10.8, debtToEquity: 0.75, roe: 24.5, rsi14: 46.5, recommendation: 'Buy' },
    NVDA: { id: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Technology', industry: 'Semiconductors', description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, Hong Kong, and internationally.', price: 138.85, open: 136.90, high: 140.20, low: 135.80, close: 138.85, previousClose: 136.60, change: 2.25, changePercent: 1.65, volume: 382000000, marketCap: 3400000000000, pe: 55.2, eps: 2.51, dividend: 0.04, dividendYield: 0.03, week52High: 153.13, week52Low: 47.32, avgVolume: 320000000, beta: 1.72, weeklyPerf: 3.20, monthlyPerf: -12.50, threeMonthPerf: -18.40, sixMonthPerf: 42.80, ytdPerf: -18.20, yearlyPerf: 115.60, grossMargin: 74.6, operatingMargin: 64.9, debtToEquity: 0.42, roe: 121.0, rsi14: 42.8, recommendation: 'Strong Buy' },
    TSLA: { id: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', price: 350.25, open: 345.80, high: 354.90, low: 344.20, close: 350.25, previousClose: 345.10, change: 5.15, changePercent: 1.49, volume: 95800000, marketCap: 1130000000000, pe: 150.1, eps: 2.33, dividend: 0, dividendYield: 0, week52High: 488.54, week52Low: 138.80, avgVolume: 88200000, beta: 2.35, weeklyPerf: -8.20, monthlyPerf: -28.50, threeMonthPerf: 38.60, sixMonthPerf: 85.20, ytdPerf: -31.50, yearlyPerf: 42.80, grossMargin: 19.8, operatingMargin: 7.2, debtToEquity: 0.09, roe: 11.5, rsi14: 38.5, recommendation: 'Neutral' },
    META: { id: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'stock', currency: 'USD', sector: 'Technology', industry: 'Internet Content', description: 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share through mobile devices and computers.', price: 620.40, open: 616.20, high: 624.80, low: 614.50, close: 620.40, previousClose: 615.20, change: 5.20, changePercent: 0.85, volume: 14200000, marketCap: 1570000000000, pe: 28.4, eps: 21.83, dividend: 2.00, dividendYield: 0.32, week52High: 740.91, week52Low: 414.50, avgVolume: 16800000, beta: 1.26, weeklyPerf: -3.80, monthlyPerf: -10.20, threeMonthPerf: -12.50, sixMonthPerf: 20.40, ytdPerf: -15.80, yearlyPerf: 48.20, grossMargin: 81.8, operatingMargin: 42.8, debtToEquity: 0.27, roe: 35.2, rsi14: 42.1, recommendation: 'Buy' },
    'BRK.B': { id: 'BRK.B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Financials', industry: 'Insurance', description: 'Berkshire Hathaway Inc. engages in insurance, freight rail transportation, and utility businesses.', price: 470.15, open: 467.80, high: 472.60, low: 466.40, close: 470.15, previousClose: 468.25, change: 1.90, changePercent: 0.41, volume: 3200000, marketCap: 1080000000000, pe: 11.2, eps: 41.97, dividend: 0, dividendYield: 0, week52High: 489.18, week52Low: 357.60, avgVolume: 3500000, beta: 0.54, weeklyPerf: 1.20, monthlyPerf: 0.80, threeMonthPerf: 5.60, sixMonthPerf: 12.40, ytdPerf: 5.20, yearlyPerf: 22.10, grossMargin: 39.5, operatingMargin: 16.8, debtToEquity: 0.25, roe: 16.4, rsi14: 58.6, recommendation: 'Buy' },
    JPM: { id: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Financials', industry: 'Banks', description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.', price: 260.45, open: 258.20, high: 262.10, low: 257.40, close: 260.45, previousClose: 258.60, change: 1.85, changePercent: 0.72, volume: 8900000, marketCap: 750000000000, pe: 13.2, eps: 19.73, dividend: 5.00, dividendYield: 1.92, week52High: 280.25, week52Low: 183.52, avgVolume: 9200000, beta: 1.14, weeklyPerf: 0.90, monthlyPerf: -2.40, threeMonthPerf: 4.80, sixMonthPerf: 18.60, ytdPerf: -2.80, yearlyPerf: 32.50, grossMargin: 0, operatingMargin: 40.2, debtToEquity: 1.58, roe: 18.5, rsi14: 52.4, recommendation: 'Buy' },
    V: { id: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Financials', industry: 'Financial Services', description: 'Visa Inc. operates as a payments technology company worldwide.', price: 340.80, open: 338.50, high: 342.60, low: 337.20, close: 340.80, previousClose: 338.90, change: 1.90, changePercent: 0.56, volume: 6800000, marketCap: 690000000000, pe: 34.2, eps: 9.96, dividend: 2.36, dividendYield: 0.69, week52High: 365.60, week52Low: 267.04, avgVolume: 7100000, beta: 0.97, weeklyPerf: 0.50, monthlyPerf: -1.80, threeMonthPerf: 3.20, sixMonthPerf: 10.60, ytdPerf: -2.50, yearlyPerf: 18.40, grossMargin: 80.5, operatingMargin: 68.2, debtToEquity: 1.75, roe: 49.8, rsi14: 51.2, recommendation: 'Buy' },
    JNJ: { id: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Healthcare', industry: 'Pharmaceuticals', description: 'Johnson & Johnson researches, develops, manufactures, and sells various products in the healthcare field worldwide.', price: 153.20, open: 152.40, high: 154.10, low: 151.80, close: 153.20, previousClose: 152.50, change: 0.70, changePercent: 0.46, volume: 6200000, marketCap: 370000000000, pe: 21.4, eps: 7.16, dividend: 4.96, dividendYield: 3.24, week52High: 168.85, week52Low: 143.13, avgVolume: 6800000, beta: 0.55, weeklyPerf: -0.50, monthlyPerf: -0.80, threeMonthPerf: 1.20, sixMonthPerf: 3.80, ytdPerf: -3.50, yearlyPerf: 2.80, grossMargin: 69.5, operatingMargin: 24.8, debtToEquity: 0.46, roe: 22.8, rsi14: 47.5, recommendation: 'Neutral' },
    WMT: { id: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Consumer Defensive', industry: 'Discount Stores', description: 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide.', price: 95.40, open: 94.80, high: 96.10, low: 94.20, close: 95.40, previousClose: 94.85, change: 0.55, changePercent: 0.58, volume: 21500000, marketCap: 640000000000, pe: 38.2, eps: 2.50, dividend: 0.83, dividendYield: 0.87, week52High: 105.30, week52Low: 59.68, avgVolume: 22200000, beta: 0.52, weeklyPerf: 0.30, monthlyPerf: -4.20, threeMonthPerf: 1.80, sixMonthPerf: 8.40, ytdPerf: -8.60, yearlyPerf: 48.20, grossMargin: 24.8, operatingMargin: 4.5, debtToEquity: 0.68, roe: 22.4, rsi14: 44.8, recommendation: 'Buy' },
    PG: { id: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Consumer Defensive', industry: 'Household Products', description: 'The Procter & Gamble Company provides branded consumer packaged goods worldwide.', price: 165.30, open: 164.60, high: 166.20, low: 163.90, close: 165.30, previousClose: 164.45, change: 0.85, changePercent: 0.52, volume: 5800000, marketCap: 390000000000, pe: 28.4, eps: 5.82, dividend: 4.03, dividendYield: 2.44, week52High: 180.24, week52Low: 155.35, avgVolume: 6100000, beta: 0.42, weeklyPerf: 0.20, monthlyPerf: 1.20, threeMonthPerf: -2.40, sixMonthPerf: 2.80, ytdPerf: -1.80, yearlyPerf: 6.50, grossMargin: 52.1, operatingMargin: 23.4, debtToEquity: 0.78, roe: 31.5, rsi14: 52.8, recommendation: 'Neutral' },
    HD: { id: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Consumer Cyclical', industry: 'Home Improvement', description: 'The Home Depot, Inc. operates as a home improvement retailer in the United States and internationally.', price: 400.25, open: 397.80, high: 402.60, low: 396.40, close: 400.25, previousClose: 397.50, change: 2.75, changePercent: 0.69, volume: 3800000, marketCap: 400000000000, pe: 27.2, eps: 14.72, dividend: 9.00, dividendYield: 2.25, week52High: 439.37, week52Low: 325.26, avgVolume: 4100000, beta: 1.06, weeklyPerf: 1.00, monthlyPerf: -3.20, threeMonthPerf: 1.40, sixMonthPerf: 8.80, ytdPerf: -5.80, yearlyPerf: 12.40, grossMargin: 33.8, operatingMargin: 15.1, debtToEquity: 44.8, roe: 1580.0, rsi14: 48.2, recommendation: 'Buy' },
    DIS: { id: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', type: 'stock', currency: 'USD', sector: 'Communication Services', industry: 'Entertainment', description: 'The Walt Disney Company operates as an entertainment company worldwide.', price: 110.85, open: 110.10, high: 111.60, low: 109.50, close: 110.85, previousClose: 110.20, change: 0.65, changePercent: 0.59, volume: 9200000, marketCap: 200000000000, pe: 37.8, eps: 2.93, dividend: 0.40, dividendYield: 0.36, week52High: 123.74, week52Low: 83.91, avgVolume: 10500000, beta: 1.38, weeklyPerf: -1.20, monthlyPerf: -4.50, threeMonthPerf: -5.20, sixMonthPerf: 5.80, ytdPerf: -12.40, yearlyPerf: 8.20, grossMargin: 36.4, operatingMargin: 11.2, debtToEquity: 0.48, roe: 5.8, rsi14: 42.5, recommendation: 'Neutral' },
    BTCUSD: { id: 'BTCUSD', name: 'Bitcoin / USD', exchange: 'Crypto', type: 'crypto', currency: 'USD', sector: null, industry: null, description: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator.', price: 85000.00, open: 84200.00, high: 86500.00, low: 83800.00, close: 85000.00, previousClose: 84100.00, change: 900.00, changePercent: 1.07, volume: 28500000000, marketCap: 1680000000000, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 109350.00, week52Low: 51500.00, avgVolume: 25000000000, beta: null, weeklyPerf: -5.20, monthlyPerf: -18.50, threeMonthPerf: -12.40, sixMonthPerf: 42.80, ytdPerf: -18.80, yearlyPerf: 62.50, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 40.5, recommendation: 'Buy' },
    ETHUSD: { id: 'ETHUSD', name: 'Ethereum / USD', exchange: 'Crypto', type: 'crypto', currency: 'USD', sector: null, industry: null, description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.', price: 2100.00, open: 2075.00, high: 2135.00, low: 2060.00, close: 2100.00, previousClose: 2080.00, change: 20.00, changePercent: 0.96, volume: 14200000000, marketCap: 252000000000, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 4109.00, week52Low: 2184.00, avgVolume: 12800000000, beta: null, weeklyPerf: -8.40, monthlyPerf: -28.60, threeMonthPerf: -35.20, sixMonthPerf: 15.40, ytdPerf: -38.50, yearlyPerf: -18.50, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 35.2, recommendation: 'Neutral' },
    SOLUSD: { id: 'SOLUSD', name: 'Solana / USD', exchange: 'Crypto', type: 'crypto', currency: 'USD', sector: null, industry: null, description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps.', price: 135.20, open: 133.50, high: 137.80, low: 132.40, close: 135.20, previousClose: 133.10, change: 2.10, changePercent: 1.58, volume: 3800000000, marketCap: 66000000000, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 295.83, week52Low: 96.00, avgVolume: 3200000000, beta: null, weeklyPerf: -10.20, monthlyPerf: -32.40, threeMonthPerf: -45.80, sixMonthPerf: 25.60, ytdPerf: -42.50, yearlyPerf: 32.80, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 32.8, recommendation: 'Neutral' },
    BNBUSD: { id: 'BNBUSD', name: 'BNB / USD', exchange: 'Crypto', type: 'crypto', currency: 'USD', sector: null, industry: null, description: 'BNB is the cryptocurrency coin that powers the BNB Chain ecosystem.', price: 590.00, open: 585.50, high: 596.20, low: 582.80, close: 590.00, previousClose: 585.20, change: 4.80, changePercent: 0.82, volume: 1200000000, marketCap: 86000000000, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 793.35, week52Low: 492.00, avgVolume: 1050000000, beta: null, weeklyPerf: -4.80, monthlyPerf: -14.20, threeMonthPerf: -18.60, sixMonthPerf: 28.40, ytdPerf: -16.80, yearlyPerf: 28.50, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 38.5, recommendation: 'Neutral' },
    EURUSD: { id: 'EURUSD', name: 'EUR / USD', exchange: 'Forex', type: 'forex', currency: 'USD', sector: null, industry: null, description: 'The Euro to US Dollar exchange rate.', price: 1.0890, open: 1.0872, high: 1.0912, low: 1.0855, close: 1.0890, previousClose: 1.0868, change: 0.0022, changePercent: 0.20, volume: 0, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 1.1275, week52Low: 1.0170, avgVolume: 0, beta: null, weeklyPerf: 1.85, monthlyPerf: 3.60, threeMonthPerf: 5.20, sixMonthPerf: -1.80, ytdPerf: 4.20, yearlyPerf: 2.40, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 62.5, recommendation: 'Neutral' },
    GBPUSD: { id: 'GBPUSD', name: 'GBP / USD', exchange: 'Forex', type: 'forex', currency: 'USD', sector: null, industry: null, description: 'The British Pound to US Dollar exchange rate.', price: 1.2950, open: 1.2928, high: 1.2975, low: 1.2910, close: 1.2950, previousClose: 1.2924, change: 0.0026, changePercent: 0.20, volume: 0, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 1.3434, week52Low: 1.2297, avgVolume: 0, beta: null, weeklyPerf: 1.20, monthlyPerf: 2.40, threeMonthPerf: 2.80, sixMonthPerf: -0.80, ytdPerf: 2.50, yearlyPerf: 1.80, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 58.4, recommendation: 'Neutral' },
    USDJPY: { id: 'USDJPY', name: 'USD / JPY', exchange: 'Forex', type: 'forex', currency: 'JPY', sector: null, industry: null, description: 'The US Dollar to Japanese Yen exchange rate.', price: 148.80, open: 149.20, high: 149.65, low: 148.40, close: 148.80, previousClose: 149.35, change: -0.55, changePercent: -0.37, volume: 0, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 161.95, week52Low: 141.69, avgVolume: 0, beta: null, weeklyPerf: -0.85, monthlyPerf: -2.20, threeMonthPerf: -4.50, sixMonthPerf: -2.80, ytdPerf: -5.20, yearlyPerf: -3.80, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 38.2, recommendation: 'Neutral' },
    AUDUSD: { id: 'AUDUSD', name: 'AUD / USD', exchange: 'Forex', type: 'forex', currency: 'USD', sector: null, industry: null, description: 'The Australian Dollar to US Dollar exchange rate.', price: 0.6310, open: 0.6295, high: 0.6328, low: 0.6280, close: 0.6310, previousClose: 0.6292, change: 0.0018, changePercent: 0.29, volume: 0, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 0.6942, week52Low: 0.6170, avgVolume: 0, beta: null, weeklyPerf: -0.80, monthlyPerf: -2.40, threeMonthPerf: -4.80, sixMonthPerf: -5.20, ytdPerf: -5.60, yearlyPerf: -6.80, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 38.8, recommendation: 'Neutral' },
    SPX: { id: 'SPX', name: 'S&P 500', exchange: 'INDEX', type: 'index', currency: 'USD', sector: null, industry: null, description: 'The Standard and Poor\'s 500 is a stock market index tracking the stock performance of 500 of the largest companies listed on stock exchanges in the United States.', price: 5770.20, open: 5748.50, high: 5785.40, low: 5740.80, close: 5770.20, previousClose: 5748.10, change: 22.10, changePercent: 0.38, volume: 0, marketCap: null, pe: 25.6, eps: null, dividend: null, dividendYield: 1.42, week52High: 6147.43, week52Low: 4835.04, avgVolume: 0, beta: 1.0, weeklyPerf: -2.20, monthlyPerf: -6.80, threeMonthPerf: -4.50, sixMonthPerf: 5.20, ytdPerf: -7.60, yearlyPerf: 12.80, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 40.2, recommendation: 'Neutral' },
    DJI: { id: 'DJI', name: 'Dow Jones Industrial', exchange: 'INDEX', type: 'index', currency: 'USD', sector: null, industry: null, description: 'The Dow Jones Industrial Average is a stock market index that measures the stock performance of 30 large companies listed on stock exchanges in the United States.', price: 42500.50, open: 42350.00, high: 42680.00, low: 42280.00, close: 42500.50, previousClose: 42340.20, change: 160.30, changePercent: 0.38, volume: 0, marketCap: null, pe: 27.1, eps: null, dividend: null, dividendYield: 1.68, week52High: 45073.63, week52Low: 37122.95, avgVolume: 0, beta: 1.0, weeklyPerf: -1.80, monthlyPerf: -5.20, threeMonthPerf: -3.80, sixMonthPerf: 4.80, ytdPerf: -5.50, yearlyPerf: 10.20, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 41.8, recommendation: 'Neutral' },
    IXIC: { id: 'IXIC', name: 'NASDAQ Composite', exchange: 'INDEX', type: 'index', currency: 'USD', sector: null, industry: null, description: 'The NASDAQ Composite is a stock market index that includes almost all stocks listed on the Nasdaq stock exchange.', price: 18300.80, open: 18180.00, high: 18380.00, low: 18120.00, close: 18300.80, previousClose: 18165.50, change: 135.30, changePercent: 0.75, volume: 0, marketCap: null, pe: 36.4, eps: null, dividend: null, dividendYield: 0.78, week52High: 20204.58, week52Low: 15852.66, avgVolume: 0, beta: 1.0, weeklyPerf: -3.40, monthlyPerf: -9.80, threeMonthPerf: -8.20, sixMonthPerf: 4.50, ytdPerf: -11.20, yearlyPerf: 8.60, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 38.8, recommendation: 'Neutral' },
    'GC1!': { id: 'GC1!', name: 'Gold Futures', exchange: 'COMEX', type: 'futures', currency: 'USD', sector: null, industry: null, description: 'Gold Futures - COMEX', price: 2910.50, open: 2895.80, high: 2925.40, low: 2888.20, close: 2910.50, previousClose: 2892.80, change: 17.70, changePercent: 0.61, volume: 185000, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 2956.40, week52Low: 2148.50, avgVolume: 175000, beta: null, weeklyPerf: 1.85, monthlyPerf: 5.20, threeMonthPerf: 10.80, sixMonthPerf: 18.50, ytdPerf: 12.80, yearlyPerf: 38.60, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 68.5, recommendation: 'Buy' },
    'CL1!': { id: 'CL1!', name: 'Crude Oil Futures', exchange: 'NYMEX', type: 'futures', currency: 'USD', sector: null, industry: null, description: 'Crude Oil WTI Futures - NYMEX', price: 67.40, open: 67.80, high: 68.50, low: 66.90, close: 67.40, previousClose: 67.95, change: -0.55, changePercent: -0.81, volume: 320000, marketCap: null, pe: null, eps: null, dividend: null, dividendYield: null, week52High: 84.52, week52Low: 64.75, avgVolume: 295000, beta: null, weeklyPerf: -2.80, monthlyPerf: -5.40, threeMonthPerf: -9.80, sixMonthPerf: -12.20, ytdPerf: -9.50, yearlyPerf: -18.60, grossMargin: null, operatingMargin: null, debtToEquity: null, roe: null, rsi14: 36.5, recommendation: 'Neutral' },
  };

  // Generate candle data for key symbols
  const candleData = {};
  const symbolSeeds = { AAPL: 42, MSFT: 101, GOOGL: 202, AMZN: 303, NVDA: 404, TSLA: 505, META: 606, BTCUSD: 707, ETHUSD: 808, SOLUSD: 909, EURUSD: 1010, GBPUSD: 1111, USDJPY: 1212, SPX: 1313, DJI: 1414 };

  for (const [sym, info] of Object.entries(symbols)) {
    const seed = symbolSeeds[sym] || sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    candleData[sym] = {
      D: generateCandles(info.price * 0.85, 300, 'D', seed),
    };
  }
  // Extra hourly data for AAPL
  candleData.AAPL['60'] = generateCandles(symbols.AAPL.price * 0.97, 500, '60', 4242);

  return {
    currentUser: {
      id: 'user_1',
      username: 'TraderJohn',
      displayName: 'John Mitchell',
      avatar: null,
      email: 'john.mitchell@email.com',
      plan: 'Premium',
      joinDate: '2021-03-15',
      preferences: {
        theme: 'dark',
        timezone: 'America/New_York',
        defaultChartType: 'Candles',
        defaultTimeframe: 'D',
        showVolume: true,
        logScale: false,
        autoScale: true,
        crosshairStyle: 'cross'
      }
    },
    symbols,
    candleData,
    watchlists: [
      {
        id: 'wl_1', name: 'My Watchlist', isDefault: true,
        sections: [
          { id: 'sec_1', name: null, symbolIds: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'] },
          { id: 'sec_2', name: 'Crypto', symbolIds: ['BTCUSD', 'ETHUSD', 'SOLUSD'] },
          { id: 'sec_3', name: 'Forex', symbolIds: ['EURUSD', 'GBPUSD', 'USDJPY'] },
        ],
        columns: ['last', 'chg', 'chgPercent']
      },
      {
        id: 'wl_2', name: 'Tech Watchlist', isDefault: false,
        sections: [
          { id: 'sec_4', name: null, symbolIds: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'] }
        ],
        columns: ['last', 'chg', 'chgPercent']
      }
    ],
    alerts: [
      { id: 'alert_1', symbolId: 'AAPL', name: 'AAPL above 240', condition: 'crossing_up', value: 240.00, value2: null, source: 'price', status: 'active', createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), triggeredAt: null, expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(), message: 'AAPL reached $240!', notifications: { popup: true, email: true, sound: true, webhook: false }, frequency: 'once' },
      { id: 'alert_2', symbolId: 'BTCUSD', name: 'BTC below 80000', condition: 'crossing_down', value: 80000, value2: null, source: 'price', status: 'active', createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), triggeredAt: null, expiresAt: new Date(Date.now() + 70 * 86400000).toISOString(), message: 'Bitcoin dropped below $80K', notifications: { popup: true, email: true, sound: true, webhook: false }, frequency: 'once' },
      { id: 'alert_3', symbolId: 'TSLA', name: 'TSLA reached 488', condition: 'crossing_up', value: 488.00, value2: null, source: 'price', status: 'triggered', createdAt: new Date(Date.now() - 65 * 86400000).toISOString(), triggeredAt: new Date(Date.now() - 50 * 86400000).toISOString(), expiresAt: new Date(Date.now() + 25 * 86400000).toISOString(), message: 'Tesla crossed $488!', notifications: { popup: true, email: false, sound: true, webhook: false }, frequency: 'once' },
      { id: 'alert_4', symbolId: 'NVDA', name: 'NVDA above 150', condition: 'crossing_up', value: 150.00, value2: null, source: 'price', status: 'active', createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), triggeredAt: null, expiresAt: new Date(Date.now() + 95 * 86400000).toISOString(), message: 'NVIDIA broke $150', notifications: { popup: true, email: true, sound: false, webhook: true }, frequency: 'once' },
      { id: 'alert_5', symbolId: 'EURUSD', name: 'EUR/USD above 1.10', condition: 'crossing_up', value: 1.10, value2: null, source: 'price', status: 'paused', createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), triggeredAt: null, expiresAt: new Date(Date.now() + 50 * 86400000).toISOString(), message: 'EUR/USD broke above 1.10', notifications: { popup: true, email: false, sound: false, webhook: false }, frequency: 'once' },
    ],
    indicators: [
      { id: 'ind_1', type: 'SMA', name: 'SMA (20)', visible: true, paneIndex: 0, inputs: { length: 20, source: 'close' }, style: { color: '#2962FF', lineWidth: 2, lineStyle: 'solid' } },
      { id: 'ind_2', type: 'EMA', name: 'EMA (50)', visible: true, paneIndex: 0, inputs: { length: 50, source: 'close' }, style: { color: '#FF6D00', lineWidth: 2, lineStyle: 'solid' } },
      { id: 'ind_3', type: 'VOL', name: 'Volume', visible: true, paneIndex: 1, inputs: {}, style: { color: '#26A69A', lineWidth: 1, lineStyle: 'solid' } },
    ],
    drawings: [
      { id: 'draw_1', symbolId: 'AAPL', timeframe: 'D', type: 'horizontal_line', points: [{ time: null, price: 235.00 }], style: { color: '#EF5350', lineWidth: 1, lineStyle: 'dashed', fillColor: null, extendLeft: false, extendRight: false, showLabel: true }, text: 'Resistance', locked: false, visible: true },
      { id: 'draw_2', symbolId: 'AAPL', timeframe: 'D', type: 'trendline', points: [{ time: 1735862400, price: 210.50 }, { time: 1738540800, price: 228.52 }], style: { color: '#26A69A', lineWidth: 2, lineStyle: 'solid', fillColor: null, extendLeft: false, extendRight: false, showLabel: true }, text: null, locked: false, visible: true },
    ],
    chartState: {
      symbolId: 'AAPL',
      timeframe: 'D',
      chartType: 'Candles',
      indicators: ['ind_1', 'ind_2', 'ind_3'],
      drawings: ['draw_1', 'draw_2'],
      priceScaleMode: 'auto',
      logScale: false,
      visibleRange: null,
    },
    layouts: [
      { id: 'layout_1', name: 'Default', isDefault: true, gridConfig: '1x1', charts: [{ symbolId: 'AAPL', timeframe: 'D', chartType: 'Candles' }], createdAt: '2024-06-01T00:00:00Z', updatedAt: '2025-03-10T10:00:00Z' }
    ],
    screenerSymbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'HD', 'DIS'],
    news: [
      { id: 'news_1', title: 'Apple Reports Strong Q1 2025 Earnings, iPhone 16 Demand Beats Expectations', source: 'Reuters', timestamp: '2025-03-10T14:30:00Z', relatedSymbols: ['AAPL'], category: 'earnings' },
      { id: 'news_2', title: 'Fed Signals Caution on Rate Cuts Amid Sticky Inflation Data', source: 'Bloomberg', timestamp: '2025-03-10T19:00:00Z', relatedSymbols: ['SPX', 'DJI'], category: 'economy' },
      { id: 'news_3', title: 'Bitcoin Retreats from $90K as Profit-Taking Accelerates', source: 'CoinDesk', timestamp: '2025-03-10T08:45:00Z', relatedSymbols: ['BTCUSD'], category: 'crypto' },
      { id: 'news_4', title: 'NVIDIA Blackwell Chips See Record Enterprise Adoption in Q1', source: 'CNBC', timestamp: '2025-03-09T16:00:00Z', relatedSymbols: ['NVDA'], category: 'market' },
      { id: 'news_5', title: 'Tesla Faces Renewed Competition as BYD Reports Record Sales', source: 'MarketWatch', timestamp: '2025-03-09T12:15:00Z', relatedSymbols: ['TSLA'], category: 'market' },
      { id: 'news_6', title: 'EUR/USD Climbs to 3-Month Highs as US Dollar Weakens', source: 'FXStreet', timestamp: '2025-03-09T09:30:00Z', relatedSymbols: ['EURUSD'], category: 'forex' },
      { id: 'news_7', title: 'Amazon Expands AI Data Center Investment by $100B in 2025', source: 'TechCrunch', timestamp: '2025-03-08T15:00:00Z', relatedSymbols: ['AMZN'], category: 'market' },
      { id: 'news_8', title: 'Gold Surges to Near-Record High on Safe-Haven Demand', source: 'Reuters', timestamp: '2025-03-08T11:20:00Z', relatedSymbols: ['GC1!'], category: 'market' },
      { id: 'news_9', title: 'Microsoft Copilot+ PC Sales Drive Strong Azure Growth', source: 'Bloomberg', timestamp: '2025-03-08T08:00:00Z', relatedSymbols: ['MSFT'], category: 'market' },
      { id: 'news_10', title: 'Solana Ecosystem Faces Pressure as Meme Coin Hype Fades', source: 'CoinDesk', timestamp: '2025-03-07T14:45:00Z', relatedSymbols: ['SOLUSD'], category: 'crypto' },
      { id: 'news_11', title: 'S&P 500 Enters Correction Territory Amid Tariff Uncertainty', source: 'CNBC', timestamp: '2025-03-07T10:30:00Z', relatedSymbols: ['SPX', 'JPM'], category: 'analysis' },
      { id: 'news_12', title: 'Oil Prices Drop as OPEC+ Signals Output Increase for Q2', source: 'MarketWatch', timestamp: '2025-03-07T07:15:00Z', relatedSymbols: ['CL1!'], category: 'market' },
    ],
    economicEvents: (() => {
      const now = new Date();
      const isoDate = (daysFromNow) => {
        const d = new Date(now.getTime() + daysFromNow * 86400000);
        return d.toISOString().substring(0, 10);
      };
      return [
        { id: 'econ_1', date: isoDate(1), time: '08:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'CPI (YoY)', impact: 'high', forecast: '2.8%', previous: '3.0%', actual: null },
        { id: 'econ_2', date: isoDate(1), time: '08:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Core CPI (MoM)', impact: 'high', forecast: '0.3%', previous: '0.4%', actual: null },
        { id: 'econ_3', date: isoDate(3), time: '10:00', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'NAHB Housing Market Index', impact: 'medium', forecast: '42', previous: '42', actual: null },
        { id: 'econ_4', date: isoDate(5), time: '14:00', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Fed Interest Rate Decision', impact: 'high', forecast: '4.25-4.50%', previous: '4.25-4.50%', actual: null },
        { id: 'econ_5', date: isoDate(5), time: '14:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'FOMC Press Conference', impact: 'high', forecast: null, previous: null, actual: null },
        { id: 'econ_6', date: isoDate(7), time: '08:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Initial Jobless Claims', impact: 'medium', forecast: '225K', previous: '221K', actual: null },
        { id: 'econ_7', date: isoDate(7), time: '07:00', country: 'GB', countryFlag: '\u{1F1EC}\u{1F1E7}', event: 'BoE Interest Rate Decision', impact: 'high', forecast: '4.50%', previous: '4.50%', actual: null },
        { id: 'econ_8', date: isoDate(12), time: '10:00', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Consumer Confidence', impact: 'medium', forecast: '98.5', previous: '98.3', actual: null },
        { id: 'econ_9', date: isoDate(15), time: '08:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Core PCE Price Index (MoM)', impact: 'high', forecast: '0.3%', previous: '0.3%', actual: null },
        { id: 'econ_10', date: isoDate(20), time: '08:30', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', event: 'Non-Farm Payrolls', impact: 'high', forecast: '160K', previous: '151K', actual: null },
      ];
    })(),
    uiState: {
      activeRightPanel: 'watchlist',
      activeBottomPanel: null,
      bottomPanelHeight: 200,
      rightPanelWidth: 320,
      selectedDrawingTool: null,
      cursorMode: 'crosshair',
      notes: '',
      pineScript: null,
      pineScriptMode: 'indicator',
      favoriteIndicators: [],
      screenerFilter: {
        tab: 'overview',
        sortBy: 'marketCap',
        sortDir: 'desc',
        filters: {}
      }
    }
  };
}
