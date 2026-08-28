import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const TABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'logistics', label: '物流设置' },
  { key: 'quickReply', label: '快捷回复' },
]

export default function StoreSettings() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('basic')

  // Basic info form
  const [basicForm, setBasicForm] = useState({
    name: state.store.name,
    description: state.store.description,
    announcement: state.store.announcement,
    phone: state.store.phone,
    returnAddress: state.store.returnAddress,
    location: state.store.location,
  })

  // Logistics templates
  const [templates, setTemplates] = useState(state.logisticsTemplates)
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', freeShippingThreshold: '', baseFee: '', description: '' })
  const [editingTemplateId, setEditingTemplateId] = useState(null)
  const [editingTemplate, setEditingTemplate] = useState(null)

  // Quick replies
  const [quickReplies, setQuickReplies] = useState(state.quickReplies)
  const [editingQr, setEditingQr] = useState(null)

  function saveBasic() {
    dispatch({ type: 'UPDATE_STORE_SETTINGS', payload: basicForm })
    addToast('基本信息已保存', 'success')
  }

  function addTemplate() {
    if (!newTemplate.name) { addToast('请填写模板名称', 'error'); return }
    const tpl = { id: `lt_${Date.now()}`, ...newTemplate, freeShippingThreshold: Number(newTemplate.freeShippingThreshold) || 0, baseFee: Number(newTemplate.baseFee) || 0 }
    const updated = [...templates, tpl]
    setTemplates(updated)
    dispatch({ type: 'UPDATE_LOGISTICS_TEMPLATES', payload: updated })
    setNewTemplate({ name: '', freeShippingThreshold: '', baseFee: '', description: '' })
    setShowAddTemplate(false)
    addToast('模板已添加', 'success')
  }

  function deleteTemplate(id) {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    dispatch({ type: 'UPDATE_LOGISTICS_TEMPLATES', payload: updated })
    addToast('模板已删除', 'info')
  }

  function startEditTemplate(tpl) {
    setEditingTemplateId(tpl.id)
    setEditingTemplate({ ...tpl, freeShippingThreshold: String(tpl.freeShippingThreshold), baseFee: String(tpl.baseFee) })
  }

  function saveEditTemplate() {
    if (!editingTemplate.name) { addToast('请填写模板名称', 'error'); return }
    const updated = templates.map(t =>
      t.id === editingTemplateId
        ? { ...t, ...editingTemplate, freeShippingThreshold: Number(editingTemplate.freeShippingThreshold) || 0, baseFee: Number(editingTemplate.baseFee) || 0 }
        : t
    )
    setTemplates(updated)
    dispatch({ type: 'UPDATE_LOGISTICS_TEMPLATES', payload: updated })
    setEditingTemplateId(null)
    setEditingTemplate(null)
    addToast('模板已更新', 'success')
  }

  function cancelEditTemplate() {
    setEditingTemplateId(null)
    setEditingTemplate(null)
  }

  function saveLogisticsTemplates() {
    dispatch({ type: 'UPDATE_LOGISTICS_TEMPLATES', payload: templates })
    addToast('物流设置已保存', 'success')
  }

  function addQuickReply() {
    setQuickReplies(prev => [...prev, { id: `qr_${Date.now()}`, label: '', content: '' }])
  }

  function updateQuickReply(id, field, value) {
    setQuickReplies(prev => prev.map(qr => qr.id === id ? { ...qr, [field]: value } : qr))
  }

  function deleteQuickReply(id) {
    setQuickReplies(prev => prev.filter(qr => qr.id !== id))
    addToast('快捷回复已删除', 'info')
  }

  function saveQuickReplies() {
    dispatch({ type: 'SET_CURRENT_STATE', payload: { quickReplies } })
    addToast('快捷回复已保存', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">店铺设置</h1>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Tab sidebar */}
        <div style={{ width: 140, background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px 0 0 8px', overflow: 'hidden' }}>
          {TABS.map(tab => (
            <div
              key={tab.key}
              className={`settings-tab${activeTab === tab.key ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              tabIndex={0}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab(tab.key) } }}
              style={{
                padding: '12px 16px', cursor: 'pointer', fontSize: 14,
                borderLeft: activeTab === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
                background: activeTab === tab.key ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontWeight: activeTab === tab.key ? 500 : 400,
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid var(--color-border)', borderLeft: 'none', borderRadius: '0 8px 8px 0', padding: 24 }}>
          {activeTab === 'basic' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>基本信息</div>
              <div className="form-group">
                <label className="form-label required">店铺名称</label>
                <input className="form-input" style={{ width: 300 }} value={basicForm.name} onChange={e => setBasicForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">店铺描述</label>
                <textarea className="form-input" style={{ width: '100%', maxWidth: 500, minHeight: 80, resize: 'vertical' }} value={basicForm.description} onChange={e => setBasicForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">店铺公告</label>
                <textarea className="form-input" style={{ width: '100%', maxWidth: 500, minHeight: 80, resize: 'vertical' }} value={basicForm.announcement} onChange={e => setBasicForm(f => ({ ...f, announcement: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">联系电话</label>
                <input className="form-input" style={{ width: 200 }} value={basicForm.phone} onChange={e => setBasicForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">退货地址</label>
                <input className="form-input" style={{ width: 400 }} value={basicForm.returnAddress} onChange={e => setBasicForm(f => ({ ...f, returnAddress: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">店铺位置</label>
                <input className="form-input" style={{ width: 200 }} value={basicForm.location} onChange={e => setBasicForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <button className="btn btn-primary" onClick={saveBasic}>保存设置</button>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>物流模板</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-default btn-sm" onClick={() => setShowAddTemplate(true)}>添加模板</button>
                  <button className="btn btn-primary btn-sm" onClick={saveLogisticsTemplates}>保存物流设置</button>
                </div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>模板名称</th>
                      <th>免邮门槛</th>
                      <th>基础运费</th>
                      <th>说明</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map(tpl => (
                      editingTemplateId === tpl.id ? (
                        <tr key={tpl.id}>
                          <td>
                            <input className="form-input" style={{ width: 120 }} value={editingTemplate.name} onChange={e => setEditingTemplate(f => ({ ...f, name: e.target.value }))} />
                          </td>
                          <td>
                            <input type="number" className="form-input" style={{ width: 80 }} placeholder="0=无门槛" value={editingTemplate.freeShippingThreshold} onChange={e => setEditingTemplate(f => ({ ...f, freeShippingThreshold: e.target.value }))} />
                          </td>
                          <td>
                            <input type="number" className="form-input" style={{ width: 80 }} placeholder="0=免邮" value={editingTemplate.baseFee} onChange={e => setEditingTemplate(f => ({ ...f, baseFee: e.target.value }))} />
                          </td>
                          <td>
                            <input className="form-input" style={{ width: 140 }} value={editingTemplate.description} onChange={e => setEditingTemplate(f => ({ ...f, description: e.target.value }))} />
                          </td>
                          <td>
                            <button className="btn btn-link" style={{ fontSize: 12 }} onClick={saveEditTemplate}>保存</button>
                            <button className="btn btn-link" style={{ fontSize: 12 }} onClick={cancelEditTemplate}>取消</button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={tpl.id}>
                          <td style={{ fontWeight: 500 }}>{tpl.name}</td>
                          <td>{tpl.freeShippingThreshold > 0 ? `¥${tpl.freeShippingThreshold}` : '无门槛'}</td>
                          <td>{tpl.baseFee > 0 ? `¥${tpl.baseFee}` : '免费'}</td>
                          <td style={{ fontSize: 12, color: '#999' }}>{tpl.description}</td>
                          <td>
                            <button className="btn btn-link" style={{ fontSize: 12, marginRight: 8 }} onClick={() => startEditTemplate(tpl)}>编辑</button>
                            <button className="btn btn-link" style={{ fontSize: 12, color: 'var(--color-danger)' }} onClick={() => deleteTemplate(tpl.id)}>删除</button>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddTemplate && (
                <div style={{ marginTop: 16, padding: 16, background: '#FAFAFA', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 500, marginBottom: 12 }}>添加新模板</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">模板名称</label>
                      <input className="form-input" value={newTemplate.name} onChange={e => setNewTemplate(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">免邮门槛（¥）</label>
                      <input type="number" className="form-input" placeholder="0=无门槛" value={newTemplate.freeShippingThreshold} onChange={e => setNewTemplate(f => ({ ...f, freeShippingThreshold: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">基础运费（¥）</label>
                      <input type="number" className="form-input" placeholder="0=免邮" value={newTemplate.baseFee} onChange={e => setNewTemplate(f => ({ ...f, baseFee: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">说明</label>
                      <input className="form-input" value={newTemplate.description} onChange={e => setNewTemplate(f => ({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={addTemplate}>保存</button>
                    <button className="btn btn-default btn-sm" onClick={() => setShowAddTemplate(false)}>取消</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quickReply' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>快捷回复</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-default btn-sm" onClick={addQuickReply}>添加回复</button>
                  <button className="btn btn-primary btn-sm" onClick={saveQuickReplies}>保存全部</button>
                </div>
              </div>
              {quickReplies.map((qr, i) => (
                <div key={qr.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 20, flexShrink: 0, color: '#999', lineHeight: '32px', fontSize: 12 }}>{i + 1}</span>
                  <input
                    className="form-input"
                    style={{ width: 120, flexShrink: 0 }}
                    placeholder="标签"
                    value={qr.label}
                    onChange={e => updateQuickReply(qr.id, 'label', e.target.value)}
                  />
                  <textarea
                    className="form-input"
                    style={{ flex: 1, minHeight: 60, resize: 'vertical' }}
                    placeholder="回复内容"
                    value={qr.content}
                    onChange={e => updateQuickReply(qr.id, 'content', e.target.value)}
                  />
                  <button className="btn btn-link" style={{ color: 'var(--color-danger)', lineHeight: '32px' }} onClick={() => deleteQuickReply(qr.id)}>删除</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
