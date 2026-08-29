import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, GitBranch, Plus, Trash2, MoreHorizontal, Play, Pause } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AutomationDetail() {
  const { state, updateAutomation, addToast } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const automation = state.automations.find(a => a.id === id);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(automation?.name || '');
  const [showAddMenu, setShowAddMenu] = useState(null);

  if (!automation) { navigate('/automations'); return null; }

  const toggleStatus = () => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active';
    updateAutomation(id, { status: newStatus });
    addToast(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const saveName = () => {
    setEditingName(false);
    if (name !== automation.name) {
      updateAutomation(id, { name });
    }
  };

  const addStep = (type, afterIndex) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type,
      order: afterIndex + 1,
      config: type === 'send_email'
        ? { subject: 'New Email', previewText: '', content: [] }
        : type === 'wait'
        ? { duration: 1, unit: 'days' }
        : { condition: { field: 'emailActivity', operator: 'opened', value: 'previous_email' } }
    };
    const steps = [...automation.steps];
    steps.splice(afterIndex + 1, 0, newStep);
    steps.forEach((s, i) => s.order = i);
    updateAutomation(id, { steps });
    setShowAddMenu(null);
  };

  const removeStep = (stepId) => {
    const steps = automation.steps.filter(s => s.id !== stepId);
    steps.forEach((s, i) => s.order = i);
    updateAutomation(id, { steps });
  };

  const updateStep = (stepId, updates) => {
    const steps = automation.steps.map(s => s.id === stepId ? { ...s, config: { ...s.config, ...updates } } : s);
    updateAutomation(id, { steps });
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'send_email': return <Mail size={18} />;
      case 'wait': return <Clock size={18} />;
      case 'if_else': return <GitBranch size={18} />;
      default: return null;
    }
  };

  const getStepLabel = (step) => {
    switch (step.type) {
      case 'send_email': return step.config.subject || 'Untitled Email';
      case 'wait': return `Wait ${step.config.duration} ${step.config.unit}`;
      case 'if_else': return 'If/Else Condition';
      default: return step.type;
    }
  };

  const triggerLabel = () => {
    switch (automation.trigger?.type) {
      case 'signup': return 'When someone subscribes to your audience';
      case 'cart_abandoned': return 'When someone abandons their cart';
      case 'birthday': return 'On a subscriber\'s birthday';
      case 'inactivity': return 'When a subscriber becomes inactive';
      case 'purchase': return 'When someone makes a purchase';
      default: return 'Custom trigger';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="back-link" onClick={() => navigate('/automations')}><ArrowLeft size={16} /> Back to Automations</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className={`badge badge-${automation.status}`}>{automation.status}</span>
          <button className="btn btn-primary" onClick={toggleStatus}>
            {automation.status === 'active' ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Activate</>}
          </button>
        </div>
      </div>

      {editingName ? (
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={saveName} onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
          style={{ fontSize: 24, fontWeight: 700, border: 'none', borderBottom: '2px solid #007C89', outline: 'none', background: 'transparent', width: '100%', marginBottom: 24 }} />
      ) : (
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, cursor: 'pointer' }} onClick={() => { setEditingName(true); setName(automation.name); }}>{automation.name}</h1>
      )}

      <div className="workflow">
        {/* Trigger */}
        <div className="workflow-node" style={{ borderLeft: '4px solid #007C89' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E0F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007C89' }}>
            <Play size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Trigger</div>
            <div className="text-sm text-muted">{triggerLabel()}</div>
          </div>
        </div>

        {automation.steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="workflow-connector" />

            <div className="workflow-node">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: step.type === 'send_email' ? '#E3F2FD' : step.type === 'wait' ? '#FFF3E0' : '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.type === 'send_email' ? '#1565C0' : step.type === 'wait' ? '#E65100' : '#7B1FA2' }}>
                {getStepIcon(step.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{getStepLabel(step)}</div>
                {step.type === 'send_email' && (
                  <input value={step.config.subject} onChange={e => updateStep(step.id, { subject: e.target.value })} placeholder="Email subject" style={{ marginTop: 4, width: '100%', border: '1px solid #E5E5E5', borderRadius: 4, padding: '4px 8px', fontSize: 13 }} />
                )}
                {step.type === 'wait' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input type="number" value={step.config.duration} onChange={e => updateStep(step.id, { duration: parseInt(e.target.value) || 1 })} min={1} style={{ width: 60, border: '1px solid #E5E5E5', borderRadius: 4, padding: '4px 8px', fontSize: 13 }} />
                    <select value={step.config.unit} onChange={e => updateStep(step.id, { unit: e.target.value })} style={{ border: '1px solid #E5E5E5', borderRadius: 4, padding: '4px 8px', fontSize: 13 }}>
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                    </select>
                  </div>
                )}
              </div>
              <button onClick={() => removeStep(step.id)} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
            </div>

            {/* Add step button between steps */}
            <div className="workflow-connector" />
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowAddMenu(showAddMenu === i ? null : i)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed #E5E5E5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#707070', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#007C89'; e.currentTarget.style.color = '#007C89'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#707070'; }}>
                <Plus size={16} />
              </button>
              {showAddMenu === i && (
                <div style={{ position: 'absolute', left: 40, top: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden' }}>
                  <button className="action-menu-item" onClick={() => addStep('send_email', i + 1)}><Mail size={14} style={{ marginRight: 8 }} />Send Email</button>
                  <button className="action-menu-item" onClick={() => addStep('wait', i + 1)}><Clock size={14} style={{ marginRight: 8 }} />Wait</button>
                  <button className="action-menu-item" onClick={() => addStep('if_else', i + 1)}><GitBranch size={14} style={{ marginRight: 8 }} />If/Else</button>
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {automation.steps.length === 0 && (
          <>
            <div className="workflow-connector" />
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowAddMenu(showAddMenu === -1 ? null : -1)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed #E5E5E5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#707070' }}>
                <Plus size={16} />
              </button>
              {showAddMenu === -1 && (
                <div style={{ position: 'absolute', left: 40, top: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden' }}>
                  <button className="action-menu-item" onClick={() => addStep('send_email', -1)}><Mail size={14} style={{ marginRight: 8 }} />Send Email</button>
                  <button className="action-menu-item" onClick={() => addStep('wait', -1)}><Clock size={14} style={{ marginRight: 8 }} />Wait</button>
                  <button className="action-menu-item" onClick={() => addStep('if_else', -1)}><GitBranch size={14} style={{ marginRight: 8 }} />If/Else</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
