import { useState } from 'react'
import { useApp } from '../context/AppContext'

const TYPES = [
  { key: 'leave', label: '请假', icon: '🌿' },
  { key: 'expense', label: '报销', icon: '💰' },
  { key: 'business_trip', label: '出差', icon: '✈️' },
  { key: 'overtime', label: '加班', icon: '⏰' },
  { key: 'purchase', label: '采购', icon: '🛒' },
  { key: 'general', label: '通用申请', icon: '📋' },
]

export default function CreateApprovalModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [step, setStep] = useState('type')
  const [selectedType, setSelectedType] = useState(null)
  const [fields, setFields] = useState({})

  const setField = (k, v) => setFields(prev => ({ ...prev, [k]: v }))

  const getDefaultApprovers = () => {
    const manager = state.users.find(u => u.id === 'user_005')
    return manager ? [manager.id] : []
  }

  const handleSubmit = () => {
    if (!selectedType) return
    const typeInfo = TYPES.find(t => t.key === selectedType)
    dispatch({
      type: 'SUBMIT_APPROVAL',
      form: {
        type: selectedType,
        title: typeInfo.label + '申请',
        approverIds: getDefaultApprovers(),
        currentApproverId: getDefaultApprovers()[0] || null,
        fields
      }
    })
    onClose()
  }

  const renderForm = () => {
    switch (selectedType) {
      case 'leave':
        return (
          <>
            <FormField label="假期类型">
              <select value={fields.leaveType || ''} onChange={e => setField('leaveType', e.target.value)} className="form-select">
                <option value="">请选择</option>
                {['年假','事假','病假','调休'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="开始日期">
              <input type="date" value={fields.startDate || ''} onChange={e => setField('startDate', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="结束日期">
              <input type="date" value={fields.endDate || ''} onChange={e => setField('endDate', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="请假原因">
              <textarea value={fields.reason || ''} onChange={e => setField('reason', e.target.value)} className="form-textarea" placeholder="请输入请假原因" />
            </FormField>
          </>
        )
      case 'expense':
        return (
          <>
            <FormField label="费用类别">
              <select value={fields.category || ''} onChange={e => setField('category', e.target.value)} className="form-select">
                <option value="">请选择</option>
                {['差旅','办公用品','招待','其他'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="报销金额">
              <input type="number" value={fields.amount || ''} onChange={e => setField('amount', parseFloat(e.target.value))} className="form-input" placeholder="0.00" />
            </FormField>
            <FormField label="报销说明">
              <textarea value={fields.reason || ''} onChange={e => setField('reason', e.target.value)} className="form-textarea" placeholder="请描述报销事项" />
            </FormField>
          </>
        )
      case 'business_trip':
        return (
          <>
            <FormField label="出差地点">
              <input type="text" value={fields.destination || ''} onChange={e => setField('destination', e.target.value)} className="form-input" placeholder="目的地城市" />
            </FormField>
            <FormField label="出发日期">
              <input type="date" value={fields.startDate || ''} onChange={e => setField('startDate', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="返回日期">
              <input type="date" value={fields.endDate || ''} onChange={e => setField('endDate', e.target.value)} className="form-input" />
            </FormField>
            <FormField label="出行方式">
              <select value={fields.transportation || ''} onChange={e => setField('transportation', e.target.value)} className="form-select">
                <option value="">请选择</option>
                {['高铁','飞机','自驾','其他'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="出差目的">
              <textarea value={fields.purpose || ''} onChange={e => setField('purpose', e.target.value)} className="form-textarea" placeholder="请描述出差目的" />
            </FormField>
          </>
        )
      default:
        return (
          <FormField label="申请说明">
            <textarea value={fields.reason || ''} onChange={e => setField('reason', e.target.value)} className="form-textarea" placeholder="请描述申请内容" />
          </FormField>
        )
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{step === 'type' ? '选择审批类型' : TYPES.find(t => t.key === selectedType)?.label + '申请'}</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body">
          {step === 'type' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {TYPES.map(t => (
                <div
                  key={t.key}
                  onClick={() => { setSelectedType(t.key); setStep('form') }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: 16, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <span style={{ fontSize: 13 }}>{t.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                审批人：{state.users.find(u => u.id === getDefaultApprovers()[0])?.name || '技术总监'}
              </div>
              {renderForm()}
            </div>
          )}
        </div>
        {step === 'form' && (
          <div className="modal-footer">
            <button className="btn btn-default" onClick={() => setStep('type')}>上一步</button>
            <button className="btn btn-primary" onClick={handleSubmit}>提交</button>
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}
