import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value) {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K';
  }
  return value.toLocaleString();
}

export function generateHistoricalData(basePrice, points = 100, volatility = 0.02) {
  let currentPrice = basePrice;
  const data = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily points
    const change = currentPrice * (Math.random() * volatility - (volatility / 2));
    currentPrice += change;
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  return data;
}

// Generate intraday data for 1D chart: hourly points for the current trading day (9:30 AM - 4:00 PM ET)
export function generateIntradayData(currentPrice, volatility = 0.005) {
  const data = [];
  const now = new Date();
  // Start from 9:30 AM of today (local time proxy)
  const todayOpen = new Date(now);
  todayOpen.setHours(9, 30, 0, 0);

  // If current time is before 9:30, use yesterday
  if (now < todayOpen) {
    todayOpen.setDate(todayOpen.getDate() - 1);
  }

  // Generate a point every 30 minutes from open until now (or 4:00 PM close)
  const marketClose = new Date(todayOpen);
  marketClose.setHours(16, 0, 0, 0);
  const endTime = now < marketClose ? now : marketClose;

  // Work backwards from current price to derive earlier prices
  const intervalMs = 30 * 60 * 1000; // 30 minutes
  const totalIntervals = Math.max(1, Math.floor((endTime - todayOpen) / intervalMs));

  // Build prices forward from an estimated open price
  let price = currentPrice;
  const prices = [price];
  for (let i = 0; i < totalIntervals; i++) {
    const change = price * (Math.random() * volatility - volatility / 2);
    price = Math.max(0.01, price - change);
    prices.unshift(price);
  }
  // Rescale so last price == currentPrice
  const scale = currentPrice / prices[prices.length - 1];
  const scaledPrices = prices.map(p => parseFloat((p * scale).toFixed(2)));

  for (let i = 0; i <= totalIntervals; i++) {
    const time = new Date(todayOpen.getTime() + i * intervalMs);
    const hours = time.getHours();
    const mins = time.getMinutes();
    const label = `${hours % 12 || 12}:${mins.toString().padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
    data.push({
      date: label,
      price: scaledPrices[i],
      volume: Math.floor(Math.random() * 2000000) + 500000
    });
  }

  return data;
}
