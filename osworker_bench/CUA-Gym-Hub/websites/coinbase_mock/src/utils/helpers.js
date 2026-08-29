export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatCryptoAmount(amount, symbol) {
  let decimals;
  if (amount >= 1000) decimals = 0;
  else if (amount >= 1) decimals = 4;
  else decimals = 8;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: decimals })} ${symbol}`;
}

export function formatLargeNumber(num) {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(0)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num}`;
}

export function formatPercentage(pct) {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(timestamp);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}`;
}

export function calculatePortfolioValue(holdings, assets) {
  return holdings.reduce((total, holding) => {
    const asset = assets.find(a => a.id === holding.assetId);
    if (!asset) return total;
    return total + holding.quantity * asset.currentPrice;
  }, 0);
}

export function calculateGainLoss(holding, asset) {
  const currentValue = holding.quantity * asset.currentPrice;
  const costBasis = holding.quantity * holding.avgBuyPrice;
  const amount = currentValue - costBasis;
  const percentage = costBasis > 0 ? (amount / costBasis) * 100 : 0;
  return { amount, percentage };
}
