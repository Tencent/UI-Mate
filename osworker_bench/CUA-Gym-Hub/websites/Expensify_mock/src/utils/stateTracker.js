export function computeStateDiff(initial, current) {
  const diff = {};
  flatDiff(initial, current, '', diff);
  return diff;
}

function flatDiff(a, b, prefix, diff) {
  if (a === b) return;
  if (a === null || b === null || typeof a !== typeof b) {
    diff[prefix || 'root'] = { old: a, new: b };
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[prefix || 'root'] = { old: a, new: b };
    }
    return;
  }
  if (typeof a === 'object') {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
      flatDiff(a[key], b[key], prefix ? prefix + '.' + key : key, diff);
    }
    return;
  }
  if (a !== b) {
    diff[prefix || 'root'] = { old: a, new: b };
  }
}
