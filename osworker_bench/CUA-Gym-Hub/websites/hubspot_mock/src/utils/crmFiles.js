export function downloadCsv(filename, rows, columns) {
  const header = columns.map(col => csvCell(col.label)).join(',');
  const body = rows.map(row => columns.map(col => csvCell(resolveValue(row, col))).join(',')).join('\n');
  const blob = new Blob([[header, body].filter(Boolean).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function readCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(parseCsv(String(reader.result || '')));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function resolveValue(row, col) {
  if (typeof col.value === 'function') return col.value(row);
  return row[col.key] ?? '';
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }

  row.push(value);
  rows.push(row);

  const [header = [], ...dataRows] = rows.filter(r => r.some(cell => cell.trim() !== ''));
  const keys = header.map(h => normalizeHeader(h));
  return dataRows.map(dataRow => keys.reduce((record, key, index) => {
    if (key) record[key] = dataRow[index] || '';
    return record;
  }, {}));
}

function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-z0-9]/g, '');
}
