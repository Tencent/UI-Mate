
import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';

interface SetupHomeProps {}

export const SetupHome: React.FC<SetupHomeProps> = () => {
  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Setup</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure objects, fields, and picklists for your org.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Object Manager</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Manage custom objects, fields, picklist values, and relationships.
        </p>

        <Link
          to="/setup/object-manager/lead"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            background: 'var(--bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Lead</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Manage Lead fields and picklist values
              </div>
            </div>
          </div>
          <ArrowRight size={20} color="var(--text-secondary)" />
        </Link>
      </div>
    </div>
  );
};
