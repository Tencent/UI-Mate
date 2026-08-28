import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'home', label: '主页', icon: '🏠' },
  { id: 'my-space', label: '我的空间', icon: '📁', spaceId: 'space_1' },
  { id: 'shared', label: '共享空间', icon: '👥', spaceId: 'space_2' },
  { id: 'wiki', label: '知识库', icon: '📚', spaceId: 'space_3' },
  { id: 'favorites', label: '收藏', icon: '⭐' },
  { id: 'trash', label: '回收站', icon: '🗑️' },
];

const FILTER_TABS = ['最近', '我创建的', '与我共享'];
const SORT_OPTIONS = ['最近编辑', '标题', '创建时间'];

export default function DocsModule() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [filter, setFilter] = useState('最近');
  const [sort, setSort] = useState('最近编辑');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showNewMenu, setShowNewMenu] = useState(false);

  const { currentUser, documents, users } = state;

  function getDocsByNav() {
    switch (activeNav) {
      case 'home':
        if (filter === '最近') return [...documents].sort((a, b) => b.lastEditedAt - a.lastEditedAt);
        if (filter === '我创建的') return documents.filter(d => d.ownerId === currentUser.id);
        if (filter === '与我共享') return documents.filter(d => d.collaborators.includes(currentUser.id));
        return documents;
      case 'my-space': return documents.filter(d => d.spaceId === 'space_1');
      case 'shared': return documents.filter(d => d.spaceId === 'space_2');
      case 'wiki': return documents.filter(d => d.spaceId === 'space_3');
      case 'favorites': return documents.filter(d => d.isStar);
      default: return [];
    }
  }

  function sortDocs(docs) {
    if (sort === '最近编辑') return [...docs].sort((a, b) => b.lastEditedAt - a.lastEditedAt);
    if (sort === '标题') return [...docs].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === '创建时间') return [...docs].sort((a, b) => b.createdAt - a.createdAt);
    return docs;
  }

  const displayDocs = sortDocs(getDocsByNav());

  function formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)}天前`;
    const d = new Date(ts);
    return `${d.getMonth()+1}月${d.getDate()}日`;
  }

  function createNewDoc(type) {
    const iconMap = { doc: '📄', sheet: '📊', bitable: '📋' };
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: type === 'doc' ? '未命名文档' : type === 'sheet' ? '未命名表格' : '未命名多维表格',
      type,
      icon: iconMap[type],
      ownerId: currentUser.id,
      collaborators: [],
      content: '',
      spaceId: 'space_1',
      parentId: null,
      isStar: false,
      lastEditedBy: currentUser.id,
      lastEditedAt: Date.now(),
      createdAt: Date.now(),
      viewCount: 0,
      wordCount: 0,
    };
    dispatch({ type: 'CREATE_DOCUMENT', payload: newDoc });
    navigate(`/docs/${newDoc.id}`);
    setShowNewMenu(false);
  }

  const sectionTitle = NAV_ITEMS.find(n => n.id === activeNav)?.label || '主页';

  return (
    <>
      {/* Module Panel — Doc Sidebar */}
      <div style={{
        width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DEE0E3',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid #F0F1F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>☁️</span>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#1F2329' }}>飞书云文档</span>
          </div>
          {/* New button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNewMenu(p => !p)}
              style={{
                width: '100%', padding: '7px 12px', background: '#3370FF', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 16 }}>+</span> 新建
            </button>
            {showNewMenu && (
              <>
                <div onClick={() => setShowNewMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                  background: '#fff', border: '1px solid #DEE0E3', borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, padding: '4px 0',
                }}>
                  {[['doc','📄 文档'],['sheet','📊 表格'],['bitable','📋 多维表格']].map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => createNewDoc(type)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                        border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#1F2329',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeNav === item.id ? '#E1EAFF' : 'transparent',
                color: activeNav === item.id ? '#3370FF' : '#1F2329',
                fontSize: 13, fontWeight: activeNav === item.id ? 500 : 400,
              }}
              onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = '#F0F1F2'; }}
              onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F5F6F7' }}>
        {/* Toolbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 18, color: '#1F2329', margin: 0 }}>{sectionTitle}</h2>
          <div style={{ flex: 1 }} />
          {/* Filter tabs */}
          {activeNav === 'home' && (
            <div style={{ display: 'flex', gap: 2, border: '1px solid #DEE0E3', borderRadius: 6, overflow: 'hidden' }}>
              {FILTER_TABS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: 13,
                    background: filter === f ? '#E1EAFF' : '#fff',
                    color: filter === f ? '#3370FF' : '#646A73',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #DEE0E3', borderRadius: 6, fontSize: 13, color: '#646A73', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #DEE0E3', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '4px 8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#E1EAFF' : '#fff', color: viewMode === 'grid' ? '#3370FF' : '#646A73' }}>⊞</button>
            <button onClick={() => setViewMode('list')} style={{ padding: '4px 8px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#E1EAFF' : '#fff', color: viewMode === 'list' ? '#3370FF' : '#646A73' }}>☰</button>
          </div>
        </div>

        {/* Doc list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {displayDocs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#8F959E', fontSize: 14, marginTop: 60 }}>暂无文档</div>
          )}

          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {displayDocs.map(doc => (
                <DocCard key={doc.id} doc={doc} users={users} formatTime={formatTime} onOpen={() => navigate(`/docs/${doc.id}`)} onStar={() => dispatch({ type: 'TOGGLE_STAR_DOCUMENT', payload: doc.id })} />
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 100px', gap: 0, borderBottom: '1px solid #DEE0E3', paddingBottom: 8, marginBottom: 4 }}>
                {['名称', '所有者', '最近编辑', ''].map(h => (
                  <div key={h} style={{ fontSize: 12, color: '#8F959E', fontWeight: 500, padding: '0 8px' }}>{h}</div>
                ))}
              </div>
              {displayDocs.map(doc => (
                <DocListRow key={doc.id} doc={doc} users={users} formatTime={formatTime} onOpen={() => navigate(`/docs/${doc.id}`)} onStar={() => dispatch({ type: 'TOGGLE_STAR_DOCUMENT', payload: doc.id })} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DocCard({ doc, users, formatTime, onOpen, onStar }) {
  const owner = users.find(u => u.id === doc.ownerId);
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff', borderRadius: 8, padding: '14px 14px 10px',
        cursor: 'pointer', border: '1px solid #DEE0E3', height: 160,
        display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{doc.icon}</div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1F2329', lineHeight: '20px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {doc.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: owner?.avatarColor || '#8F959E',
          color: '#fff', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{owner?.initials}</div>
        <span style={{ fontSize: 11, color: '#8F959E', flex: 1 }}>编辑于 {formatTime(doc.lastEditedAt)}</span>
        <button
          onClick={e => { e.stopPropagation(); onStar(); }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: doc.isStar ? '#FA8C16' : '#DEE0E3' }}
        >★</button>
      </div>
    </div>
  );
}

function DocListRow({ doc, users, formatTime, onOpen, onStar }) {
  const owner = users.find(u => u.id === doc.ownerId);
  return (
    <div
      onClick={onOpen}
      style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 100px', borderBottom: '1px solid #F0F1F2', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{doc.icon}</span>
        <span style={{ fontSize: 13, color: '#1F2329' }}>{doc.title}</span>
        <button
          onClick={e => { e.stopPropagation(); onStar(); }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: doc.isStar ? '#FA8C16' : 'transparent', marginLeft: 'auto' }}
        >★</button>
      </div>
      <div style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', fontSize: 12, color: '#646A73' }}>
        {owner?.name}
      </div>
      <div style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', fontSize: 12, color: '#646A73' }}>
        {formatTime(doc.lastEditedAt)}
      </div>
      <div style={{ padding: '10px 8px' }} />
    </div>
  );
}
