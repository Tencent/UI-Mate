export function computeStateDiff(initial, current) {
  if (!initial || !current) return {};
  const diff = {};

  function diffArrayById(initialArr, currentArr, key) {
    const initialMap = {};
    (initialArr || []).forEach(item => { initialMap[item.id] = item; });
    const currentMap = {};
    (currentArr || []).forEach(item => { currentMap[item.id] = item; });

    const added = [];
    const deleted = [];
    const modified = [];

    for (const id in currentMap) {
      if (!initialMap[id]) {
        added.push(currentMap[id]);
      } else if (JSON.stringify(currentMap[id]) !== JSON.stringify(initialMap[id])) {
        const changes = {};
        const init = initialMap[id];
        const curr = currentMap[id];
        for (const field in curr) {
          if (JSON.stringify(curr[field]) !== JSON.stringify(init[field])) {
            changes[field] = { old: init[field], new: curr[field] };
          }
        }
        modified.push({ id, changes });
      }
    }

    for (const id in initialMap) {
      if (!currentMap[id]) {
        deleted.push(initialMap[id]);
      }
    }

    if (added.length || deleted.length || modified.length) {
      diff[key] = { added, deleted, modified };
    }
  }

  diffArrayById(initial.documents, current.documents, 'documents');
  diffArrayById(initial.shapes, current.shapes, 'shapes');
  diffArrayById(initial.connectors, current.connectors, 'connectors');
  diffArrayById(initial.comments, current.comments, 'comments');
  diffArrayById(initial.pages, current.pages, 'pages');
  diffArrayById(initial.folders, current.folders, 'folders');

  if (initial.ui && current.ui) {
    const uiDiff = {};
    for (const key in current.ui) {
      if (JSON.stringify(current.ui[key]) !== JSON.stringify(initial.ui[key])) {
        uiDiff[key] = { old: initial.ui[key], new: current.ui[key] };
      }
    }
    if (Object.keys(uiDiff).length) {
      diff.ui = uiDiff;
    }
  }

  return diff;
}
