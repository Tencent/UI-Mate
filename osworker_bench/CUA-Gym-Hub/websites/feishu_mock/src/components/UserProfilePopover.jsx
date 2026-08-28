import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePopover({ onClose }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { currentUser } = state;
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusText, setStatusText] = useState(currentUser.statusText || '');
  const [statusEmoji, setStatusEmoji] = useState(currentUser.statusEmoji || '');
  const [showAbout, setShowAbout] = useState(false);

  function saveStatus() {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: { statusText, statusEmoji } });
    setEditingStatus(false);
  }

  const statusColor = {
    online: '#34C724',
    busy: '#FF7D00',
    away: '#FAAD14',
    offline: '#8F959E',
  }[currentUser.status] || '#8F959E';

  const statusLabel = {
    online: '在线',
    busy: '忙碌',
    away: '离开',
    offline: '离线',
  }[currentUser.status] || '离线';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
      <div style={{
        position: 'fixed', bottom: 56, left: 60, zIndex: 200,
        background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        width: 280, padding: '20px 16px 16px',
        border: '1px solid #DEE0E3',
      }}>
        {/* Avatar & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: currentUser.avatarColor || '#3370FF',
            color: '#fff', fontWeight: 700, fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            {currentUser.initials || currentUser.name?.[0]}
            <span style={{
              position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%',
              background: statusColor, border: '2px solid #fff',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: '#1F2329' }}>{currentUser.name}</div>
            <div style={{ fontSize: 12, color: '#646A73' }}>{currentUser.title} · {currentUser.department}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#646A73' }}>{statusLabel}</span>
            </div>
          </div>
        </div>

        {/* Status text */}
        {!editingStatus ? (
          <div
            onClick={() => setEditingStatus(true)}
            style={{
              padding: '8px 12px', background: '#F5F6F7', borderRadius: 8,
              fontSize: 13, color: currentUser.statusText ? '#1F2329' : '#8F959E',
              cursor: 'pointer', marginBottom: 12, minHeight: 36,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {currentUser.statusEmoji && <span>{currentUser.statusEmoji}</span>}
            {currentUser.statusText || '设置状态...'}
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                value={statusEmoji}
                onChange={e => setStatusEmoji(e.target.value)}
                placeholder="😀"
                style={{
                  width: 44, padding: '6px 8px', border: '1px solid #DEE0E3',
                  borderRadius: 6, fontSize: 16, textAlign: 'center',
                }}
                maxLength={2}
              />
              <input
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
                placeholder="输入状态..."
                style={{
                  flex: 1, padding: '6px 10px', border: '1px solid #DEE0E3',
                  borderRadius: 6, fontSize: 13,
                }}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveStatus(); if (e.key === 'Escape') setEditingStatus(false); }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingStatus(false)} style={btnStyle('ghost')}>取消</button>
              <button onClick={saveStatus} style={btnStyle('primary')}>保存</button>
            </div>
          </div>
        )}

        {/* Status selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[['online','在线','#34C724'],['busy','忙碌','#FF7D00'],['away','离开','#FAAD14'],['offline','离线','#8F959E']].map(([s, l, c]) => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'UPDATE_CURRENT_USER', payload: { status: s } })}
              style={{
                flex: 1, padding: '5px 4px', border: `1px solid ${currentUser.status === s ? c : '#DEE0E3'}`,
                borderRadius: 6, background: currentUser.status === s ? `${c}18` : '#fff',
                cursor: 'pointer', fontSize: 11, color: currentUser.status === s ? c : '#646A73',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />
              {l}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#DEE0E3', margin: '8px -16px', marginLeft: -16, marginRight: -16 }} />

        {/* Actions */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => { onClose(); navigate('/settings'); }}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 4px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderRadius: 6, color: '#1F2329', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>⚙️</span> 个人设置
          </button>
          <button
            onClick={() => setShowAbout(true)}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 4px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderRadius: 6, color: '#1F2329', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>ℹ️</span> 关于飞书
          </button>
        </div>

        {/* About modal */}
        {showAbout && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAbout(false)}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 320, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🪶</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1F2329', marginBottom: 6 }}>飞书</div>
              <div style={{ fontSize: 13, color: '#646A73', marginBottom: 4 }}>版本 7.20.0 (Mock)</div>
              <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 16 }}>高效愉悦的工作，从飞书开始</div>
              <button onClick={() => setShowAbout(false)} style={{ padding: '7px 24px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>确定</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function btnStyle(variant) {
  if (variant === 'primary') return {
    padding: '5px 14px', background: '#3370FF', color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  };
  return {
    padding: '5px 14px', background: '#fff', color: '#646A73', border: '1px solid #DEE0E3',
    borderRadius: 6, cursor: 'pointer', fontSize: 13,
  };
}
