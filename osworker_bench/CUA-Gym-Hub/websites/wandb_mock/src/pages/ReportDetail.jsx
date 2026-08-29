import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, MoreHorizontal, Trash2, X, Image, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ReportChart({ panel, allRuns }) {
  const runs = (panel.runIds || []).map(id => allRuns.find(r => r.id === id)).filter(Boolean);

  const data = useMemo(() => {
    const allSteps = new Set();
    runs.forEach(r => (r.history || []).forEach(h => allSteps.add(h.step)));
    return [...allSteps].sort((a, b) => a - b).map(step => {
      const pt = { step };
      runs.forEach(r => {
        const h = (r.history || []).find(h => h.step === step);
        if (h && h[panel.metric] !== undefined) pt[r.id] = h[panel.metric];
      });
      return pt;
    });
  }, [runs, panel.metric]);

  return (
    <div className="panel-card">
      <div className="panel-header"><span className="panel-title">{panel.title}</span></div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="step" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={50} />
            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)' }} />
            {/* Legend hidden to prevent overflow with many runs */}
            {runs.map(r => (
              <Line key={r.id} type="monotone" dataKey={r.id} stroke={r.color} dot={false} strokeWidth={1.5} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Modal to add a chart panel to a panel_grid block
function AddChartModal({ allRuns, onAdd, onClose }) {
  const [metric, setMetric] = useState('');
  const [selectedRunIds, setSelectedRunIds] = useState([]);

  const allMetrics = useMemo(() => {
    const keys = new Set();
    allRuns.forEach(r => (r.history || []).forEach(h => {
      Object.keys(h).forEach(k => { if (k !== 'step' && k !== 'epoch') keys.add(k); });
    }));
    return [...keys].sort();
  }, [allRuns]);

  const toggleRun = (id) => {
    setSelectedRunIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    if (!metric) return;
    onAdd({ type: 'line_chart', metric, title: metric, runIds: selectedRunIds });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Chart to Panel Grid</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Metric</label>
          <select className="form-input" value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="">Select metric...</option>
            {allMetrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Runs</label>
          <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 6, padding: 8 }}>
            {allRuns.map(r => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={selectedRunIds.includes(r.id)} onChange={() => toggleRun(r.id)} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                {r.name}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Select runs to display. Leave empty to show all visible runs.</div>
        </div>
        <div className="flex gap-2" style={{ marginTop: 16 }}>
          <button className="btn-blue" onClick={handleAdd} disabled={!metric}>Add Chart</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block, index, onEdit, onDelete, allRuns }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddChart, setShowAddChart] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [codeValue, setCodeValue] = useState(block.code || '');
  const [langValue, setLangValue] = useState(block.language || 'python');
  const [imageUrl, setImageUrl] = useState(block.url || '');
  const [imageEditMode, setImageEditMode] = useState(!block.url);
  const menuRef = useRef(null);

  const handleAddChartPanel = (panel) => {
    const newPanels = [...(block.panels || []), panel];
    onEdit(index, { ...block, panels: newPanels });
    setShowAddChart(false);
  };

  const handleRemovePanel = (pi) => {
    const newPanels = (block.panels || []).filter((_, i) => i !== pi);
    onEdit(index, { ...block, panels: newPanels });
  };

  const handleCodeSave = () => {
    onEdit(index, { ...block, code: codeValue, language: langValue });
    setEditingCode(false);
  };

  const handleImageSave = () => {
    onEdit(index, { ...block, url: imageUrl });
    setImageEditMode(false);
  };

  return (
    <div className="report-block" style={{ position: 'relative', marginBottom: 8 }}>
      <div className="report-block-actions">
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-muted)' }}>
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div ref={menuRef} className="dropdown-panel" style={{ position: 'absolute', right: 0, top: 24, zIndex: 50 }}>
            <button
              className="dropdown-item flex items-center gap-2"
              style={{ padding: '6px 12px', width: '100%', textAlign: 'left', color: 'var(--error-red)', fontSize: 13 }}
              onClick={() => { onDelete(index); setMenuOpen(false); }}
            >
              <Trash2 size={14} /> Delete block
            </button>
          </div>
        )}
      </div>

      {block.type === 'heading' && (
        (() => {
          const Tag = `h${block.level || 1}`;
          const sizes = { 1: 24, 2: 20, 3: 16 };
          return (
            <Tag
              style={{ fontSize: sizes[block.level] || 24, fontWeight: 700, marginBottom: 8, outline: 'none' }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onEdit(index, { ...block, text: e.target.textContent })}
            >
              {block.text}
            </Tag>
          );
        })()
      )}

      {block.type === 'paragraph' && (
        <p
          style={{ color: 'var(--text-primary)', lineHeight: 1.7, outline: 'none', marginBottom: 8 }}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onEdit(index, { ...block, text: e.target.textContent })}
        >
          {block.text}
        </p>
      )}

      {block.type === 'panel_grid' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 8 }}>
            {(block.panels || []).map((panel, pi) => (
              <div key={pi} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleRemovePanel(pi)}
                  title="Remove chart"
                  style={{ position: 'absolute', top: 6, right: 6, zIndex: 10, background: 'var(--bg-active)', border: 'none', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)', padding: '1px 4px' }}
                >
                  <X size={10} />
                </button>
                <ReportChart panel={panel} allRuns={allRuns} />
              </div>
            ))}
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: 12, padding: '4px 10px' }}
            onClick={() => setShowAddChart(true)}
          >
            <Plus size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Add chart to grid
          </button>
          {showAddChart && (
            <AddChartModal allRuns={allRuns} onAdd={handleAddChartPanel} onClose={() => setShowAddChart(false)} />
          )}
        </div>
      )}

      {block.type === 'code_block' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-active)' }}>
            {editingCode ? (
              <select
                value={langValue}
                onChange={e => setLangValue(e.target.value)}
                style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
              >
                {['python', 'javascript', 'bash', 'yaml', 'json', 'text'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{block.language}</span>
            )}
            {editingCode ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-blue" style={{ fontSize: 11, padding: '2px 8px' }} onClick={handleCodeSave}>Save</button>
                <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => { setEditingCode(false); setCodeValue(block.code || ''); setLangValue(block.language || 'python'); }}>Cancel</button>
              </div>
            ) : (
              <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setEditingCode(true)}>Edit</button>
            )}
          </div>
          {editingCode ? (
            <textarea
              value={codeValue}
              onChange={e => setCodeValue(e.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 16,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text-primary)',
                background: '#1e1e1e',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0, padding: 16, background: '#1e1e1e' }}>
              {block.code}
            </pre>
          )}
        </div>
      )}

      {block.type === 'image' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, marginBottom: 12, overflow: 'hidden' }}>
          {imageEditMode || !block.url ? (
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Image size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Image URL</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleImageSave()}
                  autoFocus
                />
                <button className="btn-blue" style={{ fontSize: 12, padding: '4px 10px' }} onClick={handleImageSave}>
                  Embed
                </button>
                {block.url && (
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { setImageEditMode(false); setImageUrl(block.url); }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={block.url}
                alt="Report image"
                style={{ width: '100%', display: 'block', borderRadius: 8 }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <button
                onClick={() => setImageEditMode(true)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
              >
                Change URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockTypePicker({ onSelect, onClose }) {
  const types = [
    { type: 'heading', label: 'Heading' },
    { type: 'paragraph', label: 'Text' },
    { type: 'panel_grid', label: 'Panel Grid' },
    { type: 'code_block', label: 'Code Block' },
    { type: 'image', label: 'Image' },
  ];

  return (
    <div className="dropdown-panel" style={{ minWidth: 150 }}>
      <div className="dropdown-header">
        <span style={{ fontSize: 12, fontWeight: 600 }}>Insert block</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
      </div>
      {types.map(t => (
        <button
          key={t.type}
          className="dropdown-item"
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 13 }}
          onClick={() => onSelect(t.type)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function ReportDetail() {
  const { entity, project, reportId } = useParams();
  const { state, dispatch } = useApp();
  const report = state.reports.find(r => r.id === reportId);
  const [insertAt, setInsertAt] = useState(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descValue, setDescValue] = useState('');
  const author = state.users.find(u => u.id === report?.authorId);

  if (!report) return <div className="page-container"><p className="text-muted">Report not found.</p></div>;

  const updateBlocks = (newBlocks) => {
    dispatch({
      type: 'UPDATE_REPORT',
      payload: { id: report.id, blocks: newBlocks, updatedAt: new Date().toISOString() }
    });
  };

  const handleEditBlock = (index, block) => {
    const next = [...report.blocks];
    next[index] = block;
    updateBlocks(next);
  };

  const handleDeleteBlock = (index) => {
    updateBlocks(report.blocks.filter((_, i) => i !== index));
  };

  const handleInsertBlock = (type) => {
    let block;
    switch (type) {
      case 'heading': block = { type: 'heading', level: 2, text: 'New Heading' }; break;
      case 'paragraph': block = { type: 'paragraph', text: 'New paragraph...' }; break;
      case 'panel_grid': block = { type: 'panel_grid', panels: [] }; break;
      case 'code_block': block = { type: 'code_block', language: 'python', code: '# code here' }; break;
      case 'image': block = { type: 'image', url: '' }; break;
      default: return;
    }
    const next = [...report.blocks];
    next.splice(insertAt + 1, 0, block);
    updateBlocks(next);
    setInsertAt(null);
  };

  const handleTitleBlur = (e) => {
    const title = e.target.textContent.trim();
    if (title && title !== report.title) {
      dispatch({ type: 'UPDATE_REPORT', payload: { id: report.id, title, updatedAt: new Date().toISOString() } });
    }
  };

  const handleDescriptionSave = () => {
    dispatch({ type: 'UPDATE_REPORT', payload: { id: report.id, description: descValue, updatedAt: new Date().toISOString() } });
    setEditingDescription(false);
  };

  const startEditDescription = () => {
    setDescValue(report.description || '');
    setEditingDescription(true);
  };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <h1
        style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, outline: 'none' }}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
      >
        {report.title}
      </h1>

      {/* Description */}
      {editingDescription ? (
        <div style={{ marginBottom: 12 }}>
          <input
            className="form-input"
            style={{ width: '100%', fontSize: 14 }}
            value={descValue}
            onChange={e => setDescValue(e.target.value)}
            placeholder="Add a description..."
            onKeyDown={e => { if (e.key === 'Enter') handleDescriptionSave(); if (e.key === 'Escape') setEditingDescription(false); }}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button className="btn-blue" style={{ fontSize: 12, padding: '3px 10px' }} onClick={handleDescriptionSave}>Save</button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => setEditingDescription(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div
          onClick={startEditDescription}
          style={{ marginBottom: 12, cursor: 'text', minHeight: 20 }}
          title="Click to edit description"
        >
          {report.description ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{report.description}</p>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Add a description...</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        {author && (
          <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 11 }}>
            {author.name.split(' ').map(w => w[0]).join('')}
          </div>
        )}
        <span className="text-muted text-small">{author?.name || 'Unknown'}</span>
        <span className="text-muted text-small">&middot; {timeAgo(report.updatedAt)}</span>
      </div>

      <div className="report-body">
        {report.blocks.map((block, i) => (
          <div key={i}>
            <BlockRenderer
              block={block}
              index={i}
              onEdit={handleEditBlock}
              onDelete={handleDeleteBlock}
              allRuns={state.runs}
            />
            <div className="block-insert-zone" style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                className="block-insert-btn"
                onClick={() => setInsertAt(insertAt === i ? null : i)}
                title="Insert block"
              >
                <Plus size={14} />
              </button>
              {insertAt === i && (
                <div style={{ position: 'absolute', top: 20, zIndex: 50 }}>
                  <BlockTypePicker onSelect={handleInsertBlock} onClose={() => setInsertAt(null)} />
                </div>
              )}
            </div>
          </div>
        ))}
        {report.blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 12 }}>No content yet. Add a block to get started.</p>
            <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setInsertAt(-1)}>
              <Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Add first block
            </button>
            {insertAt === -1 && (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                <BlockTypePicker onSelect={(type) => { setInsertAt(null); handleInsertBlock(type); /* adjust for -1 */ }} onClose={() => setInsertAt(null)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
