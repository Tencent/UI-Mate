export function computeDiff(initial, current, path = '') {
  const diff = {}

  if (initial === current) return diff

  if (
    typeof initial !== 'object' || initial === null ||
    typeof current !== 'object' || current === null ||
    Array.isArray(initial) !== Array.isArray(current)
  ) {
    if (initial !== current) {
      diff[path || 'root'] = { old: initial, new: current }
    }
    return diff
  }

  if (Array.isArray(initial)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[path || 'root'] = { old: initial, new: current }
    }
    return diff
  }

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key
    const subDiff = computeDiff(initial[key], current[key], childPath)
    Object.assign(diff, subDiff)
  }

  return diff
}
