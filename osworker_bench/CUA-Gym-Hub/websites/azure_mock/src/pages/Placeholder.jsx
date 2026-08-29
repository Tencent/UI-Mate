import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

export default function Placeholder({ title }) {
  const navigate = useNavigate();
  return (
    <div className="placeholder-page">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: title }]} />
      <h1 className="page-title">{title}</h1>
      <div className="placeholder-message" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9635;</div>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--xzure-text)' }}>{title}</div>
        <div style={{ color: 'var(--xzure-text-secondary)', marginBottom: '24px' }}>
          This local service blade keeps navigation inside the sandbox. Use the links below to continue with Xzure resources, services, or activity.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          <button className="btn btn-default" onClick={() => navigate('/all-services')}>All services</button>
          <button className="btn btn-default" onClick={() => navigate('/activity-log')}>Activity log</button>
        </div>
      </div>
    </div>
  );
}
