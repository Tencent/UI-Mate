export function computeStateDiff(initial, current, prefix = '') {
  const diff = {}
  if (!initial || !current) return diff

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const oldVal = initial[key]
    const newVal = current[key]

    if (
      typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
      typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)
    ) {
      Object.assign(diff, computeStateDiff(oldVal, newVal, fullKey))
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullKey] = { old: oldVal, new: newVal }
    }
  }
  return diff
}
