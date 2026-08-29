import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShoppingCart, Gift, RefreshCw, Package, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const prebuiltTemplates = [
  { type: 'welcome', name: 'Welcome New Subscribers', desc: 'Automatically send a welcome email when someone joins your audience', icon: Zap, color: '#1565C0', trigger: { type: 'signup', audienceId: 'aud_1' } },
  { type: 'abandoned_cart', name: 'Abandoned Cart', desc: 'Remind customers about items left in their cart', icon: ShoppingCart, color: '#E65100', trigger: { type: 'cart_abandoned', audienceId: 'aud_1' } },
  { type: 'birthday', name: 'Birthday Greetings', desc: 'Send a special offer on subscriber birthdays', icon: Gift, color: '#C2185B', trigger: { type: 'birthday', audienceId: 'aud_1' } },
  { type: 're_engagement', name: 'Re-engagement', desc: 'Win back subscribers who haven\'t opened emails recently', icon: RefreshCw, color: '#7B1FA2', trigger: { type: 'inactivity', audienceId: 'aud_1' } },
  { type: 'post_purchase', name: 'Post-Purchase Follow-up', desc: 'Thank customers and ask for a review after purchase', icon: Package, color: '#2E7D32', trigger: { type: 'purchase', audienceId: 'aud_1' } },
  { type: 'custom', name: 'Custom Automation', desc: 'Start from scratch with a blank workflow', icon: Plus, color: '#707070', trigger: { type: 'custom', audienceId: 'aud_1' } }
];

export default function AutomationPrebuilt() {
  const { addAutomation, addToast } = useApp();
  const navigate = useNavigate();

  const handleSelect = (template) => {
    const newAuto = {
      id: `auto_${Date.now()}`,
      name: template.name,
      type: template.type,
      status: 'draft',
      trigger: template.trigger,
      steps: template.type === 'welcome' ? [
        { id: `step_${Date.now()}_1`, type: 'send_email', order: 0, config: { subject: 'Welcome!', previewText: 'Thanks for subscribing', content: [] } }
      ] : [],
      stats: { emailsSent: 0, opened: 0, clicked: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addAutomation(newAuto);
    addToast('Automation created');
    navigate(`/automations/${newAuto.id}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Choose a starting point</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {prebuiltTemplates.map(t => (
          <div key={t.type} className="card" style={{ cursor: 'pointer', padding: 24, transition: 'all 0.2s' }}
            onClick={() => handleSelect(t)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <t.icon size={24} style={{ color: t.color }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{t.name}</h3>
            <p className="text-sm text-muted">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
