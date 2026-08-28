import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

function isWeekend(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  return day === 0 || day === 6
}

function calcBusinessDays(start, end, holidays) {
  if (!start || !end) return 0
  let count = 0
  const s = new Date(start)
  const e = new Date(end)
  if (s > e) return 0
  const holidayDates = (holidays || []).map(h => h.date)
  const cur = new Date(s)
  while (cur <= e) {
    const ds = cur.toISOString().slice(0, 10)
    if (!isWeekend(ds) && !holidayDates.includes(ds)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export default function TimeOffRequest() {
  const { state, addTimeOffRequest, updateTimeOffBalance } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    hoursPerDay: 8,
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const holidays = state.holidays || []
  const businessDays = calcBusinessDays(form.startDate, form.endDate, holidays)
  const totalHours = businessDays * (Number(form.hoursPerDay) || 0)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.startDate) errs.startDate = 'Start date is required'
    if (!form.endDate) errs.endDate = 'End date is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date'
    if (form.startDate && form.startDate < today) errs.startDate = 'Start date cannot be in the past'
    const holidayDates = holidays.map(h => h.date)
    if (form.startDate && holidayDates.includes(form.startDate)) errs.startDate = 'Selected date is a company holiday'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const newRequest = {
      id: `tor-${Date.now()}`,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      totalHours,
      status: 'Pending',
      notes: form.notes,
      submittedDate: today,
      reviewedBy: '',
      reviewedDate: '',
    }

    addTimeOffRequest(newRequest)

    // Update pending days in balance
    const pendingDays = businessDays
    updateTimeOffBalance(form.type, prev => ({
      ...prev,
      pendingDays: (prev.pendingDays || 0) + pendingDays,
    }))

    showToast('Time off request submitted successfully!', 'success')
    navigate('/myself/timeoff')
  }

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate('/myself/timeoff')}>← Back to Time Off</button>
      <div className="page-header">
        <h1>Request Time Off</h1>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Time Off Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="form-input">
              <option>Vacation</option>
              <option>Sick</option>
              <option>Personal</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="form-input" min={today} />
              {errors.startDate && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.startDate}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="form-input" min={form.startDate || today} />
              {errors.endDate && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.endDate}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hours per Day</label>
            <input type="number" name="hoursPerDay" value={form.hoursPerDay} onChange={handleChange} className="form-input" min={1} max={24} style={{ maxWidth: 100 }} />
          </div>

          {form.startDate && form.endDate && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>
              <strong>Calculated Total:</strong> {businessDays} business day{businessDays !== 1 ? 's' : ''} · {totalHours} hours
              {businessDays === 0 && form.startDate && form.endDate && (
                <div style={{ color: 'var(--color-warning)', marginTop: 4 }}>Note: No business days in selected range (weekends/holidays excluded)</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="form-input" rows={3} placeholder="Add any relevant details..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary">Submit Request</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/myself/timeoff')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
