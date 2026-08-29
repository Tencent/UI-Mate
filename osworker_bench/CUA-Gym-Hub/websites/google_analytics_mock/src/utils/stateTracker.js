// State diff computation for /go endpoint

export function computeStateDiff(initial, current) {
  if (!initial || !current) return {};
  const diff = {};

  function compare(path, a, b) {
    if (a === b) return;
    if (a === null || a === undefined || b === null || b === undefined) {
      diff[path] = { old: a, new: b };
      return;
    }
    if (typeof a !== typeof b) {
      diff[path] = { old: a, new: b };
      return;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        diff[path] = { old: a, new: b };
      }
      return;
    }
    if (typeof a === 'object') {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of allKeys) {
        compare(path ? `${path}.${key}` : key, a[key], b[key]);
      }
      return;
    }
    if (a !== b) {
      diff[path] = { old: a, new: b };
    }
  }

  compare('', initial, current);
  return diff;
}
