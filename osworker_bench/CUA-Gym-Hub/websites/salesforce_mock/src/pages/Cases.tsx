
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from '../components/CreateModal';
import { Case } from '../types';
import { BulkActionBar } from '../components/BulkActionBar';

interface CasesProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Cases: React.FC<CasesProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const totalPages = Math.ceil(state.cases.length / itemsPerPage);
  const paginatedCases = state.cases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getNextCaseNumber = () => {
    const maxNumber = state.cases.reduce((max, caseItem) => {
      const num = parseInt(caseItem.caseNumber.replace('CASE-', ''));
      return Math.max(max, num);
    }, 0);
    return `CASE-${String(maxNumber + 1).padStart(5, '0')}`;
  };

  const caseFields = [
    { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { name: 'accountId', label: 'Account', type: 'select' as const, options: state.accounts.map(a => a.name), required: true },
    { name: 'contactId', label: 'Contact', type: 'select' as const, options: ['(None)', ...state.contacts.map(c => `${c.firstName} ${c.lastName}`)] },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['New', 'Working', 'Escalated', 'Closed'], required: true },
    { name: 'priority', label: 'Priority', type: 'select' as const, options: ['Low', 'Medium', 'High', 'Critical'], required: true },
    { name: 'origin', label: 'Case Origin', type: 'select' as const, options: ['Email', 'Phone', 'Web', 'Chat'] },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const handleCreateCase = (data: any) => {
    const account = state.accounts.find(a => a.name === data.accountId);
    const contactName = data.contactId && data.contactId !== '(None)' ? data.contactId : null;
    const contact = contactName
      ? state.contacts.find(c => `${c.firstName} ${c.lastName}` === contactName)
      : null;
    const newCase: Case = {
      caseId: 'case_' + Date.now(),
      caseNumber: getNextCaseNumber(),
      subject: data.subject,
      status: data.status || 'New',
      priority: data.priority || 'Medium',
      origin: data.origin || 'Email',
      accountId: account ? account.accountId : state.accounts[0].accountId,
      contactId: contact ? contact.contactId : '',
      description: data.description || '',
      ownerId: state.user.userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    updateState({
      cases: [...state.cases, newCase]
    });

    onShowToast('Case created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Cases</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          New Case
        </button>
      </div>

      <div className="card">
        <BulkActionBar
          selectedCount={selectedIds.length}
          users={state.users}
          statusOptions={['New', 'Working', 'Escalated', 'Closed']}
          entityName="Case"
          onDeselectAll={() => setSelectedIds([])}
          onChangeOwner={(userId) => {
            const updated = state.cases.map(c =>
              selectedIds.includes(c.caseId) ? { ...c, ownerId: userId, modifiedDate: new Date().toISOString() } : c
            );
            updateState({ cases: updated });
            onShowToast(`${selectedIds.length} records updated`, 'success');
            setSelectedIds([]);
          }}
          onChangeStatus={(status) => {
            const updated = state.cases.map(c =>
              selectedIds.includes(c.caseId) ? { ...c, status: status as Case['status'], modifiedDate: new Date().toISOString() } : c
            );
            updateState({ cases: updated });
            onShowToast(`${selectedIds.length} records updated`, 'success');
            setSelectedIds([]);
          }}
          onDelete={() => {
            const updated = state.cases.filter(c => !selectedIds.includes(c.caseId));
            updateState({ cases: updated });
            onShowToast(`${selectedIds.length} records deleted`, 'success');
            setSelectedIds([]);
          }}
          onExport={() => {
            const selected = state.cases.filter(c => selectedIds.includes(c.caseId));
            const csvContent = "data:text/csv;charset=utf-8,"
              + "Case Number,Subject,Status,Priority,Origin\n"
              + selected.map(c => `"${c.caseNumber}","${c.subject}","${c.status}","${c.priority}","${c.origin}"`).join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "cases_selected.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onShowToast(`${selectedIds.length} records exported`, 'success');
          }}
        />
        <table className="table">
          <thead>
            <tr>
              <th className="table-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedCases.length && paginatedCases.length > 0}
                  onChange={() => {
                    if (selectedIds.length === paginatedCases.length) {
                      setSelectedIds([]);
                    } else {
                      setSelectedIds(paginatedCases.map(c => c.caseId));
                    }
                  }}
                />
              </th>
              <th>Case Number</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Account Name</th>
              <th>Owner</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.map(caseItem => {
              const account = state.accounts.find(a => a.accountId === caseItem.accountId);
              const owner = state.users.find(u => u.userId === caseItem.ownerId);
              return (
                <tr key={caseItem.caseId}>
                  <td className="table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(caseItem.caseId)}
                      onChange={() => setSelectedIds(prev => prev.includes(caseItem.caseId) ? prev.filter(id => id !== caseItem.caseId) : [...prev, caseItem.caseId])}
                    />
                  </td>
                  <td>
                    <Link to={`/cases/${caseItem.caseId}`}>{caseItem.caseNumber}</Link>
                  </td>
                  <td>{caseItem.subject}</td>
                  <td>
                    <span className={`badge badge-${caseItem.status.toLowerCase()}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td>{caseItem.priority}</td>
                  <td>{account?.name}</td>
                  <td>{owner?.firstName} {owner?.lastName}</td>
                  <td>{format(new Date(caseItem.createdDate), 'MMM d, yyyy')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Case"
        fields={caseFields}
        onSubmit={handleCreateCase}
      />
    </div>
  );
};
