import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { Layers, BarChart2, Clock, Star, ArrowRight } from 'lucide-react'

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')

  const boards = state?.boards || []
  const recentlyViewed = state?.recentlyViewed || []
  const reports = state?.reports || []

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B1B2E', marginBottom: 6 }}>
            Welcome back, {state?.currentUser?.name?.split(' ')[0] || 'User'}
          </h1>
          <p style={{ fontSize: 14, color: '#8E8EA0' }}>
            {state?.project?.name || 'Your project'} -- {state?.events?.length?.toLocaleString() || 0} events tracked
          </p>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={16} color="#8E8EA0" />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B1B2E' }}>Recently Viewed</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {recentlyViewed.map((item, i) => (
                <RecentCard key={i} item={item} onClick={() => {
                  if (item.type === 'report') navTo(`/report/${item.id}`)
                  else navTo(`/board/${item.id}`)
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Saved Boards */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Layers size={16} color="#8E8EA0" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B1B2E' }}>Your Boards</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {boards.map(board => (
              <BoardGridCard key={board.id} board={board} onClick={() => navTo(`/board/${board.id}`)} />
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1B1B2E', marginBottom: 16 }}>Getting Started</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { title: 'Create an Insights report', desc: 'Explore trends and metrics', path: '/insights', color: '#4F44E0' },
              { title: 'Build a Funnel', desc: 'Measure conversion rates', path: '/funnels', color: '#EB5757' },
              { title: 'Analyze User Flows', desc: 'Understand the user journey', path: '/flows', color: '#27AE60' },
              { title: 'Track Retention', desc: 'See how users come back', path: '/retention', color: '#F5A623' },
            ].map(item => (
              <button key={item.path} onClick={() => navTo(item.path)} style={{
                background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
                padding: '16px', cursor: 'pointer', textAlign: 'left',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                display: 'flex', flexDirection: 'column', gap: 6
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E4E8'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E' }}>{item.title}</span>
                </div>
                <span style={{ fontSize: 13, color: '#8E8EA0' }}>{item.desc}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: item.color, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                  Get started <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentCard({ item, onClick }) {
  const [hover, setHover] = React.useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
        padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
        boxShadow: hover ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.15s',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
      {item.type === 'report'
        ? <BarChart2 size={16} color="#4F44E0" />
        : <Layers size={16} color="#F5A623" />
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1B2E' }} className="truncate">{item.name}</div>
        <div style={{ fontSize: 11, color: '#8E8EA0', textTransform: 'capitalize' }}>{item.type}</div>
      </div>
    </button>
  )
}

function BoardGridCard({ board, onClick }) {
  const [hover, setHover] = React.useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
        padding: '20px', cursor: 'pointer', textAlign: 'left',
        boxShadow: hover ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.15s'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {board.isFavorite && <Star size={14} color="#F5A623" fill="#F5A623" />}
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1B1B2E', margin: 0 }}>{board.name}</h3>
      </div>
      <p style={{ fontSize: 13, color: '#8E8EA0', margin: 0, lineHeight: 1.5 }}>{board.description}</p>
      <div style={{ fontSize: 12, color: '#8E8EA0', marginTop: 8 }}>
        {board.items?.length || 0} items
      </div>
    </button>
  )
}
