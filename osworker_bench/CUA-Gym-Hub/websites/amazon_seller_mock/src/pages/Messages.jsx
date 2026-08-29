import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function timeLeft(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { label: 'OVERDUE - respond immediately', color: '#d13212' };
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const label = hrs < 6 ? `Response needed within ${hrs}h ${mins}m` : `Response needed within ${hrs}h ${mins}m`;
  return { label, color: hrs < 6 ? '#ff9900' : '#555' };
}

export default function Messages() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!state) return null;
  const { messages, orders } = state;

  // Group by thread
  const threads = useMemo(() => {
    const threadMap = {};
    messages.forEach(m => {
      if (!threadMap[m.threadId]) {
        threadMap[m.threadId] = { threadId: m.threadId, buyerName: m.buyerName, subject: m.subject, orderId: m.orderId, messages: [], status: m.status, lastTimestamp: m.timestamp, isRead: m.isRead };
      }
      threadMap[m.threadId].messages.push(m);
      if (m.timestamp > threadMap[m.threadId].lastTimestamp) threadMap[m.threadId].lastTimestamp = m.timestamp;
    });
    return Object.values(threadMap).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
  }, [messages]);

  const filtered = useMemo(() => {
    let list = threads;
    if (filterTab === 'Unanswered') list = list.filter(t => t.status === 'Unanswered');
    if (filterTab === 'Answered') list = list.filter(t => t.status === 'Answered');
    if (search) { const q = search.toLowerCase(); list = list.filter(t => t.buyerName.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)); }
    return list;
  }, [threads, filterTab, search]);

  const activeThread = selectedThread ? threads.find(t => t.threadId === selectedThread) : null;
  const threadMessages = activeThread ? messages.filter(m => m.threadId === selectedThread).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];

  const openThread = (threadId) => {
    setSelectedThread(threadId);
    dispatch({ type: 'MARK_MESSAGE_READ', payload: threadId });
  };

  const sendReply = () => {
    if (!replyText.trim() || !activeThread) return;
    const newMsg = {
      id: 'MSG_' + Date.now(),
      threadId: activeThread.threadId,
      orderId: activeThread.orderId,
      buyerName: 'Evergreen Home Goods',
      subject: 'Re: ' + activeThread.subject,
      body: replyText.trim(),
      sender: 'seller',
      timestamp: new Date().toISOString(),
      isRead: true,
      status: 'Answered',
      responseDeadline: null,
      attachments: []
    };
    dispatch({ type: 'SEND_MESSAGE', payload: { message: newMsg } });
    setReplyText('');
    showToast('Reply sent', 'success');
  };

  const markNoResponse = () => {
    if (!activeThread) return;
    const noRespMsg = {
      id: 'MSG_' + Date.now(),
      threadId: activeThread.threadId,
      orderId: activeThread.orderId,
      buyerName: 'Evergreen Home Goods',
      subject: activeThread.subject,
      body: '[No response needed]',
      sender: 'seller',
      timestamp: new Date().toISOString(),
      isRead: true,
      status: 'No response needed',
      responseDeadline: null,
      attachments: []
    };
    dispatch({ type: 'SEND_MESSAGE', payload: { message: noRespMsg } });
    showToast('Marked as no response needed', 'info');
  };

  const deadline = activeThread ? timeLeft(threadMessages.find(m => m.sender === 'buyer' && m.responseDeadline)?.responseDeadline) : null;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Buyer Messages</h1>
      <div style={{ display: 'flex', height: 'calc(100vh - 160px)', gap: 0, border: '1px solid #ddd', borderRadius: 4, background: 'white', overflow: 'hidden' }}>

        {/* Thread List */}
        <div style={{ width: '40%', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          {/* Filter Tabs */}
          <div className="tab-bar" style={{ padding: '0 12px', marginBottom: 0, flexShrink: 0 }}>
            {['All', 'Unanswered', 'Answered'].map(t => (
              <div key={t} className={`tab-item ${filterTab === t ? 'active' : ''}`} style={{ fontSize: 13 }} onClick={() => setFilterTab(t)}>{t}</div>
            ))}
          </div>
          {/* Search */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <input className="form-input" style={{ width: '100%' }} placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Thread List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#555' }}>No messages found</div>
            ) : filtered.map(thread => {
              const lastMsg = messages.filter(m => m.threadId === thread.threadId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
              const isUnread = thread.status === 'Unanswered';
              return (
                <div key={thread.threadId} onClick={() => openThread(thread.threadId)}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: selectedThread === thread.threadId ? '#e6f7f9' : 'white', borderLeft: isUnread ? '3px solid #ff9900' : '3px solid transparent' }}
                  onMouseEnter={e => { if (selectedThread !== thread.threadId) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (selectedThread !== thread.threadId) e.currentTarget.style.background = 'white'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <span style={{ fontWeight: isUnread ? 700 : 400, fontSize: 13 }}>{thread.buyerName}</span>
                    <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{timeAgo(thread.lastTimestamp)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#333', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.subject}</div>
                  <div style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg?.body?.slice(0, 60)}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                    <span className={`badge ${thread.status === 'Unanswered' ? 'badge-pending' : 'badge-success'}`} style={{ fontSize: 10 }}>{thread.status}</span>
                    {isUnread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff9900', display: 'inline-block', marginTop: 2 }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thread Detail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeThread ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              Select a message to view conversation
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{activeThread.buyerName}</div>
                    {activeThread.orderId && (
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Order: <a href={`/orders/${activeThread.orderId}`} onClick={e => { e.preventDefault(); navigate(`/orders/${activeThread.orderId}`); }} style={{ color: '#0066c0' }}>{state.orders.find(o => o.id === activeThread.orderId)?.amazonOrderId || activeThread.orderId}</a>
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{activeThread.subject}</div>
                  </div>
                  {deadline && <div style={{ fontSize: 12, color: deadline.color, fontWeight: deadline.color === '#d13212' ? 700 : 400, textAlign: 'right' }}>{deadline.label}</div>}
                </div>
              </div>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {threadMessages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'seller' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>
                      <strong style={{ color: m.sender === 'seller' ? '#0066c0' : '#555' }}>{m.sender === 'seller' ? 'You' : 'Buyer'}</strong> · {new Date(m.timestamp).toLocaleString()}
                    </div>
                    <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: 8, background: m.sender === 'seller' ? '#e6f7f9' : '#f3f3f3', fontSize: 13, lineHeight: '18px' }}>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
              {/* Reply Composer */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #ddd', flexShrink: 0 }}>
                <textarea className="form-textarea" style={{ width: '100%', height: 80, marginBottom: 8 }} placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply(); }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={sendReply} disabled={!replyText.trim()}>Send Reply</button>
                  <button className="btn-secondary" onClick={markNoResponse}>Mark as no response needed</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
