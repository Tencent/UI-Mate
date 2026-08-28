export function computeStateDiff(initial, current, prefix = '') {
  const diff = {}
  if (!initial || !current) return diff
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key
    const iv = initial[key]
    const cv = current[key]
    if (JSON.stringify(iv) === JSON.stringify(cv)) continue
    if (typeof iv === 'object' && iv !== null && typeof cv === 'object' && cv !== null && !Array.isArray(iv) && !Array.isArray(cv)) {
      const nested = computeStateDiff(iv, cv, path)
      Object.assign(diff, nested)
    } else {
      diff[path] = { old: iv, new: cv }
    }
  }
  return diff
}
