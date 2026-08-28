import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Printer, Download, FolderPlus, Copy } from 'lucide-react';

export default function StatuteView() {
  const { id } = useParams();
  const { state, dispatch } = useApp();

  const doc = (state.statutes || []).find(s => s.id === id);
  if (!doc) {
    return (
      <div className="no-results">
        <h3>Statute not found</h3>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="document-layout">
      <aside className="doc-toc-sidebar">
        <div className="doc-toc-heading">Statute Outline</div>
        <a className="doc-toc-link active">Full Text</a>
        <a className="doc-toc-link" onClick={() => document.getElementById('section-annotations')?.scrollIntoView({ behavior: 'smooth' })}>Annotations</a>
        <a className="doc-toc-link" onClick={() => document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' })}>History</a>
      </aside>

      <div className="doc-main-content">
        <Link to="/search" className="back-link">
          <ArrowLeft size={14} /> Back to results
        </Link>

        <div className="doc-header-bar">
          <div className="doc-title-area">
            <h1 className="doc-title">{doc.title}</h1>
            <div className="doc-meta">
              <div>{doc.citation}</div>
              <div>Jurisdiction: {doc.jurisdiction}</div>
              {doc.effectiveDate && <div>Effective: {doc.effectiveDate}</div>}
              {doc.lastAmended && <div>Last Amended: {doc.lastAmended}</div>}
            </div>
          </div>
          <div className="doc-toolbar">
            <button className="doc-toolbar-btn" title="Save to folder" onClick={() => {
              if (state.folders && state.folders.length > 0) {
                dispatch({ type: 'SAVE_TO_FOLDER', payload: { folderId: state.folders[0].id, documentId: doc.id } });
              }
            }}>
              <FolderPlus size={14} />
            </button>
            <button className="doc-toolbar-btn" title="Print"><Printer size={14} /></button>
            <button className="doc-toolbar-btn" title="Download"><Download size={14} /></button>
            <button className="doc-toolbar-btn" title="Copy citation" onClick={() => {
              navigator.clipboard?.writeText(doc.citation);
            }}>
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Statute Text */}
        <div className="doc-section">
          <div className="doc-section-title">Full Text</div>
          <div style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 15,
            lineHeight: '26px',
            color: '#333',
            padding: '16px 20px',
            background: '#FAFBFC',
            border: '1px solid #E8ECF0',
            borderRadius: 2
          }}>
            {doc.text}
          </div>
        </div>

        {/* Annotations */}
        <div className="doc-section" id="section-annotations">
          <div className="doc-section-title">Notes of Decisions &amp; Annotations</div>
          {(doc.annotations || []).map((ann, i) => (
            <div key={i} style={{
              padding: '10px 0',
              borderBottom: '1px solid #E8ECF0',
              fontSize: 14,
              lineHeight: '22px',
              color: '#333'
            }}>
              <span style={{ color: '#E8600A', fontWeight: 700, marginRight: 8 }}>[{i + 1}]</span>
              {ann}
            </div>
          ))}
        </div>

        {/* History */}
        <div className="doc-section" id="section-history">
          <div className="doc-section-title">Legislative History</div>
          <div style={{ fontSize: 14, color: '#5A6577', lineHeight: '22px' }}>
            {doc.effectiveDate && <p>Originally enacted: {doc.effectiveDate}</p>}
            {doc.lastAmended && <p>Last amended: {doc.lastAmended}</p>}
            <p style={{ marginTop: 8 }}>
              For complete legislative history, including prior versions and amendments, consult the historical notes following this section.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="doc-section">
          <div className="doc-section-title">Research Notes</div>
          <textarea
            className="ai-textarea"
            style={{ height: 80 }}
            placeholder="Add your research notes here..."
            value={(state.notes || {})[doc.id] || ''}
            onChange={e => dispatch({ type: 'ADD_NOTE', payload: { documentId: doc.id, text: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
}
