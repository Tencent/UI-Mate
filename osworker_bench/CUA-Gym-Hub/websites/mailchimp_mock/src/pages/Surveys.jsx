import React, { useState } from 'react';
import { Plus, Trash2, X, Pause, Play, BarChart3, Eye, Copy, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Surveys() {
  const { state, updateState, addToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editSurvey, setEditSurvey] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newSurvey, setNewSurvey] = useState({ name: '', description: '', questions: [{ id: 'q1', text: '', type: 'rating' }] });

  const surveys = state.surveys || [];

  const handleCreate = () => {
    if (!newSurvey.name.trim()) return;
    const survey = {
      id: `survey_${Date.now()}`,
      name: newSurvey.name.trim(),
      description: newSurvey.description.trim(),
      status: 'draft',
      questions: newSurvey.questions.filter(q => q.text.trim()),
      responses: 0,
      completionRate: 0,
      audienceId: 'aud_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updateState(s => ({ ...s, surveys: [...(s.surveys || []), survey] }));
    addToast('Survey created');
    setShowCreate(false);
    setNewSurvey({ name: '', description: '', questions: [{ id: 'q1', text: '', type: 'rating' }] });
  };

  const toggleStatus = (survey) => {
    const newStatus = survey.status === 'active' ? 'paused' : 'active';
    updateState(s => ({
      ...s,
      surveys: (s.surveys || []).map(sv => sv.id === survey.id ? { ...sv, status: newStatus, updatedAt: new Date().toISOString() } : sv)
    }));
    addToast(`Survey ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const handleDelete = (id) => {
    updateState(s => ({ ...s, surveys: (s.surveys || []).filter(sv => sv.id !== id) }));
    addToast('Survey deleted');
    setDeleteConfirm(null);
  };

  const handleDuplicate = (survey) => {
    const copy = {
      ...survey,
      id: `survey_${Date.now()}`,
      name: survey.name + ' (Copy)',
      status: 'draft',
      responses: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updateState(s => ({ ...s, surveys: [...(s.surveys || []), copy] }));
    addToast('Survey duplicated');
  };

  const addQuestion = () => {
    const id = `q_${Date.now()}`;
    setNewSurvey(s => ({ ...s, questions: [...s.questions, { id, text: '', type: 'rating' }] }));
  };

  const updateQuestion = (id, updates) => {
    setNewSurvey(s => ({
      ...s,
      questions: s.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const removeQuestion = (id) => {
    setNewSurvey(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }));
  };

  const handleSaveEdit = () => {
    if (!editSurvey) return;
    updateState(s => ({
      ...s,
      surveys: (s.surveys || []).map(sv => sv.id === editSurvey.id ? { ...editSurvey, updatedAt: new Date().toISOString() } : sv)
    }));
    addToast('Survey updated');
    setEditSurvey(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Surveys</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Survey</button>
      </div>

      {surveys.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <BarChart3 size={48} color="#C0C0C0" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Create your first survey</h3>
          <p className="text-muted" style={{ marginBottom: 16 }}>Collect feedback from your audience to improve your marketing.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Get Started</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {surveys.map(survey => (
          <div key={survey.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{survey.name}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${survey.status}`}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 4, background: survey.status === 'active' ? '#2E7D32' : survey.status === 'paused' ? '#E65100' : '#707070' }} />
                    {survey.status}
                  </span>
                  <span className="text-xs text-muted">{(survey.questions || []).length} question{(survey.questions || []).length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditSurvey({ ...survey })} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }} title="Edit">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => toggleStatus(survey)} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }} title={survey.status === 'active' ? 'Pause' : 'Activate'}>
                  {survey.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => handleDuplicate(survey)} style={{ background: 'none', border: 'none', color: '#707070', cursor: 'pointer', padding: 4 }} title="Duplicate">
                  <Copy size={14} />
                </button>
                <button onClick={() => setDeleteConfirm(survey)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {survey.description && (
              <p className="text-sm text-muted" style={{ marginBottom: 12 }}>{survey.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', padding: 8, background: '#F6F6F4', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{(survey.responses || 0).toLocaleString()}</div>
                <div className="text-xs text-muted">Responses</div>
              </div>
              <div style={{ textAlign: 'center', padding: 8, background: '#F6F6F4', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{survey.completionRate || 0}%</div>
                <div className="text-xs text-muted">Completion</div>
              </div>
            </div>

            <div className="text-xs text-muted">Created {new Date(survey.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Survey</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Survey Name</label>
                <input value={newSurvey.name} onChange={e => setNewSurvey({ ...newSurvey, name: e.target.value })} placeholder="e.g., Customer Satisfaction Survey" autoFocus />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea value={newSurvey.description} onChange={e => setNewSurvey({ ...newSurvey, description: e.target.value })} placeholder="Describe the purpose of this survey" rows={2} style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Audience</label>
                <select defaultValue="aud_1">
                  {(state.audiences || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Questions</label>
                {newSurvey.questions.map((q, i) => (
                  <div key={q.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span className="text-sm text-muted" style={{ minWidth: 20 }}>{i + 1}.</span>
                    <input value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} placeholder="Enter question text" style={{ flex: 1 }} />
                    <select value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value })} style={{ width: 120 }}>
                      <option value="rating">Rating (1-5)</option>
                      <option value="text">Free Text</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="multiple_choice">Multiple Choice</option>
                    </select>
                    {newSurvey.questions.length > 1 && (
                      <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
                    )}
                  </div>
                ))}
                <button className="btn btn-sm btn-outlined" onClick={addQuestion} style={{ marginTop: 4 }}><Plus size={12} /> Add Question</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!newSurvey.name.trim()}>Create Survey</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSurvey && (
        <div className="modal-overlay" onClick={() => setEditSurvey(null)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Survey</h2>
              <button onClick={() => setEditSurvey(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Survey Name</label>
                <input value={editSurvey.name} onChange={e => setEditSurvey({ ...editSurvey, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={editSurvey.description || ''} onChange={e => setEditSurvey({ ...editSurvey, description: e.target.value })} rows={2} style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Questions</label>
                {(editSurvey.questions || []).map((q, i) => (
                  <div key={q.id || i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span className="text-sm text-muted" style={{ minWidth: 20 }}>{i + 1}.</span>
                    <input value={q.text} onChange={e => {
                      const qs = [...editSurvey.questions];
                      qs[i] = { ...qs[i], text: e.target.value };
                      setEditSurvey({ ...editSurvey, questions: qs });
                    }} style={{ flex: 1 }} />
                    <select value={q.type} onChange={e => {
                      const qs = [...editSurvey.questions];
                      qs[i] = { ...qs[i], type: e.target.value };
                      setEditSurvey({ ...editSurvey, questions: qs });
                    }} style={{ width: 120 }}>
                      <option value="rating">Rating (1-5)</option>
                      <option value="text">Free Text</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="multiple_choice">Multiple Choice</option>
                    </select>
                    {editSurvey.questions.length > 1 && (
                      <button onClick={() => setEditSurvey({ ...editSurvey, questions: editSurvey.questions.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
                    )}
                  </div>
                ))}
                <button className="btn btn-sm btn-outlined" onClick={() => setEditSurvey({ ...editSurvey, questions: [...(editSurvey.questions || []), { id: `q_${Date.now()}`, text: '', type: 'rating' }] })} style={{ marginTop: 4 }}><Plus size={12} /> Add Question</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setEditSurvey(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={!editSurvey.name.trim()}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Survey</h2></div>
            <div className="modal-body"><p>Delete "{deleteConfirm.name}"? This cannot be undone and all responses will be lost.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
