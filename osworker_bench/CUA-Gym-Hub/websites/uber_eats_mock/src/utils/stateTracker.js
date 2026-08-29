export function computeStateDiff(initial, current, prefix = '') {
  if (!initial || !current) return {};
  const diff = {};

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);

  for (const key of allKeys) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const oldVal = initial[key];
    const newVal = current[key];

    if (oldVal === newVal) continue;

    if (
      oldVal !== null && newVal !== null &&
      typeof oldVal === 'object' && typeof newVal === 'object' &&
      !Array.isArray(oldVal) && !Array.isArray(newVal)
    ) {
      const nested = computeStateDiff(oldVal, newVal, fullPath);
      Object.assign(diff, nested);
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[fullPath] = { old: oldVal, new: newVal };
    }
  }

  return diff;
}
