import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './AnnouncementDetail.css';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#0374B5', '#EE0612', '#0B874B', '#FC5E13', '#6B3FA0', '#394B58', '#D97706', '#7C3AED'];
  return colors[userId % colors.length];
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export default function AnnouncementDetail() {
  const { courseId, announcementId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const [replyText, setReplyText] = useState('');

  const announcement = (state.announcements || []).find(
    a => a.id === parseInt(announcementId) && a.course_id === parseInt(courseId)
  );

  if (!announcement) {
    return (
      <div className="announcement-detail">
        <p>Announcement not found.</p>
        <Link to={`/courses/${courseId}/announcements`}>Back to Announcements</Link>
      </div>
    );
  }

  const author = state.users.find(u => u.id === announcement.author_id);

  // Mark as read
  React.useEffect(() => {
    if (announcement.read_state === 'unread') {
      setState(prev => ({
        ...prev,
        announcements: prev.announcements.map(a =>
          a.id === announcement.id ? { ...a, read_state: 'read' } : a
        )
      }));
    }
  }, [announcement.id]);

  const handlePostReply = () => {
    if (!replyText.trim()) return;
    // For simplicity, we add a reply as a discussion-like entry tracked in state
    // Announcements don't have formal replies in our model, but we can add them
    const newReply = {
      id: Date.now(),
      announcement_id: announcement.id,
      user_id: state.currentUser.id,
      message: replyText.trim(),
      created_at: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      announcementReplies: [...(prev.announcementReplies || []), newReply]
    }));
    setReplyText('');
  };

  const replies = (state.announcementReplies || []).filter(
    r => r.announcement_id === announcement.id
  );

  return (
    <div className="announcement-detail">
      <div className="announcement-detail-topbar">
        <Link to={`/courses/${courseId}/announcements`} className="back-link">
          <ArrowLeft size={16} /> All Announcements
        </Link>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/courses/${courseId}/announcements/${announcement.id}/edit`)}
          style={{ display: 'none' }}
        >
          <Edit size={14} /> Edit
        </button>
      </div>

      <div className="announcement-detail-card">
        <div className="announcement-detail-header">
          <div className="avatar" style={{ background: getAvatarColor(announcement.author_id), width: 40, height: 40, fontSize: 15 }}>
            {author ? getInitials(author.name) : '?'}
          </div>
          <div>
            <div className="announcement-detail-author">{author?.name || 'Unknown'}</div>
            <div className="announcement-detail-date">{formatDate(announcement.posted_at)}</div>
          </div>
        </div>
        <h1 className="announcement-detail-title">{announcement.title}</h1>
        <div
          className="announcement-detail-body"
          dangerouslySetInnerHTML={{ __html: announcement.message }}
        />
      </div>

      <div className="announcement-replies-section">
        <h3>Replies ({replies.length})</h3>
        {replies.map(reply => {
          const replyAuthor = state.users.find(u => u.id === reply.user_id);
          return (
            <div key={reply.id} className="announcement-reply">
              <div className="avatar" style={{ background: getAvatarColor(reply.user_id) }}>
                {replyAuthor ? getInitials(replyAuthor.name) : '?'}
              </div>
              <div className="announcement-reply-content">
                <div className="announcement-reply-meta">
                  <span className="announcement-reply-author">{replyAuthor?.name || 'Unknown'}</span>
                  <span className="announcement-reply-date">{formatDate(reply.created_at)}</span>
                </div>
                <p className="announcement-reply-message">{reply.message}</p>
              </div>
            </div>
          );
        })}

        <div className="announcement-reply-form">
          <textarea
            className="announcement-reply-textarea"
            placeholder="Write a reply..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
          />
          <div className="announcement-reply-actions">
            <button className="btn btn-primary" onClick={handlePostReply} disabled={!replyText.trim()}>
              Post Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
