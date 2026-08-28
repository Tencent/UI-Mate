export const computeDiff = (initial, current) => {
  if (!initial || !current) return {}
  const diff = {}

  const compare = (initVal, currVal, path) => {
    if (JSON.stringify(initVal) === JSON.stringify(currVal)) return

    if (typeof initVal === 'object' && typeof currVal === 'object' && initVal !== null && currVal !== null && !Array.isArray(initVal) && !Array.isArray(currVal)) {
      const keys = new Set([...Object.keys(initVal), ...Object.keys(currVal)])
      for (const key of keys) {
        compare(initVal[key], currVal[key], path ? `${path}.${key}` : key)
      }
    } else {
      diff[path] = { before: initVal, after: currVal }
    }
  }

  const topKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of topKeys) {
    compare(initial[key], current[key], key)
  }

  return diff
}
