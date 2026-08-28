import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, ArrowLeft, Zap, Mail, Clock, GitBranch, Settings, ListPlus, MinusCircle, Tag, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadge, Pagination, EmptyState, ConfirmModal } from '../../components/ui/index.jsx';

// Workflows List
export function WorkflowsList() {
  const { state, addItem, deleteItem, showToast } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const PER_PAGE = 25;

  const workflows = state.workflows || [];

  const filtered = useMemo(() => {
    let items = workflows;
    if (search) items = items.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') items = items.filter(w => w.status === statusFilter);
    return items;
  }, [workflows, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const [openMenu, setOpenMenu] = useState(null);

  const handleDelete = (id) => {
    deleteItem('workflows', id);
    setConfirmDelete(null);
    showToast('Workflow deleted', 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left"><h1>Workflows</h1></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/automations/workflows/new')}><Plus size={15} /> Create workflow</button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
          <input style={{ paddingLeft: 32 }} placeholder="Search workflows..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {['all','active','inactive','draft'].map(s => (
          <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {pageItems.length === 0 ? (
          <EmptyState icon="⚡" title="No workflows found" description="Automate your marketing with powerful workflow sequences." actionLabel="Create workflow" onAction={() => navigate('/automations/workflows/new')} />
        ) : (
          <>
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Workflow Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                  <th>Currently Enrolled</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(wf => (
                  <tr key={wf.id} onClick={() => navigate(`/automations/workflows/${wf.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{wf.name}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{wf.type}</span></td>
                    <td>{getStatusBadge(wf.status)}</td>
                    <td>{wf.enrolledCount?.toLocaleString()}</td>
                    <td>{wf.enrolledCurrently?.toLocaleString()}</td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(wf.updatedDate)}</td>
                    <td onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                      <button onClick={() => setOpenMenu(openMenu === wf.id ? null : wf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', padding: 4 }}>
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenu === wf.id && (
                        <div className="dropdown-menu" style={{ right: 0, top: '100%' }}>
                          <div className="dropdown-item" onClick={() => { navigate(`/automations/workflows/${wf.id}`); setOpenMenu(null); }}>Edit</div>
                          <div className="dropdown-item" onClick={() => {
                            addItem('workflows', {
                              ...wf,
                              id: `workflow-${Date.now()}`,
                              name: wf.name + ' (copy)',
                              status: 'draft',
                              enrolledCount: 0,
                              enrolledCurrently: 0,
                              createdDate: new Date().toISOString(),
                              updatedDate: new Date().toISOString()
                            });
                            setOpenMenu(null);
                            showToast('Workflow cloned', 'success');
                          }}>Clone</div>
                          <div className="dropdown-divider" />
                          <div className="dropdown-item" style={{ color: 'var(--hs-danger)' }} onClick={() => { setConfirmDelete(wf.id); setOpenMenu(null); }}>Delete</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
          </>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete workflow?"
          description="This will permanently delete the workflow and stop all active enrollments."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// Workflow node icons
const NODE_ICONS = {
  email: Mail,
  delay: Clock,
  branch: GitBranch,
  action: Zap,
};

const ACTION_PALETTE = [
  { category: 'Communication', actions: [{ type: 'email', actionType: 'send_email', label: 'Send email', icon: Mail }, { type: 'action', actionType: 'internal_notification', label: 'Send internal notification', icon: Bell }] },
  { category: 'CRM', actions: [{ type: 'action', actionType: 'set_property', label: 'Set property value', icon: Tag }, { type: 'action', actionType: 'create_task', label: 'Create task', icon: Plus }] },
  { category: 'Timing', actions: [{ type: 'delay', actionType: 'delay', label: 'Add a delay', icon: Clock }] },
  { category: 'Logic', actions: [{ type: 'branch', actionType: 'branch', label: 'If/then branch', icon: GitBranch }] },
  { category: 'Lists', actions: [{ type: 'action', actionType: 'add_to_list', label: 'Add to list', icon: ListPlus }, { type: 'action', actionType: 'remove_from_list', label: 'Remove from list', icon: MinusCircle }] }
];

function WorkflowNode({ node, selected, onClick }) {
  const Icon = NODE_ICONS[node.type] || Zap;
  const isBranch = node.type === 'branch';

  const colors = { email: '#E8F4FB', delay: '#FFF7D6', branch: '#F0F8FF', action: '#F0FFF4' };
  const borders = { email: '#00A4BD', delay: '#DBAE17', branch: '#516F90', action: '#00BDA5' };

  return (
    <div
      onClick={onClick}
      style={{
        background: colors[node.type] || '#F5F8FA',
        border: `2px solid ${selected ? 'var(--hs-orange)' : borders[node.type] || 'var(--hs-border)'}`,
        borderRadius: isBranch ? '8px' : 6,
        padding: '12px 16px',
        cursor: 'pointer',
        width: 260,
        boxShadow: selected ? '0 0 0 2px rgba(255,122,89,0.2)' : 'none',
        transition: 'border-color 0.15s'
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 28, height: 28, background: borders[node.type] || '#516F90', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} style={{ color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--hs-text-primary)' }}>
            {isBranch ? 'If/Then Branch' : node.actionType?.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
          </div>
          <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 2 }}>
            {node.config?.label || node.config?.description || ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addItem, updateItem, showToast } = useApp();

  const isNew = !id || id === 'new';
  const existing = isNew ? null : state.workflows?.find(w => w.id === id);

  const [wfData, setWfData] = useState(() => existing || {
    id: `workflow-${Date.now()}`,
    name: 'Untitled workflow',
    type: 'contact',
    status: 'draft',
    enrolledCount: 0,
    enrolledCurrently: 0,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    createdBy: 'user-1',
    trigger: { type: 'filter', description: 'Set enrollment trigger...', filterGroups: [] },
    nodes: []
  });

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [branchTarget, setBranchTarget] = useState(null); // { nodeId, path: 'yes'|'no' }
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(wfData.name);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ type: wfData.type, triggerDescription: wfData.trigger?.description || '' });

  const nodes = wfData.nodes || [];
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const addNode = (actionDef) => {
    const newNode = {
      id: `wn-${Date.now()}`,
      type: actionDef.type,
      actionType: actionDef.actionType,
      config: { label: actionDef.label },
      nextNodeId: null,
      branchTarget: branchTarget || null
    };
    setWfData(prev => ({ ...prev, nodes: [...(prev.nodes||[]), newNode] }));
    setShowActionPicker(false);
    setBranchTarget(null);
    setSelectedNodeId(newNode.id);
  };

  const handleSave = (activate = false) => {
    const updated = { ...wfData, name: nameValue, updatedDate: new Date().toISOString(), ...(activate ? { status: 'active' } : {}) };
    if (isNew) addItem('workflows', updated);
    else updateItem('workflows', id, updated);
    showToast(activate ? 'Workflow activated' : 'Workflow saved', 'success');
    navigate('/automations/workflows');
  };

  const handleSaveSettings = () => {
    setWfData(prev => ({
      ...prev,
      type: settingsForm.type,
      trigger: { ...prev.trigger, description: settingsForm.triggerDescription }
    }));
    setShowSettings(false);
    showToast('Settings updated', 'success');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/automations/workflows')} style={{ padding: '6px 10px', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {editingName ? (
            <input autoFocus value={nameValue} onChange={e => setNameValue(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => { if(['Enter','Escape'].includes(e.key)) setEditingName(false); }} style={{ fontWeight: 600, fontSize: 15, border: 'none', borderBottom: '2px solid var(--hs-teal)', outline: 'none', textAlign: 'center', minWidth: 200, padding: '2px 8px' }} />
          ) : (
            <span onClick={() => setEditingName(true)} style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {nameValue}
            </span>
          )}
          <span style={{ marginLeft: 12 }}>{getStatusBadge(wfData.status)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowSettings(true)}><Settings size={14} /> Settings</button>
          <button className="btn btn-secondary" onClick={() => handleSave(false)}>Save</button>
          <button className="btn btn-primary" onClick={() => handleSave(true)}>Turn on</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#F0F2F5', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Trigger node */}
          <div className="card" style={{ background: '#fff', borderRadius: 6, padding: '12px 16px', width: 280, marginBottom: 0, border: '2px solid var(--hs-orange)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-orange)', marginBottom: 6 }}>Enrollment Trigger</div>
            <div style={{ fontSize: 13, color: 'var(--hs-text-primary)' }}>{wfData.trigger?.description || 'Set enrollment trigger...'}</div>
          </div>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <div style={{ width: 2, height: 24, background: 'var(--hs-border)' }} />
              <WorkflowNode node={node} selected={selectedNodeId === node.id} onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)} />
              {node.type === 'branch' && (
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 2, height: 16, background: 'var(--hs-border)' }} />
                    <span style={{ fontSize: 11, color: 'var(--hs-success)', fontWeight: 600, background: '#E7F7F5', padding: '2px 8px', borderRadius: 3 }}>YES</span>
                    <div style={{ width: 2, height: 16, background: 'var(--hs-border)' }} />
                    <div
                      onClick={() => { setBranchTarget({ nodeId: node.id, path: 'yes' }); setShowActionPicker(true); }}
                      style={{ width: 120, height: 40, background: '#F5F8FA', border: '2px dashed var(--hs-border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--hs-teal)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--hs-teal)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hs-border)'}
                    >+ Add action</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 2, height: 16, background: 'var(--hs-border)' }} />
                    <span style={{ fontSize: 11, color: 'var(--hs-danger)', fontWeight: 600, background: '#FDECEA', padding: '2px 8px', borderRadius: 3 }}>NO</span>
                    <div style={{ width: 2, height: 16, background: 'var(--hs-border)' }} />
                    <div
                      onClick={() => { setBranchTarget({ nodeId: node.id, path: 'no' }); setShowActionPicker(true); }}
                      style={{ width: 120, height: 40, background: '#F5F8FA', border: '2px dashed var(--hs-border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--hs-teal)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--hs-teal)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hs-border)'}
                    >+ Add action</div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Add action button */}
          <div style={{ width: 2, height: 24, background: 'var(--hs-border)' }} />
          <button
            onClick={() => setShowActionPicker(true)}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--hs-teal)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}
          >+</button>
        </div>

        {/* Right: Node editor or action picker */}
        <div style={{ width: 320, flexShrink: 0, background: '#fff', borderLeft: '1px solid var(--hs-border)', overflowY: 'auto' }}>
          {showActionPicker ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Choose an action</span>
                <button onClick={() => setShowActionPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--hs-text-muted)' }}>×</button>
              </div>
              <div style={{ padding: 12 }}>
                {ACTION_PALETTE.map(cat => (
                  <div key={cat.category} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-text-muted)', marginBottom: 8, padding: '0 4px' }}>{cat.category}</div>
                    {cat.actions.map(action => {
                      const Icon = action.icon;
                      return (
                        <div key={action.actionType} onClick={() => addNode(action)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 4, cursor: 'pointer', marginBottom: 2 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Icon size={15} style={{ color: 'var(--hs-text-secondary)' }} />
                          <span style={{ fontSize: 13 }}>{action.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          ) : selectedNode ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 13 }}>
                {selectedNode.actionType?.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
              </div>
              <div style={{ padding: 16 }}>
                {selectedNode.type === 'delay' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" defaultValue={selectedNode.config?.duration || 1} style={{ width: 80 }} min={1} />
                    <select defaultValue={selectedNode.config?.unit || 'days'} style={{ flex: 1 }}>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                )}
                {selectedNode.type === 'email' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Select email</label>
                    <select style={{ width: '100%' }}>
                      <option value="">-- Choose email --</option>
                      {(state.emails||[]).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                )}
                {selectedNode.type === 'action' && selectedNode.actionType === 'set_property' && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Property</label>
                      <select>
                        <option value="lifecycleStage">Lifecycle Stage</option>
                        <option value="leadStatus">Lead Status</option>
                        <option value="contactOwner">Contact Owner</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Value</label>
                      <input placeholder="Enter value..." />
                    </div>
                  </>
                )}
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-danger" onClick={() => { setWfData(prev => ({ ...prev, nodes: prev.nodes.filter(n => n.id !== selectedNodeId) })); setSelectedNodeId(null); }} style={{ padding: '6px 12px', fontSize: 13 }}>
                    Delete node
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 16, color: 'var(--hs-text-muted)', fontSize: 13 }}>
              Click a node to edit its properties, or click + to add a new action.
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
          <div className="card" style={{ width: 460, padding: 24 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Workflow settings</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Workflow type</label>
              <select value={settingsForm.type} onChange={e => setSettingsForm(p => ({ ...p, type: e.target.value }))}>
                <option value="contact">Contact-based</option>
                <option value="company">Company-based</option>
                <option value="deal">Deal-based</option>
                <option value="ticket">Ticket-based</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Enrollment trigger description</label>
              <textarea
                value={settingsForm.triggerDescription}
                onChange={e => setSettingsForm(p => ({ ...p, triggerDescription: e.target.value }))}
                style={{ minHeight: 80, resize: 'vertical' }}
                placeholder="Describe when contacts should enroll..."
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSettings}>Save settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
