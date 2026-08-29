import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './PageDetail.css';

export default function PageDetail() {
  const { courseId, pageUrl } = useParams();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const cid = parseInt(courseId);

  const page = state.pages.find(p => p.course_id === cid && p.url === pageUrl);
  const author = page ? state.users.find(u => u.id === page.last_edited_by) : null;

  if (!page) {
    return (
      <div className="page-detail-page">
        <h1>Page Not Found</h1>
        <p>The requested page could not be found.</p>
        <Link to={`/courses/${courseId}/pages`}>Back to Pages</Link>
      </div>
    );
  }

  return (
    <div className="page-detail-page">
      <div className="page-detail-header">
        <h1>{page.title}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/courses/${courseId}/pages/${pageUrl}/edit`)}>
          <Edit3 size={14} /> Edit
        </button>
      </div>
      <div className="page-detail-meta">
        <span>Last edited: {new Date(page.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        {author && <span> by {author.name}</span>}
      </div>
      <div className="page-detail-body" dangerouslySetInnerHTML={{ __html: page.body }} />
    </div>
  );
}
