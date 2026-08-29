// Utility functions for Xeibo Mock

/**
 * Format relative time in Chinese
 */
export function formatRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay === 1) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diffDay < 7) return `${diffDay}天前`;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * Format large numbers (e.g., 1234567 -> "123万")
 */
export function formatCount(num) {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
  if (num >= 10000) return `${(num / 10000).toFixed(0)}万`;
  return num.toString();
}

/**
 * Parse post text and render @mentions and #topics# as links
 */
export function parsePostText(text) {
  if (!text) return [];
  const parts = [];
  const regex = /(@[\w\u4e00-\u9fff]+)|(#[^#]+#)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      parts.push({ type: 'mention', content: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'topic', content: match[2] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

/**
 * Get verification badge component info
 */
export function getVerifiedBadgeClass(verifiedType) {
  switch (verifiedType) {
    case 'blue_v': return 'badge-blue-v';
    case 'orange_v': return 'badge-orange-v';
    case 'gold_v': return 'badge-gold-v';
    default: return null;
  }
}

/**
 * Get hot search badge
 */
export function getHotBadgeClass(badge) {
  switch (badge) {
    case 'boil': return 'hot-badge-boil';
    case 'hot': return 'hot-badge-hot';
    case 'new': return 'hot-badge-new';
    case 'recommend': return 'hot-badge-recommend';
    default: return null;
  }
}

export function getHotBadgeText(badge) {
  switch (badge) {
    case 'boil': return '沸';
    case 'hot': return '热';
    case 'new': return '新';
    case 'recommend': return '荐';
    default: return '';
  }
}
