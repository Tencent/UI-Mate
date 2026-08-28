
import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdownSyntax } from '../utils/markdownParser';
import { validateFile, formatFileSize } from '../utils/fileHandler';
import EmojiPicker from './EmojiPicker';
import MentionAutocomplete from './MentionAutocomplete';
import { useApp } from '../context/AppContext';
import './MessageComposer.css';

function MessageComposer({ placeholder, onSend, channelId, dmId, threadId }) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(true);
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { state, showToast } = useApp();

  // Check for @ mention trigger
  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(' ') && lastAtIndex === cursorPos - textAfterAt.length - 1) {
        setShowMentionAutocomplete(true);
        setMentionQuery(textAfterAt.toLowerCase());
        return;
      }
    }

    setShowMentionAutocomplete(false);
    setMentionQuery('');
  }, [content, cursorPosition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    // Extract mentions from content
    const mentionRegex = /@\[(.*?):(.*?)\]/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]); // userId
    }

    onSend(content, attachments, mentions, threadId);
    setContent('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }

    // Update cursor position for mention detection
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleFormatting = (syntax) => {
    if (textareaRef.current) {
      insertMarkdownSyntax(textareaRef.current, syntax, true);
      setContent(textareaRef.current.value);
      textareaRef.current.focus();
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0]; // Handle one file at a time for simplicity

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        showToast(validation.errors.join('. '), 'error');
        return;
      }

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      // Get sid from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const sid = urlParams.get('sid') || '';
      const uploadUrl = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success && result.files && result.files.length > 0) {
        const uploaded = result.files[0];
        const isImage = file.type.startsWith('image/');
        const attachment = {
          type: isImage ? 'image' : 'file',
          name: uploaded.original_name,
          size: formatFileSize(uploaded.size),
          url: uploaded.url,
          mimeType: file.type,
        };
        setAttachments([...attachments, attachment]);
        showToast(`File attached: ${file.name}`);
      }
    } catch (error) {
      showToast(error.message || 'Failed to upload file', 'error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);

      // Set cursor after emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleMentionSelect = (user) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newContent =
        content.substring(0, lastAtIndex) +
        `@[${user.userId}:${user.displayName}] ` +
        content.substring(cursorPos);

      setContent(newContent);
      setShowMentionAutocomplete(false);

      // Focus textarea
      setTimeout(() => {
        const newPos = lastAtIndex + `@[${user.userId}:${user.displayName}] `.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  };

  const hasContent = content.trim().length > 0 || attachments.length > 0;

  return (
    <div className="message-composer">
      <form onSubmit={handleSubmit}>
        <div className="composer-container">
          {attachments.length > 0 && (
            <div className="composer-attachments">
              {attachments.map((attachment, index) => (
                <div key={index} className="attachment-preview">
                  {attachment.type === 'image' ? (
                    <img src={attachment.url} alt={attachment.name} className="attachment-preview-image" />
                  ) : (
                    <div className="attachment-file-preview">
                      <span className="file-icon">&#128206;</span>
                      <span className="file-name">{attachment.name}</span>
                      <span className="file-size">({attachment.size})</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-attachment-btn"
                    onClick={() => handleRemoveAttachment(index)}
                    title="Remove attachment"
                  >
                    &#215;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="composer-toolbar" style={{ display: showFormattingToolbar ? 'flex' : 'none' }}>
            <button type="button" className="toolbar-btn" title="Bold" onClick={() => handleFormatting('bold')}>
              <strong>B</strong>
            </button>
            <button type="button" className="toolbar-btn" title="Italic" onClick={() => handleFormatting('italic')}>
              <em>I</em>
            </button>
            <button type="button" className="toolbar-btn" title="Strikethrough" onClick={() => handleFormatting('strikethrough')}>
              <s>S</s>
            </button>
            <button type="button" className="toolbar-btn" title="Code" onClick={() => handleFormatting('code')}>
              {'</>'}
            </button>
            <button type="button" className="toolbar-btn" title="Link" onClick={() => handleFormatting('link')}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9.5a2 2 0 0 1 0 2.5H4a2 2 0 1 1 0-4h2.354M9.646 10.5H12a3 3 0 0 0 0-6H9a3 3 0 0 0-2.83 4H6.5a2 2 0 0 1 0-2.5H12a2 2 0 1 1 0 4H9.646"/></svg>
            </button>
            <span style={{ width: '1px', height: '16px', background: '#DDDDDD', margin: '0 4px' }} />
            <button type="button" className="toolbar-btn" title="Ordered list" onClick={() => handleFormatting('orderedList')}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 3h1v3H2V3zm0 5h1v3H2V8zm0 5h1v3H2v-3zM5 3.5h10v1H5v-1zm0 5h10v1H5v-1zm0 5h10v1H5v-1z"/></svg>
            </button>
            <button type="button" className="toolbar-btn" title="Bullet list" onClick={() => handleFormatting('bulletList')}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 3.5h10v1H5v-1zm0 5h10v1H5v-1zm0 5h10v1H5v-1z"/></svg>
            </button>
            <button type="button" className="toolbar-btn" title="Block quote" onClick={() => handleFormatting('blockquote')}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 3v10h1V3H2zm3 0v1h10V3H5zm0 4v1h10V7H5zm0 4v1h8v-1H5z"/></svg>
            </button>
            <button type="button" className="toolbar-btn" title="Code block" onClick={() => handleFormatting('codeBlock')}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5.854 4.146a.5.5 0 0 1 0 .708L2.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm4.292 0a.5.5 0 0 0 0 .708L13.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/></svg>
            </button>
          </div>

          <div className="composer-input-wrapper">
            <textarea
              ref={textareaRef}
              className="composer-input"
              placeholder={placeholder}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyDown={handleKeyDown}
              onClick={(e) => setCursorPosition(e.target.selectionStart)}
              rows={1}
            />

            {showMentionAutocomplete && state && (
              <MentionAutocomplete
                users={state.users}
                query={mentionQuery}
                onSelect={handleMentionSelect}
                onClose={() => setShowMentionAutocomplete(false)}
              />
            )}
          </div>

          <div className="composer-actions">
            <div className="composer-actions-left">
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              />
              <button
                type="button"
                className="action-btn"
                title="Attach file (Max 5MB)"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 8 1z"/></svg>
              </button>
              <button
                type="button"
                className="action-btn"
                title="Insert emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM7 8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4.2 3a.75.75 0 0 1 1.05-.15c.7.5 1.4.75 2.15.75s1.45-.25 2.15-.75a.75.75 0 1 1 .9 1.2A4.77 4.77 0 0 1 10 13.5a4.77 4.77 0 0 1-3.05-1.05.75.75 0 0 1-.15-1.05z"/></svg>
              </button>
              <button
                type="button"
                className="action-btn"
                title="Mention user (@)"
                onClick={() => {
                  if (textareaRef.current) {
                    const textarea = textareaRef.current;
                    const start = textarea.selectionStart;
                    const newContent = content.substring(0, start) + '@' + content.substring(start);
                    setContent(newContent);
                    setTimeout(() => {
                      textarea.setSelectionRange(start + 1, start + 1);
                      textarea.focus();
                    }, 0);
                  }
                }}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1a7 7 0 1 0 2.685 13.469l-.537-.844A6 6 0 1 1 14 8c0 1.38-.56 2.5-1.25 2.5S11.5 9.38 11.5 8V5.5H10.5v.63A3.5 3.5 0 1 0 10.75 9.55c.37.93 1.12 1.45 2 1.45C14.13 11 15 9.38 15 8a7 7 0 0 0-7-7zm0 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>
              </button>
              <button
                type="button"
                className={`action-btn ${showFormattingToolbar ? 'active' : ''}`}
                title="Formatting"
                onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
                style={{ fontWeight: '700', fontSize: '13px' }}
              >
                Aa
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="submit"
                className={`send-btn ${hasContent ? 'has-content' : ''}`}
                disabled={!hasContent}
                title="Send message"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M1.87 1.11a.75.75 0 0 1 .83-.22l15.5 6a.75.75 0 0 1 0 1.4l-15.5 6a.75.75 0 0 1-1.01-.95L3.88 10 1.69 6.66a.75.75 0 0 1 .18-1.55zM4.42 9.25L3.26 12.4 15.16 7.8 3.26 3.2l1.16 3.15a.75.75 0 0 1 0 .4L4.42 9.25z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </form>

      {showEmojiPicker && (
        <div style={{ position: 'absolute', bottom: '100%', left: '10px', zIndex: 1000 }}>
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

export default MessageComposer;
