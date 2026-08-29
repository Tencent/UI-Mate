export function computeStateDiff(initial, current) {
  const diff = {};
  function diffValue(init, curr, prefix) {
    if (typeof curr !== 'object' || curr === null || Array.isArray(curr)) {
      if (JSON.stringify(init) !== JSON.stringify(curr)) {
        diff[prefix] = { old: init, new: curr };
      }
      return;
    }
    const allKeys = new Set([...Object.keys(init || {}), ...Object.keys(curr || {})]);
    for (const key of allKeys) {
      const path = prefix ? `${prefix}.${key}` : key;
      const oldVal = init ? init[key] : undefined;
      const newVal = curr[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff[path] = { old: oldVal, new: newVal };
      }
    }
  }
  diffValue(initial, current, '');
  return diff;
}
