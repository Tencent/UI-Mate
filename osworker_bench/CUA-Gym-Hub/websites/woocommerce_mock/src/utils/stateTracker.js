export function computeDiff(initial, current, prefix = '') {
  const diff = {}
  if (!initial || !current) return diff

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key
    const oldVal = initial[key]
    const newVal = current[key]

    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue

    if (
      typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
      typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)
    ) {
      const nested = computeDiff(oldVal, newVal, path)
      Object.assign(diff, nested)
    } else {
      diff[path] = { old: oldVal, new: newVal }
    }
  }
  return diff
}
