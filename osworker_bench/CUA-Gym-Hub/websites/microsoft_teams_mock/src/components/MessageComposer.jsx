import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

const QUICK_EMOJIS = ['\u{1F44D}', '\u{1F389}', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE4C', '\uD83D\uDE0A', '\uD83D\uDE25', '\uD83D\uDC4F'];

export default function MessageComposer({ onSend, placeholder = 'Type a new message', teamMembers = null }) {
  const { state } = useApp();
  const [text, setText] = useState('');
  const [showFormatting, setShowFormatting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null); // null or string
  const [mentionResults, setMentionResults] = useState([]);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    setMentionQuery(null);
    setMentionResults([]);
    if (inputRef.current) inputRef.current.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (mentionResults.length > 0) {
        e.preventDefault();
        handleSelectMention(mentionResults[0]);
        return;
      }
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setMentionQuery(null);
      setMentionResults([]);
    }
  }

  function handleTextChange(e) {
    const val = e.target.value;
    setText(val);

    // Detect @mention
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      const query = atMatch[1].toLowerCase();
      setMentionQuery(query);
      const pool = teamMembers || state.users;
      const results = pool.filter(u =>
        u.userId !== state.currentUser.userId &&
        (u.displayName.toLowerCase().includes(query) || u.firstName.toLowerCase().startsWith(query))
      ).slice(0, 6);
      setMentionResults(results);
    } else {
      setMentionQuery(null);
      setMentionResults([]);
    }
  }

  function handleSelectMention(user) {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart;
    const textBefore = text.slice(0, cursorPos);
    const textAfter = text.slice(cursorPos);
    const replaced = textBefore.replace(/@(\w*)$/, `@${user.displayName} `);
    setText(replaced + textAfter);
    setMentionQuery(null);
    setMentionResults([]);
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = replaced.length;
        inputRef.current.setSelectionRange(newPos, newPos);
        inputRef.current.focus();
      }
    }, 0);
  }

  function handleFormat(tag) {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const selected = text.substring(start, end);
    let wrapped;
    if (tag === 'bold') wrapped = `**${selected || 'text'}**`;
    else if (tag === 'italic') wrapped = `_${selected || 'text'}_`;
    else if (tag === 'underline') wrapped = `__${selected || 'text'}__`;
    else if (tag === 'code') wrapped = `\`${selected || 'code'}\``;
    else return;
    const newText = text.substring(0, start) + wrapped + text.substring(end);
    setText(newText);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function insertEmoji(emoji) {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }

  return (
    <div className="composer" style={{ position: 'relative' }}>
      {/* @mention autocomplete dropdown */}
      {mentionResults.length > 0 && (
        <div className="mention-dropdown">
          {mentionResults.map(user => (
            <button key={user.userId} className="mention-item" onMouseDown={e => { e.preventDefault(); handleSelectMention(user); }}>
              <img src={user.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{user.displayName}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{user.jobTitle}</span>
            </button>
          ))}
        </div>
      )}
      <div className="composer-input-wrap">
        {showFormatting && (
          <div className="composer-format-bar">
            <button title="Bold" onClick={() => handleFormat('bold')}><strong>B</strong></button>
            <button title="Italic" onClick={() => handleFormat('italic')}><em>I</em></button>
            <button title="Underline" onClick={() => handleFormat('underline')}><u>U</u></button>
            <button title="Code" onClick={() => handleFormat('code')} style={{ fontFamily: 'monospace' }}>&lt;/&gt;</button>
          </div>
        )}
        <textarea
          ref={inputRef}
          className="composer-input"
          placeholder={placeholder}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>
      <div className="composer-toolbar">
        <div className="composer-toolbar-left">
          <button
            title="Format"
            onClick={() => setShowFormatting(!showFormatting)}
            style={{ fontWeight: showFormatting ? 600 : 400, color: showFormatting ? 'var(--brand-primary)' : undefined }}
          >A</button>
          <button title="Attach file" onClick={() => {
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('download', 'file');
            link.click();
          }}>&#128206;</button>
          <div style={{ position: 'relative' }} ref={emojiRef}>
            <button title="Emoji" onClick={() => setShowEmojiPicker(p => !p)}>&#128522;</button>
            {showEmojiPicker && (
              <div className="emoji-picker" style={{ bottom: '100%', top: 'auto', right: 0, left: 'auto', zIndex: 300 }}>
                <div className="emoji-quick-row" style={{ flexWrap: 'wrap', width: 200, gap: 4 }}>
                  {QUICK_EMOJIS.map(em => (
                    <button key={em} className="emoji-btn" onClick={() => insertEmoji(em)}>{em}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button title="Mention someone" onClick={() => {
            setText(prev => prev + '@');
            setTimeout(() => inputRef.current?.focus(), 0);
          }}>@</button>
        </div>
        <div className="composer-toolbar-right">
          <button
            className="send-btn"
            disabled={!text.trim()}
            onClick={handleSend}
            title="Send (Enter)"
          >
            &#9654;
          </button>
        </div>
      </div>
    </div>
  );
}
