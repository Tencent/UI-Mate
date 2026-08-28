export function StatusBadge({ status }) {
  const statusMap = {
    success: { label: '✓ Success', cls: 'badge-success' },
    failed: { label: '✗ Failed', cls: 'badge-failed' },
    running: { label: 'Running', cls: 'badge-running', spin: true },
    queued: { label: 'Queued', cls: 'badge-queued' },
    on_hold: { label: 'On Hold', cls: 'badge-on_hold' },
    needs_approval: { label: 'Needs Approval', cls: 'badge-needs_approval' },
    canceled: { label: 'Canceled', cls: 'badge-canceled' },
    blocked: { label: 'Blocked', cls: 'badge-blocked' },
    not_run: { label: 'Not Run', cls: 'badge-not_run' },
    created: { label: 'Created', cls: 'badge-queued' },
    unauthorized: { label: 'Unauthorized', cls: 'badge-canceled' }
  };

  const s = statusMap[status] || { label: status, cls: 'badge-canceled' };

  return (
    <span className={`badge ${s.cls}`}>
      {s.spin && <span className="spin" style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />}
      {s.label}
    </span>
  );
}

export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '--';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '--';
  const now = new Date('2026-04-10T08:30:00Z');
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VcsIcon({ provider }) {
  if (provider === 'github') return (
    <svg className="vcs-github" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
  if (provider === 'gitlab') return (
    <svg className="vcs-gitlab" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
    </svg>
  );
  if (provider === 'bitbucket') return (
    <svg className="vcs-bitbucket" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064z"/>
    </svg>
  );
  return null;
}
