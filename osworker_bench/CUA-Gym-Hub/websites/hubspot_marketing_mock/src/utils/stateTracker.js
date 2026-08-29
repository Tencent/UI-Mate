export function getStateDiff(initialState, currentState) {
  const diff = {};

  function compare(init, curr, path) {
    if (init === curr) return;

    if (typeof init !== typeof curr) {
      diff[path] = { old: init, new: curr };
      return;
    }

    if (Array.isArray(init) && Array.isArray(curr)) {
      if (JSON.stringify(init) !== JSON.stringify(curr)) {
        diff[path] = { old: init, new: curr };
      }
      return;
    }

    if (typeof init === 'object' && init !== null && curr !== null) {
      const allKeys = new Set([...Object.keys(init), ...Object.keys(curr)]);
      for (const key of allKeys) {
        compare(init[key], curr[key], path ? `${path}.${key}` : key);
      }
      return;
    }

    diff[path] = { old: init, new: curr };
  }

  compare(initialState, currentState, '');
  return diff;
}
