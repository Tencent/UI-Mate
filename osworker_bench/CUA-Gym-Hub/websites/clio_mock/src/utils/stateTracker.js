export function deepDiff(a, b, prefix = '') {
  const diff = {}
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  for (const key of keys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const va = a?.[key]
    const vb = b?.[key]
    if (
      typeof va === 'object' && va !== null && !Array.isArray(va) &&
      typeof vb === 'object' && vb !== null && !Array.isArray(vb)
    ) {
      Object.assign(diff, deepDiff(va, vb, fullKey))
    } else if (JSON.stringify(va) !== JSON.stringify(vb)) {
      diff[fullKey] = { old: va, new: vb }
    }
  }
  return diff
}

export function getStateDiff(initial, current) {
  if (!initial) return {}
  return deepDiff(initial, current)
}
