export function computeStateDiff(initial, current) {
  const diff = {};

  function walk(initObj, currObj, path) {
    if (initObj === currObj) return;
    if (initObj === null || initObj === undefined || currObj === null || currObj === undefined) {
      if (initObj !== currObj) {
        diff[path] = { old: initObj, new: currObj };
      }
      return;
    }
    if (typeof initObj !== typeof currObj) {
      diff[path] = { old: initObj, new: currObj };
      return;
    }
    if (typeof initObj !== 'object') {
      if (initObj !== currObj) {
        diff[path] = { old: initObj, new: currObj };
      }
      return;
    }
    if (Array.isArray(initObj) || Array.isArray(currObj)) {
      if (JSON.stringify(initObj) !== JSON.stringify(currObj)) {
        diff[path] = { old: initObj, new: currObj };
      }
      return;
    }
    const allKeys = new Set([...Object.keys(initObj), ...Object.keys(currObj)]);
    for (const key of allKeys) {
      walk(initObj[key], currObj[key], path ? `${path}.${key}` : key);
    }
  }

  walk(initial, current, '');
  return diff;
}
