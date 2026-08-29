import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './DiscussionForm.css';

export default function DiscussionForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [threaded, setThreaded] = useState(true);
  const [mustPostFirst, setMustPostFirst] = useState(false);
  const [graded, setGraded] = useState(false);
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [allowLiking, setAllowLiking] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    const newTopic = {
      id: Math.max(0, ...state.discussionTopics.map(t => t.id)) + 1,
      course_id: cid,
      title: title.trim(),
      message: `<p>${message.replace(/\n/g, '</p><p>')}</p>`,
      author_id: state.currentUser.id,
      posted_at: new Date().toISOString(),
      last_reply_at: null,
      discussion_type: threaded ? 'threaded' : 'side_comment',
      published: true,
      pinned: false,
      locked: false,
      allow_rating: allowLiking,
      require_initial_post: mustPostFirst,
      read_state: 'read',
      unread_count: 0,
      discussion_subentry_count: 0,
      assignment_id: null
    };
    setState(prev => ({
      ...prev,
      discussionTopics: [...prev.discussionTopics, newTopic]
    }));
    navigate(`/courses/${courseId}/discussion_topics`);
  };

  const handleCancel = () => {
    navigate(`/courses/${courseId}/discussion_topics`);
  };

  return (
    <div className="discussion-form-page">
      <div className="discussion-form-topbar">
        <Link to={`/courses/${courseId}/discussion_topics`} className="back-link">
          <ArrowLeft size={16} /> All Discussions
        </Link>
      </div>

      <h1>New Discussion</h1>

      <div className="discussion-form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter discussion title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            placeholder="Write your discussion prompt..."
            rows={8}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Options</label>
          <div className="form-checkbox-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={threaded}
                onChange={e => setThreaded(e.target.checked)}
              />
              <span>Allow threaded replies</span>
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={mustPostFirst}
                onChange={e => setMustPostFirst(e.target.checked)}
              />
              <span>Users must post before seeing replies</span>
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={graded}
                onChange={e => setGraded(e.target.checked)}
              />
              <span>Graded</span>
            </label>
            {graded && (
              <div className="graded-options">
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Points</label>
                  <input
                    type="number"
                    className="form-input"
                    value={points}
                    onChange={e => setPoints(Number(e.target.value))}
                    min={0}
                    style={{ maxWidth: 120 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Due Date</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{ maxWidth: 280 }}
                  />
                </div>
              </div>
            )}
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={allowLiking}
                onChange={e => setAllowLiking(e.target.checked)}
              />
              <span>Allow liking</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
