import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, TrendingUp, LayoutDashboard, BookOpen, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './AllContent.css'

const TYPE_ICONS = { segmentation: TrendingUp, funnel: TrendingUp, retention: TrendingUp, dataTable: TrendingUp, dashboard: LayoutDashboard, notebook: BookOpen, cohort: Users }
const TYPE_LABELS = { segmentation: 'Chart', funnel: 'Chart', retention: 'Chart', dataTable: 'Chart', dashboard: 'Dashboard', notebook: 'Notebook', cohort: 'Cohort' }
const TYPE_COLORS = { segmentation: '#7C3AED', funnel: '#8B5CF6', retention: '#059669', dataTable: '#D97706', dashboard: '#EC4899', notebook: '#0891B2', cohort: '#6366F1' }

function typeOf(item) {
  if (item._kind === 'dashboard') return 'dashboard'
  if (item._kind === 'notebook') return 'notebook'
  if (item._kind === 'cohort') return 'cohort'
  return item.type || 'segmentation'
}

function pathOf(item) {
  const t = item._kind
  if (t === 'dashboard') return `/dashboard/${item.id}`
  if (t === 'notebook') return `/notebooks/${item.id}`
  if (t === 'cohort') return `/cohorts`
  return `/chart/${item.id}`
}

function relTime(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AllContent() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')

  const owners = Array.from(new Set([
    ...state.charts.map(c => c.owner),
    ...state.dashboards.map(d => d.owner),
    ...state.notebooks.map(n => n.owner),
    ...state.cohorts.map(c => c.owner)
  ].filter(Boolean))).sort()

  const all = [
    ...state.charts.map(c => ({ ...c, _kind: 'chart' })),
    ...state.dashboards.map(d => ({ ...d, _kind: 'dashboard' })),
    ...state.notebooks.map(n => ({ ...n, _kind: 'notebook' })),
    ...state.cohorts.map(c => ({ ...c, _kind: 'cohort', updatedAt: c.updatedAt, owner: c.owner }))
  ].filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || typeOf(item) === typeFilter || (typeFilter === 'chart' && item._kind === 'chart')
    const matchesOwner = ownerFilter === 'all' || item.owner === ownerFilter
    return matchesSearch && matchesType && matchesOwner
  }).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))

  return (
    <div className="content-page">
      <div className="content-topbar">
        <div className="project-btn">default <ChevronDown size={14} /></div>
      </div>
      <div className="content-inner">
        <h1 className="page-title">All Content</h1>
        <div className="content-toolbar">
          <div className="search-input-wrap" style={{ width: 280 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline" onClick={() => { setSearch(''); setTypeFilter('all'); setOwnerFilter('all') }}>Clear filters</button>
          <select className="btn-outline" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ height: 34 }}>
            <option value="all">All types</option>
            <option value="chart">Charts</option>
            <option value="dashboard">Dashboards</option>
            <option value="notebook">Notebooks</option>
            <option value="cohort">Cohorts</option>
          </select>
          <select className="btn-outline" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ height: 34 }}>
            <option value="all">All owners</option>
            {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </div>
        <table className="content-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>Name</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Last Modified</th>
              <th>Space</th>
            </tr>
          </thead>
          <tbody>
            {all.map(item => {
              const t = typeOf(item)
              const Icon = TYPE_ICONS[t] || TrendingUp
              const color = TYPE_COLORS[t] || '#7C3AED'
              return (
                <tr key={`${item._kind}-${item.id}`} className="content-row" onClick={() => navigate(pathOf(item))}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="content-name-cell">
                      <div className="content-type-icon" style={{ background: color + '20', color }}>
                        <Icon size={14} />
                      </div>
                      <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary)' }}>{item.name}</a>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gray" style={{ fontSize: 12 }}>{TYPE_LABELS[t] || t}</span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.owner}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.updatedAt ? relTime(item.updatedAt) : '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.space || "Sam Lee's Space"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {all.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>No content found</div>
        )}
      </div>
    </div>
  )
}
