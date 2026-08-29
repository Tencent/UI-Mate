
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface RelatedListProps {
  title: string;
  columns: Column[];
  data: any[];
  idKey: string;
  linkPrefix?: string;
  nameKey?: string;
  maxRows?: number;
  onNew?: () => void;
}

export const RelatedList: React.FC<RelatedListProps> = ({
  title,
  columns,
  data,
  idKey,
  linkPrefix,
  nameKey,
  maxRows = 5,
  onNew
}) => {
  const displayData = data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h3>
          <span style={{
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '2px 8px', fontSize: '12px', color: 'var(--text-secondary)'
          }}>
            {data.length}
          </span>
        </div>
        {onNew && (
          <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '13px' }} onClick={onNew}>
            <Plus size={14} />
            New
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No records found</p>
      ) : (
        <>
          <table className="table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row) => (
                <tr key={row[idKey]}>
                  {columns.map((col, colIdx) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (
                        colIdx === 0 && linkPrefix && nameKey ? (
                          <Link to={`${linkPrefix}/${row[idKey]}`}>
                            {row[nameKey] || row[col.key]}
                          </Link>
                        ) : (
                          row[col.key] || '--'
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '8px', borderTop: '1px solid var(--border)' }}>
              {linkPrefix ? (
                <Link to={linkPrefix} style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer' }}>
                  View All ({data.length})
                </Link>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer' }}>
                  View All ({data.length})
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
