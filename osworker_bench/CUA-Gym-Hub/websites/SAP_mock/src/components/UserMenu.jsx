import { useApp } from '../context/AppContext'

export default function UserMenu({ onClose }) {
  const { state } = useApp()
  const { currentUser, companyInfo } = state

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0,
      width: '280px',
      background: '#fff', borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid var(--xap-border)',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* User info */}
      <div style={{
        padding: '16px',
        background: 'var(--xap-page-bg)',
        borderBottom: '1px solid var(--xap-border)',
        display: 'flex', gap: '12px', alignItems: 'center'
      }}>
        <div style={{
          background: currentUser.avatarColor,
          borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0
        }}>
          {currentUser.initials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{currentUser.firstName} {currentUser.lastName}</div>
          <div style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>{currentUser.role}</div>
          <div style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>{currentUser.email}</div>
        </div>
      </div>
      {/* Company */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--xap-border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>Company</div>
        <div style={{ fontSize: '13px' }}>{companyInfo.companyName} ({companyInfo.companyCode})</div>
      </div>
      {/* Menu items */}
      {['Settings', 'Theme', 'About', 'Sign Out'].map(item => (
        <button
          key={item}
          onClick={onClose}
          style={{
            width: '100%', background: 'none', border: 'none',
            padding: '10px 16px', textAlign: 'left',
            fontSize: '13px', cursor: 'pointer', color: 'var(--xap-text-primary)'
          }}
          onMouseEnter={e => e.target.style.background = 'var(--xap-page-bg)'}
          onMouseLeave={e => e.target.style.background = 'none'}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
