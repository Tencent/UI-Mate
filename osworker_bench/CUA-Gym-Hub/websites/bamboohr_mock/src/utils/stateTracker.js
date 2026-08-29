export function computeDiff(initial, current, prefix = '') {
  const diff = {};

  if (initial === current) return diff;
  if (initial === null || initial === undefined || current === null || current === undefined) {
    if (prefix) diff[prefix] = { old: initial, new: current };
    return diff;
  }

  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[prefix || 'root'] = { old: initial, new: current };
    }
    return diff;
  }

  if (typeof initial === 'object' && typeof current === 'object') {
    const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
    for (const key of allKeys) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const oldVal = initial[key];
      const newVal = current[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        if (!Array.isArray(oldVal) && !Array.isArray(newVal) &&
            typeof oldVal === 'object' && typeof newVal === 'object' &&
            oldVal !== null && newVal !== null) {
          Object.assign(diff, computeDiff(oldVal, newVal, fullKey));
        } else {
          diff[fullKey] = { old: oldVal, new: newVal };
        }
      }
    }
    return diff;
  }

  if (initial !== current) {
    diff[prefix || 'root'] = { old: initial, new: current };
  }
  return diff;
}
