import React, { useState } from 'react';
import { InfoDialog } from './InfoDialog';

const FOOTER_LINKS = {
  'Support': ['Help Center', 'Cancel your booking', 'Safety resource center', 'Report a neighborhood concern'],
  'Discover': ['Genius loyalty program', 'Seasonal and holiday deals', 'Traveler Review Awards', 'Car rental deals', 'Flight deals'],
  'Become a partner': ['List your property', 'Become an affiliate', 'Xooking.com for Business'],
  'About': ['About Xooking.com', 'How We Work', 'Sustainability', 'Press center', 'Investor relations', 'Terms & Conditions', 'Privacy & Cookie Statement'],
};

export const Footer = () => {
  const [dialogTitle, setDialogTitle] = useState(null);

  return (
    <footer style={{ background: 'var(--bc-blue-dark)', color: 'white', marginTop: 40 }}>
      {/* Main footer content */}
      <div className="container--wide" style={{ padding: '40px 16px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px 32px' }}>
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{section}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(link => (
                  <li key={link}>
                    <button
                      onClick={(e) => { e.preventDefault(); setDialogTitle(link); }}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="container--wide" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Copyright © 1996–2025 Xooking.com™. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Cookie Policy', 'Terms', 'MSA'].map(item => (
              <button key={item} onClick={(e) => { e.preventDefault(); setDialogTitle(item); }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      {dialogTitle && (
        <InfoDialog title={dialogTitle} onClose={() => setDialogTitle(null)}>
          <p style={{ color: 'var(--bc-text-medium)', lineHeight: 1.6 }}>
            This local sandbox page records the selection and keeps you inside the mock. No external Xooking.com help, legal, partner, or account service is contacted.
          </p>
        </InfoDialog>
      )}
    </footer>
  );
};
