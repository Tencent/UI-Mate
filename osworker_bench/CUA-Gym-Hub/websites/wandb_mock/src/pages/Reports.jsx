import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Eye, Trash2, MoreHorizontal, X } from 'lucide-react';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function DeleteReportModal({ report, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">Delete Report</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Are you sure you want to delete <strong>"{report.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button className="btn-danger" onClick={onConfirm}>Delete Report</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);
  const projectReports = state.reports.filter(r => r.projectId === (proj?.id || ''));
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const handleCreate = () => {
    const report = {
      id: `report-${Date.now()}`,
      title: 'Untitled Report',
      projectId: proj.id,
      description: '',
      authorId: state.currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      blocks: [
        { type: 'heading', level: 1, text: 'Untitled Report' },
        { type: 'paragraph', text: 'Start writing your report here...' }
      ]
    };
    dispatch({ type: 'CREATE_REPORT', payload: report });
    navigate(`/${entity}/${project}/reports/${report.id}`);
  };

  const handleDelete = (report) => {
    dispatch({ type: 'DELETE_REPORT', payload: report.id });
    setDeleteTarget(null);
    setMenuOpen(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <button className="btn-blue" onClick={handleCreate}>
          <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Create Report
        </button>
      </div>
      {projectReports.length === 0 ? (
        <p className="text-muted">No reports yet. Create one to document your experiment findings.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projectReports.map(report => {
            const author = state.users.find(u => u.id === report.authorId);
            return (
              <div
                key={report.id}
                className="card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => { if (menuOpen !== report.id) navigate(`/${entity}/${project}/reports/${report.id}`); }}
              >
                {/* Report menu button */}
                <div
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMenuOpen(menuOpen === report.id ? null : report.id)}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                    title="More options"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {menuOpen === report.id && (
                    <div className="dropdown-panel" style={{ position: 'absolute', top: 24, right: 0, zIndex: 50, minWidth: 140 }}>
                      <button
                        className="dropdown-item flex items-center gap-2"
                        style={{ padding: '6px 12px', width: '100%', textAlign: 'left', fontSize: 13, cursor: 'pointer' }}
                        onClick={() => { navigate(`/${entity}/${project}/reports/${report.id}`); setMenuOpen(null); }}
                      >
                        Open report
                      </button>
                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '2px 0' }} />
                      <button
                        className="dropdown-item flex items-center gap-2"
                        style={{ padding: '6px 12px', width: '100%', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: 'var(--error-red)' }}
                        onClick={() => { setDeleteTarget(report); setMenuOpen(null); }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, paddingRight: 24 }}>{report.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {author && (
                    <div className="user-avatar" style={{ width: 20, height: 20, fontSize: 10 }}>
                      {author.name.split(' ').map(w => w[0]).join('')}
                    </div>
                  )}
                  <span className="text-muted text-small">{author?.name || 'Unknown'}</span>
                </div>
                {report.description && (
                  <p className="text-muted text-small mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-muted text-small">
                  <span>{timeAgo(report.updatedAt)}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {report.viewCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <DeleteReportModal
          report={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
