export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const colIndexToLabel = (index: number): string => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = ALPHABET[i % 26] + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

export const labelToColIndex = (label: string): number => {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + (ALPHABET.indexOf(label[i]) + 1);
  }
  return index - 1;
};

export const getCellId = (col: number, row: number) => `${colIndexToLabel(col)}${row + 1}`;

export const parseCellId = (id: string) => {
  const match = id.match(/([A-Z]+)([0-9]+)/);
  if (!match) return { col: 0, row: 0 };
  return {
    col: labelToColIndex(match[1]),
    row: parseInt(match[2]) - 1
  };
};

export const isInRange = (cellId: string, startId: string, endId: string) => {
  const cell = parseCellId(cellId);
  const start = parseCellId(startId);
  const end = parseCellId(endId);

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  return cell.col >= minCol && cell.col <= maxCol && cell.row >= minRow && cell.row <= maxRow;
};

export const getNextCellId = (currentId: string, direction: 'up' | 'down' | 'left' | 'right', maxRows: number, maxCols: number): string => {
  const { col, row } = parseCellId(currentId);
  let newCol = col;
  let newRow = row;

  switch (direction) {
    case 'up': newRow = Math.max(0, row - 1); break;
    case 'down': newRow = Math.min(maxRows - 1, row + 1); break;
    case 'left': newCol = Math.max(0, col - 1); break;
    case 'right': newCol = Math.min(maxCols - 1, col + 1); break;
  }

  return getCellId(newCol, newRow);
};