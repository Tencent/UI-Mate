import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, Phone, Briefcase, PiggyBank, Eye, EyeOff, MoreHorizontal, Triangle, CheckCircle, ExternalLink } from 'lucide-react';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InboxAvatar({ item }) {
  if (item.fromUserName === 'Concierge') {
    return <div className="inbox-avatar" style={{ background: '#0185FF' }}><Triangle size={18} /></div>;
  }
  const c = ['#E85E95','#0185FF','#03D47C','#F5A623','#8B959E'];
  const idx = (item.fromUserName || '').length % c.length;
  return <div className="inbox-avatar" style={{ background: c[idx] }}>{(item.fromUserName || '?')[0]}</div>;
}

export default function Inbox() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';
  const [showHidden, setShowHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const conciergeItem = state.inboxItems.find(i => i.type === 'concierge');
  const items = state.inboxItems
    .filter(i => i.type !== 'concierge')
    .filter(i => showHidden ? true : !i.hidden)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleClick = (item) => {
    if (!item.read) {
      dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: item.id, read: true } });
    }
    if (item.actionRequired && item.actionType === 'approve_report' && item.relatedId) {
      navigate('/reports/' + item.relatedId + qsStr);
    } else if (item.actionType === 'review_violation' && item.relatedId) {
      // Navigate to expenses page; the relatedId is an expense id
      navigate('/expenses/' + item.relatedId + qsStr);
    }
    // setup_task: just mark read; no navigation target
  };

  const handleHide = (e, item) => {
    e.stopPropagation();
    dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: item.id, hidden: true } });
    setMenuOpen(null);
  };

  const handleMarkUnread = (e, item) => {
    e.stopPropagation();
    dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: item.id, read: false } });
    setMenuOpen(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inbox</h1>
      </div>

      {conciergeItem && !conciergeItem.hidden && (
        <div className="concierge-welcome">
          <div className="concierge-header">
            <div className="concierge-left">
              <div className="concierge-avatar"><Triangle size={20} /></div>
              <span className="concierge-name">Concierge</span>
            </div>
            <div className="concierge-actions">
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => { window.open('https://use.expensify.com/demo', '_blank'); }}><Play size={14} /> Watch Demo</button>
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => { window.open('tel:+18882899750', '_self'); }}><Phone size={14} /> Call</button>
            </div>
          </div>
          <p style={{ fontSize: 15, marginBottom: 12 }}>Are you here to setup Xpensify for your business, or just yourself?</p>
          <div className="setup-cards">
            <div className="setup-card" onClick={() => dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: conciergeItem.id, hidden: true } })}>
              <div className="setup-card-icon"><Briefcase size={40} color="#F5A623" /></div>
              <div className="setup-card-title">Business</div>
              <div className="setup-card-desc">Send invoices, pay bills, book travel, and manage employee expenses. Get the Xpensify Card and say goodbye to receipts.</div>
            </div>
            <div className="setup-card" onClick={() => dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: conciergeItem.id, hidden: true } })}>
              <div className="setup-card-icon"><PiggyBank size={40} color="#03D47C" /></div>
              <div className="setup-card-title">Individual</div>
              <div className="setup-card-desc">Track receipts for taxes, send invoices, and submit expenses to your accountant or employer.</div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && (!conciergeItem || conciergeItem.hidden) && (
        <div className="empty-state">
          <CheckCircle size={64} style={{ color: '#03D47C', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All caught up!</h2>
          <p style={{ color: '#8B959E' }}>You have no pending inbox items</p>
        </div>
      )}

      {items.map(item => (
        <div
          key={item.id}
          className={'inbox-card' + (!item.read ? ' unread' : '')}
          onClick={() => handleClick(item)}
        >
          <InboxAvatar item={item} />
          <div className="inbox-content">
            <div className="inbox-title">{item.title}</div>
            <div className="inbox-desc">{item.description}</div>
          </div>
          <div className="inbox-actions">
            <span className="inbox-time">{formatTime(item.createdAt)}</span>
            {item.actionRequired && item.actionType === 'approve_report' && (
              <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 14px' }}
                onClick={e => { e.stopPropagation(); handleClick(item); }}>Review</button>
            )}
            {item.actionRequired && item.actionType === 'review_violation' && item.relatedId && (
              <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={e => { e.stopPropagation(); handleClick(item); }}>
                <ExternalLink size={12} /> Review
              </button>
            )}
            <div className="three-dot-menu">
              <button className="three-dot-btn" onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === item.id ? null : item.id); }}>
                <MoreHorizontal size={18} />
              </button>
              {menuOpen === item.id && (
                <div className="dropdown-menu" style={{ right: 0, minWidth: 160 }}>
                  {item.read && (
                    <button className="dropdown-item" onClick={e => handleMarkUnread(e, item)}>
                      <Eye size={14} style={{ marginRight: 6 }} /> Mark as Unread
                    </button>
                  )}
                  <button className="dropdown-item" onClick={e => handleHide(e, item)}>
                    <EyeOff size={14} style={{ marginRight: 6 }} /> Hide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn-link" onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? <EyeOff size={14} style={{ marginRight: 4 }} /> : <Eye size={14} style={{ marginRight: 4 }} />}
          {showHidden ? 'Hide Hidden Tasks' : 'Show Hidden Tasks'}
        </button>
      </div>
    </div>
  );
}
