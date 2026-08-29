import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flag, Star, FolderPlus, Printer, Download, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export default function DocumentView() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [synopsisExpanded, setSynopsisExpanded] = useState(true);
  const [headnotesExpanded, setHeadnotesExpanded] = useState(true);
  const [activeTocSection, setActiveTocSection] = useState('synopsis');

  const doc = (state.cases || []).find(c => c.id === id);
  if (!doc) {
    return (
      <div className="no-results">
        <h3>Document not found</h3>
        <p>The requested case could not be found.</p>
        <Link to="/" className="back-link">Return to Home</Link>
      </div>
    );
  }

  const isFavorited = (state.favorites || []).includes(doc.id);
  const note = (state.notes || {})[doc.id] || '';

  const flagColors = { red: '#CC0000', yellow: '#F0AD00', orange: '#E8600A', green: '#2E8B57', blue: '#3B82C4' };
  const flagLabels = {
    red: 'Negative Treatment - Overruled or Reversed',
    yellow: 'Caution - Some Negative Treatment',
    orange: 'Caution - Possible Negative Treatment',
    green: 'Positive Treatment - Followed',
    blue: 'Citing References Available'
  };

  const allDocs = [...(state.cases || []), ...(state.statutes || [])];
  const citingDocs = (doc.citingReferences || []).map(refId => allDocs.find(d => d.id === refId)).filter(Boolean);

  const handleSaveToFolder = (folderId) => {
    dispatch({ type: 'SAVE_TO_FOLDER', payload: { folderId, documentId: doc.id } });
    setShowFolderDropdown(false);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    dispatch({ type: 'CREATE_FOLDER', payload: { name: newFolderName.trim() } });
    setNewFolderName('');
  };

  const tocSections = [
    { id: 'synopsis', label: 'Synopsis' },
    { id: 'headnotes', label: 'Headnotes' },
    { id: 'holdings', label: 'Holdings' },
    { id: 'opinion', label: 'Opinion' },
    { id: 'citing', label: 'Citing References' }
  ];

  return (
    <div className="document-layout">
      <aside className="doc-toc-sidebar">
        <div className="doc-toc-heading">Document Outline</div>
        {tocSections.map(s => (
          <a
            key={s.id}
            className={`doc-toc-link ${activeTocSection === s.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTocSection(s.id);
              document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {s.label}
          </a>
        ))}
      </aside>

      <div className="doc-main-content">
        {doc.keyciteFlag && (
          <div className={`keycite-large ${doc.keyciteFlag}`}>
            <Flag size={16} fill={flagColors[doc.keyciteFlag]} color={flagColors[doc.keyciteFlag]} />
            <span>{flagLabels[doc.keyciteFlag]}</span>
            <Link to={`/keycite/${doc.id}`} style={{ marginLeft: 'auto', fontSize: 12 }}>View KeyCite</Link>
          </div>
        )}

        <div className="doc-header-bar">
          <div className="doc-title-area">
            <h1 className="doc-title">{doc.title}</h1>
            <div className="doc-meta">
              <div>{doc.citation}</div>
              <div>{doc.court}</div>
              <div>Decided: {doc.date} | {doc.judge}</div>
            </div>
          </div>
          <div className="doc-toolbar">
            <button
              className={`doc-toolbar-btn ${isFavorited ? 'favorited' : ''}`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: { documentId: doc.id } })}
            >
              <Star size={14} fill={isFavorited ? '#E8600A' : 'none'} />
            </button>
            <div style={{ position: 'relative' }}>
              <button
                className="doc-toolbar-btn"
                title="Save to folder"
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              >
                <FolderPlus size={14} />
              </button>
              {showFolderDropdown && (
                <div className="folder-dropdown">
                  {(state.folders || []).map(f => (
                    <div key={f.id} className="folder-dropdown-item" onClick={() => handleSaveToFolder(f.id)}>
                      {f.name}
                      {(f.documentIds || []).includes(doc.id) && <span style={{ color: '#2E8B57', marginLeft: 'auto' }}>&#10003;</span>}
                    </div>
                  ))}
                  <div className="folder-dropdown-divider" />
                  <div className="folder-dropdown-create">
                    <input
                      type="text"
                      placeholder="New folder name..."
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <button className="folder-dropdown-create-btn" onClick={handleCreateFolder}>Create</button>
                  </div>
                </div>
              )}
            </div>
            <button className="doc-toolbar-btn" title="Print"><Printer size={14} /></button>
            <button className="doc-toolbar-btn" title="Download"><Download size={14} /></button>
            <button className="doc-toolbar-btn" title="Copy citation" onClick={() => {
              navigator.clipboard?.writeText(`${doc.title}, ${doc.citation}`);
            }}>
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Topics */}
        {doc.topics && doc.topics.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {doc.topics.map(t => (
              <span key={t} className="headnote-topic-pill">{t}</span>
            ))}
          </div>
        )}

        {/* Synopsis */}
        <div className="doc-section" id="section-synopsis">
          <div className="doc-section-title" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setSynopsisExpanded(!synopsisExpanded)}>
            Synopsis
            {synopsisExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {synopsisExpanded && (
            <div className="doc-synopsis-box">
              {doc.synopsis}
            </div>
          )}
        </div>

        {/* Headnotes */}
        <div className="doc-section" id="section-headnotes">
          <div className="doc-section-title" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setHeadnotesExpanded(!headnotesExpanded)}>
            Headnotes ({(doc.headnotes || []).length})
            {headnotesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {headnotesExpanded && (doc.headnotes || []).map(hn => (
            <div key={hn.number} className="headnote-block">
              <div className="headnote-number">HN{hn.number}</div>
              <span className="headnote-topic-pill">{hn.topic}</span>
              <div className="headnote-text">{hn.text}</div>
            </div>
          ))}
        </div>

        {/* Holdings */}
        <div className="doc-section" id="section-holdings">
          <div className="doc-section-title">Holdings</div>
          <ul className="holdings-list">
            {(doc.holdings || []).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        {/* Opinion */}
        <div className="doc-section" id="section-opinion">
          <div className="doc-section-title">Opinion</div>
          <div className="opinion-attribution">
            Opinion delivered by {doc.judge}
          </div>
          {(doc.opinion || []).map((para, i) => (
            <p key={i} className="opinion-paragraph">{para}</p>
          ))}
        </div>

        {/* Notes */}
        <div className="doc-section">
          <div className="doc-section-title">Research Notes</div>
          <textarea
            className="ai-textarea"
            style={{ height: 80 }}
            placeholder="Add your research notes here..."
            value={note}
            onChange={e => dispatch({ type: 'ADD_NOTE', payload: { documentId: doc.id, text: e.target.value } })}
          />
        </div>

        {/* Citing References */}
        <div className="doc-section" id="section-citing">
          <div className="doc-section-title">
            Citing References ({citingDocs.length})
            <Link to={`/keycite/${doc.id}`} style={{ fontSize: 13, fontWeight: 400, marginLeft: 12 }}>View full KeyCite</Link>
          </div>
          {citingDocs.map(ref => (
            <div key={ref.id} className="citing-ref-item">
              <div className="citing-ref-body">
                <Link to={ref.type === 'statute' ? `/statute/${ref.id}` : `/document/${ref.id}`} className="citing-ref-title">
                  {ref.title}
                </Link>
                <div className="citing-ref-meta">{ref.citation} | {ref.court || ref.jurisdiction}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
