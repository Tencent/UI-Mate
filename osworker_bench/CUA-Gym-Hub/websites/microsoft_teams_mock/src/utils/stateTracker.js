export function computeStateDiff(initial, current) {
  const diff = {};
  flatDiff('', initial, current, diff);
  return diff;
}

function flatDiff(prefix, a, b, diff) {
  if (a === b) return;
  if (a === null || a === undefined || b === null || b === undefined || typeof a !== typeof b) {
    diff[prefix || '(root)'] = { old: a, new: b };
    return;
  }
  if (typeof a !== 'object') {
    if (a !== b) diff[prefix] = { old: a, new: b };
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[prefix] = { old: a, new: b };
    }
    return;
  }
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!(key in a)) {
      diff[path] = { old: undefined, new: b[key] };
    } else if (!(key in b)) {
      diff[path] = { old: a[key], new: undefined };
    } else if (typeof a[key] === 'object' && a[key] !== null && typeof b[key] === 'object' && b[key] !== null && !Array.isArray(a[key]) && !Array.isArray(b[key])) {
      flatDiff(path, a[key], b[key], diff);
    } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
      diff[path] = { old: a[key], new: b[key] };
    }
  }
}
