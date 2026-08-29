export function computeStateDiff(initial, current) {
  if (!initial || !current) return {};

  const diff = {};

  // Compare boards
  const boardsDiff = { added: [], modified: [], removed: [] };
  const initialBoardMap = {};
  (initial.boards || []).forEach(b => { initialBoardMap[b.id] = b; });
  const currentBoardMap = {};
  (current.boards || []).forEach(b => { currentBoardMap[b.id] = b; });

  for (const id in currentBoardMap) {
    if (!initialBoardMap[id]) {
      boardsDiff.added.push(currentBoardMap[id]);
    } else if (JSON.stringify(currentBoardMap[id]) !== JSON.stringify(initialBoardMap[id])) {
      boardsDiff.modified.push({ id, changes: getObjectDiff(initialBoardMap[id], currentBoardMap[id]) });
    }
  }
  for (const id in initialBoardMap) {
    if (!currentBoardMap[id]) {
      boardsDiff.removed.push(initialBoardMap[id]);
    }
  }
  if (boardsDiff.added.length || boardsDiff.modified.length || boardsDiff.removed.length) {
    diff.boards = boardsDiff;
  }

  // Compare projects
  const projectsDiff = { added: [], modified: [], removed: [] };
  const initialProjectMap = {};
  (initial.projects || []).forEach(p => { initialProjectMap[p.id] = p; });
  const currentProjectMap = {};
  (current.projects || []).forEach(p => { currentProjectMap[p.id] = p; });

  for (const id in currentProjectMap) {
    if (!initialProjectMap[id]) {
      projectsDiff.added.push(currentProjectMap[id]);
    } else if (JSON.stringify(currentProjectMap[id]) !== JSON.stringify(initialProjectMap[id])) {
      projectsDiff.modified.push({ id, changes: getObjectDiff(initialProjectMap[id], currentProjectMap[id]) });
    }
  }
  for (const id in initialProjectMap) {
    if (!currentProjectMap[id]) {
      projectsDiff.removed.push(initialProjectMap[id]);
    }
  }
  if (projectsDiff.added.length || projectsDiff.modified.length || projectsDiff.removed.length) {
    diff.projects = projectsDiff;
  }

  // Compare boardItems per board
  const allBoardIds = new Set([
    ...Object.keys(initial.boardItems || {}),
    ...Object.keys(current.boardItems || {}),
  ]);
  const boardItemsDiff = {};
  for (const boardId of allBoardIds) {
    const initialItems = (initial.boardItems || {})[boardId] || [];
    const currentItems = (current.boardItems || {})[boardId] || [];
    const itemDiff = compareItemArrays(initialItems, currentItems);
    if (itemDiff.added.length || itemDiff.modified.length || itemDiff.removed.length) {
      boardItemsDiff[boardId] = itemDiff;
    }
  }
  if (Object.keys(boardItemsDiff).length) {
    diff.boardItems = boardItemsDiff;
  }

  // Compare comments
  const allCommentBoardIds = new Set([
    ...Object.keys(initial.comments || {}),
    ...Object.keys(current.comments || {}),
  ]);
  const commentsDiff = {};
  for (const boardId of allCommentBoardIds) {
    const initialComments = (initial.comments || {})[boardId] || [];
    const currentComments = (current.comments || {})[boardId] || [];
    const cDiff = compareItemArrays(initialComments, currentComments);
    if (cDiff.added.length || cDiff.modified.length || cDiff.removed.length) {
      commentsDiff[boardId] = cDiff;
    }
  }
  if (Object.keys(commentsDiff).length) {
    diff.comments = commentsDiff;
  }

  // Compare tags
  const allTagBoardIds = new Set([
    ...Object.keys(initial.tags || {}),
    ...Object.keys(current.tags || {}),
  ]);
  const tagsDiff = {};
  for (const boardId of allTagBoardIds) {
    const initialTags = (initial.tags || {})[boardId] || [];
    const currentTags = (current.tags || {})[boardId] || [];
    const tDiff = compareItemArrays(initialTags, currentTags);
    if (tDiff.added.length || tDiff.modified.length || tDiff.removed.length) {
      tagsDiff[boardId] = tDiff;
    }
  }
  if (Object.keys(tagsDiff).length) {
    diff.tags = tagsDiff;
  }

  return diff;
}

function compareItemArrays(initialArr, currentArr) {
  const result = { added: [], modified: [], removed: [] };
  const initialMap = {};
  initialArr.forEach(item => { initialMap[item.id] = item; });
  const currentMap = {};
  currentArr.forEach(item => { currentMap[item.id] = item; });

  for (const id in currentMap) {
    if (!initialMap[id]) {
      result.added.push(currentMap[id]);
    } else if (JSON.stringify(currentMap[id]) !== JSON.stringify(initialMap[id])) {
      result.modified.push({ id, changes: getObjectDiff(initialMap[id], currentMap[id]) });
    }
  }
  for (const id in initialMap) {
    if (!currentMap[id]) {
      result.removed.push(initialMap[id]);
    }
  }
  return result;
}

function getObjectDiff(oldObj, newObj) {
  const changes = {};
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }
  return changes;
}
