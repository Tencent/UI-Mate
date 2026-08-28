export function computeStateDiff(initial, current) {
  const diff = {};

  function compare(obj1, obj2, path = '') {
    if (obj1 === obj2) return;
    if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
      if (obj1 !== obj2) diff[path] = { old: obj1, new: obj2 };
      return;
    }
    if (typeof obj1 !== typeof obj2) {
      diff[path] = { old: obj1, new: obj2 };
      return;
    }
    if (typeof obj1 !== 'object') {
      if (obj1 !== obj2) diff[path] = { old: obj1, new: obj2 };
      return;
    }
    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
      diff[path] = { old: obj1, new: obj2 };
      return;
    }
    if (Array.isArray(obj1)) {
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        diff[path] = { old: obj1, new: obj2 };
      }
      return;
    }
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      compare(obj1[key], obj2[key], newPath);
    }
  }

  compare(initial, current);
  return diff;
}
