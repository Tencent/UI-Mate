import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function OrganizationDetail() {
  const { orgId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const oid = parseInt(orgId);
  const org = state.organizations.find(o => o.id === oid);

  if (!org) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#87929D' }}>Organization not found</div>;
  }

  const members = state.users.filter(u => u.organization_id === oid);
  const memberIds = members.map(u => u.id);
  const orgTickets = state.tickets.filter(t => memberIds.includes(t.requester_id));

  const handleStartEditNotes = () => {
    setNotesValue(org.notes || '');
    setEditingNotes(true);
  };

  const handleSaveNotes = () => {
    dispatch({
      type: 'UPDATE_ORGANIZATION',
      payload: { id: oid, changes: { notes: notesValue } },
    });
    setEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setEditingNotes(false);
    setNotesValue('');
  };

  return (
    <div className="detail-page">
      <div className="detail-page-header">
        <div className="detail-large-avatar" style={{ background: '#5293C7' }}>
          {org.name.charAt(0)}
        </div>
        <div className="detail-header-info">
          <h1>{org.name}</h1>
          <p>{org.domain_names.join(', ')}</p>
        </div>
      </div>

      <div className="detail-card" style={{ marginBottom: 24 }}>
        <h3 className="detail-card-title">Organization Details</h3>
        <div className="detail-field">
          <span className="detail-field-label">Domains</span>
          <span className="detail-field-value">{org.domain_names.join(', ')}</span>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Details</span>
          <span className="detail-field-value">{org.details || '—'}</span>
        </div>
        <div className="detail-field" style={{ alignItems: 'flex-start' }}>
          <span className="detail-field-label" style={{ paddingTop: 4 }}>Notes</span>
          <div style={{ flex: 1 }}>
            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: '6px 8px',
                    border: '1px solid #1F73B7',
                    borderRadius: 4,
                    fontSize: 13,
                    fontFamily: 'var(--font-family)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    onClick={handleSaveNotes}
                    style={{ padding: '4px 12px', background: '#1F73B7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-family)' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    style={{ padding: '4px 12px', background: 'transparent', color: '#68737D', border: '1px solid #D8DCDE', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-family)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 3, minHeight: 24 }}
                onClick={handleStartEditNotes}
                title="Click to edit notes"
              >
                {org.notes ? (
                  <span style={{ fontSize: 13, color: '#2F3941', whiteSpace: 'pre-wrap' }}>{org.notes}</span>
                ) : (
                  <span style={{ fontSize: 13, color: '#87929D', fontStyle: 'italic' }}>Click to add notes...</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">Tags</span>
          <span className="detail-field-value">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {org.tags.map(tag => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </span>
        </div>
      </div>

      <div className="detail-columns">
        <div className="detail-card">
          <h3 className="detail-card-title">Members ({members.length})</h3>
          <table className="list-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {members.map(u => (
                <tr key={u.id} onClick={() => navigate(appendQuery(`/customers/${u.id}`))}>
                  <td>
                    <div className="user-cell">
                      <div className="list-avatar end-user">{u.initials}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#68737D' }}>{u.email}</td>
                  <td>{state.tickets.filter(t => t.requester_id === u.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">Tickets ({orgTickets.length})</h3>
          {orgTickets.length > 0 ? (
            <table className="list-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {orgTickets.map(t => (
                  <tr key={t.id} onClick={() => {
                    dispatch({ type: 'OPEN_TICKET_TAB', payload: t.id });
                    navigate(appendQuery(`/tickets/${t.id}`));
                  }}>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{t.subject}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ color: '#87929D', fontSize: 11 }}>
                      {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#87929D', padding: 16 }}>No tickets</div>
          )}
        </div>
      </div>
    </div>
  );
}
