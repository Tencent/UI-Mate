export function computeStateDiff(initial, current) {
  const diff = {}
  if (!initial || !current) return diff

  function walk(a, b, path) {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
    for (const key of keys) {
      const fullPath = path ? `${path}.${key}` : key
      const av = a ? a[key] : undefined
      const bv = b ? b[key] : undefined
      if (JSON.stringify(av) !== JSON.stringify(bv)) {
        if (typeof bv === 'object' && bv !== null && !Array.isArray(bv) &&
            typeof av === 'object' && av !== null && !Array.isArray(av)) {
          walk(av, bv, fullPath)
        } else {
          diff[fullPath] = { old: av, new: bv }
        }
      }
    }
  }

  walk(initial, current, '')
  return diff
}
