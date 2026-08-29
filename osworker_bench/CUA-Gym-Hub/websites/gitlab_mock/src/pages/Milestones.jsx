import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext.jsx';
import { Plus, Flag } from 'lucide-react';
import { timeAgo } from '../utils/dataManager.js';

export default function Milestones() {
  const { group, project: projectSlug } = useParams();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('active');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', dueDate: '' });

  const proj = state.projects.find(p => p.fullPath === `${group}/${projectSlug}`);
  if (!proj) return <div>Project not found</div>;

  const milestones = state.milestones.filter(m => m.projectId === proj.id && m.status === tab);

  const handleCreate = () => {
    if (!form.title.trim()) return;
    dispatch({ type: ACTIONS.CREATE_MILESTONE, payload: { projectId: proj.id, title: form.title, description: form.description, startDate: form.startDate, dueDate: form.dueDate, status: 'active' } });
    setForm({ title: '', description: '', startDate: '', dueDate: '' });
    setShowCreate(false);
  };

  const handleClose = (id) => dispatch({ type: ACTIONS.CLOSE_MILESTONE, payload: { milestoneId: id } });

  const getProgress = (ms) => {
    const total = state.issues.filter(i => i.milestoneId === ms.id).length;
    const closed = state.issues.filter(i => i.milestoneId === ms.id && i.state === 'closed').length;
    return total === 0 ? 0 : Math.round((closed / total) * 100);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Milestones</h1>
        <button className="gl-btn gl-btn-primary" onClick={() => setShowCreate(v => !v)}>
          <Plus size={14} /> New milestone
        </button>
      </div>

      {showCreate && (
        <div style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 16, marginBottom: 20, background: '#fff' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>New milestone</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Milestone title"
              style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', minHeight: 80, padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Start date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Due date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--gl-border)', borderRadius: 4, fontSize: 14 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gl-btn gl-btn-primary gl-btn-sm" onClick={handleCreate} disabled={!form.title.trim()}>Create milestone</button>
            <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--gl-border)', marginBottom: 16 }}>
        {['active', 'closed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--gl-purple)' : 'transparent'}`, cursor: 'pointer', fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--gl-purple)' : 'var(--gl-text-secondary)', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {milestones.length === 0 ? (
        <div className="gl-empty-state">
          <Flag size={40} style={{ color: 'var(--gl-text-tertiary)' }} />
          <div className="gl-empty-state-title">No {tab} milestones</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {milestones.map(ms => {
            const progress = getProgress(ms);
            const issueCount = state.issues.filter(i => i.milestoneId === ms.id).length;
            const closedCount = state.issues.filter(i => i.milestoneId === ms.id && i.state === 'closed').length;
            return (
              <div key={ms.id} style={{ border: '1px solid var(--gl-border)', borderRadius: 6, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{ms.title}</h3>
                    {ms.description && <p style={{ margin: 0, fontSize: 13, color: 'var(--gl-text-secondary)' }}>{ms.description}</p>}
                  </div>
                  {tab === 'active' && (
                    <button className="gl-btn gl-btn-secondary gl-btn-sm" onClick={() => handleClose(ms.id)}>Close milestone</button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--gl-bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gl-success)', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--gl-text-secondary)', flexShrink: 0 }}>{progress}%</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gl-text-secondary)', display: 'flex', gap: 12 }}>
                  <span>{closedCount} of {issueCount} issues closed</span>
                  {ms.dueDate && <span>Due: {ms.dueDate}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
