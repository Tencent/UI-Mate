import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Lightbulb, X, Trash2, Edit2, Check, PlayCircle, Target } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

export default function Highlights() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { collectionId } = useParams()
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const collections = state.highlightCollections || []
  const highlights = state.highlights || []

  const activeCollection = collectionId
    ? collections.find(c => c.id === collectionId)
    : null

  const visibleHighlights = activeCollection
    ? highlights.filter(h => activeCollection.highlightIds.includes(h.id))
    : highlights

  function formatDate(isoStr) {
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function handleCreateCollection() {
    if (!newCollectionName.trim()) return
    const newId = `coll-${Date.now()}`
    dispatch({
      type: 'CREATE_HIGHLIGHT_COLLECTION',
      payload: { id: newId, name: newCollectionName.trim(), highlightIds: [] }
    })
    setNewCollectionName('')
    setShowNewCollection(false)
    navigate(withCurrentSearch(`/highlights/${newId}`, location.search))
  }

  function handleRemoveHighlight(highlightId) {
    dispatch({ type: 'REMOVE_HIGHLIGHT', payload: highlightId })
    // Also remove from collections
    if (activeCollection) {
      const updatedCollections = collections.map(c =>
        c.id === activeCollection.id
          ? { ...c, highlightIds: c.highlightIds.filter(id => id !== highlightId) }
          : c
      )
      dispatch({ type: 'SET_STATE', payload: { ...state, highlightCollections: updatedCollections, highlights: state.highlights.filter(h => h.id !== highlightId) } })
    }
  }

  function handleDeleteCollection(collId) {
    const updatedCollections = collections.filter(c => c.id !== collId)
    dispatch({ type: 'SET_STATE', payload: { ...state, highlightCollections: updatedCollections } })
    navigate(withCurrentSearch('/highlights', location.search))
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sub-sidebar */}
      <div style={{ width: 220, minWidth: 220, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '16px 0', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => setShowNewCollection(true)}>
            <Plus size={14} />
            New collection
          </button>
        </div>
        {showNewCollection && (
          <div style={{ padding: '0 12px', marginBottom: 12 }}>
            <input
              className="input"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateCollection()}
              placeholder="Collection name..."
              autoFocus
              style={{ fontSize: 13, marginBottom: 6 }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '4px 8px', justifyContent: 'center' }} onClick={handleCreateCollection}>Create</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => setShowNewCollection(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div
          className={`sub-sidebar-item ${!collectionId ? 'active' : ''}`}
          onClick={() => navigate(withCurrentSearch('/highlights', location.search))}
        >
          All Highlights ({highlights.length})
        </div>
        <div className="sub-sidebar-header">COLLECTIONS</div>
        {collections.map(c => (
          <div
            key={c.id}
            className={`sub-sidebar-item ${collectionId === c.id ? 'active' : ''}`}
            style={{ justifyContent: 'space-between' }}
          >
            <div onClick={() => navigate(withCurrentSearch(`/highlights/${c.id}`, location.search))} style={{ flex: 1 }}>
              <div>{c.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.highlightIds.length} highlights</div>
            </div>
            <button
              className="header-icon-btn"
              style={{ width: 24, height: 24 }}
              onClick={(e) => { e.stopPropagation(); handleDeleteCollection(c.id) }}
              title="Delete collection"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div className="page-header">
          <h1 className="page-title">{activeCollection?.name || 'Highlights'}</h1>
          <p className="page-subtitle">{visibleHighlights.length} highlight{visibleHighlights.length !== 1 ? 's' : ''}</p>
        </div>

        {visibleHighlights.length === 0 ? (
          <div className="empty-state">
            <Lightbulb size={48} color="#D1D5DB" />
            <div className="empty-state-title" style={{ marginTop: 16 }}>No highlights yet</div>
            <p style={{ marginBottom: 16 }}>Save key moments from recordings and heatmaps to share with your team</p>
            <button className="btn-secondary" onClick={() => navigate(withCurrentSearch('/recordings', location.search))}>Go to Recordings</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {visibleHighlights.map(h => (
              <div key={h.id} className="card" style={{ position: 'relative' }}>
                <div style={{ height: 120, background: '#F3F4F6', borderRadius: 6, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => h.sourceType === 'recording' ? navigate(withCurrentSearch(`/recordings/${h.sourceId}`, location.search)) : navigate(withCurrentSearch(`/heatmaps/${h.sourceId}`, location.search))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {h.sourceType === 'recording' ? <PlayCircle size={16} color="#9CA3AF" /> : <Target size={16} color="#9CA3AF" />}
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {h.sourceType === 'recording' ? 'Recording clip' : 'Heatmap'}
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{h.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{h.notes}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{formatDate(h.createdAt)}</span>
                  <button
                    className="header-icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => handleRemoveHighlight(h.id)}
                    title="Remove highlight"
                  >
                    <Trash2 size={12} color="#9CA3AF" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
