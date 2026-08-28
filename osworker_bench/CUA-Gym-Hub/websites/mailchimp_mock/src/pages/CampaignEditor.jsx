import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Image, RectangleHorizontal, Minus, Share2, Layout, AlignVerticalSpaceAround, Plus, Trash2, Copy, Monitor, Smartphone, Send, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const blockTypes = [
  { type: 'text', label: 'Text', icon: Type, desc: 'Body text, headlines, lists' },
  { type: 'image', label: 'Image', icon: Image, desc: 'Add photos or graphics' },
  { type: 'button', label: 'Button', icon: RectangleHorizontal, desc: 'Call-to-action button' },
  { type: 'divider', label: 'Divider', icon: Minus, desc: 'Horizontal line separator' },
  { type: 'social', label: 'Social', icon: Share2, desc: 'Social media links' },
  { type: 'header', label: 'Header', icon: Layout, desc: 'Logo and branding' },
  { type: 'footer', label: 'Footer', icon: AlignVerticalSpaceAround, desc: 'Address and unsubscribe' }
];

const defaultContent = {
  text: { html: '<p>Enter your text here...</p>' },
  image: { src: '', alt: 'Image', width: '100%', link: '' },
  button: { text: 'Click Here', url: '#', bgColor: '#007C89', textColor: '#FFFFFF', align: 'center', borderRadius: '4' },
  divider: { style: 'solid', color: '#E0E0E0', width: '100%' },
  social: { networks: [{ name: 'Facebook', url: '#', icon: 'facebook' }, { name: 'Twitter', url: '#', icon: 'twitter' }, { name: 'Instagram', url: '#', icon: 'instagram' }] },
  header: { logoSrc: '', text: 'Header Text', bgColor: '#FFFFFF' },
  footer: { text: 'Company Name', unsubscribeText: 'Unsubscribe', address: 'Your address here' }
};

