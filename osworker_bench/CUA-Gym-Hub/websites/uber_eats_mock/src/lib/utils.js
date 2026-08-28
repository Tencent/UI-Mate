let _idCounter = 1;
export function generateId(prefix = 'id') {
  _idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${_idCounter.toString(36)}`;
}

export function formatCurrency(amount, currency = 'USD') {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
  } catch (e) {
    return `$${n.toFixed(2)}`;
  }
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}
