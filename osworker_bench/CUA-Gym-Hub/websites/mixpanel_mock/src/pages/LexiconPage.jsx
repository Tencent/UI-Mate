import React, { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { Search, Upload, Download, Edit2, ExternalLink, ChevronDown } from 'lucide-react'

const SECTIONS = {
  'Tracked Data': ['events', 'eventProperties', 'profileProperties'],
  'Saved Definitions': ['cohorts', 'customEvents', 'lookupTables'],
}

const SECTION_LABELS = {
  events: 'Events',
  eventProperties: 'Event Properties',
  profileProperties: 'Profile Properties',
  cohorts: 'Cohorts',
  customEvents: 'Custom Events',
  lookupTables: 'Lookup Tables',
}

export default function LexiconPage() {
  const { section } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const { state, setState } = useApp()

  const activeSection = section || 'events'
  const lexicon = state?.lexicon || []
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [importNotice, setImportNotice] = useState('')

  const filtered = lexicon.filter(entry => {
    if (entry.category !== activeSection) return false
    if (search) {
      const q = search.toLowerCase()
      if (!entry.eventName.toLowerCase().includes(q) && !entry.displayName?.toLowerCase().includes(q)) return false
    }
    if (statusFilter !== 'All' && entry.status !== statusFilter) return false
    return true
  })

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  function exportLexicon() {
    const headers = ['Category', 'Name', 'Display Name', 'Description', 'Status', 'Tags', '30-Day Queries']
    const rows = filtered.map(entry => [
      entry.category,
      entry.eventName,
      entry.displayName || '',
      entry.description || '',
      entry.status || '',
      (entry.tags || []).join('|'),
      entry.thirtyDayQueries || 0
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xixpanel-lexicon-${activeSection}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importLexicon(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      const entries = lines.slice(1).map((line, index) => {
        const cells = line.split(',').map(cell => cell.replace(/^"|"$/g, '').replaceAll('""', '"'))
        return {
          id: `lex_import_${Date.now()}_${index}`,
          category: activeSection,
          eventName: cells[1] || cells[0] || `Imported ${index + 1}`,
          displayName: cells[2] || cells[1] || cells[0] || `Imported ${index + 1}`,
          description: cells[3] || 'Imported from CSV',
          thirtyDayQueries: Number(cells[6]) || 0,
          status: cells[4] || 'Visible',
          tags: cells[5] ? cells[5].split('|').filter(Boolean) : ['imported'],
          type: 'custom'
        }
      })
      if (entries.length) {
        setState(prev => ({ ...prev, lexicon: [...prev.lexicon, ...entries] }))
        setImportNotice(`Imported ${entries.length} ${SECTION_LABELS[activeSection]?.toLowerCase()}.`)
      } else {
        setImportNotice('No importable rows found.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <div style={{
        width: 200, borderRight: '1px solid #E4E4E8', background: '#fff',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
      }}>
        <div style={{ padding: '14px 12px 8px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E', marginBottom: 10 }}>Data Management</h2>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#8E8EA0" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search" style={{
              width: '100%', border: '1px solid #E4E4E8', borderRadius: 6, padding: '6px 8px 6px 26px',
              fontSize: 13, outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = '#4F44E0'}
            onBlur={e => e.target.style.borderColor = '#E4E4E8'} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {Object.entries(SECTIONS).map(([groupName, keys]) => (
            <div key={groupName}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#8E8EA0', letterSpacing: '0.06em',
                textTransform: 'uppercase', padding: '12px 12px 4px'
              }}>{groupName}</div>
              {keys.map(key => (
                <button key={key} onClick={() => navTo(`/lexicon/${key}`)} style={{
                  width: '100%', padding: '6px 12px', border: 'none', borderRadius: 0,
                  background: activeSection === key ? '#F0EFFC' : 'none',
                  color: activeSection === key ? '#4F44E0' : '#1B1B2E',
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  fontWeight: activeSection === key ? 600 : 400,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { if (activeSection !== key) e.currentTarget.style.background = '#F7F7F8' }}
                onMouseLeave={e => { if (activeSection !== key) e.currentTarget.style.background = 'none' }}>
                  {SECTION_LABELS[key]}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E4E4E8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1B1B2E', marginBottom: 4 }}>
                {SECTION_LABELS[activeSection]}
              </h1>
              <div style={{ fontSize: 13, color: '#8E8EA0' }}>
                {activeSection === 'events' ? 'Events tracked in your project.' : `Your ${SECTION_LABELS[activeSection]?.toLowerCase()}.`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{
                padding: '7px 14px', border: '1px solid #E4E4E8', borderRadius: 6,
                background: '#fff', cursor: 'pointer', fontSize: 13, color: '#1B1B2E',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Upload size={13} /> Import
                <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => importLexicon(e.target.files?.[0])} />
              </label>
              <button style={{
                padding: '7px 14px', border: '1px solid #E4E4E8', borderRadius: 6,
                background: '#fff', cursor: 'pointer', fontSize: 13, color: '#1B1B2E',
                display: 'flex', alignItems: 'center', gap: 6
              }} onClick={exportLexicon}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#8E8EA0' }}>{filtered.length} results</span>
            {importNotice && <span style={{ fontSize: 12, color: '#27AE60' }}>{importNotice}</span>}
            <FilterPill label="Status" value={statusFilter} options={['All', 'Visible', 'Hidden']} onChange={setStatusFilter} />
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#8E8EA0" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
                style={{ border: '1px solid #E4E4E8', borderRadius: 6, padding: '5px 8px 5px 26px', fontSize: 13, outline: 'none', width: 200 }}
                onFocus={e => e.target.style.borderColor = '#4F44E0'}
                onBlur={e => e.target.style.borderColor = '#E4E4E8'} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F7F8', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={thStyle}><input type="checkbox" /></th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Display Name</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>30-Day Queries</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #E4E4E8' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9F9FB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={tdStyle}><input type="checkbox" /></td>
                  <td style={tdStyle}>
                    <span style={{ color: '#4F44E0', fontWeight: 500, cursor: 'pointer' }}>{entry.eventName}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#585870' }}>{entry.displayName}</td>
                  <td style={{ ...tdStyle, color: '#8E8EA0', maxWidth: 280 }}>
                    <span className="truncate" style={{ display: 'block' }}>{entry.description}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{entry.thirtyDayQueries}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                      background: entry.status === 'Visible' ? '#E8F5E9' : '#F7F7F8',
                      color: entry.status === 'Visible' ? '#27AE60' : '#8E8EA0'
                    }}>{entry.status}</span>
                  </td>
                  <td style={tdStyle}>
                    {(entry.tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: 11, background: '#F0EFFC', color: '#4F44E0', padding: '2px 6px', borderRadius: 4, marginRight: 4 }}>{tag}</span>
                    ))}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', fontSize: 14, color: '#8E8EA0' }}>
                    No {SECTION_LABELS[activeSection]?.toLowerCase()} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        padding: '5px 10px', border: '1px solid #E4E4E8', borderRadius: 6,
        background: value && value !== 'All' ? '#F0EFFC' : '#fff',
        color: value && value !== 'All' ? '#4F44E0' : '#1B1B2E',
        cursor: 'pointer', fontSize: 12,
        display: 'flex', alignItems: 'center', gap: 4
      }}>
        {label}{value && value !== 'All' ? `: ${value}` : ''} <ChevronDown size={12} />
      </button>
      {open && options && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200, marginTop: 4,
          background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 4, minWidth: 120
        }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange && onChange(opt); setOpen(false) }} style={{
              width: '100%', padding: '6px 10px', border: 'none', borderRadius: 4,
              background: value === opt ? '#F0EFFC' : 'none',
              color: value === opt ? '#4F44E0' : '#1B1B2E',
              fontSize: 13, cursor: 'pointer', textAlign: 'left'
            }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', whiteSpace: 'nowrap'
}
const tdStyle = { padding: '10px 16px', fontSize: 13, color: '#1B1B2E', verticalAlign: 'middle' }
