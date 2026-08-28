export function relativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function shortSha(sha) {
  if (!sha) return '';
  return sha.slice(0, 7);
}

export function truncate(str, max = 60) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

export function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function statusBadgeClass(status) {
  switch (status?.toUpperCase()) {
    case 'READY': return 'badge-ready';
    case 'BUILDING': return 'badge-building';
    case 'QUEUED': return 'badge-queued';
    case 'ERROR': return 'badge-error';
    case 'CANCELED': return 'badge-canceled';
    default: return 'badge-canceled';
  }
}

export function statusDotClass(status) {
  switch (status?.toUpperCase()) {
    case 'READY': return 'status-dot-ready';
    case 'BUILDING': return 'status-dot-building';
    case 'QUEUED': return 'status-dot-queued';
    case 'ERROR': return 'status-dot-error';
    case 'CANCELED': return 'status-dot-canceled';
    default: return 'status-dot-canceled';
  }
}

export function statusBarClass(status) {
  switch (status?.toUpperCase()) {
    case 'READY': return 'deployment-status-bar-ready';
    case 'BUILDING': return 'deployment-status-bar-building';
    case 'QUEUED': return 'deployment-status-bar-queued';
    case 'ERROR': return 'deployment-status-bar-error';
    case 'CANCELED': return 'deployment-status-bar-canceled';
    default: return 'deployment-status-bar-canceled';
  }
}

export function logLineClass(text) {
  const t = text?.toLowerCase() || '';
  if (t.includes('error') || t.includes('failed')) return 'log-text-error';
  if (t.includes('warn')) return 'log-text-warn';
  if (t.includes('ready') || t.includes('success') || t.includes('completed')) return 'log-text-success';
  return 'log-text';
}

export function frameworkLabel(framework) {
  const map = {
    nextjs: 'Next.js',
    vite: 'Vite',
    remix: 'Remix',
    astro: 'Astro',
    nuxt: 'Nuxt',
    sveltekit: 'SvelteKit',
    gatsby: 'Gatsby',
    static: 'Static',
  };
  return map[framework] || framework || 'Other';
}

export function groupEventsByDate(events) {
  const groups = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const evt of events) {
    const d = new Date(evt.createdAt);
    let label;
    if (d.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(evt);
  }
  return groups;
}

export function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
