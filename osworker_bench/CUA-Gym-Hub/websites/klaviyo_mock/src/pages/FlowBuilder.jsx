import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatPercent = (n) => n > 0 ? (n * 100).toFixed(1) + '%' : '--';

const nodeIcons = {
  send_email: '&#9993;',
  send_sms: '&#128241;',
  time_delay: '&#9201;',
  conditional_split: '&#8982;',
  webhook: '&#128279;'
};

const nodeLabels = {
  send_email: 'Send Email',
  send_sms: 'Send SMS',
  time_delay: 'Time Delay',
  conditional_split: 'Conditional Split',
  webhook: 'Webhook'
};

export default function FlowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { state, updateEntity } = useAppContext();
  const flow = state.flows.find(f => f.id === id);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(null);
  const [toast, setToast] = useState(null);

  if (!flow) {
    return <div className="empty-state"><h3>Flow not found</h3><button className="btn btn-secondary" onClick={() => navigate(query ? `/flows?${query}` : '/flows')}>Back to Flows</button></div>;
  }

  const selectedAction = selectedNode ? flow.actions.find(a => a.id === selectedNode) : null;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleStatusChange = (newStatus) => {
    updateEntity('flows', flow.id, { status: newStatus, updatedAt: new Date().toISOString() });
    showToast(`Flow status changed to ${newStatus}`);
  };

  const handleAddAction = (afterIndex, type) => {
    const newAction = {
      id: `fa_${Date.now()}`,
      flowId: flow.id,
      type,
      position: { x: 0, y: (afterIndex + 1) * 120 },
      parentId: afterIndex >= 0 ? flow.actions[afterIndex]?.id : null,
      branchType: null,
      config: type === 'send_email' ? { subject: 'New email', senderName: state.account.defaultSenderName, templateId: null }
        : type === 'send_sms' ? { body: '' }
        : type === 'time_delay' ? { value: 1, unit: 'days' }
        : type === 'conditional_split' ? { conditions: [] }
        : { url: '' },
      stats: {}
    };
    const newActions = [...flow.actions];
    newActions.splice(afterIndex + 1, 0, newAction);
    updateEntity('flows', flow.id, { actions: newActions, updatedAt: new Date().toISOString() });
    setShowAddMenu(null);
    setSelectedNode(newAction.id);
    showToast(`Added ${nodeLabels[type]}`);
  };

  const handleDeleteAction = (actionId) => {
    const newActions = flow.actions.filter(a => a.id !== actionId);
    updateEntity('flows', flow.id, { actions: newActions, updatedAt: new Date().toISOString() });
    setSelectedNode(null);
    showToast('Action removed');
  };

  const handleUpdateActionConfig = (actionId, configUpdates) => {
    const newActions = flow.actions.map(a =>
      a.id === actionId ? { ...a, config: { ...a.config, ...configUpdates } } : a
    );
    updateEntity('flows', flow.id, { actions: newActions, updatedAt: new Date().toISOString() });
  };

  const handleFlowNameChange = (newName) => {
    updateEntity('flows', flow.id, { name: newName, updatedAt: new Date().toISOString() });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate(query ? `/flows?${query}` : '/flows')} style={{ fontSize: 13, padding: '6px 12px' }}>&larr;</button>
            <input
              type="text"
              value={flow.name}
              onChange={e => handleFlowNameChange(e.target.value)}
              style={{ fontSize: 18, fontWeight: 600, background: 'transparent', border: '1px solid transparent', borderRadius: 4, padding: '4px 8px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
            <select value={flow.status} onChange={e => handleStatusChange(e.target.value)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="draft">Draft</option>
              <option value="manual">Manual</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-secondary ${showAnalytics ? 'active' : ''}`} onClick={() => setShowAnalytics(!showAnalytics)} style={{ fontSize: 13 }}>
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          </div>
        </div>

        {/* Flow canvas */}
        <div className="flow-canvas">
          {/* Trigger node */}
          <div className="flow-node" style={{ background: 'var(--accent-yellow-dim)', borderColor: 'var(--accent-yellow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>&#9889;</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Trigger</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {flow.triggerDetails.type === 'added_to_list' ? `When added to ${flow.triggerDetails.listName || 'a list'}` :
                   flow.triggerDetails.type === 'metric_triggered' ? `When someone ${flow.triggerDetails.metricName}` :
                   flow.triggerDetails.type === 'entered_segment' ? `When enters ${flow.triggerDetails.segmentName || 'a segment'}` :
                   flow.triggerDetails.type === 'date_property' ? `On ${flow.triggerDetails.property} date` :
                   flow.triggerDetails.type === 'price_drop' ? `When price drops ${flow.triggerDetails.percentage}%+` :
                   flow.triggerType}
                </div>
              </div>
            </div>
          </div>

          {flow.actions.map((action, idx) => (
            <React.Fragment key={action.id}>
              <div className="flow-connector"></div>
              {/* Add button between nodes */}
              <div style={{ position: 'relative' }}>
                <button className="flow-add-btn" onClick={() => setShowAddMenu(showAddMenu === idx ? null : idx)}>+</button>
                {showAddMenu === idx && (
                  <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 4, zIndex: 10, minWidth: 190 }}>
                    {['send_email', 'send_sms', 'time_delay', 'conditional_split', 'webhook'].map(t => (
                      <div key={t} className="dropdown-item" onClick={() => handleAddAction(idx, t)}>
                        <span dangerouslySetInnerHTML={{ __html: nodeIcons[t] }} /> {nodeLabels[t]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flow-connector"></div>
              {/* Action node */}
              <div className={`flow-node ${selectedNode === action.id ? 'selected' : ''}`} onClick={() => setSelectedNode(action.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: nodeIcons[action.type] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{nodeLabels[action.type]}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {action.type === 'send_email' && action.config.subject}
                      {action.type === 'send_sms' && (action.config.body ? action.config.body.substring(0, 40) + '...' : 'SMS message')}
                      {action.type === 'time_delay' && `Wait ${action.config.value} ${action.config.unit}`}
                      {action.type === 'conditional_split' && 'Split based on conditions'}
                      {action.type === 'webhook' && (action.config.url || 'Webhook')}
                    </div>
                  </div>
                </div>
                {showAnalytics && action.stats && action.stats.delivered > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Delivered</span>
                      <span>{action.stats.delivered?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Open rate</span>
                      <span>{formatPercent(action.stats.openRate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Click rate</span>
                      <span>{formatPercent(action.stats.clickRate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}

          {/* Final add button */}
          <div className="flow-connector"></div>
          <div style={{ position: 'relative' }}>
            <button className="flow-add-btn" onClick={() => setShowAddMenu(showAddMenu === 'end' ? null : 'end')}>+</button>
            {showAddMenu === 'end' && (
              <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', padding: 4, zIndex: 10, minWidth: 190 }}>
                {['send_email', 'send_sms', 'time_delay', 'conditional_split', 'webhook'].map(t => (
                  <div key={t} className="dropdown-item" onClick={() => handleAddAction(flow.actions.length - 1, t)}>
                    <span dangerouslySetInnerHTML={{ __html: nodeIcons[t] }} /> {nodeLabels[t]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedAction && (
        <div className="detail-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="detail-panel-title" style={{ marginBottom: 0 }}>{nodeLabels[selectedAction.type]}</div>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => setSelectedNode(null)}>&#10005;</button>
          </div>

          {selectedAction.type === 'send_email' && (
            <>
              <div className="detail-section">
                <div className="detail-section-title">Content</div>
                <div className="form-group">
                  <label>Subject line</label>
                  <input type="text" value={selectedAction.config.subject || ''} onChange={e => handleUpdateActionConfig(selectedAction.id, { subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>From name</label>
                  <input type="text" value={selectedAction.config.senderName || ''} onChange={e => handleUpdateActionConfig(selectedAction.id, { senderName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Template</label>
                  <select value={selectedAction.config.templateId || ''} onChange={e => handleUpdateActionConfig(selectedAction.id, { templateId: e.target.value || null })}>
                    <option value="">Select template...</option>
                    {state.templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              {selectedAction.stats && selectedAction.stats.delivered > 0 && (
                <div className="detail-section">
                  <div className="detail-section-title">Analytics (30 days)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Delivered</span><span>{selectedAction.stats.delivered?.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Open rate</span><span>{formatPercent(selectedAction.stats.openRate)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Click rate</span><span>{formatPercent(selectedAction.stats.clickRate)}</span></div>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedAction.type === 'send_sms' && (
            <div className="detail-section">
              <div className="detail-section-title">Message</div>
              <div className="form-group">
                <label>SMS body</label>
                <textarea rows={4} value={selectedAction.config.body || ''} onChange={e => handleUpdateActionConfig(selectedAction.id, { body: e.target.value })} placeholder="Enter SMS message..." />
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>{(selectedAction.config.body || '').length}/160 characters</div>
            </div>
          )}

          {selectedAction.type === 'time_delay' && (
            <div className="detail-section">
              <div className="detail-section-title">Configuration</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Wait</span>
                <input type="number" min="1" style={{ width: 70 }} value={selectedAction.config.value} onChange={e => handleUpdateActionConfig(selectedAction.id, { value: parseInt(e.target.value) || 1 })} className="form-group" />
                <select value={selectedAction.config.unit} onChange={e => handleUpdateActionConfig(selectedAction.id, { unit: e.target.value })} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            </div>
          )}

          {selectedAction.type === 'conditional_split' && (
            <div className="detail-section">
              <div className="detail-section-title">Conditions</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {selectedAction.config.conditions?.length > 0
                  ? selectedAction.config.conditions.map((c, i) => <div key={i} style={{ padding: '4px 0' }}>{c.property} {c.operator} {c.value}</div>)
                  : 'No conditions configured'}
              </div>
              <button className="btn btn-secondary" style={{ marginTop: 8, fontSize: 12 }} onClick={() => {
                const newConds = [...(selectedAction.config.conditions || []), { property: 'total_orders', operator: 'greater_than', value: '0' }];
                handleUpdateActionConfig(selectedAction.id, { conditions: newConds });
              }}>+ Add condition</button>
            </div>
          )}

          {selectedAction.type === 'webhook' && (
            <div className="detail-section">
              <div className="detail-section-title">Webhook URL</div>
              <div className="form-group">
                <input type="url" value={selectedAction.config.url || ''} onChange={e => handleUpdateActionConfig(selectedAction.id, { url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 16 }}>
            <button className="btn btn-danger" style={{ fontSize: 12, width: '100%' }} onClick={() => handleDeleteAction(selectedAction.id)}>Remove action</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
