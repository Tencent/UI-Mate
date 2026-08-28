/**
 * Format a timestamp as relative time in Chinese
 */
export function relativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  if (months < 12) return `${months}个月前`;
  return `${years}年前`;
}

/**
 * Format large numbers with K/W suffix
 */
export function formatCount(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * Render content text with hashtags and mentions as markup metadata
 * Returns array of { type: 'text'|'hashtag'|'mention', value: string }
 */
export function parseContentSegments(text) {
  if (!text) return [];
  const segments = [];
  const regex = /(#[\u4e00-\u9fa5\w]+)|(@[\u4e00-\u9fa5\w]+)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith('#')) {
      segments.push({ type: 'hashtag', value: match[0].slice(1) });
    } else {
      segments.push({ type: 'mention', value: match[0].slice(1) });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return segments;
}

/**
 * Generate a note image URL using picsum with seed
 */
export function noteImageUrl(noteId, idx = 0, width = 600, height = 800) {
  return `https://picsum.photos/seed/${noteId}_${idx}/${width}/${height}`;
}

/**
 * Get the cover image of a note
 */
export function getNoteCover(note) {
  if (note.images && note.images.length > 0) return note.images[0];
  return `https://picsum.photos/seed/${note.id}_cover/600/800`;
}

/**
 * Extract hashtags from content string
 */
export function extractHashtags(content) {
  const matches = content.match(/#[\u4e00-\u9fa5\w]+/g) || [];
  return matches.map(h => h.slice(1));
}
