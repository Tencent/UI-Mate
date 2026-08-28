import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from './Toast'
import Modal from './Modal'

export function MatterModal({ onClose, matter = null, defaultClientId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const clients = state.contacts.filter(c => c.tags?.includes('Client') || c.type === 'Company')
  const now = new Date()
  const [form, setForm] = useState({
    clientId: matter?.clientId || defaultClientId || '',
    description: matter?.description || '',
    practiceArea: matter?.practiceArea || state.firmSettings.practiceAreas[0],
    responsibleAttorneyId: matter?.responsibleAttorneyId || state.currentUserId,
    billingMethod: matter?.billingMethod || 'Hourly',
    hourlyRate: matter?.hourlyRate ?? state.firmSettings.defaultBillingRate,
    budget: matter?.budget || '',
    courtName: matter?.courtName || '',
    caseNumber: matter?.caseNumber || '',
    status: matter?.status || 'Open',
    stage: matter?.stage || 'Intake',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    if (!form.clientId || !form.description) { addToast('Client and description are required', 'error'); return }
    const client = state.contacts.find(c => c.id === form.clientId)
    const attorney = state.users.find(u => u.id === form.responsibleAttorneyId)
    if (matter) {
      dispatch({ type: 'UPDATE_MATTER', payload: { ...matter, ...form, clientName: client?.displayName, responsibleAttorneyName: attorney?.name, updatedAt: new Date().toISOString() } })
      addToast('Matter updated')
    } else {
      const lastName = client?.lastName || client?.displayName?.split(' ').pop() || 'Unknown'
      const num = String(Math.floor(Math.random() * 90000) + 10000)
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      const newMatter = {
        id: `matter-${Date.now()}`,
        matterNumber: `${num}-${lastName}-${month}.${year}`,
        ...form,
        clientName: client?.displayName,
        responsibleAttorneyName: attorney?.name,
        originatingAttorneyId: state.currentUserId,
        openDate: now.toISOString().split('T')[0],
        closeDate: null, pendingDate: null, statuteOfLimitations: null,
        relatedContacts: [], tags: [], notes: '',
        createdAt: now.toISOString(), updatedAt: now.toISOString()
      }
      dispatch({ type: 'ADD_MATTER', payload: newMatter })
      addToast('Matter created')
    }
    onClose()
  }

  return (
    <Modal title={matter ? 'Edit Matter' : 'New Matter'} onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Client *</label>
          <select className="select-field" value={form.clientId} onChange={e => f('clientId')(e.target.value)}>
            <option value="">Select client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.displayName} {c.email ? `(${c.email})` : ''}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <input className="input-field" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="e.g. Divorce Proceedings" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Practice Area</label>
            <select className="select-field" value={form.practiceArea} onChange={e => f('practiceArea')(e.target.value)}>
              {state.firmSettings.practiceAreas.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Responsible Attorney</label>
            <select className="select-field" value={form.responsibleAttorneyId} onChange={e => f('responsibleAttorneyId')(e.target.value)}>
              {state.users.filter(u => u.subscriberType === 'Attorney').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        {matter && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="select-field" value={form.status} onChange={e => f('status')(e.target.value)}>
                {['Open', 'Pending', 'Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="select-field" value={form.stage} onChange={e => f('stage')(e.target.value)}>
                {['Intake', 'Filing', 'Discovery', 'Negotiation', 'Trial', 'Appeal', 'Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Billing Method</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Hourly', 'Flat Fee', 'Contingency'].map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="radio" checked={form.billingMethod === m} onChange={() => f('billingMethod')(m)} /> {m}
              </label>
            ))}
          </div>
        </div>
        {form.billingMethod === 'Hourly' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hourly Rate ($)</label>
              <input className="input-field" type="number" value={form.hourlyRate} onChange={e => f('hourlyRate')(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Budget ($)</label>
              <input className="input-field" type="number" value={form.budget} onChange={e => f('budget')(Number(e.target.value))} placeholder="Optional" />
            </div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Court Name</label>
            <input className="input-field" value={form.courtName} onChange={e => f('courtName')(e.target.value)} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label className="form-label">Case Number</label>
            <input className="input-field" value={form.caseNumber} onChange={e => f('caseNumber')(e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{matter ? 'Save Changes' : 'Save'}</button>
      </div>
    </Modal>
  )
}

export function ContactModal({ onClose, contact = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const [type, setType] = useState(contact?.type || 'Person')
  const [form, setForm] = useState({
    prefix: contact?.prefix || '',
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    companyName: contact?.companyName || '',
    jobTitle: contact?.jobTitle || '',
    email: contact?.email || '',
    emailSecondary: contact?.emailSecondary || '',
    phone: contact?.phone || '',
    phoneType: contact?.phoneType || 'Work',
    website: contact?.website || '',
    street: contact?.address?.street || '',
    city: contact?.address?.city || '',
    state: contact?.address?.state || '',
    zip: contact?.address?.zip || '',
    country: contact?.address?.country || 'Canada',
    dateOfBirth: contact?.dateOfBirth || '',
    maritalStatus: contact?.maritalStatus || '',
    tags: contact?.tags || [],
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const allTags = ['Client', 'Opposing Counsel', 'Judge', 'Witness', 'Expert', 'Other']

  const toggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }))
  }

  const handleSave = () => {
    if (type === 'Person' && !form.firstName) { addToast('First name is required', 'error'); return }
    if (type === 'Company' && !form.companyName) { addToast('Company name is required', 'error'); return }

    const displayName = type === 'Person'
      ? `${form.firstName} ${form.lastName}`.trim()
      : form.companyName

    const data = {
      ...form,
      type,
      displayName,
      address: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
      customFields: contact?.customFields || {},
      billingInfo: contact?.billingInfo || { ledesClientId: '', paymentProfile: 'Default (30 days)' },
      updatedAt: new Date().toISOString()
    }

    if (contact) {
      dispatch({ type: 'UPDATE_CONTACT', payload: { ...contact, ...data } })
      addToast('Contact updated')
    } else {
      dispatch({ type: 'ADD_CONTACT', payload: { ...data, id: `contact-${Date.now()}`, createdAt: new Date().toISOString() } })
      addToast('Contact created')
    }
    onClose()
  }

  return (
    <Modal title={contact ? 'Edit Contact' : 'New Contact'} onClose={onClose}>
      <div className="modal-body">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['Person', 'Company'].map(t => (
            <button key={t} className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
        {type === 'Person' ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prefix</label>
                <select className="select-field" value={form.prefix} onChange={e => f('prefix')(e.target.value)}>
                  <option value="">None</option>
                  {['Mr.','Ms.','Mrs.','Dr.','Hon.'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="input-field" value={form.firstName} onChange={e => f('firstName')(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="input-field" value={form.lastName} onChange={e => f('lastName')(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="input-field" value={form.jobTitle} onChange={e => f('jobTitle')(e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="input-field" value={form.companyName} onChange={e => f('companyName')(e.target.value)} />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={e => f('email')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="input-field" value={form.phone} onChange={e => f('phone')(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="input-field" value={form.website} onChange={e => f('website')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Type</label>
            <select className="select-field" value={form.phoneType} onChange={e => f('phoneType')(e.target.value)}>
              {['Work','Mobile','Home'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="input-field" style={{ marginBottom: 8 }} placeholder="Street" value={form.street} onChange={e => f('street')(e.target.value)} />
          <div className="form-row">
            <input className="input-field" placeholder="City" value={form.city} onChange={e => f('city')(e.target.value)} />
            <input className="input-field" placeholder="State/Province" value={form.state} onChange={e => f('state')(e.target.value)} />
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <input className="input-field" placeholder="ZIP/Postal Code" value={form.zip} onChange={e => f('zip')(e.target.value)} />
            <input className="input-field" placeholder="Country" value={form.country} onChange={e => f('country')(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Tags</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allTags.map(tag => (
              <button key={tag}
                className={`btn btn-sm ${form.tags.includes(tag) ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleTag(tag)}>{tag}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{contact ? 'Save Changes' : 'Save'}</button>
      </div>
    </Modal>
  )
}

export function TimeEntryModal({ onClose, prefill = {} }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    matterId: prefill.matterId || '',
    date: prefill.date || today,
    description: prefill.description || '',
    duration: prefill.duration || '',
    rate: prefill.rate || state.firmSettings.defaultBillingRate,
    billable: prefill.billable !== false,
    category: state.firmSettings.activityCategories[0],
  })

  const f = (k) => (v) => setForm(prev => {
    const updated = { ...prev, [k]: v }
    if (k === 'matterId') {
      const m = state.matters.find(m => m.id === v)
      if (m && m.billingMethod === 'Hourly') updated.rate = m.hourlyRate
    }
    return updated
  })

  const total = (parseFloat(form.duration) || 0) * (parseFloat(form.rate) || 0)
  const user = state.users.find(u => u.id === state.currentUserId)
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null

  const handleSave = () => {
    if (!form.description || !form.duration) { addToast('Description and duration are required', 'error'); return }
    const activity = {
      id: `activity-${Date.now()}`,
      type: 'TimeEntry',
      matterId: form.matterId || null,
      matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
      userId: state.currentUserId,
      userName: user?.name,
      date: form.date,
      description: form.description,
      duration: parseFloat(form.duration),
      rate: parseFloat(form.rate),
      total,
      billable: form.billable,
      billed: false,
      billId: null,
      category: form.category,
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ACTIVITY', payload: activity })
    addToast('Time entry added')
    onClose()
  }

  return (
    <Modal title="New Time Entry" onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Matter</label>
          <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
            <option value="">No matter</option>
            {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber} - {m.description}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="input-field" type="date" value={form.date} onChange={e => f('date')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="select-field" value={form.category} onChange={e => f('category')(e.target.value)}>
              {state.firmSettings.activityCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="textarea-field" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="Describe work performed..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Duration (hours) *</label>
            <input className="input-field" type="number" step="0.25" min="0" value={form.duration} onChange={e => f('duration')(e.target.value)} placeholder="e.g. 2.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Rate ($/hr)</label>
            <input className="input-field" type="number" value={form.rate} onChange={e => f('rate')(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.billable} onChange={e => f('billable')(e.target.checked)} className="checkbox" />
            <span style={{ fontSize: 14 }}>Billable</span>
          </label>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Total: ${total.toFixed(2)}</div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

export function ExpenseModal({ onClose, prefill = {} }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    matterId: prefill.matterId || '',
    date: today,
    description: '',
    quantity: 1,
    rate: '',
    billable: true,
    category: 'Filing Fees',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const total = (parseFloat(form.quantity) || 0) * (parseFloat(form.rate) || 0)
  const user = state.users.find(u => u.id === state.currentUserId)
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null

  const handleSave = () => {
    if (!form.description || !form.rate) { addToast('Description and rate are required', 'error'); return }
    const activity = {
      id: `activity-${Date.now()}`,
      type: 'ExpenseEntry',
      matterId: form.matterId || null,
      matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
      userId: state.currentUserId,
      userName: user?.name,
      date: form.date,
      description: form.description,
      quantity: parseFloat(form.quantity),
      rate: parseFloat(form.rate),
      total,
      billable: form.billable,
      billed: false,
      billId: null,
      category: form.category,
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ACTIVITY', payload: activity })
    addToast('Expense added')
    onClose()
  }

  return (
    <Modal title="New Expense" onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Matter</label>
          <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
            <option value="">No matter</option>
            {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber} - {m.description}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="input-field" type="date" value={form.date} onChange={e => f('date')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="select-field" value={form.category} onChange={e => f('category')(e.target.value)}>
              {['Filing Fees','Copying','Expert Fees','Travel','Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="textarea-field" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="Describe expense..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="input-field" type="number" min="1" value={form.quantity} onChange={e => f('quantity')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Cost ($) *</label>
            <input className="input-field" type="number" step="0.01" value={form.rate} onChange={e => f('rate')(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.billable} onChange={e => f('billable')(e.target.checked)} className="checkbox" />
            <span>Billable</span>
          </label>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Total: ${total.toFixed(2)}</div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

export function TaskModal({ onClose, task = null, defaultMatterId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    matterId: task?.matterId || defaultMatterId || '',
    assigneeId: task?.assigneeId || state.currentUserId,
    priority: task?.priority || 'Normal',
    dueDate: task?.dueDate || '',
    taskListName: task?.taskListName || 'Litigation Prep',
    isPrivate: task?.isPrivate || false,
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null
  const assignee = state.users.find(u => u.id === form.assigneeId)

  const handleSave = () => {
    if (!form.name) { addToast('Task name is required', 'error'); return }
    if (task) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, ...form, matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '', assigneeName: assignee?.name, updatedAt: new Date().toISOString() } })
      addToast('Task updated')
    } else {
      dispatch({ type: 'ADD_TASK', payload: {
        id: `task-${Date.now()}`, ...form,
        matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
        assigneeName: assignee?.name, assignerId: state.currentUserId,
        status: 'Outstanding', completedDate: null,
        taskListId: `tasklist-${Date.now()}`,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }})
      addToast('Task created')
    }
    onClose()
  }

  return (
    <Modal title={task ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="input-field" value={form.name} onChange={e => f('name')(e.target.value)} placeholder="Task name" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="textarea-field" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="Optional description..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Matter</label>
            <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
              <option value="">No matter</option>
              {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select className="select-field" value={form.assigneeId} onChange={e => f('assigneeId')(e.target.value)}>
              {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {['High', 'Normal', 'Low'].map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" checked={form.priority === p} onChange={() => f('priority')(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="input-field" type="date" value={form.dueDate} onChange={e => f('dueDate')(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Task List</label>
            <select className="select-field" value={form.taskListName} onChange={e => f('taskListName')(e.target.value)}>
              {['Litigation Prep', 'Client Intake', 'Administrative'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isPrivate} onChange={e => f('isPrivate')(e.target.checked)} className="checkbox" />
              <span>Private</span>
            </label>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{task ? 'Save Changes' : 'Save'}</button>
      </div>
    </Modal>
  )
}

export function EventModal({ onClose, event = null, defaultDate = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const today = defaultDate || new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    matterId: event?.matterId || '',
    location: event?.location || '',
    startDate: event?.startDate?.split('T')[0] || today,
    startTime: event?.startDate?.includes('T') ? event.startDate.split('T')[1]?.substring(0,5) : '09:00',
    endDate: event?.endDate?.split('T')[0] || today,
    endTime: event?.endDate?.includes('T') ? event.endDate.split('T')[1]?.substring(0,5) : '10:00',
    allDay: event?.allDay || false,
    attendees: event?.attendees || [state.currentUserId],
    reminderMinutes: event?.reminderMinutes || 30,
    color: event?.color || '#1A73E8',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const colors = ['#1A73E8','#34A853','#EA4335','#FBBC04','#9E9E9E','#9C27B0','#FF5722']

  const handleSave = () => {
    if (!form.title) { addToast('Event title is required', 'error'); return }
    const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null
    const ev = {
      ...(event || { id: `event-${Date.now()}`, createdAt: new Date().toISOString() }),
      ...form,
      startDate: form.allDay ? form.startDate : `${form.startDate}T${form.startTime}:00`,
      endDate: form.allDay ? form.endDate : `${form.endDate}T${form.endTime}:00`,
      matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
    }
    if (event) { dispatch({ type: 'UPDATE_EVENT', payload: ev }); addToast('Event updated') }
    else { dispatch({ type: 'ADD_EVENT', payload: ev }); addToast('Event created') }
    onClose()
  }

  const toggleAttendee = (uid) => {
    setForm(prev => ({ ...prev, attendees: prev.attendees.includes(uid) ? prev.attendees.filter(a => a !== uid) : [...prev.attendees, uid] }))
  }

  return (
    <Modal title={event ? 'Edit Event' : 'New Calendar Event'} onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="input-field" value={form.title} onChange={e => f('title')(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Matter</label>
          <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
            <option value="">No matter</option>
            {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={form.allDay} onChange={e => f('allDay')(e.target.checked)} className="checkbox" />
          <span>All day</span>
        </label>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="input-field" type="date" value={form.startDate} onChange={e => f('startDate')(e.target.value)} />
          </div>
          {!form.allDay && (
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input className="input-field" type="time" value={form.startTime} onChange={e => f('startTime')(e.target.value)} />
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="input-field" type="date" value={form.endDate} onChange={e => f('endDate')(e.target.value)} />
          </div>
          {!form.allDay && (
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input className="input-field" type="time" value={form.endTime} onChange={e => f('endTime')(e.target.value)} />
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="input-field" value={form.location} onChange={e => f('location')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Reminder</label>
            <select className="select-field" value={form.reminderMinutes} onChange={e => f('reminderMinutes')(Number(e.target.value))}>
              <option value={0}>None</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={1440}>1 day</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Attendees</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {state.users.map(u => (
              <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.attendees.includes(u.id)} onChange={() => toggleAttendee(u.id)} className="checkbox" />
                {u.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {colors.map(c => (
              <div key={c} onClick={() => f('color')(c)} style={{
                width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                border: form.color === c ? '3px solid #1A1A2E' : '2px solid transparent'
              }} />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="textarea-field" value={form.description} onChange={e => f('description')(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        {event && <button className="btn btn-danger" onClick={() => { dispatch({ type: 'DELETE_EVENT', payload: event.id }); addToast('Event deleted'); onClose() }} style={{ marginRight: 'auto' }}>Delete</button>}
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{event ? 'Save Changes' : 'Save'}</button>
      </div>
    </Modal>
  )
}

export function CommunicationModal({ onClose, matterId = null, contactId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const user = state.users.find(u => u.id === state.currentUserId)
  const [form, setForm] = useState({
    type: 'Email',
    direction: 'Outgoing',
    matterId: matterId || '',
    contactId: contactId || '',
    subject: '',
    body: '',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const contact = form.contactId ? state.contacts.find(c => c.id === form.contactId) : null
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null

  const handleSave = () => {
    if (!form.subject || !form.body) { addToast('Subject and body are required', 'error'); return }
    dispatch({ type: 'ADD_COMMUNICATION', payload: {
      id: `comm-${Date.now()}`,
      ...form,
      contactName: contact?.displayName || '',
      from: form.direction === 'Outgoing' ? user?.email : (contact?.email || ''),
      to: form.direction === 'Outgoing' ? (contact?.email || '') : user?.email,
      date: new Date().toISOString(),
      read: true,
      attachments: [],
      createdAt: new Date().toISOString()
    }})
    addToast('Communication added')
    onClose()
  }

  return (
    <Modal title="New Communication" onClose={onClose}>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="select-field" value={form.type} onChange={e => f('type')(e.target.value)}>
              {['Email','Phone','Text','Portal'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Direction</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {['Outgoing','Incoming'].map(d => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input type="radio" checked={form.direction === d} onChange={() => f('direction')(d)} /> {d}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Matter</label>
            <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
              <option value="">No matter</option>
              {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contact</label>
            <select className="select-field" value={form.contactId} onChange={e => f('contactId')(e.target.value)}>
              <option value="">Select contact</option>
              {state.contacts.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <input className="input-field" value={form.subject} onChange={e => f('subject')(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Body *</label>
          <textarea className="textarea-field" style={{ minHeight: 120 }} value={form.body} onChange={e => f('body')(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
    </Modal>
  )
}

export function NoteModal({ onClose, note = null, matterId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const user = state.users.find(u => u.id === state.currentUserId)
  const [form, setForm] = useState({
    matterId: note?.matterId || matterId || '',
    subject: note?.subject || '',
    body: note?.body || '',
    isPrivate: note?.isPrivate || false,
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null

  const handleSave = () => {
    if (!form.subject || !form.body) { addToast('Subject and body are required', 'error'); return }
    if (note) {
      dispatch({ type: 'UPDATE_NOTE', payload: { ...note, ...form, matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '', updatedAt: new Date().toISOString() } })
      addToast('Note updated')
    } else {
      dispatch({ type: 'ADD_NOTE', payload: {
        id: `note-${Date.now()}`, ...form,
        matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
        authorId: state.currentUserId, authorName: user?.name,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }})
      addToast('Note created')
    }
    onClose()
  }

  return (
    <Modal title={note ? 'Edit Note' : 'New Note'} onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Matter</label>
          <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
            <option value="">No matter</option>
            {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber} - {m.description}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <input className="input-field" value={form.subject} onChange={e => f('subject')(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Body *</label>
          <textarea className="textarea-field" style={{ minHeight: 160 }} value={form.body} onChange={e => f('body')(e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isPrivate} onChange={e => f('isPrivate')(e.target.checked)} className="checkbox" />
          <span>Private note</span>
        </label>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>{note ? 'Save Changes' : 'Save'}</button>
      </div>
    </Modal>
  )
}

export function DocumentModal({ onClose, matterId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const user = state.users.find(u => u.id === state.currentUserId)
  const [form, setForm] = useState({
    name: '',
    matterId: matterId || '',
    folderId: 'folder-1',
    category: 'Court Filing',
    description: '',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))
  const matter = form.matterId ? state.matters.find(m => m.id === form.matterId) : null
  const folder = state.folders.find(f => f.id === form.folderId)

  const handleSave = () => {
    if (!form.name) { addToast('Document name is required', 'error'); return }
    dispatch({ type: 'ADD_DOCUMENT', payload: {
      id: `doc-${Date.now()}`,
      ...form,
      folderName: folder?.name || '',
      matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
      type: 'application/pdf',
      size: Math.floor(Math.random() * 500000) + 50000,
      uploadedBy: state.currentUserId,
      uploadedByName: user?.name,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }})
    addToast('Document added')
    onClose()
  }

  return (
    <Modal title="Upload Document" onClose={onClose}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Document Name *</label>
          <input className="input-field" value={form.name} onChange={e => f('name')(e.target.value)} placeholder="e.g. Discovery_Request.pdf" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Matter</label>
            <select className="select-field" value={form.matterId} onChange={e => f('matterId')(e.target.value)}>
              <option value="">No matter</option>
              {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Folder</label>
            <select className="select-field" value={form.folderId} onChange={e => f('folderId')(e.target.value)}>
              {state.folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="select-field" value={form.category} onChange={e => f('category')(e.target.value)}>
            {['Court Filing','Correspondence','Contract','Evidence','Memo','Template','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="textarea-field" value={form.description} onChange={e => f('description')(e.target.value)} placeholder="Optional description..." />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Add Document</button>
      </div>
    </Modal>
  )
}

export function GenerateBillModal({ onClose, defaultMatterId = null }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [step, setStep] = useState(1)
  const [matterId, setMatterId] = useState(defaultMatterId || '')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState(today)
  const [selectedActivities, setSelectedActivities] = useState([])
  const [memo, setMemo] = useState('')
  const [issuedDate, setIssuedDate] = useState(today)

  const matter = matterId ? state.matters.find(m => m.id === matterId) : null
  const unbilled = state.activities.filter(a =>
    a.matterId === matterId && !a.billed && a.billable &&
    (!dateFrom || a.date >= dateFrom) && (!dateTo || a.date <= dateTo)
  )

  const goToStep2 = () => {
    if (!matterId) { addToast('Please select a matter', 'error'); return }
    setSelectedActivities(unbilled.map(a => a.id))
    setStep(2)
  }

  const total = state.activities
    .filter(a => selectedActivities.includes(a.id))
    .reduce((sum, a) => sum + a.total, 0)

  const handleCreate = () => {
    if (selectedActivities.length === 0) { addToast('No activities selected', 'error'); return }
    const client = matter ? state.contacts.find(c => c.id === matter.clientId) : null
    const dueDate = new Date(issuedDate)
    dueDate.setDate(dueDate.getDate() + state.firmSettings.defaultPaymentTerms)
    const existingBills = state.bills.filter(b => b.billNumber.startsWith('INV-'))
    const nextNum = String(existingBills.length + 1).padStart(3, '0')
    const year = new Date().getFullYear()
    const lineItems = state.activities.filter(a => selectedActivities.includes(a.id)).map(a => ({
      activityId: a.id,
      description: a.description,
      ...(a.type === 'TimeEntry' ? { hours: a.duration, rate: a.rate } : { quantity: a.quantity, rate: a.rate }),
      amount: a.total
    }))
    const bill = {
      id: `bill-${Date.now()}`,
      billNumber: `INV-${year}-${nextNum}`,
      matterId,
      matterDescription: matter ? `${matter.clientName} - ${matter.description}` : '',
      clientId: matter?.clientId,
      clientName: client?.displayName || '',
      status: 'Draft',
      issuedDate,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: null,
      subtotal: total,
      taxRate: 0, taxAmount: 0,
      totalDue: total, amountPaid: 0, balance: total,
      lineItems,
      memo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_BILL', payload: bill })
    selectedActivities.forEach(id => dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, billed: true, billId: bill.id } }))
    addToast(`Bill ${bill.billNumber} created`)
    onClose()
  }

  return (
    <Modal title="Generate Bill" onClose={onClose} wide>
      <div className="modal-body">
        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Matter *</label>
              <select className="select-field" value={matterId} onChange={e => setMatterId(e.target.value)}>
                <option value="">Select matter...</option>
                {state.matters.filter(m => m.status !== 'Closed').map(m => <option key={m.id} value={m.id}>{m.matterNumber} - {m.description}</option>)}
              </select>
            </div>
            {matter && (
              <div style={{ background: '#F5F6FA', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Client:</strong> {matter.clientName}</div>
                <div><strong>Practice Area:</strong> {matter.practiceArea}</div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Activities From</label>
                <input className="input-field" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Activities To</label>
                <input className="input-field" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
            {matterId && (
              <div style={{ fontSize: 13, color: '#5F6368' }}>
                {unbilled.length} unbilled activit{unbilled.length === 1 ? 'y' : 'ies'} found
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <p style={{ marginBottom: 12, color: '#5F6368', fontSize: 13 }}>Select activities to include:</p>
            <div style={{ border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr className="table-header">
                    <th style={{ width: 40, padding: '10px 12px', textAlign: 'left' }}>
                      <input type="checkbox" className="checkbox"
                        checked={selectedActivities.length === unbilled.length}
                        onChange={e => setSelectedActivities(e.target.checked ? unbilled.map(a => a.id) : [])} />
                    </th>
                    <th>Date</th><th>Description</th><th>User</th><th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {unbilled.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #EEEEEE' }}>
                      <td>
                        <input type="checkbox" className="checkbox"
                          checked={selectedActivities.includes(a.id)}
                          onChange={e => setSelectedActivities(prev => e.target.checked ? [...prev, a.id] : prev.filter(i => i !== a.id))} />
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{a.date}</td>
                      <td style={{ padding: '8px 12px', fontSize: 13, maxWidth: 300 }}>{a.description}</td>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{a.userName}</td>
                      <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right', fontWeight: 500 }}>${a.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#F5F6FA', fontWeight: 600 }}>
                    <td colSpan={4} style={{ padding: '10px 12px', textAlign: 'right' }}>Total</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input className="input-field" type="date" value={issuedDate} onChange={e => setIssuedDate(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Memo</label>
              <input className="input-field" value={memo} onChange={e => setMemo(e.target.value)} placeholder="Optional memo..." />
            </div>
          </>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        {step === 1 && <button className="btn btn-primary" onClick={goToStep2}>Next →</button>}
        {step === 2 && (
          <>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create Bill</button>
          </>
        )}
      </div>
    </Modal>
  )
}

export function RecordPaymentModal({ onClose, bill }) {
  const { dispatch } = useApp()
  const { addToast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    amount: bill.balance,
    paymentDate: today,
    paymentMethod: 'Check',
  })

  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) { addToast('Invalid amount', 'error'); return }
    const newAmountPaid = bill.amountPaid + amount
    const newBalance = Math.max(0, bill.totalDue - newAmountPaid)
    dispatch({ type: 'UPDATE_BILL', payload: {
      ...bill,
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newBalance <= 0 ? 'Paid' : 'Sent',
      paidDate: newBalance <= 0 ? form.paymentDate : null,
      updatedAt: new Date().toISOString()
    }})
    addToast('Payment recorded')
    onClose()
  }

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <div className="modal-body">
        <div style={{ marginBottom: 16, background: '#F5F6FA', padding: 12, borderRadius: 4, fontSize: 13 }}>
          <div><strong>Bill:</strong> {bill.billNumber}</div>
          <div><strong>Balance Due:</strong> <span style={{ color: '#EA4335', fontWeight: 600 }}>${bill.balance.toFixed(2)}</span></div>
        </div>
        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input className="input-field" type="number" step="0.01" value={form.amount} onChange={e => f('amount')(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input className="input-field" type="date" value={form.paymentDate} onChange={e => f('paymentDate')(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="select-field" value={form.paymentMethod} onChange={e => f('paymentMethod')(e.target.value)}>
              {['Check','Credit Card','Bank Transfer','Cash'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Record Payment</button>
      </div>
    </Modal>
  )
}
