
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount === undefined || amount === null) return '$0.00';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch (e) {
    return `$${amount}`;
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
  