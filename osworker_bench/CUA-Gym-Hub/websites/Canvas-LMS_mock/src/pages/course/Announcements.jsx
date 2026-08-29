import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Megaphone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Announcements.css';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#0374B5', '#EE0612', '#0B874B', '#FC5E13', '#6B3FA0', '#394B58', '#D97706', '#7C3AED'];
  return colors[userId % colors.length];
}

export default function Announcements() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const cid = parseInt(courseId);

  const announcements = (state.announcements || [])
    .filter(a => a.course_id === cid)
    .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));

  const getAuthor = (authorId) => state.users.find(u => u.id === authorId);

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <h1>Announcements</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/courses/${courseId}/announcements/new`)}
        >
          <Plus size={16} /> Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="announcements-empty">
          <Megaphone size={48} strokeWidth={1} />
          <p>No announcements yet.</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map(ann => {
            const author = getAuthor(ann.author_id);
            const preview = ann.message.replace(/<[^>]*>/g, '').substring(0, 120);
            return (
              <div key={ann.id} className={`announcement-card ${ann.read_state === 'unread' ? 'unread' : ''}`}>
                {ann.read_state === 'unread' && <div className="unread-indicator" />}
                <div className="announcement-avatar">
                  <div className="avatar" style={{ background: getAvatarColor(ann.author_id) }}>
                    {author ? getInitials(author.name) : '?'}
                  </div>
                </div>
                <div className="announcement-content">
                  <div className="announcement-meta">
                    <span className="announcement-author">{author?.name || 'Unknown'}</span>
                    <span className="announcement-date">{timeAgo(ann.posted_at)}</span>
                  </div>
                  <Link
                    to={`/courses/${courseId}/announcements/${ann.id}`}
                    className="announcement-title"
                  >
                    {ann.title}
                  </Link>
                  <p className="announcement-preview">{preview}{preview.length >= 120 ? '...' : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
