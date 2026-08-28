import { useAppContext } from '../context/AppContext.jsx'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Events() {
  const { state } = useAppContext()
  const events = (state.events || []).filter(e => e.siteId === state.activeSiteId)

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">Events</h1>
        <p className="page-subtitle">Track custom events on your site</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Event name</th>
              <th>Type</th>
              <th>First seen</th>
              <th>Last seen</th>
              <th>Total count</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{event.name}</td>
                <td>
                  <span className={`badge ${event.type === 'custom' ? 'badge-blue' : 'badge-grey'}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </td>
                <td style={{ color: '#6B7280' }}>{formatDate(event.firstSeen)}</td>
                <td style={{ color: '#6B7280' }}>{formatDate(event.lastSeen)}</td>
                <td style={{ fontWeight: 600 }}>{event.totalCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
