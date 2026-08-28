// stateTracker.js - State diff computation for /go endpoint

export function computeDiff(initial, current, prefix = '') {
  const diff = {}
  if (!initial || !current) return diff

  const allKeys = new Set([
    ...Object.keys(initial || {}),
    ...Object.keys(current || {})
  ])

  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const oldVal = (initial || {})[key]
    const newVal = (current || {})[key]

    if (
      typeof oldVal === 'object' &&
      typeof newVal === 'object' &&
      !Array.isArray(oldVal) &&
      !Array.isArray(newVal) &&
      oldVal !== null &&
      newVal !== null
    ) {
      Object.assign(diff, computeDiff(oldVal, newVal, fullKey))
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullKey] = { old: oldVal, new: newVal }
    }
  }

  return diff
}
