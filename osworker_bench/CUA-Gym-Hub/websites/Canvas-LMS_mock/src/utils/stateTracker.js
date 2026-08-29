export function computeStateDiff(initial, current) {
  const diff = {};

  function compare(initVal, currVal, path) {
    if (initVal === currVal) return;

    if (initVal === null || initVal === undefined || currVal === null || currVal === undefined) {
      diff[path] = { old: initVal, new: currVal };
      return;
    }

    if (typeof initVal !== typeof currVal) {
      diff[path] = { old: initVal, new: currVal };
      return;
    }

    if (Array.isArray(initVal) && Array.isArray(currVal)) {
      if (JSON.stringify(initVal) !== JSON.stringify(currVal)) {
        diff[path] = { old: initVal, new: currVal };
      }
      return;
    }

    if (typeof initVal === 'object') {
      const allKeys = new Set([...Object.keys(initVal), ...Object.keys(currVal)]);
      for (const key of allKeys) {
        compare(initVal[key], currVal[key], path ? `${path}.${key}` : key);
      }
      return;
    }

    if (initVal !== currVal) {
      diff[path] = { old: initVal, new: currVal };
    }
  }

  compare(initial, current, '');
  return diff;
}
