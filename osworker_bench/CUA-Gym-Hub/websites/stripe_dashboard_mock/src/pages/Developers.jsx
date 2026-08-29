import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Webhook, BookOpen, Terminal } from 'lucide-react';

export default function Developers() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Code2 size={20} />,
      title: 'API Keys',
      description: 'Manage your API keys and tokens for authenticating requests.',
      action: () => navigate('/settings?tab=api'),
      label: 'Manage keys',
    },
    {
      icon: <Webhook size={20} />,
      title: 'Webhooks',
      description: 'Configure webhook endpoints to receive real-time event notifications.',
      action: () => navigate('/settings?tab=webhooks'),
      label: 'Manage webhooks',
    },
    {
      icon: <BookOpen size={20} />,
      title: 'API Reference',
      description: 'Explore the full Xtripe API reference documentation.',
      action: null,
      label: 'View docs',
      external: 'https://stripe.com/docs/api',
    },
    {
      icon: <Terminal size={20} />,
      title: 'Xtripe CLI',
      description: 'Use the Xtripe CLI to test webhooks, trigger events, and more.',
      action: null,
      label: 'Install CLI',
      external: 'https://stripe.com/docs/stripe-cli',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Developers</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {sections.map(s => (
          <div key={s.title} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-primary)' }}>
              {s.icon}
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{s.title}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1 }}>{s.description}</p>
            {s.action ? (
              <button className="btn-link" onClick={s.action} style={{ alignSelf: 'flex-start' }}>{s.label} →</button>
            ) : (
              <a href={s.external} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ alignSelf: 'flex-start' }}>{s.label} →</a>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, padding: 20 }}>
        <div className="card-header"><div className="card-title">Event log</div></div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          View the recent events sent from your account. Navigate to a specific payment, invoice, or subscription to see its event history.
        </p>
        <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate('/')}>View dashboard events →</button>
      </div>
    </div>
  );
}
