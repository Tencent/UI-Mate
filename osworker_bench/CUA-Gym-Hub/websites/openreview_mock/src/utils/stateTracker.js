export function computeStateDiff(initialState, currentState) {
  const diff = {}
  flatDiff('', initialState, currentState, diff)
  return diff
}

function flatDiff(prefix, initial, current, diff) {
  if (initial === current) return
  if (initial === null || initial === undefined || current === null || current === undefined) {
    if (initial !== current) {
      diff[prefix || 'root'] = { old: initial, new: current }
    }
    return
  }
  if (typeof initial !== typeof current) {
    diff[prefix || 'root'] = { old: initial, new: current }
    return
  }
  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[prefix || 'root'] = { old: initial, new: current }
    }
    return
  }
  if (typeof initial === 'object') {
    const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
    for (const key of allKeys) {
      const newPrefix = prefix ? `${prefix}.${key}` : key
      flatDiff(newPrefix, initial[key], current[key], diff)
    }
    return
  }
  if (initial !== current) {
    diff[prefix || 'root'] = { old: initial, new: current }
  }
}
