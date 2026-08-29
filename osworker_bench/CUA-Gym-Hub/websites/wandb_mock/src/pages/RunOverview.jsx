import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: open ? 8 : 0, width: '100%', textAlign: 'left' }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && children}
    </div>
  );
}

export default function RunOverview() {
  const { runId } = useParams();
  const { state, dispatch } = useApp();
  const run = state.runs.find(r => r.id === runId);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState(run?.notes || '');

  if (!run) return null;

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !run.tags.includes(tag)) {
      dispatch({ type: 'ADD_RUN_TAG', payload: { runId: run.id, tag } });
    }
    setNewTag('');
    setAddingTag(false);
  };

  const handleRemoveTag = (tag) => {
    dispatch({ type: 'REMOVE_RUN_TAG', payload: { runId: run.id, tag } });
  };

  const handleNotesBlur = () => {
    if (notes !== run.notes) {
      dispatch({ type: 'UPDATE_RUN_NOTES', payload: { runId: run.id, notes } });
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
      <div>
        <CollapsibleSection title="Tags">
          <div className="flex gap-2 flex-wrap items-center">
            {run.tags.map(tag => (
              <span key={tag} className="tag-pill">
                {tag}
                <button className="remove-tag" onClick={() => handleRemoveTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {addingTag ? (
              <input
                className="form-input"
                style={{ width: 120, padding: '2px 8px', fontSize: 12 }}
                placeholder="tag name"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setAddingTag(false); }}
                onBlur={handleAddTag}
                autoFocus
              />
            ) : (
              <button
                className="tag-pill"
                onClick={() => setAddingTag(true)}
                style={{ cursor: 'pointer', border: '1px dashed var(--border-color)', background: 'transparent' }}
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Notes">
          <textarea
            className="form-input"
            style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this run..."
          />
        </CollapsibleSection>

        <CollapsibleSection title="Config">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {Object.entries(run.config).sort(([a], [b]) => a.localeCompare(b)).map(([k, v], i) => (
                <tr key={k} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)' }}>
                  <td>{k}</td><td>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        <CollapsibleSection title="Summary">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {Object.entries(run.summary).sort(([a], [b]) => a.localeCompare(b)).map(([k, v], i) => (
                <tr key={k} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)' }}>
                  <td>{k}</td><td>{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(4)) : String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      </div>

      <div>
        <CollapsibleSection title="Metadata">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {Object.entries(run.metadata).map(([k, v], i) => (
                <tr key={k} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-primary)' }}>
                  <td>{k}</td><td>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        <CollapsibleSection title="Run Info">
          <table className="data-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              <tr style={{ background: 'var(--bg-surface)' }}><td>Run ID</td><td>{run.runId}</td></tr>
              <tr style={{ background: 'var(--bg-primary)' }}><td>Created</td><td>{new Date(run.createdAt).toLocaleString()}</td></tr>
              <tr style={{ background: 'var(--bg-surface)' }}><td>Updated</td><td>{new Date(run.updatedAt).toLocaleString()}</td></tr>
              <tr style={{ background: 'var(--bg-primary)' }}><td>User</td><td>{run.user}</td></tr>
            </tbody>
          </table>
        </CollapsibleSection>
      </div>
    </div>
  );
}
