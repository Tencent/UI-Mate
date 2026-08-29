import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Pin, MoreVertical, CheckCircle, Circle, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Discussions.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Discussions() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const topics = (state.discussionTopics || []).filter(t => t.course_id === cid);
  const pinned = topics.filter(t => t.pinned);
  const regular = topics.filter(t => !t.pinned);

  const getAuthor = (authorId) => state.users.find(u => u.id === authorId);

  const togglePublish = (topicId) => {
    setState(prev => ({
      ...prev,
      discussionTopics: prev.discussionTopics.map(t =>
        t.id === topicId ? { ...t, published: !t.published } : t
      )
    }));
  };

  const togglePin = (topicId) => {
    setState(prev => ({
      ...prev,
      discussionTopics: prev.discussionTopics.map(t =>
        t.id === topicId ? { ...t, pinned: !t.pinned } : t
      )
    }));
    setMenuOpenId(null);
  };

  const toggleLock = (topicId) => {
    setState(prev => ({
      ...prev,
      discussionTopics: prev.discussionTopics.map(t =>
        t.id === topicId ? { ...t, locked: !t.locked } : t
      )
    }));
    setMenuOpenId(null);
  };

  const deleteTopic = (topicId) => {
    setState(prev => ({
      ...prev,
      discussionTopics: prev.discussionTopics.filter(t => t.id !== topicId)
    }));
    setMenuOpenId(null);
  };

  const renderTopicRow = (topic) => {
    const author = getAuthor(topic.author_id);
    return (
      <div key={topic.id} className={`discussion-row ${topic.read_state === 'unread' ? 'unread' : ''}`}>
        <div className="discussion-row-left">
          {topic.pinned && <Pin size={14} className="pin-icon" />}
          <div className="discussion-info">
            <Link
              to={`/courses/${courseId}/discussion_topics/${topic.id}`}
              className="discussion-title"
            >
              {topic.title}
            </Link>
            <div className="discussion-meta">
              <span>{author?.name || 'Unknown'}</span>
              <span className="meta-sep">|</span>
              <span>{formatDate(topic.posted_at)}</span>
              {topic.last_reply_at && (
                <>
                  <span className="meta-sep">|</span>
                  <span>Last reply {timeAgo(topic.last_reply_at)}</span>
                </>
              )}
              <span className="meta-sep">|</span>
              <span>{topic.discussion_subentry_count} {topic.discussion_subentry_count === 1 ? 'reply' : 'replies'}</span>
            </div>
          </div>
        </div>
        <div className="discussion-row-right">
          {topic.unread_count > 0 && (
            <span className="badge badge-primary">{topic.unread_count} unread</span>
          )}
          <button
            className="discussion-publish-toggle"
            onClick={(e) => { e.stopPropagation(); togglePublish(topic.id); }}
            title={topic.published ? 'Published' : 'Unpublished'}
          >
            {topic.published ? (
              <CheckCircle size={18} className="published-icon" />
            ) : (
              <Circle size={18} className="unpublished-icon" />
            )}
          </button>
          <div className="discussion-menu-wrapper">
            <button
              className="discussion-kebab"
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === topic.id ? null : topic.id); }}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpenId === topic.id && (
              <div className="discussion-dropdown-menu">
                <button className="discussion-dropdown-item" onClick={() => { navigate(`/courses/${courseId}/discussion_topics/${topic.id}`); setMenuOpenId(null); }}>
                  View
                </button>
                <button className="discussion-dropdown-item" onClick={() => togglePin(topic.id)}>
                  {topic.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button className="discussion-dropdown-item" onClick={() => toggleLock(topic.id)}>
                  {topic.locked ? 'Open for comments' : 'Close for comments'}
                </button>
                <button className="discussion-dropdown-item discussion-dropdown-danger" onClick={() => deleteTopic(topic.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="discussions-page">
      <div className="discussions-header">
        <h1>Discussions</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/courses/${courseId}/discussion_topics/new`)}
        >
          <Plus size={16} /> Discussion
        </button>
      </div>

      {pinned.length > 0 && (
        <div className="discussions-section">
          <div className="discussions-section-header">
            <Pin size={14} />
            <span>Pinned Discussions</span>
          </div>
          <div className="discussions-list">
            {pinned.map(renderTopicRow)}
          </div>
        </div>
      )}

      <div className="discussions-section">
        <div className="discussions-section-header">
          <MessageCircle size={14} />
          <span>Discussions</span>
        </div>
        {regular.length === 0 && pinned.length === 0 ? (
          <div className="discussions-empty">
            <MessageCircle size={48} strokeWidth={1} />
            <p>No discussions yet.</p>
          </div>
        ) : (
          <div className="discussions-list">
            {regular.map(renderTopicRow)}
          </div>
        )}
      </div>
    </div>
  );
}
