import React from 'react';

const linkTargets = {
  'OUR PRODUCT': 'https://use.expensify.com',
  'UPGRADE': 'https://use.expensify.com/upgrade',
  'PRICING': 'https://use.expensify.com/pricing',
  'JOBS': 'https://we.are.expensify.com/jobs',
  'ABOUT US': 'https://we.are.expensify.com',
  'BLOG': 'https://we.are.expensify.com/blog',
  'COMMUNITY': 'https://community.expensify.com',
  'STATUS': 'https://status.expensify.com',
  'PRIVACY': 'https://use.expensify.com/privacy',
  'HELP': 'https://help.expensify.com',
};

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-links">
        {Object.entries(linkTargets).map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        ))}
      </div>
      <div className="footer-copyright">&copy; 2008-2024 Xpensify, Inc.</div>
    </footer>
  );
}
