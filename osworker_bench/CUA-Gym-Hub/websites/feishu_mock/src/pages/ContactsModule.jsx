import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ContactsModule() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('org');
  const [expandedDepts, setExpandedDepts] = useState(new Set(['dept_0']));
  const [selectedUser, setSelectedUser] = useState(null);

  const { users, departments, currentUser } = state;

  // Pre-select contact from URL query param (e.g. from global search)
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      const u = users.find(u => u.id === userId);
      if (u) setSelectedUser(u);
    }
  }, []);

  function toggleDept(deptId) {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  }

  const rootDepts = departments.filter(d => d.parentId === null);
  const getChildDepts = (parentId) => departments.filter(d => d.parentId === parentId);

  function getStatusColor(status) {
    return { online: '#34C724', busy: '#FF7D00', away: '#FAAD14', offline: '#8F959E' }[status] || '#8F959E';
  }

  function searchedUsers() {
    if (!search) return [];
    const q = search.toLowerCase();
    return users.filter(u => u.name.includes(q) || u.englishName.toLowerCase().includes(q) || u.department.toLowerCase().includes(q));
  }

  function handleMessageUser(user) {
    const conv = state.conversations.find(c => c.type === 'direct' && c.members.includes(user.id) && c.members.includes(currentUser.id));
    if (conv) {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id });
      navigate(`/messenger/${conv.id}`);
    }
  }

  function DeptTree({ dept, depth = 0 }) {
    const isExpanded = expandedDepts.has(dept.id);
    const children = getChildDepts(dept.id);
    const members = users.filter(u => dept.memberIds.includes(u.id));

    return (
      <div>
        <div
          onClick={() => toggleDept(dept.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: `6px ${8 + depth * 12}px`,
            cursor: 'pointer', borderRadius: 4, marginBottom: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ color: '#8F959E', fontSize: 12, width: 12 }}>{isExpanded ? '▾' : '▸'}</span>
          <span style={{ fontSize: 15 }}>📁</span>
          <span style={{ flex: 1, fontSize: 13, color: '#1F2329' }}>{dept.name}</span>
          <span style={{ fontSize: 11, color: '#8F959E' }}>{members.length}</span>
        </div>

        {isExpanded && (
          <>
            {/* Child departments */}
            {children.map(child => (
              <DeptTree key={child.id} dept={child} depth={depth + 1} />
            ))}
            {/* Members (leaf level) */}
            {depth > 0 && members.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: `6px ${20 + depth * 12}px`,
                  cursor: 'pointer', borderRadius: 4,
                  background: selectedUser?.id === u.id ? '#E1EAFF' : 'transparent',
                }}
                onMouseEnter={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = '#F0F1F2'; }}
                onMouseLeave={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: u.avatarColor, color: '#fff', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{u.initials}</div>
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%',
                    background: getStatusColor(u.status), border: '1.5px solid #fff',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#1F2329' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#8F959E' }}>{u.title}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  const groupConvs = state.conversations.filter(c => c.type === 'group' && c.members.includes(currentUser.id));

  return (
    <>
      {/* Module Panel — Contacts Sidebar */}
      <div style={{
        width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DEE0E3',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}>
        {/* Search */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #F0F1F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F6F7', borderRadius: 8, padding: '0 10px', height: 32 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8F959E" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索联系人"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#1F2329' }}
            />
          </div>
        </div>

        {/* Search results */}
        {search && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
            {searchedUsers().length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#8F959E', fontSize: 13 }}>未找到 "{search}"</div>}
            {searchedUsers().map(u => (
              <div
                key={u.id}
                onClick={() => { setSelectedUser(u); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.avatarColor, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{u.initials}</div>
                <div>
                  <div style={{ fontSize: 13, color: '#1F2329' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#8F959E' }}>{u.department}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        {!search && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {[['org','组织架构'],['groups','我的群组'],['external','外部联系人']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  style={{
                    flex: 1, padding: '5px 4px', border: 'none', borderRadius: 4, cursor: 'pointer',
                    background: activeSection === id ? '#E1EAFF' : 'transparent',
                    color: activeSection === id ? '#3370FF' : '#646A73',
                    fontSize: 11, fontWeight: activeSection === id ? 500 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeSection === 'org' && rootDepts.map(dept => (
              <DeptTree key={dept.id} dept={dept} />
            ))}

            {activeSection === 'groups' && groupConvs.map(conv => (
              <div
                key={conv.id}
                onClick={() => navigate(`/messenger/${conv.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 18 }}>👥</span>
                <div>
                  <div style={{ fontSize: 13, color: '#1F2329' }}>{conv.name}</div>
                  <div style={{ fontSize: 11, color: '#8F959E' }}>{conv.memberCount} 人</div>
                </div>
              </div>
            ))}

            {activeSection === 'external' && (
              <div style={{ padding: 16, textAlign: 'center', color: '#8F959E', fontSize: 13 }}>暂无外部联系人</div>
            )}
          </div>
        )}
      </div>

      {/* Content Area — Contact Detail */}
      <div style={{ flex: 1, background: '#F5F6F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selectedUser ? (
          <div style={{
            background: '#fff', borderRadius: 12, padding: '32px 40px', width: 360,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: selectedUser.avatarColor, color: '#fff',
                fontSize: 28, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{selectedUser.initials}</div>
              <span style={{
                position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                background: getStatusColor(selectedUser.status), border: '2.5px solid #fff',
              }} />
            </div>

            <div style={{ fontWeight: 700, fontSize: 20, color: '#1F2329', marginBottom: 4 }}>{selectedUser.name}</div>
            <div style={{ fontSize: 14, color: '#8F959E', marginBottom: 16 }}>{selectedUser.englishName}</div>
            <div style={{ fontSize: 13, color: '#646A73', marginBottom: 6 }}>{selectedUser.title}</div>
            <div style={{ fontSize: 13, color: '#646A73', marginBottom: 20 }}>{selectedUser.department}</div>

            <div style={{ height: 1, background: '#DEE0E3', marginBottom: 16 }} />

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>📧</span>
                <span style={{ fontSize: 13, color: '#1F2329' }}>{selectedUser.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>📱</span>
                <span style={{ fontSize: 13, color: '#1F2329' }}>{selectedUser.phone}</span>
              </div>
            </div>

            {selectedUser.id !== currentUser.id && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleMessageUser(selectedUser)}
                  style={{
                    flex: 1, padding: '8px', border: '1px solid #3370FF', borderRadius: 8,
                    background: '#fff', color: '#3370FF', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  }}
                >
                  💬 发消息
                </button>
                <button style={{
                  flex: 1, padding: '8px', border: '1px solid #DEE0E3', borderRadius: 8,
                  background: '#fff', color: '#646A73', cursor: 'pointer', fontSize: 13,
                }}>
                  📹 视频通话
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8F959E', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            选择联系人查看详情
          </div>
        )}
      </div>
    </>
  );

  function getStatusColor(status) {
    return { online: '#34C724', busy: '#FF7D00', away: '#FAAD14', offline: '#8F959E' }[status] || '#8F959E';
  }
}
