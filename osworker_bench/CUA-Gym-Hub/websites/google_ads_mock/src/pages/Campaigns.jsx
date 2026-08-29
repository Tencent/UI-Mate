import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import { useNavigate } from 'react-router-dom'
import CreateModal from '../components/CreateModal.jsx'
import { Filter, X, Columns } from 'lucide-react'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

const TYPE_COLORS = {
  SEARCH: '#1A73E8', DISPLAY: '#188038', VIDEO: '#D93025',
  SHOPPING: '#F9AB00', PERFORMANCE_MAX: '#8430CE'
}

export default function Campaigns() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [nameFilter, setNameFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [editingBudget, setEditingBudget] = useState(null)
  const [budgetValue, setBudgetValue] = useState('')
  const [showFilterChips, setShowFilterChips] = useState(false)

  const campaigns = useMemo(() => {
    return (state?.campaigns || [])
      .filter(c => c.status !== 'REMOVED')
      .filter(c => statusFilter === 'ALL' || c.status === statusFilter)
      .filter(c => typeFilter === 'ALL' || c.type === typeFilter)
      .filter(c => !nameFilter || c.name.toLowerCase().includes(nameFilter.toLowerCase()))
  }, [state, statusFilter, typeFilter, nameFilter])

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === campaigns.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(campaigns.map(c => c.id)))
    }
  }

  const handleBulkAction = (action) => {
    selected.forEach(id => {
      if (action === 'ENABLED' || action === 'PAUSED') {
        dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id, status: action } })
      }
    })
    setSelected(new Set())
  }

  const handleBudgetEdit = (campId, currentBudget) => {
    setEditingBudget(campId)
    setBudgetValue(String(currentBudget))
  }

  const saveBudget = (campId) => {
    const val = parseFloat(budgetValue)
    if (!isNaN(val) && val > 0) {
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id: campId, budget: val } })
    }
    setEditingBudget(null)
  }

  const hasActiveFilters = statusFilter !== 'ALL' || typeFilter !== 'ALL' || nameFilter

  const columns = [
    {
      key: '_check', label: '', sortable: false, nowrap: true,
      headerRender: () => (
        <input
          type="checkbox"
          checked={selected.size === campaigns.length && campaigns.length > 0}
          onChange={toggleSelectAll}
          style={{ accentColor: '#1A73E8' }}
        />
      ),
      render: (v, row) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={e => { e.stopPropagation(); toggleSelect(row.id) }}
          onClick={e => e.stopPropagation()}
          style={{ accentColor: '#1A73E8' }}
        />
      )
    },
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => (
        <StatusToggle entityType="campaign" status={v} onChange={newStatus => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id: row.id, status: newStatus } })} />
      )
    },
    {
      key: 'name', label: 'Campaign', nowrap: true,
      render: (v, row) => (
        <span style={{ color: '#1A73E8', fontWeight: 500, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/campaigns/${row.id}`) }}>{v}</span>
      )
    },
    {
      key: 'type', label: 'Type', nowrap: true,
      render: v => (
        <span style={{ background: (TYPE_COLORS[v] || '#5F6368') + '22', color: TYPE_COLORS[v] || '#5F6368', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>{v}</span>
      )
    },
    {
      key: 'budget', label: 'Budget', align: 'right', nowrap: true,
      render: (v, row) => {
        if (editingBudget === row.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: 12 }}>$</span>
              <input
                autoFocus
                value={budgetValue}
                onChange={e => setBudgetValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveBudget(row.id); if (e.key === 'Escape') setEditingBudget(null) }}
                style={{ width: 70, border: '1px solid #1A73E8', borderRadius: 2, padding: '2px 4px', fontSize: 12, outline: 'none' }}
              />
              <span style={{ fontSize: 11, color: '#5F6368' }}>/day</span>
              <button onClick={() => saveBudget(row.id)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 2, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>Save</button>
              <button onClick={() => setEditingBudget(null)} style={{ background: '#fff', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 2, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
                <X size={10} />
              </button>
            </div>
          )
        }
        return (
          <span
            style={{ cursor: 'pointer', borderBottom: '1px dashed #DADCE0' }}
            onClick={e => { e.stopPropagation(); handleBudgetEdit(row.id, v) }}
            title="Click to edit budget"
          >
            ${(v || 0).toFixed(2)}/day
          </span>
        )
      }
    },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impr.', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: (v, row) => fmt.num(row.metrics?.conversions) },
    { key: 'convRate', label: 'Conv. rate', align: 'right', render: (v, row) => fmt.pct(row.metrics?.conversionRate) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Campaigns</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <DateRangePicker />
          <button onClick={() => setShowCreate(true)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Campaign
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div style={{
          background: '#E8F0FE', border: '1px solid #1A73E8', borderRadius: 4,
          padding: '8px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A73E8' }}>{selected.size} selected</span>
          <button onClick={() => handleBulkAction('ENABLED')} style={{ background: '#188038', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Enable</button>
          <button onClick={() => handleBulkAction('PAUSED')} style={{ background: '#F9AB00', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Pause</button>
          <button onClick={() => setSelected(new Set())} style={{ background: 'transparent', color: '#5F6368', border: 'none', padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>Clear</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #DADCE0', borderRadius: 4, padding: '0 8px', height: 32, background: '#fff' }}>
          <Filter size={14} color="#5F6368" />
          <input
            placeholder="Filter by name..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 13, width: 160, color: '#202124', background: 'transparent' }}
          />
          {nameFilter && <X size={12} color="#5F6368" style={{ cursor: 'pointer' }} onClick={() => setNameFilter('')} />}
        </div>

        {/* Filter chips */}
        {['ALL', 'ENABLED', 'PAUSED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${statusFilter === s ? '#1A73E8' : '#DADCE0'}`,
            background: statusFilter === s ? '#E8F0FE' : '#fff',
            color: statusFilter === s ? '#1A73E8' : '#5F6368',
            fontWeight: statusFilter === s ? 500 : 400,
          }}>
            {s === 'ALL' ? 'All statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ border: '1px solid #DADCE0', borderRadius: 16, padding: '4px 12px', fontSize: 12, outline: 'none', background: typeFilter !== 'ALL' ? '#E8F0FE' : '#fff', color: typeFilter !== 'ALL' ? '#1A73E8' : '#5F6368', fontWeight: typeFilter !== 'ALL' ? 500 : 400 }}>
          <option value="ALL">All types</option>
          {['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING', 'PERFORMANCE_MAX'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span style={{ fontSize: 12, color: '#5F6368', marginLeft: 4 }}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span>

        {hasActiveFilters && (
          <button onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); setNameFilter('') }}
            style={{ border: 'none', background: 'none', color: '#1A73E8', fontSize: 12, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
        <SortableTable
          columns={columns}
          rows={campaigns}
          onRowClick={row => navigate(`/campaigns/${row.id}`)}
          emptyMessage="No campaigns found"
        />
      </div>

      {showCreate && <CreateModal mode="campaign" onClose={() => setShowCreate(false)} />}
    </div>
  )
}
