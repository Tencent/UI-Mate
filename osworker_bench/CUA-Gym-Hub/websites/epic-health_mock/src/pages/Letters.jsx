import { useApp } from '../context/AppContext'
import { Mail, FileText } from 'lucide-react'
import '../styles/common.css'

// Default letters derived from appointment history and clinical records
const LETTER_TEMPLATES = [
  {
    id: 'letter-1',
    type: 'After Visit Summary',
    from: 'Elizabeth Morrison, MD',
    date: '2025-03-01',
    subject: 'After Visit Summary — Office Visit Mar 1, 2025',
    body: 'Dear Sarah,\n\nThank you for visiting us. This letter summarizes your recent office visit on March 1, 2025. Your care team reviewed your ongoing conditions and updated your care plan accordingly. Please follow the instructions provided and contact our office if you have questions.'
  },
  {
    id: 'letter-2',
    type: 'Lab Results Letter',
    from: 'Elizabeth Morrison, MD',
    date: '2025-03-08',
    subject: 'Your Lab Results — Lipid Panel',
    body: 'Dear Sarah,\n\nYour recent Lipid Panel results have been reviewed. Your LDL cholesterol is slightly elevated. Please schedule a follow-up appointment to discuss dietary changes and medication options.'
  },
  {
    id: 'letter-3',
    type: 'Referral Letter',
    from: 'Elizabeth Morrison, MD',
    date: '2025-02-15',
    subject: 'Referral to Cardiology — James Park, MD',
    body: 'Dear Sarah,\n\nThis letter confirms your referral to Dr. James Park in our Cardiology department. Please contact their office to schedule your appointment at your earliest convenience.'
  }
]

export default function Letters() {
  const { state } = useApp()

  // Use any letters from state (future injection support), fallback to templates
  const letters = (state.letters && state.letters.length > 0) ? state.letters : LETTER_TEMPLATES

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Mail size={22} style={{ color: 'var(--color-primary)' }} />
        Letters
      </h1>

      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Your Letters from Providers</h2>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {letters.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>
              No letters on file.
            </div>
          ) : (
            <div>
              {letters.map((letter, i) => (
                <div
                  key={letter.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < letters.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 2 }}>{letter.subject}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      From: {letter.from} &nbsp;·&nbsp; {letter.date} &nbsp;·&nbsp;
                      <span style={{
                        background: 'var(--color-section-bg)', borderRadius: 4, padding: '1px 6px',
                        border: '1px solid var(--color-border)', marginLeft: 4
                      }}>
                        {letter.type}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                    }}>
                      {letter.body.replace(/\n/g, ' ').slice(0, 120)}…
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => window.print()}
                      title="Print letter"
                    >
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
