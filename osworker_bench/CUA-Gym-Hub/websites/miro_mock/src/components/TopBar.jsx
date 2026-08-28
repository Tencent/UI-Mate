import React, { useState, useRef, useEffect } from 'react';
import {
  Settings, Bell, Upload, Search, ChevronRight, Zap,
  Clock, Camera, StickyNote, List, ChevronDown, Filter,
  MousePointerClick, Globe
} from 'lucide-react';

export default function TopBar({ boardName, onBoardNameChange, onGoHome, userName, onShowShortcuts, onShowShare }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(boardName);
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close notifications panel on outside click
  useEffect(() => {
    if (showNotifications) {
      function handleClick(e) {
        if (notifRef.current && !notifRef.current.contains(e.target)) {
          setShowNotifications(false);
        }
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showNotifications]);

  const handleStartEdit = () => {
    setEditValue(boardName);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onBoardNameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div className="top-bar">
      {/* Left section */}
      <div className="top-bar-left">
        <button className="top-bar-logo" onClick={onGoHome}>
          xiro
        </button>
        <div className="top-bar-divider" />
        {isEditing ? (
          <input
            ref={inputRef}
            className="board-name-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button className="board-name-display" onClick={handleStartEdit}>
            {boardName}
          </button>
        )}
        <div className="top-bar-icon-group">
          <button
            className="top-bar-icon-btn"
            title="Board settings"
            onClick={() => {/* Settings panel — future feature */}}
          >
            <Settings size={20} />
          </button>
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className="top-bar-icon-btn"
              title="Notifications"
              onClick={() => setShowNotifications(v => !v)}
            >
              <Bell size={20} />
            </button>
            {showNotifications && (
              <div className="topbar-dropdown" style={{ right: 0, left: 'auto', width: 280 }}>
                <div className="topbar-dropdown-header">Notifications</div>
                <div className="topbar-dropdown-empty">No new notifications</div>
              </div>
            )}
          </div>
          <button
            className="top-bar-icon-btn"
            title="Export / Download"
            onClick={() => {
              const data = JSON.stringify({ boardName, exportedAt: new Date().toISOString() }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${boardName.replace(/\s+/g, '_')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Upload size={20} />
          </button>
          <button
            className="top-bar-icon-btn"
            title="Search on board (coming soon)"
            onClick={() => {/* Board search - future feature */}}
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Center section */}
      <div className="top-bar-center">
        <button className="collab-btn" title="Previous frame" onClick={() => {/* Frame navigation */}}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button className="collab-btn" title="Start meeting" onClick={() => {/* Meeting */}}>
          <Zap size={16} />
          <span>Meeting</span>
        </button>
        <button className="collab-btn" title="Timer" onClick={() => {/* Timer */}}>
          <Clock size={16} />
        </button>
        <button className="collab-btn" title="Screen share" onClick={() => {/* Camera */}}>
          <Camera size={16} />
        </button>
        <button className="collab-btn" title="Sticky note pad" onClick={() => {/* Sticky notes panel */}}>
          <StickyNote size={16} />
        </button>
        <button className="collab-btn" title="Checklist" onClick={() => {/* List */}}>
          <List size={16} />
        </button>
        <button className="collab-btn" title="More collaboration tools" onClick={() => {/* More */}}>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Right section */}
      <div className="top-bar-right">
        <button
          className="top-bar-icon-btn"
          title="Filter items"
          onClick={() => {/* Filter panel - future feature */}}
        >
          <Filter size={20} />
        </button>
        <button
          className="top-bar-icon-btn"
          title="Cursor chat"
          onClick={() => {/* Cursor chat */}}
        >
          <MousePointerClick size={20} />
        </button>
        <button
          className="user-avatar"
          title={`Logged in as ${userName}`}
          style={{ cursor: 'pointer', border: '2px solid #ddd' }}
          onClick={() => {/* User profile menu */}}
        >
          {userName}
        </button>
        <button
          className="share-btn"
          onClick={onShowShare}
          title="Share this board"
        >
          <Globe size={14} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
