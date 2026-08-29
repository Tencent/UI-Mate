import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch({ onClose }) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  const msgResults = q ? Object.entries(state.messages).flatMap(([convId, msgs]) =>
    msgs.filter(m => m.content && m.content.toLowerCase().includes(q)).slice(0, 3).map(m => ({
      type: 'message', id: m.id, convId, content: m.content, timestamp: m.timestamp,
    }))
  ).slice(0, 5) : [];

  const docResults = q ? state.documents.filter(d =>
    d.title.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const userResults = q ? state.users.filter(u =>
    u.name.toLowerCase().includes(q) || u.englishName.toLowerCase().includes(q) || u.department.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const hasResults = msgResults.length > 0 || docResults.length > 0 || userResults.length > 0;

  function goToConv(convId) {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: convId });
    navigate(`/messenger/${convId}`);
    onClose();
  }

  function goToDoc(docId) {
    navigate(`/docs/${docId}`);
    onClose();
  }

  function goToContact(userId) {
    dispatch({ type: 'SET_ACTIVE_CONTACT', payload: userId });
    navigate(`/contacts?userId=${userId}`);
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, background: '#fff', borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)', zIndex: 301, overflow: 'hidden',
        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #DEE0E3', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F959E" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索消息、文档、联系人..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#1F2329' }}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!q && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8F959E', fontSize: 14 }}>
              搜索消息、文档、联系人...
            </div>
          )}

          {q && !hasResults && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8F959E', fontSize: 14 }}>
              未找到 "{query}" 相关结果
            </div>
          )}

          {msgResults.length > 0 && (
            <section>
              <div style={{ padding: '8px 16px 4px', fontSize: 12, color: '#8F959E', fontWeight: 500 }}>消息</div>
              {msgResults.map(r => {
                const conv = state.conversations.find(c => c.id === r.convId);
                return (
                  <div
                    key={r.id}
                    onClick={() => goToConv(r.convId)}
                    style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 16 }}>💬</span>
                    <div>
                      <div style={{ fontSize: 13, color: '#646A73' }}>{conv?.name || '会话'}</div>
                      <div style={{ fontSize: 14, color: '#1F2329' }}>{highlight(r.content, q)}</div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {docResults.length > 0 && (
            <section>
              <div style={{ padding: '8px 16px 4px', fontSize: 12, color: '#8F959E', fontWeight: 500 }}>文档</div>
              {docResults.map(d => (
                <div
                  key={d.id}
                  onClick={() => goToDoc(d.id)}
                  style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 18 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, color: '#1F2329' }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: '#8F959E' }}>{state.users.find(u => u.id === d.ownerId)?.name} 编辑</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {userResults.length > 0 && (
            <section>
              <div style={{ padding: '8px 16px 4px', fontSize: 12, color: '#8F959E', fontWeight: 500 }}>联系人</div>
              {userResults.map(u => (
                <div
                  key={u.id}
                  onClick={() => goToContact(u.id)}
                  style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: u.avatarColor, color: '#fff', fontWeight: 600, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{u.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, color: '#1F2329' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#646A73' }}>{u.department} · {u.title}</div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  const start = Math.max(0, idx - 20);
  const snippet = (start > 0 ? '...' : '') + text.slice(start, idx + query.length + 40);
  return snippet;
}
