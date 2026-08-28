export function downloadTextFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildInvoiceDocument(invoice, company = {}) {
  const lines = (invoice.items || []).map(item => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);
    const amount = Number(item.amount ?? qty * rate);
    return `${item.description || 'Line item'} | ${qty} | $${rate.toFixed(2)} | $${amount.toFixed(2)}`;
  });

  const subtotal = Number(invoice.subtotal ?? (invoice.items || []).reduce((sum, item) => sum + Number(item.amount ?? Number(item.qty || 0) * Number(item.rate || 0)), 0));
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total ?? subtotal + tax);

  return [
    `${company.name || 'Acme Corp'}`,
    `${company.address || ''}`,
    '',
    `INVOICE #${invoice.number}`,
    `Customer: ${invoice.customerName || ''}`,
    `Date: ${invoice.date || ''}`,
    `Due date: ${invoice.dueDate || ''}`,
    `Terms: ${invoice.terms || 'Net 30'}`,
    '',
    'Description | Qty | Rate | Amount',
    ...lines,
    '',
    `Subtotal: $${subtotal.toFixed(2)}`,
    `Tax: $${tax.toFixed(2)}`,
    `Total: $${total.toFixed(2)}`,
    '',
    invoice.message || '',
  ].join('\n');
}

export function downloadInvoicePdf(invoice, company) {
  const content = buildInvoiceDocument(invoice, company);
  downloadTextFile(`invoice-${invoice.number || invoice.id}.pdf`, content, 'application/pdf');
}
