import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  {
    title: 'About Xripadvisor',
    links: ['About Us', 'Press', 'Resources and Policies', 'Careers', 'Trust & Safety']
  },
  {
    title: 'Explore',
    links: ['Write a Review', 'Add a Place', 'Join', 'Travelers\' Choice', 'Help Center']
  },
  {
    title: 'Do Business With Us',
    links: ['Owners', 'Business Advantage', 'Sponsored Placements', 'Access Our Content API', 'Get The App']
  },
  {
    title: 'Xripadvisor Sites',
    links: ['Xripadvisor', 'The Fork', 'Cruise Critic', 'Viator', 'FlipKey']
  }
];

function linkPath(label) {
  if (label === 'Write a Review') return '/reviews/write/hotel/hotel_1';
  if (label === 'Travelers\' Choice') return '/hotels';
  if (label === 'Help Center') return '/forums';
  if (label === 'Xripadvisor') return '/';
  return null;
}

export default function Footer() {
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (!panel) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panel]);

  const openPanel = (label) => {
    setPanel({
      label,
      body: `${label} is represented locally in this sandbox. The action stays inside the mock site so agents can inspect the result without leaving the training environment.`
    });
  };

  return (
    <footer style={{
      background: '#1A1A1A',
      color: '#E0E0E0',
      padding: '48px 24px 24px',
      marginTop: '48px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {footerLinks.map(section => (
            <div key={section.title}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>{section.title}</h4>
              {section.links.map(item => {
                const path = linkPath(item);
                const commonStyle = { color: '#B0B0B0', fontSize: '13px', textDecoration: 'none' };
                return (
                  <div key={item} style={{ marginBottom: '8px' }}>
                    {path ? (
                      <Link to={path} style={commonStyle}
                        onMouseEnter={e => e.target.style.color = 'white'}
                        onMouseLeave={e => e.target.style.color = '#B0B0B0'}
                      >{item}</Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openPanel(item)}
                        style={{ ...commonStyle, padding: 0, textAlign: 'left' }}
                        onMouseEnter={e => e.target.style.color = 'white'}
                        onMouseLeave={e => e.target.style.color = '#B0B0B0'}
                      >
                        {item}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid #333',
          paddingTop: '16px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#8A8A8A'
        }}>
          &copy; {new Date().getFullYear()} Xripadvisor LLC All rights reserved. This is a mock application for testing purposes.
        </div>
      </div>
      {panel && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setPanel(null)}
        >
          <div
            style={{ background: 'white', color: '#1A1A1A', width: 'min(460px, 100%)', borderRadius: '8px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{panel.label}</h2>
            <p style={{ fontSize: '14px', color: '#545454', lineHeight: 1.6, marginBottom: '18px' }}>{panel.body}</p>
            <button type="button" className="btn-primary" onClick={() => setPanel(null)}>Close</button>
          </div>
        </div>
      )}
    </footer>
  );
}
