export default function PlaceholderPage({ title, message }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#1A1A2E' }}>{title}</h2>
        <p style={{ color: '#5F6368', fontSize: 14 }}>{message || 'This feature is not available in the demo.'}</p>
      </div>
    </div>
  )
}
