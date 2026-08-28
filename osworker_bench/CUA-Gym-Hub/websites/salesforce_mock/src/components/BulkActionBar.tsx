
import { useState } from 'react';
import { UserCheck, RefreshCw, Trash2, Download } from 'lucide-react';
import { Modal } from './Modal';

interface BulkActionBarProps {
  selectedCount: number;
  users: Array<{ userId: string; firstName: string; lastName: string; avatar: string }>;
  statusOptions: string[];
  onChangeOwner: (userId: string) => void;
  onChangeStatus: (status: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onDeselectAll: () => void;
  entityName: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  users,
  statusOptions,
  onChangeOwner,
  onChangeStatus,
  onDelete,
  onExport,
  onDeselectAll,
  entityName,
}) => {
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div
        style={{
          background: '#F3F3F3',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          height: '48px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0',
          animation: 'slideDown 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onDeselectAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            Deselect All
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Change Owner */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => { setShowOwnerDropdown(!showOwnerDropdown); setShowStatusDropdown(false); }}
            >
              <UserCheck size={16} />
              Change Owner
            </button>
            {showOwnerDropdown && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }}
                  onClick={() => setShowOwnerDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: '240px',
                  zIndex: 50,
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}>
                  {users.map(user => (
                    <button
                      key={user.userId}
                      onClick={() => {
                        onChangeOwner(user.userId);
                        setShowOwnerDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                      />
                      <span>{user.firstName} {user.lastName}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Change Status - only shown if status options are provided */}
          {statusOptions.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowOwnerDropdown(false); }}
            >
              <RefreshCw size={16} />
              Change Status
            </button>
            {showStatusDropdown && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }}
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: '180px',
                  zIndex: 50,
                }}>
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        onChangeStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          )}

          {/* Delete */}
          <button
            className="btn btn-danger"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete
          </button>

          {/* Export */}
          <button
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={onExport}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={`Delete ${entityName}s`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete {selectedCount} {entityName.toLowerCase()}{selectedCount > 1 ? 's' : ''}? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={() => { onDelete(); setShowDeleteModal(false); }}>
              Delete {selectedCount} Record{selectedCount > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
