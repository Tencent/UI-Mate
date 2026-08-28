import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ConversationInfoPanel({ conversation, onClose }) {
  const { state, dispatch } = useApp();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const members = conversation.members
    ? state.users.filter(u => conversation.members.includes(u.id))
    : [];

  const nonMembers = state.users.filter(u => !conversation.members?.includes(u.id));
  const filteredNonMembers = memberSearch
    ? nonMembers.filter(u => u.name.includes(memberSearch) || u.englishName.toLowerCase().includes(memberSearch.toLowerCase()))
    : nonMembers;

  function handleMuteToggle() {
    dispatch({ type: 'TOGGLE_MUTE_CONVERSATION', payload: conversation.id });
  }

  function handleAddMember(userId) {
    dispatch({ type: 'ADD_MEMBER', payload: { conversationId: conversation.id, userId } });
    setShowAddMember(false);
    setMemberSearch('');
  }

  function handleLeave() {
    if (!window.confirm('确定要退出该群聊吗？')) return;
    dispatch({ type: 'LEAVE_CONVERSATION', payload: { conversationId: conversation.id, userId: state.currentUser.id } });
    onClose();
  }

  return (
    <div style={{
      width: 320, borderLeft: '1px solid #DEE0E3', background: '#fff',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ height: 56, borderBottom: '1px solid #DEE0E3', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 16, color: '#1F2329' }}>群组信息</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
        {/* Group name */}
        {conversation.type === 'group' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 6 }}>群名称</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1F2329' }}>{conversation.name}</div>
          </div>
        )}

        {/* Notification */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #DEE0E3' }}>
          <span style={{ fontSize: 14, color: '#1F2329' }}>消息通知</span>
          <div
            onClick={handleMuteToggle}
            style={{
              width: 36, height: 20, borderRadius: 10,
              background: conversation.isMuted ? '#DEE0E3' : '#3370FF',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: conversation.isMuted ? 2 : 18,
              width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
            }} />
          </div>
        </div>

        {/* Members */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 8 }}>成员 ({members.length})</div>
          {members.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: u.avatarColor, color: '#fff', fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{u.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#1F2329' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#646A73' }}>{u.title}</div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowAddMember(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0',
              border: 'none', background: 'transparent', cursor: 'pointer', color: '#3370FF', fontSize: 13,
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> 添加成员
          </button>

          {/* Add member picker */}
          {showAddMember && (
            <div style={{ border: '1px solid #DEE0E3', borderRadius: 8, padding: 10, marginTop: 8, background: '#F5F6F7' }}>
              <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 8 }}>选择要添加的成员</div>
              <input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="搜索成员..."
                autoFocus
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
              />
              <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                {filteredNonMembers.length === 0 && (
                  <div style={{ fontSize: 13, color: '#8F959E', textAlign: 'center', padding: '10px 0' }}>无可添加的成员</div>
                )}
                {filteredNonMembers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleAddMember(u.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', borderRadius: 4 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#E8EBFF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: u.avatarColor, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.initials}</div>
                    <span style={{ fontSize: 13, color: '#1F2329' }}>{u.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowAddMember(false); setMemberSearch(''); }} style={{ marginTop: 8, fontSize: 12, color: '#646A73', border: 'none', background: 'none', cursor: 'pointer' }}>取消</button>
            </div>
          )}
        </div>

        {/* Leave group */}
        {conversation.type === 'group' && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #DEE0E3' }}>
            <button
              onClick={handleLeave}
              style={{
                width: '100%', padding: '8px', border: '1px solid #F54A45', borderRadius: 8,
                background: '#fff', color: '#F54A45', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFF1F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              退出群聊
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
