import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Star, FileText, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Pages.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Pages() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { state, setState } = useAppContext();
  const cid = parseInt(courseId);
  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');

  const pages = useMemo(() => {
    let p = state.pages.filter(pg => pg.course_id === cid);
    p.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'created') cmp = new Date(a.created_at) - new Date(b.created_at);
      else if (sortField === 'updated') cmp = new Date(a.updated_at) - new Date(b.updated_at);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return p;
  }, [state.pages, cid, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSetFrontPage = (pageId) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p =>
        p.course_id === cid
          ? { ...p, front_page: p.id === pageId }
          : p
      )
    }));
  };

  return (
    <div className="pages-page">
      <div className="pages-header">
        <h1>Pages</h1>
        <button className="btn btn-primary" onClick={() => navigate(`/courses/${courseId}/pages/new/edit`)}>
          <Plus size={16} /> Page
        </button>
      </div>

      <div className="pages-table-wrapper">
        <table className="pages-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th className="pages-th-sortable" onClick={() => toggleSort('title')}>
                Title <ArrowUpDown size={12} />
              </th>
              <th className="pages-th-sortable" onClick={() => toggleSort('created')}>
                Created <ArrowUpDown size={12} />
              </th>
              <th className="pages-th-sortable" onClick={() => toggleSort('updated')}>
                Last Edited <ArrowUpDown size={12} />
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td className="pages-front-page-cell">
                  <button
                    className={`pages-front-page-btn ${page.front_page ? 'active' : ''}`}
                    onClick={() => handleSetFrontPage(page.id)}
                    title={page.front_page ? 'Front Page' : 'Set as Front Page'}
                  >
                    <Star size={14} fill={page.front_page ? '#FC5E13' : 'none'} stroke={page.front_page ? '#FC5E13' : '#C7CDD1'} />
                  </button>
                </td>
                <td>
                  <Link to={`/courses/${courseId}/pages/${page.url}`} className="pages-title-link">
                    <FileText size={14} />
                    <span>{page.title}</span>
                  </Link>
                  {page.front_page && <span className="pages-front-label">Front Page</span>}
                </td>
                <td className="pages-date">{formatDate(page.created_at)}</td>
                <td className="pages-date">{formatDate(page.updated_at)}</td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="pages-empty">No pages found for this course.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
