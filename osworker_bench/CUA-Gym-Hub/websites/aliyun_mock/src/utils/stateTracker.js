export function computeDiff(initial, current) {
  const diff = {}
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})])
  for (const key of allKeys) {
    const a = initial ? initial[key] : undefined
    const b = current ? current[key] : undefined
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[key] = { old: a, new: b }
    }
  }
  return diff
}
