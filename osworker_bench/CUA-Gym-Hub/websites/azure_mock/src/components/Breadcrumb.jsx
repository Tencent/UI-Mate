import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  // items = [{ label: 'Home', path: '/' }, { label: 'Virtual machines', path: '/virtual-machines' }, { label: 'vm-web-server-01' }]
  // Last item has no path and is plain text
  return (
    <div className="breadcrumb">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="breadcrumb-separator">&gt;</span>}
          {item.path ? (
            <Link to={item.path}>{item.label}</Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
