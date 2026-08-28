// stateTracker.js — Deep diff computation for /go endpoint

export function computeDiff(initial, current, path = '') {
  const diff = {};

  if (initial === current) return diff;

  const allKeys = new Set([
    ...Object.keys(initial || {}),
    ...Object.keys(current || {}),
  ]);

  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const oldVal = initial ? initial[key] : undefined;
    const newVal = current ? current[key] : undefined;

    if (oldVal === newVal) continue;

    if (
      oldVal !== null && newVal !== null &&
      typeof oldVal === 'object' && typeof newVal === 'object' &&
      !Array.isArray(oldVal) && !Array.isArray(newVal)
    ) {
      const nested = computeDiff(oldVal, newVal, fullPath);
      Object.assign(diff, nested);
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullPath] = { old: oldVal, new: newVal };
    }
  }

  return diff;
}
