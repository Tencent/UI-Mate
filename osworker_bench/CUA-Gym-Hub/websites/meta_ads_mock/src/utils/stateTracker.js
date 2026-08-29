export function computeDiff(initial, current) {
  const diff = {};
  flatDiff('', initial, current, diff);
  return diff;
}

function flatDiff(prefix, a, b, diff) {
  if (a === b) return;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    diff[prefix || 'root'] = { old: a, new: b };
    return;
  }
  if (Array.isArray(a)) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[prefix || 'root'] = { old: a, new: b };
    }
    return;
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      flatDiff(prefix ? `${prefix}.${key}` : key, a[key], b[key], diff);
    }
    return;
  }
  if (a !== b) {
    diff[prefix || 'root'] = { old: a, new: b };
  }
}
