export function computeStateDiff(initial, current, path = '') {
  const diff = {};
  if (initial === current) return diff;
  if (initial === null || initial === undefined || current === null || current === undefined) {
    if (initial !== current) {
      diff[path || '_root'] = { old: initial, new: current };
    }
    return diff;
  }
  if (typeof initial !== 'object' || typeof current !== 'object') {
    if (initial !== current) {
      diff[path || '_root'] = { old: initial, new: current };
    }
    return diff;
  }
  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[path || '_root'] = { old: initial, new: current };
    }
    return diff;
  }
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;
    const sub = computeStateDiff(initial[key], current[key], newPath);
    Object.assign(diff, sub);
  }
  return diff;
}
