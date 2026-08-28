const safeName = (name) => (name || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');

export function downloadBlob(filename, content, contentType = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadEnvelope(envelope, suffix = 'envelope') {
  const lines = [
    `Subject: ${envelope.subject}`,
    `Status: ${envelope.status}`,
    `Envelope ID: ${envelope.id}`,
    `Created: ${envelope.createdAt}`,
    `Sent: ${envelope.sentAt || 'Not sent'}`,
    `Completed: ${envelope.completedAt || 'Not completed'}`,
    '',
    'Recipients:',
    ...(envelope.recipients || []).map((r, idx) =>
      `${idx + 1}. ${r.name} <${r.email || 'no email'}> - ${r.role} - ${r.status}`
    ),
    '',
    'Documents:',
    ...(envelope.documents || []).map((d, idx) =>
      `${idx + 1}. ${d.name} (${d.pageCount || 1} page${d.pageCount === 1 ? '' : 's'})`
    ),
    '',
    'History:',
    ...(envelope.history || []).map((h) =>
      `${h.timestamp} - ${h.actorName || 'System'} - ${h.details}`
    ),
  ];
  downloadBlob(`${safeName(envelope.subject)}-${suffix}.txt`, lines.join('\n'));
}

export function downloadReportCsv(envelopes) {
  const rows = [
    ['Envelope ID', 'Subject', 'Status', 'Created', 'Sent', 'Completed', 'Recipients', 'Documents'],
    ...(envelopes || []).map((e) => [
      e.id,
      e.subject,
      e.status,
      e.createdAt,
      e.sentAt || '',
      e.completedAt || '',
      (e.recipients || []).map((r) => `${r.name} <${r.email}>`).join('; '),
      (e.documents || []).map((d) => d.name).join('; '),
    ]),
  ];
  const csv = rows.map((row) =>
    row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  downloadBlob(`xocusign-envelope-report-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
}
