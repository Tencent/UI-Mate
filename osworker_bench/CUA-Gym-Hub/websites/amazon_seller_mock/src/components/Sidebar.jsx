import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const sections = [
  { header: 'CATALOG', items: [{ label: 'Add Products', to: '/catalog/add-product' }] },
  { header: 'INVENTORY', items: [
    { label: 'Manage All Inventory', to: '/inventory' },
    { label: 'Manage FBA Inventory', to: '/inventory/fba' },
    { label: 'Inventory Planning', to: '/inventory/planning' },
    { label: 'Manage FBA Shipments', to: '/inventory/shipments' }
  ]},
  { header: 'PRICING', items: [
    { label: 'Manage Pricing', to: '/pricing' },
    { label: 'Automate Pricing', to: '/pricing/automate' }
  ]},
  { header: 'ORDERS', items: [
    { label: 'Manage Orders', to: '/orders' },
    { label: 'Order Reports', to: '/orders/reports' },
    { label: 'Manage Returns', to: '/returns' }
  ]},
  { header: 'ADVERTISING', items: [
    { label: 'Campaign Manager', to: '/advertising' },
    { label: 'Create Campaign', to: '/advertising/create' }
  ]},
  { header: 'STORES', items: [{ label: 'Manage Stores', to: '/stores' }] },
  { header: 'GROWTH', items: [{ label: 'Growth Opportunities', to: '/growth' }] },
  { header: 'REPORTS', items: [
    { label: 'Business Reports', to: '/reports' },
    { label: 'Payments', to: '/payments' },
    { label: 'Advertising Reports', to: '/reports/advertising' }
  ]},
  { header: 'PERFORMANCE', items: [
    { label: 'Account Health', to: '/account-health' },
    { label: 'Feedback', to: '/feedback' },
    { label: 'Voice of the Customer', to: '/performance/voc' }
  ]},
  { header: 'B2B', items: [{ label: 'B2B Central', to: '/b2b' }] },
  { header: 'BRANDS', items: [{ label: 'Brand Dashboard', to: '/brands' }] },
  { header: 'SETTINGS', items: [
    { label: 'Account Info', to: '/settings' },
    { label: 'Notification Preferences', to: '/settings/notifications' },
    { label: 'Shipping Settings', to: '/settings/shipping' }
  ]}
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          display: open ? 'block' : 'none',
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
          opacity: open ? 1 : 0, transition: 'opacity 200ms ease'
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: '#232f3e', zIndex: 1000, overflowY: 'auto',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 250ms ease-out',
        boxShadow: '4px 0 8px rgba(0,0,0,0.2)'
      }}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="white" />
          </button>
        </div>

        {sections.map((section, si) => (
          <div key={si}>
            {si > 0 && <div style={{ height: 1, background: '#3b4a5c', margin: '4px 0' }} />}
            <div style={{ padding: '8px 16px 4px', fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              {section.header}
            </div>
            {section.items.map((item, ii) => (
              <button key={ii} onClick={() => handleNav(item.to)}
                style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', color: 'white', fontSize: 14, cursor: 'pointer', lineHeight: '20px' }}
                onMouseEnter={e => e.target.style.background = '#37475a'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </>
  );
}
