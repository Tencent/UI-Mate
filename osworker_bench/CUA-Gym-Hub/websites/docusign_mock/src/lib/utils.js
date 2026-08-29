import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const RECIPIENT_COLORS = [
  { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-900', pill: '#F59E0B' },
  { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', pill: '#3B82F6' },
  { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-900', pill: '#8B5CF6' },
  { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', pill: '#10B981' },
  { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-900', pill: '#EC4899' },
];

export const getRecipientColor = (index) => {
  return RECIPIENT_COLORS[index % RECIPIENT_COLORS.length];
};

const sanitizeFileName = (name) => (
  (name || 'xocusign-document')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'xocusign-document'
);

export const downloadTextFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFileName(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadEnvelopeCopy = (envelope, label = 'copy') => {
  const rows = [
    `XocuSign mock ${label}`,
    `Subject: ${envelope.subject}`,
    `Envelope ID: ${envelope.id}`,
    `Status: ${envelope.status}`,
    `Last activity: ${envelope.lastActivityAt || ''}`,
    '',
    'Documents:',
    ...(envelope.documents || []).map(doc => `- ${doc.name} (${doc.pageCount || 1} page${doc.pageCount === 1 ? '' : 's'})`),
    '',
    'Recipients:',
    ...(envelope.recipients || []).map(rec => `- ${rec.name} <${rec.email}> ${rec.role} ${rec.status}`),
    '',
    'History:',
    ...(envelope.history || []).map(evt => `- ${evt.timestamp}: ${evt.action} - ${evt.details}`),
  ];
  downloadTextFile(`${envelope.subject || envelope.id}-copy.txt`, rows.join('\n'));
};

export const downloadReportCsv = (envelopes) => {
  const header = ['id', 'subject', 'status', 'sentAt', 'completedAt', 'lastActivityAt', 'recipientCount'];
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = envelopes.map(env => [
    env.id,
    env.subject,
    env.status,
    env.sentAt,
    env.completedAt,
    env.lastActivityAt,
    env.recipients?.length || 0,
  ].map(escapeCell).join(','));
  downloadTextFile('xocusign-report.csv', [header.join(','), ...rows].join('\n'), 'text/csv');
};
