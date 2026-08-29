
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LeadObjectManagerProps {}

export const LeadObjectManager: React.FC<LeadObjectManagerProps> = () => {
  const { state } = useApp();
  const leadObj = state.customObjects?.Lead;
  const fields = leadObj?.fields || {};

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <Link to="/setup" style={{ textDecoration: 'none', color: 'var(--primary)' }}>Setup</Link>
          <ChevronRight size={12} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
          Object Manager
          <ChevronRight size={12} style={{ verticalAlign: 'middle', margin: '0 4px' }} />
          Lead
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Lead — Fields & Relationships</h1>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Field Label</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>API Name</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '12px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fields).map(([key, field]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{field.label}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{field.apiName}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{field.type}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '300px' }}>{field.description || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {field.type === 'picklist' && field.values ? (
                    <Link
                      to={`/setup/object-manager/lead/fields/${key}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        color: 'var(--primary)',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      Edit Values <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {Object.keys(fields).length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No custom fields found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
