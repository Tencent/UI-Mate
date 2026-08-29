import { formatCurrency } from './dataManager';

export function downloadCsv(filename, rows, columns) {
  const header = columns.map(col => csvCell(col.label)).join(',');
  const body = rows.map(row => columns.map(col => csvCell(resolveValue(row, col))).join(',')).join('\n');
  downloadBlob(filename, [header, body].filter(Boolean).join('\n'), 'text/csv;charset=utf-8');
}

export function downloadInvoicePdf(invoice, customer) {
  const lines = [
    `%PDF-1.3`,
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
  ];
  const content = [
    'BT /F1 18 Tf 72 720 Td (Xtripe invoice) Tj',
    `0 -32 Td (${escapePdf(invoice.number || invoice.id)}) Tj`,
    `0 -24 Td (Customer: ${escapePdf(customer?.name || invoice.customer_name || invoice.customer_email || '--')}) Tj`,
    `0 -24 Td (Status: ${escapePdf(invoice.status)}) Tj`,
    `0 -24 Td (Amount due: ${escapePdf(formatCurrency(invoice.amount_due, invoice.currency))}) Tj`,
    `0 -24 Td (Amount paid: ${escapePdf(formatCurrency(invoice.amount_paid, invoice.currency))}) Tj`,
    `0 -36 Td (Line items:) Tj`,
    ...(invoice.lines || []).slice(0, 8).map(line =>
      `0 -20 Td (${escapePdf(`${line.description || 'Item'} - ${formatCurrency(line.amount, invoice.currency)}`)}) Tj`
    ),
    'ET',
  ].join('\n');
  lines.push(`4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);
  lines.push(`5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
  lines.push(`xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000059 00000 n \n0000000116 00000 n \n0000000260 00000 n \n0000000000 00000 n \ntrailer << /Root 1 0 R /Size 6 >>\nstartxref\n${lines.join('\n').length}\n%%EOF`);
  downloadBlob(`${invoice.number || invoice.id}.pdf`, lines.join('\n'), 'application/pdf');
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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

function escapePdf(value) {
  return String(value ?? '').replace(/[()\\]/g, '\\$&');
}
