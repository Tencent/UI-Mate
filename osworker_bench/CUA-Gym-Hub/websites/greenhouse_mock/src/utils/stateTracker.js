// stateTracker.js - Computes diffs between initial and current state

export function computeStateDiff(initial, current, prefix = '') {
  if (!initial || !current) return {};
  const diff = {};
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);

  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const oldVal = initial[key];
    const newVal = current[key];

    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

    if (
      oldVal && newVal &&
      typeof oldVal === 'object' && typeof newVal === 'object' &&
      !Array.isArray(oldVal) && !Array.isArray(newVal)
    ) {
      Object.assign(diff, computeStateDiff(oldVal, newVal, fullKey));
    } else {
      diff[fullKey] = { old: oldVal, new: newVal };
    }
  }

  return diff;
}
