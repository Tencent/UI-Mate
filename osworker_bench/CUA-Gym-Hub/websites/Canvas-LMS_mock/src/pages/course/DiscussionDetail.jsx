import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Reply } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './DiscussionDetail.css';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#0374B5', '#EE0612', '#0B874B', '#FC5E13', '#6B3FA0', '#394B58', '#D97706', '#7C3AED'];
  return colors[userId % colors.length];
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function EntryThread({ entry, allEntries, users, depth, allowRating, onReply, onLike, replyingTo, setReplyingTo, replyText, setReplyText }) {
  const author = users.find(u => u.id === entry.user_id);
  const children = allEntries.filter(e => e.parent_id === entry.id);

  return (
    <div className="discussion-entry" style={{ marginLeft: depth * 24 }}>
      <div className="entry-header">
        <div className="avatar" style={{ background: getAvatarColor(entry.user_id), width: 32, height: 32, fontSize: 12 }}>
          {author ? getInitials(author.name) : '?'}
        </div>
        <div>
          <span className="entry-author">{author?.name || 'Unknown'}</span>
          <span className="entry-date">{timeAgo(entry.created_at)}</span>
        </div>
      </div>
      <div className="entry-body" dangerouslySetInnerHTML={{ __html: entry.message }} />
      <div className="entry-actions">
        <button className="entry-action-btn" onClick={() => setReplyingTo(replyingTo === entry.id ? null : entry.id)}>
          <Reply size={14} /> Reply
        </button>
        {allowRating && (
          <button className="entry-action-btn" onClick={() => onLike(entry.id)}>
            <ThumbsUp size={14} /> {entry.rating_count > 0 ? `(${entry.rating_count})` : 'Like'}
          </button>
        )}
      </div>
      {replyingTo === entry.id && (
        <div className="inline-reply-form">
          <textarea
            className="inline-reply-textarea"
            placeholder="Write a reply..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="inline-reply-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setReplyingTo(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => { onReply(entry.id); setReplyingTo(null); }} disabled={!replyText.trim()}>
              Post Reply
            </button>
          </div>
        </div>
      )}
      {children.map(child => (
        <EntryThread
          key={child.id}
          entry={child}
          allEntries={allEntries}
          users={users}
          depth={depth + 1}
          allowRating={allowRating}
          onReply={onReply}
          onLike={onLike}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
        />
      ))}
    </div>
  );
}

export default function DiscussionDetail() {
  const { courseId, topicId } = useParams();
  const { state, setState } = useAppContext();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [topLevelReply, setTopLevelReply] = useState('');

  const topic = (state.discussionTopics || []).find(
    t => t.id === parseInt(topicId) && t.course_id === parseInt(courseId)
  );

  if (!topic) {
    return (
      <div className="discussion-detail">
        <p>Discussion not found.</p>
        <Link to={`/courses/${courseId}/discussion_topics`}>Back to Discussions</Link>
      </div>
    );
  }

  const author = state.users.find(u => u.id === topic.author_id);
  const entries = (state.discussionEntries || []).filter(e => e.discussion_topic_id === topic.id);
  const topLevelEntries = entries.filter(e => e.parent_id === null);

  // Mark topic as read
  React.useEffect(() => {
    if (topic.read_state === 'unread') {
      setState(prev => ({
        ...prev,
        discussionTopics: prev.discussionTopics.map(t =>
          t.id === topic.id ? { ...t, read_state: 'read', unread_count: 0 } : t
        ),
        discussionEntries: prev.discussionEntries.map(e =>
          e.discussion_topic_id === topic.id ? { ...e, read_state: 'read' } : e
        )
      }));
    }
  }, [topic.id]);

  const handleReply = (parentId) => {
    if (!replyText.trim()) return;
    const newEntry = {
      id: Math.max(0, ...state.discussionEntries.map(e => e.id)) + 1,
      discussion_topic_id: topic.id,
      user_id: state.currentUser.id,
      message: `<p>${replyText.replace(/\n/g, '</p><p>')}</p>`,
      created_at: new Date().toISOString(),
      parent_id: parentId,
      read_state: 'read',
      rating_count: 0,
      rating_sum: 0
    };
    setState(prev => ({
      ...prev,
      discussionEntries: [...prev.discussionEntries, newEntry],
      discussionTopics: prev.discussionTopics.map(t =>
        t.id === topic.id ? {
          ...t,
          discussion_subentry_count: t.discussion_subentry_count + 1,
          last_reply_at: new Date().toISOString()
        } : t
      )
    }));
    setReplyText('');
  };

  const handleTopLevelReply = () => {
    if (!topLevelReply.trim()) return;
    const newEntry = {
      id: Math.max(0, ...state.discussionEntries.map(e => e.id)) + 1,
      discussion_topic_id: topic.id,
      user_id: state.currentUser.id,
      message: `<p>${topLevelReply.replace(/\n/g, '</p><p>')}</p>`,
      created_at: new Date().toISOString(),
      parent_id: null,
      read_state: 'read',
      rating_count: 0,
      rating_sum: 0
    };
    setState(prev => ({
      ...prev,
      discussionEntries: [...prev.discussionEntries, newEntry],
      discussionTopics: prev.discussionTopics.map(t =>
        t.id === topic.id ? {
          ...t,
          discussion_subentry_count: t.discussion_subentry_count + 1,
          last_reply_at: new Date().toISOString()
        } : t
      )
    }));
    setTopLevelReply('');
  };

  const handleLike = (entryId) => {
    setState(prev => ({
      ...prev,
      discussionEntries: prev.discussionEntries.map(e =>
        e.id === entryId ? { ...e, rating_count: e.rating_count + 1, rating_sum: e.rating_sum + 1 } : e
      )
    }));
  };

  return (
    <div className="discussion-detail">
      <div className="discussion-detail-topbar">
        <Link to={`/courses/${courseId}/discussion_topics`} className="back-link">
          <ArrowLeft size={16} /> All Discussions
        </Link>
      </div>

      <div className="discussion-detail-card">
        <div className="discussion-detail-header">
          <div className="avatar" style={{ background: getAvatarColor(topic.author_id), width: 40, height: 40, fontSize: 15 }}>
            {author ? getInitials(author.name) : '?'}
          </div>
          <div>
            <div className="discussion-detail-author">{author?.name || 'Unknown'}</div>
            <div className="discussion-detail-date">{formatDate(topic.posted_at)}</div>
          </div>
        </div>
        <h1 className="discussion-detail-title">{topic.title}</h1>
        <div className="discussion-detail-body" dangerouslySetInnerHTML={{ __html: topic.message }} />
        {topic.locked && (
          <div className="discussion-locked-banner">This discussion is closed for comments.</div>
        )}
      </div>

      <div className="discussion-entries-section">
        <h3>Replies ({entries.length})</h3>

        {topLevelEntries.map(entry => (
          <EntryThread
            key={entry.id}
            entry={entry}
            allEntries={entries}
            users={state.users}
            depth={0}
            allowRating={topic.allow_rating}
            onReply={handleReply}
            onLike={handleLike}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
          />
        ))}

        {!topic.locked && (
          <div className="top-level-reply-form">
            <h4>Post a Reply</h4>
            <textarea
              className="top-level-reply-textarea"
              placeholder="Write a reply..."
              value={topLevelReply}
              onChange={e => setTopLevelReply(e.target.value)}
              rows={4}
            />
            <div className="top-level-reply-actions">
              <button
                className="btn btn-primary"
                onClick={handleTopLevelReply}
                disabled={!topLevelReply.trim()}
              >
                Post Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
