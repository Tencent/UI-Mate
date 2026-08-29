let _idCounter = 1;
export function generateId(prefix = 'id') {
  _idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${_idCounter.toString(36)}`;
}

const PALETTE = ['7c3aed', '2563eb', '0891b2', '059669', 'd97706', 'dc2626', 'db2777', '4338ca'];
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
export function getAvatarUrl(seed) {
  const s = String(seed || 'anon');
  const color = PALETTE[hashStr(s) % PALETTE.length];
  const initial = encodeURIComponent(s.charAt(0).toUpperCase() || '?');
  return `https://placehold.co/64x64/${color}/ffffff/png?text=${initial}`;
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - new Date(ts).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
