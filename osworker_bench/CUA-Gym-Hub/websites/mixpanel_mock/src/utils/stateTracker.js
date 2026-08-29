export function computeStateDiff(initial, current) {
  if (!initial || !current) return {}
  const diff = {}

  function compareValues(path, a, b) {
    if (typeof a !== typeof b) {
      diff[path] = { old: a, new: b }
      return
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        diff[path] = { old: a, new: b }
      }
      return
    }
    if (a && b && typeof a === 'object') {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)])
      keys.forEach(k => compareValues(`${path}.${k}`, a[k], b[k]))
      return
    }
    if (a !== b) {
      diff[path] = { old: a, new: b }
    }
  }

  const keys = new Set([...Object.keys(initial), ...Object.keys(current)])
  keys.forEach(k => compareValues(k, initial[k], current[k]))

  return diff
}
