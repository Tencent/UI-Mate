import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
  '最近': ['👍','🎉','❤️','😂','🤔','👏','🔥','✅','😊','🙏','😅','💪','👋','🎊','💯','⭐'],
  '笑脸': ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰'],
  '手势': ['👍','👎','👊','✊','🤛','🤜','🤝','👐','🙌','👏','🤲','🙏','✌️','🤞','🤟','🤘'],
  '心形': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖'],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('最近');
  const [search, setSearch] = useState('');

  const emojis = search
    ? Object.values(EMOJI_CATEGORIES).flat().filter((e, i, a) => a.indexOf(e) === i)
    : EMOJI_CATEGORIES[activeTab] || [];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
      <div style={{
        position: 'relative', zIndex: 30,
        background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        border: '1px solid #DEE0E3', width: 280,
      }}>
        {/* Search */}
        <div style={{ padding: '8px 10px 4px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索表情"
            style={{
              width: '100%', padding: '5px 10px', border: '1px solid #DEE0E3',
              borderRadius: 6, fontSize: 13, outline: 'none',
            }}
            autoFocus
          />
        </div>

        {/* Emoji grid */}
        <div style={{ padding: '4px 10px 8px', height: 200, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                style={{
                  width: 32, height: 32, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ borderTop: '1px solid #DEE0E3', display: 'flex', padding: '4px 6px' }}>
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setSearch(''); }}
              style={{
                flex: 1, padding: '4px 2px', border: 'none', cursor: 'pointer',
                background: activeTab === cat ? '#E1EAFF' : 'transparent',
                borderRadius: 4, fontSize: 11, color: activeTab === cat ? '#3370FF' : '#646A73',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
