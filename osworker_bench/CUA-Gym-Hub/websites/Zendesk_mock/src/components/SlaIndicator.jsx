import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export function getSlaStatus(ticket) {
  if (!ticket.sla) return null;
  const { first_reply_at, next_reply_due, breached } = ticket.sla;

  if (breached) return 'breached';
  if (!next_reply_due) return null;

  const now = Date.now();
  const due = new Date(next_reply_due).getTime();
  const diffMs = due - now;
  const diffHours = diffMs / 3600000;

  if (diffMs <= 0) return 'breached';
  if (diffHours <= 2) return 'warning';
  return 'on-track';
}

export function formatSlaTime(ticket) {
  if (!ticket.sla || !ticket.sla.next_reply_due) return null;

  const now = Date.now();
  const due = new Date(ticket.sla.next_reply_due).getTime();
  const diffMs = due - now;

  if (diffMs <= 0) {
    const elapsed = Math.abs(diffMs);
    const hours = Math.floor(elapsed / 3600000);
    const mins = Math.floor((elapsed % 3600000) / 60000);
    return hours > 0 ? `-${hours}h ${mins}m` : `-${mins}m`;
  }

  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function SlaIndicator({ ticket, compact = false }) {
  const status = getSlaStatus(ticket);
  if (!status) return null;

  const timeStr = formatSlaTime(ticket);
  const firstReply = !ticket.sla.first_reply_at;

  if (compact) {
    return (
      <span className={`sla-icon ${status}`} title={`SLA: ${timeStr} ${status === 'breached' ? '(BREACHED)' : ''}`}>
        {status === 'breached' ? <AlertCircle size={14} /> : <Clock size={14} />}
      </span>
    );
  }

  return (
    <div className={`sla-indicator ${status}`}>
      <div className="sla-indicator-icon">
        {status === 'breached' && <AlertCircle size={14} />}
        {status === 'warning' && <AlertTriangle size={14} />}
        {status === 'on-track' && <Clock size={14} />}
      </div>
      <div className="sla-indicator-text">
        <span className="sla-indicator-label">
          {firstReply ? 'First reply' : 'Next reply'}
        </span>
        <span className="sla-indicator-time">
          {status === 'breached' ? `BREACHED (${timeStr})` : timeStr}
        </span>
      </div>
    </div>
  );
}
