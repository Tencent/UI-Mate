
import React, { useState } from 'react';
import './EmojiPicker.css';

const EMOJIS = [
  { category: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '👍', '👎', '👏', '🙌', '👋', '🤝', '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎'] },
  { category: 'Objects', emojis: ['⭐', '✨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🎯', '🎮', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎺', '🎷', '🎸', '🎻'] },
  { category: 'Nature', emojis: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌍', '🌎', '🌏', '🌙', '⭐', '🌟', '✨', '⚡', '🔥', '💧', '🌈'] },
  { category: 'Food', emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨'] }
];

function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = searchQuery
    ? EMOJIS.flatMap(cat => cat.emojis).filter(emoji => emoji.includes(searchQuery))
    : EMOJIS[activeCategory].emojis;

  return (
    <>
      <div className="emoji-picker-overlay" onClick={onClose} />
      <div className="emoji-picker">
        <div className="emoji-picker-header">
          <input
            type="text"
            className="emoji-search"
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!searchQuery && (
          <div className="emoji-categories">
            {EMOJIS.map((cat, idx) => (
              <button
                key={idx}
                className={`emoji-category-btn ${activeCategory === idx ? 'active' : ''}`}
                onClick={() => setActiveCategory(idx)}
              >
                {cat.emojis[0]}
              </button>
            ))}
          </div>
        )}
        <div className="emoji-grid">
          {filteredEmojis.map((emoji, idx) => (
            <button
              key={idx}
              className="emoji-btn"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default EmojiPicker;
