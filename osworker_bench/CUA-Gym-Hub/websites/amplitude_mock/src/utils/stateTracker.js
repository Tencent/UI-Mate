export function computeDiff(initial, current, prefix = '') {
  const diff = {}
  if (!initial && !current) return diff
  const obj1 = initial || {}
  const obj2 = current || {}
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const ival = obj1[key]
    const cval = obj2[key]
    if (
      typeof ival === 'object' && ival !== null && !Array.isArray(ival) &&
      typeof cval === 'object' && cval !== null && !Array.isArray(cval)
    ) {
      Object.assign(diff, computeDiff(ival, cval, fullKey))
    } else if (JSON.stringify(ival) !== JSON.stringify(cval)) {
      diff[fullKey] = { old: ival, new: cval }
    }
  }
  return diff
}
