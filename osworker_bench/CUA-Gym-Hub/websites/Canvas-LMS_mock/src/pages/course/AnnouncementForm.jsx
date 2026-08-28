import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './AnnouncementForm.css';

export default function AnnouncementForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [postTo, setPostTo] = useState('all');
  const [allowComments, setAllowComments] = useState(true);
  const [delayPosting, setDelayPosting] = useState(false);
  const [delayDate, setDelayDate] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    const newAnnouncement = {
      id: Math.max(0, ...state.announcements.map(a => a.id)) + 1,
      course_id: cid,
      title: title.trim(),
      message: `<p>${message.replace(/\n/g, '</p><p>')}</p>`,
      author_id: state.currentUser.id,
      posted_at: delayPosting && delayDate ? new Date(delayDate).toISOString() : new Date().toISOString(),
      read_state: 'read',
      published: true
    };
    setState(prev => ({
      ...prev,
      announcements: [newAnnouncement, ...prev.announcements]
    }));
    navigate(`/courses/${courseId}/announcements`);
  };

  const handleCancel = () => {
    navigate(`/courses/${courseId}/announcements`);
  };

  return (
    <div className="announcement-form-page">
      <div className="announcement-form-topbar">
        <Link to={`/courses/${courseId}/announcements`} className="back-link">
          <ArrowLeft size={16} /> All Announcements
        </Link>
      </div>

      <h1>New Announcement</h1>

      <div className="announcement-form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter announcement title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            placeholder="Write your announcement..."
            rows={8}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Post to</label>
          <select
            className="form-select"
            value={postTo}
            onChange={e => setPostTo(e.target.value)}
          >
            <option value="all">All Sections</option>
            <option value="section1">Section 1</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Options</label>
          <div className="form-checkbox-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={e => setAllowComments(e.target.checked)}
              />
              <span>Allow user comments</span>
            </label>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={delayPosting}
                onChange={e => setDelayPosting(e.target.checked)}
              />
              <span>Delay posting</span>
            </label>
            {delayPosting && (
              <div className="delay-posting-date">
                <input
                  type="datetime-local"
                  className="form-input"
                  value={delayDate}
                  onChange={e => setDelayDate(e.target.value)}
                />
              </div>
            )}
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
