import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './PageEditor.css';

export default function PageEditor() {
  const { courseId, pageUrl } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const isNew = pageUrl === 'new';

  const existingPage = !isNew ? state.pages.find(p => p.course_id === cid && p.url === pageUrl) : null;

  const [title, setTitle] = useState(existingPage?.title || '');
  const [body, setBody] = useState(existingPage?.body || '');
  const [frontPage, setFrontPage] = useState(existingPage?.front_page || false);

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const url = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isNew) {
      const newPage = {
        id: Math.max(0, ...state.pages.map(p => p.id)) + 1,
        course_id: cid,
        title: title.trim(),
        url,
        body: body,
        published: true,
        front_page: frontPage,
        created_at: now,
        updated_at: now,
        editing_roles: 'teachers',
        last_edited_by: state.currentUser.id
      };
      setState(prev => ({
        ...prev,
        pages: [
          ...(frontPage ? prev.pages.map(p => p.course_id === cid ? { ...p, front_page: false } : p) : prev.pages),
          newPage
        ]
      }));
      navigate(`/courses/${courseId}/pages/${url}`);
    } else {
      setState(prev => ({
        ...prev,
        pages: prev.pages.map(p => {
          if (p.course_id === cid && p.url === pageUrl) {
            return { ...p, title: title.trim(), body, front_page: frontPage, updated_at: now, last_edited_by: state.currentUser.id };
          }
          if (frontPage && p.course_id === cid && p.url !== pageUrl) {
            return { ...p, front_page: false };
          }
          return p;
        })
      }));
      navigate(`/courses/${courseId}/pages/${pageUrl}`);
    }
  };

  return (
    <div className="page-editor-page">
      <div className="page-editor-topbar">
        <button className="back-link" onClick={() => navigate(`/courses/${courseId}/pages`)}>
          <ArrowLeft size={16} /> All Pages
        </button>
      </div>

      <h1>{isNew ? 'New Page' : 'Edit Page'}</h1>

      <div className="page-editor-form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Page title"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Body</label>
          <textarea
            className="form-textarea page-editor-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={16}
            placeholder="Page content (HTML supported)..."
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox-label">
            <input type="checkbox" checked={frontPage} onChange={e => setFrontPage(e.target.checked)} />
            <span>Set as Front Page</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/courses/${courseId}/pages`)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!title.trim()}>Save</button>
        </div>
      </div>
    </div>
  );
}
