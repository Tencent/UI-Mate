import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const Refer = () => {
  const { state, updateState } = useAppContext()
  const [email, setEmail] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const referrals = state?.referrals || []

  const toast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSendInvite = () => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast('Please enter a valid email address')
      return
    }
    if (referrals.some(r => r.email === trimmed)) {
      toast('This email has already been invited')
      return
    }
    updateState(prev => ({
      ...prev,
      referrals: [
        ...(prev.referrals || []),
        { id: `ref_${Date.now()}`, email: trimmed, status: 'Invited', invitedAt: new Date().toISOString() }
      ]
    }))
    setEmail('')
    toast(`Invitation sent to ${trimmed}`)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Refer &amp; Earn</h1>
      </div>

      {/* Hero card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #00A07D 0%, #00b890 100%)', color: 'white', padding: '36px' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px', lineHeight: '1.2' }}>
            Earn $300 for every business you refer
          </div>
          <p style={{ fontSize: '15px', opacity: 0.88, lineHeight: '1.6', marginBottom: '0' }}>
            Know a business owner who could use Xusto? Send them your referral link and earn a $300 bonus once they run their first payroll.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>How it works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { step: '1', title: 'Invite a business', desc: 'Share your unique referral link or send an email invite to a business owner you know.' },
            { step: '2', title: 'They sign up', desc: 'Your referral creates a Xusto account and runs their first payroll using your link.' },
            { step: '3', title: 'You get paid', desc: 'Once they run payroll, we\'ll send you a $300 gift card within 30 days.' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal-light)',
                color: 'var(--teal)', fontWeight: '700', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)', lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite by email */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Send an invite</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', maxWidth: '480px' }}>
          <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Business owner's email</label>
            <input
              type="email"
              placeholder="owner@theirbusiness.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendInvite() }}
            />
          </div>
          <button className="btn-primary" onClick={handleSendInvite} style={{ whiteSpace: 'nowrap' }}>
            Send invite
          </button>
        </div>
      </div>

      {/* Referral link */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Your referral link</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            flex: 1, padding: '9px 14px', background: 'var(--light-gray)', borderRadius: '6px',
            border: '1px solid var(--border)', fontSize: '13px', color: 'var(--medium-gray)',
            fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            https://gusto.com/refer/horizon-tech-solutions
          </div>
          <button
            className="btn-outline"
            onClick={() => {
              navigator.clipboard?.writeText('https://gusto.com/refer/horizon-tech-solutions').catch(() => {})
              toast('Link copied to clipboard!')
            }}
          >
            Copy link
          </button>
        </div>
      </div>

      {/* Past referrals table */}
      {referrals.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Your referrals</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Invited</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td>
                    <span className={`badge ${r.status === 'Earned' ? 'badge-active' : 'badge-draft'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>
                    {new Date(r.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  )
}

export default Refer