export default function CampaignEditor() {
  const { state, updateCampaign, addToast } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = state.campaigns.find(c => c.id === id);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [blocks, setBlocks] = useState(() => campaign?.content || []);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState(state.user.email);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [globalStyles, setGlobalStyles] = useState({
    bgColor: '#E5E5E5',
    contentBgColor: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    textColor: '#241C15',
    linkColor: '#007C89'
  });

  if (!campaign) {
    navigate('/campaigns');
    return null;
  }

  const saveBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    updateCampaign(id, { content: newBlocks });
  };

  const addBlock = (type, index = blocks.length) => {
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      order: index,
      content: { ...defaultContent[type] }
    };
    const updated = [...blocks];
    updated.splice(index, 0, newBlock);
    updated.forEach((b, i) => b.order = i);
    saveBlocks(updated);
    setSelectedBlock(newBlock.id);
  };

  const removeBlock = (blockId) => {
    const updated = blocks.filter(b => b.id !== blockId);
    updated.forEach((b, i) => b.order = i);
    saveBlocks(updated);
    if (selectedBlock === blockId) setSelectedBlock(null);
  };

  const duplicateBlock = (blockId) => {
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    const clone = { ...blocks[idx], id: `block_${Date.now()}`, content: { ...blocks[idx].content } };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, clone);
    updated.forEach((b, i) => b.order = i);
    saveBlocks(updated);
  };

  const moveBlock = (blockId, direction) => {
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;
    const updated = [...blocks];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    updated.forEach((b, i) => b.order = i);
    saveBlocks(updated);
  };

  const updateBlockContent = (blockId, contentUpdates) => {
    const updated = blocks.map(b => b.id === blockId ? { ...b, content: { ...b.content, ...contentUpdates } } : b);
    saveBlocks(updated);
  };

  const handleLoadTemplate = (template) => {
    const newBlocks = template.content.map((b, i) => ({
      ...b,
      id: `block_${Date.now()}_${i}`,
      order: i,
      content: { ...b.content }
    }));
    saveBlocks(newBlocks);
    setShowTemplateModal(false);
    addToast('Template loaded');
  };

  const handleSendTest = () => {
    if (!testEmail) return;
    addToast(`Test email sent to ${testEmail}`);
    setShowTestModal(false);
  };

  const selectedBlockData = blocks.find(b => b.id === selectedBlock);

  const emailWidth = previewMode === 'desktop' ? 600 : 375;

  const renderBlockPreview = (block) => {
    switch (block.type) {
      case 'header':
        return (
          <div style={{ padding: '20px 0', textAlign: 'center', fontWeight: 700, fontSize: 20, background: block.content.bgColor || '#fff' }}>
            {block.content.logoSrc && <img src={block.content.logoSrc} alt="Logo" style={{ maxHeight: 40, marginBottom: 8 }} />}
            <div>{block.content.text || 'Header'}</div>
          </div>
        );
      case 'text':
        return <div style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: block.content.html || '<p>Text block</p>' }} />;
      case 'image':
        return (
          <div style={{ background: '#F0F0F0', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#707070' }}>
            {block.content.src ? (
              <img src={block.content.src} alt={block.content.alt} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Image size={32} />
                <div style={{ fontSize: 12, marginTop: 8 }}>Drop image or enter URL</div>
              </div>
            )}
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: block.content.align || 'center', padding: '12px 0' }}>
            <span style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: block.content.bgColor,
              color: block.content.textColor,
              borderRadius: `${block.content.borderRadius || 4}px`,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 0.5
            }}>
              {block.content.text}
            </span>
          </div>
        );
      case 'divider':
        return <hr style={{ border: 'none', borderTop: `1px ${block.content.style} ${block.content.color}`, margin: '12px 0' }} />;
      case 'social':
        return (
          <div style={{ textAlign: 'center', padding: '12px 0', display: 'flex', justifyContent: 'center', gap: 16 }}>
            {block.content.networks?.map((n, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: '#241C15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                {n.name[0]}
              </div>
            ))}
          </div>
        );
      case 'footer':
        return (
          <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#707070', lineHeight: 1.8 }}>
            <div>{block.content.text}</div>
            <a href="#" style={{ color: '#007C89' }}>{block.content.unsubscribeText}</a>
            <div style={{ marginTop: 4 }}>{block.content.address}</div>
          </div>
        );
      default:
        return <div>{block.type}</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Toolbar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="back-link" onClick={() => navigate(`/campaigns/${id}/setup`)} style={{ marginBottom: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{campaign.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Preview Toggle */}
          <div className="segmented-control" style={{ marginRight: 8 }}>
            <button className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')} title="Desktop preview">
              <Monitor size={14} />
            </button>
            <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')} title="Mobile preview">
              <Smartphone size={14} />
            </button>
          </div>
          <span className="text-xs text-muted" style={{ marginRight: 8 }}>Auto-saved</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outlined btn-sm" onClick={() => setShowTemplateModal(true)}>Templates</button>
          <button className="btn btn-outlined btn-sm" onClick={() => setShowTestModal(true)}>
            <Send size={12} /> Send Test
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/campaigns/${id}/setup`)}>Continue</button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="email-editor">
        {/* Left Sidebar */}
        <div className="editor-sidebar">
          <div className="tab-bar">
            <button className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>Content</button>
            <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>Design</button>
          </div>

          {activeTab === 'content' && (
            <div>
              {selectedBlockData ? (
                <div style={{ padding: 16 }}>
                  <button className="back-link" onClick={() => setSelectedBlock(null)} style={{ marginBottom: 12 }}>
                    <ArrowLeft size={14} /> All blocks
                  </button>
                  <h4 style={{ marginBottom: 16, fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>
                    Edit {selectedBlockData.type}
                  </h4>

                  {selectedBlockData.type === 'text' && (
                    <div className="form-group">
                      <label>Content (HTML)</label>
                      <textarea rows={8} value={selectedBlockData.content.html} onChange={e => updateBlockContent(selectedBlock, { html: e.target.value })} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                  )}

                  {selectedBlockData.type === 'button' && (
                    <>
                      <div className="form-group"><label>Button Text</label><input value={selectedBlockData.content.text} onChange={e => updateBlockContent(selectedBlock, { text: e.target.value })} /></div>
                      <div className="form-group"><label>Link URL</label><input value={selectedBlockData.content.url} onChange={e => updateBlockContent(selectedBlock, { url: e.target.value })} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label>Background</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="color" value={selectedBlockData.content.bgColor} onChange={e => updateBlockContent(selectedBlock, { bgColor: e.target.value })} style={{ width: 36, height: 36, padding: 2, cursor: 'pointer' }} />
                            <input value={selectedBlockData.content.bgColor} onChange={e => updateBlockContent(selectedBlock, { bgColor: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Text Color</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="color" value={selectedBlockData.content.textColor} onChange={e => updateBlockContent(selectedBlock, { textColor: e.target.value })} style={{ width: 36, height: 36, padding: 2, cursor: 'pointer' }} />
                            <input value={selectedBlockData.content.textColor} onChange={e => updateBlockContent(selectedBlock, { textColor: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Border Radius</label>
                        <input type="range" min="0" max="30" value={selectedBlockData.content.borderRadius || 4} onChange={e => updateBlockContent(selectedBlock, { borderRadius: e.target.value })} style={{ width: '100%' }} />
                        <span className="text-xs text-muted">{selectedBlockData.content.borderRadius || 4}px</span>
                      </div>
                      <div className="form-group">
                        <label>Alignment</label>
                        <div className="segmented-control" style={{ width: '100%' }}>
                          {['left', 'center', 'right'].map(a => (
                            <button key={a} className={selectedBlockData.content.align === a ? 'active' : ''} onClick={() => updateBlockContent(selectedBlock, { align: a })} style={{ flex: 1 }}>
                              {a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === 'image' && (
                    <>
                      <div className="form-group"><label>Image URL</label><input value={selectedBlockData.content.src} onChange={e => updateBlockContent(selectedBlock, { src: e.target.value })} placeholder="https://..." /></div>
                      <div className="form-group"><label>Alt Text</label><input value={selectedBlockData.content.alt} onChange={e => updateBlockContent(selectedBlock, { alt: e.target.value })} /></div>
                      <div className="form-group"><label>Link URL (optional)</label><input value={selectedBlockData.content.link} onChange={e => updateBlockContent(selectedBlock, { link: e.target.value })} /></div>
                      <div className="form-group">
                        <label>Width</label>
                        <select value={selectedBlockData.content.width} onChange={e => updateBlockContent(selectedBlock, { width: e.target.value })}>
                          <option value="100%">Full Width</option>
                          <option value="75%">75%</option>
                          <option value="50%">50%</option>
                        </select>
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === 'header' && (
                    <>
                      <div className="form-group"><label>Header Text</label><input value={selectedBlockData.content.text} onChange={e => updateBlockContent(selectedBlock, { text: e.target.value })} /></div>
                      <div className="form-group"><label>Logo URL</label><input value={selectedBlockData.content.logoSrc || ''} onChange={e => updateBlockContent(selectedBlock, { logoSrc: e.target.value })} placeholder="https://..." /></div>
                      <div className="form-group">
                        <label>Background Color</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={selectedBlockData.content.bgColor || '#FFFFFF'} onChange={e => updateBlockContent(selectedBlock, { bgColor: e.target.value })} style={{ width: 36, height: 36, padding: 2 }} />
                          <input value={selectedBlockData.content.bgColor || '#FFFFFF'} onChange={e => updateBlockContent(selectedBlock, { bgColor: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === 'footer' && (
                    <>
                      <div className="form-group"><label>Company Name</label><input value={selectedBlockData.content.text} onChange={e => updateBlockContent(selectedBlock, { text: e.target.value })} /></div>
                      <div className="form-group"><label>Address</label><input value={selectedBlockData.content.address} onChange={e => updateBlockContent(selectedBlock, { address: e.target.value })} /></div>
                      <div className="form-group"><label>Unsubscribe Text</label><input value={selectedBlockData.content.unsubscribeText} onChange={e => updateBlockContent(selectedBlock, { unsubscribeText: e.target.value })} /></div>
                    </>
                  )}

                  {selectedBlockData.type === 'divider' && (
                    <>
                      <div className="form-group">
                        <label>Style</label>
                        <select value={selectedBlockData.content.style} onChange={e => updateBlockContent(selectedBlock, { style: e.target.value })}>
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Color</label>
                        <input type="color" value={selectedBlockData.content.color} onChange={e => updateBlockContent(selectedBlock, { color: e.target.value })} style={{ width: '100%', height: 36 }} />
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === 'social' && (
                    <div>
                      <label className="text-sm" style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Social Networks</label>
                      {(selectedBlockData.content.networks || []).map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                          <input value={n.name} onChange={e => {
                            const nets = [...selectedBlockData.content.networks];
                            nets[i] = { ...nets[i], name: e.target.value };
                            updateBlockContent(selectedBlock, { networks: nets });
                          }} style={{ flex: 1, height: 32, fontSize: 12 }} />
                          <input value={n.url} onChange={e => {
                            const nets = [...selectedBlockData.content.networks];
                            nets[i] = { ...nets[i], url: e.target.value };
                            updateBlockContent(selectedBlock, { networks: nets });
                          }} placeholder="URL" style={{ flex: 2, height: 32, fontSize: 12 }} />
                          <button onClick={() => {
                            const nets = selectedBlockData.content.networks.filter((_, idx) => idx !== i);
                            updateBlockContent(selectedBlock, { networks: nets });
                          }} style={{ background: 'none', border: 'none', color: '#D5432F', cursor: 'pointer', padding: 2 }}><X size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const nets = [...(selectedBlockData.content.networks || []), { name: 'Link', url: '#', icon: 'link' }];
                        updateBlockContent(selectedBlock, { networks: nets });
                      }} style={{ background: 'none', border: 'none', color: '#007C89', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Plus size={12} /> Add network
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#707070', textTransform: 'uppercase', letterSpacing: 0.5 }}>Content blocks</div>
                  {blockTypes.map(bt => (
                    <div key={bt.type} className="block-type-card" onClick={() => addBlock(bt.type)}>
                      <div className="block-type-icon"><bt.icon size={18} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{bt.label}</div>
                        <div style={{ fontSize: 11, color: '#707070' }}>{bt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'design' && (
            <div style={{ padding: 16 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Global Styles</h4>
              <div className="form-group">
                <label>Page Background</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={globalStyles.bgColor} onChange={e => setGlobalStyles({ ...globalStyles, bgColor: e.target.value })} style={{ width: 36, height: 36, padding: 2 }} />
                  <input value={globalStyles.bgColor} onChange={e => setGlobalStyles({ ...globalStyles, bgColor: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Content Background</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={globalStyles.contentBgColor} onChange={e => setGlobalStyles({ ...globalStyles, contentBgColor: e.target.value })} style={{ width: 36, height: 36, padding: 2 }} />
                  <input value={globalStyles.contentBgColor} onChange={e => setGlobalStyles({ ...globalStyles, contentBgColor: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Font Family</label>
                <select value={globalStyles.fontFamily} onChange={e => setGlobalStyles({ ...globalStyles, fontFamily: e.target.value })}>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>
              <div className="form-group">
                <label>Text Color</label>
                <input type="color" value={globalStyles.textColor} onChange={e => setGlobalStyles({ ...globalStyles, textColor: e.target.value })} style={{ width: '100%', height: 36 }} />
              </div>
              <div className="form-group">
                <label>Link Color</label>
                <input type="color" value={globalStyles.linkColor} onChange={e => setGlobalStyles({ ...globalStyles, linkColor: e.target.value })} style={{ width: '100%', height: 36 }} />
              </div>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="editor-preview" style={{ background: globalStyles.bgColor }}>
          <div className="email-frame" style={{
            width: emailWidth,
            maxWidth: emailWidth,
            background: globalStyles.contentBgColor,
            fontFamily: globalStyles.fontFamily,
            color: globalStyles.textColor,
            transition: 'width 0.3s ease'
          }}>
            {blocks.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#707070' }}>
                <Layout size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Design your email</p>
                <p style={{ fontSize: 13 }}>Click a content block from the sidebar or choose a template to get started.</p>
              </div>
            ) : (
              blocks.map((block, i) => (
                <React.Fragment key={block.id}>
                  <div
                    className={`email-block ${selectedBlock === block.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBlock(block.id)}
                    onDragOver={e => { e.preventDefault(); setDragOverIndex(i); }}
                    onDrop={() => setDragOverIndex(null)}
                    style={{ borderTop: dragOverIndex === i ? '2px solid #007C89' : undefined }}
                  >
                    {selectedBlock === block.id && (
                      <div className="email-block-actions">
                        <button title="Move up" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}><ChevronUp size={12} /></button>
                        <button title="Move down" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}><ChevronDown size={12} /></button>
                        <button title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}><Copy size={12} /></button>
                        <button title="Delete" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} style={{ color: '#D5432F' }}><Trash2 size={12} /></button>
                      </div>
                    )}
                    {renderBlockPreview(block)}
                  </div>
                </React.Fragment>
              ))
            )}
            {blocks.length > 0 && (
              <div style={{ padding: '8px 16px' }}>
                <button className="add-block-btn" onClick={() => addBlock('text')}>
                  <Plus size={14} /> Add content block
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Test Modal */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Test Email</h2>
              <button onClick={() => setShowTestModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-16">Send a test version of this email to check how it looks in your inbox.</p>
              <div className="form-group">
                <label>Send to</label>
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <p className="text-xs text-muted">Subject line: {campaign.subject || '(No subject)'}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowTestModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendTest}><Send size={14} /> Send Test</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" style={{ width: 700, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Choose a Template</h2>
              <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="template-grid">
                {state.templates.map(t => (
                  <div key={t.id} className="template-card" onClick={() => handleLoadTemplate(t)}>
                    <div className="template-preview">
                      <div className="template-preview-header" />
                      <div className="template-preview-text" />
                      <div className="template-preview-image" />
                      <div className="template-preview-button" />
                    </div>
                    <div className="template-card-name">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
