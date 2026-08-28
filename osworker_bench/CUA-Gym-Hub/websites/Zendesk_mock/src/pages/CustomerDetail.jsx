import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function CustomerDetail() {
  const { userId } = useParams();
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const uid = parseInt(userId);
  const user = state.users.find(u => u.id === uid);

  if (!user) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#87929D' }}>Customer not found</div>;
  }

  const org = state.organizations.find(o => o.id === user.organization_id);
  const userTickets = state.tickets.filter(t => t.requester_id === uid);

  const editableFields = ['phone', 'time_zone', 'notes'];

  const handleStartEdit = (field) => {
    setEditingField(field);
    setEditValue(user[field] || '');
  };

  const handleSaveField = (field) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { id: uid, changes: { [field]: editValue } },
    });
    addToast(`${field.replace('_', ' ')} updated`);
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderField = (label, field, value, editable = false) => {
    const isEditing = editingField === field;
    return (
      <div className="detail-field" style={editable ? { alignItems: 'flex-start' } : {}}>
        <span className="detail-field-label" style={editable ? { paddingTop: 4 } : {}}>{label}</span>
        <div style={{ flex: 1 }}>
          {editable && isEditing ? (
            <div>
              <input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveField(field); if (e.key === 'Escape') handleCancelEdit(); }}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  border: '1px solid #1F73B7',
                  borderRadius: 4,
                  fontSize: 13,
                  fontFamily: 'var(--font-family)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => handleSaveField(field)}
                  style={{ padding: '3px 10px', background: '#1F73B7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-family)' }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{ padding: '3px 10px', background: 'transparent', color: '#68737D', border: '1px solid #D8DCDE', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-family)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : editable ? (
            <span
              className="detail-field-value"
              style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 3 }}
              onClick={() => handleStartEdit(field)}
              title={`Click to edit ${label.toLowerCase()}`}
            >
              {value || <span style={{ color: '#87929D', fontStyle: 'italic' }}>Click to add {label.toLowerCase()}...</span>}
            </span>
          ) : (
            <span className="detail-field-value">{value}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="detail-page">
      <div className="detail-page-header">
        <div className="detail-large-avatar" style={{ background: user.role === 'agent' ? '#5293C7' : '#37B8AF' }}>
          {user.initials}
        </div>
        <div className="detail-header-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="detail-columns">
        <div className="detail-card">
          <h3 className="detail-card-title">User Details</h3>
          {renderField('Email', 'email', user.email, false)}
          {renderField('Phone', 'phone', user.phone || '—', true)}
          <div className="detail-field">
            <span className="detail-field-label">Organization</span>
            <span className="detail-field-value">
              {org ? <Link to={appendQuery(`/organizations/${org.id}`)}>{org.name}</Link> : '—'}
            </span>
          </div>
          {renderField('Timezone', 'time_zone', user.time_zone, true)}
          {renderField('Member since', 'created_at', new Date(user.created_at).toLocaleDateString(), false)}
          {renderField('Role', 'role', user.role, false)}
          {renderField('Notes', 'notes', user.notes || '—', true)}
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">Tickets ({userTickets.length})</h3>
          {userTickets.length > 0 ? (
            <table className="list-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {userTickets.map(t => (
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
