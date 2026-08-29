import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, credits: 6000, features: ['Up to 6,000 build minutes/month', '1 concurrent job', 'Community support'] },
  { id: 'performance', name: 'Performance', price: 15, credits: 50000, features: ['Up to 50,000 credits/month', '80 concurrent jobs', 'All resource classes', 'Priority support'] },
  { id: 'scale', name: 'Scale', price: 2000, credits: 200000, features: ['Up to 200,000 credits/month', 'Unlimited concurrent jobs', 'Custom resource classes', 'Dedicated support engineer', 'Audit logs'] },
];

export default function Plan() {
  const { state, dispatch } = useApp();
  const { organization } = state;
  const usagePct = Math.round((organization.creditsUsed / organization.creditBalance) * 100);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgraded, setUpgraded] = useState(false);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && showUpgradeModal && !upgraded) {
        setShowUpgradeModal(false);
        setSelectedPlan(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showUpgradeModal, upgraded]);

  const handleUpgrade = (plan) => {
    if (!plan) {
      setPlanError('Select a plan before continuing.');
      return;
    }
    dispatch({ type: 'UPDATE_ORGANIZATION', payload: { plan: plan.id, creditBalance: plan.credits } });
    setUpgraded(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      setUpgraded(false);
    }, 1500);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Plan & Usage
        </h1>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #0D0E12, #1C1E26)', borderRadius: 12, padding: 24, color: '#fff', marginBottom: 24, maxWidth: 600 }}>
          <div style={{ fontSize: 12, color: '#a0a4ab', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Current Plan</div>
          <div style={{ fontSize: 28, fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>{organization.plan}</div>
          <div style={{ fontSize: 13, color: '#a0a4ab' }}>{organization.name}</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowUpgradeModal(true)}>Change Plan</button>
        </div>

        {showUpgradeModal && (
          <div className="modal-overlay" onClick={() => { if (!upgraded) { setShowUpgradeModal(false); setSelectedPlan(null); } }}>
            <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">Choose a Plan</div>
              {upgraded ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 9 10.5 14.5 8 12"/></svg>
                  <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Plan updated successfully!</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '16px 0' }}>
                    {PLANS.map(plan => {
                      const isCurrent = plan.id === organization.plan;
                      const isSelected = selectedPlan?.id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => { if (!isCurrent) { setSelectedPlan(plan); setPlanError(''); } }}
                          style={{
                            border: `2px solid ${isSelected ? 'var(--green)' : isCurrent ? '#4a90e2' : 'var(--border)'}`,
                            borderRadius: 8, padding: 16, cursor: isCurrent ? 'default' : 'pointer',
                            background: isSelected ? 'rgba(56, 178, 115, 0.05)' : 'transparent',
                            opacity: isCurrent ? 0.7 : 1,
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, textTransform: 'capitalize' }}>{plan.name}</div>
                          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                          </div>
                          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
                            {plan.features.map((f, i) => (
                              <li key={i} style={{ padding: '3px 0' }}>+ {f}</li>
                            ))}
                          </ul>
                          {isCurrent && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#4a90e2' }}>CURRENT</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="modal-actions">
                    <button className="btn" onClick={() => { setShowUpgradeModal(false); setSelectedPlan(null); }}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleUpgrade(selectedPlan)}>
                      {selectedPlan ? `Switch to ${selectedPlan.name}` : 'Select a plan'}
                    </button>
                  </div>
                  {planError && <div style={{ color: 'var(--red)', fontSize: 12, textAlign: 'right', marginTop: 8 }}>{planError}</div>}
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Credit Usage</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{organization.creditsUsed.toLocaleString()} / {organization.creditBalance.toLocaleString()}</span>
          </div>
          <div className="credit-bar" style={{ height: 12, borderRadius: 6 }}>
            <div className="credit-bar-fill" style={{ width: `${usagePct}%`, borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{usagePct}% of credits used this month</div>
        </div>

        <div style={{ marginTop: 32, maxWidth: 600 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Usage by Project</h3>
          {[
            { name: 'frontend-app', credits: 4200, pct: 34 },
            { name: 'backend-api', credits: 3800, pct: 31 },
            { name: 'mobile-app', credits: 2900, pct: 23 },
            { name: 'infrastructure', credits: 1550, pct: 12 }
          ].map(p => (
            <div key={p.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>{p.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{p.credits.toLocaleString()} credits</span>
              </div>
              <div style={{ background: 'var(--border)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
