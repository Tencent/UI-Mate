export function computeStateDiff(initial, current) {
  if (!initial || !current) return {};
  const diff = {};
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
  for (const key of allKeys) {
    const a = JSON.stringify(initial[key]);
    const b = JSON.stringify(current[key]);
    if (a !== b) {
      diff[key] = { old: initial[key], new: current[key] };
    }
  }
  return diff;
}
