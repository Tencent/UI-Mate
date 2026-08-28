import { useNavigate } from 'react-router-dom'

export default function PlaceholderPage({ title }) {
  const navigate = useNavigate()
  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  return (
    <div className="wp-placeholder-page">
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>{title || 'Page not found'}</h2>
      <p style={{ color: '#646970', marginBottom: 16 }}>The page you are looking for could not be found. It may have been moved or removed.</p>
      <button className="button-primary" onClick={() => navTo('/')}>Go to Dashboard</button>
    </div>
  )
}
