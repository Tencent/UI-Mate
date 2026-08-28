import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, BarChart2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CATEGORY_COLORS = {
  Marketing: '#4285F4',
  Sales: '#34A853',
  Finance: '#FBBC04',
  Operations: '#FF6D01',
  HR: '#EA4335'
}

function TemplateCard({ template, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        width: '160px',
        minWidth: '160px',
        height: '120px',
        background: 'white',
        border: '1px solid #DADCE0',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'box-shadow 0.2s',
        boxShadow: hovered ? '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' : 'none',
        padding: '12px 8px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(template)}
    >
      <div style={{
        width: 40, height: 40,
        background: CATEGORY_COLORS[template.category] || '#4285F4',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <BarChart2 size={20} color="white" />
      </div>
      <div style={{ fontSize: '11px', color: '#5F6368', textAlign: 'center', lineHeight: '1.3' }}>
        {template.name}
      </div>
      <div style={{
        fontSize: '10px',
        background: CATEGORY_COLORS[template.category] || '#4285F4',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px'
      }}>
        {template.category}
      </div>
    </div>
  )
}

function BlankCard({ onCreate }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        width: '160px',
        minWidth: '160px',
        height: '120px',
        background: 'white',
        border: hovered ? '1px solid #1A73E8' : '1px solid #DADCE0',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' : 'none',
        padding: '12px 8px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onCreate}
    >
      <div style={{
        width: 40, height: 40,
        background: '#E8F0FE',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Plus size={24} color="#1A73E8" />
      </div>
      <div style={{ fontSize: '12px', color: '#202124', fontWeight: 500 }}>Blank Report</div>
    </div>
  )
}

export default function TemplateGallery() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 360, behavior: 'smooth' })
    }
  }

  const createBlank = () => {
    const id = `rpt_${Date.now()}`
    const now = new Date().toISOString()
    dispatch({
      type: 'CREATE_REPORT', payload: {
        id, name: 'Untitled Report',
        ownerId: state.user.id, ownerName: state.user.name, ownerEmail: state.user.email,
        createdAt: now, modifiedAt: now, lastOpenedAt: now,
        thumbnailColor: '#4285F4', starred: false, shared: false, trashed: false, sharedWith: [],
        dataSources: [], pages: [], currentPageId: null
      }
    })
    navigate(`/report/${id}`)
  }

  const createFromTemplate = (template) => {
    const id = `rpt_${Date.now()}`
    const now = new Date().toISOString()
    dispatch({
      type: 'CREATE_REPORT', payload: {
        id, name: template.name,
        ownerId: state.user.id, ownerName: state.user.name, ownerEmail: state.user.email,
        createdAt: now, modifiedAt: now, lastOpenedAt: now,
        thumbnailColor: template.thumbnailColor, starred: false, shared: false, trashed: false, sharedWith: [],
        dataSources: [], pages: [], currentPageId: null
      }
    })
    navigate(`/report/${id}`)
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 500, color: '#202124' }}>Start with a Template</div>
        <a href="/templates" style={{ fontSize: '14px', color: '#1A73E8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Template Gallery
          <ChevronRight size={16} />
        </a>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          className="icon-btn"
          style={{ position: 'absolute', left: -20, zIndex: 10, background: 'white', border: '1px solid #DADCE0', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          onClick={() => scroll(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '4px 8px'
          }}
        >
          <BlankCard onCreate={createBlank} />
          {state.templates.map(t => (
            <TemplateCard key={t.id} template={t} onSelect={createFromTemplate} />
          ))}
        </div>
        <button
          className="icon-btn"
          style={{ position: 'absolute', right: -20, zIndex: 10, background: 'white', border: '1px solid #DADCE0', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
          onClick={() => scroll(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
