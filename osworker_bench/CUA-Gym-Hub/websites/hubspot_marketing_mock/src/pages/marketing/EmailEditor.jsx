import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BLOCK_TYPES = [
  { type: 'header', label: 'Header', icon: '🏢', category: 'Layout' },
  { type: 'text', label: 'Text Block', icon: '📝', category: 'Text' },
  { type: 'image', label: 'Image', icon: '🖼', category: 'Media' },
  { type: 'button', label: 'Button', icon: '🔘', category: 'Actions' },
  { type: 'divider', label: 'Divider', icon: '➖', category: 'Actions' },
  { type: 'social', label: 'Social Follow', icon: '📱', category: 'Actions' }
];

function BlockPreview({ block, selected, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? 'var(--hs-teal)' : 'transparent'}`,
        borderRadius: 4,
        marginBottom: 4,
        position: 'relative',
        cursor: 'pointer',
        background: selected ? 'rgba(0,164,189,0.04)' : 'transparent',
        transition: 'border-color 0.15s'
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4, zIndex: 10 }}>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: 'var(--hs-danger)', border: 'none', borderRadius: 3, cursor: 'pointer', padding: '2px 6px', color: '#fff', fontSize: 12 }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
      <div style={{ padding: '12px 16px' }}>
        {block.type === 'header' && (
          <div style={{ background: '#FF7A59', padding: '16px', textAlign: 'center', borderRadius: 3 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{block.data.companyName || 'Company Name'}</span>
          </div>
        )}
        {block.type === 'text' && (
          <div style={{ fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: block.data.html || '<p>Text block</p>' }} />
        )}
        {block.type === 'image' && (
          <div style={{ textAlign: 'center', background: '#F5F8FA', padding: 24, borderRadius: 3 }}>
            <div style={{ fontSize: 32 }}>🖼</div>
            <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{block.data.alt || 'Image'}</div>
          </div>
        )}
        {block.type === 'button' && (
          <div style={{ textAlign: block.data.align || 'center', padding: '8px 0' }}>
            <span style={{ background: block.data.color || '#FF7A59', color: '#fff', padding: '10px 24px', borderRadius: 3, display: 'inline-block', fontWeight: 600 }}>
              {block.data.text || 'Button'}
            </span>
          </div>
        )}
        {block.type === 'divider' && (
          <hr style={{ border: 'none', borderTop: `1px solid ${block.data.color || '#CBD6E2'}`, margin: '8px 0' }} />
        )}
        {block.type === 'social' && (
          <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['FB', 'TW', 'IN'].map(s => (
              <div key={s} style={{ width: 32, height: 32, background: 'var(--hs-text-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange }) {
  if (!block) return <div style={{ color: 'var(--hs-text-muted)', fontSize: 14, padding: 16 }}>Select a block to edit its properties.</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: 'var(--hs-text-primary)' }}>
        {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Properties
      </div>
      {block.type === 'header' && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Company Name</label>
          <input value={block.data.companyName || ''} onChange={e => onChange({ ...block, data: { ...block.data, companyName: e.target.value } })} />
        </div>
      )}
      {block.type === 'text' && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>HTML Content</label>
          <textarea style={{ minHeight: 120, resize: 'vertical' }} value={block.data.html || ''} onChange={e => onChange({ ...block, data: { ...block.data, html: e.target.value } })} />
        </div>
      )}
      {block.type === 'button' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Button Text</label>
            <input value={block.data.text || ''} onChange={e => onChange({ ...block, data: { ...block.data, text: e.target.value } })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>URL</label>
            <input value={block.data.url || ''} onChange={e => onChange({ ...block, data: { ...block.data, url: e.target.value } })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Button Color</label>
            <input type="color" value={block.data.color || '#FF7A59'} onChange={e => onChange({ ...block, data: { ...block.data, color: e.target.value } })} style={{ width: 40, height: 32, padding: 2, border: '1px solid var(--hs-border)' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Alignment</label>
            <select value={block.data.align || 'center'} onChange={e => onChange({ ...block, data: { ...block.data, align: e.target.value } })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}
      {block.type === 'image' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Image URL</label>
            <input value={block.data.src || ''} onChange={e => onChange({ ...block, data: { ...block.data, src: e.target.value } })} placeholder="https://..." />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Alt Text</label>
            <input value={block.data.alt || ''} onChange={e => onChange({ ...block, data: { ...block.data, alt: e.target.value } })} />
          </div>
        </>
      )}
    </div>
  );
}

export default function EmailEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addItem, updateItem, showToast } = useApp();

  const isNew = !id || id === 'new';
  const existing = isNew ? null : state.emails?.find(e => e.id === id);

  const [emailData, setEmailData] = useState(() => existing || {
    id: `email-${Date.now()}`,
    name: 'Untitled email',
    subject: '',
    previewText: '',
    status: 'draft',
    type: 'regular',
    fromName: state.currentUser?.firstName + ' ' + state.currentUser?.lastName,
    fromEmail: state.currentUser?.email || '',
    replyTo: '',
    listIds: [],
    campaignId: null,
    scheduledDate: null,
    sentDate: null,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    createdBy: 'user-1',
    stats: null,
    content: { blocks: [
      { id: 'b1', type: 'header', data: { companyName: 'Acme Corp' } },
      { id: 'b2', type: 'text', data: { html: '<h2>Hello {{contact.firstName}}!</h2><p>Add your email content here.</p>' } },
      { id: 'b3', type: 'button', data: { text: 'Learn More', url: '#', color: '#FF7A59', align: 'center' } },
      { id: 'b4', type: 'text', data: { html: '<p style="font-size:12px;color:#7C98B6;">Acme Corp | Unsubscribe</p>' } }
    ]}
  });

  const [activeTab, setActiveTab] = useState('edit');
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(emailData.name);
  const [sendOption, setSendOption] = useState('now');
  const [selectedListIds, setSelectedListIds] = useState(emailData.listIds || []);
  const [showPreview, setShowPreview] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(emailData.abTest?.enabled || false);
  const [abSubjectB, setAbSubjectB] = useState(emailData.abTest?.variantB?.subject || '');
  const [abSampleSize, setAbSampleSize] = useState(emailData.abTest?.sampleSize || 20);

  const blocks = emailData.content?.blocks || [];
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const addBlock = (blockType) => {
    const bt = BLOCK_TYPES.find(b => b.type === blockType);
    const newBlock = {
      id: `b-${Date.now()}`,
      type: blockType,
      data: blockType === 'header' ? { companyName: 'Acme Corp' }
        : blockType === 'text' ? { html: '<p>Text content here...</p>' }
        : blockType === 'button' ? { text: 'Click Here', url: '#', color: '#FF7A59', align: 'center' }
        : blockType === 'image' ? { src: '', alt: 'Image', width: '100%' }
        : blockType === 'divider' ? { style: 'solid', color: '#CBD6E2' }
        : {}
    };
    setEmailData(prev => ({ ...prev, content: { ...prev.content, blocks: [...(prev.content?.blocks || []), newBlock] } }));
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (updated) => {
    setEmailData(prev => ({
      ...prev,
      content: { ...prev.content, blocks: prev.content.blocks.map(b => b.id === updated.id ? updated : b) }
    }));
  };

  const deleteBlock = (blockId) => {
    setEmailData(prev => ({
      ...prev,
      content: { ...prev.content, blocks: prev.content.blocks.filter(b => b.id !== blockId) }
    }));
    setSelectedBlockId(null);
  };

  const handleSave = () => {
    const updated = {
      ...emailData,
      name: nameValue,
      updatedDate: new Date().toISOString(),
      abTest: abTestEnabled ? {
        enabled: true,
        variantB: { subject: abSubjectB },
        sampleSize: abSampleSize,
        winner: emailData.abTest?.winner || null
      } : { enabled: false }
    };
    if (isNew) {
      addItem('emails', updated);
    } else {
      updateItem('emails', id, updated);
    }
    showToast('Email saved', 'success');
    navigate('/marketing/email');
  };

  const categories = [...new Set(BLOCK_TYPES.map(b => b.category))];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0, zIndex: 30 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/marketing/email')} style={{ padding: '6px 10px', fontSize: 13 }}>
          <ArrowLeft size={14} /> Exit
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => { if(e.key==='Enter'||e.key==='Escape') setEditingName(false); }}
              style={{ fontSize: 15, fontWeight: 600, border: 'none', borderBottom: '2px solid var(--hs-teal)', outline: 'none', textAlign: 'center', minWidth: 200, padding: '2px 8px' }}
            />
          ) : (
            <span onClick={() => setEditingName(true)} style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '2px 8px', borderRadius: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {nameValue}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setShowPreview(true)}><Eye size={14} /> Preview</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--hs-border)', display: 'flex', padding: '0 16px', flexShrink: 0 }}>
        {['edit', 'settings', 'ab_test', 'send'].map(tab => (
          <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize', fontSize: 13 }}>
            {tab === 'send' ? 'Send or schedule' : tab === 'ab_test' ? 'A/B Test' : tab}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'edit' && (
          <>
            {/* Left: Block palette */}
            <div style={{ width: 240, flexShrink: 0, background: 'var(--hs-page-bg)', borderRight: '1px solid var(--hs-border)', overflowY: 'auto', padding: 12 }}>
              {categories.map(cat => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--hs-text-muted)', marginBottom: 8 }}>{cat}</div>
                  {BLOCK_TYPES.filter(b => b.category === cat).map(bt => (
                    <div
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 3, cursor: 'pointer', background: '#fff', marginBottom: 4, border: '1px solid var(--hs-border)', fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hs-table-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span>{bt.icon}</span>
                      <span>{bt.label}</span>
                      <Plus size={12} style={{ marginLeft: 'auto', color: 'var(--hs-text-muted)' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Center: Email canvas */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#E0E6EE', padding: 24, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 600, background: '#fff', borderRadius: 4, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: 400 }}
                onClick={() => setSelectedBlockId(null)}>
                {blocks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--hs-text-muted)', fontSize: 14 }}>
                    Click blocks on the left to add them to your email.
                  </div>
                ) : (
                  blocks.map(block => (
                    <BlockPreview
                      key={block.id}
                      block={block}
                      selected={selectedBlockId === block.id}
                      onClick={e => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Block properties */}
            <div style={{ width: 280, flexShrink: 0, background: '#fff', borderLeft: '1px solid var(--hs-border)', overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--hs-border)', fontWeight: 600, fontSize: 13 }}>
                Block Properties
              </div>
              <BlockEditor block={selectedBlock} onChange={updateBlock} />
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 600 }}>
              {[
                { label: 'From name', key: 'fromName', placeholder: 'Acme Corp Marketing' },
                { label: 'From address', key: 'fromEmail', placeholder: 'marketing@acmecorp.com' },
                { label: 'Reply-to address', key: 'replyTo', placeholder: 'reply@acmecorp.com' },
                { label: 'Subject line', key: 'subject', placeholder: 'Enter subject line...' },
                { label: 'Preview text', key: 'previewText', placeholder: 'Short preview text...' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{field.label}</label>
                  <input
                    value={emailData[field.key] || ''}
                    onChange={e => setEmailData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ab_test' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ marginBottom: 8 }}>A/B Testing</h2>
              <p style={{ color: 'var(--hs-text-muted)', fontSize: 14, marginBottom: 24 }}>
                Test different versions of your email to optimize open rates and engagement.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={abTestEnabled} onChange={e => setAbTestEnabled(e.target.checked)} />
                  <span style={{ fontWeight: 500 }}>Enable A/B testing</span>
                </label>
              </div>
              {abTestEnabled && (
                <>
                  <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--hs-orange)' }}>Variant A (Original)</div>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Subject line</label>
                      <input value={emailData.subject || ''} onChange={e => setEmailData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Enter subject line..." />
                    </div>
                  </div>
                  <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--hs-teal)' }}>Variant B</div>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Subject line</label>
                      <input value={abSubjectB} onChange={e => setAbSubjectB(e.target.value)} placeholder="Enter alternative subject line..." />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Test sample size: {abSampleSize}%</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={abSampleSize}
                      onChange={e => setAbSampleSize(parseInt(e.target.value))}
                      style={{ width: '100%', padding: 0, border: 'none', boxShadow: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--hs-text-muted)' }}>
                      <span>10%</span>
                      <span>50%</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--hs-text-muted)', marginTop: 8 }}>
                      {abSampleSize}% of recipients will be split between variant A and B. The winning variant will be sent to the remaining {100 - abSampleSize}%.
                    </p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Winning metric</label>
                    <select>
                      <option value="open_rate">Open rate</option>
                      <option value="click_rate">Click rate</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Test duration</label>
                    <select>
                      <option value="4">4 hours</option>
                      <option value="8">8 hours</option>
                      <option value="24">24 hours</option>
                    </select>
                  </div>
                  {emailData.abTest?.winner && (
                    <div className="card" style={{ padding: 16, background: 'var(--hs-table-selected)', borderColor: 'var(--hs-teal)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--hs-teal)', marginBottom: 8 }}>Test Results</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Variant A {emailData.abTest.winner === 'A' ? '(Winner)' : ''}</div>
                          <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)' }}>
                            Open rate: {emailData.stats?.openRate || 0}% | Click rate: {emailData.stats?.clickRate || 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Variant B {emailData.abTest.winner === 'B' ? '(Winner)' : ''}</div>
                          <div style={{ fontSize: 13, color: 'var(--hs-text-secondary)' }}>
                            Open rate: {emailData.abTest.variantB?.openRate || 0}% | Click rate: {emailData.abTest.variantB?.clickRate || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ marginBottom: 24 }}>Send or Schedule</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 6 }}>Send to (lists)</label>
                <select
                  multiple
                  style={{ height: 120 }}
                  value={selectedListIds}
                  onChange={e => setSelectedListIds(Array.from(e.target.selectedOptions, o => o.value))}
                >
                  {(state.lists || []).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.size.toLocaleString()} contacts)</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 10 }}>Send options</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="radio" name="sendOption" value="now" checked={sendOption === 'now'} onChange={() => setSendOption('now')} /> Send now
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="sendOption" value="scheduled" checked={sendOption === 'scheduled'} onChange={() => setSendOption('scheduled')} /> Schedule for later
                </label>
              </div>
              <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 15 }} onClick={() => {
                const newStatus = sendOption === 'now' ? 'sent' : 'scheduled';
                const updates = {
                  status: newStatus,
                  listIds: selectedListIds,
                  sentDate: sendOption === 'now' ? new Date().toISOString() : null,
                  updatedDate: new Date().toISOString(),
                  content: emailData.content,
                  name: nameValue
                };
                if (isNew) {
                  addItem('emails', { ...emailData, ...updates, name: nameValue });
                } else {
                  updateItem('emails', id, updates);
                }
                showToast(sendOption === 'now' ? 'Email sent successfully' : 'Email scheduled successfully', 'success');
                navigate('/marketing/email');
              }}>
                {sendOption === 'now' ? 'Send' : 'Schedule'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPreview && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowPreview(false)}>
          <div style={{ background: '#fff', borderRadius: 6, width: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, margin: 0 }}>Email Preview</h2>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--hs-text-muted)', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--hs-border)', background: '#F5F8FA', fontSize: 13 }}>
              <div style={{ marginBottom: 6 }}><span style={{ fontWeight: 600, color: 'var(--hs-text-muted)' }}>From:</span> {emailData.fromName || 'Sender'} &lt;{emailData.fromEmail || 'sender@example.com'}&gt;</div>
              <div style={{ marginBottom: 6 }}><span style={{ fontWeight: 600, color: 'var(--hs-text-muted)' }}>Subject:</span> {emailData.subject || '(No subject)'}</div>
              {emailData.previewText && <div><span style={{ fontWeight: 600, color: 'var(--hs-text-muted)' }}>Preview text:</span> {emailData.previewText}</div>}
            </div>
            <div style={{ overflowY: 'auto', padding: 24, background: '#E0E6EE', flex: 1 }}>
              <div style={{ width: 600, background: '#fff', borderRadius: 4, padding: 16, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {blocks.map(block => (
                  <div key={block.id} style={{ padding: '12px 16px' }}>
                    {block.type === 'header' && (
                      <div style={{ background: '#FF7A59', padding: '16px', textAlign: 'center', borderRadius: 3 }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{block.data.companyName || 'Company Name'}</span>
                      </div>
                    )}
                    {block.type === 'text' && (
                      <div style={{ fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: block.data.html || '' }} />
                    )}
                    {block.type === 'image' && (
                      <div style={{ textAlign: 'center', background: '#F5F8FA', padding: 24, borderRadius: 3 }}>
                        {block.data.src ? <img src={block.data.src} alt={block.data.alt || ''} style={{ maxWidth: '100%' }} /> : <div style={{ fontSize: 32 }}>🖼<div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>{block.data.alt || 'Image'}</div></div>}
                      </div>
                    )}
                    {block.type === 'button' && (
                      <div style={{ textAlign: block.data.align || 'center', padding: '8px 0' }}>
                        <span style={{ background: block.data.color || '#FF7A59', color: '#fff', padding: '10px 24px', borderRadius: 3, display: 'inline-block', fontWeight: 600 }}>{block.data.text || 'Button'}</span>
                      </div>
                    )}
                    {block.type === 'divider' && <hr style={{ border: 'none', borderTop: `1px solid ${block.data.color || '#CBD6E2'}`, margin: '8px 0' }} />}
                    {block.type === 'social' && (
                      <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {['FB', 'TW', 'IN'].map(s => (
                          <div key={s} style={{ width: 32, height: 32, background: 'var(--hs-text-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--hs-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowPreview(false)}>Close preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
