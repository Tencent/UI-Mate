// Utility helpers for Xentry mock

export function formatRelativeTime(dateStr) {
  if (!dateStr) return 'N/A'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const now = new Date()
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.floor(diffMonths / 12)}y ago`
}

export function formatRelativeShort(dateStr) {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const now = new Date()
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return `${diffSeconds}s`
  if (diffMinutes < 60) return `${diffMinutes}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffWeeks < 4) return `${diffWeeks}w`
  return `${diffMonths}mo`
}

export function formatCount(n) {
  if (n === null || n === undefined) return '0'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  '#6C5FC7', '#E03E2F', '#33BF9E', '#F5B000', '#3B6ECC',
  '#E8558E', '#80708F', '#2BA185', '#FF6B35', '#7C3AED'
]

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function formatDate(dateStr, fmt = 'short') {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (fmt === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (fmt === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }
  return date.toISOString()
}

export function deepDiff(initial, current, path = '') {
  if (initial === current) return {}
  if (typeof initial !== typeof current) {
    return { [path || 'root']: { from: initial, to: current } }
  }
  if (typeof initial !== 'object' || initial === null || current === null) {
    return { [path || 'root']: { from: initial, to: current } }
  }
  if (Array.isArray(initial) !== Array.isArray(current)) {
    return { [path || 'root']: { from: initial, to: current } }
  }

  const diff = {}
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key
    if (!(key in initial)) {
      diff[newPath] = { from: undefined, to: current[key] }
    } else if (!(key in current)) {
      diff[newPath] = { from: initial[key], to: undefined }
    } else {
      const sub = deepDiff(initial[key], current[key], newPath)
      Object.assign(diff, sub)
    }
  }
  return diff
}

export function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj))
}
