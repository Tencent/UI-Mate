import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';

const TOOLBAR_ITEMS = [
  ['H1', 'H1'], ['H2', 'H2'], ['H3', 'H3'], ['|'],
  ['B', 'bold'], ['I', 'italic'], ['S̶', 'strikethrough'], ['<>', 'code'], ['|'],
  ['•', 'bullet'], ['1.', 'ordered'], ['☐', 'checkbox'], ['|'],
  ['🔗', 'link'], ['📷', 'image'], ['⊞', 'table'], ['@', 'mention'],
];

const TOOLBAR_PREFIXES = {
  H1: '# ', H2: '## ', H3: '### ',
  '•': '- ',
  '1.': '1. ',
  '☐': '- [ ] ',
  '@': '@',
};

const TOOLBAR_WRAP = {
  bold: ['**', '**'],
  italic: ['_', '_'],
  'S̶': ['~~', '~~'],
  '<>': ['`', '`'],
  '🔗': ['[', '](url)'],
};

export default function DocEditor() {
  const { state, dispatch } = useApp();
  const { docId } = useParams();
  const navigate = useNavigate();
  const [titleFocused, setTitleFocused] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const contentRef = useRef(null);

  const doc = state.documents.find(d => d.id === docId);
  const owner = doc ? state.users.find(u => u.id === doc.ownerId) : null;
  const collaborators = doc ? state.users.filter(u => doc.collaborators.includes(u.id)) : [];

  const [title, setTitle] = useState(doc?.title || '');
  const [content, setContent] = useState(doc?.content || '');

  function handleTitleChange(e) {
    setTitle(e.target.value);
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: docId, title: e.target.value, lastEditedAt: Date.now(), lastEditedBy: state.currentUser.id } });
  }

  function handleContentChange(e) {
    setContent(e.target.value);
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: docId, content: e.target.value, lastEditedAt: Date.now(), lastEditedBy: state.currentUser.id } });
  }

  function applyToolbar(itemLabel) {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    let newContent = content;

    if (TOOLBAR_PREFIXES[itemLabel] !== undefined) {
      const prefix = TOOLBAR_PREFIXES[itemLabel];
      // Insert prefix at beginning of current line
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
      setContent(newContent);
      dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: docId, content: newContent, lastEditedAt: Date.now(), lastEditedBy: state.currentUser.id } });
      setTimeout(() => { ta.focus(); ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length + selected.length); }, 0);
      return;
    }

    if (TOOLBAR_WRAP[itemLabel]) {
      const [open, close] = TOOLBAR_WRAP[itemLabel];
      newContent = content.slice(0, start) + open + selected + close + content.slice(end);
      setContent(newContent);
      dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: docId, content: newContent, lastEditedAt: Date.now(), lastEditedBy: state.currentUser.id } });
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + open.length, start + open.length + selected.length); }, 0);
      return;
    }
  }

  function handleShare() {
    const shareUrl = window.location.href;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {});
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: docId, sharedAt: Date.now(), sharedBy: state.currentUser.id } });
    setShowShareModal(true);
  }

  if (!doc) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F959E' }}>
        文档不存在
        <button onClick={() => navigate('/docs')} style={{ marginLeft: 12, color: '#3370FF', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}>返回</button>
      </div>
    );
  }

  return (
    <>
      {/* Doc sidebar navigation */}
      <div style={{ width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DEE0E3', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 4, height: '100%' }}>
        <button
          onClick={() => navigate('/docs')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#646A73', fontSize: 13, borderRadius: 6, width: '90%' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          ← 返回云文档
        </button>
        <div style={{ width: '90%', height: 1, background: '#DEE0E3', margin: '8px 0' }} />
        <div style={{ padding: '4px 12px', width: '100%' }}>
          <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 8, fontWeight: 500 }}>文档详情</div>
          <div style={{ fontSize: 12, color: '#646A73', marginBottom: 4 }}>所有者：{owner?.name}</div>
          <div style={{ fontSize: 12, color: '#646A73', marginBottom: 4 }}>字数：{doc.wordCount || content.length}</div>
          <div style={{ fontSize: 12, color: '#646A73' }}>浏览：{doc.viewCount} 次</div>
        </div>
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F5F6F7', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DEE0E3', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 50, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>{doc.icon}</span>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#1F2329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || '未命名文档'}</div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_STAR_DOCUMENT', payload: docId })}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: doc.isStar ? '#FA8C16' : '#DEE0E3' }}
          >★</button>
          {/* Collaborator avatars */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[owner, ...collaborators].filter(Boolean).slice(0, 4).map(u => (
              <div key={u.id} title={u.name} style={{
                width: 26, height: 26, borderRadius: '50%', background: u.avatarColor,
                color: '#fff', fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>{u.initials}</div>
            ))}
          </div>
          <button style={{ padding: '5px 14px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }} onClick={handleShare}>分享</button>
        </div>

        {/* Share modal */}
        {showShareModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1F2329', marginBottom: 16 }}>分享文档</div>
              <div style={{ background: '#F5F6F7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#646A73', wordBreak: 'break-all', marginBottom: 16 }}>{window.location.href}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }}
                  style={{ flex: 1, padding: '8px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                >{shareCopied ? '已复制链接 ✓' : '复制链接'}</button>
                <button onClick={() => setShowShareModal(false)} style={{ padding: '8px 16px', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 13, color: '#646A73' }}>关闭</button>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 8, padding: '32px 48px', minHeight: '100%', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 16, padding: '6px 0', borderBottom: '1px solid #F0F1F2' }}>
              {TOOLBAR_ITEMS.map((item, i) => {
                if (item[0] === '|') return <div key={i} style={{ width: 1, background: '#DEE0E3', margin: '2px 4px' }} />;
                return (
                  <button
                    key={i}
                    title={item[1]}
                    onClick={() => applyToolbar(item[0])}
                    style={{
                      padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer',
                      borderRadius: 4, fontSize: 13, color: '#646A73', fontWeight: item[0] === 'B' ? 700 : item[0] === 'I' ? 400 : 400,
                      fontStyle: item[0] === 'I' ? 'italic' : 'normal',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {item[0]}
                  </button>
                );
              })}
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="请输入标题"
              style={{
                width: '100%', border: 'none', outline: 'none',
                fontSize: 28, fontWeight: 700, color: '#1F2329',
                fontFamily: 'inherit', marginBottom: 20, display: 'block',
              }}
            />

            {/* Content */}
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleContentChange}
              placeholder="开始编写内容..."
              style={{
                width: '100%', border: 'none', outline: 'none', resize: 'none',
                fontSize: 14, color: '#1F2329', lineHeight: '24px',
                fontFamily: 'inherit', minHeight: 400, display: 'block',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
